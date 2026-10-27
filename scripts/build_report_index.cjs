// Derived at build/start time: bot commits contain only immutable dated reports.
const fs = require('node:fs');
const path = require('node:path');
const directory = path.resolve(__dirname, '../public/daily-reports');
fs.mkdirSync(directory, { recursive: true });
const dates = fs.readdirSync(directory)
  .filter(name => /^\d{4}-\d{2}-\d{2}\.md$/.test(name))
  .map(name => name.slice(0, -3))
  .filter(date => {
    const parsed = new Date(`${date}T00:00:00Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
  }).sort().reverse();
fs.writeFileSync(path.join(directory, 'index.json'), JSON.stringify({ dates }, null, 2) + '\n');
console.log(`Daily report index: ${dates.length} reports`);
