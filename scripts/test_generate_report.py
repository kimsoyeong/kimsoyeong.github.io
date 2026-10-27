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

    def test_saved_api_key_login_is_refused(self):
        with patch.object(report.shutil, 'which', return_value='/bin/codex'), patch.object(report.subprocess, 'run', return_value=report.subprocess.CompletedProcess([], 0, '', 'Logged in using an API key')) as run:
            with self.assertRaisesRegex(RuntimeError, 'Subscription login required'):
                report.generate(self.bundle)
            self.assertEqual(run.call_count, 1)

    def test_inline_code_is_escaped(self):
        self.assertEqual(report.safe_text('도구 `Agent`'), r'도구 \`Agent\`')

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

    def test_history_reads_all_dates_and_bounds_semantic_context(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for day in range(1, 32):
                (root / f'2026-08-{day:02}.md').write_text(f'## 1. 사건 {day}\n[Event {day}](https://example.org/{day})\n')
            (root / '2026-10-27.md').write_text('[Today](https://example.org/today)')
            history = report.load_history(root, '2026-10-27')
            self.assertEqual(len(history['recent_reports']), 30)
            self.assertIn('https://example.org/1', history['urls'])
            self.assertNotIn('https://example.org/today', history['urls'])

    def test_history_excludes_canonical_urls_titles_and_repositories(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / '2026-10-26.md').write_text('## 1. 이전 사건\n'
                '[Agent launch - Publisher](https://news.google.com/rss/articles/ABC?oc=5)\n'
                '[Org/Repo](https://github.com/Org/Repo)\n')
            history = report.load_history(root, '2026-10-27')
            rows = [{'title': 'Other title', 'url': 'https://news.google.com/rss/articles/ABC?hl=ko&oc=6'},
                    {'title': 'AGENT launch - Another publisher', 'url': 'https://example.org/other'},
                    {'title': 'New LLM event', 'url': 'https://example.org/new'}]
            self.assertEqual(report.exclude_history(rows, history), [rows[2]])
            self.assertIn(report.canonical_url('https://github.com/org/repo/tree/main?ref=foo'), history['repositories'])

    def test_historical_source_rejected_before_model_and_after_output(self):
        history = {'urls': ['https://example.org/1'], 'titles': [], 'headlines': [], 'repositories': []}
        bundle = {**self.bundle, '_historical_exclusions': history}
        with patch.object(report.subprocess, 'run') as run:
            with self.assertRaisesRegex(ValueError, 'before model'):
                report.generate(bundle)
            run.assert_not_called()
        with self.assertRaisesRegex(ValueError, 'Previously reported source'):
            report.validate_result(self.result, self.evidence, history)
        history['urls'] = []
        history['headlines'] = [report.normalize_title(self.result['trends'][0]['headline'])]
        with self.assertRaisesRegex(ValueError, 'headline repeated'):
            report.validate_result(self.result, self.evidence, history)

    def test_render_excludes_prior_github_even_if_bundle_contains_it(self):
        bundle = {**self.bundle, 'github_trending_snapshot': [{'repository': 'Org/Repo', 'url': 'https://github.com/Org/Repo'}],
                  '_historical_exclusions': {'repositories': ['https://github.com/org/repo']}}
        text = report.render(self.result, bundle, '2026-10-27')
        self.assertNotIn('https://github.com/Org/Repo', text)
        self.assertIn('오늘 새롭게 소개할 미소개 저장소가 없다.', text)

    def test_existing_day_skips_network_and_model(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            day = datetime.now(timezone.utc).astimezone(report.KST).date().isoformat()
            target = root / 'public' / 'daily-reports' / f'{day}.md'
            target.parent.mkdir(parents=True)
            target.write_text('immutable')
            with patch.object(report, 'ROOT', root), patch('sys.argv', ['generate_report.py']), patch.object(report, 'collect') as collect, patch.object(report, 'generate') as generate:
                self.assertEqual(report.main(), 0)
                collect.assert_not_called()
                generate.assert_not_called()
            self.assertEqual(target.read_text(), 'immutable')

    def test_insufficient_new_evidence_publishes_honest_daily_status(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            bundle = {**self.bundle, 'evidence': [], 'successful_feeds': 2}
            with patch.object(report, 'ROOT', root), patch('sys.argv', ['generate_report.py']), patch.object(report, 'collect', return_value=bundle), patch.object(report, 'generate') as generate:
                self.assertEqual(report.main(), 0)
                generate.assert_not_called()
            files = list((root / 'public' / 'daily-reports').glob('*.md'))
            self.assertEqual(len(files), 1)
            content = files[0].read_text()
            self.assertIn('새롭게 확인된 동향이 2개 미만', content)
            self.assertNotIn('```mermaid', content)

    def test_total_feed_failure_does_not_publish_no_news_status(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            bundle = {**self.bundle, 'evidence': [], 'successful_feeds': 0}
            with patch.object(report, 'ROOT', root), patch('sys.argv', ['generate_report.py']), patch.object(report, 'collect', return_value=bundle):
                with self.assertRaisesRegex(RuntimeError, 'All news feeds failed'):
                    report.main()
            self.assertFalse((root / 'public' / 'daily-reports').exists())

    def test_semantic_dedup_empty_result_renders_status(self):
        text = report.render({'trends': []}, self.bundle, '2026-10-27')
        self.assertIn('새롭게 확인된 동향이 2개 미만', text)
        self.assertNotIn('```mermaid', text)
        self.assertNotIn('https://example.org/1', text)

    def test_trending_snapshot_repositories(self):
        parser = report.TrendingParser()
        parser.feed('<a href="/org/repo/stargazers">stars</a><a href="/org/repo/stargazers">stars</a>')
        self.assertEqual(parser.rows, ['org/repo'])


if __name__ == '__main__':
    unittest.main()
