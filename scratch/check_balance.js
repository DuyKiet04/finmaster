const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Check view-dashboard
const dashStart = html.indexOf('id="view-dashboard"');
const txStart = html.indexOf('id="view-transactions"');
if (dashStart !== -1 && txStart !== -1) {
  const dashChunk = html.slice(dashStart, txStart);
  const openDivs = (dashChunk.match(/<div(\s|>)/gi) || []).length;
  const closeDivs = (dashChunk.match(/<\/div>/gi) || []).length;
  console.log(`view-dashboard div balance: open=${openDivs}, close=${closeDivs}`);
}

// Check mobile-bottom-bar
const barStart = html.indexOf('id="mobile-bottom-bar"');
const modalStart = html.indexOf('id="global-modal"');
if (barStart !== -1 && modalStart !== -1) {
  const barChunk = html.slice(barStart, modalStart);
  const openDivs = (barChunk.match(/<div(\s|>)/gi) || []).length;
  const closeDivs = (barChunk.match(/<\/div>/gi) || []).length;
  console.log(`mobile-bottom-bar div balance: open=${openDivs}, close=${closeDivs}`);
}
