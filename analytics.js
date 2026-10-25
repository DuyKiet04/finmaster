// ==============================================================
// GIAO DIỆN & BỘ NÃO: BÁO CÁO PHÂN TÍCH TÀI CHÍNH (EXECUTIVE ANALYTICS)
// BẢN NÂNG CẤP LIQUID GLASS & BENTO GRID - PHÂN TÍCH CHUYÊN SÂU
// ==============================================================

(function injectAnalyticsUI() {
    if (document.getElementById('analytics-overlay')) return;

    const analyticsHTML = `
    <div id="analytics-overlay" class="fixed inset-0 z-[200] custom-bg-body transition-transform duration-300 ease-out translate-x-full flex flex-col hidden font-sans">
        
        <!-- 1. HEADER TRONG SUỐT BÁM ĐỈNH (LIQUID GLASS HEADER) -->
        <div class="sticky top-0 z-30 custom-bg-header backdrop-blur-2xl px-3 sm:px-4 py-3 flex items-center justify-between shadow-sm shrink-0 border-b custom-border">
            <button onclick="closeAnalytics()" class="w-10 h-10 flex items-center justify-center rounded-2xl custom-bg-input custom-text-secondary hover:text-primary-500 active:scale-90 transition-transform custom-shadow-sm border custom-border">
                <i class="fa-solid fa-arrow-left"></i>
            </button>
            <div class="text-center flex-1 px-2 min-w-0">
                <h3 class="font-black text-sm sm:text-base custom-text tracking-tight truncate">Báo Cáo Phân Tích</h3>
                <p class="text-[10px] font-bold custom-text-secondary truncate">Tài chính, tỷ trọng & dòng tiền</p>
            </div>
            <!-- Quick Actions Header (Xuất báo cáo) -->
            <div class="flex items-center gap-1.5 shrink-0">
                <button onclick="anExportSummary()" class="px-3 py-1.5 rounded-xl bg-primary-500/15 text-primary-500 hover:bg-primary-500/25 border border-primary-500/30 text-xs font-black flex items-center gap-1.5 active:scale-95 transition-all shadow-sm" title="Xuất báo cáo tài chính">
                    <i class="fa-solid fa-share-nodes text-[11px]"></i>
                    <span class="hidden sm:inline">Xuất BC</span>
                </button>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar relative pb-28" id="analytics-scroll-area">
            
            <!-- 2. KHU VỰC ĐIỀU KHIỂN & LỌC (SMART CONTROLS) -->
            <div class="px-3 sm:px-4 py-3.5 space-y-3 max-w-4xl mx-auto">
                
                <!-- SCOPE TABS (Tháng / Quý / Năm) -->
                <div class="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-2xl border custom-border text-xs font-black">
                    <button id="an-scope-month" onclick="anSetScope('month')" class="an-tab-btn active flex-1 py-1.5 rounded-xl text-center">Tháng</button>
                    <button id="an-scope-quarter" onclick="anSetScope('quarter')" class="an-tab-btn flex-1 py-1.5 rounded-xl text-center custom-text-secondary">Quý</button>
                    <button id="an-scope-year" onclick="anSetScope('year')" class="an-tab-btn flex-1 py-1.5 rounded-xl text-center custom-text-secondary">Năm</button>
                </div>

                <!-- DATE STEPPER & WALLET SELECTOR ROW -->
                <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center custom-bg-card rounded-2xl border custom-border p-1 shadow-sm shrink-0">
                        <button onclick="changeAnMonth(-1)" class="w-8 h-8 rounded-xl custom-bg-input custom-text flex items-center justify-center transition-colors active:scale-90" title="Kỳ trước">
                            <i class="fa-solid fa-chevron-left text-xs"></i>
                        </button>
                        <span id="an-month-label" class="px-3 text-xs sm:text-sm font-black custom-text uppercase tracking-wider min-w-[85px] text-center">T10/2026</span>
                        <button onclick="changeAnMonth(1)" class="w-8 h-8 rounded-xl custom-bg-input custom-text flex items-center justify-center transition-colors active:scale-90" title="Kỳ sau">
                            <i class="fa-solid fa-chevron-right text-xs"></i>
                        </button>
                    </div>

                    <div class="flex-1 relative min-w-0">
                        <select id="an-wallet-select" onchange="renderAnalyticsData()" class="w-full custom-bg-card border custom-border rounded-2xl outline-none text-xs font-bold custom-text px-3 py-2.5 appearance-none shadow-sm custom-focus cursor-pointer truncate">
                        </select>
                        <i class="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] custom-text-secondary pointer-events-none"></i>
                    </div>
                </div>

                <!-- 3-WAY TYPE SWITCHER CAPSULE (Chi / Thu / Dòng tiền) -->
                <div class="flex custom-bg-input p-1 rounded-2xl border custom-border shadow-sm">
                    <button id="an-tab-expense" onclick="switchAnType('expense')" class="an-tab-btn active flex-1 py-2 text-xs sm:text-sm font-black rounded-xl transition-all custom-primary text-white shadow-sm flex items-center justify-center gap-1.5">
                        <i class="fa-solid fa-fire text-rose-300"></i> Khoản Chi
                    </button>
                    <button id="an-tab-income" onclick="switchAnType('income')" class="an-tab-btn flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all custom-text-secondary flex items-center justify-center gap-1.5">
                        <i class="fa-solid fa-coins text-emerald-400"></i> Khoản Thu
                    </button>
                    <button id="an-tab-net" onclick="switchAnType('net')" class="an-tab-btn flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all custom-text-secondary flex items-center justify-center gap-1.5">
                        <i class="fa-solid fa-scale-balanced text-indigo-400"></i> Dòng Tiền
                    </button>
                </div>
            </div>

            <!-- 3. NỘI DUNG CHÍNH (MAIN BENTO CONTENT) -->
            <div class="px-3 sm:px-4 space-y-4 max-w-4xl mx-auto">
                
                <!-- HERO BENTO BANNER TỔNG TIỀN -->
                <div id="an-hero-card" class="an-hero-card expense-theme p-5 sm:p-6 text-white flex flex-col justify-center text-center transition-all duration-300">
                    <div class="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20 pointer-events-none"></div>
                    
                    <div class="relative z-10 flex items-center justify-between mb-2">
                        <span id="an-hero-badge" class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-sm shadow-sm">Tháng Này</span>
                        <span id="an-hero-scope-name" class="text-[11px] font-semibold opacity-90">Kỳ báo cáo</span>
                    </div>

                    <p class="relative z-10 text-[11px] font-black uppercase tracking-widest mb-1 opacity-90" id="an-hero-label">TỔNG CHI THÁNG NÀY</p>
                    <h2 id="an-total-amount" class="relative z-10 text-3xl sm:text-4xl font-black tracking-tight mb-4 drop-shadow-md">0 ₫</h2>
                    
                    <!-- 4 Sub-metrics in Hero -->
                    <div class="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/25">
                        <div class="p-2 rounded-xl bg-black/15 backdrop-blur-sm text-left">
                            <p class="text-[9px] font-bold uppercase tracking-wider opacity-80 mb-0.5">TB / Ngày</p>
                            <p id="an-avg-daily" class="text-xs sm:text-sm font-black truncate">0 ₫</p>
                        </div>
                        <div class="p-2 rounded-xl bg-black/15 backdrop-blur-sm text-left">
                            <p class="text-[9px] font-bold uppercase tracking-wider opacity-80 mb-0.5">So kỳ trước</p>
                            <p id="an-trend-pct" class="text-xs sm:text-sm font-black truncate">--</p>
                        </div>
                        <div class="p-2 rounded-xl bg-black/15 backdrop-blur-sm text-left">
                            <p class="text-[9px] font-bold uppercase tracking-wider opacity-80 mb-0.5">Chi nhiều nhất</p>
                            <p id="an-top-category-name" class="text-xs sm:text-sm font-black truncate">--</p>
                        </div>
                        <div class="p-2 rounded-xl bg-black/15 backdrop-blur-sm text-left">
                            <p class="text-[9px] font-bold uppercase tracking-wider opacity-80 mb-0.5">Số giao dịch</p>
                            <p id="an-tx-count" class="text-xs sm:text-sm font-black truncate">0 lượt</p>
                        </div>
                    </div>

                    <!-- AI CẢNH BÁO & DỰ PHÓNG THÔNG MINH -->
                    <div id="an-forecast-box" class="relative z-10 mt-3.5 bg-black/25 backdrop-blur-md p-3.5 rounded-2xl flex items-start gap-3 border border-white/20 shadow-inner text-left">
                        <div class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-sm shrink-0 an-robot-anim">
                            <i class="fa-solid fa-robot"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between">
                                <p class="text-[10px] font-black uppercase tracking-wider opacity-90">AI Cố Vấn Tài Chính</p>
                                <span id="an-burn-badge" class="text-[9px] px-2 py-0.2 rounded-md font-bold bg-white/20">An toàn</span>
                            </div>
                            <p id="an-forecast-text" class="text-xs font-semibold mt-0.5 leading-relaxed opacity-95">Đang tổng hợp dữ liệu chi tiêu...</p>
                        </div>
                    </div>
                </div>

                <!-- 4. CASH FLOW BALANCE RIBBON (DÒNG TIỀN & TỶ LỆ TIẾT KIỆM) -->
                <div class="an-glass-card p-4 sm:p-5">
                    <div class="flex items-center justify-between mb-3 border-b border-dashed custom-border pb-2.5">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-wallet text-primary-500 text-sm"></i>
                            <span class="text-xs font-black custom-text uppercase tracking-wider">Cân Đối Thu Chi & Tiết Kiệm</span>
                        </div>
                        <span id="an-savings-badge" class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-500">Tiết kiệm 0%</span>
                    </div>

                    <div class="grid grid-cols-3 gap-2 text-center mb-3">
                        <div class="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                            <p class="text-[9px] font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-0.5">Tổng Thu</p>
                            <p id="an-flow-income" class="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 truncate">+0 ₫</p>
                        </div>
                        <div class="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                            <p class="text-[9px] font-bold uppercase text-rose-600 dark:text-rose-400 mb-0.5">Tổng Chi</p>
                            <p id="an-flow-expense" class="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400 truncate">-0 ₫</p>
                        </div>
                        <div class="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                            <p class="text-[9px] font-bold uppercase text-indigo-600 dark:text-indigo-400 mb-0.5">Tiền Dư Ròng</p>
                            <p id="an-flow-net" class="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400 truncate">0 ₫</p>
                        </div>
                    </div>

                    <!-- Savings Rate Progress Bar -->
                    <div class="space-y-1">
                        <div class="flex justify-between items-center text-[10px] font-bold custom-text-secondary">
                            <span>Tỷ lệ tích lũy tài sản</span>
                            <span id="an-savings-rate-label" class="font-black custom-text">0%</span>
                        </div>
                        <div class="h-2 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                            <div id="an-savings-progress" class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000" style="width: 0%;"></div>
                        </div>
                    </div>
                </div>

                <!-- 5. BIỂU ĐỒ TRỰC QUAN HÓA (VISUAL CHARTS BENTO) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <!-- BIỂU ĐỒ 1: TỶ TRỌNG DANH MỤC (DOUGHNUT) -->
                    <div class="an-glass-card p-5 sm:p-6 flex flex-col justify-between">
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="font-black text-xs sm:text-sm uppercase tracking-wider custom-text flex items-center gap-2">
                                <i class="fa-solid fa-chart-pie text-primary-500"></i> Cơ Cấu Tỷ Trọng
                            </h4>
                            <span class="text-[10px] font-bold custom-text-secondary">Phần trăm</span>
                        </div>
                        
                        <div class="relative w-44 h-44 sm:w-48 sm:h-48 mx-auto my-3 flex items-center justify-center">
                            <canvas id="an-doughnut-chart"></canvas>
                            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                                <span id="an-chart-center-icon" class="text-2xl mb-0.5">📊</span>
                                <span id="an-chart-center-name" class="text-[11px] font-bold custom-text-secondary truncate max-w-[120px]">Tổng cộng</span>
                                <span id="an-chart-center-pct" class="text-base sm:text-lg font-black custom-text">100%</span>
                            </div>
                        </div>

                        <!-- Top category chips under doughnut -->
                        <div id="an-chart-legend" class="flex flex-wrap items-center justify-center gap-1.5 pt-2 border-t border-dashed custom-border"></div>
                    </div>
                    
                    <!-- BIỂU ĐỒ 2: BIẾN ĐỘNG THEO THỜI GIAN (BAR CHART) -->
                    <div class="an-glass-card p-5 sm:p-6 flex flex-col justify-between">
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="font-black text-xs sm:text-sm uppercase tracking-wider custom-text flex items-center gap-2">
                                <i class="fa-solid fa-chart-column text-rose-500"></i> Biến Động Chu Kỳ
                            </h4>
                            <!-- Toggle Ngày vs Thứ -->
                            <div class="flex items-center gap-1 bg-black/5 dark:bg-white/10 p-0.5 rounded-xl text-[10px] font-black">
                                <button id="an-chart-mode-daily" onclick="anSetChartMode('daily')" class="px-2 py-0.5 rounded-lg bg-primary-500 text-white shadow-sm">Theo ngày</button>
                                <button id="an-chart-mode-weekday" onclick="anSetChartMode('weekday')" class="px-2 py-0.5 rounded-lg custom-text-secondary">Theo thứ</button>
                            </div>
                        </div>

                        <div class="w-full h-44 relative my-2">
                            <canvas id="an-bar-chart"></canvas>
                        </div>

                        <div class="text-[10px] font-semibold custom-text-secondary text-center pt-2 border-t border-dashed custom-border flex items-center justify-center gap-1">
                            <i class="fa-regular fa-lightbulb text-amber-500"></i>
                            <span id="an-peak-day-text">Chạm vào từng cột để xem chi tiết khoản chi ngày đó.</span>
                        </div>
                    </div>
                </div>

                <!-- 6. MA TRẬN XẾP HẠNG TOP DANH MỤC (LEADERBOARD) -->
                <div class="an-glass-card p-5 sm:p-6">
                    <div class="flex items-center justify-between mb-4 border-b border-dashed custom-border pb-3">
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center text-sm shadow-inner">
                                <i class="fa-solid fa-ranking-star"></i>
                            </div>
                            <div>
                                <h4 class="font-black text-xs sm:text-sm uppercase tracking-wider custom-text">Bảng Xếp Hạng Danh Mục</h4>
                                <p class="text-[10px] font-semibold custom-text-secondary">Chi tiết tỷ trọng & tiến độ ngân sách</p>
                            </div>
                        </div>
                        <span id="an-cat-count-badge" class="px-2.5 py-1 rounded-xl text-[10px] font-black bg-black/5 dark:bg-white/10 custom-text">0 danh mục</span>
                    </div>

                    <div id="an-leaderboard" class="space-y-3"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- 7. BOTTOM SHEET (DRILL-DOWN) KHI BẤM VÀO TỪNG DANH MỤC -->
    <div id="an-bottom-sheet-backdrop" onclick="closeAnBottomSheet()" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] hidden opacity-0 transition-opacity duration-300 pointer-events-auto"></div>
    <div id="an-bottom-sheet" class="fixed bottom-0 left-0 right-0 custom-bg-body z-[300] rounded-t-[2.5rem] border-t custom-border shadow-[0_-20px_50px_rgba(0,0,0,0.3)] transform translate-y-full transition-transform duration-300 ease-out flex flex-col max-h-[85vh]">
        <div class="w-full flex justify-center py-3.5 cursor-pointer" onclick="closeAnBottomSheet()">
            <div class="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
        
        <!-- Header Bottom Sheet -->
        <div class="relative px-6 pb-5 border-b border-dashed custom-border flex flex-col items-center text-center overflow-hidden shrink-0">
            <div id="an-bs-bg-icon" class="absolute -top-10 left-1/2 -translate-x-1/2 text-[120px] opacity-10 pointer-events-none select-none"></div>
            <div id="an-bs-icon" class="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] flex items-center justify-center text-3xl sm:text-4xl shadow-lg border border-white/40 mb-2.5 bg-opacity-20 dark:bg-opacity-30"></div>
            <h3 id="an-bs-title" class="relative z-10 font-black text-xl sm:text-2xl custom-text tracking-tight">Danh Mục</h3>
            <p id="an-bs-total" class="relative z-10 text-lg font-black mt-0.5 drop-shadow-sm">0 ₫</p>
        </div>

        <div class="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar bg-black/5 dark:bg-white/5 space-y-4">
            <!-- Giao dịch chấn động nhất -->
            <div id="an-bs-top-tx"></div>
            
            <div>
                <div class="flex items-center justify-between mb-3">
                    <h4 class="font-black text-xs uppercase tracking-wider custom-text flex items-center gap-1.5">
                        <i class="fa-solid fa-list-check text-primary-500"></i> Lịch Sử Chi Tiết
                    </h4>
                    <span id="an-bs-tx-count" class="text-[10px] font-bold custom-text-secondary">0 giao dịch</span>
                </div>
                <div id="an-bs-tx-list" class="space-y-2"></div>
            </div>
        </div>

        <div id="an-bs-action" class="p-3.5 custom-bg-card border-t custom-border shrink-0">
            <button onclick="jumpToCreateBudget()" class="w-full py-3.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-2xl font-black text-sm transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 hover:brightness-110">
                <i class="fa-solid fa-bullseye"></i> Thiết Lập Giới Hạn Ngân Sách
            </button>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', analyticsHTML);
})();

// =====================================
// 2. BIẾN TOÀN CỤC & ENGINE XỬ LÝ
// =====================================
let anCurrentDate = new Date();
let anCurrentType = 'expense'; // 'expense', 'income', 'net'
let anCurrentScope = 'month';  // 'month', 'quarter', 'year'
let anChartBarMode = 'daily';  // 'daily', 'weekday'
let anChartDoughnut = null;
let anChartBar = null;
let anRawTxs = [];
let anBsCurrentCatId = null;

window.openAnalytics = async () => {
    if (typeof Chart === 'undefined' && typeof window.loadScript === 'function') {
        await window.loadScript("https://cdn.jsdelivr.net/npm/chart.js");
    }

    const sel = document.getElementById("an-wallet-select");
    if(sel && state.wallets) {
        sel.innerHTML = '<option value="all">💳 Tất cả ví</option>' + state.wallets.map(w => `<option value="${w.id}">${w.icon || '💰'} ${w.name}</option>`).join('');
    }

    const overlay = document.getElementById("analytics-overlay");
    if (overlay) {
        overlay.classList.remove("hidden");
        setTimeout(() => overlay.classList.remove("translate-x-full"), 10);
    }
    
    renderAnalyticsData();
    if (typeof playSound === 'function') playSound("pop");
};

window.closeAnalytics = () => {
    const overlay = document.getElementById("analytics-overlay");
    if (overlay) {
        overlay.classList.add("translate-x-full");
        setTimeout(() => overlay.classList.add("hidden"), 300);
    }
};

window.anSetScope = (scope) => {
    anCurrentScope = scope;
    ['month', 'quarter', 'year'].forEach(s => {
        const btn = document.getElementById(`an-scope-${s}`);
        if (btn) {
            if (s === scope) {
                btn.classList.add("active");
                btn.classList.remove("custom-text-secondary");
            } else {
                btn.classList.remove("active");
                btn.classList.add("custom-text-secondary");
            }
        }
    });
    renderAnalyticsData();
    if (typeof playSound === 'function') playSound("click");
};

window.anSetChartMode = (mode) => {
    anChartBarMode = mode;
    const btnDaily = document.getElementById("an-chart-mode-daily");
    const btnWeekday = document.getElementById("an-chart-mode-weekday");
    if (mode === 'daily') {
        if (btnDaily) { btnDaily.className = "px-2 py-0.5 rounded-lg bg-primary-500 text-white shadow-sm"; }
        if (btnWeekday) { btnWeekday.className = "px-2 py-0.5 rounded-lg custom-text-secondary"; }
    } else {
        if (btnWeekday) { btnWeekday.className = "px-2 py-0.5 rounded-lg bg-primary-500 text-white shadow-sm"; }
        if (btnDaily) { btnDaily.className = "px-2 py-0.5 rounded-lg custom-text-secondary"; }
    }
    renderAnalyticsData();
    if (typeof playSound === 'function') playSound("click");
};

window.changeAnMonth = (dir) => {
    if (anCurrentScope === 'month') {
        anCurrentDate.setMonth(anCurrentDate.getMonth() + dir);
    } else if (anCurrentScope === 'quarter') {
        anCurrentDate.setMonth(anCurrentDate.getMonth() + (dir * 3));
    } else if (anCurrentScope === 'year') {
        anCurrentDate.setFullYear(anCurrentDate.getFullYear() + dir);
    }
    renderAnalyticsData();
    if (typeof playSound === 'function') playSound("click");
};

window.switchAnType = (type) => {
    anCurrentType = type;
    ['expense', 'income', 'net'].forEach(t => {
        const btn = document.getElementById(`an-tab-${t}`);
        if (btn) {
            if (t === type) {
                btn.className = "an-tab-btn active flex-1 py-2 text-xs sm:text-sm font-black rounded-xl transition-all custom-primary text-white shadow-sm flex items-center justify-center gap-1.5";
            } else {
                btn.className = "an-tab-btn flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all custom-text-secondary flex items-center justify-center gap-1.5";
            }
        }
    });
    renderAnalyticsData();
    if (typeof playSound === 'function') playSound("click");
};

// =====================================
// 3. RENDER CHÍNH (MASTER ANALYTICS ENGINE)
// =====================================
window.renderAnalyticsData = () => {
    const y = anCurrentDate.getFullYear();
    const m = anCurrentDate.getMonth();
    const q = Math.floor(m / 3) + 1;
    const walletSelectEl = document.getElementById("an-wallet-select");
    const walletId = walletSelectEl ? walletSelectEl.value : 'all';
    
    // Label kỳ thời gian
    const monthLabelEl = document.getElementById("an-month-label");
    const heroBadgeEl = document.getElementById("an-hero-badge");
    const scopeNameEl = document.getElementById("an-hero-scope-name");

    if (anCurrentScope === 'month') {
        if (monthLabelEl) monthLabelEl.innerText = `T${m + 1}/${y}`;
        if (heroBadgeEl) heroBadgeEl.innerText = `Tháng ${m + 1}/${y}`;
        if (scopeNameEl) scopeNameEl.innerText = "Theo tháng";
    } else if (anCurrentScope === 'quarter') {
        if (monthLabelEl) monthLabelEl.innerText = `Quý ${q}/${y}`;
        if (heroBadgeEl) heroBadgeEl.innerText = `Quý ${q}/${y}`;
        if (scopeNameEl) scopeNameEl.innerText = "Theo quý";
    } else {
        if (monthLabelEl) monthLabelEl.innerText = `Năm ${y}`;
        if (heroBadgeEl) heroBadgeEl.innerText = `Năm ${y}`;
        if (scopeNameEl) scopeNameEl.innerText = "Theo năm";
    }

    // Lọc giao dịch theo Scope
    const isTxInScope = (dateStr, year, month, scope) => {
        const d = new Date(dateStr);
        if (scope === 'month') return d.getFullYear() === year && d.getMonth() === month;
        if (scope === 'quarter') return d.getFullYear() === year && Math.floor(d.getMonth() / 3) + 1 === (Math.floor(month / 3) + 1);
        if (scope === 'year') return d.getFullYear() === year;
        return false;
    };

    const allScopeTxs = (state.transactions || []).filter(t => {
        if (t.category === "transfer") return false;
        if (walletId !== "all" && t.walletId !== walletId) return false;
        return isTxInScope(t.date, y, m, anCurrentScope);
    });

    const incomeTxs = allScopeTxs.filter(t => t.type === 'income');
    const expenseTxs = allScopeTxs.filter(t => t.type === 'expense');
    const totalIncome = incomeTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalExpense = expenseTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(-100, Math.min(100, Math.round((netSavings / totalIncome) * 100))) : (totalExpense > 0 ? -100 : 0);

    // Cập nhật Dải Cân Đối Thu Chi (Cash Flow Ribbon)
    const flowInc = document.getElementById("an-flow-income");
    if (flowInc) flowInc.innerText = `+${formatMoney(totalIncome)}`;
    const flowExp = document.getElementById("an-flow-expense");
    if (flowExp) flowExp.innerText = `-${formatMoney(totalExpense)}`;
    const flowNet = document.getElementById("an-flow-net");
    if (flowNet) {
        flowNet.innerText = `${netSavings >= 0 ? '+' : ''}${formatMoney(netSavings)}`;
        flowNet.className = `text-xs sm:text-sm font-black truncate ${netSavings >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500'}`;
    }

    const savingsBadge = document.getElementById("an-savings-badge");
    if (savingsBadge) {
        savingsBadge.innerText = `Tích lũy: ${savingsRate}%`;
        if (savingsRate >= 20) {
            savingsBadge.className = "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/20";
        } else if (savingsRate >= 0) {
            savingsBadge.className = "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/20";
        } else {
            savingsBadge.className = "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-500 border border-rose-500/20";
        }
    }

    const savingsProgress = document.getElementById("an-savings-progress");
    if (savingsProgress) {
        savingsProgress.style.width = `${Math.max(0, savingsRate)}%`;
        if (savingsRate < 0) {
            savingsProgress.style.width = `100%`;
            savingsProgress.className = "h-full rounded-full bg-rose-500 transition-all duration-1000";
        } else if (savingsRate >= 20) {
            savingsProgress.className = "h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000";
        } else {
            savingsProgress.className = "h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-1000";
        }
    }
    const savingsRateLabel = document.getElementById("an-savings-rate-label");
    if (savingsRateLabel) savingsRateLabel.innerText = `${savingsRate}% (${savingsRate >= 20 ? 'Tốt' : (savingsRate >= 0 ? 'Cảnh giác' : 'Bội chi')})`;

    // Phối màu và nhãn cho Hero Card
    const heroCard = document.getElementById("an-hero-card");
    const heroLabel = document.getElementById("an-hero-label");
    
    if (anCurrentType === 'expense') {
        if (heroCard) heroCard.className = "an-hero-card expense-theme p-5 sm:p-6 text-white flex flex-col justify-center text-center transition-all duration-300";
        if (heroLabel) heroLabel.innerText = "TỔNG CHI TIÊU KỲ NÀY";
        anRawTxs = expenseTxs;
    } else if (anCurrentType === 'income') {
        if (heroCard) heroCard.className = "an-hero-card income-theme p-5 sm:p-6 text-white flex flex-col justify-center text-center transition-all duration-300";
        if (heroLabel) heroLabel.innerText = "TỔNG THU NHẬP KỲ NÀY";
        anRawTxs = incomeTxs;
    } else {
        if (heroCard) heroCard.className = "an-hero-card net-theme p-5 sm:p-6 text-white flex flex-col justify-center text-center transition-all duration-300";
        if (heroLabel) heroLabel.innerText = "DÒNG TIỀN TÍCH LŨY RÒNG";
        anRawTxs = expenseTxs; // Use expense for category ranking by default in net view
    }

    const grouped = anRawTxs.reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + (Number(tx.amount) || 0);
        return acc;
    }, {});

    const sortedCats = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
    const totalAmount = anCurrentType === 'net' ? netSavings : sortedCats.reduce((sum, item) => sum + item[1], 0);

    const totalEl = document.getElementById("an-total-amount");
    if (totalEl) {
        if (typeof window.animateMoney === 'function') {
            window.animateMoney("an-total-amount", totalAmount, 800);
        } else {
            totalEl.innerText = formatMoney(totalAmount);
        }
    }

    // Tính kỳ trước để so sánh Trend
    let prevYear = y;
    let prevMonth = m - 1;
    if (anCurrentScope === 'month') {
        if (prevMonth < 0) { prevMonth = 11; prevYear = y - 1; }
    } else if (anCurrentScope === 'quarter') {
        prevMonth = m - 3;
        if (prevMonth < 0) { prevMonth += 12; prevYear = y - 1; }
    } else {
        prevYear = y - 1;
    }

    const prevTxs = (state.transactions || []).filter(t => {
        if (t.category === "transfer") return false;
        if (walletId !== "all" && t.walletId !== walletId) return false;
        return isTxInScope(t.date, prevYear, prevMonth, anCurrentScope) && (anCurrentType === 'income' ? t.type === 'income' : t.type === 'expense');
    });
    const prevTotal = prevTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const trendEl = document.getElementById("an-trend-pct");
    if (trendEl) {
        if (prevTotal === 0) {
            trendEl.innerHTML = `<span class="opacity-75">Khởi tạo</span>`;
        } else {
            const currentCompareAmt = anCurrentType === 'income' ? totalIncome : totalExpense;
            const diff = currentCompareAmt - prevTotal;
            const pct = Math.abs((diff / prevTotal) * 100).toFixed(1);
            const isUp = diff > 0;
            trendEl.innerHTML = `<span><i class="fa-solid fa-arrow-${isUp ? 'trend-up' : 'trend-down'}"></i> ${isUp ? '+' : '-'}${pct}%</span>`;
        }
    }

    // Tính TB / Ngày
    const today = new Date();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    let daysPassed = daysInMonth; 
    if (anCurrentScope === 'month' && y === today.getFullYear() && m === today.getMonth()) {
        daysPassed = Math.max(1, today.getDate()); 
    } else if (anCurrentScope === 'quarter') {
        daysPassed = 90;
    } else if (anCurrentScope === 'year') {
        daysPassed = 365;
    }

    const currentDisplayAmt = anCurrentType === 'income' ? totalIncome : totalExpense;
    const avgDaily = currentDisplayAmt / (daysPassed || 1);
    const avgDailyEl = document.getElementById("an-avg-daily");
    if (avgDailyEl) avgDailyEl.innerText = formatMoney(Math.round(avgDaily));

    // Top category & Tx count
    const topCatEl = document.getElementById("an-top-category-name");
    if (topCatEl) {
        if (sortedCats.length > 0) {
            const topCatObj = (state.categories || []).find(c => c.id === sortedCats[0][0]);
            topCatEl.innerText = topCatObj ? topCatObj.name : "Khác";
        } else {
            topCatEl.innerText = "Chưa có";
        }
    }

    const txCountEl = document.getElementById("an-tx-count");
    if (txCountEl) txCountEl.innerText = `${anRawTxs.length} lượt`;

    // AI Cố vấn & Dự phóng
    const forecastBox = document.getElementById("an-forecast-box");
    const forecastText = document.getElementById("an-forecast-text");
    const burnBadge = document.getElementById("an-burn-badge");

    if (forecastBox && forecastText) {
        if (anCurrentType === 'expense' && anCurrentScope === 'month' && daysPassed < daysInMonth && totalExpense > 0) {
            const forecastTotal = avgDaily * daysInMonth;
            const burnPct = (daysPassed / daysInMonth) * 100;
            
            if (burnBadge) {
                if (savingsRate < 0) {
                    burnBadge.innerText = "Nguy cơ thâm hụt";
                    burnBadge.className = "text-[9px] px-2 py-0.5 rounded-md font-bold bg-rose-500/80 text-white";
                } else if (savingsRate < 15) {
                    burnBadge.innerText = "Đạt ngưỡng cảnh báo";
                    burnBadge.className = "text-[9px] px-2 py-0.5 rounded-md font-bold bg-amber-500/80 text-white";
                } else {
                    burnBadge.innerText = "Dòng tiền tốt";
                    burnBadge.className = "text-[9px] px-2 py-0.5 rounded-md font-bold bg-emerald-500/80 text-white";
                }
            }

            forecastText.innerHTML = `Với tốc độ tiêu <b>${formatMoney(Math.round(avgDaily))}/ngày</b>, dự phóng cuối tháng chi tiêu đạt <b>${formatMoney(Math.round(forecastTotal))}</b>. ${savingsRate < 0 ? '⚠️ Cần thắt chặt chi tiêu để không âm ví!' : '✨ Bạn đang giữ dòng tiền rất ổn định!'}`;
            forecastBox.classList.remove("hidden");
        } else if (anCurrentType === 'net') {
            if (burnBadge) burnBadge.innerText = netSavings >= 0 ? "Dương dòng tiền" : "Âm dòng tiền";
            forecastText.innerHTML = `Dòng tiền ròng của bạn đang <b>${netSavings >= 0 ? 'dương +' : 'âm '}${formatMoney(netSavings)}</b>. Tỷ lệ tích lũy tài sản đạt <b>${savingsRate}%</b>.`;
            forecastBox.classList.remove("hidden");
        } else {
            if (burnBadge) burnBadge.innerText = "Tổng kết";
            forecastText.innerHTML = `Tổng thu nhập ghi nhận trong kỳ là <b>${formatMoney(totalIncome)}</b> qua <b>${incomeTxs.length}</b> khoản thu.`;
            forecastBox.classList.remove("hidden");
        }
    }

    // =====================================
    // 4. MA TRẬN XẾP HẠNG TOP DANH MỤC
    // =====================================
    const boardEl = document.getElementById("an-leaderboard");
    const catCountBadge = document.getElementById("an-cat-count-badge");
    if (catCountBadge) catCountBadge.innerText = `${sortedCats.length} danh mục`;

    if (boardEl) {
        if (sortedCats.length === 0) {
            boardEl.innerHTML = `
                <div class="text-center py-10 opacity-60">
                    <i class="fa-solid fa-ghost text-4xl text-gray-400 mb-3"></i>
                    <p class="text-xs font-bold custom-text-secondary">Chưa có giao dịch nào được ghi nhận trong kỳ này.</p>
                </div>`;
            if (anChartDoughnut) { anChartDoughnut.destroy(); anChartDoughnut = null; }
            if (anChartBar) { anChartBar.destroy(); anChartBar = null; }
            const legendEl = document.getElementById("an-chart-legend");
            if (legendEl) legendEl.innerHTML = '';
            return;
        }

        const maxAmt = sortedCats[0][1];
        const colorPalette = ['#6366f1', '#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4', '#8b5cf6', '#ec4899', '#64748b'];
        const medals = ['🥇', '🥈', '🥉'];

        boardEl.innerHTML = sortedCats.map(([cId, amt], idx) => {
            const cat = (state.categories || []).find(c => c.id === cId) || { name: "Khác", icon: "📦", color: "bg-gray-200 text-gray-600" };
            const pct = currentDisplayAmt > 0 ? ((amt / currentDisplayAmt) * 100).toFixed(1) : 0;
            const barColor = colorPalette[idx % colorPalette.length];
            const medal = medals[idx] || `<span class="text-[10px] font-black text-gray-400">#${idx + 1}</span>`;

            let budgetHtml = "";
            if (anCurrentType === 'expense' && state.budgets) {
                const budget = state.budgets.find(b => b.categoryId === cId);
                if (budget && budget.amount > 0) {
                    const bPct = Math.round((amt / budget.amount) * 100);
                    const bColor = bPct >= 100 ? "text-rose-500 bg-rose-500/10 border-rose-500/20" : (bPct >= 80 ? "text-amber-500 bg-amber-500/10 border-amber-500/20" : "text-emerald-500 bg-emerald-500/10 border-emerald-500/20");
                    budgetHtml = `<span class="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${bColor}"><i class="fa-solid fa-bullseye"></i> ${bPct}% Ngân sách</span>`;
                }
            }

            const catTxsCount = anRawTxs.filter(t => t.category === cId).length;

            return `
            <div class="p-3 sm:p-4 rounded-2xl border custom-border custom-bg-card hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer group active:scale-[0.99] relative overflow-hidden" onclick="openAnBottomSheet('${cId}', '${barColor}')">
                <div class="flex items-center gap-3 relative z-10">
                    <div class="w-6 text-center text-sm font-bold shrink-0">${medal}</div>
                    <div class="w-11 h-11 rounded-2xl ${cat.color} flex items-center justify-center text-xl shadow-inner border custom-border shrink-0 transition-transform group-hover:scale-110">${cat.icon}</div>
                    
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-baseline mb-1">
                            <span class="font-black text-xs sm:text-sm custom-text truncate pr-2">${cat.name}</span>
                            <span class="font-black text-xs sm:text-sm ${anCurrentType === 'income' ? 'text-emerald-500' : 'text-rose-500'} shrink-0">${formatMoney(amt)}</span>
                        </div>

                        <div class="flex items-center gap-2 mb-1.5">
                            <div class="h-1.5 flex-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                <div class="h-full rounded-full transition-all duration-1000" style="width: ${pct}%; background-color: ${barColor}"></div>
                            </div>
                            <span class="text-[10px] font-black custom-text-secondary w-9 text-right">${pct}%</span>
                        </div>

                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="text-[9px] font-bold custom-text-secondary"><i class="fa-solid fa-receipt text-[8px] opacity-70"></i> ${catTxsCount} hóa đơn</span>
                            ${budgetHtml}
                        </div>
                    </div>
                </div>
            </div>`;
        }).join("");
    }

    // =====================================
    // 5. VẼ BIỂU ĐỒ (CHART.JS)
    // =====================================
    if (typeof Chart === 'undefined') return;

    const colorPalette = ['#6366f1', '#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4', '#8b5cf6', '#ec4899', '#64748b'];

    // Biểu đồ 1: Doughnut Chart
    if (anChartDoughnut) anChartDoughnut.destroy();
    const ctxD = document.getElementById('an-doughnut-chart');
    if (ctxD && sortedCats.length > 0) {
        const labels = sortedCats.map(c => (state.categories || []).find(cat => cat.id === c[0])?.name || "Khác");
        const dataVals = sortedCats.map(c => c[1]);
        
        anChartDoughnut = new Chart(ctxD, {
            type: 'doughnut',
            data: { 
                labels, 
                datasets: [{ 
                    data: dataVals, 
                    backgroundColor: colorPalette, 
                    borderWidth: 2, 
                    borderColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff', 
                    hoverOffset: 6 
                }] 
            },
            options: { 
                cutout: '72%', 
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false }, 
                    tooltip: { 
                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                        titleFont: { size: 12, weight: 'bold' }, 
                        bodyFont: { size: 12, weight: 'bold' }, 
                        padding: 10, 
                        cornerRadius: 12, 
                        callbacks: { 
                            label: (c) => ` ${formatMoney(c.raw)} (${currentDisplayAmt > 0 ? ((c.raw/currentDisplayAmt)*100).toFixed(1) : 0}%)` 
                        } 
                    } 
                } 
            }
        });

        // Center labels
        const centerIcon = document.getElementById("an-chart-center-icon");
        const centerName = document.getElementById("an-chart-center-name");
        const centerPct = document.getElementById("an-chart-center-pct");
        if (sortedCats.length > 0) {
            const topCat = (state.categories || []).find(c => c.id === sortedCats[0][0]);
            if (centerIcon && topCat) centerIcon.innerText = topCat.icon;
            if (centerName && topCat) centerName.innerText = topCat.name;
            if (centerPct) centerPct.innerText = `${currentDisplayAmt > 0 ? ((sortedCats[0][1]/currentDisplayAmt)*100).toFixed(0) : 0}%`;
        }

        // Legend chips under doughnut
        const legendEl = document.getElementById("an-chart-legend");
        if (legendEl) {
            legendEl.innerHTML = sortedCats.slice(0, 4).map(([cId, amt], i) => {
                const cat = (state.categories || []).find(c => c.id === cId) || { name: 'Khác', icon: '📦' };
                const pct = currentDisplayAmt > 0 ? ((amt / currentDisplayAmt) * 100).toFixed(0) : 0;
                return `
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold custom-bg-input border custom-border">
                        <span class="w-2 h-2 rounded-full" style="background-color: ${colorPalette[i % colorPalette.length]}"></span>
                        <span class="custom-text">${cat.name}:</span>
                        <span class="font-black text-primary-500">${pct}%</span>
                    </span>`;
            }).join("");
        }
    }

    // Biểu đồ 2: Bar Chart (Theo ngày hoặc theo thứ trong tuần)
    if (anChartBar) anChartBar.destroy();
    const ctxB = document.getElementById('an-bar-chart');
    if (ctxB) {
        let chartLabels = [];
        let chartData = [];

        if (anChartBarMode === 'daily') {
            chartLabels = Array.from({length: daysInMonth}, (_, i) => i + 1);
            chartData = Array(daysInMonth).fill(0);
            anRawTxs.forEach(t => {
                const d = new Date(t.date).getDate();
                if (d >= 1 && d <= daysInMonth) {
                    chartData[d - 1] += (Number(t.amount) || 0);
                }
            });

            // Find peak day
            let peakDay = 1;
            let peakVal = 0;
            chartData.forEach((val, idx) => {
                if (val > peakVal) { peakVal = val; peakDay = idx + 1; }
            });
            const peakDayEl = document.getElementById("an-peak-day-text");
            if (peakDayEl) {
                if (peakVal > 0) {
                    peakDayEl.innerHTML = `Ngày cao điểm: <b>Ngày ${peakDay}</b> với mức chi <b>${formatMoney(peakVal)}</b>.`;
                } else {
                    peakDayEl.innerHTML = "Chưa có biến động chi tiêu nào trong kỳ.";
                }
            }
        } else {
            // Weekday mode: Thứ 2 (idx 0) đến Chủ Nhật (idx 6)
            chartLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
            chartData = Array(7).fill(0);
            anRawTxs.forEach(t => {
                const dayIdx = new Date(t.date).getDay();
                // Sunday is 0 -> map to index 6; Monday is 1 -> map to 0
                const mappedIdx = dayIdx === 0 ? 6 : dayIdx - 1;
                chartData[mappedIdx] += (Number(t.amount) || 0);
            });

            const maxWVal = Math.max(...chartData);
            const peakWIdx = chartData.indexOf(maxWVal);
            const peakDayEl = document.getElementById("an-peak-day-text");
            if (peakDayEl) {
                if (maxWVal > 0) {
                    peakDayEl.innerHTML = `Thứ tiêu nhiều nhất: <b>${chartLabels[peakWIdx]}</b> với tổng chi <b>${formatMoney(maxWVal)}</b>.`;
                } else {
                    peakDayEl.innerHTML = "Chưa có biến động chi tiêu nào trong kỳ.";
                }
            }
        }

        const barColor = anCurrentType === 'income' ? '#10b981' : (anCurrentType === 'net' ? '#6366f1' : '#f43f5e');

        anChartBar = new Chart(ctxB, {
            type: 'bar',
            data: { 
                labels: chartLabels, 
                datasets: [{ 
                    data: chartData, 
                    backgroundColor: barColor, 
                    borderRadius: 5, 
                    barPercentage: 0.65 
                }] 
            },
            options: {
                maintainAspectRatio: false, 
                plugins: { 
                    legend: { display: false }, 
                    tooltip: { 
                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                        titleFont: { size: 11, weight: 'bold' },
                        bodyFont: { size: 11, weight: 'bold' },
                        padding: 8,
                        cornerRadius: 10,
                        callbacks: { 
                            label: (c) => ` ${formatMoney(c.raw)}` 
                        } 
                    } 
                },
                scales: { 
                    x: { grid: { display: false }, ticks: { font: { size: 9, weight: 'bold' }, color: '#94a3b8' } }, 
                    y: { display: false, beginAtZero: true } 
                }
            }
        });
    }
};

