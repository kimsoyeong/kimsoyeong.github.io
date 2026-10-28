// GitHub Pages must serve real HTML for direct /daily[/date] navigation.
const fs = require('node:fs');
const path = require('node:path');
function buildRoutes(buildDirectory) {
  const html = fs.readFileSync(path.join(buildDirectory, 'index.html'));
  const { dates } = JSON.parse(fs.readFileSync(path.join(buildDirectory, 'daily-reports/index.json'), 'utf8'));
  const routes = ['daily', ...dates.map(date => `daily/${date}`)];
  for (const route of routes) {
    const directory = path.join(buildDirectory, route);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, 'index.html'), html);
  }
  return routes.length;
}
if (require.main === module) {
  console.log(`Daily report HTML routes: ${buildRoutes(path.resolve(process.env.BUILD_PATH || 'build'))}`);
}
module.exports = { buildRoutes };
