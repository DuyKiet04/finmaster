const fs = require('fs');

const workCode = fs.readFileSync('work.js', 'utf8');

console.log('work.js length:', workCode.length);
console.log('Has workCatListContainer:', workCode.includes('work-cat-list'));
console.log('Has formatMoney:', typeof formatMoney);
