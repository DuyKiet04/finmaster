// ==============================================================
// FILE: system-pro.js - ALL-IN-ONE FINTECH PRO SYSTEM (V2.8)
// 3 Trang Mới (AI Advisor, Đầu Tư, Wrapped) & Lột Xác Toàn Bộ Trang Còn Lại
// ==============================================================

(function initSystemProModule() {

  // Helper format tiền tệ an toàn
  function moneyStr(n) {
    if (typeof formatMoney === 'function') return formatMoney(n);
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
  }

  // ==============================================================
  // 1. TRANG MỚI 1: TRỢ LÝ TÀI CHÍNH THÔNG MINH AI (view-ai-advisor)
  // ==============================================================
  window.renderAIAdvisor = function() {
    const root = document.getElementById("view-ai-advisor");
    if (!root) return;

    // Phân tích dữ liệu thực tế từ state
    const txs = (window.state && state.transactions) ? state.transactions : [];
    const now = new Date();
    const cm = now.getMonth();
    const cy = now.getFullYear();

    const monthTxs = txs.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === cm && d.getFullYear() === cy;
    });

    const income = monthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
    const expense = monthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
    const netSavings = income - expense;
    const savingsRate = income > 0 ? Math.round((netSavings / income) * 100) : 0;

    // Điểm sức khỏe tài chính (Health Score 0-100)
    let score = 50;
    if (savingsRate >= 20) score += 25;
    else if (savingsRate > 0) score += 10;
    else if (income === 0 && expense > 0) score = 40;
    else score -= 15;

    if (state.goals && state.goals.length > 0) score += 15;
    if (state.budgets && state.budgets.length >= 3) score += 10;
    score = Math.max(15, Math.min(99, score));

    let scoreColor = score >= 80 ? 'text-emerald-400' : (score >= 60 ? 'text-indigo-400' : 'text-amber-400');
    let strokeColor = score >= 80 ? '#10b981' : (score >= 60 ? '#818cf8' : '#f59e0b');
    let scoreBadge = score >= 80 ? 'Xuất Sắc 🌟' : (score >= 60 ? 'Khá Tốt 👍' : 'Cần Cải Thiện ⚠️');

    // Tính toán vòng tròn Gauge SVG
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    root.innerHTML = `
      <!-- Header Trang AI -->
      <header class="flex items-center justify-between gap-2.5 p-2.5 rounded-2xl sm:rounded-3xl custom-bg-card border custom-border custom-shadow-sm sticky top-0 z-10 backdrop-blur-md">
        <div class="flex items-center gap-2.5">
          <button onclick="switchView('dashboard')" 
            class="w-10 h-10 rounded-xl sm:rounded-2xl custom-bg-input flex items-center justify-center custom-text hover:scale-105 active:scale-95 transition-all shrink-0 shadow-sm"
            title="Quay lại Tổng quan">
            <i class="fa-solid fa-arrow-left text-sm sm:text-base"></i>
          </button>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-base sm:text-lg font-black custom-text tracking-tight">Trợ Lý Tài Chính AI</h1>
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/15 text-purple-400 border border-purple-500/30">
                🤖 Smart AI v2.8
              </span>
            </div>
            <p class="text-[11px] custom-text-secondary leading-none hidden sm:block mt-0.5">Chẩn đoán dòng tiền & Khuyến nghị tối ưu hóa tài sản cá nhân</p>
          </div>
        </div>

        <button onclick="runAIFinancialDiagnosis()" 
          class="py-2.5 px-3.5 sm:px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-purple-500/25 active:scale-95 transition-all">
          <i class="fa-solid fa-wand-magic-sparkles text-xs"></i> <span>Quét Lại AI</span>
        </button>
      </header>

      <!-- Bento Hero: Health Score & Chẩn Đoán Dòng Tiền -->
      <div class="driver-bento-glass rounded-3xl p-5 sm:p-6 custom-shadow-md relative overflow-hidden border custom-border">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          
          <!-- Gauge Tròn 3D -->
          <div class="md:col-span-4 p-4 rounded-2xl custom-bg-input border custom-border flex flex-col items-center justify-center relative">
            <span class="text-[10px] font-black uppercase tracking-wider custom-text-secondary mb-2">Chỉ Số Sức Khỏe Tài Chính</span>
            
            <div class="relative w-28 h-28 flex items-center justify-center my-1">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="${radius}" stroke="currentColor" stroke-width="8" class="text-gray-200 dark:text-gray-800" fill="transparent"/>
                <circle cx="50" cy="50" r="${radius}" stroke="${strokeColor}" stroke-width="8" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round" fill="transparent" class="transition-all duration-1000 ease-out"/>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-3xl font-black ${scoreColor} tracking-tight">${score}</span>
                <span class="text-[10px] font-bold custom-text-secondary uppercase">/ 100</span>
              </div>
            </div>

            <span class="mt-2 px-3 py-1 rounded-full text-xs font-black bg-white/10 border custom-border ${scoreColor}">
              ${scoreBadge}
            </span>
          </div>

          <!-- Tóm Tắt & 3 Thẻ Metric KPI -->
          <div class="md:col-span-8 space-y-3.5">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-black custom-text flex items-center gap-2">
                <i class="fa-solid fa-stethoscope text-purple-400"></i> Chẩn Đoán Dòng Tiền Tháng ${cm + 1}
              </h3>
              <span class="text-[10px] font-bold custom-text-secondary bg-white/5 px-2 py-0.5 rounded-md border custom-border">
                Cập nhật tức thời
              </span>
            </div>

            <p class="text-xs custom-text-secondary leading-relaxed">
              ${savingsRate >= 20 ? `Tuyệt vời! Bạn đang duy trì tỷ lệ tích lũy <b class="text-emerald-400">${savingsRate}%</b> thu nhập, vượt mức tiêu chuẩn độc lập tài chính.` : `Tỷ lệ tích lũy hiện tại là <b class="text-amber-400">${savingsRate}%</b>. Nên tăng dần lên <b class="text-emerald-400">20%</b> bằng cách tối ưu hóa các khoản ăn uống & giải trí nhỏ lẻ.`}
            </p>

            <div class="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
              <div class="p-3 rounded-2xl custom-bg-input border custom-border text-center">
                <span class="text-[9px] font-bold custom-text-secondary uppercase tracking-wider block mb-0.5">Thu Nhập</span>
                <span class="text-xs sm:text-sm font-black text-emerald-400">${moneyStr(income)}</span>
              </div>
              <div class="p-3 rounded-2xl custom-bg-input border custom-border text-center">
                <span class="text-[9px] font-bold custom-text-secondary uppercase tracking-wider block mb-0.5">Chi Tiêu</span>
                <span class="text-xs sm:text-sm font-black text-rose-400">${moneyStr(expense)}</span>
              </div>
              <div class="p-3 rounded-2xl custom-bg-input border custom-border text-center">
                <span class="text-[9px] font-bold custom-text-secondary uppercase tracking-wider block mb-0.5">Tích Lũy Ròng</span>
                <span class="text-xs sm:text-sm font-black ${netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${moneyStr(netSavings)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4 Lời Khuyên Hành Động Đột Phá Từ AI -->
      <div class="driver-bento-glass rounded-3xl p-5 sm:p-6 custom-shadow-sm border custom-border space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-black uppercase tracking-wider custom-text flex items-center gap-2">
            <i class="fa-solid fa-lightbulb text-amber-400"></i> Lời Khuyên Hành Động Đột Phá
          </h3>
          <span class="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Cá nhân hóa</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <!-- Card 1 -->
          <div class="p-4 rounded-2xl custom-bg-input border custom-border hover:border-purple-500/40 transition-all flex flex-col justify-between gap-3">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center text-lg shrink-0 border border-purple-500/20">
                🛡️
              </div>
              <div>
                <h4 class="font-bold text-xs sm:text-sm custom-text">Thiết Lập Quỹ Dự Phòng 3 Tháng</h4>
                <p class="text-[11px] custom-text-secondary mt-1 leading-snug">
                  Nên chuẩn bị khoản đệm tài chính khoảng <b>${moneyStr(Math.round((expense > 0 ? expense : 3000000) * 3))}</b> gửi kỳ hạn để an tâm trước mọi biến cố.
                </p>
              </div>
            </div>
            <button onclick="switchView('goals')" class="w-full py-2 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold text-xs border border-purple-500/20 active:scale-95 transition-all text-center">
              + Tạo Mục Tiêu Heo Đất ➔
            </button>
          </div>

          <!-- Card 2 -->
          <div class="p-4 rounded-2xl custom-bg-input border custom-border hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-3">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-lg shrink-0 border border-emerald-500/20">
                📈
              </div>
              <div>
                <h4 class="font-bold text-xs sm:text-sm custom-text">Quy Tắc "Trả Lương Cho Mình Trước"</h4>
                <p class="text-[11px] custom-text-secondary mt-1 leading-snug">
                  Mỗi khi có tiền đổ về ví, hãy trích ngay <b>15-20%</b> vào tài khoản tích sản trước khi bắt đầu chi tiêu sinh hoạt.
                </p>
              </div>
            </div>
            <button onclick="switchView('budgets')" class="w-full py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/20 active:scale-95 transition-all text-center">
              Quản Lý Ngân Sách 50/30/20 ➔
            </button>
          </div>

          <!-- Card 3 -->
          <div class="p-4 rounded-2xl custom-bg-input border custom-border hover:border-amber-500/40 transition-all flex flex-col justify-between gap-3">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center text-lg shrink-0 border border-amber-500/20">
                ☕
              </div>
              <div>
                <h4 class="font-bold text-xs sm:text-sm custom-text">Cắt Giảm "Hiệu Ứng Latte"</h4>
                <p class="text-[11px] custom-text-secondary mt-1 leading-snug">
                  Những khoản chi nhỏ lẻ 35k-50k mỗi ngày (cà phê, trà sữa, ship vặt) có thể tích tụ lên tới hơn <b>1.500.000 ₫/tháng</b>.
                </p>
              </div>
            </div>
            <button onclick="switchView('transactions')" class="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs border border-amber-500/20 active:scale-95 transition-all text-center">
              Lọc Chi Tiêu Ăn Uống ➔
            </button>
          </div>

          <!-- Card 4 -->
          <div class="p-4 rounded-2xl custom-bg-input border custom-border hover:border-indigo-500/40 transition-all flex flex-col justify-between gap-3">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center text-lg shrink-0 border border-indigo-500/20">
                💎
              </div>
              <div>
                <h4 class="font-bold text-xs sm:text-sm custom-text">Đầu Tư & Tích Sản Tự Động</h4>
                <p class="text-[11px] custom-text-secondary mt-1 leading-snug">
                  Đừng để tiền nhàn rỗi mất giá vì lạm phát. Hãy phân bổ vào Vàng nhẫn 9999 hoặc Quỹ mở ETF để tiền tự sinh sôi.
                </p>
              </div>
            </div>
            <button onclick="switchView('invest')" class="w-full py-2 px-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold text-xs border border-indigo-500/20 active:scale-95 transition-all text-center">
              Mở Danh Mục Đầu Tư ➔
            </button>
          </div>
        </div>
      </div>

      <!-- Trắc Nghiệm Tương Tác: Persona Tài Chính -->
      <div id="ai-persona-card" class="driver-bento-glass rounded-3xl p-5 sm:p-6 custom-shadow-sm border custom-border text-center">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center text-xl mx-auto mb-3 shadow-md shadow-purple-500/25">
          🔮
        </div>
        <h3 class="text-base font-black custom-text mb-1">Trắc Nghiệm Phong Cách Tài Chính</h3>
        <p class="text-xs custom-text-secondary max-w-md mx-auto mb-4">
          Chọn khẩu vị của bạn để AI mở khóa danh hiệu và phong cách quản lý tiền phù hợp nhất:
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-xl mx-auto mb-4">
          <button onclick="selectPersonaStyle('strategist')" class="p-3 rounded-2xl custom-bg-input border custom-border hover:border-purple-400 active:scale-95 transition-all text-left group">
            <span class="text-xs font-bold custom-text block group-hover:text-purple-400">🏛️ Nhà Kiến Thiết</span>
            <span class="text-[10px] custom-text-secondary block mt-0.5">Tích lũy trước, kỷ luật chi tiêu thép</span>
          </button>
          <button onclick="selectPersonaStyle('balanced')" class="p-3 rounded-2xl custom-bg-input border custom-border hover:border-indigo-400 active:scale-95 transition-all text-left group">
            <span class="text-xs font-bold custom-text block group-hover:text-indigo-400">⚖️ Bậc Thầy Cân Bằng</span>
            <span class="text-[10px] custom-text-secondary block mt-0.5">Vừa tận hưởng sống vừa có tích sản</span>
          </button>
          <button onclick="selectPersonaStyle('investor')" class="p-3 rounded-2xl custom-bg-input border custom-border hover:border-emerald-400 active:scale-95 transition-all text-left group">
            <span class="text-xs font-bold custom-text block group-hover:text-emerald-400">🚀 Thợ Săn Lãi Kép</span>
            <span class="text-[10px] custom-text-secondary block mt-0.5">Tối đa hóa dòng tiền vào danh mục sinh lời</span>
          </button>
        </div>

        <div id="persona-result-badge" class="hidden p-3 rounded-2xl bg-purple-500/10 border border-purple-500/25 text-purple-400 text-xs font-bold animate-fadeIn"></div>
      </div>
    `;
  };

  window.selectPersonaStyle = function(type) {
    const badge = document.getElementById('persona-result-badge');
    if (!badge) return;
    badge.classList.remove('hidden');

    let text = "";
    if (type === 'strategist') {
      text = "🏛️ Danh hiệu: NHÀ KIẾN THIẾT TÀI CHÍNH (The Master Strategist) — Bạn có tư duy độc lập tài chính rất sắc bén!";
    } else if (type === 'balanced') {
      text = "⚖️ Danh hiệu: BẬC THẦY CÂN BẰNG (The Balanced Master) — Bạn biết hài hòa giữa hiện tại và tương lai vững bền!";
    } else {
      text = "🚀 Danh hiệu: THỢ SĂN LÃI KÉP (The Compounding Titan) — Tinh thần đầu tư dài hạn đỉnh cao!";
    }
    badge.innerText = text;

    if (typeof playSound === 'function') playSound("success");
    if (typeof confetti === 'function') confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
  };

  window.runAIFinancialDiagnosis = function() {
    if (typeof playSound === 'function') playSound("pop");
    if (typeof confetti === 'function') {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
    window.renderAIAdvisor();
  };

  // ==============================================================
  // 2. TRANG MỚI 2: ĐẦU TƯ & TÍCH SẢN (view-invest)
  // ==============================================================
  window.renderInvest = function() {
    const root = document.getElementById("view-invest");
    if (!root) return;

    if (!state.investments || state.investments.length === 0) {
      state.investments = [
        { id: 'inv-1', name: 'Vàng Nhẫn 9999 (1 chỉ)', type: 'gold', initialVal: 7600000, currentVal: 8750000 },
        { id: 'inv-2', name: 'Tiết Kiệm Ngân Hàng Kỳ Hạn 6T', type: 'bank', initialVal: 30000000, currentVal: 30900000 },
        { id: 'inv-3', name: 'Chứng Chỉ Quỹ Cổ Phiếu VN30', type: 'fund', initialVal: 10000000, currentVal: 11450000 }
      ];
    }

    const totalInit = state.investments.reduce((sum, i) => sum + (i.initialVal || 0), 0);
    const totalCurrent = state.investments.reduce((sum, i) => sum + (i.currentVal || 0), 0);
    const totalProfit = totalCurrent - totalInit;
    const profitRate = totalInit > 0 ? ((totalProfit / totalInit) * 100).toFixed(1) : 0;

    // Tính tỷ trọng phân bổ
    const goldVal = state.investments.filter(i => i.type === 'gold').reduce((s, i) => s + i.currentVal, 0);
    const fundVal = state.investments.filter(i => i.type === 'fund').reduce((s, i) => s + i.currentVal, 0);
    const bankVal = state.investments.filter(i => i.type === 'bank').reduce((s, i) => s + i.currentVal, 0);
    const otherVal = totalCurrent - goldVal - fundVal - bankVal;

    const pGold = totalCurrent > 0 ? Math.round((goldVal / totalCurrent) * 100) : 0;
    const pFund = totalCurrent > 0 ? Math.round((fundVal / totalCurrent) * 100) : 0;
    const pBank = totalCurrent > 0 ? Math.round((bankVal / totalCurrent) * 100) : 0;
    const pOther = Math.max(0, 100 - pGold - pFund - pBank);

    root.innerHTML = `
      <!-- Header Trang Đầu Tư -->
      <header class="flex items-center justify-between gap-2.5 p-2.5 rounded-2xl sm:rounded-3xl custom-bg-card border custom-border custom-shadow-sm sticky top-0 z-10 backdrop-blur-md">
        <div class="flex items-center gap-2.5">
          <button onclick="switchView('dashboard')" 
            class="w-10 h-10 rounded-xl sm:rounded-2xl custom-bg-input flex items-center justify-center custom-text hover:scale-105 active:scale-95 transition-all shrink-0 shadow-sm"
            title="Quay lại Tổng quan">
            <i class="fa-solid fa-arrow-left text-sm sm:text-base"></i>
          </button>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-base sm:text-lg font-black custom-text tracking-tight">Đầu Tư & Tích Sản</h1>
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/30">
                💎 Wealth Hub
              </span>
            </div>
            <p class="text-[11px] custom-text-secondary leading-none hidden sm:block mt-0.5">Theo dõi Vàng, Cổ phiếu, Quỹ mở & Mô phỏng Lãi kép</p>
          </div>
        </div>

        <button onclick="openAddInvestModal()" 
          class="py-2.5 px-3.5 sm:px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-amber-500/25 active:scale-95 transition-all">
          <i class="fa-solid fa-plus text-xs"></i> <span>Thêm Tài Sản</span>
        </button>
      </header>

      <!-- Bento Hero: Portfolio Overview (Compact, Không Bị Chiếm Diện Tích) -->
      <div class="driver-bento-glass rounded-3xl p-5 sm:p-6 custom-shadow-md border custom-border space-y-4">
        <div>
          <span class="text-[10px] font-black uppercase tracking-wider custom-text-secondary block mb-1">
            Tổng Giá Trị Danh Mục Tích Sản
          </span>
          <div class="flex flex-wrap items-baseline gap-3">
            <span class="text-2xl sm:text-4xl font-black custom-text tracking-tight">${moneyStr(totalCurrent)}</span>
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${totalProfit >= 0 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'}">
              <i class="fa-solid ${totalProfit >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'} text-[10px]"></i>
              ${totalProfit >= 0 ? '+' : ''}${profitRate}% (${moneyStr(totalProfit)})
            </span>
          </div>
        </div>

        <!-- 2 Sub-metrics Gọn Gàng -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          <div class="p-3 rounded-2xl custom-bg-input border custom-border">
            <span class="text-[9px] font-bold custom-text-secondary uppercase tracking-wider block mb-0.5">Vốn Gốc Đã Giải Ngân</span>
            <span class="text-xs sm:text-sm font-black custom-text">${moneyStr(totalInit)}</span>
          </div>
          <div class="p-3 rounded-2xl custom-bg-input border custom-border">
            <span class="text-[9px] font-bold custom-text-secondary uppercase tracking-wider block mb-0.5">Lợi Nhuận Tạm Tính</span>
            <span class="text-xs sm:text-sm font-black ${totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}">+${moneyStr(totalProfit)}</span>
          </div>
          <div class="col-span-2 sm:col-span-1 p-3 rounded-2xl custom-bg-input border custom-border flex items-center justify-between sm:block">
            <span class="text-[9px] font-bold custom-text-secondary uppercase tracking-wider block mb-0.5">Số Danh Mục</span>
            <span class="text-xs sm:text-sm font-black custom-text">${state.investments.length} danh mục</span>
          </div>
        </div>

        <!-- Thanh Phân Bổ Danh Mục Trực Quan -->
        <div class="pt-2">
          <div class="flex items-center justify-between text-[11px] font-bold custom-text-secondary mb-1.5">
            <span>Phân Bổ Tài Sản</span>
            <span>100% Danh mục</span>
          </div>
          <div class="w-full h-3 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden flex shadow-inner">
            <div style="width: ${pGold}%" class="bg-amber-400 h-full" title="Vàng: ${pGold}%"></div>
            <div style="width: ${pFund}%" class="bg-indigo-500 h-full" title="Quỹ mở: ${pFund}%"></div>
            <div style="width: ${pBank}%" class="bg-emerald-500 h-full" title="Tiết kiệm: ${pBank}%"></div>
            <div style="width: ${pOther}%" class="bg-fuchsia-500 h-full" title="Khác: ${pOther}%"></div>
          </div>
          <div class="flex flex-wrap items-center gap-3 mt-2 text-[10px] font-bold custom-text-secondary">
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-400"></span> Vàng (${pGold}%)</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-indigo-500"></span> Quỹ mở (${pFund}%)</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> Tiết kiệm (${pBank}%)</span>
            ${pOther > 0 ? `<span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-fuchsia-500"></span> Khác (${pOther}%)</span>` : ''}
          </div>
        </div>
      </div>

      <!-- Danh Sách Các Khoản Tích Sản Nắm Giữ -->
      <div class="driver-bento-glass rounded-3xl p-5 sm:p-6 custom-shadow-sm border custom-border space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-black uppercase tracking-wider custom-text flex items-center gap-2">
            <i class="fa-solid fa-layer-group text-amber-400"></i> Danh Mục Nắm Giữ
          </h3>
          <span class="text-xs font-bold text-primary-500">${state.investments.length} tài sản</span>
        </div>

        <div class="space-y-2.5">
          ${state.investments.map(inv => {
            const gain = (inv.currentVal || 0) - (inv.initialVal || 0);
            const rate = inv.initialVal > 0 ? ((gain / inv.initialVal) * 100).toFixed(1) : 0;
            const icon = inv.type === 'gold' ? '🥇' : (inv.type === 'bank' ? '🏦' : '📈');
            return `
              <div class="p-3.5 rounded-2xl custom-bg-input border custom-border flex items-center justify-between gap-3 hover:border-amber-500/40 transition-all">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-white/5 border custom-border flex items-center justify-center text-lg shrink-0">
                    ${icon}
                  </div>
                  <div>
                    <h4 class="font-bold text-xs sm:text-sm custom-text">${inv.name}</h4>
                    <span class="text-[10px] custom-text-secondary">Vốn gốc: ${moneyStr(inv.initialVal)}</span>
                  </div>
                </div>

                <div class="text-right">
                  <div class="font-black text-xs sm:text-sm custom-text">${moneyStr(inv.currentVal)}</div>
                  <span class="inline-block text-[10px] font-bold ${gain >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
                    ${gain >= 0 ? '+' : ''}${rate}% (+${moneyStr(gain)})
                  </span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Công Cụ Mô Phỏng Lãi Kép Thông Minh -->
      <div class="driver-bento-glass rounded-3xl p-5 sm:p-6 custom-shadow-sm border custom-border space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-black uppercase tracking-wider custom-text flex items-center gap-2">
            <i class="fa-solid fa-calculator text-indigo-400"></i> Mô Phỏng Sức Mạnh Lãi Kép
          </h3>
          <span class="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
            Kỳ quan thứ 8
          </span>
        </div>

        <div class="space-y-3.5">
          <!-- Input Tiết kiệm hàng tháng -->
          <div>
            <div class="flex items-center justify-between text-xs font-bold custom-text mb-1.5">
              <span>Tiền Tích Lũy Mỗi Tháng:</span>
              <span id="disp-sim-monthly" class="text-primary-500 font-black">3.000.000 ₫</span>
            </div>
            <input type="range" id="sim-monthly" min="500000" max="20000000" step="500000" value="3000000" 
              oninput="updateCompoundSimulator()" 
              class="w-full accent-primary-500 cursor-pointer">
            <div class="flex gap-2 mt-1.5">
              <button onclick="setSimMonthly(1000000)" class="px-2 py-1 rounded-lg custom-bg-input text-[10px] font-bold border custom-border hover:border-primary-500">1 Triệu</button>
              <button onclick="setSimMonthly(3000000)" class="px-2 py-1 rounded-lg custom-bg-input text-[10px] font-bold border custom-border hover:border-primary-500">3 Triệu</button>
              <button onclick="setSimMonthly(5000000)" class="px-2 py-1 rounded-lg custom-bg-input text-[10px] font-bold border custom-border hover:border-primary-500">5 Triệu</button>
              <button onclick="setSimMonthly(10000000)" class="px-2 py-1 rounded-lg custom-bg-input text-[10px] font-bold border custom-border hover:border-primary-500">10 Triệu</button>
            </div>
          </div>

          <!-- Input Lãi suất kỳ vọng -->
          <div>
            <div class="flex items-center justify-between text-xs font-bold custom-text mb-1.5">
              <span>Lãi Suất Kỳ Vọng (%/năm):</span>
              <span id="disp-sim-rate" class="text-amber-400 font-black">10 %/năm</span>
            </div>
            <input type="range" id="sim-rate" min="5" max="25" step="0.5" value="10" 
              oninput="updateCompoundSimulator()" 
              class="w-full accent-amber-500 cursor-pointer">
            <div class="flex gap-2 mt-1.5">
              <button onclick="setSimRate(6)" class="px-2 py-1 rounded-lg custom-bg-input text-[10px] font-bold border custom-border hover:border-amber-500">6% (Ngân hàng)</button>
              <button onclick="setSimRate(10)" class="px-2 py-1 rounded-lg custom-bg-input text-[10px] font-bold border custom-border hover:border-amber-500">10% (Quỹ mở)</button>
              <button onclick="setSimRate(15)" class="px-2 py-1 rounded-lg custom-bg-input text-[10px] font-bold border custom-border hover:border-amber-500">15% (Cổ phiếu)</button>
            </div>
          </div>

          <!-- Input Số năm -->
          <div>
            <div class="flex items-center justify-between text-xs font-bold custom-text mb-1.5">
              <span>Thời Gian Đầu Tư:</span>
              <span id="disp-sim-years" class="text-indigo-400 font-black">5 năm</span>
            </div>
            <div class="grid grid-cols-4 gap-2">
              <button onclick="setSimYears(3)" id="btn-yr-3" class="py-1.5 rounded-xl custom-bg-input border custom-border text-xs font-bold hover:border-indigo-500">3 Năm</button>
              <button onclick="setSimYears(5)" id="btn-yr-5" class="py-1.5 rounded-xl bg-indigo-500 text-white border border-indigo-400 text-xs font-bold">5 Năm</button>
              <button onclick="setSimYears(10)" id="btn-yr-10" class="py-1.5 rounded-xl custom-bg-input border custom-border text-xs font-bold hover:border-indigo-500">10 Năm</button>
              <button onclick="setSimYears(20)" id="btn-yr-20" class="py-1.5 rounded-xl custom-bg-input border custom-border text-xs font-bold hover:border-indigo-500">20 Năm</button>
            </div>
          </div>

          <!-- Hộp Kết Quả Lãi Kép -->
          <div id="sim-result-box" class="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-indigo-950/40 to-slate-900 border border-emerald-500/30 flex items-center justify-between">
            <!-- Tự động cập nhật bởi JS -->
          </div>
        </div>
      </div>
    `;

    // Kích hoạt tính toán ban đầu
    window.currentSimYears = 5;
    updateCompoundSimulator();
  };

  window.setSimMonthly = function(val) {
    const el = document.getElementById('sim-monthly');
    if (el) { el.value = val; updateCompoundSimulator(); }
  };

  window.setSimRate = function(val) {
    const el = document.getElementById('sim-rate');
    if (el) { el.value = val; updateCompoundSimulator(); }
  };

  window.setSimYears = function(val) {
    window.currentSimYears = val;
    [3, 5, 10, 20].forEach(y => {
      const b = document.getElementById(`btn-yr-${y}`);
      if (b) {
        if (y === val) {
          b.className = "py-1.5 rounded-xl bg-indigo-500 text-white border border-indigo-400 text-xs font-bold";
        } else {
          b.className = "py-1.5 rounded-xl custom-bg-input border custom-border text-xs font-bold hover:border-indigo-500";
        }
      }
    });
    updateCompoundSimulator();
  };

  window.updateCompoundSimulator = function() {
    const monthlyEl = document.getElementById('sim-monthly');
    const rateEl = document.getElementById('sim-rate');
    if (!monthlyEl || !rateEl) return;

    const monthly = parseInt(monthlyEl.value || 3000000);
    const rate = parseFloat(rateEl.value || 10);
    const years = window.currentSimYears || 5;

    const dispM = document.getElementById('disp-sim-monthly');
    const dispR = document.getElementById('disp-sim-rate');
    const dispY = document.getElementById('disp-sim-years');
    if (dispM) dispM.innerText = moneyStr(monthly);
    if (dispR) dispR.innerText = rate + " %/năm";
    if (dispY) dispY.innerText = years + " năm";

    // Công thức tính lãi kép định kỳ hàng tháng
    const months = years * 12;
    const r_month = (rate / 100) / 12;
    let fv = 0;
    if (r_month > 0) {
      fv = monthly * ((Math.pow(1 + r_month, months) - 1) / r_month);
    } else {
      fv = monthly * months;
    }

    const totalContributed = monthly * months;
    const compoundGains = fv - totalContributed;

    const box = document.getElementById('sim-result-box');
    if (box) {
      box.innerHTML = `
        <div>
          <span class="text-[9px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">Sau ${years} năm sẽ nhận được</span>
          <span class="text-lg sm:text-2xl font-black text-emerald-400">${moneyStr(Math.round(fv))}</span>
          <span class="text-[10px] custom-text-secondary block mt-0.5">Vốn gốc: ${moneyStr(totalContributed)}</span>
        </div>
        <div class="text-right">
          <span class="text-[9px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">Tiền lãi thuần túy</span>
          <span class="text-sm sm:text-lg font-black text-amber-400">+${moneyStr(Math.round(compoundGains))}</span>
          <span class="text-[10px] text-emerald-400 font-bold block mt-0.5">Gấp x${(fv / totalContributed).toFixed(2)} lần vốn</span>
        </div>
      `;
    }
  };

  window.openAddInvestModal = function() {
    const name = prompt("Nhập tên tài sản đầu tư (vd: Vàng SJC, Cổ phiếu FPT, Quỹ mở):", "Vàng Nhẫn 9999");
    if (!name) return;
    const initStr = prompt("Nhập số tiền vốn ban đầu (VNĐ):", "5000000");
    const initVal = initStr ? parseInt(initStr.replace(/\D/g, '') || 0) : 0;
    const curStr = prompt("Nhập giá trị hiện tại (VNĐ):", initStr || "5000000");
    const curVal = curStr ? parseInt(curStr.replace(/\D/g, '') || 0) : initVal;

    state.investments.push({
      id: 'inv-' + (typeof generateId === 'function' ? generateId() : Date.now()),
      name: name,
      type: name.toLowerCase().includes('vàng') ? 'gold' : (name.toLowerCase().includes('tiết kiệm') ? 'bank' : 'fund'),
      initialVal: initVal,
      currentVal: curVal
    });

    if (typeof saveData === 'function') saveData();
    window.renderInvest();
    if (typeof playSound === 'function') playSound("success");
    if (typeof confetti === 'function') confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  // ==============================================================
  // 3. TRANG MỚI 3: FINMASTER WRAPPED & BÁO CÁO THÁNG (view-report)
  // ==============================================================
  window.renderReport = function() {
    const root = document.getElementById("view-report");
    if (!root) return;

    const now = new Date();
    const cm = now.getMonth();
    const cy = now.getFullYear();

    const monthTxs = (state.transactions || []).filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === cm && d.getFullYear() === cy;
    });

    const expenses = monthTxs.filter(t => t.type === 'expense');
    const totalExp = expenses.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalInc = monthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
    const netSavings = totalInc - totalExp;
    const savingsRate = totalInc > 0 ? Math.round((netSavings / totalInc) * 100) : 0;

    // Phân bổ danh mục
    const catExpMap = {};
    expenses.forEach(t => {
      const c = t.category || 'other';
      catExpMap[c] = (catExpMap[c] || 0) + (t.amount || 0);
    });

    let topCatId = null;
    let topCatAmt = 0;
    Object.keys(catExpMap).forEach(cId => {
      if (catExpMap[cId] > topCatAmt) {
        topCatAmt = catExpMap[cId];
        topCatId = cId;
      }
    });

    const topCatObj = (state.categories || []).find(c => c.id === topCatId) || { name: 'Chưa có', icon: '📦' };

    // Sắp xếp các danh mục chi nhiều nhất
    const sortedCats = Object.keys(catExpMap)
      .map(cId => {
        const cat = (state.categories || []).find(c => c.id === cId) || { name: cId, icon: '🏷️' };
        return { name: cat.name, icon: cat.icon, amount: catExpMap[cId], percent: totalExp > 0 ? Math.round((catExpMap[cId] / totalExp) * 100) : 0 };
      })
      .sort((a, b) => b.amount - a.amount);

    root.innerHTML = `
      <!-- Header Trang Báo Cáo Wrapped -->
      <header class="flex items-center justify-between gap-2.5 p-2.5 rounded-2xl sm:rounded-3xl custom-bg-card border custom-border custom-shadow-sm sticky top-0 z-10 backdrop-blur-md">
        <div class="flex items-center gap-2.5">
          <button onclick="switchView('dashboard')" 
            class="w-10 h-10 rounded-xl sm:rounded-2xl custom-bg-input flex items-center justify-center custom-text hover:scale-105 active:scale-95 transition-all shrink-0 shadow-sm"
            title="Quay lại Tổng quan">
            <i class="fa-solid fa-arrow-left text-sm sm:text-base"></i>
          </button>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-base sm:text-lg font-black custom-text tracking-tight">FinMaster Wrapped</h1>
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-400 border border-rose-500/30">
                🎉 Tháng ${cm + 1}/${cy}
              </span>
            </div>
            <p class="text-[11px] custom-text-secondary leading-none hidden sm:block mt-0.5">Báo cáo tài chính infographic & tổng kết phong cách sống</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="shareWrappedCard()" 
            class="py-2.5 px-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-pink-500/25 active:scale-95 transition-all"
            title="Chia sẻ báo cáo">
            <i class="fa-solid fa-share-nodes text-xs"></i> <span class="hidden sm:inline">Chia Sẻ</span>
          </button>
          <button onclick="window.print()" 
            class="py-2.5 px-3.5 rounded-xl sm:rounded-2xl custom-bg-input custom-text font-black text-xs sm:text-sm flex items-center gap-1.5 border custom-border active:scale-95 transition-all"
            title="In hoặc Xuất PDF">
            <i class="fa-solid fa-print text-xs"></i> <span class="hidden sm:inline">In PDF</span>
          </button>
        </div>
      </header>

      <!-- Wrapped Aurora Card (Thiết kế Spotify Wrapped Đỉnh Cao) -->
      <div id="wrapped-capture-area" class="rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl border border-purple-500/30"
        style="background: linear-gradient(135deg, #090d16 0%, #2e1065 45%, #172554 100%);">
        
        <!-- Vòng Tròn Ánh Sáng Nền Neon -->
        <div class="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 space-y-6">
          
          <!-- Top Badge -->
          <div class="flex items-center justify-between border-b border-white/10 pb-4">
            <div class="flex items-center gap-2">
              <span class="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sm">✨</span>
              <div>
                <span class="text-xs font-black tracking-widest uppercase text-purple-300 block">FinMaster Wrapped</span>
                <span class="text-[10px] text-white/60">Tóm tắt phong cách tiền bạc</span>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-black bg-white/10 border border-white/20">
              Tháng ${cm + 1}/${cy}
            </span>
          </div>

          <!-- 4 Khối Chỉ Số Vàng 2x2 Bento -->
          <div class="grid grid-cols-2 gap-3 sm:gap-4">
            <div class="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span class="text-[9px] font-bold text-white/60 uppercase tracking-wider block mb-1">Tổng Số Tiền Đã Chi</span>
              <div class="text-xl sm:text-2xl font-black text-rose-300 tracking-tight">${moneyStr(totalExp)}</div>
              <span class="text-[10px] text-white/50 block mt-1">${expenses.length} giao dịch xuất ví</span>
            </div>

            <div class="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span class="text-[9px] font-bold text-white/60 uppercase tracking-wider block mb-1">Tổng Thu Nhập Đạt</span>
              <div class="text-xl sm:text-2xl font-black text-emerald-300 tracking-tight">${moneyStr(totalInc)}</div>
              <span class="text-[10px] text-white/50 block mt-1">${monthTxs.filter(t => t.type === 'income').length} dòng tiền về ví</span>
            </div>

            <div class="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span class="text-[9px] font-bold text-white/60 uppercase tracking-wider block mb-1">Tỷ Lệ Tích Lũy Ròng</span>
              <div class="text-xl sm:text-2xl font-black ${savingsRate >= 20 ? 'text-emerald-300' : 'text-amber-300'} tracking-tight">${savingsRate}%</div>
              <span class="text-[10px] text-white/50 block mt-1">${savingsRate >= 20 ? 'Chuẩn Độc Lập 🌟' : 'Cần Tiết Kiệm Thêm ⚠️'}</span>
            </div>

            <div class="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span class="text-[9px] font-bold text-white/60 uppercase tracking-wider block mb-1">Hạng Mục "Chi Đậm Nhất"</span>
              <div class="text-xl sm:text-2xl font-black text-amber-300 tracking-tight truncate">${topCatObj.name}</div>
              <span class="text-[10px] text-white/50 block mt-1">${moneyStr(topCatAmt)}</span>
            </div>
          </div>

          <!-- Tỷ Trọng Phân Bổ Chi Tiêu Từng Hạng Mục -->
          <div class="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
            <h4 class="text-xs font-black uppercase tracking-wider text-purple-200 flex items-center gap-1.5">
              <i class="fa-solid fa-chart-pie"></i> Cơ Cấu Chi Tiêu Trong Tháng
            </h4>

            ${sortedCats.length > 0 ? `
              <div class="space-y-2.5">
                ${sortedCats.slice(0, 4).map(c => `
                  <div>
                    <div class="flex items-center justify-between text-xs font-bold mb-1">
                      <span class="flex items-center gap-1.5">${c.icon} ${c.name}</span>
                      <span>${moneyStr(c.amount)} (${c.percent}%)</span>
                    </div>
                    <div class="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div class="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full" style="width: ${c.percent}%"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <p class="text-xs text-white/60 text-center py-2">Chưa phát sinh giao dịch chi tiêu trong tháng này.</p>
            `}
          </div>

          <!-- Huy Hiệu Vinh Danh Phong Cách Tiêu Tiền -->
          <div class="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-indigo-500/20 border border-amber-400/30 text-center space-y-1">
            <span class="text-2xl block">🏆</span>
            <span class="text-xs font-black uppercase tracking-wider text-amber-300 block">
              ${totalExp === 0 ? 'Bậc Thầy Tiết Kiệm Tuyệt Đối' : (topCatObj.name.includes('Ăn') ? 'Chiến Thần Ẩm Thực & Trải Nghiệm' : 'Nhà Chi Tiêu Thực Tế')}
            </span>
            <p class="text-[11px] text-white/70 max-w-sm mx-auto">
              Cảm ơn bạn đã đồng hành cùng FinMaster Pro. Một tháng tài chính nhiều dấu ấn và trưởng thành!
            </p>
          </div>

          <!-- Wrapped Footer -->
          <div class="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
            <span>FinMaster Pro • E-Statement</span>
            <span>DuyKiet04 • ${cy}</span>
          </div>
        </div>
      </div>
    `;
  };

  window.shareWrappedCard = function() {
    if (typeof confetti === 'function') confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    if (typeof playSound === 'function') playSound("success");
    
    // Sao chép nội dung tóm tắt vào clipboard
    const text = `🎉 FinMaster Wrapped 2026: Tôi vừa tổng kết tài chính cá nhân với FinMaster Pro! Hãy cùng kiểm soát dòng tiền và nhân bản tài sản thông minh nhé!`;
    navigator.clipboard?.writeText(text).then(() => {
      alert("🎉 Đã sao chép tóm tắt FinMaster Wrapped vào bộ nhớ tạm! Bạn có thể dán lên mạng xã hội hoặc chụp ảnh màn hình lưu lại!");
    }).catch(() => {
      alert("🎉 Bạn hãy chụp ảnh màn hình thẻ Wrapped để lưu lại hoặc đăng lên Story Facebook / Instagram!");
    });
  };

  // ==============================================================
  // 4. LỘT XÁC CÁC TRANG CÒN LẠI: WALLETS, DEBTS, TRIPS
  // ==============================================================

  // NÂNG CẤP TRANG VÍ TIỀN (view-wallets)
  const origRenderWallets = window.renderWallets;
  window.renderWallets = function() {
    const cont = document.getElementById("wallets-container");
    if (!cont) return;

    const WALLET_THEMES = [
      { grad: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)', badge: 'Techcombank / Visa', color: 'indigo' },
      { grad: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)', badge: 'Vietcombank / Master', color: 'emerald' },
      { grad: 'linear-gradient(135deg, #881337 0%, #be123c 50%, #e11d48 100%)', badge: 'MB Bank / Napas', color: 'rose' },
      { grad: 'linear-gradient(135deg, #172554 0%, #1e40af 50%, #3b82f6 100%)', badge: 'ACB / JCB', color: 'blue' },
      { grad: 'linear-gradient(135deg, #451a03 0%, #b45309 50%, #f59e0b 100%)', badge: 'Tiền mặt / Heo Đất', color: 'amber' }
    ];

    cont.innerHTML = (state.wallets || []).map((w, idx) => {
      const theme = WALLET_THEMES[idx % WALLET_THEMES.length];
      return `
        <div class="relative rounded-3xl p-6 text-white shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer group"
          style="background: ${theme.grad}; min-height: 200px;">
          <!-- Chip điện tử & NFC Icon -->
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-2">
              <span class="w-10 h-7 rounded-md bg-amber-300/80 border border-amber-200/50 shadow-inner flex items-center justify-center text-[10px] text-amber-900 font-bold">
                <i class="fa-solid fa-microchip"></i>
              </span>
              <i class="fa-solid fa-wifi rotate-90 text-xs opacity-75"></i>
            </div>
            <span class="text-xs font-black tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
              ${w.name}
            </span>
          </div>

          <!-- Số Dư Thẻ -->
          <div class="mb-4">
            <span class="text-[10px] font-bold uppercase tracking-wider text-white/70 block">Số Dư Hiện Khả Dụng</span>
            <div class="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-md">
              ${moneyStr(w.balance)}
            </div>
          </div>

          <!-- Card Bottom -->
          <div class="flex items-center justify-between text-xs text-white/80 border-t border-white/10 pt-3">
            <span class="font-mono tracking-widest">•••• •••• •••• ${1000 + idx * 88}</span>
            <span class="font-bold uppercase">${theme.badge}</span>
          </div>
        </div>
      `;
    }).join('');
  };

  // NÂNG CẤP TRANG NỢ & VAY (view-debts)
  const origRenderDebts = window.renderDebts;
  window.renderDebts = function() {
    if (origRenderDebts) origRenderDebts();
    const items = document.querySelectorAll('#debts-content-list > div');
    items.forEach(el => {
      el.classList.add('transition-all', 'duration-300', 'hover:-translate-y-1', 'hover:shadow-lg');
    });
  };

  // NÂNG CẤP TRANG CHUYẾN ĐI (view-trips)
  const origRenderTrips = window.renderTrips;
  window.renderTrips = function() {
    if (origRenderTrips) origRenderTrips();
    const items = document.querySelectorAll('#trips-container > div');
    items.forEach(el => {
      el.classList.add('transition-all', 'duration-300', 'hover:-translate-y-1', 'hover:shadow-lg');
    });
  };

  // ==============================================================
  // 5. HOOK CHUYỂN TRANG TOÀN HỆ THỐNG
  // ==============================================================
  const origSwitchView = window.switchView;
  window.switchView = function(viewId) {
    if (origSwitchView) origSwitchView(viewId);

    if (viewId === 'ai-advisor') window.renderAIAdvisor();
    if (viewId === 'invest') window.renderInvest();
    if (viewId === 'report') window.renderReport();
    if (viewId === 'wallets') window.renderWallets();
    if (viewId === 'debts') window.renderDebts();
    if (viewId === 'trips') window.renderTrips();

    // Hiệu ứng tương tác với Three.js không gian 3D
    if (typeof window.burstThree3DParticles === 'function') {
      window.burstThree3DParticles();
    }
  };

})();
