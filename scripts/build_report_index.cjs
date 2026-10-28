// Derived from published Markdown: the daily bot commits only dated reports.
const fs = require('node:fs');
const path = require('node:path');

function plainTitle(text) {
  return text.replace(/!?\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '').trim();
}

function reportTitle(content) {
  const heading = content.match(/^#\s+(.+)$/m)?.[1];
  if (heading && !/^Daily Report(?:\s*\/.*)?$/i.test(heading.trim())) return plainTitle(heading);
  // Older immutable reports had a generic heading. Derive a truthful summary
  // from their existing trend headings without another model call.
  const topics = [...content.matchAll(/^##\s+\d+\.\s+(.+)$/gm)].slice(0, 3).map(match => plainTitle(match[1]));
  return topics.length ? topics.join(' / ') : '오늘의 새 기술 동향 확인';
}

function buildIndex(directory) {
  fs.mkdirSync(directory, { recursive: true });
  const dates = fs.readdirSync(directory)
    .filter(name => /^\d{4}-\d{2}-\d{2}\.md$/.test(name)).map(name => name.slice(0, -3))
    .filter(date => {
      const parsed = new Date(`${date}T00:00:00Z`);
      return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
    }).sort().reverse();
  const overridesFile = path.join(directory, 'titles.json');
  const overrides = fs.existsSync(overridesFile) ? JSON.parse(fs.readFileSync(overridesFile, 'utf8')) : {};
  const reports = dates.map(date => ({ date, title: typeof overrides[date] === 'string' && overrides[date].trim()
    ? overrides[date].trim() : reportTitle(fs.readFileSync(path.join(directory, `${date}.md`), 'utf8')) }));
  const repositoriesFile = path.join(directory, 'repositories.json');
  const repositories = fs.existsSync(repositoriesFile) ? JSON.parse(fs.readFileSync(repositoriesFile, 'utf8')) : {};
  const summariesFile = path.join(directory, 'summaries.json');
  const summaryOverrides = fs.existsSync(summariesFile) ? JSON.parse(fs.readFileSync(summariesFile, 'utf8')) : {};
  const summaries = Object.fromEntries(dates.filter(date => Array.isArray(summaryOverrides[date])
    && summaryOverrides[date].length === 3 && summaryOverrides[date].every(line => typeof line === 'string' && line.trim()))
    .map(date => [date, summaryOverrides[date].map(line => line.trim())]));
  const index = { dates, reports, repositories, summaries };
  fs.writeFileSync(path.join(directory, 'index.json'), JSON.stringify(index, null, 2) + '\n');
  return index;
}

if (require.main === module) {
  const index = buildIndex(path.resolve(__dirname, '../public/daily-reports'));
  console.log(`Daily report index: ${index.dates.length} reports`);
}
module.exports = { buildIndex, reportTitle };
