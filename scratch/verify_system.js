const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const balanceIds = [];
const regex = /id=["']([^"']*balance[^"']*)["']/gi;
let match;
while ((match = regex.exec(html)) !== null) {
  balanceIds.push(match[1]);
}
console.log('Balance IDs:', balanceIds);

const heroHub = html.includes('dash-hero-hub');
console.log('Has dash-hero-hub:', heroHub);

const mobileNavPill = html.includes('id="mobile-nav-pill"');
console.log('Has mobile-nav-pill:', mobileNavPill);

const threeSpatial = html.includes('three-spatial.js');
console.log('Has three-spatial.js:', threeSpatial);

fetch('http://localhost:5500/')
  .then(res => res.text())
  .then(text => {
    console.log('HTTP Server status: 200 OK');
    console.log('Server HTML length:', text.length);
    console.log('Server HTML has mobile-nav-pill:', text.includes('id="mobile-nav-pill"'));
    console.log('Server HTML has three-spatial:', text.includes('three-spatial.js'));
  })
  .catch(err => console.error('Server error:', err.message));