// =====================================
// 6. BOTTOM SHEET (DRILL-DOWN CHI TIẾT)
// =====================================
window.openAnBottomSheet = (catId, colorHex) => {
    anBsCurrentCatId = catId;
    const cat = (state.categories || []).find(c => c.id === catId) || { name: "Khác", icon: "📦", color: "bg-gray-200" };
    
    const bgIcon = document.getElementById("an-bs-bg-icon");
    if (bgIcon) bgIcon.innerText = cat.icon;

    const bsIcon = document.getElementById("an-bs-icon");
    if (bsIcon) {
        bsIcon.className = `relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] flex items-center justify-center text-3xl sm:text-4xl shadow-inner border custom-border mb-2.5 ${cat.color} bg-opacity-30`;
        bsIcon.innerText = cat.icon;
    }

    const bsTitle = document.getElementById("an-bs-title");
    if (bsTitle) bsTitle.innerText = cat.name;

    const catTxs = anRawTxs.filter(t => t.category === catId).sort((a, b) => b.amount - a.amount);
    const totalCatAmt = catTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    
    const bsTotal = document.getElementById("an-bs-total");
    if (bsTotal) {
        bsTotal.innerText = formatMoney(totalCatAmt);
        bsTotal.className = `relative z-10 text-lg font-black mt-0.5 drop-shadow-sm ${anCurrentType === 'income' ? 'text-emerald-500' : 'text-rose-500'}`;
    }

    const txCountEl = document.getElementById("an-bs-tx-count");
    if (txCountEl) txCountEl.innerText = `${catTxs.length} giao dịch`;

    // Giao dịch đậm nhất
    const topTxBox = document.getElementById("an-bs-top-tx");
    if (topTxBox) {
        if (catTxs.length > 0) {
            const topTx = catTxs[0];
            let tTime = topTx.date.includes("T") ? topTx.date.split("T")[1].substring(0, 5) : (topTx.date.split(" ")[1] ? topTx.date.split(" ")[1].substring(0, 5) : '--:--');
            
            topTxBox.innerHTML = `
                <div class="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/30 rounded-2xl relative overflow-hidden shadow-sm">
                    <i class="fa-solid fa-crown absolute -right-1 -top-1 text-5xl text-indigo-500/10 transform rotate-12 pointer-events-none"></i>
                    <p class="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider mb-1">Giao dịch "đậm" nhất</p>
                    <p class="font-black custom-text text-sm leading-tight mb-2 truncate">${topTx.note || "Thanh toán giao dịch"}</p>
                    <div class="flex justify-between items-end">
                        <span class="text-[10px] font-bold custom-text-secondary"><i class="fa-regular fa-clock"></i> Ngày ${new Date(topTx.date).getDate()} - ${tTime}</span>
                        <span class="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400">${formatMoney(topTx.amount)}</span>
                    </div>
                </div>`;
        } else {
            topTxBox.innerHTML = '';
        }
    }

    // Danh sách các giao dịch
    const listEl = document.getElementById("an-bs-tx-list");
    if (listEl) {
        const listTxs = [...catTxs].sort((a, b) => new Date(b.date) - new Date(a.date));
        listEl.innerHTML = listTxs.map(tx => {
            let tTime = tx.date.includes("T") ? tx.date.split("T")[1].substring(0, 5) : (tx.date.split(" ")[1] ? tx.date.split(" ")[1].substring(0, 5) : '--:--');
            const hasImg = tx.image && tx.image.length > 50;
            const imgHtml = hasImg 
                ? `<img src="${typeof window.getFastImage === 'function' ? window.getFastImage(tx.image) : tx.image}" loading="lazy" class="w-11 h-11 object-cover rounded-xl shrink-0 border custom-border">` 
                : `<div class="w-11 h-11 rounded-xl custom-bg-input flex items-center justify-center shrink-0 border custom-border text-gray-400 text-base"><i class="fa-solid fa-receipt"></i></div>`;
            
            return `
            <div class="flex items-center gap-3 p-3 custom-bg-card hover:bg-black/5 dark:hover:bg-white/5 border custom-border rounded-2xl shadow-sm cursor-pointer transition-all active:scale-[0.99]" onclick="openModal('transaction', '${tx.id}')">
                ${imgHtml}
                <div class="flex-1 min-w-0">
                    <p class="font-bold text-xs sm:text-sm custom-text truncate leading-tight">${tx.note || cat.name}</p>
                    <p class="text-[10px] font-semibold custom-text-secondary mt-0.5"><i class="fa-regular fa-clock text-[9px]"></i> Ngày ${new Date(tx.date).getDate()} lúc ${tTime}</p>
                </div>
                <p class="font-black text-xs sm:text-sm ${anCurrentType === 'income' ? 'text-emerald-500' : 'text-rose-500'} shrink-0 ml-2">${formatMoney(tx.amount)}</p>
            </div>`;
        }).join("");
    }

    const actionBox = document.getElementById("an-bs-action");
    if (actionBox) {
        if (anCurrentType === 'expense') {
            const hasBudget = state.budgets ? state.budgets.some(b => b.categoryId === catId) : false;
            if (!hasBudget) actionBox.classList.remove("hidden");
            else actionBox.classList.add("hidden");
        } else {
            actionBox.classList.add("hidden");
        }
    }

    const backdrop = document.getElementById("an-bottom-sheet-backdrop");
    const sheet = document.getElementById("an-bottom-sheet");
    if (backdrop && sheet) {
        backdrop.classList.remove("hidden");
        setTimeout(() => {
            backdrop.classList.remove("opacity-0");
            sheet.classList.remove("translate-y-full");
        }, 10);
    }
    if (typeof playSound === 'function') playSound("pop");
};

