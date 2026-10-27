// ==============================================================
// FILE: budget-pro.js - ULTRA FINTECH LIQUID GLASS & BENTO BUDGETS
// Quản Lý Ngân Sách Thông Minh & Hạn Mức Chi Tiêu Cho FinMaster
// ==============================================================

(function initBudgetProModule() {
  // Biến trạng thái toàn cục của module Ngân Sách
  window.budgetSelectedDate = new Date();
  window.budgetFilterStatus = 'all'; // 'all', 'safe', 'warning', 'danger'
  window.budgetSearchQuery = '';
  window.budgetSortMode = 'pct_desc'; // 'pct_desc', 'spent_desc', 'amount_desc', 'remaining_asc', 'name_asc'

  // Tiện ích format tiền tệ gọn (k, tr, tỷ)
  window.formatCompactMoney = function(amount) {
    if (!amount || isNaN(amount)) return '0 ₫';
    const num = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    if (num >= 1000000000) return sign + (num / 1000000000).toFixed(1).replace(/\.0$/, '') + ' tỷ ₫';
    if (num >= 1000000) return sign + (num / 1000000).toFixed(1).replace(/\.0$/, '') + ' tr ₫';
    if (num >= 1000) return sign + Math.round(num / 1000) + 'k ₫';
    return sign + num.toLocaleString('vi-VN') + ' ₫';
  };

  // 1. NHÚNG STYLE CSS CHUYÊN BIỆT CHO BENTO BUDGET & LIQUID EFFECTS
  const budgetStyles = `
    /* Bento Glass Card */
    .budget-bento-glass {
      background: var(--bg-card, rgba(255, 255, 255, 0.9));
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--border-color, rgba(226, 232, 240, 0.8));
      transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
    }
    .budget-bento-glass:hover {
      border-color: color-mix(in srgb, var(--icon-active, #6366f1) 40%, transparent);
      box-shadow: 0 12px 30px -8px var(--theme-glow, rgba(99, 102, 241, 0.25));
      transform: translateY(-2px);
    }

    /* Hiệu ứng tia sáng chạy trên thanh Progress Bar */
    @keyframes budgetShimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
    .budget-shimmer-bar {
      position: relative;
      overflow: hidden;
    }
    .budget-shimmer-bar::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
      transform: translateX(-100%);
      animation: budgetShimmer 2.4s infinite ease-in-out;
    }

    /* Hiệu ứng nhịp đập cảnh báo khi vượt ngân sách */
    @keyframes budgetPulseAlert {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.4);
        border-color: rgba(244, 63, 94, 0.7);
      }
      50% {
        box-shadow: 0 0 18px 4px rgba(244, 63, 94, 0.25);
        border-color: rgba(244, 63, 94, 1);
      }
    }
    .budget-card-overspent {
      animation: budgetPulseAlert 3s infinite ease-in-out;
    }

    /* Glow nhẹ cho Aura background */
    .budget-aura-glow {
      position: absolute;
      border-radius: 9999px;
      filter: blur(60px);
      pointer-events: none;
      z-index: 0;
      opacity: 0.15;
    }

    /* Pill lọc trạng thái */
    .budget-filter-pill {
      padding: 0.5rem 0.85rem;
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
    }
    .budget-filter-pill:hover {
      color: var(--text-primary, #0f172a);
      transform: scale(1.02);
    }
    .budget-filter-pill.active {
      background: var(--bg-primary-soft, rgba(99, 102, 241, 0.15));
      color: var(--icon-active, #6366f1);
      border-color: color-mix(in srgb, var(--icon-active, #6366f1) 45%, transparent);
      box-shadow: 0 2px 10px -2px var(--theme-glow, rgba(99, 102, 241, 0.3));
    }

    /* Quick Pack Card */
    .budget-pack-card {
      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .budget-pack-card:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 10px 24px -6px rgba(0,0,0,0.18);
    }
  `;

  let styleEl = document.getElementById('budget-pro-styles');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'budget-pro-styles';
    styleEl.innerHTML = budgetStyles;
    document.head.appendChild(styleEl);
  }

  // ==============================================================
  // 2. ĐIỀU HƯỚNG THỜI GIAN & BỘ LỌC
  // ==============================================================
  window.changeBudgetMonth = function(dir) {
    window.budgetSelectedDate.setMonth(window.budgetSelectedDate.getMonth() + dir);
    renderBudgets();
    if (typeof playSound === 'function') playSound("click");
  };

  window.jumpBudgetToday = function() {
    window.budgetSelectedDate = new Date();
    renderBudgets();
    if (typeof playSound === 'function') playSound("pop");
  };

  window.setBudgetFilter = function(status) {
    window.budgetFilterStatus = status;
    renderBudgets();
    if (typeof playSound === 'function') playSound("click");
  };

  window.setBudgetSort = function(sortMode) {
    window.budgetSortMode = sortMode;
    renderBudgets();
  };

  window.onBudgetSearch = function(query) {
    window.budgetSearchQuery = (query || '').trim().toLowerCase();
    renderBudgets();
  };

  // ==============================================================
  // 3. TÍNH NĂNG 1-CLICK: TẠO GÓI NGÂN SÁCH MẪU (STARTER PACKS)
  // ==============================================================
  window.quickAddStarterBudget = function(categoryNameKeyword, defaultAmount, fallbackName, icon, color) {
    if (!state.budgets) state.budgets = [];

    // Tìm danh mục có sẵn khớp với từ khóa
    let cat = state.categories.find(c => 
      c.type !== 'income' && c.name.toLowerCase().includes(categoryNameKeyword.toLowerCase())
    );

    // Nếu người dùng chưa có danh mục này, tạo mới danh mục luôn
    if (!cat) {
      cat = {
        id: generateId(),
        name: fallbackName,
        type: 'expense',
        icon: icon || '💳',
        color: color || 'bg-indigo-100 text-indigo-500'
      };
      state.categories.push(cat);
    }

    // Kiểm tra xem đã có ngân sách cho danh mục này chưa
    const existing = state.budgets.find(b => b.categoryId === cat.id);
    if (existing) {
      if (confirm(`Danh mục "${cat.name}" đã có hạn mức ${formatMoney(existing.amount)}/tháng. Bạn có muốn đổi thành ${formatMoney(defaultAmount)} không?`)) {
        existing.amount = defaultAmount;
        saveData();
        renderBudgets();
        if (typeof playSound === 'function') playSound("click");
      }
      return;
    }

    // Tạo mới ngân sách
    state.budgets.push({
      id: generateId(),
      categoryId: cat.id,
      amount: defaultAmount
    });

    if (typeof addLog === 'function') {
      addLog("Tạo ngân sách", `${cat.name}: ${formatMoney(defaultAmount)}/tháng`);
    }

    saveData();
    renderBudgets();

    // Hiệu ứng pháo giấy confetti ăn mừng
    if (typeof confetti === 'function') {
      confetti({ particleCount: 45, spread: 60, origin: { y: 0.65 } });
    }
    if (typeof playSound === 'function') playSound("pop");
  };

  // ==============================================================
  // 4. TÍNH NĂNG TỰ ĐỘNG LẬP NGÂN SÁCH THEO THÁNG TRƯỚC (AI AUTO BUDGET)
  // ==============================================================
  window.autoGenerateBudgetsFromLastMonth = function() {
    const curMonth = window.budgetSelectedDate.getMonth();
    const curYear = window.budgetSelectedDate.getFullYear();

    // Tính tháng trước
    const lastMonthDate = new Date(curYear, curMonth - 1, 1);
    const lm = lastMonthDate.getMonth();
    const ly = lastMonthDate.getFullYear();

    // Lọc tất cả giao dịch chi tiêu tháng trước theo từng danh mục
    const catSpendMap = {};
    (state.transactions || []).forEach(t => {
      if (t.type === 'expense' && t.date) {
        const d = new Date(t.date);
        if (d.getMonth() === lm && d.getFullYear() === ly) {
          catSpendMap[t.category] = (catSpendMap[t.category] || 0) + (t.amount || 0);
        }
      }
    });

    const catIds = Object.keys(catSpendMap);
    if (catIds.length === 0) {
      alert(`Không tìm thấy dữ liệu chi tiêu trong Tháng ${lm + 1}/${ly} để phân tích! Bạn hãy tạo ngân sách thủ công hoặc chọn gói mẫu nhé.`);
      return;
    }

    let addedCount = 0;
    catIds.forEach(cId => {
      const spent = catSpendMap[cId];
      // Đề xuất ngân sách = chi tiêu thực tế + 10% biên an toàn, làm tròn đến hàng trăm nghìn
      const rawProposed = spent * 1.1;
      const roundedProposed = Math.max(200000, Math.ceil(rawProposed / 100000) * 100000);

      const existing = state.budgets.find(b => b.categoryId === cId);
      if (existing) {
        existing.amount = roundedProposed;
      } else {
        state.budgets.push({
          id: generateId(),
          categoryId: cId,
          amount: roundedProposed
        });
      }
      addedCount++;
    });

    saveData();
    renderBudgets();

    if (typeof confetti === 'function') {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    }
    if (typeof playSound === 'function') playSound("pop");

    alert(`🎉 Thành công! Đã tự động phân tích và tạo ${addedCount} hạn mức ngân sách thông minh dựa trên lịch sử Tháng ${lm + 1}/${ly}.`);
  };

  // ==============================================================
  // 5. MODAL CÔNG CỤ PHÂN BỔ 50/30/20 (FINTECH ASSET ALLOCATION)
  // ==============================================================
  window.openBudget503020Modal = function() {
    // Tính tổng thu nhập tháng hiện tại để gợi ý mức thu nhập
    const cm = window.budgetSelectedDate.getMonth();
    const cy = window.budgetSelectedDate.getFullYear();
    const totalMonthIncome = (state.transactions || [])
      .filter(t => t.type === 'income' && new Date(t.date).getMonth() === cm && new Date(t.date).getFullYear() === cy)
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const defaultIncome = totalMonthIncome > 0 ? totalMonthIncome : 15000000;

    let modal = document.getElementById('budget-503020-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'budget-503020-modal';
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md hidden';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="relative w-full max-w-xl custom-bg-card rounded-3xl p-5 sm:p-7 border custom-border custom-shadow-lg max-h-[90vh] overflow-y-auto custom-scrollbar animate-popIn">
        <!-- Close Button -->
        <button onclick="document.getElementById('budget-503020-modal').classList.add('hidden')" 
          class="absolute top-4 right-4 w-9 h-9 rounded-2xl custom-bg-input flex items-center justify-center custom-text-secondary hover:custom-text transition-all">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>

        <!-- Header -->
        <div class="flex items-center gap-3.5 mb-5">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center text-xl shadow-lg shadow-orange-500/25 shrink-0">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
          </div>
          <div>
            <h3 class="text-lg sm:text-xl font-black custom-text">Quy Tắc Ngân Sách 50/30/20</h3>
            <p class="text-xs custom-text-secondary">Phân bổ chuẩn quốc tế để tự do tài chính bền vững</p>
          </div>
        </div>

        <!-- Input Thu Nhập Hàng Tháng -->
        <div class="p-4 rounded-2xl custom-bg-input border custom-border mb-5">
          <label class="block text-xs font-bold custom-text-secondary uppercase mb-1.5">Tổng Thu Nhập Hàng Tháng (VNĐ)</label>
          <div class="relative">
            <input 
              type="text" 
              id="input-503020-income" 
              inputmode="numeric" 
              oninput="formatInputCurrency(event); update503020Preview();"
              value="${defaultIncome.toLocaleString('vi-VN')}" 
              class="w-full py-2.5 px-3 custom-bg-card rounded-xl text-xl font-black custom-text outline-none border custom-border focus:border-primary-500"
              placeholder="15.000.000"
            />
            <span class="absolute right-3 top-3 text-xs font-bold custom-text-secondary">VNĐ / Tháng</span>
          </div>
          <p class="text-[11px] custom-text-secondary mt-1.5 flex items-center gap-1">
            <i class="fa-solid fa-circle-info text-primary-500"></i> ${totalMonthIncome > 0 ? `Lấy tự động từ thu nhập thực tế Tháng ${cm+1}: ${formatMoney(totalMonthIncome)}` : 'Gợi ý mức thu nhập chuẩn để bắt đầu'}
          </p>
        </div>

        <!-- 3 Nhóm 50 / 30 / 20 Card Preview -->
        <div class="space-y-3 mb-6" id="preview-503020-bars">
          <!-- Dynamic JS update -->
        </div>

        <!-- CTA Apply Button -->
        <div class="flex gap-3">
          <button onclick="document.getElementById('budget-503020-modal').classList.add('hidden')"
            class="flex-1 py-3.5 rounded-2xl custom-bg-input font-bold text-sm custom-text hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
            Đóng
          </button>
          <button onclick="apply503020Budgets()"
            class="flex-[2] py-3.5 rounded-2xl custom-primary font-black text-sm text-white shadow-lg shadow-primary-500/30 active:scale-95 transition-all flex items-center justify-center gap-2">
            <i class="fa-solid fa-check-double"></i> Áp Dụng Ngân Sách Này
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    update503020Preview();
  };

  window.update503020Preview = function() {
    const rawVal = document.getElementById('input-503020-income')?.value || '0';
    const income = typeof getRawNumber === 'function' ? getRawNumber(rawVal) : parseInt(rawVal.replace(/\D/g, '') || 0);

    const needs = income * 0.5;
    const wants = income * 0.3;
    const savings = income * 0.2;

    const container = document.getElementById('preview-503020-bars');
    if (!container) return;

    container.innerHTML = `
      <!-- 50% Nhu cầu thiết yếu -->
      <div class="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs font-black text-blue-500 flex items-center gap-1.5">
            <i class="fa-solid fa-house-chimney"></i> 50% Thiết Yếu (Needs)
          </span>
          <span class="text-sm font-black custom-text">${formatMoney(needs)}</span>
        </div>
        <p class="text-[11px] custom-text-secondary leading-snug">Ăn uống, thuê nhà, điện nước, xăng xe, y tế...</p>
      </div>

      <!-- 30% Mong muốn -->
      <div class="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs font-black text-purple-500 flex items-center gap-1.5">
            <i class="fa-solid fa-bag-shopping"></i> 30% Mong Muốn (Wants)
          </span>
          <span class="text-sm font-black custom-text">${formatMoney(wants)}</span>
        </div>
        <p class="text-[11px] custom-text-secondary leading-snug">Mua sắm cá nhân, giải trí, cà phê, du lịch, xem phim...</p>
      </div>

      <!-- 20% Tiết kiệm & Tích luỹ -->
      <div class="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs font-black text-emerald-500 flex items-center gap-1.5">
            <i class="fa-solid fa-piggy-bank"></i> 20% Tiết Kiệm (Savings)
          </span>
          <span class="text-sm font-black custom-text">${formatMoney(savings)}</span>
        </div>
        <p class="text-[11px] custom-text-secondary leading-snug">Quỹ khẩn cấp, tiết kiệm mua nhà/xe, đầu tư tương lai...</p>
      </div>
    `;
  };

  window.apply503020Budgets = function() {
    const rawVal = document.getElementById('input-503020-income')?.value || '0';
    const income = typeof getRawNumber === 'function' ? getRawNumber(rawVal) : parseInt(rawVal.replace(/\D/g, '') || 0);
    if (income <= 0) {
      alert("Vui lòng nhập mức thu nhập hợp lệ!");
      return;
    }

    const needs = income * 0.5;
    const wants = income * 0.3;

    // Phân bổ danh mục thiết yếu mẫu:
    // Ăn uống: 50% của needs; Tiền nhà/Hóa đơn: 30% của needs; Di chuyển: 20% của needs
    const foodCat = state.categories.find(c => c.type !== 'income' && (c.name.toLowerCase().includes('ăn') || c.name.toLowerCase().includes('food')));
    const homeCat = state.categories.find(c => c.type !== 'income' && (c.name.toLowerCase().includes('hóa đơn') || c.name.toLowerCase().includes('nhà') || c.name.toLowerCase().includes('bill')));
    const transCat = state.categories.find(c => c.type !== 'income' && (c.name.toLowerCase().includes('di chuyển') || c.name.toLowerCase().includes('xe')));
    
    // Phân bổ mong muốn:
    // Mua sắm: 60% của wants; Giải trí: 40% của wants
    const shopCat = state.categories.find(c => c.type !== 'income' && (c.name.toLowerCase().includes('mua') || c.name.toLowerCase().includes('shop')));
    const entCat = state.categories.find(c => c.type !== 'income' && (c.name.toLowerCase().includes('giải trí') || c.name.toLowerCase().includes('chơi')));

    function upsertBudget(catId, amount) {
      if (!catId) return;
      const b = state.budgets.find(b => b.categoryId === catId);
      if (b) {
        b.amount = amount;
      } else {
        state.budgets.push({ id: generateId(), categoryId: catId, amount: amount });
      }
    }

    if (foodCat) upsertBudget(foodCat.id, Math.round(needs * 0.55));
    if (transCat) upsertBudget(transCat.id, Math.round(needs * 0.25));
    if (homeCat) upsertBudget(homeCat.id, Math.round(needs * 0.20));

    if (shopCat) upsertBudget(shopCat.id, Math.round(wants * 0.60));
    if (entCat) upsertBudget(entCat.id, Math.round(wants * 0.40));

    saveData();
    renderBudgets();

    document.getElementById('budget-503020-modal').classList.add('hidden');

    if (typeof confetti === 'function') {
      confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
    }
    if (typeof playSound === 'function') playSound("pop");

    alert("✨ Tuyệt vời! Đã áp dụng phân bổ ngân sách 50/30/20 tự động vào các danh mục của bạn!");
  };

  // ==============================================================
  // 6. MODAL XEM CHI TIẾT TỪNG GIAO DỊCH TRONG NGÂN SÁCH DANH MỤC
  // ==============================================================
  window.showBudgetTxDetail = function(categoryId) {
    const cat = state.categories.find(c => c.id === categoryId);
    if (!cat) return;

    const cm = window.budgetSelectedDate.getMonth();
    const cy = window.budgetSelectedDate.getFullYear();

    const txs = (state.transactions || []).filter(t => 
      t.type === 'expense' && 
      t.category === categoryId && 
      new Date(t.date).getMonth() === cm && 
      new Date(t.date).getFullYear() === cy
    );

    // Sắp xếp ngày mới nhất lên đầu
    txs.sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalSpent = txs.reduce((sum, t) => sum + (t.amount || 0), 0);
    const budgetObj = state.budgets.find(b => b.categoryId === categoryId);
    const budgetAmt = budgetObj ? budgetObj.amount : 0;

    let modal = document.getElementById('budget-tx-detail-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'budget-tx-detail-modal';
      modal.className = 'fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md hidden';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="relative w-full max-w-xl custom-bg-card rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 border custom-border custom-shadow-lg max-h-[85vh] flex flex-col animate-slideUpSheet sm:animate-popIn">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b custom-border shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl ${cat.color || 'bg-gray-200'} flex items-center justify-center text-xl border custom-border shadow-sm">
              ${cat.icon || '📦'}
            </div>
            <div>
              <h3 class="font-black text-base sm:text-lg custom-text">${cat.name}</h3>
              <p class="text-xs custom-text-secondary">Chi tiêu Tháng ${cm + 1}/${cy}</p>
            </div>
          </div>
          <button onclick="document.getElementById('budget-tx-detail-modal').classList.add('hidden')" 
            class="w-9 h-9 rounded-2xl custom-bg-input flex items-center justify-center custom-text-secondary hover:custom-text transition-all">
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <!-- Quick Summary Bar -->
        <div class="my-4 p-3.5 rounded-2xl custom-bg-input border custom-border flex items-center justify-between shrink-0">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider custom-text-secondary block">Đã chi tiêu</span>
            <span class="text-base font-black text-rose-500">${formatMoney(totalSpent)}</span>
          </div>
          <div class="text-right">
            <span class="text-[10px] font-bold uppercase tracking-wider custom-text-secondary block">Hạn mức</span>
            <span class="text-base font-black custom-text">${formatMoney(budgetAmt)}</span>
          </div>
        </div>

        <!-- Danh sách giao dịch -->
        <div class="overflow-y-auto custom-scrollbar flex-1 space-y-2.5 pr-1">
          ${txs.length === 0 ? `
            <div class="text-center py-12 custom-text-secondary">
              <i class="fa-regular fa-folder-open text-4xl mb-3 opacity-40"></i>
              <p class="text-sm font-medium">Chưa có giao dịch nào trong tháng ${cm+1}/${cy}.</p>
            </div>
          ` : txs.map(t => {
            const dateStr = new Date(t.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const wallet = state.wallets.find(w => w.id === t.walletId);
            return `
              <div onclick="document.getElementById('budget-tx-detail-modal').classList.add('hidden'); if(typeof openModal === 'function') openModal('transaction', '${t.id}');"
                class="p-3.5 rounded-2xl custom-bg-card border custom-border hover:border-primary-500/50 flex items-center justify-between cursor-pointer group active:scale-[0.99] transition-all">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl custom-bg-input text-rose-500 flex items-center justify-center text-sm font-black">
                    <i class="fa-solid fa-arrow-up-right"></i>
                  </div>
                  <div>
                    <div class="text-sm font-bold custom-text group-hover:text-primary-500 transition-colors">${t.note || cat.name}</div>
                    <div class="text-[11px] custom-text-secondary flex items-center gap-2 mt-0.5">
                      <span><i class="fa-regular fa-calendar text-[10px]"></i> ${dateStr}</span>
                      ${wallet ? `<span>• <i class="fa-solid fa-wallet text-[10px]"></i> ${wallet.name}</span>` : ''}
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-sm font-black text-rose-500">-${formatMoney(t.amount)}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Footer -->
        <div class="pt-3 border-t custom-border mt-3 shrink-0 flex gap-2.5">
          <button onclick="document.getElementById('budget-tx-detail-modal').classList.add('hidden'); openModal('budget', '${budgetObj ? budgetObj.id : ''}');" 
            class="flex-1 py-3 rounded-xl custom-bg-input custom-text font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-pen text-[11px]"></i> Sửa Hạn Mức
          </button>
          <button onclick="document.getElementById('budget-tx-detail-modal').classList.add('hidden');" 
            class="flex-1 py-3 rounded-xl custom-primary text-white font-bold text-xs active:scale-95 transition-all">
            Đóng
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
  };

  // ==============================================================
  // 7. HÀM CHÍNH: RENDER TOÀN BỘ GIAO DIỆN QUẢN LÝ NGÂN SÁCH (BENTO LIQUID)
  // ==============================================================
  window.renderBudgets = function() {
    const root = document.getElementById("view-budgets");
    if (!root) return;

    // Lấy thông tin tháng được chọn
    const selDate = window.budgetSelectedDate || new Date();
    const cm = selDate.getMonth();
    const cy = selDate.getFullYear();

    const now = new Date();
    const isThisMonth = (now.getMonth() === cm && now.getFullYear() === cy);
    const totalDaysInMonth = new Date(cy, cm + 1, 0).getDate();
    const currentDay = isThisMonth ? now.getDate() : (selDate < now ? totalDaysInMonth : 1);
    const daysRemaining = Math.max(1, totalDaysInMonth - currentDay + 1);
    const monthTimePct = Math.min(100, Math.round((currentDay / totalDaysInMonth) * 100));

    // Đảm bảo state.budgets luôn là mảng
    if (!state.budgets) state.budgets = [];

    // Tính toán chi tiêu cho từng ngân sách trong tháng được chọn
    let totalBudgeted = 0;
    let totalSpent = 0;
    let safeCount = 0;
    let warningCount = 0;
    let dangerCount = 0;

    const budgetMetrics = state.budgets.map(b => {
      const cat = state.categories.find(c => c.id === b.categoryId) || {
        name: "Danh mục đã xóa",
        icon: "📦",
        color: "bg-gray-200 text-gray-500"
      };

      const spent = (state.transactions || [])
        .filter(t => 
          t.category === b.categoryId &&
          t.type === "expense" &&
          t.date &&
          new Date(t.date).getMonth() === cm &&
          new Date(t.date).getFullYear() === cy
        )
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const txCount = (state.transactions || []).filter(t => 
        t.category === b.categoryId &&
        t.type === "expense" &&
        t.date &&
        new Date(t.date).getMonth() === cm &&
        new Date(t.date).getFullYear() === cy
      ).length;

      const pct = b.amount > 0 ? (spent / b.amount) * 100 : 100;
      const remaining = b.amount - spent;
      const dailyAllowance = remaining > 0 ? Math.round(remaining / daysRemaining) : 0;

      let status = 'safe';
      if (pct >= 100) {
        status = 'danger';
        dangerCount++;
      } else if (pct >= 80) {
        status = 'warning';
        warningCount++;
      } else {
        safeCount++;
      }

      totalBudgeted += b.amount;
      totalSpent += spent;

      return {
        ...b,
        cat,
        spent,
        pct,
        remaining,
        dailyAllowance,
        status,
        txCount
      };
    });

    const totalRemaining = totalBudgeted - totalSpent;
    const overallPct = totalBudgeted > 0 ? Math.min(100, (totalSpent / totalBudgeted) * 100).toFixed(1) : 0;
    const overallActualPct = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;
    const overallDailyAllowance = totalRemaining > 0 ? Math.round(totalRemaining / daysRemaining) : 0;

    // Phân tích nhịp độ chi tiêu thông minh
    let paceIcon = "fa-shield-halved text-emerald-500";
    let paceTitle = "Chi tiêu rất an toàn & chuẩn kế hoạch";
    let paceDesc = `Đã trôi qua <b>${monthTimePct}%</b> tháng. Bạn còn có thể chi an toàn tối đa <b>${formatMoney(overallDailyAllowance)}/ngày</b>.`;
    let paceBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">An toàn</span>`;

    if (overallActualPct >= 100) {
      paceIcon = "fa-triangle-exclamation text-rose-500 animate-pulse";
      paceTitle = "Báo động: Đã vượt tổng hạn mức tháng!";
      paceDesc = `Tổng chi đã vượt <b>${formatMoney(Math.abs(totalRemaining))}</b> so với ngân sách dự trù. Hãy tiết giảm chi tiêu ngay!`;
      paceBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-500 border border-rose-500/30">Bội chi</span>`;
    } else if (overallActualPct > monthTimePct + 12) {
      paceIcon = "fa-fire-flame-curved text-amber-500";
      paceTitle = "Cảnh báo tốc độ: Tiêu nhanh hơn ngày trôi qua!";
      paceDesc = `Đã dùng <b>${overallActualPct}%</b> ngân sách nhưng mới qua <b>${monthTimePct}%</b> thời gian. Nên giảm xuống còn <b>${formatMoney(overallDailyAllowance)}/ngày</b>.`;
      paceBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-500 border border-amber-500/30">Hơi nhanh</span>`;
    }

    // Lọc theo search & filter status
    let filteredBudgets = budgetMetrics.filter(b => {
      // Lọc trạng thái
      if (window.budgetFilterStatus !== 'all' && b.status !== window.budgetFilterStatus) return false;
      // Lọc tìm kiếm
      if (window.budgetSearchQuery) {
        const q = window.budgetSearchQuery;
        const nameMatch = b.cat.name.toLowerCase().includes(q);
        if (!nameMatch) return false;
      }
      return true;
    });

    // Sắp xếp
    filteredBudgets.sort((a, b) => {
      if (window.budgetSortMode === 'spent_desc') return b.spent - a.spent;
      if (window.budgetSortMode === 'amount_desc') return b.amount - a.amount;
      if (window.budgetSortMode === 'remaining_asc') return a.remaining - b.remaining;
      if (window.budgetSortMode === 'name_asc') return a.cat.name.localeCompare(b.cat.name);
      return b.pct - a.pct; // default pct_desc
    });

    // ==============================================================
    // BẮT ĐẦU DỰNG HTML
    // ==============================================================
    let html = `
      <div class="space-y-4 sm:space-y-5 pb-24">
        
        <!-- 1. SPATIAL TOP HERO HEADER (Bar nổi trên cùng) -->
        <header class="flex items-center justify-between gap-2 p-2 rounded-2xl sm:rounded-3xl custom-bg-card border custom-border custom-shadow-sm">
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black bg-primary-500/15 text-primary-500 border border-primary-500/25">
              <i class="fa-solid fa-bullseye"></i> <span class="hidden sm:inline">Ngân Sách</span>
            </span>
          </div>

          <!-- Bộ Chuyển Tháng Thông Minh -->
          <div class="flex items-center gap-1 custom-bg-input p-1 rounded-2xl border custom-border">
            <button onclick="changeBudgetMonth(-1)" class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center custom-text-secondary hover:custom-text active:scale-90 transition-all">
              <i class="fa-solid fa-chevron-left text-xs"></i>
            </button>
            <button onclick="jumpBudgetToday()" class="px-2 sm:px-3 text-xs sm:text-sm font-black custom-text hover:text-primary-500 transition-colors flex items-center gap-1.5" title="Nhấp để về tháng hiện tại">
              <span>Tháng ${cm + 1}/${cy}</span>
              ${isThisMonth ? `<span class="w-2 h-2 rounded-full bg-emerald-500"></span>` : `<span class="text-[10px] font-bold text-amber-500">Lịch sử</span>`}
            </button>
            <button onclick="changeBudgetMonth(1)" class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center custom-text-secondary hover:custom-text active:scale-90 transition-all">
              <i class="fa-solid fa-chevron-right text-xs"></i>
            </button>
          </div>

          <!-- Nút Hành Động Nhanh -->
          <div class="flex items-center gap-1.5">
            <button onclick="openBudget503020Modal()" 
              class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-orange-500 border border-orange-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shrink-0" 
              title="Phân bổ 50/30/20">
              <i class="fa-solid fa-wand-magic-sparkles text-sm sm:text-base"></i>
            </button>
            <button onclick="openModal('budget')" 
              class="py-2.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl custom-primary text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-primary-500/25 hover:scale-105 active:scale-95 transition-all shrink-0">
              <i class="fa-solid fa-plus"></i> <span class="hidden sm:inline">Tạo Mới</span>
            </button>
          </div>
        </header>
    `;

    // NẾU CHƯA CÓ NGÂN SÁCH NÀO ĐƯỢC TẠO
    if (state.budgets.length === 0) {
      html += `
        <!-- EMPTY STATE HIỆN ĐẠI & GỢI Ý 1-CLICK -->
        <div class="relative overflow-hidden rounded-3xl p-6 sm:p-10 text-center budget-bento-glass">
          <!-- Background Glow Aura -->
          <div class="budget-aura-glow bg-primary-500 w-80 h-80 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
          
          <div class="relative z-10 max-w-lg mx-auto">
            <!-- Icon 3D / Vector lộng lẫy -->
            <div class="w-24 h-24 mx-auto mb-5 rounded-3xl bg-gradient-to-tr from-primary-500/20 via-primary-500/10 to-transparent border border-primary-500/30 flex items-center justify-center text-4xl shadow-xl shadow-primary-500/20">
              <span class="drop-shadow-lg">📊</span>
            </div>

            <h2 class="text-xl sm:text-2xl font-black custom-text mb-2.5 tracking-tight">
              Chưa Có Hạn Mức Ngân Sách Nào
            </h2>

            <p class="text-xs sm:text-sm custom-text-secondary leading-relaxed mb-6">
              Thiết lập ngân sách giúp bạn kiểm soát dòng tiền, tránh bội chi và tiết kiệm đều đặn mỗi tháng. Hãy bắt đầu ngay chỉ với 1 cú click!
            </p>

            <!-- Nút Tạo Ngân Sách Chính -->
            <div class="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <button onclick="openModal('budget')" 
                class="w-full sm:w-auto py-3.5 px-6 rounded-2xl custom-primary text-white font-black text-sm shadow-xl shadow-primary-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                <i class="fa-solid fa-plus"></i> Thiết Lập Ngân Sách Đầu Tiên
              </button>
              <button onclick="autoGenerateBudgetsFromLastMonth()" 
                class="w-full sm:w-auto py-3.5 px-5 rounded-2xl custom-bg-input border custom-border font-bold text-xs sm:text-sm custom-text hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                <i class="fa-solid fa-clock-rotate-left text-amber-500"></i> Quét Chi Tiêu Tháng Trước
              </button>
            </div>

            <!-- Gợi ý Bộ Mẫu 1-Click (Starter Packs) -->
            <div class="border-t custom-border pt-6 text-left">
              <div class="flex items-center justify-between mb-3.5">
                <span class="text-xs font-black uppercase tracking-wider custom-text-secondary flex items-center gap-1.5">
                  <i class="fa-solid fa-bolt text-amber-500"></i> Gói Hạn Mức Gợi Ý Khởi Đầu (1-Click)
                </span>
                <span class="text-[11px] text-primary-500 font-bold cursor-pointer hover:underline" onclick="openBudget503020Modal()">
                  Xem quy tắc 50/30/20
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <!-- Pack 1: Ăn uống -->
                <div onclick="quickAddStarterBudget('ăn', 3000000, 'Ăn uống', '🍔', 'bg-orange-100 text-orange-500')"
                  class="budget-pack-card p-3.5 rounded-2xl custom-bg-card border custom-border cursor-pointer flex items-center justify-between group">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center text-lg">🍔</div>
                    <div>
                      <div class="text-sm font-bold custom-text group-hover:text-primary-500 transition-colors">Ăn uống & Cà phê</div>
                      <div class="text-[11px] custom-text-secondary">3.000.000 ₫ / tháng</div>
                    </div>
                  </div>
                  <span class="w-8 h-8 rounded-xl custom-bg-input flex items-center justify-center text-xs custom-text-secondary group-hover:bg-primary-500 group-hover:text-white transition-all">
                    <i class="fa-solid fa-plus"></i>
                  </span>
                </div>

                <!-- Pack 2: Di chuyển -->
                <div onclick="quickAddStarterBudget('di chuyển', 800000, 'Di chuyển', '🚗', 'bg-blue-100 text-blue-500')"
                  class="budget-pack-card p-3.5 rounded-2xl custom-bg-card border custom-border cursor-pointer flex items-center justify-between group">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center text-lg">🚗</div>
                    <div>
                      <div class="text-sm font-bold custom-text group-hover:text-primary-500 transition-colors">Xăng xe & Đi lại</div>
                      <div class="text-[11px] custom-text-secondary">800.000 ₫ / tháng</div>
                    </div>
                  </div>
                  <span class="w-8 h-8 rounded-xl custom-bg-input flex items-center justify-center text-xs custom-text-secondary group-hover:bg-primary-500 group-hover:text-white transition-all">
                    <i class="fa-solid fa-plus"></i>
                  </span>
                </div>

                <!-- Pack 3: Mua sắm -->
                <div onclick="quickAddStarterBudget('mua sắm', 1500000, 'Mua sắm', '🛍️', 'bg-pink-100 text-pink-500')"
                  class="budget-pack-card p-3.5 rounded-2xl custom-bg-card border custom-border cursor-pointer flex items-center justify-between group">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-pink-500/15 text-pink-500 flex items-center justify-center text-lg">🛍️</div>
                    <div>
                      <div class="text-sm font-bold custom-text group-hover:text-primary-500 transition-colors">Mua sắm đồ dùng</div>
                      <div class="text-[11px] custom-text-secondary">1.500.000 ₫ / tháng</div>
                    </div>
                  </div>
                  <span class="w-8 h-8 rounded-xl custom-bg-input flex items-center justify-center text-xs custom-text-secondary group-hover:bg-primary-500 group-hover:text-white transition-all">
                    <i class="fa-solid fa-plus"></i>
                  </span>
                </div>

                <!-- Pack 4: Hóa đơn -->
                <div onclick="quickAddStarterBudget('hóa đơn', 2000000, 'Hóa đơn & Tiền nhà', '🏠', 'bg-emerald-100 text-emerald-500')"
                  class="budget-pack-card p-3.5 rounded-2xl custom-bg-card border custom-border cursor-pointer flex items-center justify-between group">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-lg">🏠</div>
                    <div>
                      <div class="text-sm font-bold custom-text group-hover:text-primary-500 transition-colors">Hóa đơn & Nhà cửa</div>
                      <div class="text-[11px] custom-text-secondary">2.000.000 ₫ / tháng</div>
                    </div>
                  </div>
                  <span class="w-8 h-8 rounded-xl custom-bg-input flex items-center justify-center text-xs custom-text-secondary group-hover:bg-primary-500 group-hover:text-white transition-all">
                    <i class="fa-solid fa-plus"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      // CÓ DỮ LIỆU NGÂN SÁCH -> RENDER BENTO CHỈ HUY VÀ DANH SÁCH THẺ

      // 2. HERO LIQUID BENTO: BẢNG CHỈ HUY SỨC KHỎE NGÂN SÁCH (Executive Health Hub)
      const progressBarColor = overallActualPct >= 100 
        ? 'bg-gradient-to-r from-orange-500 via-rose-500 to-red-600'
        : (overallActualPct >= 80 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-teal-400 via-emerald-500 to-primary-500');

      html += `
        <div class="budget-bento-glass rounded-3xl p-5 sm:p-6 custom-shadow-md">
          <!-- Hàng 3 KPI Chính -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 mb-5">
            <!-- Tổng hạn mức -->
            <div class="p-4 rounded-2xl custom-bg-input border custom-border flex flex-col justify-between">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] font-black uppercase tracking-wider custom-text-secondary">Tổng Ngân Sách</span>
                <div class="w-7 h-7 rounded-xl bg-primary-500/15 text-primary-500 flex items-center justify-center text-xs font-black">
                  <i class="fa-solid fa-wallet"></i>
                </div>
              </div>
              <div class="text-xl sm:text-2xl font-black custom-text tracking-tight truncate">${formatMoney(totalBudgeted)}</div>
              <div class="text-[10px] font-bold custom-text-secondary mt-1">${state.budgets.length} danh mục theo dõi</div>
            </div>

            <!-- Thực tế đã tiêu -->
            <div class="p-4 rounded-2xl custom-bg-input border custom-border flex flex-col justify-between">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] font-black uppercase tracking-wider text-rose-500">Đã Chi Tiêu</span>
                <div class="w-7 h-7 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center text-xs font-black">
                  <i class="fa-solid fa-arrow-trend-up"></i>
                </div>
              </div>
              <div class="text-xl sm:text-2xl font-black text-rose-500 tracking-tight truncate">${formatMoney(totalSpent)}</div>
              <div class="text-[10px] font-bold custom-text-secondary mt-1">Đã dùng ${overallPct}% ngân sách</div>
            </div>

            <!-- Còn lại / Bội chi -->
            <div class="p-4 rounded-2xl custom-bg-input border custom-border flex flex-col justify-between">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] font-black uppercase tracking-wider ${totalRemaining >= 0 ? 'text-emerald-500' : 'text-red-500'}">
                  ${totalRemaining >= 0 ? 'Còn Khả Dụng' : 'Đã Bội Chi'}
                </span>
                <div class="w-7 h-7 rounded-xl ${totalRemaining >= 0 ? 'bg-emerald-500/15 text-emerald-500' : 'bg-red-500/15 text-red-500'} flex items-center justify-center text-xs font-black">
                  <i class="fa-solid ${totalRemaining >= 0 ? 'fa-piggy-bank' : 'fa-skull-crossbones'}"></i>
                </div>
              </div>
              <div class="text-xl sm:text-2xl font-black ${totalRemaining >= 0 ? 'text-emerald-500' : 'text-red-500'} tracking-tight truncate">
                ${totalRemaining >= 0 ? formatMoney(totalRemaining) : '-' + formatMoney(Math.abs(totalRemaining))}
              </div>
              <div class="text-[10px] font-bold custom-text-secondary mt-1">
                ${totalRemaining >= 0 ? `Chi tối đa: ${formatMoney(overallDailyAllowance)}/ngày` : 'Đã cạn hạn mức!'}
              </div>
            </div>
          </div>

          <!-- Thanh Đo Macro Liquid Shimmer Progress -->
          <div class="mb-5">
            <div class="flex justify-between items-center text-xs font-bold mb-2">
              <span class="custom-text flex items-center gap-1.5">
                <i class="fa-solid fa-chart-simple text-primary-500"></i> Tiến độ chi tiêu tổng thể
              </span>
              <span class="custom-text font-black">${overallActualPct}% (${formatMoney(totalSpent)} / ${formatMoney(totalBudgeted)})</span>
            </div>

            <!-- Thanh Bar 2 lớp -->
            <div class="relative h-4 w-full custom-bg-body rounded-full overflow-hidden border custom-border">
              <!-- Vạch mốc thời gian trong tháng (Current Day Marker) -->
              <div class="absolute inset-y-0 w-0.5 bg-white/70 z-20 shadow-[0_0_8px_#ffffff]" 
                style="left: ${monthTimePct}%;" 
                title="Hôm nay: Ngày ${currentDay}/${totalDaysInMonth} (${monthTimePct}%)">
              </div>

              <!-- Thanh tiến độ chi tiêu thực tế -->
              <div class="h-full rounded-full budget-shimmer-bar transition-all duration-700 ${progressBarColor}" 
                style="width: ${Math.min(overallActualPct, 100)}%;">
              </div>
            </div>

            <div class="flex justify-between items-center text-[10px] font-semibold custom-text-secondary mt-1.5 px-0.5">
              <span>0% (Bắt đầu)</span>
              <span class="text-primary-500 font-bold">Vạch trắng: Tiến độ ngày (${monthTimePct}%)</span>
              <span>100% (Hạn mức)</span>
            </div>
          </div>

          <!-- Nhận xét thông minh & Khuyến nghị nhịp độ (Smart Pacing Banner) -->
          <div class="p-3.5 rounded-2xl custom-bg-input border custom-border flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="text-xl sm:text-2xl shrink-0">
                <i class="fa-solid ${paceIcon}"></i>
              </div>
              <div>
                <div class="text-xs sm:text-sm font-black custom-text flex items-center gap-2">
                  <span>${paceTitle}</span>
                  ${paceBadge}
                </div>
                <div class="text-[11px] custom-text-secondary leading-snug mt-0.5">${paceDesc}</div>
              </div>
            </div>

            <!-- Thống kê nhanh trạng thái thẻ -->
            <div class="hidden md:flex items-center gap-2 shrink-0">
              <span class="px-2 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 text-[11px] font-black" title="An toàn">
                🟢 ${safeCount}
              </span>
              <span class="px-2 py-1 rounded-xl bg-amber-500/10 text-amber-500 text-[11px] font-black" title="Cảnh báo">
                🟡 ${warningCount}
              </span>
              <span class="px-2 py-1 rounded-xl bg-rose-500/10 text-rose-500 text-[11px] font-black" title="Bội chi">
                🔴 ${dangerCount}
              </span>
            </div>
          </div>
        </div>

        <!-- 3. BỘ CÔNG CỤ TÌM KIẾM, LỌC & SẮP XẾP -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <!-- Ô Tìm kiếm -->
          <div class="relative flex-1">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs custom-text-secondary"></i>
            <input 
              type="text" 
              placeholder="Tìm kiếm danh mục ngân sách..." 
              value="${window.budgetSearchQuery || ''}"
              oninput="onBudgetSearch(this.value)"
              class="w-full pl-9 pr-8 py-2.5 rounded-2xl custom-bg-card border custom-border text-xs sm:text-sm font-bold custom-text outline-none focus:border-primary-500 transition-all"
            />
            ${window.budgetSearchQuery ? `
              <button onclick="onBudgetSearch('')" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs custom-text-secondary hover:custom-text">
                <i class="fa-solid fa-circle-xmark"></i>
              </button>
            ` : ''}
          </div>

          <!-- Bộ Lọc Pills -->
          <div class="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            <button onclick="setBudgetFilter('all')" class="budget-filter-pill ${window.budgetFilterStatus === 'all' ? 'active' : ''}">
              Tất cả (${budgetMetrics.length})
            </button>
            <button onclick="setBudgetFilter('safe')" class="budget-filter-pill ${window.budgetFilterStatus === 'safe' ? 'active' : ''}">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> An toàn (${safeCount})
            </button>
            <button onclick="setBudgetFilter('warning')" class="budget-filter-pill ${window.budgetFilterStatus === 'warning' ? 'active' : ''}">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Cảnh báo (${warningCount})
            </button>
            <button onclick="setBudgetFilter('danger')" class="budget-filter-pill ${window.budgetFilterStatus === 'danger' ? 'active' : ''}">
              <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Bội chi (${dangerCount})
            </button>
          </div>

          <!-- Sắp xếp Dropdown -->
          <select onchange="setBudgetSort(this.value)" class="py-2.5 px-3 rounded-2xl custom-bg-card border custom-border text-xs font-bold custom-text outline-none shrink-0">
            <option value="pct_desc" ${window.budgetSortMode === 'pct_desc' ? 'selected' : ''}>% Tiêu nhiều nhất</option>
            <option value="spent_desc" ${window.budgetSortMode === 'spent_desc' ? 'selected' : ''}>Số tiền chi nhiều nhất</option>
            <option value="remaining_asc" ${window.budgetSortMode === 'remaining_asc' ? 'selected' : ''}>Còn lại ít tiền nhất</option>
            <option value="amount_desc" ${window.budgetSortMode === 'amount_desc' ? 'selected' : ''}>Hạn mức lớn nhất</option>
            <option value="name_asc" ${window.budgetSortMode === 'name_asc' ? 'selected' : ''}>Tên danh mục A-Z</option>
          </select>
        </div>

        <!-- 4. DANH SÁCH THẺ NGÂN SÁCH BENTO (Cards Grid) -->
        <div id="budgets-container" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      `;

      if (filteredBudgets.length === 0) {
        html += `
          <div class="col-span-full py-12 text-center budget-bento-glass rounded-3xl">
            <i class="fa-solid fa-filter-circle-xmark text-4xl custom-text-secondary opacity-40 mb-3 block"></i>
            <h4 class="text-base font-bold custom-text">Không tìm thấy ngân sách phù hợp</h4>
            <p class="text-xs custom-text-secondary mt-1">Hãy thử xóa bộ lọc tìm kiếm hoặc chọn danh mục khác nhé.</p>
          </div>
        `;
      } else {
        filteredBudgets.forEach(b => {
          const isDanger = b.pct >= 100;
          const isWarning = b.pct >= 80 && b.pct < 100;
          const cardClass = isDanger ? 'budget-card-overspent' : '';

          const barGrad = isDanger 
            ? 'bg-gradient-to-r from-rose-500 to-red-600' 
            : (isWarning ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-teal-400 to-emerald-500');

          const badgePill = isDanger 
            ? `<span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-500 border border-rose-500/30 flex items-center gap-1">
                 <i class="fa-solid fa-triangle-exclamation"></i> Vượt ${formatCompactMoney(Math.abs(b.remaining))}
               </span>`
            : (isWarning 
                ? `<span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-500 border border-amber-500/30">
                     Sắp hết (Còn ${formatCompactMoney(b.remaining)})
                   </span>`
                : `<span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                     Còn ${formatCompactMoney(b.remaining)}
                   </span>`);

          html += `
            <div class="budget-bento-glass rounded-3xl p-5 ${cardClass} flex flex-col justify-between">
              <!-- Top Row: Icon + Tên Danh Mục + Action Buttons -->
              <div>
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-2xl ${b.cat.color || 'bg-gray-200'} flex items-center justify-center text-2xl border custom-border shadow-sm shrink-0">
                      ${b.cat.icon || '📦'}
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <h4 class="font-black text-base custom-text leading-tight">${b.cat.name}</h4>
                      </div>
                      <p class="text-[11px] custom-text-secondary mt-0.5">
                        <i class="fa-regular fa-clock text-[10px]"></i> ${b.txCount} giao dịch tháng này
                      </p>
                    </div>
                  </div>

                  <!-- Status Badge -->
                  <div class="shrink-0">
                    ${badgePill}
                  </div>
                </div>

                <!-- Số Tiền: Đã tiêu / Hạn Mức -->
                <div class="flex items-baseline justify-between mb-2">
                  <div>
                    <span class="text-[10px] font-bold uppercase tracking-wider custom-text-secondary block">Đã chi</span>
                    <span class="text-lg font-black ${isDanger ? 'text-rose-500' : 'custom-text'}">${formatMoney(b.spent)}</span>
                  </div>
                  <div class="text-right">
                    <span class="text-[10px] font-bold uppercase tracking-wider custom-text-secondary block">Hạn mức tháng</span>
                    <span class="text-sm font-black custom-text-secondary">${formatMoney(b.amount)}</span>
                  </div>
                </div>

                <!-- Progress Bar động Liquid -->
                <div class="relative h-3 w-full custom-bg-body rounded-full overflow-hidden border custom-border mb-3">
                  <div class="h-full rounded-full budget-shimmer-bar transition-all duration-700 ${barGrad}" 
                    style="width: ${Math.min(b.pct, 100)}%;">
                  </div>
                </div>

                <!-- Hàng Thống Kê Nhịp Độ Ngày -->
                <div class="p-2.5 rounded-xl custom-bg-input border custom-border flex items-center justify-between text-[11px] font-bold mb-4">
                  <span class="custom-text-secondary flex items-center gap-1.5">
                    <i class="fa-solid fa-calendar-day text-primary-500"></i>
                    ${isDanger ? 'Hết hạn mức ngày' : `Còn lại: ${b.remaining > 0 ? formatMoney(b.dailyAllowance) + '/ngày' : '0 ₫'}`}
                  </span>
                  <span class="${isDanger ? 'text-rose-500' : 'text-primary-500'} font-black">
                    Đã dùng ${b.pct.toFixed(1)}%
                  </span>
                </div>
              </div>

              <!-- Bottom Actions Bar: Xem Chi Tiết Giao Dịch, Sửa, Xóa -->
              <div class="pt-3 border-t custom-border flex items-center justify-between gap-2">
                <button onclick="showBudgetTxDetail('${b.categoryId}')" 
                  class="flex-1 py-2 px-3 rounded-xl custom-bg-input text-xs font-bold custom-text hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  title="Xem các giao dịch tháng này">
                  <i class="fa-solid fa-list-ul text-[11px] text-primary-500"></i> Xem giao dịch
                </button>

                <div class="flex items-center gap-1.5">
                  <button onclick="openModal('budget', '${b.id}')" 
                    class="w-9 h-9 rounded-xl custom-bg-input text-xs font-bold custom-text-secondary hover:custom-text active:scale-90 transition-all flex items-center justify-center"
                    title="Chỉnh sửa hạn mức">
                    <i class="fa-solid fa-pen"></i>
                  </button>

                  <button onclick="deleteBudget('${b.id}')" 
                    class="w-9 h-9 rounded-xl custom-bg-input text-xs font-bold text-rose-500 hover:bg-rose-500 hover:text-white active:scale-90 transition-all flex items-center justify-center"
                    title="Xóa ngân sách">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
        });
      }

      html += `
          </div> <!-- End budgets-container -->
        </div> <!-- End space-y-4 -->
      `;
    }

    // Gắn HTML vào root
    root.innerHTML = html;
  };

  // Khởi chạy lại nếu người dùng đang đứng ở tab ngân sách khi module load
  if (state && state.currentView === 'budgets') {
    window.renderBudgets();
  }
})();
