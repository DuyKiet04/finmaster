const fs = require('fs');
const txt = fs.readFileSync('index.html', 'utf8');
const start = txt.indexOf('id="view-dashboard"');
const end = txt.indexOf('id="view-transactions"');
const dashHtml = txt.substring(start, end);
const ids = [...dashHtml.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
console.log('Total IDs found in view-dashboard:', ids.length);
console.log(ids);
