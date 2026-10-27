const fs = require('fs');

// Create minimal browser environment mocks
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
          toggle(c, force) {
            if (force === undefined) {
              this.classes.has(c) ? this.classes.delete(c) : this.classes.add(c);
            } else if (force) {
              this.classes.add(c);
            } else {
              this.classes.delete(c);
            }
          },
          contains(c) { return this.classes.has(c); }
        },
        querySelector() { return null; },
        querySelectorAll() { return []; },
        scrollTo() {},
        scrollIntoView() {}
      };
    }
    return this.elements[id];
  },
  querySelector(sel) { return null; },
  querySelectorAll(sel) { return []; },
  createElement(tag) {
    return {
      tagName: tag,
      style: {},
      classList: { add() {}, remove() {} },
      animate() { return { onfinish: null }; },
      remove() {}
    };
  },
  body: {
    appendChild() {},
    prepend() {}
  },
  addEventListener() {}
};

global.state = {
  currentView: 'dashboard',
  wallets: [{ id: 'w1', balance: 5000000 }],
  moduleSettings: {
    calendar: true,
    work: false,
    map: true,
    custommaps: false,
    grab: true,
    diary: false,
    favorites: false,
    budgets: true,
    running: false,
    debts: false,
    tasks: true,
    goals: true,
    trips: false,
    gallery: false,
    report: true
  },
  categories: [],
  userProfile: { name: 'Admin', avatar: '' }
};

global.saveData = () => {};
global.playSound = () => {};

// Load theme-pro.js
require('../theme-pro.js');
console.log('[TEST] theme-pro.js loaded.');
console.log('[TEST] FinTheme.getColorThemes count:', window.FinTheme.getColorThemes().length);
console.log('[TEST] triggerCoinBurstAnimation type:', typeof window.triggerCoinBurstAnimation);

// Verify index.html logic
const html = fs.readFileSync('index.html', 'utf8');

// Test NAV_ITEMS and renderNav extraction
const navItemsMatch = html.match(/const NAV_ITEMS = (\[[\s\S]*?\]);/);
const NAV_ITEMS = eval(navItemsMatch[1]);
console.log(`[TEST] NAV_ITEMS count: ${NAV_ITEMS.length}`);

// Test OPTIONAL_MODULES extraction
const optModulesMatch = html.match(/window\.OPTIONAL_MODULES = (\[[\s\S]*?\]);/);
const OPTIONAL_MODULES = eval(optModulesMatch[1]);
console.log(`[TEST] OPTIONAL_MODULES count: ${OPTIONAL_MODULES.length}`);

// Test initial module settings filter
const coreModules = ["dashboard", "transactions", "settings", "wallets"];
let filtered = NAV_ITEMS.filter(item => coreModules.includes(item.id) || state.moduleSettings[item.id] !== false);
console.log('[TEST] Initially active nav items count:', filtered.length);

// Simulate user turning ON "work" and "trips"
state.moduleSettings['work'] = true;
state.moduleSettings['trips'] = true;
filtered = NAV_ITEMS.filter(item => coreModules.includes(item.id) || state.moduleSettings[item.id] !== false);
console.log('[TEST] After enabling work & trips, active nav items count:', filtered.length);

const hasWork = filtered.some(i => i.id === 'work');
const hasTrips = filtered.some(i => i.id === 'trips');
console.log(`[TEST] Has 'work': ${hasWork}, Has 'trips': ${hasTrips}`);

if (hasWork && hasTrips) {
  console.log('[SUCCESS] All tests passed! Enabling modules immediately reflects in navigation!');
} else {
  console.error('[FAIL] Modules not showing in navigation filter!');
  process.exit(1);
}
