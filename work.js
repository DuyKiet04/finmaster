// ==========================================
// FINMASTER WORK & JOURNAL CENTER - LIQUID GLASS EDITION
// Spatial Depth, Bento KPIs, Tactile Calendar, Story Timeline
// ==========================================

(function () {
    const uid = () => typeof generateId === 'function' ? generateId() : Math.random().toString(36).substring(2, 9);
    const normalizeStr = str => str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

    // ==========================================
    // 1. TỰ ĐỘNG BƠM GIAO DIỆN CHÍNH (SPATIAL LIQUID GLASS UI)
    // ==========================================
    function injectWorkUI() {
        if (document.getElementById("view-work")) return;

        const workHtml = `
        <div id="view-work" class="view-section hidden pt-3 pb-28 relative min-h-screen font-sans">
            
            <!-- THANH ĐIỀU HƯỚNG TABS (FLOATING HERO ISLAND) -->
            <div class="px-2 mb-4 sticky top-2 z-40 max-w-4xl mx-auto">
                <div class="work-hero-glass p-1.5 rounded-full flex items-center justify-between gap-1 shadow-xl">
                    <button onclick="workSwitchTab('tab-overview')" id="btn-tab-overview" class="work-tab-btn active flex-1 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-black text-white flex items-center justify-center gap-2">
                        <i class="fa-solid fa-calendar-check"></i>
                        <span>Lịch Trình</span>
                        <span id="work-badge-today" class="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-bold backdrop-blur-sm">Tháng này</span>
                    </button>
                    <button onclick="workSwitchTab('tab-stats')" id="btn-tab-stats" class="work-tab-btn flex-1 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold custom-text-secondary flex items-center justify-center gap-2">
                        <i class="fa-solid fa-chart-pie"></i>
                        <span>Thống Kê</span>
                        <span id="work-badge-stats-count" class="text-[10px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 font-bold">Báo cáo</span>
                    </button>
                </div>
            </div>

            <!-- ============================== -->
            <!-- TAB 1: TỔNG QUAN (CALENDAR + TIMELINE) -->
            <!-- ============================== -->
            <div id="tab-overview" class="work-tab-content animate-fadeIn block px-2 space-y-4 max-w-4xl mx-auto">
                
                <!-- MONTHLY 4-METRIC BENTO RIBBON -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    <!-- KPI 1: Tổng chi tháng -->
                    <div class="work-kpi-card p-3.5 sm:p-4 flex flex-col justify-between">
                        <div class="flex items-center justify-between mb-1.5">
                            <span class="text-[10px] font-black uppercase tracking-wider text-rose-500">Chi tháng</span>
                            <div class="w-7 h-7 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center text-xs">
                                <i class="fa-solid fa-receipt"></i>
                            </div>
                        </div>
                        <div id="work-kpi-total" class="text-base sm:text-lg font-black text-rose-500 truncate">0 ₫</div>
                        <div class="text-[9px] font-semibold custom-text-secondary mt-0.5">Khoản chi công sở</div>
                    </div>

                    <!-- KPI 2: Ngày làm việc -->
                    <div class="work-kpi-card p-3.5 sm:p-4 flex flex-col justify-between">
                        <div class="flex items-center justify-between mb-1.5">
                            <span class="text-[10px] font-black uppercase tracking-wider text-blue-500">Ngày làm</span>
                            <div class="w-7 h-7 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center text-xs">
                                <i class="fa-solid fa-briefcase"></i>
                            </div>
                        </div>
                        <div id="work-kpi-days" class="text-base sm:text-lg font-black custom-text truncate">0 ngày</div>
                        <div class="text-[9px] font-semibold custom-text-secondary mt-0.5">Có hoạt động/chi</div>
                    </div>

                    <!-- KPI 3: Ký sự -->
                    <div class="work-kpi-card p-3.5 sm:p-4 flex flex-col justify-between">
                        <div class="flex items-center justify-between mb-1.5">
                            <span class="text-[10px] font-black uppercase tracking-wider text-amber-500">Ký sự</span>
                            <div class="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-xs">
                                <i class="fa-solid fa-book-open"></i>
                            </div>
                        </div>
                        <div id="work-kpi-logs" class="text-base sm:text-lg font-black text-amber-500 truncate">0 bài</div>
                        <div class="text-[9px] font-semibold custom-text-secondary mt-0.5">Nhật ký đã ghi</div>
                    </div>

                    <!-- KPI 4: Trung bình/ngày -->
                    <div class="work-kpi-card p-3.5 sm:p-4 flex flex-col justify-between">
                        <div class="flex items-center justify-between mb-1.5">
                            <span class="text-[10px] font-black uppercase tracking-wider text-emerald-500">TB/ngày</span>
                            <div class="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-xs">
                                <i class="fa-solid fa-chart-simple"></i>
                            </div>
                        </div>
                        <div id="work-kpi-avg" class="text-base sm:text-lg font-black text-emerald-500 truncate">0 ₫</div>
                        <div class="text-[9px] font-semibold custom-text-secondary mt-0.5">Chi bình quân</div>
                    </div>
                </div>

                <!-- SMART CALENDAR CARD (SPATIAL GLASS) -->
                <div class="work-cal-card p-5 sm:p-6 relative overflow-hidden">
                    <div class="flex justify-between items-center mb-5 relative z-10">
                        <button onclick="workChangeMonth(-1)" class="w-10 h-10 flex items-center justify-center rounded-2xl custom-bg-input custom-text hover:text-primary-500 transition-all active:scale-90 border custom-border shadow-sm" title="Tháng trước">
                            <i class="fa-solid fa-chevron-left text-xs"></i>
                        </button>
                        
                        <div class="flex items-center gap-2 sm:gap-3">
                            <span id="work-calendar-title" class="text-base sm:text-lg font-black custom-text tracking-wider uppercase">THÁNG --/----</span>
                            <button onclick="window.workJumpToToday()" class="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-primary-500/15 text-primary-500 hover:bg-primary-500/25 transition-colors border border-primary-500/30 active:scale-95 shadow-sm">
                                Hôm nay
                            </button>
                        </div>

                        <button onclick="workChangeMonth(1)" class="w-10 h-10 flex items-center justify-center rounded-2xl custom-bg-input custom-text hover:text-primary-500 transition-all active:scale-90 border custom-border shadow-sm" title="Tháng sau">
                            <i class="fa-solid fa-chevron-right text-xs"></i>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-7 gap-1 mb-3 text-center text-[11px] font-black uppercase tracking-wider relative z-10">
                        <div class="custom-text-secondary">T2</div>
                        <div class="custom-text-secondary">T3</div>
                        <div class="custom-text-secondary">T4</div>
                        <div class="custom-text-secondary">T5</div>
                        <div class="custom-text-secondary">T6</div>
                        <div class="text-rose-500">T7</div>
                        <div class="text-rose-500">CN</div>
                    </div>
                    
                    <div id="work-calendar-grid" class="grid grid-cols-7 gap-y-3.5 gap-x-1 sm:gap-x-2 text-center mb-4 relative z-10"></div>
                    
                    <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 border-t border-dashed custom-border text-[11px] font-bold custom-text-secondary uppercase tracking-wider relative z-10">
                        <span class="flex items-center gap-2"><div class="w-2.5 h-2.5 rounded-full work-dot-expense"></div> Chi tiêu</span>
                        <span class="flex items-center gap-2"><div class="w-2.5 h-2.5 rounded-full work-dot-journal"></div> Ký sự</span>
                        <span class="flex items-center gap-2"><div class="w-3.5 h-3.5 rounded-md border-2 border-primary-500 flex items-center justify-center text-[8px] font-black text-primary-500">H</div> Hôm nay</span>
                    </div>
                </div>

                <!-- LỊCH TRÌNH CHI TIẾT (TIMELINE FEED) -->
                <div class="relative pt-2 pb-10">
                    <div class="absolute left-6 sm:left-[3.25rem] top-6 bottom-0 w-0.5 bg-gradient-to-b from-primary-500/50 via-gray-300 dark:via-gray-700 to-transparent"></div>
                    <div id="work-daily-feed" class="space-y-4 relative z-10"></div>
                </div>
            </div>

            <!-- ============================== -->
            <!-- TAB 2: THỐNG KÊ (STATS & TOP CATEGORIES) -->
            <!-- ============================== -->
            <div id="tab-stats" class="work-tab-content animate-fadeIn hidden px-2 space-y-4 max-w-4xl mx-auto">
                
                <!-- Box Tổng kết Bento -->
                <div class="work-cal-card p-5 sm:p-6 relative overflow-hidden" id="work-stats-container">
                    <!-- JS Bơm thống kê vào đây -->
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Box Biểu đồ cột -->
                    <div class="work-cal-card p-5 sm:p-6 flex flex-col">
                        <div class="flex items-center gap-3 border-b border-dashed custom-border pb-3.5 mb-4">
                            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center text-base shadow-md shadow-rose-500/30">
                                <i class="fa-solid fa-chart-column"></i>
                            </div>
                            <div>
                                <p class="text-xs font-black custom-text uppercase tracking-wider">Biểu Đồ Chi Tiêu</p>
                                <p class="text-[10px] font-semibold custom-text-secondary">Phân bổ chi theo từng ngày</p>
                            </div>
                        </div>
                        <div class="flex-1 min-h-[220px] relative">
                            <canvas id="workChartExpense"></canvas>
                        </div>
                    </div>

                    <!-- BẢNG XẾP HẠNG TOP DANH MỤC CÔNG VIỆC -->
                    <div class="work-cal-card p-5 sm:p-6 flex flex-col">
                        <div class="flex items-center gap-3 border-b border-dashed custom-border pb-3.5 mb-4">
                            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-base shadow-md shadow-amber-500/30">
                                <i class="fa-solid fa-trophy"></i>
                            </div>
                            <div>
                                <p class="text-xs font-black custom-text uppercase tracking-wider">Cơ Cấu Danh Mục</p>
                                <p class="text-[10px] font-semibold custom-text-secondary">Xếp hạng chi phí công sở</p>
                            </div>
                        </div>
                        <div id="work-cat-list" class="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1 max-h-[260px]"></div>
                    </div>
                </div>
            </div>

            <!-- NÚT ĐĂNG NHẬT KÝ (FAB GLOW) -->
            <button onclick="workOpenJournalForm()" class="work-fab-glow fixed bottom-24 right-5 sm:right-8 w-14 h-14 text-white rounded-full flex items-center justify-center text-xl z-40 border-2 border-white/40 shadow-2xl group active:scale-95" title="Viết ký sự mới">
                <i class="fa-solid fa-pen-nib group-hover:rotate-12 transition-transform duration-300"></i>
            </button>
        </div>
        `;
        
        const scrollArea = document.getElementById("main-scroll-area");
        if (scrollArea) scrollArea.insertAdjacentHTML("beforeend", workHtml);
    }

    // ==========================================
    // 2. LOGIC TABS & LƯU TRỮ
    // ==========================================
    window.workSwitchTab = (tabId) => {
        document.querySelectorAll(".work-tab-btn").forEach(btn => {
            btn.classList.remove("active");
            btn.classList.add("custom-text-secondary");
            btn.classList.remove("text-white");
        });
        const activeBtn = document.getElementById("btn-" + tabId);
        if(activeBtn) {
            activeBtn.classList.add("active");
            activeBtn.classList.remove("custom-text-secondary");
            activeBtn.classList.add("text-white");
        }

        document.querySelectorAll(".work-tab-content").forEach(content => {
            content.classList.add("hidden");
            content.classList.remove("block");
        });
        const activeContent = document.getElementById(tabId);
        if(activeContent) {
            activeContent.classList.remove("hidden");
            activeContent.classList.add("block");
        }

        window.renderWorkDashboard();
    };

    function initWorkData() {
        if (!state.workData || !state.workData.logs) { state.workData = { logs: [] }; }
        if (!window.workSelectedDate) { 
            window.workSelectedDate = (typeof getToday === 'function' ? getToday() : new Date().toISOString()).slice(0, 10); 
        }
    }

    const origSwitchView = window.switchView;
    window.switchView = function(viewId) {
        if (viewId === "work") { injectWorkUI(); initWorkData(); }
        if (origSwitchView) origSwitchView(viewId);
        if (viewId === "work") {
            window.renderWorkDashboard();
            const fM = document.getElementById("fab-mobile"); 
            const fD = document.getElementById("fab-desktop");
            if(fM) fM.classList.add("hidden"); 
            if(fD) fD.classList.add("hidden");
        }
    };

    window.workChangeMonth = (dir) => {
        window.workViewMonth += dir;
        if (window.workViewMonth < 0) { window.workViewMonth = 11; window.workViewYear--; }
        else if (window.workViewMonth > 11) { window.workViewMonth = 0; window.workViewYear++; }
        window.renderWorkDashboard();
    };

    window.workSelectDay = (dateStr) => {
        window.workSelectedDate = dateStr;
        window.renderWorkDashboard();
    };

    window.workJumpToToday = () => {
        const todayStr = (typeof getToday === 'function' ? getToday() : new Date().toISOString()).slice(0, 10);
        const todayObj = new Date(todayStr + "T00:00:00");
        window.workViewMonth = todayObj.getMonth();
        window.workViewYear = todayObj.getFullYear();
        window.workSelectedDate = todayStr;
        window.renderWorkDashboard();
    };

    window.workAddQuickExpense = () => {
        if (typeof openModal === 'function') {
            openModal("transaction");
            setTimeout(() => {
                const isWorkEl = document.getElementById("t-is-work");
                if (isWorkEl) isWorkEl.checked = true;
                const dateEl = document.getElementById("m-date");
                if (dateEl && window.workSelectedDate) {
                    if (dateEl._flatpickr) {
                        dateEl._flatpickr.setDate(window.workSelectedDate + " 12:00");
                    } else {
                        dateEl.value = window.workSelectedDate + " 12:00";
                    }
                }
            }, 60);
        }
    };

    window.workApplyFilter = () => {
        const s = document.getElementById('work-filter-start')?.value;
        const e = document.getElementById('work-filter-end')?.value;
        window.workFilterStart = s;
        window.workFilterEnd = e;
        if (s && e) {
            if (new Date(s) > new Date(e)) return alert("Ngày bắt đầu không được lớn hơn ngày kết thúc đại ka ơi!");
            window.renderWorkDashboard();
        }
    };

    window.workClearFilter = () => {
        window.workFilterStart = "";
        window.workFilterEnd = "";
        window.renderWorkDashboard();
    };

    // ==========================================
    // 3. RENDER MASTER ENGINE
    // ==========================================
    window.renderWorkDashboard = () => {
        const data = state.workData || { logs: [] };

        if (window.workViewMonth === undefined) {
            const sdObj = new Date(window.workSelectedDate + "T00:00:00");
            window.workViewMonth = sdObj.getMonth();
            window.workViewYear = sdObj.getFullYear();
        }
        const curM = window.workViewMonth;
        const curY = window.workViewYear;
        
        const titleEl = document.getElementById("work-calendar-title");
        if (titleEl) titleEl.innerText = `THÁNG ${curM + 1}/${curY}`;

        const workTransAll = (state.transactions || []).filter(t => {
            if (t.type !== 'expense') return false;
            if (t.isWork) return true;
            const cat = (state.categories || []).find(c => c.id === t.category);
            return cat && normalizeStr(cat.name).includes("lam");
        });

        const monthStr = `${curY}-${String(curM + 1).padStart(2,'0')}`;
        const workTransInMonth = workTransAll.filter(t => t.date.startsWith(monthStr));
        const monthLogs = (data.logs || []).filter(l => l.date && l.date.startsWith(monthStr) && (l.journalImages?.length > 0 || l.journalNote || l.journalMood));

        // ==========================================
        // CẬP NHẬT 4 THẺ BENTO MONTHLY RIBBON
        // ==========================================
        const totalMonthExpense = workTransInMonth.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const activeDaysSet = new Set();
        workTransInMonth.forEach(t => activeDaysSet.add(t.date.split(' ')[0]));
        monthLogs.forEach(l => activeDaysSet.add(l.date.split(' ')[0]));
        const activeDaysCount = activeDaysSet.size;
        const monthLogsCount = monthLogs.length;
        const avgPerActiveDay = activeDaysCount > 0 ? Math.round(totalMonthExpense / activeDaysCount) : 0;

        const kpiTotal = document.getElementById("work-kpi-total");
        if (kpiTotal) kpiTotal.innerText = formatMoney(totalMonthExpense);
        const kpiDays = document.getElementById("work-kpi-days");
        if (kpiDays) kpiDays.innerText = `${activeDaysCount} ngày`;
        const kpiLogs = document.getElementById("work-kpi-logs");
        if (kpiLogs) kpiLogs.innerText = `${monthLogsCount} bài`;
        const kpiAvg = document.getElementById("work-kpi-avg");
        if (kpiAvg) kpiAvg.innerText = formatMoney(avgPerActiveDay);
        const badgeStats = document.getElementById("work-badge-stats-count");
        if (badgeStats) badgeStats.innerText = `${activeDaysCount} ngày hoạt động`;

        // ==========================================
        // VẼ SMART CALENDAR GRID
        // ==========================================
        const daysInMonth = new Date(curY, curM + 1, 0).getDate();
        const firstDay = new Date(curY, curM, 1).getDay();
        let emptyCells = firstDay === 0 ? 6 : firstDay - 1; 
        let calHtml = "";

        for (let i = 0; i < emptyCells; i++) calHtml += `<div></div>`;

        const todayDateStr = (typeof getToday === 'function' ? getToday() : new Date().toISOString()).slice(0, 10);

        for (let d = 1; d <= daysInMonth; d++) {
            const currentScanDateStr = `${curY}-${String(curM + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const isSelected = currentScanDateStr === window.workSelectedDate;
            const isToday = currentScanDateStr === todayDateStr;

            const hasTrans = workTransInMonth.some(t => t.date.startsWith(currentScanDateStr));
            const hasJournal = data.logs.some(l => l.date === currentScanDateStr && (l.journalImages?.length > 0 || l.journalNote || l.journalMood));

            let dotHtml = "";
            if (hasTrans && hasJournal) {
                dotHtml = `<span class="w-1.5 h-1.5 rounded-full work-dot-expense"></span><span class="w-1.5 h-1.5 rounded-full work-dot-journal"></span>`;
            } else if (hasTrans) {
                dotHtml = `<span class="w-1.5 h-1.5 rounded-full work-dot-expense"></span>`;
            } else if (hasJournal) {
                dotHtml = `<span class="w-1.5 h-1.5 rounded-full work-dot-journal"></span>`;
            }

            let cellClasses = "work-day-cell";
            if (isSelected) cellClasses += " selected";
            if (isToday) cellClasses += " today";

            calHtml += `
                <div class="relative py-1 flex flex-col items-center">
                    <button type="button" onclick="window.workSelectDay('${currentScanDateStr}')" class="${cellClasses}" title="Ngày ${d}">
                        <span>${d}</span>
                    </button>
                    <div class="absolute bottom-0 left-0 right-0 flex justify-center items-center gap-1 pointer-events-none">${dotHtml}</div>
                </div>
            `;
        }
        const calGrid = document.getElementById("work-calendar-grid");
        if (calGrid) calGrid.innerHTML = calHtml;

        // ==========================================
        // VẼ TIMELINE FEED CỰC ĐẸP
        // ==========================================
        const feedContainer = document.getElementById("work-daily-feed");
        if (feedContainer) {
            const selDateObj = new Date(window.workSelectedDate + "T00:00:00");
            const dayOfWeekIndex = selDateObj.getDay();
            const vnDays = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
            const vnDayName = vnDays[dayOfWeekIndex] || "Ngày";
            const displayDateStr = `${String(selDateObj.getDate()).padStart(2,'0')}/${String(selDateObj.getMonth()+1).padStart(2,'0')}/${selDateObj.getFullYear()}`;
            const isToday = window.workSelectedDate === todayDateStr;
            
            let feedHtml = `
            <div class="flex items-center justify-between mb-4 pl-12 sm:pl-16 pr-2">
                <div>
                    <div class="flex items-center gap-2">
                        <h4 class="font-black text-base sm:text-lg custom-text tracking-tight">${vnDayName}, ${displayDateStr}</h4>
                        ${isToday ? `<span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary-500 text-white shadow-sm shadow-primary-500/30">Hôm nay</span>` : ''}
                    </div>
                    <p class="text-[10px] font-bold custom-text-secondary uppercase tracking-widest mt-0.5">Dòng thời gian hoạt động</p>
                </div>
                <div class="flex items-center gap-1.5 sm:gap-2">
                    <button onclick="window.workOpenJournalForm()" class="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-black flex items-center gap-1.5 active:scale-95 transition-all shadow-sm" title="Viết ký sự cho ngày này">
                        <i class="fa-solid fa-pen-nib text-[11px]"></i>
                        <span class="hidden sm:inline">Ký sự</span>
                    </button>
                    <button onclick="window.workAddQuickExpense()" class="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-500 hover:bg-rose-500/25 border border-rose-500/30 text-xs font-black flex items-center gap-1.5 active:scale-95 transition-all shadow-sm" title="Thêm chi tiêu công sở">
                        <i class="fa-solid fa-plus text-[11px]"></i>
                        <span class="hidden sm:inline">Chi tiêu</span>
                    </button>
                </div>
            </div>`;

            const dayTrans = workTransAll.filter(t => t.date.startsWith(window.workSelectedDate));
            const dayLogs = data.logs.filter(l => l.date === window.workSelectedDate && (l.journalImages?.length > 0 || l.journalNote || l.journalMood));

            if (dayTrans.length === 0 && dayLogs.length === 0) {
                feedHtml += `
                    <div class="pl-12 sm:pl-16 pr-2">
                        <div class="work-empty-glass p-8 text-center flex flex-col items-center justify-center gap-4 mt-2">
                            <div class="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-3xl shadow-inner work-coffee-float">
                                <i class="fa-solid fa-mug-hot"></i>
                            </div>
                            <div>
                                <p class="text-base font-black custom-text">Ngày bình yên & thảnh thơi!</p>
                                <p class="text-xs font-semibold custom-text-secondary mt-1">Chưa có chi tiêu công sở hay ký sự nào trong ngày này.</p>
                            </div>
                            <div class="flex items-center gap-3 pt-2">
                                <button onclick="window.workOpenJournalForm()" class="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs shadow-md shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-1.5">
                                    <i class="fa-solid fa-pen-nib"></i> Viết ký sự
                                </button>
                                <button onclick="window.workAddQuickExpense()" class="px-4 py-2.5 rounded-2xl custom-bg-input border custom-border font-black text-xs custom-text hover:text-rose-500 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm">
                                    <i class="fa-solid fa-plus"></i> Ghi chi tiêu
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                // 1. Giao dịch đi làm (Chi phí)
                dayTrans.forEach(t => {
                    const cat = (state.categories || []).find(c => c.id === t.category) || { name: 'Khác', icon: '🌟', color: 'bg-gray-100 text-gray-500' };
                    const timeStr = t.date.split(" ")[1] ? t.date.split(" ")[1].substring(0,5) : "--:--";
                    
                    let iconContent = cat.icon || '🌟';
                    if (iconContent.startsWith('fa-')) {
                        iconContent = `<i class="fa-solid ${iconContent}"></i>`;
                    } else if (/^[a-zA-Z0-9-]+$/.test(iconContent) && iconContent.length > 2) {
                        iconContent = `<i class="fa-solid fa-${iconContent}"></i>`;
                    }

                    const fallbackHtml = `<div class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${cat.color} flex items-center justify-center text-xl sm:text-2xl shadow-sm border custom-border shrink-0">${iconContent}</div>`;
                    let visualHtml = fallbackHtml;

                    if (t.image && typeof t.image === 'string' && t.image.length > 20 && t.image !== "null" && t.image !== "undefined") {
                        const imgSrc = window.getFastImage ? window.getFastImage(t.image) : t.image;
                        visualHtml = `
                        <div class="relative w-11 h-11 sm:w-12 sm:h-12 shrink-0">
                            ${fallbackHtml}
                            <img src="${imgSrc}" onerror="this.style.display='none'" class="absolute inset-0 w-full h-full rounded-2xl object-cover shadow-sm border custom-border cursor-pointer hover:opacity-85 z-10 bg-white dark:bg-gray-800" onclick="window.workViewImageFullScreen(this.src)" title="Xem ảnh">
                        </div>`;
                    }

                    const walletObj = state.wallets ? state.wallets.find(w => w.id === t.walletId) : null;

                    feedHtml += `
                        <div class="relative pl-12 sm:pl-16 pr-1 sm:pr-2 mb-4 group">
                            <!-- Glowing Pin Node on Timeline -->
                            <div class="absolute left-[1.05rem] sm:left-[2.8rem] top-5 w-4 h-4 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 border-2 border-white dark:border-gray-900 shadow-md shadow-rose-500/40 z-20 flex items-center justify-center text-[7px] text-white group-hover:scale-125 transition-transform">
                                <i class="fa-solid fa-receipt"></i>
                            </div>
                            
                            <div class="work-feed-card p-4 sm:p-5 relative overflow-hidden">
                                <div class="flex items-center justify-between gap-3 mb-2">
                                    <div class="flex items-center gap-3 min-w-0">
                                        ${visualHtml}
                                        <div class="min-w-0">
                                            <p class="text-sm sm:text-base font-black custom-text truncate leading-tight">${cat.name}</p>
                                            <p class="text-[11px] font-semibold custom-text-secondary mt-1 flex items-center gap-1.5">
                                                <i class="fa-regular fa-clock text-[10px] opacity-70"></i> ${timeStr}
                                                ${walletObj ? `<span class="opacity-40">•</span><span>${walletObj.name}</span>` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div class="text-right shrink-0">
                                        <span class="inline-block text-sm sm:text-base font-black text-rose-500 px-3 py-1 rounded-2xl bg-rose-500/10 border border-rose-500/20 shadow-sm">
                                            -${formatMoney(t.amount)}
                                        </span>
                                    </div>
                                </div>
                                ${(t.note || t.locationName) ? `
                                <div class="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-dashed custom-border text-xs">
                                    ${t.note ? `<span class="px-2.5 py-1 rounded-xl bg-black/5 dark:bg-white/5 font-medium custom-text-secondary flex items-center gap-1.5 border custom-border"><i class="fa-solid fa-align-left text-gray-400 text-[10px]"></i> ${t.note}</span>` : ''}
                                    ${t.locationName ? `<span class="px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5 border border-rose-500/20"><i class="fa-solid fa-location-dot text-[10px]"></i> ${window.formatShortAddress ? window.formatShortAddress(t.locationName) : t.locationName}</span>` : ''}
                                </div>` : ''}
                            </div>
                        </div>
                    `;
                });

                // 2. Ký sự (Logs)
                if (dayLogs.length > 0) {
                    const sortedLogs = [...dayLogs].reverse();
                    sortedLogs.forEach(logItem => {
                        let imagesHtml = '';
                        const currentImages = logItem.journalImages || (logItem.journalImage ? [logItem.journalImage] : []);
                        if (currentImages.length > 0) {
                            imagesHtml = `<div class="flex gap-2.5 mb-3 overflow-x-auto custom-scrollbar snap-x pb-2">` + 
                                currentImages.map(img => `<img src="${window.getFastImage ? window.getFastImage(img) : img}" onclick="window.workViewImageFullScreen('${img}')" class="h-32 sm:h-36 w-auto min-w-[120px] object-cover rounded-2xl border custom-border shadow-sm snap-center cursor-pointer hover:brightness-90 active:scale-95 transition-all">`).join('') +
                                `</div>`;
                        }

                        feedHtml += `
                            <div class="relative pl-12 sm:pl-16 pr-1 sm:pr-2 mb-4 group">
                                <!-- Glowing Pin Node on Timeline -->
                                <div class="absolute left-[1.05rem] sm:left-[2.8rem] top-5 w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 border-2 border-white dark:border-gray-900 shadow-md shadow-amber-500/40 z-20 flex items-center justify-center text-[7px] text-white group-hover:scale-125 transition-transform">
                                    <i class="fa-solid fa-book-open"></i>
                                </div>
                                
                                <div class="work-feed-card p-4 sm:p-5 relative overflow-hidden">
                                    <div class="flex items-center justify-between pb-3 mb-3 border-b border-dashed custom-border">
                                        <div class="flex items-center gap-2.5">
                                            <div class="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-sm shadow-inner">
                                                <i class="fa-solid fa-feather-pointed"></i>
                                            </div>
                                            <div>
                                                <span class="text-xs font-black uppercase text-amber-500 tracking-wider">Ký Sự Công Sở</span>
                                                <p class="text-[10px] font-semibold custom-text-secondary">Ghi lại cảm xúc & trải nghiệm</p>
                                            </div>
                                        </div>
                                        <button onclick="window.workOpenJournalForm('${logItem.id}')" class="w-8 h-8 rounded-xl custom-bg-input custom-text-secondary hover:text-amber-500 hover:border-amber-500/40 flex items-center justify-center border custom-border active:scale-90 transition-all" title="Chỉnh sửa ký sự">
                                            <i class="fa-solid fa-pen text-xs"></i>
                                        </button>
                                    </div>
                                    
                                    ${imagesHtml}
                                    
                                    ${(logItem.journalMood || logItem.journalNote) ? `
                                    <div class="flex items-start gap-3 p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border custom-border mt-2">
                                        ${logItem.journalMood ? `<span class="text-3xl leading-none drop-shadow-sm shrink-0 hover:scale-125 transition-transform cursor-pointer select-none">${logItem.journalMood}</span>` : ''}
                                        <p class="flex-1 min-w-0 text-sm font-medium custom-text leading-relaxed italic break-words">
                                            "${logItem.journalNote || ''}"
                                        </p>
                                    </div>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    });
                }
            }
            feedContainer.innerHTML = feedHtml;
        }

        // ==========================================
        // VẼ THỐNG KÊ (TAB 2) & TOP DANH MỤC
        // ==========================================
        const statsContainer = document.getElementById("work-stats-container");
        if (statsContainer) {
            window.workFilterStart = window.workFilterStart || "";
            window.workFilterEnd = window.workFilterEnd || "";

            let filteredTrans = [];
            let filteredLogs = [];
            let statsTitle = `Tháng ${curM+1}/${curY}`;

            const isDateInRange = (dateStr, start, end) => {
                const d = new Date(dateStr.split(' ')[0] + "T00:00:00");
                const s = new Date(start + "T00:00:00");
                const e = new Date(end + "T23:59:59");
                return d >= s && d <= e;
            };

            if (window.workFilterStart && window.workFilterEnd) {
                statsTitle = `Tùy chỉnh (${window.workFilterStart.split('-').reverse().join('/')} - ${window.workFilterEnd.split('-').reverse().join('/')})`;
                filteredTrans = workTransAll.filter(t => isDateInRange(t.date, window.workFilterStart, window.workFilterEnd));
                filteredLogs = data.logs.filter(l => isDateInRange(l.date, window.workFilterStart, window.workFilterEnd) && (l.journalImages?.length > 0 || l.journalNote || l.journalMood));
            } else {
                filteredTrans = workTransInMonth;
                filteredLogs = data.logs.filter(l => l.date.startsWith(monthStr) && (l.journalImages?.length > 0 || l.journalNote || l.journalMood));
            }

            const totalExpense = filteredTrans.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
            const avgPerTx = filteredTrans.length > 0 ? Math.round(totalExpense / filteredTrans.length) : 0;

            statsContainer.innerHTML = `
                <div class="flex items-center justify-between mb-5 border-b border-dashed custom-border pb-4 relative z-10">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex items-center justify-center text-xl shadow-lg shadow-primary-500/30">
                            <i class="fa-solid fa-chart-pie"></i>
                        </div>
                        <div>
                            <p class="text-base font-black custom-text tracking-tight leading-tight">Báo Cáo Tổng Hợp</p>
                            <p class="text-[10px] font-bold custom-text-secondary uppercase tracking-widest mt-0.5">${statsTitle}</p>
                        </div>
                    </div>
                    ${(window.workFilterStart && window.workFilterEnd) ? `
                    <button onclick="window.workClearFilter()" class="px-3 py-1.5 bg-rose-500/15 text-rose-500 hover:bg-rose-500/25 transition-colors rounded-xl flex items-center gap-1.5 text-xs font-bold active:scale-90 border border-rose-500/30 shadow-sm">
                        <i class="fa-solid fa-rotate-left"></i> Đặt lại
                    </button>` : ''}
                </div>

                <!-- Date Range Filter Pill -->
                <div class="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-2 rounded-2xl border custom-border mb-5 relative z-10 shadow-inner">
                    <div class="flex-1 flex items-center gap-1.5 px-2">
                        <i class="fa-regular fa-calendar text-[11px] custom-text-secondary"></i>
                        <input type="date" id="work-filter-start" value="${window.workFilterStart}" onchange="window.workApplyFilter()" class="w-full bg-transparent text-[11px] font-bold custom-text outline-none cursor-pointer uppercase tracking-wider">
                    </div>
                    <span class="custom-text-secondary bg-black/5 dark:bg-white/10 w-7 h-7 rounded-xl flex items-center justify-center text-[10px] shadow-sm shrink-0"><i class="fa-solid fa-arrow-right"></i></span>
                    <div class="flex-1 flex items-center gap-1.5 px-2">
                        <i class="fa-regular fa-calendar-check text-[11px] custom-text-secondary"></i>
                        <input type="date" id="work-filter-end" value="${window.workFilterEnd}" onchange="window.workApplyFilter()" class="w-full bg-transparent text-[11px] font-bold custom-text outline-none cursor-pointer uppercase tracking-wider">
                    </div>
                </div>

                <!-- Bento KPI 4-Card Grid -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
                    <div class="work-kpi-card p-4 flex flex-col justify-between">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-[10px] font-black uppercase text-rose-500 tracking-wider">Tổng chi</span>
                            <div class="w-7 h-7 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center text-xs"><i class="fa-solid fa-arrow-trend-up"></i></div>
                        </div>
                        <p class="text-base sm:text-lg font-black text-rose-500 truncate">${formatMoney(totalExpense)}</p>
                        <p class="text-[9px] font-semibold custom-text-secondary mt-0.5">Tổng phát sinh</p>
                    </div>

                    <div class="work-kpi-card p-4 flex flex-col justify-between">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-[10px] font-black uppercase text-blue-500 tracking-wider">Giao dịch</span>
                            <div class="w-7 h-7 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center text-xs"><i class="fa-solid fa-receipt"></i></div>
                        </div>
                        <p class="text-base sm:text-lg font-black custom-text">${filteredTrans.length} <span class="text-xs font-bold text-blue-500">lượt</span></p>
                        <p class="text-[9px] font-semibold custom-text-secondary mt-0.5">Khoản chi đã ghi</p>
                    </div>

                    <div class="work-kpi-card p-4 flex flex-col justify-between">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-[10px] font-black uppercase text-amber-500 tracking-wider">Ký sự</span>
                            <div class="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-xs"><i class="fa-solid fa-book-open"></i></div>
                        </div>
                        <p class="text-base sm:text-lg font-black text-amber-500">${filteredLogs.length} <span class="text-xs font-bold">bài</span></p>
                        <p class="text-[9px] font-semibold custom-text-secondary mt-0.5">Nhật ký công việc</p>
                    </div>

                    <div class="work-kpi-card p-4 flex flex-col justify-between">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-[10px] font-black uppercase text-emerald-500 tracking-wider">TB/lượt chi</span>
                            <div class="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-xs"><i class="fa-solid fa-calculator"></i></div>
                        </div>
                        <p class="text-base sm:text-lg font-black text-emerald-500 truncate">${formatMoney(avgPerTx)}</p>
                        <p class="text-[9px] font-semibold custom-text-secondary mt-0.5">Chi bình quân</p>
                    </div>
                </div>
            `;

            // Draw Chart.js
            if (typeof Chart !== 'undefined' && document.getElementById('tab-stats') && !document.getElementById('tab-stats').classList.contains('hidden')) {
                const dailyExp = {};
                
                if (window.workFilterStart && window.workFilterEnd) {
                    filteredTrans.forEach(t => {
                        const dateObj = new Date(t.date.split(' ')[0] + "T00:00:00");
                        const label = `${String(dateObj.getDate()).padStart(2,'0')}/${String(dateObj.getMonth()+1).padStart(2,'0')}`;
                        if(!dailyExp[label]) dailyExp[label] = 0;
                        dailyExp[label] += t.amount;
                    });
                } else {
                    for(let d=1; d<=daysInMonth; d++) dailyExp[d] = 0;
                    filteredTrans.forEach(t => {
                        const day = parseInt(t.date.substring(8, 10));
                        if (dailyExp[day] !== undefined) dailyExp[day] += t.amount;
                    });
                }

                if (window.workChartExp) window.workChartExp.destroy();
                const chartCanvas = document.getElementById('workChartExpense');
                if (chartCanvas) {
                    const ctx = chartCanvas.getContext('2d');
                    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                    gradient.addColorStop(0, '#f43f5e');
                    gradient.addColorStop(1, 'rgba(244, 63, 94, 0.25)');

                    window.workChartExp = new Chart(ctx, {
                        type: 'bar', 
                        data: { 
                            labels: Object.keys(dailyExp), 
                            datasets: [{ 
                                label: 'Chi tiêu', 
                                data: Object.values(dailyExp), 
                                backgroundColor: gradient, 
                                borderRadius: 6,
                                borderSkipped: false
                            }] 
                        },
                        options: { 
                            maintainAspectRatio: false,
                            plugins: { 
                                legend: { display: false },
                                tooltip: {
                                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                    titleFont: { weight: 'bold', size: 12 },
                                    bodyFont: { weight: 'bold', size: 12 },
                                    padding: 10,
                                    cornerRadius: 12,
                                    callbacks: {
                                        label: function(context) {
                                            return ' ' + formatMoney(context.raw);
                                        }
                                    }
                                }
                            }, 
                            scales: { 
                                y: { display: false }, 
                                x: { grid: { display: false }, ticks: { font: {size: 9, weight: 'bold'}, color: '#94a3b8' } } 
                            } 
                        }
                    });
                }
            }

            // Top Categories Ranking
            const workCatListContainer = document.getElementById("work-cat-list");
            if (workCatListContainer) {
                if (filteredTrans.length === 0) {
                    workCatListContainer.innerHTML = `<div class="text-center py-8 opacity-60"><i class="fa-solid fa-box-open text-4xl mb-2 text-gray-400"></i><p class="text-xs font-bold custom-text-secondary">Chưa có dữ liệu danh mục trong kỳ này</p></div>`;
                } else {
                    const catGroup = filteredTrans.reduce((acc, t) => {
                        acc[t.category] = (acc[t.category] || 0) + (Number(t.amount) || 0);
                        return acc;
                    }, {});

                    const sortedCats = Object.entries(catGroup).sort((a, b) => b[1] - a[1]);
                    const colorPalette = ['#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4', '#6366f1'];
                    const medalIcons = ['🥇', '🥈', '🥉'];

                    let catHtml = '';
                    sortedCats.forEach(([catId, amt], idx) => {
                        const cat = (state.categories && state.categories.find(c => c.id === catId)) || { name: 'Khác', icon: '📦', color: 'bg-gray-100 text-gray-500' };
                        const pct = totalExpense > 0 ? ((amt / totalExpense) * 100).toFixed(1) : 0;
                        const barColor = colorPalette[idx % colorPalette.length];
                        const medal = medalIcons[idx] || `<span class="text-[10px] font-black text-gray-400">#${idx + 1}</span>`;

                        catHtml += `
                        <div class="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all group cursor-pointer active:scale-[0.98]">
                            <div class="w-6 text-center shrink-0 font-bold text-sm">${medal}</div>
                            <div class="w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center text-lg border border-white/20 shadow-sm shrink-0 transition-transform group-hover:scale-110">${cat.icon}</div>
                            <div class="flex-1 min-w-0">
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-xs font-bold custom-text truncate pr-2">${cat.name}</span>
                                    <span class="text-xs font-black custom-text">${formatMoney(amt)}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <div class="h-1.5 flex-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div class="h-full rounded-full transition-all duration-1000" style="width: ${pct}%; background-color: ${barColor}"></div>
                                    </div>
                                    <span class="text-[10px] font-black custom-text-secondary w-9 text-right">${pct}%</span>
                                </div>
                            </div>
                        </div>`;
                    });
                    workCatListContainer.innerHTML = catHtml;
                }
            }
        }
    };

    // ==========================================
    // 4. FORM ĐĂNG NHẬT KÝ (ÉP ẢNH SIÊU NHẸ < 200KB)
    // ==========================================
    window.workOpenJournalForm = (logId = null) => {
        const data = state.workData || { logs: [] }; 
        const dateStr = window.workSelectedDate || (typeof getToday === 'function' ? getToday() : new Date().toISOString()).slice(0, 10);
        
        let log;
        if (logId) log = data.logs.find(l => l.id === logId);

        if (!log) {
            log = { id: "log-" + uid(), date: dateStr, journalMood: '', journalNote: '', journalImages: [] };
        }

        const modal = document.getElementById("global-modal"); 
        if (!modal) return;
        modal.classList.remove("hidden");
        
        const modalTitle = document.getElementById("modal-title");
        if (modalTitle) {
            modalTitle.innerHTML = `<span class="flex items-center gap-2"><i class="fa-solid fa-pen-nib text-amber-500"></i> Ký Sự ${dateStr.split('-').reverse().join('/')}</span>`;
        }
        
        window.tempJournalImages = log.journalImages ? [...log.journalImages] : (log.journalImage ? [log.journalImage] : []);

        const modalBody = document.getElementById("modal-body");
        if (!modalBody) return;

        modalBody.innerHTML = `
            <form id="frm-journal" class="space-y-4">
                <div class="custom-bg-card p-4 rounded-3xl border custom-border shadow-sm">
                    <label class="block text-[10px] font-black custom-text-secondary uppercase mb-2.5 text-center tracking-widest"><i class="fa-solid fa-face-smile text-amber-500 mr-1"></i> Cảm xúc hôm nay</label>
                    <div class="grid grid-cols-4 gap-2">
                        ${['😎','🚀','😴','😡','🍜','🤒','🍻','💸'].map(m => `
                            <label class="cursor-pointer group">
                                <input type="radio" name="j-mood" value="${m}" class="peer sr-only" ${log.journalMood === m ? 'checked' : ''}>
                                <div class="w-full aspect-square flex items-center justify-center text-2xl sm:text-3xl rounded-2xl border custom-border custom-bg-input peer-checked:border-amber-500 peer-checked:bg-amber-500/15 peer-checked:scale-105 transition-all shadow-sm hover:scale-105 active:scale-95">${m}</div>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="custom-bg-card p-4 rounded-3xl border custom-border shadow-sm">
                    <label class="block text-[10px] font-black custom-text-secondary uppercase mb-2.5 tracking-widest">
                        <i class="fa-solid fa-camera text-blue-500 mr-1"></i> Ảnh đính kèm (Ép < 200KB)
                    </label>
                    <div class="relative">
                        <input type="file" id="j-image-multi" multiple accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">
                        <div class="w-full py-5 custom-bg-input border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex flex-col items-center justify-center custom-text-secondary transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                            <i class="fa-solid fa-cloud-arrow-up text-2xl mb-1.5 text-primary-500"></i>
                            <span class="text-xs font-bold">Chạm để tải ảnh từ máy</span>
                        </div>
                    </div>
                    <div id="j-preview-container" class="flex flex-wrap gap-2 mt-3"></div>
                </div>

                <div>
                    <textarea id="j-note" rows="4" class="w-full p-4 custom-bg-input rounded-2xl border custom-border text-sm outline-none custom-focus shadow-sm font-medium leading-relaxed custom-placeholder" placeholder="Hôm nay công việc thế nào, có gì đáng nhớ không...">${log.journalNote || ''}</textarea>
                </div>
                
                <div class="grid grid-cols-2 gap-3 pt-1">
                    <button type="button" onclick="closeModal()" class="py-3.5 custom-bg-input custom-text rounded-2xl font-black text-sm border custom-border active:scale-95 transition-transform hover:brightness-95">Đóng</button>
                    <button type="submit" class="py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-amber-500/30 active:scale-95 transition-transform hover:brightness-110 flex items-center justify-center gap-1.5"><i class="fa-solid fa-floppy-disk"></i> Lưu Ký Sự</button>
                </div>
            </form>
        `;

        window.workRenderJournalPreviews = () => {
            const previewEl = document.getElementById('j-preview-container');
            if (!previewEl) return;
            previewEl.innerHTML = window.tempJournalImages.map((img, i) => `
                <div class="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border custom-border overflow-hidden shadow-sm group">
                    <img src="${window.getFastImage ? window.getFastImage(img) : img}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
                    <button type="button" onclick="window.tempJournalImages.splice(${i}, 1); window.workRenderJournalPreviews();" class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center shadow-md active:scale-90 opacity-80 hover:opacity-100 transition-opacity"><i class="fa-solid fa-times"></i></button>
                </div>
            `).join('');
        };
        window.workRenderJournalPreviews();

        const multiInput = document.getElementById('j-image-multi');
        if (multiInput) {
            multiInput.addEventListener('change', async function(e) {
                const files = Array.from(e.target.files || []); 
                if (!files.length) return;
                for (let file of files) {
                    const base64 = await new Promise(resolve => {
                        const reader = new FileReader(); 
                        reader.readAsDataURL(file);
                        reader.onload = event => {
                            const img = new Image(); 
                            img.src = event.target.result;
                            img.onload = () => {
                                const canvas = document.createElement('canvas');
                                const MAX_WIDTH = 640; 
                                let width = img.width; 
                                let height = img.height;
                                if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                                canvas.width = width; 
                                canvas.height = height;
                                const ctx = canvas.getContext('2d'); 
                                ctx.drawImage(img, 0, 0, width, height);
                                resolve(canvas.toDataURL('image/jpeg', 0.55));
                            };
                        };
                    });
                    window.tempJournalImages.push(base64);
                }
                window.workRenderJournalPreviews();
            });
        }

        const frmJournal = document.getElementById("frm-journal");
        if (frmJournal) {
            frmJournal.onsubmit = (e) => {
                e.preventDefault();
                const checkedMood = document.querySelector('input[name="j-mood"]:checked');
                log.journalMood = checkedMood ? checkedMood.value : '';
                log.journalNote = document.getElementById("j-note") ? document.getElementById("j-note").value : '';
                log.journalImages = [...window.tempJournalImages]; 
                
                if (!data.logs.find(l => l.id === log.id)) {
                    data.logs.push(log);
                }

                if (typeof saveData === 'function') saveData(); 
                if (typeof playSound === "function") playSound("success");
                if (typeof closeModal === 'function') closeModal(); 
                window.renderWorkDashboard(); 
            };
        }
    };

    // ==========================================
    // CÔNG CỤ XEM ẢNH FULL MÀN HÌNH (RẠP CHIẾU PHIM)
    // ==========================================
    window.workViewImageFullScreen = (src) => {
        const overlay = document.createElement('div');
        overlay.className = "fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center cursor-pointer opacity-0 transition-opacity duration-300 backdrop-blur-md";
        overlay.innerHTML = `
            <div class="absolute top-6 right-6 text-white text-xl font-black w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-rose-500 transition-colors border border-white/20"><i class="fa-solid fa-xmark"></i></div>
            <img src="${src}" class="max-w-[95vw] max-h-[90vh] object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] scale-95 transition-transform duration-300">
        `;
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.classList.remove("opacity-0");
            const imgEl = overlay.querySelector("img");
            if (imgEl) {
                imgEl.classList.remove("scale-95");
                imgEl.classList.add("scale-100");
            }
        }, 10);

        overlay.onclick = () => {
            overlay.classList.add("opacity-0");
            const imgEl = overlay.querySelector("img");
            if (imgEl) {
                imgEl.classList.remove("scale-100");
                imgEl.classList.add("scale-95");
            }
            setTimeout(() => overlay.remove(), 300);
        };
    };

})();