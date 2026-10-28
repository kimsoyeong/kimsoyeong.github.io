const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { buildIndex, reportTitle } = require('./build_report_index.cjs');

test('uses content title or derives older report titles without model calls', () => {
  assert.equal(reportTitle('# 도구 실행 통제와 추론 비용의 변화\n\n## 1. 하위 주제'), '도구 실행 통제와 추론 비용의 변화');
  assert.equal(reportTitle('# Daily Report / 2026-10-27\n\n## 1. 권한 경계\n\n## 2. 모델 비용'), '권한 경계 / 모델 비용');
});
test('indexes all real dates newest first with their summary titles', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'report-index-test-'));
  try {
    fs.writeFileSync(path.join(dir, '2026-02-28.md'), '# 첫날의 기술 변화');
    fs.writeFileSync(path.join(dir, '2026-03-01.md'), '# 둘째 날의 기술 변화');
    fs.writeFileSync(path.join(dir, '2026-02-30.md'), '# Invalid');
    fs.writeFileSync(path.join(dir, 'notes.md'), '# Not a report');
    const index = buildIndex(dir);
    assert.deepEqual(index.dates, ['2026-03-01', '2026-02-28']);
    assert.equal(index.reports[0].title, '둘째 날의 기술 변화');
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir, 'index.json'))), index);
    fs.writeFileSync(path.join(dir, 'titles.json'), JSON.stringify({ '2026-03-01': '기존 발행본의 짧은 요약 제목' }));
    fs.writeFileSync(path.join(dir, 'repositories.json'), JSON.stringify({ 'org/repo': { description: 'Verified project description' } }));
    fs.writeFileSync(path.join(dir, 'summaries.json'), JSON.stringify({ '2026-03-01': ['구체적인 결과', '확인된 조건', '남아 있는 한계'], '2026-02-28': ['잘못된 개수'], '2026-03-02': ['없는 날짜', '둘', '셋'] }));
    const migrated = buildIndex(dir);
    assert.equal(migrated.reports[0].title, '기존 발행본의 짧은 요약 제목');
    assert.equal(migrated.repositories['org/repo'].description, 'Verified project description');
    assert.deepEqual(migrated.summaries, { '2026-03-01': ['구체적인 결과', '확인된 조건', '남아 있는 한계'] });
    assert.equal(fs.readFileSync(path.join(dir, '2026-03-01.md'), 'utf8'), '# 둘째 날의 기술 변화');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
