// ==============================================================
// FILE: goals-pro.js - ULTRA FINTECH LIQUID GLASS & BENTO GOALS
// Quản Lý Mục Tiêu Tài Chính & Heo Đất Thông Minh Cho FinMaster
// ==============================================================

(function initGoalsProModule() {
  window.goalFilterStatus = 'all'; // 'all', 'in_progress', 'completed', 'urgent'
  window.goalSearchQuery = '';
  window.goalSortMode = 'pct_desc'; // 'pct_desc', 'days_asc', 'target_desc', 'daily_desc', 'name_asc'

  // 1. NHÚNG STYLE CSS CHUYÊN BIỆT CHO BENTO GOALS & LIQUID SHIMMER
  const goalStyles = `
    /* Bento Glass Card cho Mục tiêu */
    .goal-bento-glass {
      background: var(--bg-card, rgba(255, 255, 255, 0.9));
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--border-color, rgba(226, 232, 240, 0.8));
      transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
    }
    .goal-bento-glass:hover {
      border-color: color-mix(in srgb, var(--icon-active, #6366f1) 40%, transparent);
      box-shadow: 0 12px 32px -8px var(--theme-glow, rgba(99, 102, 241, 0.25));
      transform: translateY(-2px);
    }

    /* Thẻ đã hoàn thành 100% phát hào quang vàng */
    .goal-card-completed {
      border-color: rgba(245, 158, 11, 0.5) !important;
      box-shadow: 0 8px 24px -4px rgba(245, 158, 11, 0.2) !important;
    }

    /* Hiệu ứng tia sáng chạy trên thanh Progress Bar */
    @keyframes goalLiquidShimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
    .goal-shimmer-bar {
      position: relative;
      overflow: hidden;
    }
    .goal-shimmer-bar::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
      transform: translateX(-100%);
      animation: goalLiquidShimmer 2.5s infinite ease-in-out;
    }

    /* Vạch mốc chia Cột Mốc 25% 50% 75% */
    .goal-milestone-tick {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      background: rgba(255, 255, 255, 0.35);
      z-index: 10;
      pointer-events: none;
    }

    /* Pill lọc mục tiêu */
    .goal-filter-pill {
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
    .goal-filter-pill:hover {
      color: var(--text-primary, #0f172a);
      transform: scale(1.02);
    }
    .goal-filter-pill.active {
      background: var(--bg-primary-soft, rgba(99, 102, 241, 0.15));
      color: var(--icon-active, #6366f1);
      border-color: color-mix(in srgb, var(--icon-active, #6366f1) 45%, transparent);
      box-shadow: 0 2px 10px -2px var(--theme-glow, rgba(99, 102, 241, 0.3));
    }
  `;

  let styleEl = document.getElementById('goals-pro-styles');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'goals-pro-styles';
    styleEl.innerHTML = goalStyles;
    document.head.appendChild(styleEl);
  }

  // Tự động suy đoán Icon phù hợp dựa trên tên mục tiêu
  window.getGoalIconByName = function(name) {
    if (!name) return '🎯';
    const lower = name.toLowerCase();
    if (lower.includes('iphone') || lower.includes('điện thoại') || lower.includes('phone') || lower.includes('ipad')) return '📱';
    if (lower.includes('xe') || lower.includes('ô tô') || lower.includes('honda') || lower.includes('yamaha') || lower.includes('vespa')) return '🛵';
    if (lower.includes('du lịch') || lower.includes('phượt') || lower.includes('tour') || lower.includes('vé máy bay')) return '✈️';
    if (lower.includes('nhà') || lower.includes('chung cư') || lower.includes('căn hộ') || lower.includes('đất')) return '🏠';
    if (lower.includes('laptop') || lower.includes('macbook') || lower.includes('máy tính') || lower.includes('pc')) return '💻';
    if (lower.includes('khẩn cấp') || lower.includes('dự phòng') || lower.includes('bảo hiểm')) return '🛡️';
    if (lower.includes('cưới') || lower.includes('nhẫn') || lower.includes('hôn lễ')) return '💍';
    if (lower.includes('học') || lower.includes('khóa học') || lower.includes('du học') || lower.includes('ielts')) return '🎓';
    if (lower.includes('đầu tư') || lower.includes('chứng khoán') || lower.includes('vàng') || lower.includes('tiết kiệm')) return '💰';
    if (lower.includes('đồng hồ') || lower.includes('rolex') || lower.includes('apple watch')) return '⌚';
    return '🎯';
  };

  // ==============================================================
  // 2. BỘ LỌC & TÌM KIẾM
  // ==============================================================
  window.setGoalFilter = function(status) {
    window.goalFilterStatus = status;
    renderGoals();
    if (typeof playSound === 'function') playSound("click");
  };

  window.setGoalSort = function(sortMode) {
    window.goalSortMode = sortMode;
    renderGoals();
  };

  window.onGoalSearch = function(query) {
    window.goalSearchQuery = (query || '').trim().toLowerCase();
    renderGoals();
  };

  // ==============================================================
  // 3. TÍNH NĂNG 1-CLICK: TẠO MỤC TIÊU MẪU (STARTER GOALS)
  // ==============================================================
  window.quickAddStarterGoal = function(name, targetAmount, monthsAhead, walletId = null) {
    if (!state.goals) state.goals = [];

    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + monthsAhead);
    const dateStr = targetDate.toISOString().split('T')[0];

    // Sử dụng ví đầu tiên nếu có
    const defaultWallet = walletId || (state.wallets && state.wallets[0] ? state.wallets[0].id : null);

    state.goals.push({
      id: generateId(),
      name: name,
      targetAmount: targetAmount,
      savedAmount: 0,
      targetDate: dateStr,
      walletId: defaultWallet
    });

    if (typeof addLog === 'function') {
      addLog("Tạo mục tiêu", `${name}: ${formatMoney(targetAmount)}`);
    }

    saveData();
    renderGoals();

    if (typeof confetti === 'function') {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.65 } });
    }
    if (typeof playSound === 'function') playSound("pop");
  };

  // ==============================================================
  // 4. MODAL NẠP TIỀN TIẾT KIỆM (QUICK DEPOSIT VÀO MỤC TIÊU)
  // ==============================================================
  window.openGoalDepositModal = function(goalId) {
    const goal = (state.goals || []).find(g => g.id === goalId);
    if (!goal) return;

    const linkedWallet = state.wallets.find(w => w.id === goal.walletId);
    const currentBalance = linkedWallet ? linkedWallet.balance : (goal.savedAmount || 0);
    const amountLeft = Math.max(0, goal.targetAmount - currentBalance);

    let modal = document.getElementById('goal-deposit-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'goal-deposit-modal';
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md hidden';
      document.body.appendChild(modal);
    }

    const walletOptions = state.wallets.map(w => 
      `<option value="${w.id}" ${w.id === goal.walletId ? 'selected' : ''}>${w.name} (Số dư: ${formatMoney(w.balance)})</option>`
    ).join('');

    modal.innerHTML = `
      <div class="relative w-full max-w-md custom-bg-card rounded-3xl p-5 sm:p-6 border custom-border custom-shadow-lg animate-popIn">
        <!-- Close Button -->
        <button onclick="document.getElementById('goal-deposit-modal').classList.add('hidden')" 
          class="absolute top-4 right-4 w-9 h-9 rounded-2xl custom-bg-input flex items-center justify-center custom-text-secondary hover:custom-text transition-all">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>

        <!-- Header -->
        <div class="flex items-center gap-3.5 mb-4">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center text-xl shadow-lg shadow-emerald-500/25 shrink-0">
            <i class="fa-solid fa-piggy-bank"></i>
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-black custom-text">Nạp Tiền Tiết Kiệm</h3>
            <p class="text-xs custom-text-secondary truncate max-w-[220px]">Cho mục tiêu: <b>${goal.name}</b></p>
          </div>
        </div>

        <!-- Quick Status -->
        <div class="p-3.5 rounded-2xl custom-bg-input border custom-border flex items-center justify-between mb-4 text-xs font-bold">
          <div>
            <span class="custom-text-secondary block text-[10px] uppercase">Đã tích lũy</span>
            <span class="text-sm font-black text-emerald-500">${formatMoney(currentBalance)}</span>
          </div>
          <div class="text-right">
            <span class="custom-text-secondary block text-[10px] uppercase">Còn thiếu</span>
            <span class="text-sm font-black custom-text">${formatMoney(amountLeft)}</span>
          </div>
        </div>

        <form id="frm-goal-deposit" class="space-y-4">
          <!-- Số tiền muốn nạp -->
          <div>
            <label class="block text-xs font-bold custom-text-secondary uppercase mb-1.5">Số tiền nạp (VNĐ)</label>
            <div class="relative">
              <input 
                type="text" 
                inputmode="numeric" 
                id="deposit-amount-input" 
                oninput="formatInputCurrency(event)"
                required 
                class="w-full py-3 px-4 custom-bg-input rounded-2xl text-xl font-black custom-text outline-none border custom-border focus:border-primary-500"
                placeholder="VD: 500.000"
              />
              <span class="absolute right-3.5 top-3.5 text-xs font-bold custom-text-secondary">VNĐ</span>
            </div>

            <!-- Quick Amount Pills -->
            <div class="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 custom-scrollbar text-[11px] font-bold">
              <button type="button" onclick="setQuickDeposit(100000)" class="py-1 px-2.5 rounded-xl custom-bg-input border custom-border custom-text hover:border-primary-500 transition-all">+100k</button>
              <button type="button" onclick="setQuickDeposit(200000)" class="py-1 px-2.5 rounded-xl custom-bg-input border custom-border custom-text hover:border-primary-500 transition-all">+200k</button>
              <button type="button" onclick="setQuickDeposit(500000)" class="py-1 px-2.5 rounded-xl custom-bg-input border custom-border custom-text hover:border-primary-500 transition-all">+500k</button>
              <button type="button" onclick="setQuickDeposit(1000000)" class="py-1 px-2.5 rounded-xl custom-bg-input border custom-border custom-text hover:border-primary-500 transition-all">+1tr</button>
              <button type="button" onclick="setQuickDeposit(${amountLeft})" class="py-1 px-2.5 rounded-xl bg-primary-500/10 text-primary-500 border border-primary-500/30 transition-all">Nạp đủ</button>
            </div>
          </div>

          <!-- Nguồn nạp tiền -->
          <div>
            <label class="block text-xs font-bold custom-text-secondary uppercase mb-1.5">Nguồn tiền trích nạp</label>
            <select id="deposit-wallet-select" class="w-full p-3.5 rounded-2xl custom-bg-input border custom-border text-xs font-bold custom-text outline-none">
              <option value="direct">🐖 Nạp trực tiếp vào Heo Đất (Không trừ ví)</option>
              ${walletOptions}
            </select>
          </div>

          <!-- Submit Buttons -->
          <div class="pt-2 flex gap-2.5">
            <button type="button" onclick="document.getElementById('goal-deposit-modal').classList.add('hidden')"
              class="flex-1 py-3.5 rounded-2xl custom-bg-input font-bold text-xs custom-text hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
              Hủy
            </button>
            <button type="submit"
              class="flex-[2] py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5">
              <i class="fa-solid fa-check"></i> Xác Nhận Nạp Tiền
            </button>
          </div>
        </form>
      </div>
    `;

    window.setQuickDeposit = function(amt) {
      const input = document.getElementById('deposit-amount-input');
      if (input) {
        input.value = Math.max(0, amt).toLocaleString('vi-VN');
      }
    };

    document.getElementById('frm-goal-deposit').onsubmit = function(e) {
      e.preventDefault();
      const rawAmt = document.getElementById('deposit-amount-input').value;
      const amt = typeof getRawNumber === 'function' ? getRawNumber(rawAmt) : parseInt(rawAmt.replace(/\D/g, '') || 0);
      if (amt <= 0) return alert("Vui lòng nhập số tiền lớn hơn 0!");

      const sourceWalletId = document.getElementById('deposit-wallet-select').value;

      if (sourceWalletId === 'direct') {
        // Nạp trực tiếp vào heo đất
        goal.savedAmount = (goal.savedAmount || 0) + amt;
      } else {
        // Trừ tiền từ ví được chọn
        const w = state.wallets.find(w => w.id === sourceWalletId);
        if (w) {
          if (w.balance < amt) {
            if (!confirm(`Số dư ví "${w.name}" hiện chỉ có ${formatMoney(w.balance)}. Bạn vẫn muốn nạp vào mục tiêu chứ?`)) return;
          }
          w.balance -= amt;
          goal.savedAmount = (goal.savedAmount || 0) + amt;
          if (typeof addLog === 'function') {
            addLog("Tích lũy mục tiêu", `Trích ${formatMoney(amt)} từ ${w.name} vào ${goal.name}`);
          }
        }
      }

      saveData();
      renderGoals();

      document.getElementById('goal-deposit-modal').classList.add('hidden');

      // Kiểm tra xem đã đạt 100% chưa
      const newBalance = linkedWallet ? linkedWallet.balance : (goal.savedAmount || 0);
      if (newBalance >= goal.targetAmount) {
        if (typeof confetti === 'function') {
          confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
        }
        alert(`🏆 XIN CHÚC MỪNG!\nBạn đã chính thức hoàn thành mục tiêu: ${goal.name}!`);
      } else {
        if (typeof confetti === 'function') {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        }
      }

      if (typeof playSound === 'function') playSound("success");
    };

    modal.classList.remove('hidden');
  };

  // ==============================================================
  // 5. MODAL CHỈNH SỬA MỤC TIÊU
  // ==============================================================
  window.openEditGoalModal = function(goalId) {
    const goal = (state.goals || []).find(g => g.id === goalId);
    if (!goal) return;

    let modal = document.getElementById('goal-edit-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'goal-edit-modal';
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md hidden';
      document.body.appendChild(modal);
    }

    const walletOptions = state.wallets.map(w => 
      `<option value="${w.id}" ${w.id === goal.walletId ? 'selected' : ''}>${w.name} (Số dư: ${formatMoney(w.balance)})</option>`
    ).join('');

    modal.innerHTML = `
      <div class="relative w-full max-w-md custom-bg-card rounded-3xl p-5 sm:p-6 border custom-border custom-shadow-lg animate-popIn">
        <!-- Close Button -->
        <button onclick="document.getElementById('goal-edit-modal').classList.add('hidden')" 
          class="absolute top-4 right-4 w-9 h-9 rounded-2xl custom-bg-input flex items-center justify-center custom-text-secondary hover:custom-text transition-all">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>

        <div class="flex items-center gap-3 mb-4">
          <div class="w-11 h-11 rounded-2xl bg-primary-500/15 text-primary-500 flex items-center justify-center text-xl shrink-0">
            <i class="fa-solid fa-pen-to-square"></i>
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-black custom-text">Chỉnh Sửa Mục Tiêu</h3>
            <p class="text-xs custom-text-secondary">Cập nhật thông tin kế hoạch</p>
          </div>
        </div>

        <form id="frm-edit-goal" class="space-y-4">
          <div>
            <label class="block text-xs font-bold custom-text-secondary uppercase mb-1">Tên mục tiêu</label>
            <input type="text" id="eg-name" value="${goal.name}" required 
              class="w-full p-3.5 rounded-2xl custom-bg-input border custom-border font-bold text-sm custom-text outline-none focus:border-primary-500">
          </div>

          <div>
            <label class="block text-xs font-bold custom-text-secondary uppercase mb-1">Số tiền mục tiêu (VNĐ)</label>
            <input type="text" inputmode="numeric" id="eg-amt" oninput="formatInputCurrency(event)" value="${goal.targetAmount.toLocaleString('vi-VN')}" required 
              class="w-full p-3.5 rounded-2xl custom-bg-input border custom-border font-black text-lg custom-text outline-none focus:border-primary-500">
          </div>

          <div>
            <label class="block text-xs font-bold custom-text-secondary uppercase mb-1">Đã tích lũy trong Heo Đất (VNĐ)</label>
            <input type="text" inputmode="numeric" id="eg-saved" oninput="formatInputCurrency(event)" value="${(goal.savedAmount || 0).toLocaleString('vi-VN')}" 
              class="w-full p-3.5 rounded-2xl custom-bg-input border custom-border font-black text-sm text-emerald-500 outline-none focus:border-primary-500">
          </div>

          <div>
            <label class="block text-xs font-bold custom-text-secondary uppercase mb-1">Ngày dự kiến hoàn thành</label>
            <input type="date" id="eg-date" value="${goal.targetDate || '2026-12-31'}" required 
              class="w-full p-3.5 rounded-2xl custom-bg-input border custom-border font-bold text-xs custom-text outline-none focus:border-primary-500">
          </div>

          <div>
            <label class="block text-xs font-bold custom-text-secondary uppercase mb-1">Phương thức tích lũy</label>
            <select id="eg-wallet" class="w-full p-3.5 rounded-2xl custom-bg-input border custom-border font-bold text-xs custom-text outline-none">
              <option value="" ${!goal.walletId ? 'selected' : ''}>🐖 Heo Đất Độc Lập (Tự tích lũy riêng)</option>
              ${walletOptions}
            </select>
          </div>

          <div class="pt-2 flex gap-2.5">
            <button type="button" onclick="document.getElementById('goal-edit-modal').classList.add('hidden')"
              class="flex-1 py-3.5 rounded-2xl custom-bg-input font-bold text-xs custom-text hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
              Hủy
            </button>
            <button type="submit"
              class="flex-[2] py-3.5 rounded-2xl custom-primary text-white font-black text-xs sm:text-sm shadow-lg shadow-primary-500/25 active:scale-95 transition-all">
              Lưu Thay Đổi
            </button>
          </div>
        </form>
      </div>
    `;

    document.getElementById('frm-edit-goal').onsubmit = function(e) {
      e.preventDefault();
      goal.name = document.getElementById('eg-name').value;
      goal.targetAmount = typeof getRawNumber === 'function' ? getRawNumber(document.getElementById('eg-amt').value) : parseInt(document.getElementById('eg-amt').value.replace(/\D/g, '') || 0);
      goal.savedAmount = typeof getRawNumber === 'function' ? getRawNumber(document.getElementById('eg-saved').value) : parseInt(document.getElementById('eg-saved').value.replace(/\D/g, '') || 0);
      goal.targetDate = document.getElementById('eg-date').value;
      goal.walletId = document.getElementById('eg-wallet').value || null;

      saveData();
      renderGoals();

      document.getElementById('goal-edit-modal').classList.add('hidden');
      if (typeof playSound === 'function') playSound("click");
    };

    modal.classList.remove('hidden');
  };

  // ==============================================================
  // 6. HÀM CHÍNH: RENDER TOÀN BỘ GIAO DIỆN MỤC TIÊU (BENTO GOALS)
  // ==============================================================
  window.renderGoals = function() {
    const root = document.getElementById("view-goals");
    if (!root) return;

    if (!state.goals) state.goals = [];

    const today = new Date();

    // Tính toán số liệu thống kê tổng thể
    let totalTarget = 0;
    let totalSaved = 0;
    let completedCount = 0;
    let inProgressCount = 0;
    let urgentCount = 0; // Còn dưới 30 ngày

    const goalMetrics = state.goals.map(g => {
      const linkedWallet = state.wallets.find(w => w.id === g.walletId);
      const currentBalance = linkedWallet ? linkedWallet.balance : (g.savedAmount || 0);
      const pct = Math.min((currentBalance / g.targetAmount) * 100, 100).toFixed(1);
      const pctNum = parseFloat(pct);

      const targetDate = new Date(g.targetDate || "2026-12-31");
      const daysLeft = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
      const amountLeft = Math.max(0, g.targetAmount - currentBalance);
      const dailyNeeded = (daysLeft > 0 && amountLeft > 0) ? Math.round(amountLeft / daysLeft) : 0;
      const monthlyNeeded = (daysLeft > 0 && amountLeft > 0) ? Math.round((amountLeft / daysLeft) * 30) : 0;

      const isCompleted = pctNum >= 100;
      const isUrgent = (!isCompleted && daysLeft > 0 && daysLeft <= 30);

      if (isCompleted) completedCount++;
      else {
        inProgressCount++;
        if (isUrgent) urgentCount++;
      }

      totalTarget += g.targetAmount;
      totalSaved += currentBalance;

      const icon = window.getGoalIconByName(g.name);

      return {
        ...g,
        linkedWallet,
        currentBalance,
        pct: pctNum,
        daysLeft,
        amountLeft,
        dailyNeeded,
        monthlyNeeded,
        isCompleted,
        isUrgent,
        icon,
        targetDateObj: targetDate
      };
    });

    const overallPct = totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100).toFixed(1) : 0;
    const totalRemainingToSave = Math.max(0, totalTarget - totalSaved);

    // Lọc theo bộ lọc & tìm kiếm
    let filteredGoals = goalMetrics.filter(g => {
      if (window.goalFilterStatus === 'in_progress' && g.isCompleted) return false;
      if (window.goalFilterStatus === 'completed' && !g.isCompleted) return false;
      if (window.goalFilterStatus === 'urgent' && !g.isUrgent) return false;

      if (window.goalSearchQuery) {
        const q = window.goalSearchQuery;
        if (!g.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    // Sắp xếp
    filteredGoals.sort((a, b) => {
      if (window.goalSortMode === 'days_asc') return a.daysLeft - b.daysLeft;
      if (window.goalSortMode === 'target_desc') return b.targetAmount - a.targetAmount;
      if (window.goalSortMode === 'daily_desc') return b.dailyNeeded - a.dailyNeeded;
      if (window.goalSortMode === 'name_asc') return a.name.localeCompare(b.name);
      return b.pct - a.pct; // default pct_desc
    });

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
                <h1 class="text-base sm:text-lg font-black custom-text tracking-tight">Mục Tiêu Tài Chính</h1>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  🐖 Heo Đất
                </span>
              </div>
              <p class="text-[11px] custom-text-secondary leading-none hidden sm:block mt-0.5">Tích lũy thông minh cho từng cột mốc cuộc đời</p>
            </div>
          </div>

          <!-- Nút Hành Động Nhanh & Phòng Truyền Thống -->
          <div class="flex items-center gap-1.5 sm:gap-2">
            <!-- Phòng Truyền Thống -->
            <button onclick="openTrophyRoom()" 
              class="py-2 px-3 sm:px-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-500/15 to-orange-500/15 border border-amber-500/30 text-amber-500 font-bold text-xs flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shrink-0"
              title="Mở Phòng Truyền Thống">
              <i class="fa-solid fa-trophy text-sm"></i>
              <span class="hidden sm:inline">Phòng Cúp</span>
              <span class="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-black">${(state.badges || []).length}</span>
            </button>

            <!-- Nút Tạo Mục Tiêu Mới -->
            <button onclick="openModal('goal')" 
              class="py-2.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl custom-primary text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-primary-500/25 hover:scale-105 active:scale-95 transition-all shrink-0">
              <i class="fa-solid fa-plus"></i> <span class="hidden sm:inline">Tạo Mục Tiêu</span>
            </button>
          </div>
        </header>
    `;

    // NẾU CHƯA CÓ MỤC TIÊU NÀO
    if (state.goals.length === 0) {
      html += `
        <!-- EMPTY STATE THỜI THƯỢNG VỚI 4 GÓI MẪU 1-CLICK -->
        <div class="relative overflow-hidden rounded-3xl p-6 sm:p-10 text-center goal-bento-glass">
          <div class="relative z-10 max-w-lg mx-auto">
            <div class="w-24 h-24 mx-auto mb-5 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/30 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/20">
              <span class="drop-shadow-lg">🎯</span>
            </div>

            <h2 class="text-xl sm:text-2xl font-black custom-text mb-2.5 tracking-tight">
              Chưa Có Kế Hoạch Mục Tiêu Nào
            </h2>

            <p class="text-xs sm:text-sm custom-text-secondary leading-relaxed mb-6">
              Bạn đang ấp ủ mua xe mới, tậu iPhone xịn, đi du lịch hay xây dựng quỹ dự phòng? Hãy đặt mục tiêu ngay để biến ước mơ thành hiện thực!
            </p>

            <div class="flex items-center justify-center gap-3 mb-8">
              <button onclick="openModal('goal')" 
                class="py-3.5 px-6 rounded-2xl custom-primary text-white font-black text-sm shadow-xl shadow-primary-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                <i class="fa-solid fa-plus"></i> Tạo Mục Tiêu Đầu Tiên
              </button>
            </div>

            <!-- Gói mục tiêu mẫu 1-click -->
            <div class="border-t custom-border pt-6 text-left">
              <span class="text-xs font-black uppercase tracking-wider custom-text-secondary flex items-center gap-1.5 mb-3.5">
                <i class="fa-solid fa-sparkles text-amber-500"></i> Gợi Ý Mục Tiêu Phổ Biến (Tạo Nhanh 1-Click)
              </span>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div onclick="quickAddStarterGoal('iPhone 16 Pro Max 256GB', 34990000, 6)"
                  class="p-3.5 rounded-2xl custom-bg-card border custom-border cursor-pointer flex items-center justify-between group hover:border-primary-500 hover:-translate-y-0.5 transition-all">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center text-lg">📱</div>
                    <div>
                      <div class="text-sm font-bold custom-text group-hover:text-primary-500 transition-colors">iPhone 16 Pro Max</div>
                      <div class="text-[11px] custom-text-secondary">34.990.000 ₫ (6 tháng)</div>
                    </div>
                  </div>
                  <span class="w-8 h-8 rounded-xl custom-bg-input flex items-center justify-center text-xs custom-text-secondary group-hover:bg-primary-500 group-hover:text-white transition-all"><i class="fa-solid fa-plus"></i></span>
                </div>

                <div onclick="quickAddStarterGoal('Mua Xe Máy Mới', 45000000, 12)"
                  class="p-3.5 rounded-2xl custom-bg-card border custom-border cursor-pointer flex items-center justify-between group hover:border-primary-500 hover:-translate-y-0.5 transition-all">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center text-lg">🛵</div>
                    <div>
                      <div class="text-sm font-bold custom-text group-hover:text-primary-500 transition-colors">Mua Xe Máy Mới</div>
                      <div class="text-[11px] custom-text-secondary">45.000.000 ₫ (12 tháng)</div>
                    </div>
                  </div>
                  <span class="w-8 h-8 rounded-xl custom-bg-input flex items-center justify-center text-xs custom-text-secondary group-hover:bg-primary-500 group-hover:text-white transition-all"><i class="fa-solid fa-plus"></i></span>
                </div>

                <div onclick="quickAddStarterGoal('Chuyến Du Lịch Nhật Bản', 25000000, 8)"
                  class="p-3.5 rounded-2xl custom-bg-card border custom-border cursor-pointer flex items-center justify-between group hover:border-primary-500 hover:-translate-y-0.5 transition-all">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center text-lg">✈️</div>
                    <div>
                      <div class="text-sm font-bold custom-text group-hover:text-primary-500 transition-colors">Du Lịch Nhật Bản</div>
                      <div class="text-[11px] custom-text-secondary">25.000.000 ₫ (8 tháng)</div>
                    </div>
                  </div>
                  <span class="w-8 h-8 rounded-xl custom-bg-input flex items-center justify-center text-xs custom-text-secondary group-hover:bg-primary-500 group-hover:text-white transition-all"><i class="fa-solid fa-plus"></i></span>
                </div>

                <div onclick="quickAddStarterGoal('Quỹ Dự Phòng Khẩn Cấp', 20000000, 6)"
                  class="p-3.5 rounded-2xl custom-bg-card border custom-border cursor-pointer flex items-center justify-between group hover:border-primary-500 hover:-translate-y-0.5 transition-all">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-lg">🛡️</div>
                    <div>
                      <div class="text-sm font-bold custom-text group-hover:text-primary-500 transition-colors">Quỹ Khẩn Cấp (3 Tháng)</div>
                      <div class="text-[11px] custom-text-secondary">20.000.000 ₫ (6 tháng)</div>
                    </div>
                  </div>
                  <span class="w-8 h-8 rounded-xl custom-bg-input flex items-center justify-center text-xs custom-text-secondary group-hover:bg-primary-500 group-hover:text-white transition-all"><i class="fa-solid fa-plus"></i></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      // 2. HERO BENTO COMMAND HUB: TỔNG QUAN TÍCH LŨY
      html += `
        <div class="goal-bento-glass rounded-3xl p-5 sm:p-6 custom-shadow-md">
          <!-- Hàng 3 KPI Chính -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 mb-5">
            <!-- Tổng số tiền cần tích lũy -->
            <div class="p-4 rounded-2xl custom-bg-input border custom-border flex flex-col justify-between">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] font-black uppercase tracking-wider custom-text-secondary">Tổng Mục Tiêu</span>
                <div class="w-7 h-7 rounded-xl bg-primary-500/15 text-primary-500 flex items-center justify-center text-xs font-black">
                  <i class="fa-solid fa-bullseye"></i>
                </div>
              </div>
              <div class="text-xl sm:text-2xl font-black custom-text tracking-tight truncate">${formatMoney(totalTarget)}</div>
              <div class="text-[10px] font-bold custom-text-secondary mt-1">${state.goals.length} mục tiêu đang theo dõi</div>
            </div>

            <!-- Đã tích lũy được -->
            <div class="p-4 rounded-2xl custom-bg-input border custom-border flex flex-col justify-between">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] font-black uppercase tracking-wider text-emerald-500">Đã Tích Lũy</span>
                <div class="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-xs font-black">
                  <i class="fa-solid fa-piggy-bank"></i>
                </div>
              </div>
              <div class="text-xl sm:text-2xl font-black text-emerald-500 tracking-tight truncate">${formatMoney(totalSaved)}</div>
              <div class="text-[10px] font-bold custom-text-secondary mt-1">Đạt ${overallPct}% tổng kế hoạch</div>
            </div>

            <!-- Còn thiếu để về đích -->
            <div class="p-4 rounded-2xl custom-bg-input border custom-border flex flex-col justify-between">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] font-black uppercase tracking-wider text-amber-500">Còn Thiếu</span>
                <div class="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-xs font-black">
                  <i class="fa-solid fa-flag-checkered"></i>
                </div>
              </div>
              <div class="text-xl sm:text-2xl font-black text-amber-500 tracking-tight truncate">${formatMoney(totalRemainingToSave)}</div>
              <div class="text-[10px] font-bold custom-text-secondary mt-1">${completedCount} mục tiêu đã hoàn thành</div>
            </div>
          </div>

          <!-- Thanh Macro Shimmer Progress Bar -->
          <div class="mb-5">
            <div class="flex justify-between items-center text-xs font-bold mb-2">
              <span class="custom-text flex items-center gap-1.5">
                <i class="fa-solid fa-chart-line text-emerald-500"></i> Tiến độ tích lũy trung bình
              </span>
              <span class="custom-text font-black">${overallPct}%</span>
            </div>

            <div class="relative h-4 w-full custom-bg-body rounded-full overflow-hidden border custom-border">
              <!-- Các vạch cột mốc 25% 50% 75% -->
              <div class="goal-milestone-tick left-[25%]"></div>
              <div class="goal-milestone-tick left-[50%]"></div>
              <div class="goal-milestone-tick left-[75%]"></div>

              <div class="h-full rounded-full goal-shimmer-bar transition-all duration-700 bg-gradient-to-r from-emerald-400 via-teal-500 to-primary-500" 
                style="width: ${overallPct}%;">
              </div>
            </div>

            <div class="flex justify-between items-center text-[10px] font-semibold custom-text-secondary mt-1.5 px-0.5">
              <span>0% Khởi đầu</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100% Cán đích 🏆</span>
            </div>
          </div>

          <!-- Smart Motivation Banner -->
          <div class="p-3.5 rounded-2xl custom-bg-input border custom-border flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="text-xl sm:text-2xl shrink-0 text-amber-500">
                <i class="fa-solid fa-award"></i>
              </div>
              <div>
                <div class="text-xs sm:text-sm font-black custom-text">
                  ${completedCount > 0 ? `Đã cán đích ${completedCount}/${state.goals.length} mục tiêu!` : 'Từng đồng tiết kiệm hôm nay đều là bước đệm ngày mai'}
                </div>
                <div class="text-[11px] custom-text-secondary mt-0.5">
                  ${urgentCount > 0 ? `Có <b>${urgentCount}</b> mục tiêu sắp đến hạn trong 30 ngày tới. Hãy tập trung nạp thêm!` : 'Kỷ luật tài chính là con đường ngắn nhất đến tự do!'}
                </div>
              </div>
            </div>

            <div class="hidden sm:flex items-center gap-2 shrink-0">
              <span class="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-black">
                🎉 ${completedCount} Xong
              </span>
              <span class="px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-500 text-xs font-black">
                🚀 ${inProgressCount} Đang chạy
              </span>
            </div>
          </div>
        </div>

        <!-- 3. BỘ CÔNG CỤ TÌM KIẾM, BỘ LỌC & SẮP XẾP -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div class="relative flex-1">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs custom-text-secondary"></i>
            <input 
              type="text" 
              placeholder="Tìm kiếm mục tiêu (iPhone, Mua xe, Du lịch...)" 
              value="${window.goalSearchQuery || ''}"
              oninput="onGoalSearch(this.value)"
              class="w-full pl-9 pr-8 py-2.5 rounded-2xl custom-bg-card border custom-border text-xs sm:text-sm font-bold custom-text outline-none focus:border-primary-500 transition-all"
            />
            ${window.goalSearchQuery ? `
              <button onclick="onGoalSearch('')" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs custom-text-secondary hover:custom-text">
                <i class="fa-solid fa-circle-xmark"></i>
              </button>
            ` : ''}
          </div>

          <div class="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            <button onclick="setGoalFilter('all')" class="goal-filter-pill ${window.goalFilterStatus === 'all' ? 'active' : ''}">
              Tất cả (${goalMetrics.length})
            </button>
            <button onclick="setGoalFilter('in_progress')" class="goal-filter-pill ${window.goalFilterStatus === 'in_progress' ? 'active' : ''}">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Đang tích lũy (${inProgressCount})
            </button>
            <button onclick="setGoalFilter('completed')" class="goal-filter-pill ${window.goalFilterStatus === 'completed' ? 'active' : ''}">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Đã hoàn thành (${completedCount})
            </button>
            <button onclick="setGoalFilter('urgent')" class="goal-filter-pill ${window.goalFilterStatus === 'urgent' ? 'active' : ''}">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Sắp tới hạn (${urgentCount})
            </button>
          </div>

          <select onchange="setGoalSort(this.value)" class="py-2.5 px-3 rounded-2xl custom-bg-card border custom-border text-xs font-bold custom-text outline-none shrink-0">
            <option value="pct_desc" ${window.goalSortMode === 'pct_desc' ? 'selected' : ''}>% Tiến độ cao nhất</option>
            <option value="days_asc" ${window.goalSortMode === 'days_asc' ? 'selected' : ''}>Ngày đến hạn gần nhất</option>
            <option value="target_desc" ${window.goalSortMode === 'target_desc' ? 'selected' : ''}>Mục tiêu lớn nhất</option>
            <option value="daily_desc" ${window.goalSortMode === 'daily_desc' ? 'selected' : ''}>Cần nạp/ngày cao nhất</option>
            <option value="name_asc" ${window.goalSortMode === 'name_asc' ? 'selected' : ''}>Tên A-Z</option>
          </select>
        </div>

        <!-- 4. DANH SÁCH THẺ MỤC TIÊU BENTO (Goals Grid) -->
        <div id="goals-container" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      `;

      if (filteredGoals.length === 0) {
        html += `
          <div class="col-span-full py-12 text-center goal-bento-glass rounded-3xl">
            <i class="fa-solid fa-bullseye text-4xl custom-text-secondary opacity-40 mb-3 block"></i>
            <h4 class="text-base font-bold custom-text">Không tìm thấy mục tiêu nào phù hợp</h4>
            <p class="text-xs custom-text-secondary mt-1">Hãy thử xóa bộ lọc tìm kiếm hoặc tạo thêm mục tiêu mới.</p>
          </div>
        `;
      } else {
        filteredGoals.forEach(g => {
          const cardClass = g.isCompleted ? 'goal-card-completed' : '';
          const barGrad = g.isCompleted 
            ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400' 
            : 'bg-gradient-to-r from-teal-400 via-emerald-500 to-primary-500';

          const badgePill = g.isCompleted 
            ? `<span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1 shadow-sm">
                 <i class="fa-solid fa-circle-check"></i> Đạt mục tiêu
               </span>`
            : (g.isUrgent 
                ? `<span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-orange-500/15 text-orange-500 border border-orange-500/30 flex items-center gap-1">
                     <i class="fa-solid fa-hourglass-half"></i> Còn ${g.daysLeft} ngày
                   </span>`
                : `<span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-primary-500/15 text-primary-500 border border-primary-500/30">
                     Còn ${g.daysLeft > 0 ? g.daysLeft + ' ngày' : 'Quá hạn'}
                   </span>`);

          html += `
            <div class="goal-bento-glass rounded-3xl p-5 ${cardClass} flex flex-col justify-between">
              <!-- Top Header: Icon + Name + Badge -->
              <div>
                <div class="flex items-center justify-between mb-3.5">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-500/15 to-purple-500/15 text-primary-500 border custom-border flex items-center justify-center text-2xl shadow-sm shrink-0">
                      ${g.icon}
                    </div>
                    <div>
                      <h4 class="font-black text-base custom-text leading-tight flex items-center gap-1.5">
                        ${g.name}
                      </h4>
                      <!-- Nguồn liên kết ví hoặc heo đất -->
                      <div class="flex items-center gap-1.5 mt-1 text-[11px] custom-text-secondary">
                        ${g.linkedWallet ? `
                          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold">
                            <i class="fa-solid fa-link text-[10px]"></i> Ví: ${g.linkedWallet.name}
                          </span>
                        ` : `
                          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
                            <i class="fa-solid fa-piggy-bank text-[10px]"></i> Heo Đất Độc Lập
                          </span>
                        `}
                      </div>
                    </div>
                  </div>

                  <div class="shrink-0">
                    ${badgePill}
                  </div>
                </div>

                <!-- Tiền Tệ: Đã tích lũy / Mục tiêu -->
                <div class="flex items-baseline justify-between mb-2">
                  <div>
                    <span class="text-[10px] font-bold uppercase tracking-wider custom-text-secondary block">Đã tích lũy</span>
                    <span class="text-lg font-black ${g.isCompleted ? 'text-amber-500' : 'text-emerald-500'}">${formatMoney(g.currentBalance)}</span>
                  </div>
                  <div class="text-right">
                    <span class="text-[10px] font-bold uppercase tracking-wider custom-text-secondary block">Mục tiêu</span>
                    <span class="text-sm font-black custom-text-secondary">${formatMoney(g.targetAmount)}</span>
                  </div>
                </div>

                <!-- Multi-milestone Progress Bar -->
                <div class="relative h-3 w-full custom-bg-body rounded-full overflow-hidden border custom-border mb-3">
                  <div class="goal-milestone-tick left-[25%]"></div>
                  <div class="goal-milestone-tick left-[50%]"></div>
                  <div class="goal-milestone-tick left-[75%]"></div>

                  <div class="h-full rounded-full goal-shimmer-bar transition-all duration-700 ${barGrad}" 
                    style="width: ${g.pct}%;">
                  </div>
                </div>

                <!-- Pace & Schedule Info Box -->
                <div class="p-3 rounded-2xl custom-bg-input border custom-border space-y-1 text-xs mb-4">
                  <div class="flex justify-between items-center text-[11px] font-bold">
                    <span class="custom-text-secondary flex items-center gap-1">
                      <i class="fa-regular fa-calendar-check text-primary-500"></i> Hạn: ${g.targetDateObj.toLocaleDateString("vi-VN")}
                    </span>
                    <span class="${g.isCompleted ? 'text-amber-500' : 'text-primary-500'} font-black text-xs">
                      ${g.pct}%
                    </span>
                  </div>

                  ${g.isCompleted ? `
                    <div class="text-xs font-black text-amber-500 flex items-center gap-1.5 pt-0.5">
                      <i class="fa-solid fa-trophy"></i> Bạn đã xuất sắc hoàn thành mục tiêu này!
                    </div>
                  ` : `
                    <div class="text-xs font-black text-orange-500 flex items-center gap-1.5 pt-0.5">
                      <i class="fa-solid fa-fire"></i> Cần tích lũy: ${formatMoney(g.dailyNeeded)}/ngày
                      <span class="text-[10px] font-normal custom-text-secondary">(~${formatMoney(g.monthlyNeeded)}/tháng)</span>
                    </div>
                  `}
                </div>
              </div>

              <!-- Action Bar: Nạp Tiền Tiết Kiệm + Sửa + Xóa -->
              <div class="pt-3 border-t custom-border flex items-center justify-between gap-2">
                <button onclick="openGoalDepositModal('${g.id}')" 
                  class="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5">
                  <i class="fa-solid fa-plus-circle text-sm"></i> Nạp Tiền
                </button>

                <div class="flex items-center gap-1.5">
                  <button onclick="openEditGoalModal('${g.id}')" 
                    class="w-9 h-9 rounded-xl custom-bg-input text-xs font-bold custom-text-secondary hover:custom-text active:scale-90 transition-all flex items-center justify-center"
                    title="Chỉnh sửa mục tiêu">
                    <i class="fa-solid fa-pen"></i>
                  </button>

                  <button onclick="deleteGoal('${g.id}')" 
                    class="w-9 h-9 rounded-xl custom-bg-input text-xs font-bold text-rose-500 hover:bg-rose-500 hover:text-white active:scale-90 transition-all flex items-center justify-center"
                    title="Xóa mục tiêu">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
        });
      }

      html += `
          </div> <!-- End goals-container -->
        </div> <!-- End space-y-4 -->
      `;
    }

    root.innerHTML = html;

    // Kích hoạt swipe actions và kiểm tra huy hiệu
    if (typeof checkGoalMilestones === "function") checkGoalMilestones();
  };

  // Nếu người dùng đang đứng ở tab mục tiêu khi module tải, kích hoạt render ngay
  if (state && state.currentView === 'goals') {
    window.renderGoals();
  }
})();
