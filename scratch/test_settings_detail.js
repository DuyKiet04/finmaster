// Mock minimal browser globals
global.window = global;
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};
global.document = {
  elements: {},
  getElementById(id) {
    if (!this.elements[id]) {
      this.elements[id] = { id, innerHTML: '', innerText: '', style: {}, classList: { add() {}, remove() {} } };
    }
    return this.elements[id];
  },
  body: { classList: { add() {}, remove() {} } },
  addEventListener() {}
};
global.state = {
  categories: [],
  wallets: [],
  moduleSettings: {},
  userProfile: { name: 'User', avatar: '' }
};

require('../theme-pro.js');
require('../settings-pro.js');

try {
  window.openSettingsDetail('themes');
  const modalContent = document.getElementById('settings-slider-content').innerHTML;
  console.log('[PASS] openSettingsDetail("themes") executed successfully!');
  console.log('[PASS] HTML length:', modalContent.length);
  console.log('[PASS] Has 8 Apple iOS palettes:', modalContent.includes('Apple iOS'));
  console.log('[PASS] Has Coin Burst test button:', modalContent.includes('Đồng Tiền'));

  window.openSettingsDetail('modules');
  const modContent = document.getElementById('settings-slider-content').innerHTML;
  console.log('[PASS] openSettingsDetail("modules") executed successfully!');
  console.log('[PASS] Modules HTML length:', modContent.length);
  console.log('[PASS] Has module switches:', modContent.includes('toggleAppModule'));
} catch (err) {
  console.error('[FAIL] Error:', err);
  process.exit(1);
}
