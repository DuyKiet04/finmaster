const fs = require('fs');
const c = fs.readFileSync('analytics.js', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('window.') || l.includes('function open') || l.includes('function render')) {
    console.log(`${i + 1}: ${l}`);
  }
});