window.closeAnBottomSheet = () => {
    const backdrop = document.getElementById("an-bottom-sheet-backdrop");
    const sheet = document.getElementById("an-bottom-sheet");
    if (backdrop && sheet) {
        backdrop.classList.add("opacity-0");
        sheet.classList.add("translate-y-full");
        setTimeout(() => backdrop.classList.add("hidden"), 300);
    }
};

window.jumpToCreateBudget = () => {
    closeAnBottomSheet();
    closeAnalytics();
    if (typeof switchView === 'function') switchView("budgets");
    setTimeout(() => {
        if (typeof openModal === 'function') openModal('budget');
        setTimeout(() => {
            const selectEl = document.getElementById("b-c");
            if(selectEl) selectEl.value = anBsCurrentCatId;
        }, 100);
    }, 350);
};

// =====================================
// 7. XUẤT BÁO CÁO TÀI CHÍNH (EXECUTIVE REPORT EXPORT)
// =====================================
window.anExportSummary = () => {
    const y = anCurrentDate.getFullYear();
    const m = anCurrentDate.getMonth() + 1;
    const q = Math.floor(anCurrentDate.getMonth() / 3) + 1;
    
    let periodText = `Tháng ${m}/${y}`;
    if (anCurrentScope === 'quarter') periodText = `Quý ${q}/${y}`;
    else if (anCurrentScope === 'year') periodText = `Năm ${y}`;

    const incTxs = (state.transactions || []).filter(t => t.type === 'income' && t.category !== 'transfer');
    const expTxs = (state.transactions || []).filter(t => t.type === 'expense' && t.category !== 'transfer');
    const totalInc = incTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalExp = expTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const net = totalInc - totalExp;
    const rate = totalInc > 0 ? Math.round((net / totalInc) * 100) : 0;

    let report = `📊 BÁO CÁO TÀI CHÍNH FINMASTER\n`;
    report += `🗓️ Kỳ phân tích: ${periodText}\n`;
    report += `────────────────────────────\n`;
    report += `💰 Tổng thu nhập: +${formatMoney(totalInc)}\n`;
    report += `🔥 Tổng chi tiêu: -${formatMoney(totalExp)}\n`;
    report += `💎 Dòng tiền ròng: ${net >= 0 ? '+' : ''}${formatMoney(net)}\n`;
    report += `🎯 Tỷ lệ tích lũy: ${rate}%\n`;
    report += `────────────────────────────\n`;
    report += `🏆 TOP CHI TIÊU NHIỀU NHẤT:\n`;

    const grouped = expTxs.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + (Number(t.amount) || 0);
        return acc;
    }, {});
    const sorted = Object.entries(grouped).sort((a,b) => b[1] - a[1]).slice(0, 5);

    sorted.forEach(([cId, amt], i) => {
        const cat = (state.categories || []).find(c => c.id === cId) || { name: 'Khác', icon: '📦' };
        const pct = totalExp > 0 ? Math.round((amt / totalExp) * 100) : 0;
        report += `${i + 1}. ${cat.icon} ${cat.name}: ${formatMoney(amt)} (${pct}%)\n`;
    });

    report += `────────────────────────────\n`;
    report += `✨ Tạo tự động bởi FinMaster lúc ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(report).then(() => {
            alert(`✅ Đã sao chép Báo Cáo Tài Chính (${periodText}) vào bộ nhớ tạm!\nBạn có thể dán vào Zalo/Tin nhắn để lưu trữ hoặc chia sẻ.`);
        });
    } else {
        alert(report);
    }
    if (typeof playSound === 'function') playSound("success");
};