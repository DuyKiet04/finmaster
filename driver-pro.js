// ==============================================================
// FILE: driver-pro.js - ULTRA DRIVER & RIDER FINTECH DASHBOARD
// Quản Lý Ca Chạy Grab, Be, ShopeeFood Siêu Cấp Cho FinMaster
// ==============================================================

(function initDriverProModule() {
  window.driverSelectedDate = new Date();
  window.driverSelectedPlatform = 'all'; // 'all', 'grab', 'be', 'shopeefood', 'gojek', 'ahamove', 'other'
  window.driverChartInstance = null;

  // 1. NHÚNG STYLE CSS CHUYÊN BIỆT CHO BENTO DRIVER & LIQUID SHIMMER
  const driverStyles = `
    /* Bento Glass Card cho Tài xế */
    .driver-bento-glass {
      background: var(--bg-card, rgba(255, 255, 255, 0.9));
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--border-color, rgba(226, 232, 240, 0.8));
      transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
    }
    .driver-bento-glass:hover {
      border-color: color-mix(in srgb, #10b981 40%, transparent);
      box-shadow: 0 12px 30px -8px rgba(16, 185, 129, 0.25);
      transform: translateY(-2px);
    }

    /* Shimmer Bar */
    @keyframes driverShimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
    .driver-shimmer-bar {
      position: relative;
      overflow: hidden;
    }
    .driver-shimmer-bar::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
      transform: translateX(-100%);
      animation: driverShimmer 2.4s infinite ease-in-out;
    }

    /* Filter Pill */
    .driver-filter-pill {
      padding: 0.45rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      transition: all 0.2s ease;
      border: 1px solid transparent;
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      cursor: pointer;
      user-select: none;
      background: var(--bg-input, rgba(241, 245, 249, 0.7));
      color: var(--text-secondary, #64748b);
      white-space: nowrap;
    }
    .driver-filter-pill:hover {
      color: var(--text-primary, #0f172a);
      transform: scale(1.02);
    }
    .driver-filter-pill.active {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      border-color: rgba(16, 185, 129, 0.45);
      box-shadow: 0 2px 10px -2px rgba(16, 185, 129, 0.35);
    }
  `;

  let styleEl = document.getElementById('driver-pro-styles');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'driver-pro-styles';
    styleEl.innerHTML = driverStyles;
    document.head.appendChild(styleEl);
  }

  // Danh sách nền tảng hỗ trợ
  const PLATFORMS = {
    grab: { name: 'Grab', icon: 'fa-motorcycle', color: 'from-emerald-500 to-green-600', badgeColor: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' },
    be: { name: 'Be', icon: 'fa-bolt', color: 'from-amber-400 to-yellow-500', badgeColor: 'bg-amber-500/15 text-amber-500 border-amber-500/30' },
    shopeefood: { name: 'ShopeeFood', icon: 'fa-bag-shopping', color: 'from-orange-500 to-red-500', badgeColor: 'bg-orange-500/15 text-orange-500 border-orange-500/30' },
    gojek: { name: 'Gojek', icon: 'fa-person-biking', color: 'from-red-500 to-rose-600', badgeColor: 'bg-red-500/15 text-red-500 border-red-500/30' },
    ahamove: { name: 'Ahamove', icon: 'fa-truck-fast', color: 'from-orange-400 to-amber-600', badgeColor: 'bg-amber-500/15 text-amber-500 border-amber-500/30' },
    other: { name: 'Tự do / Khác', icon: 'fa-route', color: 'from-blue-500 to-indigo-600', badgeColor: 'bg-blue-500/15 text-blue-500 border-blue-500/30' }
  };

  // ==============================================================
  // 2. ĐIỀU HƯỚNG THÁNG & BỘ LỌC NỀN TẢNG
  // ==============================================================
  window.changeDriverMonth = function(dir) {
    window.driverSelectedDate.setMonth(window.driverSelectedDate.getMonth() + dir);
    renderGrab();
    if (typeof playSound === 'function') playSound("click");
  };

  window.jumpDriverToday = function() {
    window.driverSelectedDate = new Date();
    renderGrab();
    if (typeof playSound === 'function') playSound("pop");
  };

  window.setDriverPlatformFilter = function(plat) {
    window.driverSelectedPlatform = plat;
    renderGrab();
    if (typeof playSound === 'function') playSound("click");
  };

  // ==============================================================
  // 3. TẠO CA CHẠY MẪU TEST (QUICK DEMO SHIFT)
  // ==============================================================
  window.quickAddDemoShift = function() {
    if (!state.grabShifts) state.grabShifts = [];

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    const platforms = ['grab', 'be', 'shopeefood'];
    const randomPlat = platforms[Math.floor(Math.random() * platforms.length)];
    const rides = 16;
    const rev = 580000;
    const gas = 70000;
    const food = 45000;
    const tip = 25000;
    const net = rev + tip - gas - food;

    state.grabShifts.unshift({
      id: 'grab-' + generateId(),
      date: dateStr,
      platform: randomPlat,
      revenue: rev,
      rides: rides,
      gas: gas,
      food: food,
      tip: tip,
      net: net,
      hours: 7.5
    });

    saveData();
    renderGrab();

    if (typeof confetti === 'function') {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    }
    if (typeof playSound === 'function') playSound("pop");
  };

  // ==============================================================
  // 4. MODAL CHỐT CA SIÊU CẤP (SMART SHIFT MODAL)
  // ==============================================================
  window.openDriverShiftModal = function() {
    let modal = document.getElementById('driver-shift-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'driver-shift-modal';
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md hidden';
      document.body.appendChild(modal);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const walletOptions = state.wallets.map(w => 
      `<option value="${w.id}">${w.name} (Số dư: ${formatMoney(w.balance)})</option>`
    ).join('');

    modal.innerHTML = `
      <div class="relative w-full max-w-lg custom-bg-card rounded-3xl p-5 sm:p-6 border custom-border custom-shadow-lg max-h-[90vh] overflow-y-auto custom-scrollbar animate-popIn">
        <!-- Close Button -->
        <button onclick="document.getElementById('driver-shift-modal').classList.add('hidden')" 
          class="absolute top-4 right-4 w-9 h-9 rounded-2xl custom-bg-input flex items-center justify-center custom-text-secondary hover:custom-text transition-all">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>

        <!-- Header -->
        <div class="flex items-center gap-3.5 mb-5">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/25 shrink-0">
            <i class="fa-solid fa-motorcycle"></i>
          </div>
          <div>
            <h3 class="text-lg font-black custom-text">Chốt Ca Chạy Hôm Nay</h3>
            <p class="text-xs custom-text-secondary">Ghi nhận doanh thu, tiền xăng và thực lãnh bỏ túi</p>
          </div>
        </div>

        <form id="frm-driver-shift" class="space-y-4">
          <!-- Chọn App Nền Tảng -->
          <div>
            <label class="block text-xs font-bold custom-text-secondary uppercase mb-1.5">Ứng Dụng Chạy (Nền tảng)</label>
            <div class="grid grid-cols-3 gap-2">
              <label class="cursor-pointer">
                <input type="radio" name="driver-platform" value="grab" checked class="peer hidden" />
                <div class="py-2.5 px-2 rounded-xl custom-bg-input border custom-border text-center peer-checked:bg-emerald-500/15 peer-checked:text-emerald-500 peer-checked:border-emerald-500/50 font-bold text-xs transition-all">
                  🟢 Grab
                </div>
              </label>
              <label class="cursor-pointer">
                <input type="radio" name="driver-platform" value="be" class="peer hidden" />
                <div class="py-2.5 px-2 rounded-xl custom-bg-input border custom-border text-center peer-checked:bg-amber-500/15 peer-checked:text-amber-500 peer-checked:border-amber-500/50 font-bold text-xs transition-all">
                  🟡 Be
                </div>
              </label>
              <label class="cursor-pointer">
                <input type="radio" name="driver-platform" value="shopeefood" class="peer hidden" />
                <div class="py-2.5 px-2 rounded-xl custom-bg-input border custom-border text-center peer-checked:bg-orange-500/15 peer-checked:text-orange-500 peer-checked:border-orange-500/50 font-bold text-xs transition-all">
                  🟠 ShopeeFood
                </div>
              </label>
              <label class="cursor-pointer">
                <input type="radio" name="driver-platform" value="gojek" class="peer hidden" />
                <div class="py-2.5 px-2 rounded-xl custom-bg-input border custom-border text-center peer-checked:bg-red-500/15 peer-checked:text-red-500 peer-checked:border-red-500/50 font-bold text-xs transition-all">
                  🔴 Gojek
                </div>
              </label>
              <label class="cursor-pointer">
                <input type="radio" name="driver-platform" value="ahamove" class="peer hidden" />
                <div class="py-2.5 px-2 rounded-xl custom-bg-input border custom-border text-center peer-checked:bg-amber-500/15 peer-checked:text-amber-500 peer-checked:border-amber-500/50 font-bold text-xs transition-all">
                  🚚 Ahamove
                </div>
              </label>
              <label class="cursor-pointer">
                <input type="radio" name="driver-platform" value="other" class="peer hidden" />
                <div class="py-2.5 px-2 rounded-xl custom-bg-input border custom-border text-center peer-checked:bg-blue-500/15 peer-checked:text-blue-500 peer-checked:border-blue-500/50 font-bold text-xs transition-all">
                  ⚪ Khác / Xe ôm
                </div>
              </label>
            </div>
          </div>

          <!-- Ngày chạy & Số giờ chạy -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold custom-text-secondary uppercase mb-1">Ngày chạy</label>
              <input type="date" id="d-date" value="${todayStr}" required 
                class="w-full p-3 rounded-2xl custom-bg-input border custom-border font-bold text-xs custom-text outline-none focus:border-emerald-500">
            </div>
            <div>
              <label class="block text-xs font-bold custom-text-secondary uppercase mb-1">Thời gian chạy (Giờ)</label>
              <input type="number" step="0.5" id="d-hours" placeholder="VD: 8" 
                class="w-full p-3 rounded-2xl custom-bg-input border custom-border font-bold text-xs custom-text outline-none focus:border-emerald-500">
            </div>
          </div>

          <!-- Doanh thu App & Số cuốc -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-emerald-500 uppercase mb-1">Doanh thu App (VNĐ)</label>
              <input type="text" inputmode="numeric" id="d-rev" oninput="formatInputCurrency(event); calcDriverNetPreview();" required placeholder="0" 
                class="w-full p-3.5 rounded-2xl custom-bg-input border custom-border font-black text-lg text-emerald-500 outline-none focus:border-emerald-500">
            </div>
            <div>
              <label class="block text-xs font-bold custom-text-secondary uppercase mb-1">Tổng số cuốc chạy</label>
              <input type="number" id="d-rides" required placeholder="0" oninput="calcDriverNetPreview();"
                class="w-full p-3.5 rounded-2xl custom-bg-input border custom-border font-black text-lg custom-text text-center outline-none focus:border-emerald-500">
            </div>
          </div>

          <!-- Khấu trừ Hao Phí: Xăng, Ăn uống, Tiền Tip -->
          <div class="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-3">
            <span class="text-xs font-black text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-solid fa-gas-pump"></i> Khấu Trừ Chi Phí Ca
            </span>
            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="block text-[10px] font-bold custom-text-secondary uppercase mb-0.5">Tiền xăng</label>
                <input type="text" inputmode="numeric" id="d-gas" oninput="formatInputCurrency(event); calcDriverNetPreview();" placeholder="0" 
                  class="w-full p-2.5 rounded-xl custom-bg-card border custom-border font-black text-xs text-rose-500 outline-none">
              </div>
              <div>
                <label class="block text-[10px] font-bold custom-text-secondary uppercase mb-0.5">Cơm trưa / Nước</label>
                <input type="text" inputmode="numeric" id="d-food" oninput="formatInputCurrency(event); calcDriverNetPreview();" placeholder="0" 
                  class="w-full p-2.5 rounded-xl custom-bg-card border custom-border font-black text-xs text-amber-500 outline-none">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-emerald-500 uppercase mb-0.5">Tiền tip thêm (+)</label>
                <input type="text" inputmode="numeric" id="d-tip" oninput="formatInputCurrency(event); calcDriverNetPreview();" placeholder="0" 
                  class="w-full p-2.5 rounded-xl custom-bg-card border custom-border font-black text-xs text-emerald-500 outline-none">
              </div>
            </div>
          </div>

          <!-- Live Preview Thực Lãnh Bỏ Túi -->
          <div class="p-3.5 rounded-2xl custom-bg-input border custom-border flex items-center justify-between">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider custom-text-secondary block">Thực lãnh bỏ túi</span>
              <span id="preview-driver-net" class="text-xl font-black text-emerald-500">0 ₫</span>
            </div>
            <div class="text-right">
              <span class="text-[10px] font-bold uppercase tracking-wider custom-text-secondary block">Bình quân / cuốc</span>
              <span id="preview-driver-per-ride" class="text-xs font-black custom-text">0 ₫ / cuốc</span>
            </div>
          </div>

          <!-- Nguồn ví lưu tiền -->
          <div>
            <label class="block text-xs font-bold custom-text-secondary uppercase mb-1">Ví nhận tiền thực lãnh</label>
            <select id="d-wallet" class="w-full p-3 rounded-2xl custom-bg-input border custom-border font-bold text-xs custom-text outline-none">
              ${walletOptions}
            </select>
          </div>

          <!-- Action buttons -->
          <div class="pt-2 flex gap-2.5">
            <button type="button" onclick="document.getElementById('driver-shift-modal').classList.add('hidden')"
              class="flex-1 py-3.5 rounded-2xl custom-bg-input font-bold text-xs custom-text hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
              Hủy
            </button>
            <button type="submit"
              class="flex-[2] py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5">
              <i class="fa-solid fa-cash-register"></i> Chốt Sổ & Lưu Giao Dịch
            </button>
          </div>
        </form>
      </div>
    `;

    window.calcDriverNetPreview = function() {
      const getNum = id => {
        const val = document.getElementById(id)?.value || '0';
        return typeof getRawNumber === 'function' ? getRawNumber(val) : parseInt(val.replace(/\D/g, '') || 0);
      };
      const rev = getNum('d-rev');
      const gas = getNum('d-gas');
      const food = getNum('d-food');
      const tip = getNum('d-tip');
      const rides = parseInt(document.getElementById('d-rides')?.value || 0);

      const net = rev + tip - gas - food;
      const perRide = rides > 0 ? Math.round(net / rides) : 0;

      const netEl = document.getElementById('preview-driver-net');
      if (netEl) netEl.innerText = formatMoney(net);

      const perRideEl = document.getElementById('preview-driver-per-ride');
      if (perRideEl) perRideEl.innerText = formatMoney(perRide) + ' / cuốc';
    };

    document.getElementById('frm-driver-shift').onsubmit = function(e) {
      e.preventDefault();
      const getNum = id => {
        const val = document.getElementById(id)?.value || '0';
        return typeof getRawNumber === 'function' ? getRawNumber(val) : parseInt(val.replace(/\D/g, '') || 0);
      };

      const date = document.getElementById('d-date').value;
      const hours = parseFloat(document.getElementById('d-hours').value) || 0;
      const rev = getNum('d-rev');
      const rides = parseInt(document.getElementById('d-rides').value) || 0;
      const gas = getNum('d-gas');
      const food = getNum('d-food');
      const tip = getNum('d-tip');
      const walletId = document.getElementById('d-wallet').value;

      const platEl = document.querySelector('input[name="driver-platform"]:checked');
      const platform = platEl ? platEl.value : 'grab';

      if (rev <= 0) return alert("Vui lòng nhập doanh thu app lớn hơn 0!");

      const net = rev + tip - gas - food;

      if (!state.grabShifts) state.grabShifts = [];

      state.grabShifts.unshift({
        id: 'grab-' + generateId(),
        date: date,
        platform: platform,
        revenue: rev,
        rides: rides,
        gas: gas,
        food: food,
        tip: tip,
        net: net,
        hours: hours
      });

      // Tự động đồng bộ sang Sổ giao dịch chính
      const baseDate = date + " " + new Date().toTimeString().split(" ")[0];
      const platName = PLATFORMS[platform] ? PLATFORMS[platform].name : 'Tài xế';

      state.transactions.unshift({
        id: generateId(),
        type: "income",
        amount: rev + tip,
        category: "c7", // Lương/Doanh thu
        walletId: walletId,
        date: baseDate,
        note: `Doanh thu ${platName} (${rides} cuốc${tip > 0 ? ` + ${formatMoney(tip)} tip` : ''})`
      });

      if (gas > 0) {
        state.transactions.unshift({
          id: generateId(),
          type: "expense",
          amount: gas,
          category: "c2", // Di chuyển/Xăng
          walletId: walletId,
          date: baseDate,
          note: `Đổ xăng (Ca ${platName})`
        });
      }

      if (food > 0) {
        state.transactions.unshift({
          id: generateId(),
          type: "expense",
          amount: food,
          category: "c1", // Ăn uống
          walletId: walletId,
          date: baseDate,
          note: `Ăn uống (Ca ${platName})`
        });
      }

      const w = state.wallets.find(x => x.id === walletId);
      if (w) w.balance += net;

      if (typeof addLog === 'function') {
        addLog("Tài xế " + platName, `Chốt ca ${date}: Nhận ${formatMoney(net)} (${rides} cuốc)`);
      }

      saveData();
      renderGrab();
      if (typeof updateAllViews === 'function') updateAllViews();

      document.getElementById('driver-shift-modal').classList.add('hidden');

      if (typeof confetti === 'function') {
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
      }
      if (typeof playSound === 'function') playSound("success");

      alert(`🎉 Chốt ca thành công!\nThực lãnh hôm nay bỏ túi là: ${formatMoney(net)} (${rides} cuốc). Đã tự động cập nhật số dư ví!`);
    };

    modal.classList.remove('hidden');
  };

  // ==============================================================
  // 5. HÀM CHÍNH: RENDER TOÀN BỘ GIAO DIỆN TÀI XẾ (BENTO DRIVER)
  // ==============================================================
  window.renderGrab = function() {
    const root = document.getElementById("view-grab");
    if (!root) return;

    if (!state.grabShifts) state.grabShifts = [];

    const selDate = window.driverSelectedDate || new Date();
    const cm = selDate.getMonth();
    const cy = selDate.getFullYear();

    const now = new Date();
    const isThisMonth = (now.getMonth() === cm && now.getFullYear() === cy);

    // Lọc các ca trong tháng được chọn
    let monthShifts = state.grabShifts.filter(s => {
      if (!s.date) return false;
      const d = new Date(s.date);
      return d.getMonth() === cm && d.getFullYear() === cy;
    });

    // Lọc theo nền tảng
    if (window.driverSelectedPlatform !== 'all') {
      monthShifts = monthShifts.filter(s => (s.platform || 'grab') === window.driverSelectedPlatform);
    }

    // Tính toán các chỉ số vàng
    const totalNet = monthShifts.reduce((sum, s) => sum + (s.net || 0), 0);
    const totalRev = monthShifts.reduce((sum, s) => sum + (s.revenue || 0) + (s.tip || 0), 0);
    const totalGas = monthShifts.reduce((sum, s) => sum + (s.gas || 0), 0);
    const totalFood = monthShifts.reduce((sum, s) => sum + (s.food || 0), 0);
    const totalExp = totalGas + totalFood;
    const totalRides = monthShifts.reduce((sum, s) => sum + (s.rides || 0), 0);
    const totalHours = monthShifts.reduce((sum, s) => sum + (s.hours || 0), 0);

    const avgPerRide = totalRides > 0 ? Math.round(totalNet / totalRides) : 0;
    const avgPerHour = totalHours > 0 ? Math.round(totalNet / totalHours) : 0;
    const profitMargin = totalRev > 0 ? Math.round((totalNet / totalRev) * 100) : 0;

    // ==============================================================
    // BẮT ĐẦU DỰNG HTML GIAO DIỆN BENTO
    // ==============================================================
    let html = `
      <div class="space-y-4 sm:space-y-5 pb-24">

        <!-- 1. SPATIAL TOP HERO HEADER -->
        <header class="flex items-center justify-between gap-2.5 p-2 rounded-2xl sm:rounded-3xl custom-bg-card border custom-border custom-shadow-sm">
          <div class="flex items-center gap-2">
            <button onclick="switchView('dashboard')" 
              class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl custom-bg-input flex items-center justify-center custom-text hover:scale-105 active:scale-95 transition-all shrink-0" 
              title="Quay lại Tổng quan">
              <i class="fa-solid fa-arrow-left text-sm sm:text-base"></i>
            </button>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-base sm:text-lg font-black custom-text tracking-tight">Sổ Ca Tài Xế</h1>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Bật App
                </span>
              </div>
              <p class="text-[11px] custom-text-secondary leading-none hidden sm:block mt-0.5">Grab • Be • ShopeeFood • Doanh thu & Xăng xe</p>
            </div>
          </div>

          <!-- Bộ Chuyển Tháng Thông Minh -->
          <div class="flex items-center gap-1 custom-bg-input p-1 rounded-2xl border custom-border">
            <button onclick="changeDriverMonth(-1)" class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center custom-text-secondary hover:custom-text active:scale-90 transition-all">
              <i class="fa-solid fa-chevron-left text-xs"></i>
            </button>
            <button onclick="jumpDriverToday()" class="px-2 sm:px-3 text-xs sm:text-sm font-black custom-text hover:text-emerald-500 transition-colors flex items-center gap-1.5" title="Nhấp để về tháng hiện tại">
              <span>Tháng ${cm + 1}/${cy}</span>
              ${isThisMonth ? `<span class="w-2 h-2 rounded-full bg-emerald-500"></span>` : ''}
            </button>
            <button onclick="changeDriverMonth(1)" class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center custom-text-secondary hover:custom-text active:scale-90 transition-all">
              <i class="fa-solid fa-chevron-right text-xs"></i>
            </button>
          </div>

          <!-- Nút Chốt Ca Chính -->
          <div class="flex items-center gap-1.5">
            <button onclick="openDriverShiftModal()" 
              class="py-2.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all shrink-0">
              <i class="fa-solid fa-cash-register"></i> <span class="hidden sm:inline">Chốt Ca</span>
            </button>
          </div>
        </header>

        <!-- 2. BỘ LỌC NỀN TẢNG APP (Pills) -->
        <div class="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
          <button onclick="setDriverPlatformFilter('all')" class="driver-filter-pill ${window.driverSelectedPlatform === 'all' ? 'active' : ''}">
            Tất cả app
          </button>
          <button onclick="setDriverPlatformFilter('grab')" class="driver-filter-pill ${window.driverSelectedPlatform === 'grab' ? 'active' : ''}">
            🟢 Grab
          </button>
          <button onclick="setDriverPlatformFilter('be')" class="driver-filter-pill ${window.driverSelectedPlatform === 'be' ? 'active' : ''}">
            🟡 Be
          </button>
          <button onclick="setDriverPlatformFilter('shopeefood')" class="driver-filter-pill ${window.driverSelectedPlatform === 'shopeefood' ? 'active' : ''}">
            🟠 ShopeeFood
          </button>
          <button onclick="setDriverPlatformFilter('gojek')" class="driver-filter-pill ${window.driverSelectedPlatform === 'gojek' ? 'active' : ''}">
            🔴 Gojek
          </button>
          <button onclick="setDriverPlatformFilter('ahamove')" class="driver-filter-pill ${window.driverSelectedPlatform === 'ahamove' ? 'active' : ''}">
            🚚 Ahamove
          </button>
        </div>

        <!-- 3. HERO LIQUID BENTO COMMAND HUB (4 Chỉ Số Vàng) -->
        <div class="driver-bento-glass rounded-3xl p-5 sm:p-6 custom-shadow-md">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
            <!-- Thực Lãnh Bỏ Túi -->
            <div class="p-4 rounded-2xl custom-bg-input border custom-border flex flex-col justify-between">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] font-black uppercase tracking-wider text-emerald-500">Thực Lãnh</span>
                <div class="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-xs font-black">
                  <i class="fa-solid fa-money-bill-wave"></i>
                </div>
              </div>
              <div class="text-xl sm:text-2xl font-black text-emerald-500 tracking-tight truncate">${formatMoney(totalNet)}</div>
              <div class="text-[10px] font-bold custom-text-secondary mt-1">Lợi nhuận ròng ${profitMargin}%</div>
            </div>

            <!-- Tổng Doanh Thu App -->
            <div class="p-4 rounded-2xl custom-bg-input border custom-border flex flex-col justify-between">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] font-black uppercase tracking-wider text-primary-500">Doanh Thu App</span>
                <div class="w-7 h-7 rounded-xl bg-primary-500/15 text-primary-500 flex items-center justify-center text-xs font-black">
                  <i class="fa-solid fa-receipt"></i>
                </div>
              </div>
              <div class="text-xl sm:text-2xl font-black custom-text tracking-tight truncate">${formatMoney(totalRev)}</div>
              <div class="text-[10px] font-bold custom-text-secondary mt-1">${monthShifts.length} ca chạy đã chốt</div>
            </div>

            <!-- Hao phí xăng & ăn uống -->
            <div class="p-4 rounded-2xl custom-bg-input border custom-border flex flex-col justify-between">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] font-black uppercase tracking-wider text-rose-500">Hao Phí Ca</span>
                <div class="w-7 h-7 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center text-xs font-black">
                  <i class="fa-solid fa-gas-pump"></i>
                </div>
              </div>
              <div class="text-xl sm:text-2xl font-black text-rose-500 tracking-tight truncate">-${formatMoney(totalExp)}</div>
              <div class="text-[10px] font-bold custom-text-secondary mt-1">Xăng: ${formatMoney(totalGas)}</div>
            </div>

            <!-- Tổng số cuốc & Bình quân -->
            <div class="p-4 rounded-2xl custom-bg-input border custom-border flex flex-col justify-between">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] font-black uppercase tracking-wider text-amber-500">Tổng Cuốc Xe</span>
                <div class="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-xs font-black">
                  <i class="fa-solid fa-motorcycle"></i>
                </div>
              </div>
              <div class="text-xl sm:text-2xl font-black text-amber-500 tracking-tight truncate">${totalRides} cuốc</div>
              <div class="text-[10px] font-bold custom-text-secondary mt-1">~${formatMoney(avgPerRide)} / cuốc</div>
            </div>
          </div>

          <!-- Pacing & Performance Banner -->
          <div class="p-3.5 rounded-2xl custom-bg-input border custom-border flex items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-sm font-black shrink-0">
                <i class="fa-solid fa-gauge-high"></i>
              </span>
              <div>
                <div class="font-black custom-text">Hiệu suất bào cuốc Tháng ${cm + 1}/${cy}</div>
                <div class="text-[11px] custom-text-secondary">
                  ${totalRides > 0 ? `Bình quân kiếm được <b>${formatMoney(avgPerRide)}/cuốc</b>${totalHours > 0 ? ` • ~<b>${formatMoney(avgPerHour)}/giờ</b>` : ''}` : 'Chưa có chuyến xe nào được ghi nhận trong tháng này.'}
                </div>
              </div>
            </div>

            ${totalExp > 0 ? `
              <div class="hidden sm:block text-right">
                <span class="text-[10px] font-bold custom-text-secondary uppercase block">Tỷ lệ hao xăng/cơm</span>
                <span class="font-black text-rose-500">${totalRev > 0 ? Math.round((totalExp / totalRev) * 100) : 0}% doanh thu</span>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- 4. BIỂU ĐỒ 7 NGÀY GẦN NHẤT (Chart.js Bar Chart) -->
        <div class="driver-bento-glass rounded-3xl p-5 sm:p-6 custom-shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-black text-sm uppercase tracking-wider custom-text flex items-center gap-2">
              <i class="fa-solid fa-chart-column text-emerald-500"></i> Phân Tích 7 Ngày Gần Nhất
            </h3>
            <span class="text-[11px] font-bold custom-text-secondary">Doanh thu vs Thực lãnh</span>
          </div>

          <div class="h-52 w-full relative">
            <canvas id="grabChart"></canvas>
          </div>
        </div>

        <!-- 5. DANH SÁCH LỊCH SỬ CHỐT CA BENTO -->
        <div class="driver-bento-glass rounded-3xl p-5 sm:p-6 custom-shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-black text-sm uppercase tracking-wider custom-text flex items-center gap-2">
              <i class="fa-solid fa-list-check text-orange-500"></i> Lịch Sử Chốt Ca
            </h3>
            <span class="text-xs font-bold custom-text-secondary">${monthShifts.length} ca</span>
          </div>

          <div id="grab-history-list" class="space-y-3">
    `;

    if (monthShifts.length === 0) {
      html += `
        <div class="py-10 text-center">
          <div class="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-3xl mx-auto mb-3">
            🛵
          </div>
          <h4 class="text-base font-bold custom-text">Chưa có ca chạy nào trong tháng ${cm+1}/${cy}</h4>
          <p class="text-xs custom-text-secondary max-w-xs mx-auto mt-1 mb-5">
            Bác tài hãy nhấn "Chốt Ca" sau mỗi ngày chạy để theo dõi thu nhập ròng và tiền xăng xe nhé!
          </p>
          <div class="flex items-center justify-center gap-2">
            <button onclick="openDriverShiftModal()" 
              class="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all">
              <i class="fa-solid fa-plus"></i> Chốt Ca Ngay
            </button>
            <button onclick="quickAddDemoShift()" 
              class="py-2.5 px-4 rounded-xl custom-bg-input border custom-border custom-text font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all">
              Tạo Ca Mẫu Thử
            </button>
          </div>
        </div>
      `;
    } else {
      monthShifts.forEach(s => {
        const platInfo = PLATFORMS[s.platform] || PLATFORMS.grab;
        const dateObj = new Date(s.date);
        const dayOfWeek = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"][dateObj.getDay()];
        const dateFormatted = dateObj.toLocaleDateString("vi-VN");
        const expTotal = (s.gas || 0) + (s.food || 0);

        html += `
          <div class="p-4 rounded-2xl custom-bg-input border custom-border flex items-center justify-between gap-3 group hover:border-emerald-500/40 transition-all">
            <div class="flex items-center gap-3.5">
              <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr ${platInfo.color} text-white flex items-center justify-center text-lg shadow-sm shrink-0">
                <i class="fa-solid ${platInfo.icon}"></i>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-black text-sm custom-text">${dayOfWeek}, ${dateFormatted}</span>
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-black border ${platInfo.badgeColor}">${platInfo.name}</span>
                </div>
                <div class="text-[11px] custom-text-secondary mt-1 flex items-center gap-2 flex-wrap">
                  <span><i class="fa-solid fa-hashtag text-[10px]"></i> <b>${s.rides} cuốc</b></span>
                  <span>• Doanh thu: ${formatMoney(s.revenue)}</span>
                  ${expTotal > 0 ? `<span>• Hao phí: <b class="text-rose-500">-${formatMoney(expTotal)}</b></span>` : ''}
                  ${s.tip > 0 ? `<span>• Tip: <b class="text-emerald-500">+${formatMoney(s.tip)}</b></span>` : ''}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3 shrink-0">
              <div class="text-right">
                <span class="text-base sm:text-lg font-black text-emerald-500 block">+${formatMoney(s.net)}</span>
                <span class="text-[10px] font-bold custom-text-secondary">Thực nhận</span>
              </div>

              <button onclick="deleteGrabShift('${s.id}')" 
                class="w-9 h-9 rounded-xl custom-bg-card border custom-border text-xs text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center"
                title="Xóa ca chạy này">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        `;
      });
    }

    html += `
          </div> <!-- End grab-history-list -->
        </div> <!-- End bento -->
      </div> <!-- End space-y-4 -->
    `;

    root.innerHTML = html;

    // Vẽ biểu đồ Chart.js
    setTimeout(() => {
      renderDriverChart(monthShifts);
    }, 50);
  };

  // ==============================================================
  // 6. VẼ BIỂU ĐỒ 7 NGÀY GẦN NHẤT
  // ==============================================================
  function renderDriverChart(monthShifts) {
    if (window.driverChartInstance) {
      window.driverChartInstance.destroy();
      window.driverChartInstance = null;
    }

    const ctx = document.getElementById("grabChart");
    if (!ctx) return;

    // Lấy 7 ngày gần nhất
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      let d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

    let dataNet = Array(7).fill(0);
    let dataRev = Array(7).fill(0);
    let dataExp = Array(7).fill(0);

    (state.grabShifts || []).forEach(s => {
      const idx = last7Days.indexOf(s.date);
      if (idx > -1) {
        dataRev[idx] += (s.revenue || 0) + (s.tip || 0);
        dataNet[idx] += (s.net || 0);
        dataExp[idx] += ((s.gas || 0) + (s.food || 0));
      }
    });

    const labels = last7Days.map(d => {
      const parts = d.split('-');
      return `${parts[2]}/${parts[1]}`;
    });

    window.driverChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Thực Lãnh",
            data: dataNet,
            backgroundColor: "#10b981",
            borderRadius: 6,
            barPercentage: 0.55,
          },
          {
            label: "Doanh Thu",
            data: dataRev,
            backgroundColor: "rgba(99, 102, 241, 0.35)",
            borderRadius: 6,
            barPercentage: 0.55,
          },
          {
            label: "Hao Phí",
            data: dataExp,
            backgroundColor: "rgba(244, 63, 94, 0.5)",
            borderRadius: 6,
            barPercentage: 0.55,
          }
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: { boxWidth: 12, font: { size: 11, weight: 'bold' } },
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.raw.toLocaleString('vi-VN')} ₫`;
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { borderDash: [4, 4], color: "rgba(200, 200, 200, 0.15)" },
            ticks: {
              callback: (v) => (v / 1000) + 'k',
              font: { size: 10 },
            },
          },
        },
      },
    });
  }

  // Khởi chạy khi module load nếu đang ở tab grab
  if (state && state.currentView === 'grab') {
    window.renderGrab();
  }
})();
