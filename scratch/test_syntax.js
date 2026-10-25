const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Find all script tags without src attribute
const regex = /<script\b(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
while ((match = regex.exec(html)) !== null) {
  count++;
  try {
    new Function(match[1]);
    console.log(`Script ${count}: Syntax OK (${match[1].length} chars)`);
  } catch (err) {
    console.error(`Script ${count} Syntax Error:`, err.message);
  }
}
console.log('Total inline scripts tested:', count);
