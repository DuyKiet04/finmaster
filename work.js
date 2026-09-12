// ==========================================
// FINMASTER WORK CENTER - ENTERPRISE UI/UX EDITION
// Minimalist UI, IndexedDB Sync, Smart Calendar, Auto-detect Work Expenses
// ==========================================

(function () {
    // ==========================================
    // 1. TỰ ĐỘNG BƠM GIAO DIỆN (UI/UX MASTERPIECE)
    // ==========================================
    function injectWorkUI() {
        if (document.getElementById("view-work")) return;

        const workHtml = `
        <div id="view-work" class="view-section max-w-5xl mx-auto hidden pt-6 px-4 pb-28 relative min-h-screen custom-bg-body">
            
            <!-- HEADER BÁ ĐẠO -->
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h3 class="font-black text-2xl custom-text tracking-tight flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm shadow-lg shadow-primary-500/30">
                            <i class="fa-solid fa-briefcase"></i>
                        </div>
                        Work Center
                    </h3>
                </div>
                <button onclick="workPayday()" class="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-4 py-2 rounded-2xl text-xs font-black shadow-sm active:scale-90 transition-transform flex items-center gap-2">
                    <i class="fa-solid fa-hand-holding-dollar"></i> Rút Lương
                </button>
            </div>

            <!-- THANH ĐIỀU HƯỚNG TABS (SEGMENTED CONTROL STYLE) -->
            <div class=" custom-bg-input p-1.5 rounded-[1.25rem] flex overflow-x-auto gap-1 mb-8 hide-scrollbar border custom-border">
                <button onclick="workSwitchTab('tab-today')" id="btn-tab-today" class="work-tab-btn active flex-1 px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap bg-white dark:bg-gray-700 text-primary-500 shadow-sm transition-all flex justify-center items-center gap-2">
                    <i class="fa-solid fa-calendar-day"></i> Hôm nay
                </button>
                <button onclick="workSwitchTab('tab-history')" id="btn-tab-history" class="work-tab-btn flex-1 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all flex justify-center items-center gap-2">
                    <i class="fa-solid fa-book-open"></i> Nhật ký
                </button>
                <button onclick="workSwitchTab('tab-stats')" id="btn-tab-stats" class="work-tab-btn flex-1 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all flex justify-center items-center gap-2">
                    <i class="fa-solid fa-chart-pie"></i> Thống kê
                </button>
                <button onclick="workSwitchTab('tab-survival')" id="btn-tab-survival" class="work-tab-btn flex-1 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all flex justify-center items-center gap-2">
                    <i class="fa-solid fa-shield-cat"></i> Mẹo
                </button>
            </div>

            <!-- ============================== -->
            <!-- TAB 1: HÔM NAY (TODAY) -->
            <!-- ============================== -->
            <div id="tab-today" class="work-tab-content animate-fadeIn block space-y-6">
                
                <!-- LƯƠNG TÍCH LŨY (HERO CARD) -->
                <div class="bg-gradient-to-br from-primary-600 to-indigo-800 p-6 rounded-[2rem] shadow-xl shadow-primary-500/20 relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-tr-full -ml-5 -mb-5"></div>
                    
                    <p class="text-[10px] font-bold custom-text-secondary uppercase tracking-widest relative z-10 mb-1 flex items-center gap-2"><i class="fa-solid fa-vault"></i> Lương chưa rút</p>
                    <h2 id="work-salary-current" class="text-4xl sm:text-5xl font-black text-white relative z-10 mb-6 tracking-tight drop-shadow-md">0 ₫</h2>
                    
                    <div class="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10 relative z-10">
                        <div class="flex justify-between text-[10px] font-bold custom-text-secondary mb-2">
                            <span id="work-days-count">Tiến độ: 0/22 ngày</span>
                            <span id="work-salary-total">Gross: 0 ₫</span>
                        </div>
                        <div class="h-2 w-full bg-black/30 rounded-full overflow-hidden">
                            <div id="work-progress-bar" class="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-1000" style="width: 0%"></div>
                        </div>
                    </div>
                </div>

                <!-- DASHBOARD CHẤM CÔNG -->
                <div class="custom-bg-card p-6 rounded-[2rem] border custom-border shadow-sm">
                    <div class="flex justify-between items-center mb-6">
                        <div>
                            <h4 class="font-black text-lg custom-text flex items-center gap-2">👋 <span id="work-today-date">Thứ..., --/--</span></h4>
                            <span id="work-status-badge" class="inline-block mt-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500">Chưa bắt đầu</span>
                        </div>
                        <button onclick="workOpenLeaveForm()" class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-100 dark:border-purple-800 flex justify-center items-center active:scale-90 transition-transform">
                            <i class="fa-solid fa-bed"></i>
                        </button>
                    </div>

                    <div class="text-center mb-6">
                        <p class="text-[10px] custom-text-secondary font-bold uppercase tracking-widest mb-1">Thời gian đã làm</p>
                        <p id="work-elapsed-time" class="text-5xl font-black text-primary-500 font-mono tracking-tighter drop-shadow-sm">00:00:00</p>
                        <p id="work-countdown-time" class="text-xs font-bold text-orange-500 mt-2 hidden bg-orange-50 dark:bg-orange-900/20 inline-block px-3 py-1 rounded-full"><i class="fa-solid fa-stopwatch animate-pulse"></i> Còn: --:--:--</p>
                    </div>

                    <div class="relative w-full mb-6">
                        <div class="flex justify-between text-[10px] font-bold custom-text-secondary mb-1.5">
                            <span id="work-time-in">--:--</span>
                            <span id="work-time-now-out">Hiện tại</span>
                        </div>
                        <div class="h-2.5 w-full custom-bg-body rounded-full overflow-hidden border custom-border">
                            <div id="work-time-progress" class="h-full bg-gradient-to-r from-primary-400 to-indigo-500 transition-all duration-1000 relative" style="width: 0%">
                                <div class="absolute top-0 right-0 bottom-0 left-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBsNDAtNDBIMjBMMCAyMHptNDAgMGwtNDAtNDBWMHwyMGMwIDAgMjAgMjAgMjAgMjB6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-30 animate-[slide_2s_linear_infinite]"></div>
                            </div>
                        </div>
                        <div class="flex justify-between text-[9px] font-bold custom-text-secondary mt-1.5">
                            <span>Vào ca</span>
                            <span id="work-time-end-label">Tan ca</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 border-t border-dashed custom-border pt-4 mb-6">
                        <div class="bg-rose-50 dark:bg-rose-900/10 p-3 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                            <p class="text-[10px] font-bold text-rose-500 uppercase"><i class="fa-solid fa-triangle-exclamation"></i> Đi trễ / Sớm</p>
                            <p id="work-late-min" class="font-black text-lg text-rose-600 dark:text-rose-400 mt-0.5">0 phút</p>
                        </div>
                        <div class="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                            <p class="text-[10px] font-bold text-blue-500 uppercase"><i class="fa-solid fa-fire"></i> Tăng ca</p>
                            <p id="work-ot-min" class="font-black text-lg text-blue-600 dark:text-blue-400 mt-0.5">0 phút</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <button onclick="workCheckIn('morning')" id="btn-work-in" class="py-4 rounded-2xl font-black text-sm transition-all border custom-border flex justify-center gap-2 items-center active:scale-95"><i class="fa-solid fa-fingerprint"></i> Vào ca</button>
                        <button onclick="workCheckIn('evening')" id="btn-work-out" class="py-4 rounded-2xl font-black text-sm transition-all border custom-border flex justify-center gap-2 items-center opacity-50 pointer-events-none active:scale-95"><i class="fa-solid fa-person-running"></i> Tan ca</button>
                    </div>
                    
                    <button id="btn-work-journal" class="w-full mt-3 py-3.5 rounded-2xl font-black text-sm transition-all border border-amber-200 dark:border-amber-800 bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 flex justify-center gap-2 items-center active:scale-95 hidden">
                        <i class="fa-solid fa-camera-retro"></i> Viết nhật ký / Úp ảnh hôm nay
                    </button>
                </div>

                <!-- SMART CALENDAR -->
                <div class="custom-bg-card p-6 rounded-[2rem] border custom-border shadow-sm">
                    <div class="flex justify-between items-center mb-6">
                        <h4 class="font-black text-sm uppercase tracking-widest custom-text flex items-center gap-2"><i class="fa-solid fa-calendar-days text-emerald-500"></i> Lịch Trình</h4>
                        <div class="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 border custom-border">
                            <button onclick="workChangeMonth(-1)" class="w-8 h-8 flex items-center justify-center rounded-lg active:scale-90 hover:bg-white dark:hover:bg-gray-700 custom-text-secondary shadow-sm transition-all"><i class="fa-solid fa-chevron-left text-xs"></i></button>
                            <span id="work-calendar-title" class="text-xs font-black custom-text min-w-[75px] text-center">Tháng --</span>
                            <button onclick="workChangeMonth(1)" class="w-8 h-8 flex items-center justify-center rounded-lg active:scale-90 hover:bg-white dark:hover:bg-gray-700 custom-text-secondary shadow-sm transition-all"><i class="fa-solid fa-chevron-right text-xs"></i></button>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-7 gap-1 mb-3 text-center text-[10px] font-bold custom-text-secondary uppercase">
                        <div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div class="text-gray-400">T7</div><div class="text-rose-400">CN</div>
                    </div>
                    <div id="work-calendar-grid" class="grid grid-cols-7 gap-1.5 sm:gap-2 text-center"></div>
                    
                    <div class="flex flex-wrap gap-4 mt-6 pt-4 border-t border-dashed custom-border justify-center text-[9px] font-bold custom-text-secondary uppercase">
                        <span class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></div> Đủ công</span>
                        <span class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm"></div> Trễ/Sớm</span>
                        <span class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm"></div> Nghỉ phép</span>
                        <span class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></div> Vắng</span>
                    </div>
                </div>
            </div>

            <!-- ============================== -->
            <!-- TAB 2: NHẬT KÝ (HISTORY FEED) -->
            <!-- ============================== -->
            <div id="tab-history" class="work-tab-content animate-fadeIn hidden">
                <div id="work-history-list" class="space-y-4"></div>
            </div>

            <!-- ============================== -->
            <!-- TAB 3: THỐNG KÊ (ANALYTICS) -->
            <!-- ============================== -->
            <div id="tab-stats" class="work-tab-content animate-fadeIn hidden space-y-6">
                <div class="custom-bg-card p-6 rounded-[2rem] border custom-border shadow-sm" id="work-stats-container"></div>
                <div class="custom-bg-card p-6 rounded-[2rem] border custom-border shadow-sm">
                    <p class="text-[10px] font-bold custom-text-secondary uppercase tracking-widest mb-4"><i class="fa-solid fa-chart-line text-rose-500"></i> Độ trễ khi vào ca (Phút)</p>
                    <canvas id="workChartCheckIn" height="150"></canvas>
                </div>
                <div class="custom-bg-card p-6 rounded-[2rem] border custom-border shadow-sm">
                    <p class="text-[10px] font-bold custom-text-secondary uppercase tracking-widest mb-4"><i class="fa-solid fa-fire text-blue-500"></i> Sức cày OT (Phút)</p>
                    <canvas id="workChartOT" height="150"></canvas>
                </div>
            </div>

            <!-- ============================== -->
            <!-- TAB 4: SINH TỒN (SURVIVAL) -->
            <!-- ============================== -->
            <div id="tab-survival" class="work-tab-content animate-fadeIn hidden">
                <div class="grid grid-cols-2 gap-4">
                    <button onclick="workSaveMoney('lunch')" class="p-6 custom-bg-card rounded-[2rem] border custom-border shadow-sm active:scale-95 transition-transform flex flex-col items-center text-center gap-4 group hover:border-orange-500">
                        <div class="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform"><i class="fa-solid fa-box-open"></i></div>
                        <div>
                            <span class="font-black text-sm custom-text block">Mang cơm nhà</span>
                            <span class="text-[10px] font-bold custom-text-secondary uppercase">Tiết kiệm 40k</span>
                        </div>
                    </button>
                    <button onclick="workSaveMoney('coffee')" class="p-6 custom-bg-card rounded-[2rem] border custom-border shadow-sm active:scale-95 transition-transform flex flex-col items-center text-center gap-4 group hover:border-emerald-500">
                        <div class="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform"><i class="fa-solid fa-mug-hot"></i></div>
                        <div>
                            <span class="font-black text-sm custom-text block">Nhịn trà sữa</span>
                            <span class="text-[10px] font-bold custom-text-secondary uppercase">Tiết kiệm 30k</span>
                        </div>
                    </button>
                </div>
            </div>

            <!-- FAB CẤU HÌNH -->
            <button onclick="workOpenSettings()" class="fixed bottom-24 right-4 sm:right-8 w-14 h-14 custom-primary rounded-full shadow-xl flex items-center justify-center text-white dark:text-gray-900 text-xl z-40 active:scale-90 transition-transform hover:rotate-90">
                <i class="fa-solid fa-gear"></i>
            </button>
        </div>
        <style>
            @keyframes slide { from { background-position: 0 0; } to { background-position: 40px 0; } }
        </style>
        `;
        
        const scrollArea = document.getElementById("main-scroll-area");
        if (scrollArea) scrollArea.insertAdjacentHTML("beforeend", workHtml);
    }

    // ==========================================
    // 2. LOGIC TABS (UI/UX)
    // ==========================================
    window.workSwitchTab = (tabId) => {
        document.querySelectorAll(".work-tab-btn").forEach(btn => {
            btn.className = "work-tab-btn flex-1 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all flex justify-center items-center gap-2";
        });
        const activeBtn = document.getElementById("btn-" + tabId);
        if(activeBtn) activeBtn.className = "work-tab-btn active flex-1 px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap bg-white dark:bg-gray-700 text-primary-500 shadow-sm transition-all flex justify-center items-center gap-2";

        document.querySelectorAll(".work-tab-content").forEach(content => {
            content.classList.add("hidden"); content.classList.remove("block");
        });
        const activeContent = document.getElementById(tabId);
        if(activeContent) activeContent.classList.replace("hidden", "block");

        if (tabId === 'tab-stats') window.renderWorkDashboard();
    };


    // ==========================================
    // 3. KHỞI TẠO BỘ NHỚ ĐỒNG BỘ INDEXEDDB
    // ==========================================
    function initWorkData() {
        if (!state.workData || !state.workData.startTime) { 
            state.workData = {
                baseSalary: 10000000, startTime: "08:30", endTime: "17:30",
                accruedSalary: 0, workDays: [false, true, true, true, true, true, false], logs: [] 
            };
        }
    }

    // ==========================================
    // 4. HOOK VÀO HỆ THỐNG GỐC
    // ==========================================
    const origSwitchView = window.switchView;
    window.switchView = function(viewId) {
        if (window.workTimerInterval) clearInterval(window.workTimerInterval);
        if (viewId === "work") { injectWorkUI(); initWorkData(); }
        if (origSwitchView) origSwitchView(viewId);
        if (viewId === "work") {
            window.renderWorkDashboard();
            const fM = document.getElementById("fab-mobile"); const fD = document.getElementById("fab-desktop");
            if(fM) fM.classList.add("hidden"); if(fD) fD.classList.add("hidden");
        }
    };

    // HÀM CHUYỂN THÁNG CHO LỊCH
    window.workChangeMonth = (dir) => {
        window.workViewMonth += dir;
        if (window.workViewMonth < 0) { window.workViewMonth = 11; window.workViewYear--; }
        else if (window.workViewMonth > 11) { window.workViewMonth = 0; window.workViewYear++; }
        window.renderWorkDashboard();
    };

    // ==========================================
    // 5. RENDER MASTER ENGINE
    // ==========================================
    window.renderWorkDashboard = () => {
        const data = state.workData;
        const todayStr = getToday().split("T")[0];
        const todayLog = data.logs.find(l => l.date === todayStr);

        if (typeof animateMoney === "function") animateMoney("work-salary-current", data.accruedSalary, 1000);
        else document.getElementById("work-salary-current").innerText = formatMoney(data.accruedSalary);

        // QUẢN LÝ THÁNG HIỂN THỊ
        if (window.workViewMonth === undefined) {
            window.workViewMonth = new Date().getMonth();
            window.workViewYear = new Date().getFullYear();
        }
        const curM = window.workViewMonth;
        const curY = window.workViewYear;
        
        const titleEl = document.getElementById("work-calendar-title");
        if (titleEl) titleEl.innerText = `Tháng ${curM + 1}/${curY}`;

        // ĐẾM NGÀY LÀM VIỆC TỰ ĐỘNG
        const daysInMonth = new Date(curY, curM + 1, 0).getDate();
        let autoWorkDaysPerMonth = 0;
        for (let d = 1; d <= daysInMonth; d++) { if (data.workDays[new Date(curY, curM, d).getDay()]) autoWorkDaysPerMonth++; }
        if (autoWorkDaysPerMonth === 0) autoWorkDaysPerMonth = 1;
        const salaryPerDay = Math.round(data.baseSalary / autoWorkDaysPerMonth);

        // ==========================================
        // VẼ SMART CALENDAR
        // ==========================================
        const firstDay = new Date(curY, curM, 1).getDay();
        let emptyCells = firstDay === 0 ? 6 : firstDay - 1; 
        let calHtml = "";

        for (let i = 0; i < emptyCells; i++) calHtml += `<div></div>`;

        for (let d = 1; d <= daysInMonth; d++) {
            const currentScanDateStr = `${curY}-${String(curM + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const dateObj = new Date(curY, curM, d);
            const isWorkDay = data.workDays[dateObj.getDay()];
            const logOfThisDay = data.logs.find(l => l.date === currentScanDateStr);
            const isToday = currentScanDateStr === todayStr;
            const isPast = currentScanDateStr < todayStr;

            let dotHtml = "";
            let cellStyle = "bg-transparent text-gray-400"; 

            if (isWorkDay) {
                cellStyle = "custom-bg-input dark:bg-gray-800 custom-text font-bold border custom-border hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors";
                if (logOfThisDay) {
                    if (["wfh", "leave", "holiday", "sick"].includes(logOfThisDay.status)) dotHtml = "bg-purple-500";
                    else if (logOfThisDay.status === "full") {
                        if (logOfThisDay.late > 0 || logOfThisDay.early > 0) dotHtml = "bg-orange-500"; 
                        else dotHtml = "bg-emerald-500";
                    } else dotHtml = "bg-blue-500 animate-pulse"; 
                } else if (isPast) dotHtml = "bg-rose-500"; 
            }

            const borderToday = isToday ? "ring-2 ring-primary-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900" : "";
            calHtml += `
                <div onclick="window.workShowDayDetails('${currentScanDateStr}')" class="cursor-pointer aspect-square rounded-2xl flex flex-col items-center justify-center relative ${cellStyle} ${borderToday} active:scale-90 transition-transform">
                    <span class="text-xs sm:text-sm z-10">${d}</span>
                    ${dotHtml ? `<div class="absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${dotHtml} shadow-sm"></div>` : ""}
                </div>
            `;
        }
        const calGrid = document.getElementById("work-calendar-grid");
        if (calGrid) calGrid.innerHTML = calHtml;

        // TIẾN ĐỘ THÁNG NÀY (Chỉ tính tháng hiện tại thực tế)
        const realCurM = new Date().getMonth(); const realCurY = new Date().getFullYear();
        const monthLogs = data.logs.filter(l => new Date(l.date).getMonth() === realCurM && new Date(l.date).getFullYear() === realCurY);
        let validDays = 0;
        monthLogs.forEach(l => {
            if (["full", "wfh", "leave", "holiday", "sick"].includes(l.status)) validDays += 1;
            else if (l.status === "half_day") validDays += 0.5;
        });

        document.getElementById("work-days-count").innerText = `Tiến độ: ${validDays}/${autoWorkDaysPerMonth} ngày`;
        document.getElementById("work-progress-bar").style.width = `${Math.min((validDays / autoWorkDaysPerMonth) * 100, 100)}%`;
        document.getElementById("work-salary-total").innerText = `Gross: ${formatMoney(data.baseSalary)}`;

        // ==========================================
        // GIAO DIỆN DASHBOARD HÔM NAY (TAB 1)
        // ==========================================
        if (window.workTimerInterval) clearInterval(window.workTimerInterval);

        const btnIn = document.getElementById("btn-work-in"); const btnOut = document.getElementById("btn-work-out");
        const badge = document.getElementById("work-status-badge");
        const elapsedEl = document.getElementById("work-elapsed-time"); const countdownEl = document.getElementById("work-countdown-time");
        const progressEl = document.getElementById("work-time-progress"); const inLabel = document.getElementById("work-time-in");
        const lateEl = document.getElementById("work-late-min"); const otEl = document.getElementById("work-ot-min");
        const btnJournal = document.getElementById("btn-work-journal");

        const daysArr = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
        const dObj = new Date();
        document.getElementById("work-today-date").innerText = `${daysArr[dObj.getDay()]}, ${String(dObj.getDate()).padStart(2,'0')}/${String(dObj.getMonth()+1).padStart(2,'0')}`;

        const parseTimeToday = (timeStr) => { const [h, m] = timeStr.split(':'); const d = new Date(); d.setHours(parseInt(h), parseInt(m), 0, 0); return d; };
        const formatDuration = (ms) => {
            if (ms < 0) ms = 0; const tS = Math.floor(ms / 1000);
            return `${String(Math.floor(tS / 3600)).padStart(2,'0')}:${String(Math.floor((tS % 3600) / 60)).padStart(2,'0')}:${String(tS % 60).padStart(2,'0')}`;
        };

        const leaveTypes = {
            'leave': { icon: 'fa-umbrella-beach', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30', border: 'border-purple-200 dark:border-purple-800', name: 'Nghỉ phép' },
            'sick': { icon: 'fa-head-side-cough', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-200 dark:border-orange-800', name: 'Nghỉ ốm' },
            'wfh': { icon: 'fa-house-laptop', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800', name: 'Làm tại nhà' },
            'holiday': { icon: 'fa-champagne-glasses', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30', border: 'border-rose-200 dark:border-rose-800', name: 'Nghỉ lễ' },
            'half_day': { icon: 'fa-clock-rotate-left', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-800', name: 'Nửa ngày' }
        };

        if (todayLog && leaveTypes[todayLog.status]) {
            const lType = leaveTypes[todayLog.status];
            btnIn.className = `py-4 rounded-2xl font-black text-sm transition-all border opacity-50 pointer-events-none flex justify-center gap-2 items-center ${lType.border} bg-white dark:bg-gray-800 ${lType.color}`;
            btnIn.innerHTML = `<i class="fa-solid ${lType.icon}"></i> ${lType.name}`;
            btnOut.className = `py-4 rounded-2xl font-black text-sm transition-all border opacity-50 pointer-events-none flex justify-center gap-2 items-center ${lType.border} bg-white dark:bg-gray-800 ${lType.color}`;
            btnOut.innerHTML = '<i class="fa-solid fa-mug-hot"></i> Xõa thôi';
            badge.innerHTML = `<i class="fa-solid ${lType.icon}"></i> ${lType.name}`;
            badge.className = `inline-block mt-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${lType.bg} ${lType.color}`;
            elapsedEl.innerText = "00:00:00"; countdownEl.classList.add("hidden"); progressEl.style.width = "100%"; progressEl.className = `h-full ${lType.bg} transition-all duration-1000`;
            lateEl.innerText = "0 phút"; otEl.innerText = "0 phút";
        } else if (!todayLog) {
            badge.innerText = "Chưa bắt đầu"; badge.className = "inline-block mt-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500";
            btnIn.className = "py-4 rounded-2xl font-black text-sm transition-all bg-primary-500 text-white shadow-md shadow-primary-500/30 flex justify-center gap-2 items-center active:scale-95 hover:bg-primary-600";
            btnOut.className = "py-4 rounded-2xl font-black text-sm transition-all border custom-border custom-bg-input text-gray-400 opacity-50 pointer-events-none flex justify-center gap-2 items-center";
            elapsedEl.innerText = "00:00:00"; countdownEl.classList.add("hidden"); inLabel.innerText = data.startTime; progressEl.style.width = "0%"; lateEl.innerText = "0 phút"; otEl.innerText = "0 phút";
        } else if (todayLog.status === "morning") {
            badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block mr-1"></span> Đang làm việc';
            badge.className = "inline-block mt-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 flex items-center w-max";
            btnIn.className = "py-4 rounded-2xl font-black text-sm transition-all border custom-border custom-bg-input text-emerald-500 opacity-50 pointer-events-none flex justify-center gap-2 items-center";
            btnIn.innerHTML = '<i class="fa-solid fa-check"></i> Đã vào ca';
            btnOut.className = "py-4 rounded-2xl font-black text-sm transition-all bg-primary-500 text-white shadow-md shadow-primary-500/30 flex justify-center gap-2 items-center active:scale-95 hover:bg-primary-600";
            
            countdownEl.classList.remove("hidden"); inLabel.innerText = todayLog.in;
            if (todayLog.late > 0) { lateEl.innerText = `${todayLog.late} phút`; lateEl.classList.add("text-rose-500"); }

            const startTimeObj = parseTimeToday(todayLog.in); const endTimeObj = parseTimeToday(data.endTime);
            const totalWorkMs = endTimeObj - parseTimeToday(data.startTime); 

            window.workTimerInterval = setInterval(() => {
                const now = new Date(); elapsedEl.innerText = formatDuration(now - startTimeObj);
                const remainMs = endTimeObj - now;
                if (remainMs > 0) countdownEl.innerHTML = `<i class="fa-solid fa-stopwatch animate-pulse"></i> Còn: ${formatDuration(remainMs)}`;
                else countdownEl.innerHTML = `<i class="fa-solid fa-fire text-rose-500"></i> Đang làm lố giờ (OT)!`;

                let pct = ((now - startTimeObj) / totalWorkMs) * 100;
                if (pct > 100) pct = 100; if (pct < 0) pct = 0;
                progressEl.style.width = `${pct}%`;
            }, 1000);
        } else {
            badge.innerText = "Đã xong ngày"; badge.className = "inline-block mt-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700";
            btnIn.className = "py-4 rounded-2xl font-black text-sm transition-all border custom-border custom-bg-input text-gray-400 opacity-50 pointer-events-none flex justify-center gap-2 items-center";
            btnOut.className = "py-4 rounded-2xl font-black text-sm transition-all border custom-border custom-bg-input text-indigo-500 opacity-50 pointer-events-none flex justify-center gap-2 items-center";
            btnOut.innerHTML = '<i class="fa-solid fa-check-double"></i> Đã tan ca';
            countdownEl.classList.add("hidden"); inLabel.innerText = todayLog.in; document.getElementById("work-time-now-out").innerText = todayLog.out;
            
            const startD = parseTimeToday(todayLog.in); const outD = parseTimeToday(todayLog.out);
            elapsedEl.innerText = formatDuration(outD - startD); progressEl.style.width = "100%";
            if (todayLog.late > 0) lateEl.innerText = `${todayLog.late} phút`;
            if (todayLog.ot > 0) { otEl.innerText = `${todayLog.ot} phút`; otEl.classList.add("text-emerald-500"); }
        }

        // Bật nút Úp Ảnh nếu đã vào ca
        if (todayLog && btnJournal) {
            btnJournal.classList.remove("hidden");
            btnJournal.onclick = () => window.workEditJournal(todayLog.id);
        } else if (btnJournal) btnJournal.classList.add("hidden");

        // ==========================================
        // RENDER LỊCH SỬ CHẤM CÔNG FEED (TAB 2)
        // ==========================================
        const historyContainer = document.getElementById("work-history-list");
        if (historyContainer) {
            const historyLogs = data.logs.filter(l => new Date(l.date).getMonth() === curM && new Date(l.date).getFullYear() === curY);
            if (historyLogs.length === 0) {
                historyContainer.innerHTML = `<div class="custom-bg-card p-10 rounded-[2rem] border custom-border text-center"><i class="fa-solid fa-ghost text-4xl text-gray-300 mb-4 block"></i><p class="text-xs font-medium custom-text-secondary">Chưa có dữ liệu chấm công tháng này.</p></div>`;
            } else {
                const sortedLogs = [...historyLogs];
                sortedLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                historyContainer.innerHTML = sortedLogs.map(log => {
                    const dObj = new Date(log.date); const dayName = daysArr[dObj.getDay()];
                    const dateStr = `${String(dObj.getDate()).padStart(2,'0')}/${String(dObj.getMonth()+1).padStart(2,'0')}`;
                    
                    let statusHtml = '';
                    if (leaveTypes[log.status]) statusHtml = `<span class="${leaveTypes[log.status].color} ${leaveTypes[log.status].bg} px-2 py-1 rounded-lg text-[10px] font-bold border ${leaveTypes[log.status].border}"><i class="fa-solid ${leaveTypes[log.status].icon}"></i> ${leaveTypes[log.status].name}</span>`;
                    else if (log.late > 0) statusHtml = `<span class="text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-lg text-[10px] font-bold border border-orange-100 dark:border-orange-800"><i class="fa-solid fa-triangle-exclamation"></i> Trễ ${log.late}p</span>`;
                    else if (log.ot > 0) statusHtml = `<span class="text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg text-[10px] font-bold border border-blue-100 dark:border-blue-800"><i class="fa-solid fa-fire"></i> OT ${log.ot}p</span>`;
                    else if (log.status === "full") statusHtml = `<span class="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg text-[10px] font-bold border border-emerald-100 dark:border-emerald-800"><i class="fa-solid fa-check"></i> Đủ công</span>`;
                    else statusHtml = `<span class="text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg text-[10px] font-bold border custom-border"><i class="fa-solid fa-spinner fa-spin"></i> Đang làm</span>`;

                    const earned = log.earned !== undefined ? log.earned : (["full","leave","wfh","holiday","sick"].includes(log.status) ? salaryPerDay : (log.status==="half_day"?salaryPerDay/2:0));
                    const moneyStr = (earned > 0) ? `<span class="font-black text-sm text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 px-2.5 py-1 rounded-xl">+${formatMoney(earned)}</span>` : `<span class="font-bold text-sm text-gray-400">...</span>`;

                    const currentImages = log.journalImages || (log.journalImage ? [log.journalImage] : []);
                    let imagesHtml = '';
                    if (currentImages.length > 0) {
                        imagesHtml = `<div class="flex gap-2 mt-4 overflow-x-auto hide-scrollbar pb-1">` + 
                            currentImages.map(img => `<img src="${img}" class="w-20 h-20 rounded-2xl object-cover border custom-border shadow-sm shrink-0">`).join('') +
                            `</div>`;
                    }

                    return `
                    <div class="relative p-5 mb-4 rounded-[2rem] custom-bg-card border custom-border shadow-sm transition-all group">
                        <div class="cursor-pointer" onclick="window.workShowDayDetails('${log.date}')">
                            <div class="flex justify-between items-start mb-3">
                                <div>
                                    <span class="font-black text-base custom-text block mb-1 tracking-tight">${dayName}, ${dateStr}</span>
                                    <span class="text-[11px] font-bold text-gray-400 font-mono bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-md border custom-border">${log.in || '--:--'} <i class="fa-solid fa-arrow-right mx-1 text-gray-300 dark:text-gray-600"></i> ${log.out || '--:--'}</span>
                                </div>
                                <div class="text-right space-y-2">
                                    ${moneyStr}
                                    <div class="mt-1">${statusHtml}</div>
                                </div>
                            </div>
                            
                            ${(log.journalMood || log.journalNote) ? `
                            <div class="mt-4 text-sm font-medium custom-text flex items-start gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border custom-border">
                                ${log.journalMood ? `<span class="text-2xl leading-none drop-shadow-sm">${log.journalMood}</span>` : ''}
                                <span class="flex-1 text-xs text-gray-600 dark:text-gray-300 italic pt-1">"${log.journalNote || 'Không có ghi chú'}"</span>
                            </div>` : ''}
                            
                            ${imagesHtml}
                        </div>

                        <!-- Nút Sửa/Thêm nổi góc phải dưới -->
                        <button onclick="event.stopPropagation(); window.workEditJournal('${log.id}')" class="absolute -bottom-3 -right-3 w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-primary-500/40 active:scale-90 transition-transform z-10 border-4 border-white dark:border-gray-900 group-hover:scale-110">
                            <i class="fa-solid fa-pen text-sm"></i>
                        </button>
                    </div>
                    `;
                }).join("");
            }
        }

        // ==========================================
        // THỐNG KÊ & VẼ BIỂU ĐỒ (TAB 3)
        // ==========================================
        const statsContainer = document.getElementById("work-stats-container");
        if (statsContainer && monthLogs.length > 0) {
            let daysWorkedActual = 0; let lateCount = 0; let totalLateMins = 0; let totalOTMins = 0; let totalEarned = 0;
            const sortedMonthLogs = [...monthLogs].sort((a, b) => new Date(a.date) - new Date(b.date));

            sortedMonthLogs.forEach(l => {
                if (['full', 'half_day'].includes(l.status)) {
                    daysWorkedActual += (l.status === 'full' ? 1 : 0.5);
                    if (l.late > 0) { lateCount++; totalLateMins += l.late; }
                    if (l.ot > 0) { totalOTMins += l.ot; }
                }
                if (l.earned) totalEarned += l.earned;
            });

            const daysRemaining = Math.max(0, autoWorkDaysPerMonth - Math.ceil(daysWorkedActual));
            const onTimePct = daysWorkedActual > 0 ? Math.round(((daysWorkedActual - lateCount) / daysWorkedActual) * 100) : 100;
            const onTimeColor = onTimePct < 90 ? 'rose' : 'emerald';

            statsContainer.innerHTML = `
                <div class="grid grid-cols-3 gap-3 text-center mb-6">
                    <div class="p-4 custom-bg-input rounded-3xl border custom-border">
                        <p class="text-2xl font-black custom-text mb-1">${autoWorkDaysPerMonth}</p>
                        <p class="text-[9px] font-bold custom-text-secondary uppercase">Ngày công</p>
                    </div>
                    <div class="p-4 custom-bg-input rounded-3xl border border-blue-100 dark:border-blue-800">
                        <p class="text-2xl font-black text-blue-600 mb-1">${daysWorkedActual}</p>
                        <p class="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase">Đã làm</p>
                    </div>
                    <div class="p-4 custom-bg-input rounded-3xl border border-orange-100 dark:border-orange-800">
                        <p class="text-2xl font-black text-orange-600 mb-1">${daysRemaining}</p>
                        <p class="text-[9px] font-bold text-orange-600 dark:text-orange-400 uppercase">Còn lại</p>
                    </div>
                </div>

                <div class="mb-6 custom-bg-input p-4 rounded-3xl border custom-border">
                    <div class="flex justify-between text-[10px] font-bold custom-text-secondary mb-2">
                        <span class="uppercase tracking-widest"><i class="fa-solid fa-crosshairs"></i> Tỷ lệ đúng giờ</span>
                        <span class="text-${onTimeColor}-500 text-sm">${onTimePct}%</span>
                    </div>
                    <div class="h-2.5 w-full custom-bg-input rounded-full overflow-hidden">
                        <div class="h-full bg-${onTimeColor}-500 rounded-full" style="width: ${onTimePct}%"></div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 border-b border-dashed custom-border pb-6 mb-6">
                    <div class="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-3xl border border-rose-100 dark:border-rose-900/30">
                        <p class="text-[10px] font-bold text-rose-500 uppercase mb-1"><i class="fa-solid fa-triangle-exclamation"></i> Đi trễ</p>
                        <p class="font-black text-base text-rose-600">${lateCount} lần <span class="text-rose-400 text-xs font-bold">(${totalLateMins}p)</span></p>
                    </div>
                    <div class="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                        <p class="text-[10px] font-bold text-blue-500 uppercase mb-1"><i class="fa-solid fa-fire"></i> Tổng OT</p>
                        <p class="font-black text-base text-blue-600">${Math.floor(totalOTMins/60)}h ${totalOTMins%60}m</p>
                    </div>
                </div>

                <div class="space-y-4">
                    <div class="flex justify-between items-center text-sm font-bold custom-text-secondary">
                        <span>Lương ngày làm việc:</span>
                        <span class="font-black custom-text">${formatMoney(totalEarned)}</span>
                    </div>
                    <div class="flex justify-between items-center pt-4 border-t border-solid border-gray-200 dark:border-gray-700 custom-bg-input p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                        <span class="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest">Tổng thu nhập:</span>
                        <span class="text-2xl font-black text-emerald-500 tracking-tight">${formatMoney(totalEarned)}</span>
                    </div>
                </div>
            `;

            if (typeof Chart !== 'undefined' && document.getElementById('tab-stats').classList.contains('block')) {
                const labels = sortedMonthLogs.map(l => l.date.substring(8, 10) + '/' + l.date.substring(5, 7)); 
                if (window.workChart1) window.workChart1.destroy(); if (window.workChart2) window.workChart2.destroy();
                
                window.workChart1 = new Chart(document.getElementById('workChartCheckIn'), {
                    type: 'line', data: { labels: labels, datasets: [{ label: 'Phút trễ', data: sortedMonthLogs.map(l => l.late || 0), borderColor: '#f43f5e', backgroundColor: 'rgba(244, 63, 94, 0.1)', fill: true, tension: 0.4 }] },
                    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } } }
                });

                window.workChart2 = new Chart(document.getElementById('workChartOT'), {
                    type: 'bar', data: { labels: labels, datasets: [{ label: 'OT (Phút)', data: sortedMonthLogs.map(l => l.ot || 0), backgroundColor: '#3b82f6', borderRadius: 8 }] },
                    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } } }
                });
            }
        } else if (statsContainer) statsContainer.innerHTML = '<div class="text-center py-8"><i class="fa-solid fa-chart-simple text-4xl text-gray-300 mb-4 block"></i><p class="text-xs font-medium custom-text-secondary">Chưa có dữ liệu để vẽ biểu đồ.</p></div>';
    };

    // ==========================================
    // 6. BỘ CHẤM CÔNG THỜI GIAN THỰC
    // ==========================================
    window.workCheckIn = (type) => {
        const data = state.workData; const now = new Date(); const todayStr = getToday().split("T")[0]; const timeStr = now.toTimeString().substring(0, 5); 
        const parseMins = (str) => { const [h, m] = str.split(':'); return parseInt(h) * 60 + parseInt(m); };
        const currentMins = parseMins(timeStr); const startMins = parseMins(data.startTime); const endMins = parseMins(data.endTime);
        const todayLogIdx = data.logs.findIndex(l => l.date === todayStr);

        if (type === "morning") {
            let lateMins = 0; if (currentMins > startMins) lateMins = currentMins - startMins; 
            data.logs.push({ id: "log-" + generateId(), date: todayStr, in: timeStr, out: null, status: "morning", late: lateMins, ot: 0 });
            if(typeof playSound === "function") playSound("pop");
            if(lateMins > 0) alert(`Đi làm trễ ${lateMins} phút nha đại ka!`); else alert("Đã vào ca! Chúc đại ka một ngày làm việc hiệu quả.");
        }  else if (type === "evening" && todayLogIdx > -1) {
            let otMins = 0; let earlyMins = 0;
            if (currentMins > endMins) otMins = currentMins - endMins; else if (currentMins < endMins) earlyMins = endMins - currentMins;

            data.logs[todayLogIdx].out = timeStr; data.logs[todayLogIdx].ot = otMins; data.logs[todayLogIdx].early = earlyMins; data.logs[todayLogIdx].status = "full"; 
            
            const curM = new Date().getMonth(); const curY = new Date().getFullYear();
            const daysInMonth = new Date(curY, curM + 1, 0).getDate();
            let autoWorkDaysPerMonth = 0;
            for (let d = 1; d <= daysInMonth; d++) { if (data.workDays[new Date(curY, curM, d).getDay()]) autoWorkDaysPerMonth++; }
            if (autoWorkDaysPerMonth === 0) autoWorkDaysPerMonth = 1;
            
            const dailyWage = data.baseSalary / autoWorkDaysPerMonth; let earnedToday = dailyWage; 
            data.logs[todayLogIdx].earned = earnedToday; data.logs[todayLogIdx].dailyWage = dailyWage; data.accruedSalary += earnedToday;

            if(typeof playSound === "function") playSound("success"); alert(`Ting ting! Hôm nay lụm ${formatMoney(earnedToday)}. Đã cất vào kho! 🍻`);
        }
        saveData(); renderWorkDashboard();
    };

    // ==========================================
    // 7. POPUP TỔNG HỢP (CHẤM CÔNG + CHI TIÊU ĐI LÀM)
    // ==========================================
    window.workShowDayDetails = (dateStr) => {
        const data = state.workData;
        const log = data.logs.find(l => l.date === dateStr);
        const dObj = new Date(dateStr);
        const displayDate = `${String(dObj.getDate()).padStart(2,'0')}/${String(dObj.getMonth()+1).padStart(2,'0')}/${dObj.getFullYear()}`;

        // Quét giao dịch tốn kém đi làm (Tên danh mục hoặc ghi chú có chữ "làm")
        const dayTrans = state.transactions.filter(t => {
            if (!t.date.startsWith(dateStr) || t.type !== "expense") return false;
            const cat = state.categories.find(c => c.id === t.category);
            const catName = cat ? cat.name.toLowerCase() : "";
            const noteName = t.note ? t.note.toLowerCase() : "";
            return catName.includes("làm") || noteName.includes("làm");
        });

        const modal = document.getElementById("global-modal");
        modal.classList.remove("hidden");
        document.getElementById("modal-title").innerHTML = `<i class="fa-solid fa-calendar-day text-primary-500"></i> Báo cáo ngày ${displayDate}`;

        let transHtml = '';
        if (dayTrans.length > 0) {
            transHtml = dayTrans.map(t => {
                const cat = state.categories.find(c => c.id === t.category) || { name: 'Khác', icon: 'fa-box', color: 'text-gray-500', bg: 'bg-gray-100' };
                
                // Nếu giao dịch có ảnh thì hiện ảnh, không có thì hiện Icon Danh mục
                const visualHtml = t.image 
                    ? `<img src="${t.image}" class="w-10 h-10 rounded-xl object-cover shadow-sm border custom-border shrink-0">` 
                    : `<div class="w-10 h-10 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center text-lg shadow-sm shrink-0"><i class="fa-solid ${cat.icon}"></i></div>`;

                // Nếu có check-in địa điểm thì hiện cái tag nhỏ nhắn
                const locationHtml = t.locationName 
                    ? `<span class="inline-block mt-1 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded md text-[8px] uppercase tracking-wider"><i class="fa-solid fa-location-dot text-rose-500 mr-0.5"></i> ${t.locationName}</span>` 
                    : '';

                return `
                    <div class="flex justify-between items-center p-3 custom-bg-input rounded-2xl border custom-border mb-2 last:mb-0 transition-all hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div class="flex items-start gap-3">
                            ${visualHtml}
                            <div>
                                <p class="text-xs font-bold custom-text">${cat.name}</p>
                                <p class="text-[10px] custom-text-secondary">${t.note || 'Không có ghi chú'}</p>
                                ${locationHtml}
                            </div>
                        </div>
                        <span class="text-sm font-black text-rose-500 whitespace-nowrap ml-2">-${formatMoney(t.amount)}</span>
                    </div>
                `;
            }).join("");
        } else {
            transHtml = `<div class="text-center py-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border custom-border"><p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest"><i class="fa-solid fa-leaf text-emerald-500"></i> Không tốn đồng nào cho công việc</p></div>`;
        }

        document.getElementById("modal-body").innerHTML = `
            <div class="space-y-4">
                <!-- KHỐI CHẤM CÔNG -->
                <div class="custom-bg-card p-5 rounded-[2rem] border custom-border shadow-sm">
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-[10px] font-bold text-primary-500 uppercase tracking-widest"><i class="fa-solid fa-fingerprint"></i> Dữ liệu chấm công</span>
                        ${log ? `<button onclick="window.workEditJournal('${log.id}')" class="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-800"><i class="fa-solid fa-camera"></i> Ký sự</button>` : ''}
                    </div>
                    ${log ? `
                    <div class="flex justify-between items-center custom-bg-input p-4 rounded-2xl border custom-border">
                        <span class="text-sm font-bold custom-text font-mono">${log.in || '--:--'} <i class="fa-solid fa-arrow-right mx-2 text-gray-400"></i> ${log.out || '--:--'}</span>
                        <span class="text-lg font-black ${log.earned > 0 ? 'text-emerald-500' : 'text-gray-400'}">+${formatMoney(log.earned || 0)}</span>
                    </div>
                    ${(log.late > 0 || log.ot > 0) ? `
                    <div class="flex gap-2 mt-3">
                        ${log.late > 0 ? `<span class="text-[10px] font-bold text-rose-500 custom-bg-input px-2.5 py-1 rounded-lg border border-rose-100 dark:border-rose-900/30 flex-1 text-center"><i class="fa-solid fa-triangle-exclamation"></i> Trễ ${log.late}p</span>` : ''}
                        ${log.ot > 0 ? `<span class="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-900/30 flex-1 text-center"><i class="fa-solid fa-fire"></i> OT ${log.ot}p</span>` : ''}
                    </div>` : ''}
                    ` : `<div class="text-center py-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border custom-border"><p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest"><i class="fa-solid fa-bed"></i> Chưa có dữ liệu làm việc</p></div>`}
                </div>

                <!-- KHỐI GIAO DỊCH ĐI LÀM -->
                <div class="custom-bg-card p-5 rounded-[2rem] border custom-border shadow-sm">
                    <span class="text-[10px] font-bold text-orange-500 uppercase tracking-widest block mb-4"><i class="fa-solid fa-receipt"></i> Chi phí công sở</span>
                    ${transHtml}
                </div>

               
            </div>
        `;
    };

    // ==========================================
    // 8. ĐĂNG BÀI NHẬT KÝ (ĐA LUỒNG ẢNH CANVAS)
    // ==========================================
    window.workEditJournal = (logId) => {
        const data = state.workData; const log = data.logs.find(l => l.id === logId); if (!log) return;
        const modal = document.getElementById("global-modal"); modal.classList.remove("hidden");
        document.getElementById("modal-title").innerHTML = '<i class="fa-solid fa-camera-retro text-amber-500"></i> Ký Sự Đi Làm';
        
        window.tempJournalImages = log.journalImages ? [...log.journalImages] : (log.journalImage ? [log.journalImage] : []);

        document.getElementById("modal-body").innerHTML = `
            <form id="frm-journal" class="space-y-6">
                <div class="custom-bg-card p-4 rounded-3xl border custom-border">
                    <label class="block text-[10px] font-bold custom-text-secondary uppercase mb-3 tracking-widest text-center">Tâm trạng hôm nay</label>
                    <div class="grid grid-cols-4 gap-2">
                        ${['😎','🚀','😴','😡','🍜','🤒','🍻','💸'].map(m => `
                            <label class="cursor-pointer group">
                                <input type="radio" name="j-mood" value="${m}" class="peer sr-only" ${log.journalMood === m ? 'checked' : ''}>
                                <div class="w-full aspect-square flex items-center justify-center text-3xl rounded-2xl border custom-border custom-bg-input peer-checked:custom-border peer-checked:custom-primary dark:peer-checked:bg-amber-900/30 transition-all group-hover:scale-105 shadow-sm">${m}</div>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="custom-bg-card p-4 rounded-3xl border custom-border">
                    <label class="block text-[10px] font-bold custom-text-secondary uppercase mb-3 tracking-widest flex justify-between items-center">
                        <span><i class="fa-solid fa-images text-primary-500"></i> Góc Sống Ảo</span>
                        <span class="text-[8px] bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">Tự động nén</span>
                    </label>
                    <div class="relative">
                        <input type="file" id="j-image-multi" multiple accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">
                        <div class="w-full py-4 custom-bg-input border-2 border-dashed border-primary-200 dark:border-primary-900/50 rounded-2xl flex flex-col items-center justify-center text-primary-500 transition-colors hover:bg-primary-50">
                            <i class="fa-solid fa-cloud-arrow-up text-2xl mb-1"></i>
                            <span class="text-xs font-bold">Bấm để chọn nhiều ảnh</span>
                        </div>
                    </div>
                    <div id="j-preview-container" class="flex flex-wrap gap-2 mt-4"></div>
                </div>

                <div>
                    <textarea id="j-note" rows="3" class="w-full p-4 custom-bg-input rounded-3xl border custom-border text-sm outline-none custom-focus shadow-sm" placeholder="Hôm nay có biến gì không đại ka? Kể nghe chơi...">${log.journalNote || ''}</textarea>
                </div>
                
                <div class="grid grid-cols-2 gap-3 mt-2">
                    <button type="button" onclick="closeModal()" class="py-4 custom-bg-input rounded-2xl font-black text-sm custom-text transition-all border custom-border active:scale-95">Hủy</button>
                    <button type="submit" class="py-4 custom-primary text-white rounded-2xl font-black text-sm  active:scale-95 transition-all">Lưu Ký Sự</button>
                </div>
            </form>
        `;

        const renderPreviews = () => {
            document.getElementById('j-preview-container').innerHTML = window.tempJournalImages.map((img, i) => `
                <div class="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border custom-border overflow-hidden shadow-sm group">
                    <img src="${img}" class="w-full h-full object-cover transition-transform group-hover:scale-110">
                    <button type="button" onclick="window.tempJournalImages.splice(${i}, 1); document.getElementById('j-preview-container').innerHTML = ''; window.workEditJournal('${logId}');" class="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center shadow-md active:scale-90"><i class="fa-solid fa-times"></i></button>
                </div>
            `).join('');
        };
        renderPreviews();

        document.getElementById('j-image-multi').addEventListener('change', async function(e) {
            const files = Array.from(e.target.files); if (!files.length) return;
            for (let file of files) {
                const base64 = await new Promise(resolve => {
                    const reader = new FileReader(); reader.readAsDataURL(file);
                    reader.onload = event => {
                        const img = new Image(); img.src = event.target.result;
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const MAX_WIDTH = 500; let width = img.width; let height = img.height;
                            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                            canvas.width = width; canvas.height = height;
                            const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
                            resolve(canvas.toDataURL('image/jpeg', 0.6));
                        }
                    };
                });
                window.tempJournalImages.push(base64);
            }
            renderPreviews();
        });

        document.getElementById("frm-journal").onsubmit = (e) => {
            e.preventDefault();
            const checkedMood = document.querySelector('input[name="j-mood"]:checked');
            log.journalMood = checkedMood ? checkedMood.value : '';
            log.journalNote = document.getElementById("j-note").value;
            log.journalImages = [...window.tempJournalImages]; 
            saveData(); if(typeof playSound === "function") playSound("success");
            closeModal(); window.renderWorkDashboard(); 
        };
    };

    // ==========================================
    // 9. FORM ĐĂNG KÝ NGHỈ PHÉP
    // ==========================================
    window.workOpenLeaveForm = () => {
        const modal = document.getElementById("global-modal");
        document.getElementById("modal-title").innerHTML = '<i class="fa-solid fa-umbrella-beach text-purple-500"></i> Đăng Ký Nghỉ / WFH';
        const todayStr = getToday().split("T")[0];

        document.getElementById("modal-body").innerHTML = `
            <form id="frm-leave" class="space-y-5">
                <div><label class="block text-[11px] font-bold custom-text-secondary uppercase mb-1.5">Ngày áp dụng</label><input type="date" id="leave-date" required value="${todayStr}" class="w-full p-4 custom-bg-input rounded-2xl outline-none font-bold custom-text border custom-border"></div>
                <div>
                    <label class="block text-[11px] font-bold custom-text-secondary uppercase mb-1.5">Loại hình</label>
                    <select id="leave-type" class="w-full p-4 custom-bg-input rounded-2xl outline-none font-bold custom-text border custom-border appearance-none">
                        <option value="leave">🏖️ Nghỉ phép (Có lương)</option>
                        <option value="wfh">🏠 Làm tại nhà (WFH)</option>
                        <option value="sick">🤒 Nghỉ ốm</option>
                        <option value="half_day">⏰ Nghỉ nửa ngày</option>
                        <option value="holiday">🎉 Nghỉ lễ</option>
                    </select>
                </div>
                <div><label class="block text-[11px] font-bold custom-text-secondary uppercase mb-1.5">Lý do</label><input type="text" id="leave-note" placeholder="VD: Ốm, Có việc gia đình..." class="w-full p-4 custom-bg-input rounded-2xl outline-none font-medium custom-text border custom-border text-sm"></div>
                <button type="submit" class="w-full py-4 bg-purple-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-purple-500/30 active:scale-95 transition-all">Xác Nhận Đăng Ký</button>
            </form>
        `;
        modal.classList.remove("hidden");

        document.getElementById("frm-leave").onsubmit = (e) => {
            e.preventDefault();
            const data = state.workData; const lDate = document.getElementById("leave-date").value;
            const lType = document.getElementById("leave-type").value; const lNote = document.getElementById("leave-note").value;
            const existIdx = data.logs.findIndex(l => l.date === lDate);

            if (existIdx > -1) {
                if (!confirm("Ngày này đã có chấm công. Bạn muốn GHI ĐÈ thành Nghỉ phép/WFH?")) return;
                if (data.logs[existIdx].earned) data.accruedSalary -= data.logs[existIdx].earned;
                data.logs.splice(existIdx, 1);
            }

            let curM = new Date(lDate).getMonth(); let curY = new Date(lDate).getFullYear();
            let daysInMonth = new Date(curY, curM + 1, 0).getDate(); let autoWorkDaysPerMonth = 0;
            for (let d = 1; d <= daysInMonth; d++) { if (data.workDays[new Date(curY, curM, d).getDay()]) autoWorkDaysPerMonth++; }
            if (autoWorkDaysPerMonth === 0) autoWorkDaysPerMonth = 1;

            const salaryPerDay = Math.round(data.baseSalary / autoWorkDaysPerMonth);
            let earned = salaryPerDay; if (lType === "half_day") earned = salaryPerDay / 2;

            data.accruedSalary += earned;
            data.logs.push({ id: "log-" + generateId(), date: lDate, in: "--:--", out: "--:--", status: lType, late: 0, ot: 0, early: 0, note: lNote, earned: earned, dailyWage: salaryPerDay });

            saveData(); closeModal(); renderWorkDashboard();
            if(typeof playSound === "function") playSound("success"); alert("✅ Đã ghi nhận lịch nghỉ thành công!");
        };
    };

    // ==========================================
    // 10. NHẬN LƯƠNG
    // ==========================================
    window.workPayday = () => {
        const data = state.workData;
        if (data.accruedSalary <= 0) return alert("Kho chưa có lúa để rút đại ka ơi!");

        const walletOptions = state.wallets.map(w => `<option value="${w.id}">${w.name} (${formatMoney(w.balance)})</option>`).join("");
        const modal = document.getElementById("global-modal");
        document.getElementById("modal-title").innerHTML = '<i class="fa-solid fa-money-bill-transfer text-emerald-500"></i> Rút Lương Vào Ví';
        document.getElementById("modal-body").innerHTML = `
            <form id="frm-payday" class="space-y-6">
                <div class="p-6 custom-primary rounded-[2rem] text-center shadow-lg ">
                    <p class="text-[10px] font-bold text-emerald-50 uppercase tracking-widest mb-2">Số lúa chốt hạ</p>
                    <p class="text-4xl font-black text-white tracking-tight">${formatMoney(data.accruedSalary)}</p>
                </div>
                <div>
                    <label class="block text-[11px] font-bold custom-text-secondary uppercase mb-2">Chuyển vào ví nào?</label>
                    <select id="payday-wallet" class="w-full p-4 custom-bg-input border custom-border rounded-2xl outline-none font-bold custom-text appearance-none">${walletOptions}</select>
                </div>
                <button type="submit" class="w-full py-4 custom-primary text-white rounded-2xl font-black text-lg shadow-lg  active:scale-95 transition-all">Xác Nhận Rút Lương</button>
            </form>
        `;
        modal.classList.remove("hidden");

        document.getElementById("frm-payday").onsubmit = (e) => {
            e.preventDefault();
            const targetWallet = state.wallets.find(w => w.id === document.getElementById("payday-wallet").value);
            if (targetWallet) {
                targetWallet.balance += data.accruedSalary; 
                state.transactions.unshift({ id: "tx-payday-" + generateId(), type: "income", amount: data.accruedSalary, category: "c7", walletId: targetWallet.id, date: getToday().replace("T", " "), note: `Nhận lương tháng ${new Date().getMonth()+1}`, locationName: "Công ty" });
                data.accruedSalary = 0; 
                saveData(); closeModal();
                if(typeof playSound === "function") playSound("success"); alert("💵 Lúa đã về làng!");
                renderWorkDashboard(); if(typeof renderWallets === "function") renderWallets();
            }
        };
    };

    // ==========================================
    // 11. CÀI ĐẶT
    // ==========================================
    window.workOpenSettings = () => {
        const modal = document.getElementById("global-modal");
        document.getElementById("modal-title").innerHTML = '<i class="fa-solid fa-sliders text-primary-500"></i> Cấu hình Work Center';
        const data = state.workData;

        document.getElementById("modal-body").innerHTML = `
            <form id="frm-work-settings" class="space-y-5">
                <div class="custom-bg-card p-4 rounded-3xl border custom-border">
                    <label class="block text-[10px] font-bold custom-text-secondary uppercase mb-2">Lương cơ bản / Tháng</label>
                    <input type="text" inputmode="numeric" oninput="formatInputCurrency(event)" id="w-set-salary" required value="${data.baseSalary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}" class="w-full p-4 custom-bg-input rounded-2xl outline-none font-black text-xl text-primary-500 border custom-border text-right shadow-sm">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="custom-bg-card p-4 rounded-3xl border custom-border">
                        <label class="block text-[10px] font-bold custom-text-secondary uppercase mb-2">Giờ vào</label>
                        <input type="time" id="w-set-start" required value="${data.startTime}" class="w-full p-3 custom-bg-input rounded-xl outline-none font-bold custom-text border custom-border text-center">
                    </div>
                    <div class="custom-bg-card p-4 rounded-3xl border custom-border">
                        <label class="block text-[10px] font-bold custom-text-secondary uppercase mb-2">Giờ ra</label>
                        <input type="time" id="w-set-end" required value="${data.endTime}" class="w-full p-3 custom-bg-input rounded-xl outline-none font-bold custom-text border custom-border text-center">
                    </div>
                </div>
                <div class="custom-bg-card p-4 rounded-3xl border custom-border">
                    <label class="block text-[10px] font-bold custom-text-secondary uppercase mb-3">Lịch làm việc trong tuần</label>
                    <div class="grid grid-cols-7 gap-1">
                        ${["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day, idx) => `
                            <label class="flex flex-col items-center cursor-pointer group">
                                <input type="checkbox" class="peer sr-only w-day-checkbox" data-day="${idx}" ${data.workDays[idx] ? "checked" : ""}>
                                <div class="w-full aspect-square flex items-center justify-center rounded-full border custom-border bg-white dark:bg-gray-900 text-xs font-bold custom-text-secondary peer-checked:bg-primary-500 peer-checked:text-white peer-checked:border-primary-500 transition-all active:scale-90 shadow-sm">${day}</div>
                            </label>
                        `).join("")}
                    </div>
                </div>
                <button type="submit" class="w-full py-4 custom-primary text-white rounded-2xl font-black text-lg shadow-lg shadow-primary-500/30 active:scale-95 transition-all mt-2">Lưu Thiết Lập</button>
            </form>
        `;
        modal.classList.remove("hidden");

        document.getElementById("frm-work-settings").onsubmit = (e) => {
            e.preventDefault();
            state.workData.baseSalary = getRawNumber(document.getElementById("w-set-salary").value);
            const checkBoxes = document.querySelectorAll('.w-day-checkbox');
            const newWorkDays = [false, false, false, false, false, false, false];
            checkBoxes.forEach(cb => { if (cb.checked) newWorkDays[parseInt(cb.dataset.day)] = true; });
            state.workData.workDays = newWorkDays;
            state.workData.startTime = document.getElementById("w-set-start").value;
            state.workData.endTime = document.getElementById("w-set-end").value;
            saveData(); closeModal(); renderWorkDashboard();
            if(typeof playSound === "function") playSound("success");
        };
    };

    // ==========================================
    // 12. SINH TỒN
    // ==========================================
    window.workSaveMoney = (type) => {
        const amount = type === "lunch" ? 40000 : 30000;
        const desc = type === "lunch" ? "Mang cơm nhà" : "Nhịn uống Cafe";
        if (confirm(`Chuyển ${formatMoney(amount)} vào Sổ giao dịch làm Khoản Tiết Kiệm nhé?`)) {
            const defaultWallet = state.wallets[0];
            if (defaultWallet) {
                defaultWallet.balance += amount; 
                state.transactions.unshift({ id: "tx-save-" + generateId(), type: "income", amount: amount, category: "c8", walletId: defaultWallet.id, date: getToday().replace("T", " "), note: `[Sinh Tồn] Tiết kiệm tiền ${desc}`, locationName: "" });
            }
            saveData(); if(typeof playSound === "function") playSound("success");
            alert(`Kỷ luật là sức mạnh! Giữ lại được ${formatMoney(amount)} 🤑`);
        }
    };
})();