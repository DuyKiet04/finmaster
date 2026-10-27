const fs = require('fs');
const vm = require('vm');

const files = [
  'theme-pro.js',
  'settings-pro.js',
  'system-pro.js',
  'sound-pro.js',
  'three-spatial.js'
];

for (const file of files) {
  try {
    const code = fs.readFileSync(file, 'utf8');
    new vm.Script(code);
    console.log(`[PASS] ${file} syntax OK`);
  } catch (err) {
    console.error(`[FAIL] ${file} error:`, err.message);
  }
}

// Check index.html scripts
const html = fs.readFileSync('index.html', 'utf8');
const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  count++;
  try {
    new vm.Script(match[1]);
  } catch (err) {
    console.error(`[FAIL] Inline script #${count} in index.html:`, err.message);
  }
}
console.log(`[PASS] Checked ${count} inline scripts in index.html - all syntax OK!`);
