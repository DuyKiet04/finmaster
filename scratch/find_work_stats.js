const fs = require('fs');
const c = fs.readFileSync('work.js', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('work-cat-list') || l.includes('renderWorkDashboard') || l.includes('tab-stats')) {
    console.log(`${i + 1}: ${l}`);
  }
});
