"""Network/API independent integrity checks for the daily report pipeline."""
import copy
from datetime import datetime, timezone
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import generate_report as report


class ReportTests(unittest.TestCase):
    def setUp(self):
        self.now = datetime(2026, 10, 27, 0, 0, tzinfo=timezone.utc)
        self.evidence = [{'source_id': 'S1', 'title': 'AI Agent release', 'url': 'https://example.org/1', 'published_at': self.now.isoformat()}, {'source_id': 'S2', 'title': 'LLM architecture', 'url': 'https://example.org/2', 'published_at': self.now.isoformat()}]
        self.bundle = {'collected_at': self.now.isoformat(), 'evidence': self.evidence, 'github_trending_snapshot': [], 'collection_warnings': []}
        self.result = {'trends': [{'headline': '에이전트 도구 변화', 'bullets': ['새 인터페이스 공개', '호출 절차 변경'], 'why_it_matters': '해석: 도구 연결 단순화', 'next_action': '공식 문서 확인', 'source_ids': [source_id], 'flow_steps': ['개념적 해석', '도구 선택', '결과 확인']} for source_id in ('S1', 'S2')]}

    def test_only_last_24_hours_with_real_timestamps(self):
        rss = b'''<rss><channel>
        <item><title>AI Agent new</title><link>https://example.org/new</link><pubDate>Mon, 26 Oct 2026 23:00:00 GMT</pubDate></item>
        <item><title>AI Agent old</title><link>https://example.org/old</link><pubDate>Sun, 25 Oct 2026 23:00:00 GMT</pubDate></item>
        <item><title>LLM future</title><link>https://example.org/future</link><pubDate>Tue, 27 Oct 2026 01:00:00 GMT</pubDate></item>
        <item><title>LLM no date</title><link>https://example.org/no-date</link></item>
        </channel></rss>'''
        rows = report.parse_feed(rss, 'test', self.now)
        self.assertEqual([row['url'] for row in rows], ['https://example.org/new'])

    def test_rejects_invented_sources_and_single_source(self):
        for ids in (['S999'], ['S1']):
            result = copy.deepcopy(self.result)
            result['trends'][1]['source_ids'] = ids
            with self.assertRaises(ValueError):
                report.validate_result(result, self.evidence)

    def test_rejects_model_links_and_raw_html(self):
        for bad in ('뉴스 https://invented.example', '<script>alert(1)</script>', '내용\n## injected'):
            result = copy.deepcopy(self.result)
            result['trends'][0]['bullets'][0] = bad
            with self.assertRaises(ValueError):
                report.validate_result(result, self.evidence)

    def test_subscription_cli_model_reasoning_and_structured_output(self):
        def run(command, **kwargs):
            if command[1:] == ['login', 'status']:
                return report.subprocess.CompletedProcess(command, 0, '', 'Logged in using ChatGPT')
            output = Path(command[command.index('--output-last-message') + 1])
            output.write_text(json.dumps(self.result))
            self.assertEqual(command[command.index('--model') + 1], 'gpt-6-luna')
            self.assertIn('model_reasoning_effort="low"', command)
            self.assertIn('--ignore-user-config', command)
            self.assertNotIn('OPENAI_API_KEY', kwargs['env'])
            self.assertNotIn('CODEX_API_KEY', kwargs['env'])
            self.assertEqual(kwargs['timeout'], 180)
            return report.subprocess.CompletedProcess(command, 0, '', '')
        with patch.object(report.shutil, 'which', return_value='/bin/codex'), patch.object(report.subprocess, 'run', side_effect=run):
            self.assertEqual(report.generate(self.bundle), self.result)

    def test_cli_failure_and_no_evidence_fail_closed(self):
        with patch.object(report.shutil, 'which', return_value='/bin/codex'), patch.object(report.subprocess, 'run', return_value=report.subprocess.CompletedProcess([], 1, '', 'login required')):
            with self.assertRaises(RuntimeError):
                report.generate(self.bundle)
        with patch.object(report.subprocess, 'run') as run:
            with self.assertRaises(ValueError):
                report.generate({'evidence': []})
            run.assert_not_called()

    def test_vertical_diagrams_sources_and_kst(self):
        report.validate_result(self.result, self.evidence)
        text = report.render(self.result, self.bundle, '2026-10-27')
        self.assertEqual(text.count('```mermaid\ngraph TD'), 2)
        self.assertIn('2026-10-27 09:00 KST', text)
        self.assertIn('https://example.org/1', text)
        self.assertIn('수집 시점 스냅샷', text)

    def test_write_once(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / '2026-10-27.md'
            report.write_report(path, 'first')
            with self.assertRaises(FileExistsError):
                report.write_report(path, 'second')
            self.assertEqual(path.read_text(), 'first')
            self.assertEqual(len(list(path.parent.iterdir())), 1)

    def test_trending_snapshot_repositories(self):
        parser = report.TrendingParser()
        parser.feed('<a href="/org/repo/stargazers">stars</a><a href="/org/repo/stargazers">stars</a>')
        self.assertEqual(parser.rows, ['org/repo'])


if __name__ == '__main__':
    unittest.main()
