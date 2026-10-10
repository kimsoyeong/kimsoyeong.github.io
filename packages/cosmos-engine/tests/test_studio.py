import base64
import json
import os
import shutil
import sys
import tempfile
import threading
import time
import unittest
import urllib.error
import urllib.request
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from cosmos_engine import engine

REPO = Path(__file__).resolve().parents[3]


class StudioTest(unittest.TestCase):
    def setUp(self):
        from cosmos_engine.server import create_server
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        for path in ['cosmos/config.json', 'cosmos/schema.json', 'cosmos/policy.json', 'cosmos/legacy-enrichment.json', 'design/ontology-cosmos/ontology.sample.json']:
            dest = self.root / path
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(REPO / path, dest)
        (self.root / 'cosmos/inbox').mkdir(parents=True)
        p = engine.paths(self.root)
        policy = engine.load(p['policy'])
        policy['approvedHashes'] = {}
        p['policy'].write_text(engine.dumps(engine.approve_graph(engine.assemble(self.root), policy)))
        engine.update(self.root, extract=False)
        self.server = create_server(self.root, port=0)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.addCleanup(self.close_server)
        self.base = f'http://127.0.0.1:{self.server.server_address[1]}'

    def close_server(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=5)

    def request(self, path, payload=None, token=True, origin=None, host=None):
        headers = {}
        if token:
            headers['X-Cosmos-Token'] = self.server.token
        if origin:
            headers['Origin'] = origin
        if host:
            headers['Host'] = host
        data = None if payload is None else json.dumps(payload).encode()
        if data is not None:
            headers['Content-Type'] = 'application/json'
        request = urllib.request.Request(self.base + path, data=data, headers=headers)
        try:
            with urllib.request.urlopen(request, timeout=5) as response:
                raw = response.read()
                return response.status, json.loads(raw) if 'json' in response.headers.get('Content-Type', '') else raw.decode()
        except urllib.error.HTTPError as error:
            return error.code, error.read().decode()

    def wait_job(self):
        deadline = time.monotonic() + 15
        while time.monotonic() < deadline:
            _, state = self.request('/api/state')
            job = state.get('job')
            if job and job.get('status') in {'complete', 'completed', 'succeeded', 'done', 'error', 'failed'}:
                return job
            time.sleep(.05)
        self.fail('Studio job did not finish')

    def test_post_requires_token_and_local_origin_and_host(self):
        self.assertEqual(self.request('/api/update', {}, token=False)[0], 403)
        self.assertEqual(self.request('/api/update', {}, origin='https://attacker.example')[0], 403)
        self.assertEqual(self.request('/api/state', host='attacker.example')[0], 403)

    def test_upload_rejects_traversal(self):
        content = base64.b64encode(b'{}').decode()
        for name in ['../escape.json', '/tmp/escape.json', '..\\escape.json']:
            with self.subTest(name=name):
                self.assertIn(self.request('/api/upload', {'name': name, 'contentBase64': content})[0], {400, 403})
        self.assertFalse((self.root / 'cosmos/escape.json').exists())
        self.assertEqual(list((self.root / 'cosmos/inbox').iterdir()), [])

    def test_upload_edit_and_approve_job_without_llm(self):
        candidate_patch = {'sources': {'studio-source': {'label': 'Confirmed by user', 'observedAt': '2026-10-10', 'visibility': 'review'}}, 'nodes': [{'id': 'concept:studio-test', 'type': 'Concept', 'label': 'Before review', 'summary': 'New concept', 'evidenceIds': ['studio-source'], 'visibility': 'review'}], 'edges': []}
        content = base64.b64encode(engine.dumps(candidate_patch).encode()).decode()
        self.assertIn(self.request('/api/upload', {'name': 'project.json', 'contentBase64': content})[0], {200, 201})
        self.assertIn(self.request('/api/update', {'provider': 'none', 'extract': True})[0], {200, 202})
        job = self.wait_job()
        self.assertNotIn(job['status'], {'error', 'failed'}, job)
        _, state = self.request('/api/state')
        self.assertEqual(len(state['candidates']), 1)
        cid = state['candidates'][0]['id']
        candidate_patch['nodes'][0]['label'] = 'Reviewed concept'
        self.assertEqual(self.request('/api/candidate', {'id': cid, 'patch': candidate_patch})[0], 200)
        self.assertIn(self.request('/api/approve', {'id': cid})[0], {200, 202})
        job = self.wait_job()
        self.assertNotIn(job['status'], {'error', 'failed'}, job)
        _, state = self.request('/api/state')
        node = next(n for n in state['graph']['nodes'] if n['id'] == 'concept:studio-test')
        self.assertEqual(node['label'], 'Reviewed concept')
        self.assertEqual(state['candidates'], [])
        self.assertIn(self.request('/api/validate', {})[0], {200, 202})
        self.assertEqual(self.wait_job()['status'], 'complete')

    def test_upload_preserves_existing_source_and_rejects_invalid_base64(self):
        name = 'same-source.md'
        first = base64.b64encode(b'Original evidence').decode()
        self.assertEqual(self.request('/api/upload', {'name': name, 'contentBase64': first})[0], 200)
        self.assertEqual(self.request('/api/upload', {'name': name, 'contentBase64': base64.b64encode(b'Replaced').decode()})[0], 400)
        self.assertEqual((self.root / 'cosmos/inbox' / name).read_bytes(), b'Original evidence')
        self.assertEqual(self.request('/api/upload', {'name': 'invalid.md', 'contentBase64': 'invalid**'})[0], 400)
        self.assertFalse((self.root / 'cosmos/inbox/invalid.md').exists())

    def test_static_server_cannot_expose_repository_or_environment(self):
        secret = 'studio-secret-value-never-export'
        with patch.dict(os.environ, {'COSMOS_LLM_API_KEY': secret}):
            status, body = self.request('/')
            self.assertEqual(status, 200)
            self.assertNotIn(secret, body)
            status, state = self.request('/api/state')
            self.assertEqual(status, 200)
            self.assertNotIn(secret, json.dumps(state))
        for path in ['/cosmos/policy.json', '/.cosmos/report.json', '/../../cosmos/policy.json', '/packages/cosmos-engine/cosmos_engine/server.py']:
            self.assertIn(self.request(path)[0], {400, 403, 404})


if __name__ == '__main__':
    unittest.main()
