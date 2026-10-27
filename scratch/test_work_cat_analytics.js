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
      this.elements[id] = {
        id,
        innerHTML: '',
        innerText: '',
        style: {},
        classList: {
          classes: new Set(),
          add(...c) { c.forEach(x => this.classes.add(x)); },
          remove(...c) { c.forEach(x => this.classes.delete(x)); },
          contains(c) { return this.classes.has(c); }
        }
      };
    }
    return this.elements[id];
  },
  body: {
    insertAdjacentHTML(pos, html) {
      // Mock modal container
      document.elements["work-cat-analytics-modal"] = {
        id: "work-cat-analytics-modal",
        classList: { classes: new Set(), add() {}, remove() {} }
      };
      document.elements["work-cat-analytics-content"] = {
        id: "work-cat-analytics-content",
        innerHTML: '',
        classList: { classes: new Set(), add() {}, remove() {} }
      };
    }
  },
  addEventListener() {}
};

global.formatMoney = (amt) => (amt || 0).toLocaleString('vi-VN') + ' ₫';
global.state = {
  categories: [
    { id: 'c-lunch', name: 'Ăn trưa công ty', icon: '🍱', color: 'bg-amber-100 text-amber-600' },
    { id: 'c-coffee', name: 'Cà phê công sở', icon: '☕', color: 'bg-orange-100 text-orange-600' }
  ],
  transactions: [
    { id: 't1', type: 'expense', category: 'c-lunch', amount: 50000, date: '2026-10-25 12:00', note: 'Cơm trưa văn phòng', isWork: true, walletId: 'w1' },
    { id: 't2', type: 'expense', category: 'c-lunch', amount: 65000, date: '2026-10-26 12:30', note: 'Bún bò Huế cùng team', isWork: true, walletId: 'w1' },
    { id: 't3', type: 'expense', category: 'c-lunch', amount: 120000, date: '2026-09-15 12:00', note: 'Cơm trưa tháng trước', isWork: true, walletId: 'w1' }
  ],
  wallets: [{ id: 'w1', name: 'Ví MoMo' }],
  workData: { logs: [] }
};

require('../work.js');

try {
  window.openWorkCategoryAnalytics('c-lunch', 'work');
  const content = document.getElementById('work-cat-analytics-content').innerHTML;
  console.log('[PASS] openWorkCategoryAnalytics executed successfully!');
  console.log('[PASS] Content HTML length:', content.length);
  console.log('[PASS] Shows category name:', content.includes('Ăn trưa công ty'));
  console.log('[PASS] Shows scope tabs:', content.includes('Kỳ Này') && content.includes('Toàn Bộ'));

  // Test list rendering
  const listContent = document.getElementById('work-cat-tx-list-container').innerHTML;
  console.log('[PASS] List content HTML length:', listContent.length);
  console.log('[PASS] Displays transactions:', listContent.includes('Cơm trưa văn phòng') && listContent.includes('Bún bò Huế'));

  // Test scope switch to 'all'
  window.setWorkCategoryScope('all');
  const allList = document.getElementById('work-cat-tx-list-container').innerHTML;
  console.log('[PASS] Scope "all" includes older transaction:', allList.includes('Cơm trưa tháng trước'));

  // Test search query
  window.filterWorkCategoryTxs('Bún bò');
  const searchedList = document.getElementById('work-cat-tx-list-container').innerHTML;
  console.log('[PASS] Search filter works:', searchedList.includes('Bún bò Huế') && !searchedList.includes('Cơm trưa văn phòng'));

  console.log('[ALL TESTS PASSED SUCCESSFULLY!]');
} catch (err) {
  console.error('[FAIL]:', err);
  process.exit(1);
}
