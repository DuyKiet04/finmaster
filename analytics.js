// ==============================================================
// GIAO DIỆN & BỘ NÃO: PHÂN TÍCH DANH MỤC (CATEGORY ANALYTICS)
// ==============================================================

// =====================================
// 1. TỰ ĐỘNG BƠM GIAO DIỆN VÀO BỘ NHỚ (KHÔNG LÀM RÁC INDEX.HTML)
// =====================================
(function injectAnalyticsUI() {
    if (document.getElementById('analytics-overlay')) return; // Có rồi thì thôi

    const analyticsHTML = `
    <div id="analytics-overlay" class="fixed inset-0 z-[200] custom-bg-body transition-transform duration-300 translate-x-full flex flex-col hidden">
        <div class="custom-bg-header dark:bg-gray-800/90 backdrop-blur-xl px-4 py-3 flex items-center justify-between shadow-sm shrink-0 z-30 border-b custom-border">
            <button onclick="closeAnalytics()" class="w-10 h-10 flex items-center justify-center rounded-full custom-bg-card dark:bg-gray-700 custom-text-secondary hover:brightness-95 active:scale-90 transition-transform custom-shadow-sm border custom-border">
                <i class="fa-solid fa-arrow-left"></i>
            </button>
            <h3 class="font-black text-lg custom-text truncate flex-1 text-center mr-10">Phân tích Danh mục</h3>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar relative pb-20" id="analytics-scroll-area">
            <div class="sticky top-0 z-20 custom-bg-body/95 backdrop-blur-md px-4 py-3 border-b custom-border shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-3">
                <div class="flex custom-bg-input p-1.5 rounded-xl border custom-border">
                    <button id="an-tab-expense" onclick="switchAnType('expense')" class="flex-1 py-2 text-sm font-bold rounded-lg transition-all custom-primary custom-shadow-sm text-white">🔥 Khoản Chi</button>
                    <button id="an-tab-income" onclick="switchAnType('income')" class="flex-1 py-2 text-sm font-bold rounded-lg transition-all custom-text-secondary hover:brightness-95">💰 Khoản Thu</button>
                </div>
                <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg border custom-border p-1">
                        <button onclick="changeAnMonth(-1)" class="w-8 h-8 rounded-md hover:bg-white dark:hover:bg-gray-700 custom-text flex items-center justify-center transition-colors"><i class="fa-solid fa-chevron-left text-xs"></i></button>
                        <span id="an-month-label" class="px-3 text-xs font-black custom-text uppercase tracking-widest min-w-[90px] text-center">T9/2026</span>
                        <button onclick="changeAnMonth(1)" class="w-8 h-8 rounded-md hover:bg-white dark:hover:bg-gray-700 custom-text flex items-center justify-center transition-colors"><i class="fa-solid fa-chevron-right text-xs"></i></button>
                    </div>
                    <select id="an-wallet-select" onchange="renderAnalyticsData()" class="flex-1 bg-gray-100 dark:bg-gray-800 border custom-border rounded-lg outline-none text-xs font-bold custom-text px-2 py-2.5 appearance-none text-right">
                    </select>
                </div>
            </div>

            <div class="p-4 space-y-6">
                <div class="custom-bg-card p-6 rounded-[2rem] border custom-border custom-shadow-sm relative overflow-hidden">
                    <div class="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary-500/10 blur-2xl"></div>
                    <p class="text-[10px] font-bold custom-text-secondary uppercase tracking-widest mb-1">Tổng cộng tháng này</p>
                    <h2 id="an-total-amount" class="text-4xl font-black custom-text tracking-tighter mb-3">0 ₫</h2>
                    <div class="flex items-center justify-between pt-4 border-t border-dashed custom-border">
                        <div>
                            <p class="text-[10px] font-bold custom-text-secondary uppercase">Trung bình / Ngày</p>
                            <p id="an-avg-daily" class="text-sm font-black custom-text mt-0.5">0 ₫</p>
                        </div>
                        <div class="text-right">
                            <p class="text-[10px] font-bold custom-text-secondary uppercase">So với tháng trước</p>
                            <p id="an-trend-pct" class="text-sm font-black text-gray-400 mt-0.5">--</p>
                        </div>
                    </div>
                    <div id="an-forecast-box" class="mt-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 p-3 rounded-xl flex items-start gap-3">
                        <div class="w-8 h-8 rounded-full bg-orange-200 dark:bg-orange-800 flex items-center justify-center text-orange-600 dark:text-orange-300 text-sm shrink-0"><i class="fa-solid fa-robot"></i></div>
                        <div>
                            <p class="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">AI Dự phóng</p>
                            <p id="an-forecast-text" class="text-xs font-bold text-gray-800 dark:text-gray-200 mt-0.5">Dự kiến cuối tháng bạn sẽ tiêu hết X triệu.</p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="custom-bg-card p-5 rounded-[2rem] border custom-border custom-shadow-sm flex flex-col items-center">
                        <h4 class="w-full text-left font-black text-sm uppercase tracking-widest custom-text-secondary mb-4 flex items-center gap-2"><i class="fa-solid fa-chart-pie text-primary-500"></i> Cơ cấu tỷ trọng</h4>
                        <div class="relative w-48 h-48">
                            <canvas id="an-doughnut-chart"></canvas>
                            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span id="an-chart-center-icon" class="text-2xl opacity-50 mb-1">📊</span>
                                <span id="an-chart-center-pct" class="text-xl font-black custom-text">100%</span>
                            </div>
                        </div>
                    </div>
                    <div class="custom-bg-card p-5 rounded-[2rem] border custom-border custom-shadow-sm">
                        <h4 class="font-black text-sm uppercase tracking-widest custom-text-secondary mb-4 flex items-center gap-2"><i class="fa-solid fa-chart-column text-primary-500"></i> Biến động theo ngày</h4>
                        <div class="w-full h-40 relative">
                            <canvas id="an-bar-chart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="custom-bg-card p-6 rounded-[2rem] border custom-border custom-shadow-sm">
                    <h4 class="font-black text-sm uppercase tracking-widest custom-text-secondary mb-5 flex items-center gap-2"><i class="fa-solid fa-ranking-star text-amber-500"></i> Bảng xếp hạng Danh mục</h4>
                    <div id="an-leaderboard" class="space-y-4"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- BOTTOM SHEET ĐÀO SÂU -->
    <div id="an-bottom-sheet-backdrop" onclick="closeAnBottomSheet()" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] hidden opacity-0 transition-opacity duration-300"></div>
    <div id="an-bottom-sheet" class="fixed bottom-0 left-0 right-0 custom-bg-body z-[300] rounded-t-[2rem] border-t custom-border shadow-[0_-10px_40px_rgba(0,0,0,0.2)] transform translate-y-full transition-transform duration-300 flex flex-col max-h-[85vh]">
        <div class="w-full flex justify-center py-3 cursor-pointer" onclick="closeAnBottomSheet()">
            <div class="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
        <div class="px-6 pb-4 border-b custom-border flex items-center gap-4 shrink-0">
            <div id="an-bs-icon" class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner border custom-border">📦</div>
            <div>
                <h3 id="an-bs-title" class="font-black text-xl custom-text">Tên Danh Mục</h3>
                <p id="an-bs-total" class="text-sm font-black text-danger-500 mt-0.5">0 ₫</p>
            </div>
        </div>
        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50 dark:bg-gray-900/50">
            <div id="an-bs-top-tx" class="mb-5"></div>
            <h4 class="font-black text-xs uppercase tracking-widest custom-text-secondary mb-3 pl-1">Lịch sử trong tháng</h4>
            <div id="an-bs-tx-list" class="space-y-0"></div>
        </div>
        <div id="an-bs-action" class="p-4 bg-white dark:bg-gray-900 border-t custom-border shrink-0">
            <button onclick="jumpToCreateBudget()" class="w-full py-4 custom-bg-input hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 custom-text rounded-2xl font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2 border custom-border shadow-sm">
                <i class="fa-solid fa-bullseye text-primary-500"></i> Lập Giới hạn Ngân sách
            </button>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', analyticsHTML);
})();

// =====================================
// 2. BIẾN TOÀN CỤC & LOGIC XỬ LÝ
// =====================================
let anCurrentDate = new Date();
let anCurrentType = 'expense';
let anChartDoughnut = null;
let anChartBar = null;
let anRawTxs = [];

window.openAnalytics = async () => {
    if (typeof Chart === 'undefined' && typeof window.loadScript === 'function') {
        await window.loadScript("https://cdn.jsdelivr.net/npm/chart.js");
    }

    const sel = document.getElementById("an-wallet-select");
    if(sel) sel.innerHTML = '<option value="all">Tất cả ví</option>' + state.wallets.map(w => `<option value="${w.id}">${w.name}</option>`).join('');

    const overlay = document.getElementById("analytics-overlay");
    overlay.classList.remove("hidden");
    setTimeout(() => overlay.classList.remove("translate-x-full"), 10);
    
    renderAnalyticsData();
    if (typeof playSound === 'function') playSound("pop");
};

window.closeAnalytics = () => {
    const overlay = document.getElementById("analytics-overlay");
    overlay.classList.add("translate-x-full");
    setTimeout(() => overlay.classList.add("hidden"), 300);
};

window.changeAnMonth = (dir) => {
    anCurrentDate.setMonth(anCurrentDate.getMonth() + dir);
    renderAnalyticsData();
    if (typeof playSound === 'function') playSound("click");
};

window.switchAnType = (type) => {
    anCurrentType = type;
    const btnExp = document.getElementById("an-tab-expense");
    const btnInc = document.getElementById("an-tab-income");
    
    if (type === 'expense') {
        btnExp.className = "flex-1 py-2 text-sm font-bold rounded-lg transition-all custom-primary custom-shadow-sm text-white";
        btnInc.className = "flex-1 py-2 text-sm font-bold rounded-lg transition-all custom-text-secondary hover:brightness-95";
    } else {
        btnInc.className = "flex-1 py-2 text-sm font-bold rounded-lg transition-all custom-primary custom-shadow-sm text-white";
        btnExp.className = "flex-1 py-2 text-sm font-bold rounded-lg transition-all custom-text-secondary hover:brightness-95";
    }
    renderAnalyticsData();
    if (typeof playSound === 'function') playSound("click");
};

window.renderAnalyticsData = () => {
    const y = anCurrentDate.getFullYear();
    const m = anCurrentDate.getMonth();
    const walletId = document.getElementById("an-wallet-select").value;
    
    document.getElementById("an-month-label").innerText = `T${m + 1}/${y}`;

    anRawTxs = state.transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === m && d.getFullYear() === y && t.type === anCurrentType && t.category !== "transfer" && (walletId === "all" || t.walletId === walletId);
    });

    const grouped = anRawTxs.reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
        return acc;
    }, {});

    const sortedCats = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
    const totalAmount = sortedCats.reduce((sum, item) => sum + item[1], 0);

    if (typeof window.animateMoney === 'function') {
        window.animateMoney("an-total-amount", totalAmount, 1000);
    } else {
        document.getElementById("an-total-amount").innerText = formatMoney(totalAmount);
    }
    document.getElementById("an-total-amount").className = `text-4xl font-black tracking-tighter mb-3 ${anCurrentType === 'income' ? 'text-success-500' : 'text-danger-500'}`;

    const prevM = m === 0 ? 11 : m - 1;
    const prevY = m === 0 ? y - 1 : y;
    const prevTotal = state.transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === prevM && d.getFullYear() === prevY && t.type === anCurrentType && t.category !== "transfer" && (walletId === "all" || t.walletId === walletId);
    }).reduce((sum, t) => sum + t.amount, 0);

    const trendEl = document.getElementById("an-trend-pct");
    if (prevTotal === 0) {
        trendEl.innerHTML = `<span class="text-gray-400">Không có dữ liệu</span>`;
    } else {
        const diff = totalAmount - prevTotal;
        const pct = Math.abs((diff / prevTotal) * 100).toFixed(1);
        const isUp = diff > 0;
        const color = anCurrentType === 'expense' ? (isUp ? 'text-danger-500' : 'text-success-500') : (isUp ? 'text-success-500' : 'text-danger-500');
        trendEl.innerHTML = `<span class="${color}"><i class="fa-solid fa-arrow-${isUp ? 'up' : 'down'}"></i> ${pct}%</span>`;
    }

    const today = new Date();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    let daysPassed = daysInMonth; 
    
    if (y === today.getFullYear() && m === today.getMonth()) {
        daysPassed = today.getDate(); 
    }

    const avgDaily = totalAmount / (daysPassed || 1);
    document.getElementById("an-avg-daily").innerText = formatMoney(Math.round(avgDaily));

    const forecastBox = document.getElementById("an-forecast-box");
    if (anCurrentType === 'expense' && daysPassed < daysInMonth && totalAmount > 0) {
        const forecastTotal = avgDaily * daysInMonth;
        document.getElementById("an-forecast-text").innerHTML = `Với tốc độ đốt tiền này, dự kiến cuối tháng sẽ tiêu hết <b>${formatMoney(Math.round(forecastTotal))}</b>.`;
        forecastBox.classList.remove("hidden");
    } else {
        forecastBox.classList.add("hidden");
    }

    // =====================================
    // 3. MA TRẬN XẾP HẠNG
    // =====================================
    const boardEl = document.getElementById("an-leaderboard");
    if (sortedCats.length === 0) {
        boardEl.innerHTML = `<div class="text-center py-8 opacity-60"><i class="fa-solid fa-ghost text-5xl text-gray-400 mb-3"></i><p class="text-sm font-bold custom-text-secondary">Chưa có giao dịch nào!</p></div>`;
        if(anChartDoughnut) { anChartDoughnut.destroy(); anChartDoughnut = null; }
        if(anChartBar) { anChartBar.destroy(); anChartBar = null; }
        return;
    }

    const maxAmt = sortedCats[0][1];
    const colorPalette = ['#f43f5e', '#f97316', '#eab308', '#84cc16', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#64748b'];

    boardEl.innerHTML = sortedCats.map(([cId, amt], idx) => {
        const cat = state.categories.find(c => c.id === cId) || { name: "Khác", icon: "📦", color: "bg-gray-200 text-gray-600" };
        const pct = ((amt / totalAmount) * 100).toFixed(1);
        const barColor = colorPalette[idx % colorPalette.length];
        
        let budgetHtml = "";
        if (anCurrentType === 'expense') {
            const budget = state.budgets.find(b => b.categoryId === cId);
            if (budget) {
                const bPct = Math.min((amt / budget.amount) * 100, 100).toFixed(0);
                const bColor = bPct >= 100 ? "text-danger-500 bg-danger-50 dark:bg-danger-900/20 border-danger-200" : (bPct >= 80 ? "text-orange-500 bg-orange-50 dark:bg-orange-900/20 border-orange-200" : "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200");
                budgetHtml = `<span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${bColor}"><i class="fa-solid fa-bullseye"></i> Đã dùng ${bPct}% Ngân sách</span>`;
            }
        }

        let warningHtml = "";
        const prevCatAmt = state.transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === prevM && d.getFullYear() === prevY && t.category === cId && (walletId === "all" || t.walletId === walletId);
        }).reduce((sum, t) => sum + t.amount, 0);

        if (prevCatAmt > 0 && anCurrentType === 'expense') {
            const catDiff = amt - prevCatAmt;
            const catPct = (catDiff / prevCatAmt) * 100;
            if (catPct >= 50) { 
                warningHtml = `<span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border text-rose-500 bg-rose-50 dark:bg-rose-900/20 border-rose-200"><i class="fa-solid fa-arrow-trend-up"></i> Tăng ${catPct.toFixed(0)}%</span>`;
            }
        }

        return `
        <div class="relative overflow-hidden rounded-2xl border custom-border custom-bg-input p-4 shadow-sm cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" onclick="openAnBottomSheet('${cId}', '${barColor}')">
            <div class="flex items-start gap-3 mb-2">
                <div class="w-6 text-center text-sm font-black text-gray-400 mt-1">#${idx + 1}</div>
                <div class="w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center text-xl shadow-inner border border-white/40 shrink-0">${cat.icon}</div>
                <div class="flex-1 min-w-0 pt-0.5">
                    <p class="font-black text-sm custom-text truncate leading-tight">${cat.name}</p>
                    <div class="flex items-center gap-1.5 mt-1 flex-wrap">${budgetHtml} ${warningHtml}</div>
                </div>
                <div class="text-right shrink-0 ml-2">
                    <p class="font-black text-[15px] ${anCurrentType === 'income' ? 'text-success-500' : 'text-danger-500'}">${formatMoney(amt)}</p>
                    <p class="text-[10px] font-bold text-gray-500 mt-0.5">${pct}%</p>
                </div>
            </div>
            <div class="ml-9 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-1000" style="width: ${(amt/maxAmt)*100}%; background-color: ${barColor}"></div>
            </div>
        </div>`;
    }).join("");

    // =====================================
    // 4. VẼ BIỂU ĐỒ (CHART.JS)
    // =====================================
    if (typeof Chart === 'undefined') return;

    if (anChartDoughnut) anChartDoughnut.destroy();
    const ctxD = document.getElementById('an-doughnut-chart');
    if(ctxD) {
        const labels = sortedCats.map(c => state.categories.find(cat => cat.id === c[0])?.name || "Khác");
        const dataVals = sortedCats.map(c => c[1]);
        
        anChartDoughnut = new Chart(ctxD, {
            type: 'doughnut',
            data: { labels, datasets: [{ data: dataVals, backgroundColor: colorPalette, borderWidth: 2, borderColor: document.body.classList.contains('dark') ? '#1f2937' : '#ffffff' }] },
            options: { cutout: '75%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${formatMoney(c.raw)}` } } } }
        });
    }

    if (anChartBar) anChartBar.destroy();
    const ctxB = document.getElementById('an-bar-chart');
    if(ctxB) {
        let dailyData = Array(daysInMonth).fill(0);
        anRawTxs.forEach(t => {
            const d = new Date(t.date).getDate();
            dailyData[d - 1] += t.amount;
        });

        const mainColor = anCurrentType === 'expense' ? '#f43f5e' : '#10b981';
        anChartBar = new Chart(ctxB, {
            type: 'bar',
            data: { labels: Array.from({length: daysInMonth}, (_, i) => i + 1), datasets: [{ data: dailyData, backgroundColor: mainColor, borderRadius: 4 }] },
            options: {
                maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${formatMoney(c.raw)}` } } },
                scales: { x: { grid: { display: false }, ticks: { font: { size: 9 } } }, y: { display: false, beginAtZero: true } }
            }
        });
    }
};

// =====================================
// 5. BOTTOM SHEET (DRILL-DOWN)
// =====================================
let anBsCurrentCatId = null;

window.openAnBottomSheet = (catId, colorHex) => {
    anBsCurrentCatId = catId;
    const cat = state.categories.find(c => c.id === catId) || { name: "Khác", icon: "📦", color: "bg-gray-200" };
    
    document.getElementById("an-bs-icon").className = `w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner border custom-border ${cat.color}`;
    document.getElementById("an-bs-icon").innerText = cat.icon;
    document.getElementById("an-bs-title").innerText = cat.name;

    const catTxs = anRawTxs.filter(t => t.category === catId).sort((a, b) => b.amount - a.amount);
    const totalCatAmt = catTxs.reduce((sum, t) => sum + t.amount, 0);
    
    document.getElementById("an-bs-total").innerText = formatMoney(totalCatAmt);
    document.getElementById("an-bs-total").className = `text-sm font-black mt-0.5 ${anCurrentType === 'income' ? 'text-success-500' : 'text-danger-500'}`;

    const topTxBox = document.getElementById("an-bs-top-tx");
    if (catTxs.length > 0) {
        const topTx = catTxs[0];
        const dateStr = new Date(topTx.date).toLocaleDateString("vi-VN");
        topTxBox.innerHTML = `
            <div class="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-2xl relative overflow-hidden">
                <i class="fa-solid fa-crown absolute -right-2 -top-2 text-5xl text-indigo-500/10 transform rotate-12"></i>
                <p class="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest mb-1">Giao dịch "đậm" nhất</p>
                <p class="font-bold custom-text text-sm leading-tight">${topTx.note || "Không ghi chú"}</p>
                <div class="flex justify-between items-end mt-2">
                    <span class="text-xs font-bold text-gray-500">${dateStr}</span>
                    <span class="text-lg font-black text-indigo-600 dark:text-indigo-400">${formatMoney(topTx.amount)}</span>
                </div>
            </div>`;
    } else {
        topTxBox.innerHTML = '';
    }

    const listTxs = [...catTxs].sort((a, b) => new Date(b.date) - new Date(a.date));
    document.getElementById("an-bs-tx-list").innerHTML = listTxs.map(tx => {
        const dateStr = new Date(tx.date).toLocaleDateString("vi-VN");
        const hasImg = tx.image && tx.image.length > 50;
        const imgHtml = hasImg ? `<img src="${typeof window.getFastImage === 'function' ? window.getFastImage(tx.image) : tx.image}" loading="lazy" class="w-10 h-10 object-cover rounded-xl shrink-0 border custom-border">` : `<div class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 border custom-border text-gray-400"><i class="fa-solid fa-receipt"></i></div>`;
        
        return `
        <div class="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 mb-2 border custom-border rounded-xl shadow-sm" onclick="openModal('transaction', '${tx.id}')">
            ${imgHtml}
            <div class="flex-1 min-w-0">
                <p class="font-bold text-sm custom-text truncate">${tx.note || cat.name}</p>
                <p class="text-[10px] font-bold text-gray-400 mt-0.5">${dateStr}</p>
            </div>
            <p class="font-black text-sm custom-text shrink-0">${formatMoney(tx.amount)}</p>
        </div>`;
    }).join("");

    const actionBox = document.getElementById("an-bs-action");
    if (anCurrentType === 'expense') {
        const hasBudget = state.budgets.some(b => b.categoryId === catId);
        if (!hasBudget) actionBox.classList.remove("hidden");
        else actionBox.classList.add("hidden");
    } else {
        actionBox.classList.add("hidden");
    }

    const backdrop = document.getElementById("an-bottom-sheet-backdrop");
    const sheet = document.getElementById("an-bottom-sheet");
    backdrop.classList.remove("hidden");
    setTimeout(() => {
        backdrop.classList.remove("opacity-0");
        sheet.classList.remove("translate-y-full");
    }, 10);
    if (typeof playSound === 'function') playSound("pop");
};

window.closeAnBottomSheet = () => {
    const backdrop = document.getElementById("an-bottom-sheet-backdrop");
    const sheet = document.getElementById("an-bottom-sheet");
    backdrop.classList.add("opacity-0");
    sheet.classList.add("translate-y-full");
    setTimeout(() => backdrop.classList.add("hidden"), 300);
};

window.jumpToCreateBudget = () => {
    closeAnBottomSheet();
    closeAnalytics();
    switchView("budgets");
    setTimeout(() => {
        openModal('budget');
        setTimeout(() => {
            const selectEl = document.getElementById("b-c");
            if(selectEl) selectEl.value = anBsCurrentCatId;
        }, 100);
    }, 350);
};