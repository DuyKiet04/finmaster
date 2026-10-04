// ==============================================================
// FILE: trend-analytics.js - TRUNG TÂM KIỂM SOÁT DÒNG TIỀN
// ==============================================================

// 1. TỰ ĐỘNG BƠM GIAO DIỆN (ĐỘC LẬP HOÀN TOÀN)
(function injectTrendAnalyticsUI() {
    if (document.getElementById('trend-analytics-overlay')) return;

    const trendHTML = `
    <div id="trend-analytics-overlay" class="fixed inset-0 z-[200] custom-bg-body transition-transform duration-300 translate-x-full flex flex-col hidden">
        <!-- Header -->
        <div class="custom-bg-header dark:bg-gray-800/90 backdrop-blur-xl px-4 py-3 flex items-center justify-between shadow-sm shrink-0 z-30 border-b custom-border">
            <button onclick="closeTrendAnalytics()" class="w-10 h-10 flex items-center justify-center rounded-full custom-bg-card dark:bg-gray-700 custom-text-secondary hover:brightness-95 active:scale-90 transition-transform custom-shadow-sm border custom-border">
                <i class="fa-solid fa-arrow-left"></i>
            </button>
            <h3 class="font-black text-lg custom-text truncate flex-1 text-center mr-10">Báo cáo Xu hướng</h3>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar relative pb-20" id="trend-scroll-area">
            
            <!-- Bộ lọc thời gian -->
            <div class="sticky top-0 z-20 custom-bg-body/95 backdrop-blur-md px-4 py-3 border-b custom-border shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex justify-between items-center">
                <div class="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg border custom-border p-1">
                    <button onclick="changeTrendMonth(-1)" class="w-8 h-8 rounded-md hover:bg-white dark:hover:bg-gray-700 custom-text flex items-center justify-center transition-colors"><i class="fa-solid fa-chevron-left text-xs"></i></button>
                    <span id="trend-month-label" class="px-3 text-xs font-black custom-text uppercase tracking-widest min-w-[90px] text-center">T9/2026</span>
                    <button onclick="changeTrendMonth(1)" class="w-8 h-8 rounded-md hover:bg-white dark:hover:bg-gray-700 custom-text flex items-center justify-center transition-colors"><i class="fa-solid fa-chevron-right text-xs"></i></button>
                </div>
                <select id="trend-view-select" onchange="renderTrendData()" class="bg-gray-100 dark:bg-gray-800 border custom-border rounded-lg outline-none text-xs font-bold custom-text px-3 py-2.5 appearance-none">
                    <option value="daily">Theo ngày</option>
                </select>
            </div>

            <div class="p-4 space-y-5">
                <!-- KPI Sức khỏe tài chính -->
                <div class="grid grid-cols-2 gap-3">
                    <div class="custom-bg-card p-4 rounded-3xl border custom-border shadow-sm flex flex-col justify-center">
                        <p class="text-[10px] font-bold custom-text-secondary uppercase tracking-widest mb-1"><i class="fa-solid fa-arrow-down text-success-500 mr-1"></i> Tổng thu</p>
                        <p id="trend-total-inc" class="text-lg font-black text-success-500 truncate">0 ₫</p>
                    </div>
                    <div class="custom-bg-card p-4 rounded-3xl border custom-border shadow-sm flex flex-col justify-center">
                        <p class="text-[10px] font-bold custom-text-secondary uppercase tracking-widest mb-1"><i class="fa-solid fa-arrow-up text-danger-500 mr-1"></i> Tổng chi</p>
                        <p id="trend-total-exp" class="text-lg font-black text-danger-500 truncate">0 ₫</p>
                    </div>
                </div>
                
                <div class="custom-bg-card p-5 rounded-3xl border custom-border shadow-sm flex items-center justify-between">
                    <div>
                        <p class="text-[10px] font-bold custom-text-secondary uppercase tracking-widest mb-1">Dòng tiền thuần</p>
                        <p id="trend-net-flow" class="text-2xl font-black custom-text">0 ₫</p>
                    </div>
                    <div class="text-right">
                        <p class="text-[10px] font-bold custom-text-secondary uppercase tracking-widest mb-1">Tỷ lệ giữ lại</p>
                        <div id="trend-saving-rate" class="inline-block px-3 py-1 rounded-lg text-sm font-black bg-emerald-50 text-emerald-600 border border-emerald-200">0%</div>
                    </div>
                </div>

                <!-- Biểu đồ Xu hướng (Chart.js) -->
                <div class="custom-bg-card p-4 rounded-[2rem] border custom-border shadow-sm">
                    <div class="flex items-center justify-between mb-2">
                        <h4 class="font-black text-sm uppercase tracking-widest custom-text-secondary"><i class="fa-solid fa-chart-area text-primary-500 mr-1"></i> Biểu đồ lưu chuyển</h4>
                        <span class="text-[9px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">Chạm để xem chi tiết</span>
                    </div>
                    <div class="w-full h-56 relative">
                        <canvas id="trend-main-chart"></canvas>
                    </div>
                </div>

                <!-- AI Insight (Bắt đỉnh / Bắt đáy) -->
                <div class="custom-bg-card p-5 rounded-[2rem] border custom-border shadow-sm space-y-4">
                    <h4 class="font-black text-sm uppercase tracking-widest custom-text-secondary flex items-center gap-2"><i class="fa-solid fa-lightbulb text-amber-500"></i> Phân tích tự động</h4>
                    
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-800"><i class="fa-solid fa-fire"></i></div>
                        <div>
                            <p class="text-[10px] font-black uppercase tracking-widest text-gray-500">Ngày "Đốt tiền" nhiều nhất</p>
                            <p id="trend-max-exp-text" class="text-sm font-bold custom-text mt-0.5">Chưa có dữ liệu</p>
                        </div>
                    </div>
                    
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800"><i class="fa-solid fa-sack-dollar"></i></div>
                        <div>
                            <p class="text-[10px] font-black uppercase tracking-widest text-gray-500">Ngày "Cá kiếm" đỉnh nhất</p>
                            <p id="trend-max-inc-text" class="text-sm font-bold custom-text mt-0.5">Chưa có dữ liệu</p>
                        </div>
                    </div>

                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800"><i class="fa-solid fa-yin-yang"></i></div>
                        <div>
                            <p class="text-[10px] font-black uppercase tracking-widest text-gray-500">Ngày "Tu tâm dưỡng tính"</p>
                            <p id="trend-nospend-text" class="text-sm font-bold custom-text mt-0.5">Bạn có 0 ngày không tiêu tiền.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- BOTTOM SHEET CHI TIẾT NGÀY CHẠM -->
    <div id="trend-bs-backdrop" onclick="closeTrendBottomSheet()" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] hidden opacity-0 transition-opacity duration-300"></div>
    <div id="trend-bottom-sheet" class="fixed bottom-0 left-0 right-0 custom-bg-body z-[300] rounded-t-[2rem] border-t custom-border shadow-[0_-10px_40px_rgba(0,0,0,0.2)] transform translate-y-full transition-transform duration-300 flex flex-col max-h-[85vh]">
        <div class="w-full flex justify-center py-3 cursor-pointer" onclick="closeTrendBottomSheet()">
            <div class="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
        <div class="px-6 pb-4 border-b custom-border flex items-center justify-between shrink-0">
            <div>
                <h3 id="trend-bs-title" class="font-black text-xl custom-text">Ngày 00/00/0000</h3>
                <p id="trend-bs-stats" class="text-xs font-bold text-gray-500 mt-1">Thu: 0 ₫ • Chi: 0 ₫</p>
            </div>
        </div>
        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50 dark:bg-gray-900/50">
            <div id="trend-bs-tx-list" class="space-y-0"></div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', trendHTML);
})();

// 2. LOGIC XỬ LÝ
let trendCurrentDate = new Date();
let trendChartInstance = null;
let trendRawTxs = [];
let trendDailyData = []; // Lưu trữ mảng data để click

window.openTrendAnalytics = async () => {
    if (typeof Chart === 'undefined' && typeof window.loadScript === 'function') {
        await window.loadScript("https://cdn.jsdelivr.net/npm/chart.js");
    }

    const overlay = document.getElementById("trend-analytics-overlay");
    overlay.classList.remove("hidden");
    setTimeout(() => overlay.classList.remove("translate-x-full"), 10);
    
    renderTrendData();
    if (typeof playSound === 'function') playSound("pop");
};

window.closeTrendAnalytics = () => {
    const overlay = document.getElementById("trend-analytics-overlay");
    overlay.classList.add("translate-x-full");
    setTimeout(() => overlay.classList.add("hidden"), 300);
};

window.changeTrendMonth = (dir) => {
    trendCurrentDate.setMonth(trendCurrentDate.getMonth() + dir);
    renderTrendData();
    if (typeof playSound === 'function') playSound("click");
};

window.renderTrendData = () => {
    const y = trendCurrentDate.getFullYear();
    const m = trendCurrentDate.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    
    document.getElementById("trend-month-label").innerText = `T${m + 1}/${y}`;

    // Lọc data tháng này (Bỏ category transfer)
    trendRawTxs = state.transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === m && d.getFullYear() === y && t.category !== "transfer";
    });

    // 1. TÍNH TOÁN KPI
    let totalInc = 0, totalExp = 0;
    trendDailyData = Array.from({length: daysInMonth}, () => ({ inc: 0, exp: 0, txs: [] }));

    trendRawTxs.forEach(t => {
        const day = new Date(t.date).getDate();
        if (t.type === 'income') {
            totalInc += t.amount;
            trendDailyData[day - 1].inc += t.amount;
        } else {
            totalExp += t.amount;
            trendDailyData[day - 1].exp += t.amount;
        }
        trendDailyData[day - 1].txs.push(t);
    });

    document.getElementById("trend-total-inc").innerText = formatMoney(totalInc);
    document.getElementById("trend-total-exp").innerText = formatMoney(totalExp);
    
    const netFlow = totalInc - totalExp;
    const netEl = document.getElementById("trend-net-flow");
    netEl.innerText = `${netFlow > 0 ? '+' : ''}${formatMoney(netFlow)}`;
    netEl.className = `text-2xl font-black ${netFlow >= 0 ? 'text-success-500' : 'text-danger-500'}`;

    // Tỷ lệ tiết kiệm
    const savingRateEl = document.getElementById("trend-saving-rate");
    if (totalInc === 0) {
        savingRateEl.innerText = "0%";
        savingRateEl.className = "inline-block px-3 py-1 rounded-lg text-sm font-black bg-gray-100 text-gray-500 dark:bg-gray-800 border custom-border";
    } else {
        const rate = ((netFlow / totalInc) * 100).toFixed(1);
        savingRateEl.innerText = `${rate}%`;
        if (rate >= 20) savingRateEl.className = "inline-block px-3 py-1 rounded-lg text-sm font-black bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/30";
        else if (rate >= 0) savingRateEl.className = "inline-block px-3 py-1 rounded-lg text-sm font-black bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-900/30";
        else savingRateEl.className = "inline-block px-3 py-1 rounded-lg text-sm font-black bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-900/30";
    }

    // 2. AI PHÂN TÍCH (BẮT ĐỈNH)
    let maxIncDay = 0, maxIncVal = 0;
    let maxExpDay = 0, maxExpVal = 0;
    let noSpendDays = 0;

    const today = new Date();
    let daysPassed = daysInMonth;
    if (y === today.getFullYear() && m === today.getMonth()) {
        daysPassed = today.getDate();
    }

    for (let i = 0; i < daysPassed; i++) {
        const d = trendDailyData[i];
        if (d.inc > maxIncVal) { maxIncVal = d.inc; maxIncDay = i + 1; }
        if (d.exp > maxExpVal) { maxExpVal = d.exp; maxExpDay = i + 1; }
        if (d.exp === 0) noSpendDays++;
    }

    document.getElementById("trend-max-exp-text").innerHTML = maxExpVal > 0 ? `Ngày <b>${String(maxExpDay).padStart(2, '0')}/${String(m + 1).padStart(2, '0')}</b> bạn đã chi ${formatMoney(maxExpVal)}` : "Chưa tiêu đồng nào!";
    document.getElementById("trend-max-inc-text").innerHTML = maxIncVal > 0 ? `Ngày <b>${String(maxIncDay).padStart(2, '0')}/${String(m + 1).padStart(2, '0')}</b> có thu nhập ${formatMoney(maxIncVal)}` : "Chưa có thu nhập!";
    document.getElementById("trend-nospend-text").innerHTML = `Tháng này có <b>${noSpendDays} ngày</b> không tiêu một cắt nào.`;

    // 3. VẼ BIỂU ĐỒ (CHART.JS)
    if (typeof Chart === 'undefined') return;
    if (trendChartInstance) trendChartInstance.destroy();

    const ctx = document.getElementById('trend-main-chart').getContext('2d');
    const labels = Array.from({length: daysInMonth}, (_, i) => String(i + 1).padStart(2, '0'));
    const dataInc = trendDailyData.map(d => d.inc);
    const dataExp = trendDailyData.map(d => d.exp);

    // Tạo hiệu ứng đổ bóng mờ (Gradient) giống thiết kế
    const gradExp = ctx.createLinearGradient(0, 0, 0, 200);
    gradExp.addColorStop(0, 'rgba(244, 63, 94, 0.4)'); // Đỏ
    gradExp.addColorStop(1, 'rgba(244, 63, 94, 0.0)');

    const gradInc = ctx.createLinearGradient(0, 0, 0, 200);
    gradInc.addColorStop(0, 'rgba(16, 185, 129, 0.4)'); // Xanh
    gradInc.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    trendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Thu',
                    data: dataInc,
                    borderColor: '#10b981',
                    backgroundColor: gradInc,
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                    pointHitRadius: 15
                },
                {
                    label: 'Chi',
                    data: dataExp,
                    borderColor: '#f43f5e',
                    backgroundColor: gradExp,
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                    pointHitRadius: 15
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: { label: (c) => ` ${c.dataset.label}: ${formatMoney(c.raw)}` }
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { maxTicksLimit: 6, font: { size: 10 } } },
                y: { display: true, grid: { borderDash: [4, 4] }, ticks: { display: false, beginAtZero: true } }
            },
            onClick: (e, elements) => {
                if (elements.length > 0) {
                    const dataIndex = elements[0].index;
                    const day = dataIndex + 1;
                    openTrendBottomSheet(day);
                }
            }
        }
    });
};

// 4. BOTTOM SHEET (CHẠM VÀO BIỂU ĐỒ ĐỂ ĐÀO SÂU)
window.openTrendBottomSheet = (day) => {
    const y = trendCurrentDate.getFullYear();
    const m = trendCurrentDate.getMonth();
    const dayData = trendDailyData[day - 1];
    
    document.getElementById("trend-bs-title").innerText = `Ngày ${String(day).padStart(2, '0')}/${String(m + 1).padStart(2, '0')}/${y}`;
    document.getElementById("trend-bs-stats").innerHTML = `<span class="text-success-500">+${formatMoney(dayData.inc)}</span> <span class="mx-1 text-gray-300">|</span> <span class="text-danger-500">-${formatMoney(dayData.exp)}</span>`;

    const txBox = document.getElementById("trend-bs-tx-list");
    if (dayData.txs.length === 0) {
        txBox.innerHTML = `<div class="text-center py-6 opacity-60"><i class="fa-solid fa-mug-hot text-3xl text-gray-400 mb-2"></i><p class="text-sm font-bold custom-text-secondary">Hôm nay không có giao dịch nào!</p></div>`;
    } else {
        const sortedTxs = [...dayData.txs].sort((a, b) => new Date(b.date) - new Date(a.date));
        txBox.innerHTML = sortedTxs.map(tx => {
            const cat = state.categories.find(c => c.id === tx.category) || { name: "Khác", icon: "📦" };
            const isInc = tx.type === 'income';
            
            return `
            <div class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 mb-2 border custom-border rounded-xl shadow-sm cursor-pointer" onclick="openModal('transaction', '${tx.id}')">
                <div class="flex items-center gap-3 min-w-0">
                    <span class="text-xl">${cat.icon}</span>
                    <div class="min-w-0">
                        <p class="font-bold text-sm custom-text truncate">${tx.note || cat.name}</p>
                        <p class="text-[10px] font-bold text-gray-400 mt-0.5">${cat.name}</p>
                    </div>
                </div>
                <p class="font-black text-sm shrink-0 ml-2 ${isInc ? 'text-success-500' : 'text-danger-500'}">${isInc ? '+' : '-'}${formatMoney(tx.amount)}</p>
            </div>`;
        }).join("");
    }

    const backdrop = document.getElementById("trend-bs-backdrop");
    const sheet = document.getElementById("trend-bottom-sheet");
    backdrop.classList.remove("hidden");
    setTimeout(() => {
        backdrop.classList.remove("opacity-0");
        sheet.classList.remove("translate-y-full");
    }, 10);
    if (typeof playSound === 'function') playSound("pop");
};

window.closeTrendBottomSheet = () => {
    const backdrop = document.getElementById("trend-bs-backdrop");
    const sheet = document.getElementById("trend-bottom-sheet");
    backdrop.classList.add("opacity-0");
    sheet.classList.add("translate-y-full");
    setTimeout(() => backdrop.classList.add("hidden"), 300);
};