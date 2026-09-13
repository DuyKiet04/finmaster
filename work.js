// ==========================================
// FINMASTER WORK CENTER - ULTIMATE PERFECT EDITION
// Unlimited Journals, Deep Compress, Custom Date Filter, Theme Sync
// ==========================================

(function () {
    // ==========================================
    // 1. TỰ ĐỘNG BƠM GIAO DIỆN CHÍNH
    // ==========================================
    function injectWorkUI() {
        if (document.getElementById("view-work")) return;

        const workHtml = `
        <div id="view-work" class="view-section hidden pt-3 pb-28 relative min-h-screen font-sans ">
            
            <!-- THANH ĐIỀU HƯỚNG TABS -->
            <div class="px-2 mb-6">
                <div class="custom-bg-card p-1.5 rounded-[1.5rem] flex gap-1 shadow-sm border custom-border relative z-10">
                    <button onclick="workSwitchTab('tab-overview')" id="btn-tab-overview" class="work-tab-btn active flex-1 py-3 rounded-2xl text-sm font-black whitespace-nowrap custom-primary text-white shadow-md transition-all">
                        <i class="fa-solid fa-calendar-day mr-1"></i> Lịch Trình
                    </button>
                    <button onclick="workSwitchTab('tab-stats')" id="btn-tab-stats" class="work-tab-btn flex-1 py-3 rounded-2xl text-sm font-bold whitespace-nowrap custom-text-secondary hover:brightness-95 transition-all">
                        <i class="fa-solid fa-chart-simple mr-1"></i> Thống kê
                    </button>
                </div>
            </div>

            <!-- ============================== -->
            <!-- TAB 1: TỔNG QUAN (CALENDAR + DETAILS) -->
            <!-- ============================== -->
            <div id="tab-overview" class="work-tab-content animate-fadeIn block px-2 space-y-6">
                
                <!-- CALENDAR CARD -->
                <div class="custom-bg-card p-5 sm:p-6 rounded-[2rem] shadow-sm border custom-border">
                    <div class="flex justify-between items-center mb-6 px-2">
                        <button onclick="workChangeMonth(-1)" class="w-10 h-10 flex items-center justify-center rounded-xl custom-bg-input custom-text-secondary hover:brightness-95 transition-all active:scale-90 border custom-border">
                            <i class="fa-solid fa-chevron-left text-sm"></i>
                        </button>
                        <span id="work-calendar-title" class="text-lg font-black custom-text tracking-widest uppercase">THÁNG --/----</span>
                        <button onclick="workChangeMonth(1)" class="w-10 h-10 flex items-center justify-center rounded-xl custom-bg-input custom-text-secondary hover:brightness-95 transition-all active:scale-90 border custom-border">
                            <i class="fa-solid fa-chevron-right text-sm"></i>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-7 gap-1 mb-4 text-center text-[11px] font-black uppercase tracking-wider">
                        <div class="custom-text-secondary">T2</div><div class="custom-text-secondary">T3</div>
                        <div class="custom-text-secondary">T4</div><div class="custom-text-secondary">T5</div>
                        <div class="custom-text-secondary">T6</div><div class="text-rose-500">T7</div><div class="text-rose-500">CN</div>
                    </div>
                    
                    <div id="work-calendar-grid" class="grid grid-cols-7 gap-y-3 gap-x-1 sm:gap-x-2 text-center mb-6"></div>
                    
                    <div class="flex flex-wrap justify-center gap-x-5 gap-y-2 pt-5 border-t border-dashed custom-border text-[11px] font-bold custom-text-secondary">
                        <span class="flex items-center gap-2"><div class="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></div> Chi tiêu</span>
                        <span class="flex items-center gap-2"><div class="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></div> Nhật ký</span>
                    </div>
                </div>

                <!-- LỊCH TRÌNH CHI TIẾT THEO NGÀY (DAILY FEED) -->
                <div id="work-daily-feed" class="space-y-4 pb-10"></div>
            </div>

            <!-- ============================== -->
            <!-- TAB 2: THỐNG KÊ (STATS) -->
            <!-- ============================== -->
            <div id="tab-stats" class="work-tab-content animate-fadeIn hidden px-2 space-y-6">
                <div class="custom-bg-card p-6 rounded-[2rem] shadow-sm border custom-border" id="work-stats-container">
                    <!-- JS Bơm thống kê vào đây -->
                </div>
                <div class="custom-bg-card p-6 rounded-[2rem] shadow-sm border custom-border">
                    <div class="flex items-center gap-3 border-b border-dashed custom-border pb-4 mb-4">
                        <div class="w-10 h-10 rounded-full custom-primary text-white flex items-center justify-center text-lg shadow-sm"><i class="fa-solid fa-chart-column"></i></div>
                        <div>
                            <p class="text-[10px] font-bold custom-text-secondary uppercase tracking-widest">Biểu đồ chi tiêu</p>
                        </div>
                    </div>
                    <canvas id="workChartExpense" height="180"></canvas>
                </div>
            </div>

            <!-- NÚT ĐĂNG NHẬT KÝ (FAB) -->
            <button onclick="workOpenJournalForm()" class="fixed bottom-24 right-5 sm:right-8 w-14 h-14 bg-gradient-to-tr from-primary-600 to-primary-400 text-white rounded-full shadow-lg shadow-primary-500/40 flex items-center justify-center text-xl active:scale-90 transition-transform z-40 border-2 border-white dark:border-gray-900">
                <i class="fa-solid fa-pen"></i>
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
            btn.className = "work-tab-btn flex-1 py-3 rounded-2xl text-sm font-bold whitespace-nowrap custom-text-secondary hover:brightness-95 transition-all";
        });
        const activeBtn = document.getElementById("btn-" + tabId);
        if(activeBtn) activeBtn.className = "work-tab-btn active flex-1 py-3 rounded-2xl text-sm font-black whitespace-nowrap custom-primary text-white shadow-md transition-all";

        document.querySelectorAll(".work-tab-content").forEach(content => {
            content.classList.add("hidden"); content.classList.remove("block");
        });
        const activeContent = document.getElementById(tabId);
        if(activeContent) activeContent.classList.replace("hidden", "block");

        if (tabId === 'tab-stats') window.renderWorkDashboard();
    };

    function initWorkData() {
        if (!state.workData || !state.workData.logs) { state.workData = { logs: [] }; }
        if (!window.workSelectedDate) { window.workSelectedDate = getToday().split("T")[0]; }
    }

    const origSwitchView = window.switchView;
    window.switchView = function(viewId) {
        if (viewId === "work") { injectWorkUI(); initWorkData(); }
        if (origSwitchView) origSwitchView(viewId);
        if (viewId === "work") {
            window.renderWorkDashboard();
            const fM = document.getElementById("fab-mobile"); const fD = document.getElementById("fab-desktop");
            if(fM) fM.classList.add("hidden"); if(fD) fD.classList.add("hidden");
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

    const normalizeStr = str => str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

    window.workApplyFilter = () => {
        const s = document.getElementById('work-filter-start').value;
        const e = document.getElementById('work-filter-end').value;
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
        const data = state.workData;

        if (window.workViewMonth === undefined) {
            const sdObj = new Date(window.workSelectedDate);
            window.workViewMonth = sdObj.getMonth();
            window.workViewYear = sdObj.getFullYear();
        }
        const curM = window.workViewMonth;
        const curY = window.workViewYear;
        
        const titleEl = document.getElementById("work-calendar-title");
        if (titleEl) titleEl.innerText = `THÁNG ${curM + 1}/${curY}`;

        const workTransAll = state.transactions.filter(t => {
            if (t.type !== 'expense') return false;
            const cat = state.categories.find(c => c.id === t.category);
            return cat && normalizeStr(cat.name).includes("lam");
        });

        const monthStr = `${curY}-${String(curM + 1).padStart(2,'0')}`;
        const workTransInMonth = workTransAll.filter(t => t.date.startsWith(monthStr));

        // ==========================================
        // VẼ SMART CALENDAR 
        // ==========================================
        const daysInMonth = new Date(curY, curM + 1, 0).getDate();
        const firstDay = new Date(curY, curM, 1).getDay();
        let emptyCells = firstDay === 0 ? 6 : firstDay - 1; 
        let calHtml = "";

        for (let i = 0; i < emptyCells; i++) calHtml += `<div></div>`;

        for (let d = 1; d <= daysInMonth; d++) {
            const currentScanDateStr = `${curY}-${String(curM + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const isSelected = currentScanDateStr === window.workSelectedDate;
            const isToday = currentScanDateStr === getToday().split("T")[0];

            const hasTrans = workTransInMonth.some(t => t.date.startsWith(currentScanDateStr));
            const hasJournal = data.logs.some(l => l.date === currentScanDateStr && (l.journalImages?.length > 0 || l.journalNote || l.journalMood));

            let dotHtml = "";
            if (hasTrans && hasJournal) {
                dotHtml = `<div class="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm"></div><div class="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-sm"></div>`;
            } else if (hasTrans) {
                dotHtml = `<div class="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm"></div>`;
            } else if (hasJournal) {
                dotHtml = `<div class="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-sm"></div>`;
            }

            let cellClass = "w-10 h-10 mx-auto rounded-full flex flex-col items-center justify-center relative cursor-pointer transition-all active:scale-90 font-black text-sm ";
            if (isSelected) {
                cellClass += "custom-primary text-white shadow-md shadow-primary-500/30 scale-110";
            } else if (isToday) {
                cellClass += "bg-transparent custom-text border border-primary-500";
            } else {
                cellClass += "bg-transparent custom-text hover:brightness-95";
            }

            calHtml += `
                <div class="relative py-1">
                    <div onclick="window.workSelectDay('${currentScanDateStr}')" class="${cellClass}">${d}</div>
                    <div class="absolute -bottom-1 left-0 right-0 flex justify-center gap-1">${dotHtml}</div>
                </div>
            `;
        }
        const calGrid = document.getElementById("work-calendar-grid");
        if (calGrid) calGrid.innerHTML = calHtml;

        // ==========================================
        // VẼ DAILY FEED
        // ==========================================
        const feedContainer = document.getElementById("work-daily-feed");
        if (feedContainer) {
            const selDateObj = new Date(window.workSelectedDate);
            const displayDateStr = `${String(selDateObj.getDate()).padStart(2,'0')}/${String(selDateObj.getMonth()+1).padStart(2,'0')}/${selDateObj.getFullYear()}`;
            
            let feedHtml = `<h4 class="font-black text-sm custom-text-secondary uppercase tracking-widest flex items-center gap-2 mb-3 px-1"><i class="fa-solid fa-calendar-check text-primary-500"></i> Lịch trình ${displayDateStr}</h4>`;

            // 1. Giao dịch đi làm
            const dayTrans = workTransAll.filter(t => t.date.startsWith(window.workSelectedDate));

            if (dayTrans.length > 0) {
                feedHtml += `<div class="custom-bg-card rounded-3xl border custom-border shadow-sm mb-4 overflow-hidden">`;
                feedHtml += dayTrans.map((t, index) => {
                    const cat = state.categories.find(c => c.id === t.category) || { name: 'Khác', icon: 'fa-box', color: 'text-primary-500', bg: 'custom-bg-input' };
                    const timeStr = t.date.split(" ")[1] ? t.date.split(" ")[1].substring(0,5) : "--:--";
                    
                    // --- BẮT ĐẦU XỬ LÝ EMOJI & FONTAWESOME ---
                    const catBg = cat.bg || 'custom-bg-input';
                    const catColor = cat.color || 'custom-text-secondary';
                    const catIcon = cat.icon || 'fa-briefcase'; 

                    // Bộ não phân biệt: Nếu là chữ/số thì dùng FontAwesome, nếu là Emoji thì dùng thẻ span
                    let iconElement = '';
                    if (catIcon.includes('fa-')) {
                        iconElement = `<i class="fa-solid ${catIcon}"></i>`;
                    } else if (/^[a-zA-Z0-9-]+$/.test(catIcon)) { 
                        iconElement = `<i class="fa-solid fa-${catIcon}"></i>`;
                    } else { 
                        iconElement = `<span class="text-xl drop-shadow-sm leading-none">${catIcon}</span>`;
                    }

                    const fallbackIcon = `<div class="w-10 h-10 rounded-xl ${catBg} ${catColor} flex items-center justify-center text-lg shadow-sm border custom-border shrink-0">${iconElement}</div>`;

                    let visualHtml = fallbackIcon;
                    if (t.image && String(t.image).trim() !== "" && t.image !== "null" && t.image !== "undefined") {
                        // Đổi chiến thuật: Dùng CSS ẩn/hiện thay cho việc nhét HTML vào thuộc tính data (tránh lỗi dấu nháy)
                        visualHtml = `
                            <img src="${t.image}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" class="w-10 h-10 rounded-xl object-cover shadow-sm border custom-border shrink-0">
                            <div style="display:none;" class="w-10 h-10 rounded-xl ${catBg} ${catColor} items-center justify-center text-lg shadow-sm border custom-border shrink-0">${iconElement}</div>
                        `;
                    }
                    // --- KẾT THÚC XỬ LÝ ---

                    const borderBottom = index < dayTrans.length - 1 ? 'border-b border-dashed custom-border' : '';

                    return `
                        <div class="p-4 flex flex-col gap-2 ${borderBottom} transition-all hover:brightness-95">
                            <div class="flex justify-between items-center">
                                <div class="flex items-center gap-3">
                                    ${visualHtml}
                                    <div>
                                        <p class="text-sm font-black custom-text">${cat.name}</p>
                                        <p class="text-[10px] font-bold custom-text-secondary mt-0.5 flex items-center gap-1"><i class="fa-regular fa-clock"></i> ${timeStr}</p>
                                    </div>
                                </div>
                                <p class="text-sm font-black text-rose-500">-${formatMoney(t.amount)}</p>
                            </div>
                            
                            ${(t.note || t.locationName) ? `
                            <div class="flex flex-wrap gap-1.5 ml-[3.25rem] mt-1">
                                ${t.note ? `<span class="custom-bg-input px-2 py-1 rounded-md text-[10px] font-bold custom-text-secondary flex items-center gap-1"><i class="fa-solid fa-align-left"></i> ${t.note}</span>` : ''}
                                ${t.locationName ? `<span class="bg-rose-500/10 text-rose-500 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1"><i class="fa-solid fa-location-dot"></i> ${t.locationName}</span>` : ''}
                            </div>` : ''}
                        </div>
                    `;
                }).join("");
                feedHtml += `</div>`;
            }

            // 2. Nhật ký (Cho phép nhiều bài/ngày, không tràn chữ)
            const dayLogs = data.logs.filter(l => l.date === window.workSelectedDate && (l.journalImages?.length > 0 || l.journalNote || l.journalMood));
            
            if (dayLogs.length > 0) {
                const sortedLogs = [...dayLogs].reverse();
                
                feedHtml += sortedLogs.map(logItem => {
                    let imagesHtml = '';
                    const currentImages = logItem.journalImages || (logItem.journalImage ? [logItem.journalImage] : []);
                    if (currentImages.length > 0) {
                        imagesHtml = `<div class="flex gap-2 mb-3 overflow-x-auto hide-scrollbar snap-x pb-1">` + 
                            currentImages.map(img => `<img src="${img}" onclick="window.workViewImageFullScreen('${img}')" class="h-28 w-auto min-w-[112px] object-cover rounded-2xl border custom-border shadow-sm snap-center cursor-pointer hover:brightness-90 active:scale-95 transition-all">`).join('') +
                            `</div>`;
                    }

                    return `
                        <div class="custom-bg-card p-4 rounded-3xl border custom-border shadow-sm relative group mb-4">
                            <div class="flex items-center justify-between mb-3 border-b border-dashed custom-border pb-2">
                                <div class="flex items-center gap-2">
                                    <i class="fa-solid fa-book-open text-amber-500 text-sm"></i>
                                    <span class="text-[11px] font-black uppercase text-amber-500 tracking-widest">Ký sự</span>
                                </div>
                                <button onclick="window.workOpenJournalForm('${logItem.id}')" class="custom-bg-input custom-text-secondary w-7 h-7 rounded-full flex justify-center items-center active:scale-90 transition-transform"><i class="fa-solid fa-pen text-[10px]"></i></button>
                            </div>
                            
                            ${imagesHtml}
                            
                            ${(logItem.journalMood || logItem.journalNote) ? `
                            <div class="flex items-start gap-2.5 custom-bg-input p-3 rounded-2xl border custom-border">
                                ${logItem.journalMood ? `<span class="text-2xl leading-none drop-shadow-sm shrink-0">${logItem.journalMood}</span>` : ''}
                                <span class="flex-1 min-w-0 break-words text-xs font-medium custom-text italic leading-relaxed pt-0.5">"${logItem.journalNote || ''}"</span>
                            </div>
                            ` : ''}
                        </div>
                    `;
                }).join('');
            }

            if (dayTrans.length === 0 && dayLogs.length === 0) {
                feedHtml += `
                    <div class="custom-bg-card p-6 rounded-3xl border custom-border text-center flex flex-col items-center justify-center gap-2 mt-2">
                        <div class="w-12 h-12 custom-bg-input rounded-full flex items-center justify-center custom-text-secondary text-xl"><i class="fa-solid fa-mug-hot"></i></div>
                        <div>
                            <p class="text-sm font-black custom-text">Ngày bình yên!</p>
                            <p class="text-[10px] font-bold custom-text-secondary mt-0.5">Không có chi tiêu hay nhật ký.</p>
                        </div>
                    </div>
                `;
            }
            feedContainer.innerHTML = feedHtml;
        }

        // ==========================================
        // VẼ THỐNG KÊ KÈM BỘ LỌC NGÀY (TAB 2)
        // ==========================================
        const statsContainer = document.getElementById("work-stats-container");
        if (statsContainer) {
            window.workFilterStart = window.workFilterStart || "";
            window.workFilterEnd = window.workFilterEnd || "";

            let filteredTrans = [];
            let filteredLogs = [];
            let statsTitle = `Tháng ${curM+1}/${curY}`;

            const isDateInRange = (dateStr, start, end) => {
                const d = new Date(dateStr.split(' ')[0]); d.setHours(0,0,0,0);
                const s = new Date(start); s.setHours(0,0,0,0);
                const e = new Date(end); e.setHours(23,59,59,999);
                return d >= s && d <= e;
            };

            if (window.workFilterStart && window.workFilterEnd) {
                statsTitle = `Tùy chỉnh`;
                filteredTrans = workTransAll.filter(t => isDateInRange(t.date, window.workFilterStart, window.workFilterEnd));
                filteredLogs = data.logs.filter(l => isDateInRange(l.date, window.workFilterStart, window.workFilterEnd) && (l.journalImages?.length > 0 || l.journalNote || l.journalMood));
            } else {
                filteredTrans = workTransInMonth;
                filteredLogs = data.logs.filter(l => l.date.startsWith(monthStr) && (l.journalImages?.length > 0 || l.journalNote || l.journalMood));
            }

            const totalExpense = filteredTrans.reduce((sum, t) => sum + t.amount, 0);

            statsContainer.innerHTML = `
                <div class="flex items-center justify-between mb-5 border-b border-dashed custom-border pb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full custom-primary text-white flex items-center justify-center text-lg shadow-sm"><i class="fa-solid fa-chart-pie"></i></div>
                        <div>
                            <p class="text-sm font-black custom-text tracking-tight">Tổng Kết</p>
                            <p class="text-[10px] font-bold custom-text-secondary uppercase tracking-widest">${statsTitle}</p>
                        </div>
                    </div>
                    ${(window.workFilterStart && window.workFilterEnd) ? `
                    <button onclick="window.workClearFilter()" class="w-8 h-8 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors rounded-full flex items-center justify-center active:scale-90 border custom-border">
                        <i class="fa-solid fa-xmark text-sm"></i>
                    </button>` : ''}
                </div>

                <div class="flex items-center gap-2 custom-bg-input p-2 rounded-2xl border custom-border mb-5">
                    <input type="date" id="work-filter-start" value="${window.workFilterStart}" onchange="window.workApplyFilter()" class="flex-1 bg-transparent text-xs font-bold custom-text outline-none text-center">
                    <span class="custom-text-secondary"><i class="fa-solid fa-arrow-right text-[10px]"></i></span>
                    <input type="date" id="work-filter-end" value="${window.workFilterEnd}" onchange="window.workApplyFilter()" class="flex-1 bg-transparent text-xs font-bold custom-text outline-none text-center">
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div class="custom-bg-input rounded-2xl p-4 border custom-border">
                        <p class="text-[10px] font-black text-rose-500 uppercase mb-1"><i class="fa-solid fa-arrow-trend-down mr-0.5"></i> Tổng chi </p>
                        <p class="text-xl font-black text-rose-500 break-words">${formatMoney(totalExpense)}</p>
                    </div>
                    <div class="custom-bg-input rounded-2xl p-4 border custom-border">
                        <p class="text-[10px] font-black text-amber-500 uppercase mb-1"><i class="fa-solid fa-book-open mr-0.5"></i> Nhật ký</p>
                        <p class="text-xl font-black text-amber-500">${filteredLogs.length} bài</p>
                    </div>
                </div>
            `;

            // Vẽ Biểu đồ Chart.js tự động co giãn theo Date Filter
            if (typeof Chart !== 'undefined' && document.getElementById('tab-stats').classList.contains('block')) {
                const dailyExp = {};
                
                if (window.workFilterStart && window.workFilterEnd) {
                    filteredTrans.forEach(t => {
                        const dateObj = new Date(t.date.split(' ')[0]);
                        const label = `${String(dateObj.getDate()).padStart(2,'0')}/${String(dateObj.getMonth()+1).padStart(2,'0')}`;
                        if(!dailyExp[label]) dailyExp[label] = 0;
                        dailyExp[label] += t.amount;
                    });
                } else {
                    for(let d=1; d<=daysInMonth; d++) dailyExp[d] = 0;
                    filteredTrans.forEach(t => {
                        const day = parseInt(t.date.substring(8, 10));
                        dailyExp[day] += t.amount;
                    });
                }

                if (window.workChartExp) window.workChartExp.destroy();
                window.workChartExp = new Chart(document.getElementById('workChartExpense'), {
                    type: 'bar', 
                    data: { 
                        labels: Object.keys(dailyExp), 
                        datasets: [{ 
                            label: 'Chi tiêu', 
                            data: Object.values(dailyExp), 
                            backgroundColor: '#fb7185', 
                            borderRadius: 6 
                        }] 
                    },
                    options: { 
                        plugins: { legend: { display: false } }, 
                        scales: { 
                            y: { display: false }, 
                            x: { grid: { display: false }, ticks: { font: {size: 9}, color: '#9ca3af' } } 
                        } 
                    }
                });
            }
        }
    };

    // ==========================================
    // 4. FORM ĐĂNG NHẬT KÝ (ÉP ẢNH SIÊU NHẸ < 200KB)
    // ==========================================
    window.workOpenJournalForm = (logId = null) => {
        const data = state.workData; 
        const dateStr = window.workSelectedDate;
        
        let log;
        if (logId) log = data.logs.find(l => l.id === logId);

        if (!log) {
            log = { id: "log-" + generateId(), date: dateStr, journalMood: '', journalNote: '', journalImages: [] };
        }

        const modal = document.getElementById("global-modal"); 
        modal.classList.remove("hidden");
        document.getElementById("modal-title").innerHTML = `<i class="fa-solid fa-pen text-primary-500"></i> Viết nhật ký ${dateStr.split('-').reverse().join('/')}`;
        
        window.tempJournalImages = log.journalImages ? [...log.journalImages] : (log.journalImage ? [log.journalImage] : []);

        document.getElementById("modal-body").innerHTML = `
            <form id="frm-journal" class="space-y-5">
                <div class="custom-bg-card p-4 rounded-3xl border custom-border">
                    <label class="block text-[10px] font-bold custom-text-secondary uppercase mb-3 text-center tracking-widest">Tâm trạng hôm nay</label>
                    <div class="grid grid-cols-4 gap-2">
                        ${['😎','🚀','😴','😡','🍜','🤒','🍻','💸'].map(m => `
                            <label class="cursor-pointer group">
                                <input type="radio" name="j-mood" value="${m}" class="peer sr-only" ${log.journalMood === m ? 'checked' : ''}>
                                <div class="w-full aspect-square flex items-center justify-center text-3xl rounded-2xl border custom-border custom-bg-input peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/30 transition-all shadow-sm">${m}</div>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="custom-bg-card p-4 rounded-3xl border custom-border">
                    <label class="block text-[10px] font-bold custom-text-secondary uppercase mb-3 flex justify-between items-center tracking-widest">
                        <span><i class="fa-solid fa-camera text-primary-500"></i> Hình ảnh</span>
                    </label>
                    <div class="relative">
                        <input type="file" id="j-image-multi" multiple accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">
                        <div class="w-full py-6 custom-bg-input border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center custom-text-secondary transition-colors hover:brightness-95">
                            <i class="fa-solid fa-cloud-arrow-up text-3xl mb-2 text-primary-500"></i>
                            <span class="text-xs font-bold">Chạm để chọn ảnh (Ép < 200kb)</span>
                        </div>
                    </div>
                    <div id="j-preview-container" class="flex flex-wrap gap-2 mt-4"></div>
                </div>

                <div>
                    <textarea id="j-note" rows="3" class="w-full p-4 custom-bg-input rounded-3xl border custom-border text-sm outline-none custom-focus shadow-sm" placeholder="Kể chuyện hôm nay...">${log.journalNote || ''}</textarea>
                </div>
                
                <div class="grid grid-cols-2 gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="py-4 custom-bg-input custom-text rounded-2xl font-black text-sm border custom-border active:scale-95 transition-transform">Hủy</button>
                    <button type="submit" class="py-4 custom-primary text-white rounded-2xl font-black text-sm shadow-lg shadow-primary-500/30 active:scale-95 transition-transform">Lưu Nhật Ký</button>
                </div>
            </form>
        `;

        window.workRenderJournalPreviews = () => {
            document.getElementById('j-preview-container').innerHTML = window.tempJournalImages.map((img, i) => `
                <div class="relative w-14 h-14 sm:w-20 sm:h-20 rounded-2xl border custom-border overflow-hidden shadow-sm">
                    <img src="${img}" class="w-full h-full object-cover">
                    <button type="button" onclick="window.tempJournalImages.splice(${i}, 1); window.workRenderJournalPreviews();" class="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center shadow-md active:scale-90"><i class="fa-solid fa-times"></i></button>
                </div>
            `).join('');
        };
        window.workRenderJournalPreviews();

        document.getElementById('j-image-multi').addEventListener('change', async function(e) {
            const files = Array.from(e.target.files); if (!files.length) return;
            for (let file of files) {
                const base64 = await new Promise(resolve => {
                    const reader = new FileReader(); reader.readAsDataURL(file);
                    reader.onload = event => {
                        const img = new Image(); img.src = event.target.result;
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const MAX_WIDTH = 600; 
                            let width = img.width; let height = img.height;
                            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                            canvas.width = width; canvas.height = height;
                            const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
                            resolve(canvas.toDataURL('image/jpeg', 0.5));
                        }
                    };
                });
                window.tempJournalImages.push(base64);
            }
            window.workRenderJournalPreviews();
        });

        document.getElementById("frm-journal").onsubmit = (e) => {
            e.preventDefault();
            const checkedMood = document.querySelector('input[name="j-mood"]:checked');
            log.journalMood = checkedMood ? checkedMood.value : '';
            log.journalNote = document.getElementById("j-note").value;
            log.journalImages = [...window.tempJournalImages]; 
            
            if (!data.logs.find(l => l.id === log.id)) {
                data.logs.push(log);
            }

            saveData(); if(typeof playSound === "function") playSound("success");
            closeModal(); window.renderWorkDashboard(); 
        };
    };

    // ==========================================
    // CÔNG CỤ XEM ẢNH FULL MÀN HÌNH (RẠP CHIẾU PHIM)
    // ==========================================
    window.workViewImageFullScreen = (src) => {
        // Tạo một cái lớp màn đen phủ kín màn hình
        const overlay = document.createElement('div');
        overlay.className = "fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center cursor-pointer opacity-0 transition-opacity duration-300 backdrop-blur-sm";
        overlay.innerHTML = `
            <div class="absolute top-6 right-6 text-white text-3xl font-black w-10 h-10 flex items-center justify-center bg-gray-800/50 rounded-full hover:bg-rose-500 transition-colors"><i class="fa-solid fa-times"></i></div>
            <img src="${src}" class="max-w-[95vw] max-h-[90vh] object-contain border custom-border rounded-2xl shadow-2xl scale-95 transition-transform duration-300">
        `;
        document.body.appendChild(overlay);
        
        // Hiệu ứng Fade in và Zoom in
        setTimeout(() => {
            overlay.classList.remove("opacity-0");
            overlay.querySelector("img").classList.remove("scale-95");
            overlay.querySelector("img").classList.add("scale-100");
        }, 10);

        // Bấm vào đâu cũng tự động tắt
        overlay.onclick = () => {
            overlay.classList.add("opacity-0");
            overlay.querySelector("img").classList.remove("scale-100");
            overlay.querySelector("img").classList.add("scale-95");
            setTimeout(() => overlay.remove(), 300);
        };
    };

})();