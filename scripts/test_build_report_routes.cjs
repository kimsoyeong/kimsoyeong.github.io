const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { buildRoutes } = require('./build_report_routes.cjs');
test('provides actual HTML for archive and every dated report', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'report-routes-test-'));
  try {
    fs.writeFileSync(path.join(dir, 'index.html'), '<html>app shell</html>');
    fs.mkdirSync(path.join(dir, 'daily-reports'));
    fs.writeFileSync(path.join(dir, 'daily-reports/index.json'), JSON.stringify({ dates: ['2026-10-27', '2026-10-28'] }));
    assert.equal(buildRoutes(dir), 3);
    for (const route of ['daily', 'daily/2026-10-27', 'daily/2026-10-28']) {
      assert.equal(fs.readFileSync(path.join(dir, route, 'index.html'), 'utf8'), '<html>app shell</html>');
    }
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
