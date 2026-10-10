import io
import json
import os
import tempfile
import unittest
import zipfile
from pathlib import Path
from unittest.mock import patch
from cosmos_engine.ingest import ingest_file, document_text, openai_extract, public_https, validate_extraction, codex_extract


class IngestTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)

    def file(self, name, text):
        path = self.root / name
        path.write_text(text)
        return path

    def test_json_patch_keeps_explicit_operations(self):
        data = {'nodes': [{'id': 'project:new'}], 'removeNodes': ['old'], 'expectedHashes': {'old': 'hash'}}
        result = ingest_file(self.file('facts.json', json.dumps(data)), {}, {})
        self.assertEqual(result['nodes'], data['nodes'])
        self.assertEqual(result['expectedHashes'], data['expectedHashes'])

    def test_plain_text_without_provider_questions_not_facts(self):
        result = ingest_file(self.file('notes.md', 'I built this'), {}, {})
        self.assertEqual(result['nodes'], [])
        self.assertEqual(result['questions'][0]['status'], 'needs-provider')

    def test_html_excludes_scripts(self):
        self.assertEqual(document_text(self.file('page.html', '<p>Fact</p><script>evil()</script>')).strip(), 'Fact')

    def test_zip_adapters(self):
        for name, part in [('x.docx', 'word/document.xml'), ('x.pptx', 'ppt/slides/slide1.xml')]:
            path = self.root / name
            with zipfile.ZipFile(path, 'w') as z:
                z.writestr(part, '<r xmlns:a="urn:test"><a:t>Facts</a:t></r>')
            self.assertEqual(document_text(path), 'Facts')

    def test_audio_needs_matching_transcript(self):
        path = self.file('talk.mp4', 'binary')
        self.assertTrue(ingest_file(path, {}, {})['questions'])
        self.file('talk.vtt', 'WEBVTT\n00:00.000 --> 00:01.000\nEvidence')
        self.assertIn('Evidence', document_text(path))

    def test_no_pdf_dependency_is_explicit(self):
        path = self.file('scan.pdf', 'fake')
        with patch('cosmos_engine.ingest.shutil.which', return_value=None), patch.dict('sys.modules', {'pypdf': None}):
            self.assertTrue(ingest_file(path, {}, {})['questions'])

    def test_unsafe_urls(self):
        for url in ('file:///etc/passwd', 'http://example.com', 'https://user:pass@example.com'):
            with self.assertRaises(ValueError): public_https(url)
        with patch('cosmos_engine.ingest.socket.getaddrinfo', return_value=[(2, 1, 6, '', ('127.0.0.1', 443))]):
            with self.assertRaises(ValueError): public_https('https://example.com')

    def test_redirect_private_destination_rejected(self):
        from cosmos_engine.ingest import fetch_url
        from unittest.mock import MagicMock
        connection = MagicMock()
        response = connection.getresponse.return_value
        response.status = 302
        response.getheader.return_value = 'https://127.0.0.1/private'
        with patch('cosmos_engine.ingest.socket.getaddrinfo', side_effect=[[(2, 1, 6, '', ('8.8.8.8', 443))], [(2, 1, 6, '', ('127.0.0.1', 443))]]), patch('cosmos_engine.ingest.PinnedHTTPSConnection', return_value=connection):
            with self.assertRaises(ValueError): fetch_url('https://example.com')
        connection.close.assert_called_once()

    def test_image_facts_need_confirmation(self):
        candidate = {'nodes': [{'id': 'project:new'}], 'provenance': [{'recordId': 'project:new', 'sourceId': 'input:1', 'locator': 'vision', 'quote': 'A visible diagram'}]}
        result = validate_extraction(candidate, '', 'input:1', image=True)
        self.assertEqual(result['questions'][0]['status'], 'needs-confirmation')

    def test_grounding_and_forced_review(self):
        candidate = {'nodes': [{'id': 'project:new', 'visibility': 'public'}], 'provenance': [{'recordId': 'project:new', 'sourceId': 'input:1', 'locator': 'line:1', 'quote': 'Built it'}]}
        result = validate_extraction(candidate, 'Built it', 'input:1')
        self.assertEqual(result['nodes'][0]['visibility'], 'review')
        self.assertEqual(result['nodes'][0]['evidenceIds'], ['input:1'])
        with self.assertRaises(ValueError): validate_extraction(candidate, 'different', 'input:1')
        with self.assertRaises(ValueError): validate_extraction({'removeNodes': ['x']}, '', 'input:1')
        with self.assertRaises(ValueError): validate_extraction([], '', 'input:1')

    def test_provider_existing_record_update_rejected(self):
        path = self.file('notes.md', 'Built it')
        def fake(prompt, image):
            source = prompt.split('SOURCE_ID=')[1].split('\n')[0]
            return {'nodes': [{'id': 'project:old'}], 'provenance': [{'recordId': 'project:old', 'sourceId': source, 'locator': 'line:1', 'quote': 'Built it'}]}
        with patch('cosmos_engine.ingest.openai_extract', side_effect=fake):
            with self.assertRaises(ValueError): ingest_file(path, {'nodes': [{'id': 'project:old'}]}, {}, 'openai')

    def test_provider_extraction_stable_source(self):
        path = self.file('notes.md', 'Built it')
        def fake(prompt, image):
            source = prompt.split('SOURCE_ID=')[1].split('\n')[0]
            return {'nodes': [{'id': 'project:new'}], 'provenance': [{'recordId': 'project:new', 'sourceId': source, 'locator': 'line:1', 'quote': 'Built it'}]}
        with patch('cosmos_engine.ingest.openai_extract', side_effect=fake):
            self.assertEqual(ingest_file(path, {}, {}, 'openai'), ingest_file(path, {}, {}, 'openai'))

    def test_openai_http_and_error_redaction(self):
        response = io.BytesIO(json.dumps({'choices': [{'message': {'content': '{"nodes":[]}'}}]}).encode())
        with patch.dict(os.environ, {'COSMOS_LLM_API_KEY': 'secret-key', 'COSMOS_LLM_MODEL': 'test-model'}), patch('cosmos_engine.ingest.urllib.request.OpenerDirector.open', return_value=response) as call:
            self.assertEqual(openai_extract('input'), {'nodes': []})
            self.assertIn('/chat/completions', call.call_args.args[0].full_url)
        with patch.dict(os.environ, {'COSMOS_LLM_API_KEY': 'secret-key', 'COSMOS_LLM_MODEL': 'test-model'}), patch('cosmos_engine.ingest.urllib.request.OpenerDirector.open', side_effect=OSError('secret-key')):
            with self.assertRaises(ValueError) as error: openai_extract('input')
            self.assertNotIn('secret-key', str(error.exception))

    def test_codex_sanitized_error_category(self):
        result = type('R', (), {'returncode': 1, 'stderr': '{"error":{"code":"model-unavailable"}}'})()
        with patch('cosmos_engine.ingest.subprocess.run', return_value=result):
            with self.assertRaisesRegex(ValueError, 'model-unavailable'): codex_extract('prompt')

    def test_codex_subprocess_errors_redacted(self):
        with patch('cosmos_engine.ingest.subprocess.run', return_value=type('R', (), {'returncode': 0, 'stdout': '{"nodes":[]}'})()):
            self.assertEqual(codex_extract('prompt'), {'nodes': []})
        with patch('cosmos_engine.ingest.subprocess.run', return_value=type('R', (), {'returncode': 1, 'stderr': 'secret'})()):
            with self.assertRaises(ValueError) as error: codex_extract('prompt')
            self.assertNotIn('secret', str(error.exception))


if __name__ == '__main__': unittest.main()
