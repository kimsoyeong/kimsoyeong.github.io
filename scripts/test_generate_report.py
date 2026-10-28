"""Network/API independent integrity checks for the daily report pipeline."""
import copy
from datetime import datetime, timezone
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import MagicMock, patch

import generate_report as report


class ReportTests(unittest.TestCase):
    def setUp(self):
        self.now = datetime(2026, 10, 27, 0, 0, tzinfo=timezone.utc)
        self.evidence = [{'source_id': 'S1', 'title': 'AI Agent release', 'url': 'https://example.org/1', 'published_at': self.now.isoformat()}, {'source_id': 'S2', 'title': 'LLM architecture', 'url': 'https://example.org/2', 'published_at': self.now.isoformat()}]
        self.bundle = {'collected_at': self.now.isoformat(), 'evidence': self.evidence, 'github_trending_snapshot': [], 'collection_warnings': []}
        self.result = {'title': '에이전트 도구 연결과 모델 구조의 변화', 'summary': ['에이전트 도구 연결 절차가 바뀐다.', '구조 변경은 권한 검증에 영향을 준다.', '새 인터페이스를 직접 재현해 검증한다.'], 'trends': [{'headline': '에이전트 도구 변화', 'bullets': ['새 인터페이스 공개', '호출 절차 변경'], 'why_it_matters': '해석: 도구 연결 단순화', 'next_action': '공식 문서 확인', 'caveat': '독립 재현 결과는 아직 미확인', 'source_ids': [source_id], 'flow_steps': ['개념적 해석', '도구 선택', '결과 확인']} for source_id in ('S1', 'S2')]}

    def test_concrete_summary_rejects_empty_direction_and_limit_claim(self):
        result = copy.deepcopy(self.result)
        result['summary'][2] = '월드 모델이 실시간 상호작용을 다루는 연구 방향과 현재 한계를 함께 보여준다.'
        with self.assertRaisesRegex(ValueError, 'concrete result'):
            report.validate_summary(result)
        result['summary'][2] = 'Genie 4는 음성과 3D 장면을 생성하지만 긴 세션에서는 물체의 외형이 유지되지 않는다.'
        report.validate_summary(result)
        report.validate_summary({'summary': ['새롭게 확인된 핵심 동향이 2개 미만이다.', '이전 기사는 재사용하지 않았다.', '미확인 내용은 제외했다.']})

    def explainer_fixture(self):
        return {'title': '모델 결과를 어떻게 해석할까',
                'metrics': [{'label': '실험 대상', 'value': '6개 모델', 'detail': '동일한 아이디어 쌍으로 평가'}],
                'comparisons': [{'label': '평가 질문', 'before': '질문 표현 A', 'after': '질문 표현 B', 'detail': '다른 조건은 고정'}],
                'findings': [{'label': '판정 민감도', 'status': 'reported', 'evidence': '논문은 질문 변화에 따른 차이를 보고했다.'}],
                'chart': {'title': '동일 실험의 정확도', 'unit': '%', 'note': '같은 모델과 평가 집합, 질문 표현만 다르다.', 'rows': [{'label': '질문 A', 'value': 93.5}, {'label': '질문 B', 'value': 40.9}]},
                'conclusion': '이 실험에서는 질문 표현의 영향이 확인됐다. 다른 과제의 성능은 별도 검증이 필요하다.',
                'source_ids': ['S1']}

    def test_explainer_resolves_only_cited_sources_and_keeps_original_figures(self):
        result = copy.deepcopy(self.result)
        result['trends'][0]['explainer'] = self.explainer_fixture()
        evidence = copy.deepcopy(self.evidence)
        evidence[0]['visual_assets'] = [{'asset_id': 'S1I1', 'source_id': 'S1', 'url': 'https://cdn.example.org/chart.png', 'alt': 'Original benchmark chart', 'caption': 'Original conditions', 'source_url': evidence[0]['url']}]
        result['trends'][0]['visual_asset_ids'] = ['S1I1']
        report.validate_result(result, evidence)
        output = report.render(result, {**self.bundle, 'evidence': evidence}, '2026-10-27')
        panel = json.loads(output.split('```report-panel\n')[1].split('\n```')[0])
        self.assertNotIn('source_ids', panel)
        self.assertEqual(panel['sources'], [{'title': self.evidence[0]['title'], 'url': self.evidence[0]['url']}])
        self.assertEqual(panel['chart']['rows'][0]['value'], 93.5)
        self.assertIn('![Original benchmark chart](https://cdn.example.org/chart.png)', output)
        self.assertIn('```mermaid', output)
        schema = report.report_schema()['properties']['trends']['items']
        self.assertIn('explainer', schema['required'])
        report.validate_explainer(None, ['S1'])

    def test_explainer_rejects_invented_sources_unsafe_text_and_misleading_chart_data(self):
        for edit in [lambda p: p.update(source_ids=['S2']),
                     lambda p: p['metrics'][0].update(detail='<script>bad</script>'),
                     lambda p: p.update(conclusion='참고 https://invented.example'),
                     lambda p: p['findings'][0].update(status='proven'),
                     lambda p: p['chart'].update(note=''),
                     lambda p: p['chart'].update(rows=[{'label': '유일한 조건', 'value': 1}]),
                     lambda p: p['chart']['rows'][0].update(value=float('nan')),
                     lambda p: p['chart']['rows'][0].update(value=float('inf')),
                     lambda p: p['chart']['rows'][0].update(value=-1),
                     lambda p: p['chart']['rows'][0].update(value=True),
                     lambda p: p.update(metrics=p['metrics'] * 4),
                     lambda p: p['metrics'][0].update(detail='내부 번호 (S1)'),
                     lambda p: p.update(metrics=[], comparisons=[], findings=[], chart=None)]:
            with self.subTest(edit=edit):
                panel = self.explainer_fixture()
                edit(panel)
                with self.assertRaises(ValueError):
                    report.validate_explainer(panel, ['S1'])

    def test_original_article_figures_are_bounded_and_not_decorations(self):
        parser = report.ArticleParser()
        parser.feed('<img src="https://cdn.example.org/outside.png" alt="Architecture diagram outside article">'
                    '<main><img src="/empty.png" alt><img src="/logo.png" alt="Company logo architecture diagram">'
                    '<img src="https://cdn.example.org/pixel.png" width="1" alt="Architecture diagram tracker">'
                    '<img src="/hero.png" alt="Product launch announcement">'
                    '<figure><img src="/architecture.png" alt="Tool execution architecture">'
                    '<figcaption>Figure 1: Tool execution and result validation.</figcaption></figure>'
                    '<img src="http://cdn.example.org/insecure.png" alt="Model architecture diagram">'
                    '<img src="https://127.0.0.1/graph.png" alt="Architecture graph diagram"></main>')
        assets = report.article_visual_assets(parser, 'https://www.anthropic.com/news/model')
        self.assertEqual(len(assets), 1)
        self.assertEqual(assets[0]['url'], 'https://www.anthropic.com/architecture.png')
        self.assertIn('result validation', assets[0]['caption'])
        self.assertIsNone(report.safe_image_url('javascript:alert(1)'))
        self.assertIsNone(report.safe_image_url('https://user:secret@example.org/a.png'))

    def test_collection_diagnostics_are_not_published_as_a_report_section(self):
        bundle = copy.deepcopy(self.bundle)
        bundle['collection_warnings'] = ['Publisher: internal fetch error']
        rendered = report.render(self.result, bundle, '2026-10-28')
        self.assertNotIn('## 수집 상태', rendered)
        self.assertNotIn('internal fetch error', rendered)
        self.assertEqual(bundle['collection_warnings'], ['Publisher: internal fetch error'])

    def test_selected_source_images_require_real_asset_and_cited_source(self):
        evidence = copy.deepcopy(self.evidence)
        evidence[0]['visual_assets'] = [{'asset_id': 'S1I1', 'source_id': 'S1', 'url': 'https://cdn.example.org/graph.png',
                                         'alt': 'Model benchmark chart', 'caption': 'Published benchmark comparison',
                                         'source_url': evidence[0]['url']}]
        result = copy.deepcopy(self.result)
        result['trends'][0]['visual_asset_ids'] = ['S1I1']
        report.validate_result(result, evidence)
        text = report.render(result, {**self.bundle, 'evidence': evidence}, '2026-10-27')
        self.assertIn('![Model benchmark chart](https://cdn.example.org/graph.png)', text)
        self.assertIn('Published benchmark comparison / [출처 원문](https://example.org/1)', text)
        for ids in (['invented'], ['S1I1', 'S1I1']):
            result['trends'][0]['visual_asset_ids'] = ids
            with self.assertRaises(ValueError):
                report.validate_result(result, evidence)
        result['trends'][0]['visual_asset_ids'] = []
        result['trends'][1]['visual_asset_ids'] = ['S1I1']
        with self.assertRaisesRegex(ValueError, 'uncited'):
            report.validate_result(result, evidence)

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
        self.assertIn('오늘 살펴볼 인기 오픈소스', text)

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

    def test_atom_feed_uses_publication_not_modification_date(self):
        data = b'''<feed xmlns="http://www.w3.org/2005/Atom">
          <entry><title>LLM inference update</title><published>2026-10-26T23:00:00Z</published>
          <link href="https://developer.nvidia.com/blog/new"/><summary>AI model tooling</summary></entry>
          <entry><title>AI old article</title><published>2026-10-20T23:00:00Z</published><updated>2026-10-26T23:00:00Z</updated><link href="https://developer.nvidia.com/blog/old"/></entry>
          <entry><title>AI undated article</title><updated>2026-10-26T23:00:00Z</updated><link href="https://developer.nvidia.com/blog/undated"/></entry>
        </feed>'''
        audit = {}
        rows = report.parse_feed(data, 'NVIDIA Developer', self.now, audit)
        self.assertEqual(len(rows), 1)
        self.assertTrue(rows[0]['official'])
        self.assertEqual(audit['no_reliable_timestamp'], 1)

    def official_html(self, published='2026-10-26T23:00:00Z'):
        return ('<html><head><script type="application/ld+json">' + json.dumps({
            '@type': 'NewsArticle', 'headline': 'Claude agent model update', 'datePublished': published,
            'description': 'New tool calling architecture'}) + '</script></head><body><nav>IGNORE MENU</nav>'
            '<main><h1>Claude agent model update</h1><p>' + 'The model supports structured tool outputs. ' * 12 +
            '</p><script>IGNORE EXECUTABLE SCRIPT</script></main></body></html>').encode()

    def test_official_jsonld_timestamp_and_visible_body(self):
        row, reason = report.parse_official_article(self.official_html(), 'https://www.anthropic.com/news/new-model', 'Anthropic News', self.now)
        self.assertEqual(reason, 'eligible')
        self.assertEqual(row['evidence_type'], 'official_full_text')
        self.assertEqual(row['publication_timestamp_basis'], 'article_metadata')
        self.assertIn('structured tool outputs', row['excerpt'])
        self.assertNotIn('IGNORE', row['excerpt'])
        self.assertLessEqual(len(row['excerpt']), 4000)

    def test_date_only_and_old_modified_articles_are_excluded(self):
        for published, expected in [('2026-10-26', 'no_reliable_timestamp'), ('2026-10-20T23:00:00Z', 'outside_24h')]:
            row, reason = report.parse_official_article(self.official_html(published), 'https://www.anthropic.com/news/new-model', 'Anthropic News', self.now)
            self.assertIsNone(row)
            self.assertEqual(reason, expected)
        self.assertIsNone(report.parse_timestamp('2026-10-26T23:00:00'))

    def test_official_index_links_bound_and_crosshost_rejected(self):
        html = b'''<a href="/research/team/alignment">Team</a><a href="/news/features">Category</a>
        <a href="https://evil.example/news/model">External</a><a href="/news/new-model">Model</a>
        <a href="/research/context">Context</a>'''
        urls = report.index_article_urls(html, 'https://www.anthropic.com/news')
        self.assertEqual(urls, ['https://www.anthropic.com/news/new-model', 'https://www.anthropic.com/research/context'])
        row, reason = report.parse_official_article(self.official_html(), 'https://evil.example/new-model', 'Anthropic News', self.now)
        self.assertIsNone(row)
        self.assertEqual(reason, 'outside_publisher_allowlist')

    def test_official_index_audits_missing_time_and_request_failure(self):
        index = b'<a href="/news/no-time">One</a><a href="/news/fails">Two</a>'
        with patch.object(report, 'fetch', side_effect=[index, self.official_html('2026-10-26'), RuntimeError('HTTP 403')]):
            rows, audit = report.collect_official_index('Anthropic News', 'https://www.anthropic.com/news', self.now)
        self.assertEqual(rows, [])
        self.assertEqual(audit['status'], 'partial_failure')
        self.assertEqual(audit['no_reliable_timestamp'], 1)
        self.assertEqual(audit['article_failures'], 1)
        self.assertEqual(audit['items_checked'], 2)

    def test_official_agent_updates_rank_above_generic_finance(self):
        official = {'title': 'Claude new model and agent tools', 'excerpt': 'Model architecture', 'official': True}
        finance = {'title': 'AI enterprise payment MOU', 'excerpt': 'AI agents', 'official': False}
        infrastructure = {'title': 'Memory sharing in GPU clusters', 'excerpt': 'AI models', 'official': True, 'evidence_type': 'official_full_text'}
        self.assertGreater(report.evidence_priority(official), report.evidence_priority(finance))
        self.assertGreater(report.evidence_priority(official), report.evidence_priority(infrastructure))

    def test_summary_title_blockquote_metadata_caveat_and_source_ids(self):
        bundle = {**self.bundle, 'source_audit': [{'source': 'Anthropic News', 'status': 'no_recent_matching_items', 'items_checked': 4, 'eligible_items': 0, 'selected_items': 0}, {'source': 'OpenAI News', 'status': 'partial_failure', 'items_checked': 10, 'eligible_items': 2, 'selected_items': 2}]}
        text = report.render(self.result, bundle, '2026-10-27')
        self.assertTrue(text.startswith('# 에이전트 도구 연결과 모델 구조의 변화'))
        self.assertIn('> 수집:', text)
        self.assertNotIn('# Daily Report /', text)
        self.assertIn('**한계:**', text)
        self.assertIn('[AI Agent release](https://example.org/1)', text)
        self.assertNotIn('[S1]', text)
        self.assertIn('/ RSS 요약', text)
        self.assertNotIn('rss_excerpt', text)
        self.assertIn('일부 요청 실패', text)
        self.assertIn('확인 범위에 지난 24시간 관련 글 없음', text)

    def test_reader_text_rejects_internal_citations_without_breaking_product_names(self):
        for marker in ('(S3)', '(S6, S14)', '[S1]'):
            with self.subTest(marker=marker):
                result = copy.deepcopy(self.result)
                result['trends'][0]['bullets'][0] = f'업무협약을 맺었다. {marker}'
                with self.assertRaisesRegex(ValueError, 'Internal source IDs'):
                    report.validate_result(result, self.evidence)
        result = copy.deepcopy(self.result)
        result['summary'][0] = '계정 접근 절차가 바뀐다. (S1)'
        with self.assertRaisesRegex(ValueError, 'Internal source IDs'):
            report.validate_result(result, self.evidence)
        result = copy.deepcopy(self.result)
        result['trends'][0]['bullets'][0] = 'Amazon S3 저장소의 접근 권한이 변경됐다.'
        report.validate_result(result, self.evidence)

    def test_summary_requires_exactly_three_safe_lines(self):
        for summary in ([], ['one', 'two'], ['one', 'two', 'three', 'four'], ['one', 'two', '<script>bad</script>']):
            with self.assertRaises(ValueError):
                report.validate_summary({'summary': summary})
        text = report.render(self.result, self.bundle, '2026-10-27')
        self.assertIn('> **오늘의 3줄 요약**', text)
        self.assertEqual(len([line for line in text.splitlines() if line.startswith('> - ')]), 3)
        self.assertNotIn('> 범위:', text)
        self.assertNotIn('> 근거:', text)

    def test_github_purpose_comes_from_public_metadata(self):
        metadata = {'description': 'Framework for AI agents', 'topics': ['ai-agent', 'llm'], 'language': 'Python'}
        with patch.object(report, 'fetch', return_value=json.dumps(metadata).encode()) as fetch:
            repository = report.fetch_repository_metadata('org/agents')
        self.assertEqual(fetch.call_args.args[0], 'https://api.github.com/repos/org/agents')
        self.assertEqual(repository['description'], metadata['description'])
        bundle = {**self.bundle, 'github_trending_snapshot': [repository]}
        text = report.render(self.result, bundle, '2026-10-27')
        self.assertIn('원문 설명: Framework for AI agents', text)
        self.assertIn('한국어 요약: 한국어 요약이 아직 생성되지 않았다.', text)
        self.assertIn('주제 ai-agent, llm / 주 언어 Python', text)
        self.assertIn('신규 출시를 뜻하지 않는다.', text)

    def test_github_metadata_failure_is_explicit_not_invented(self):
        with patch.object(report, 'fetch', side_effect=RuntimeError('HTTP 403')):
            repository = report.fetch_repository_metadata('org/agents')
        self.assertEqual(repository['metadata_status'], 'failed')
        self.assertEqual(repository['description'], '')
        text = report.render(self.result, {**self.bundle, 'github_trending_snapshot': [repository]}, '2026-10-27')
        self.assertIn('저장소 메타데이터 수집 실패', text)

    def test_repository_korean_summary_keeps_original_and_validates_real_identity(self):
        repository = {'repository': 'Org/Agent', 'url': 'https://github.com/Org/Agent', 'description': 'Framework for AI agents', 'metadata_status': 'success'}
        result = {**self.result, 'repository_summaries': [{'repository': 'org/agent', 'summary_ko': 'AI 에이전트를 만드는 프레임워크.'}]}
        report.validate_repository_summaries(result, [repository])
        text = report.render(result, {**self.bundle, 'github_trending_snapshot': [repository]}, '2026-10-27')
        self.assertIn('원문 설명: Framework for AI agents', text)
        self.assertIn('한국어 요약: AI 에이전트를 만드는 프레임워크.', text)
        for entries in [
            [{'repository': 'Unknown/Repo', 'summary_ko': '알 수 없는 저장소.'}],
            result['repository_summaries'] * 2,
            [{'repository': 'org/agent', 'summary_ko': 'Agent framework.'}],
            [{'repository': 'org/agent', 'summary_ko': '설명 <script>오류</script>'}],
            [{'repository': 'org/agent', 'summary_ko': '설명 https://example.org'}],
            [],
        ]:
            with self.assertRaises(ValueError):
                report.validate_repository_summaries({'repository_summaries': entries}, [repository])
        self.assertEqual(report.validate_repository_summaries(self.result, [repository]), {})

    def test_missing_repository_description_cannot_be_guessed_in_korean(self):
        repository = {'repository': 'org/repo', 'url': 'https://github.com/org/repo', 'description': '', 'metadata_status': 'success'}
        result = {**self.result, 'repository_summaries': [{'repository': 'org/repo', 'summary_ko': '원문 설명이 없어 용도를 확인할 수 없다.'}]}
        text = report.render(result, {**self.bundle, 'github_trending_snapshot': [repository]}, '2026-10-27')
        self.assertIn('원문 설명: 저장소에 공개된 설명 없음', text)
        self.assertIn('한국어 요약: 원문 설명이 없어 용도를 확인할 수 없다.', text)
        result['repository_summaries'][0]['summary_ko'] = '강력한 AI 자동화 도구.'
        with self.assertRaisesRegex(ValueError, 'missing description'):
            report.validate_repository_summaries(result, [repository])

    def test_gzip_feed_and_official_redirect_guard(self):
        response = MagicMock()
        response.__enter__.return_value = response
        response.read.return_value = report.gzip.compress(b'<rss><channel/></rss>')
        response.geturl.return_value = 'https://deepmind.google/blog/rss.xml'
        with patch.object(report, 'urlopen', return_value=response):
            self.assertEqual(report.fetch('https://deepmind.google/blog/rss.xml', official=True), b'<rss><channel/></rss>')
        response.geturl.return_value = 'https://evil.example/feed'
        with patch.object(report, 'urlopen', return_value=response):
            with self.assertRaisesRegex(ValueError, 'outside the publisher'):
                report.fetch('https://deepmind.google/blog/rss.xml', official=True)

    def test_cross_industry_topics_are_optional_relevant_candidates(self):
        cases = [
            ('Anthropic redesigns version control for coding agents', 'developer_infrastructure'),
            ('New LLM quantization benchmark compares inference serving', 'model_research_evaluation'),
            ('에이전트 시대의 코드 리뷰와 개발 인프라', 'developer_infrastructure'),
            ('개인 에이전트가 소비 시장과 가격에 미치는 영향', 'agent_market_structure'),
            ('인공지능 역전파 대안과 사전 학습 최적화', 'training_optimization'),
            ('반도체 기업 합병 검토 발표', 'corporate_moves'),
            ('우주 데이터센터 반도체 공급 계약', 'compute_infrastructure'),
            ('오픈소스 라이브러리 취약점 패치', 'software_security'),
            ('Zeroth-order optimization enables transformer pretraining without backpropagation', 'training_optimization'),
            ('Personal AI agents change consumer pricing and platform competition', 'agent_market_structure'),
            ('SpaceX and Tesla consider merger proposal', 'corporate_moves'),
            ('A humanoid robot starts an autonomous driving pilot', 'robotics_autonomy'),
            ('New semiconductor chips for orbital data centers', 'compute_infrastructure'),
            ('AI discovers a PHP vulnerability CVE-2026-12345', 'software_security'),
        ]
        for title, topic in cases:
            self.assertTrue(report.relevant(title, ''))
            self.assertIn(topic, report.topic_tags(title))
        self.assertFalse(report.relevant('Football club acquires a striker', 'sports transfer'))
        self.assertFalse(report.relevant('Training speedrun improves marathon runners', 'fitness'))
        self.assertNotIn('agent_market_structure', report.topic_tags('Travel agents plan holidays', 'platform market background'))
        self.assertIn('초기 구현 대비 개선을 역전파 대비 우위로 바꾸거나', report.SYSTEM_PROMPT)
        self.assertIn('저자의 주장/전망임을 표시', report.SYSTEM_PROMPT)
        self.assertIn('Google News / Training algorithms and efficiency', report.FEEDS)
        self.assertIn('Google News / Personal agents and market structure', report.FEEDS)
        self.assertNotIn('corporate_moves', report.topic_tags('A sleep framework for LLMs', 'Google AI research studies knowledge acquisition.'))
        self.assertNotIn('robotics_autonomy', report.topic_tags('A new world simulation model', 'Background use cases include robotics.'))
        self.assertIn('예시는 관심 범위일 뿐 사실이나 오늘의 뉴스라는 뜻이 아니다', report.SYSTEM_PROMPT)

    def test_vulnerability_report_does_not_claim_vendor_advisory_verified(self):
        row = report.evidence_context({'title': 'AI finds PHP vulnerability CVE-2026-12345', 'excerpt': 'A researcher reports a flaw.', 'url': 'https://news.google.com/rss/articles/example'})
        self.assertFalse(row['advisory_source_verified'])
        self.assertIn('software_security', row['topic_tags'])
        advisory = report.evidence_context({**row, 'url': 'https://www.php.net/security/notice'})
        self.assertTrue(advisory['advisory_source_verified'])
        proposal = report.evidence_context({'title': 'SpaceX proposes Tesla merger', 'excerpt': 'Talks only.', 'url': 'https://example.org/news'})
        self.assertIn('do not assume completion', proposal['transaction_verification'])

    def test_candidate_budget_keeps_cross_industry_when_official_ai_is_abundant(self):
        rows = []
        for index in range(40):
            rows.append({'title': f'Claude agent model {index}', 'excerpt': 'AI tools', 'url': f'https://example.org/ai/{index}', 'publisher_feed': f'official-{index // 3}', 'published_at': self.now.isoformat(), 'official': True, 'topic_tags': ['ai_models_agents']})
        for index, topic in enumerate(report.CROSS_INDUSTRY_TOPICS):
            rows.append({'title': f'Fresh industry event {index}', 'excerpt': 'Verified news', 'url': f'https://example.org/industry/{index}', 'publisher_feed': f'industry-{index}', 'published_at': self.now.isoformat(), 'official': False, 'topic_tags': [topic]})
        selected = report.select_candidates(rows)
        self.assertEqual(len(selected), 24)
        self.assertTrue(set(report.CROSS_INDUSTRY_TOPICS).issubset({tag for row in selected for tag in row['topic_tags']}))
        self.assertGreaterEqual(sum(row['official'] for row in selected), 24 - len(report.CROSS_INDUSTRY_TOPICS))
        self.assertLessEqual(max(sum(row['publisher_feed'] == source for row in selected) for source in {row['publisher_feed'] for row in selected}), 3)

    def test_business_event_can_omit_a_diagram_without_invented_steps(self):
        result = copy.deepcopy(self.result)
        for trend in result['trends']:
            trend['flow_steps'] = []
        report.validate_result(result, self.evidence)
        text = report.render(result, self.bundle, '2026-10-27')
        self.assertNotIn('```mermaid', text)
        self.assertIn('**기술/산업 영향:**', text)
        self.assertEqual(report.report_schema()['properties']['trends']['maxItems'], 3)
        result['trends'][0]['flow_steps'] = ['unsupported', 'two nodes']
        with self.assertRaises(ValueError):
            report.validate_result(result, self.evidence)

    def test_trending_snapshot_repositories(self):
        parser = report.TrendingParser()
        parser.feed('<a href="/org/repo/stargazers">stars</a><a href="/org/repo/stargazers">stars</a>')
        self.assertEqual(parser.rows, ['org/repo'])


if __name__ == '__main__':
    unittest.main()
