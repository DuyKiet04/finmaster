// ==========================================
// FINMASTER WORK CENTER - ULTIMATE PERFECT EDITION 3.0
// Timeline UI, Top Categories, Glassmorphism, Deep Compress
// ==========================================

(function () {
    // ==========================================
    // 1. TỰ ĐỘNG BƠM GIAO DIỆN CHÍNH (NEW SUPER UI)
    // ==========================================
    function injectWorkUI() {
        if (document.getElementById("view-work")) return;

        const workHtml = `
        <div id="view-work" class="view-section hidden pt-4 pb-28 relative min-h-screen font-sans">
            
            <!-- THANH ĐIỀU HƯỚNG TABS (FLOATING PILL) -->
            <div class="px-2 mb-6 sticky top-2 z-40">
                <div class="custom-bg-card/90 backdrop-blur-xl p-1.5 rounded-full flex gap-1 shadow-lg shadow-black/5 border custom-border">
                    <button onclick="workSwitchTab('tab-overview')" id="btn-tab-overview" class="work-tab-btn active flex-1 py-3 rounded-full text-sm font-black whitespace-nowrap custom-primary text-white shadow-md transition-all duration-300 transform scale-100">
                        <i class="fa-solid fa-timeline mr-1"></i> Lịch Trình
                    </button>
                    <button onclick="workSwitchTab('tab-stats')" id="btn-tab-stats" class="work-tab-btn flex-1 py-3 rounded-full text-sm font-bold whitespace-nowrap custom-text-secondary hover:text-gray-800 dark:hover:text-white transition-all duration-300 transform scale-95 hover:scale-100">
                        <i class="fa-solid fa-chart-pie mr-1"></i> Thống kê
                    </button>
                </div>
            </div>

            <!-- ============================== -->
            <!-- TAB 1: TỔNG QUAN (CALENDAR + TIMELINE) -->
            <!-- ============================== -->
            <div id="tab-overview" class="work-tab-content animate-fadeIn block px-2 space-y-6 max-w-4xl mx-auto">
                
                <!-- SMART CALENDAR CARD (GLASS EFFECT) -->
                <div class="custom-bg-card p-6 rounded-[2.5rem] shadow-sm border custom-border relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-110"></div>
                    
                    <div class="flex justify-between items-center mb-6 relative z-10">
                        <button onclick="workChangeMonth(-1)" class="w-10 h-10 flex items-center justify-center rounded-2xl custom-bg-input custom-text-secondary hover:text-primary-500 transition-all active:scale-90 border custom-border shadow-sm">
                            <i class="fa-solid fa-chevron-left text-sm"></i>
                        </button>
                        <span id="work-calendar-title" class="text-lg font-black custom-text tracking-widest uppercase bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent">THÁNG --/----</span>
                        <button onclick="workChangeMonth(1)" class="w-10 h-10 flex items-center justify-center rounded-2xl custom-bg-input custom-text-secondary hover:text-primary-500 transition-all active:scale-90 border custom-border shadow-sm">
                            <i class="fa-solid fa-chevron-right text-sm"></i>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-7 gap-1 mb-4 text-center text-[10px] font-black uppercase tracking-widest relative z-10">
                        <div class="custom-text-secondary">T2</div><div class="custom-text-secondary">T3</div>
                        <div class="custom-text-secondary">T4</div><div class="custom-text-secondary">T5</div>
                        <div class="custom-text-secondary">T6</div><div class="text-rose-500">T7</div><div class="text-rose-500">CN</div>
                    </div>
                    
                    <div id="work-calendar-grid" class="grid grid-cols-7 gap-y-4 gap-x-2 text-center mb-6 relative z-10"></div>
                    
                    <div class="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-5 border-t border-dashed custom-border text-[10px] font-bold custom-text-secondary uppercase tracking-wider relative z-10">
                        <span class="flex items-center gap-2"><div class="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-md shadow-rose-500/40"></div> Chi tiêu</span>
                        <span class="flex items-center gap-2"><div class="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-md shadow-amber-500/40"></div> Ký sự</span>
                    </div>
                </div>

                <!-- LỊCH TRÌNH CHI TIẾT (TIMELINE FEED) -->
                <div class="relative pt-4 pb-10">
                    <div class="absolute left-6 sm:left-[3.25rem] top-8 bottom-0 w-0.5 bg-gradient-to-b from-primary-500/50 via-gray-200 dark:via-gray-700 to-transparent"></div>
                    <div id="work-daily-feed" class="space-y-6 relative z-10"></div>
                </div>
            </div>

            <!-- ============================== -->
            <!-- TAB 2: THỐNG KÊ (STATS & TOP CATEGORIES) -->
            <!-- ============================== -->
            <div id="tab-stats" class="work-tab-content animate-fadeIn hidden px-2 space-y-6 max-w-4xl mx-auto">
                
                <!-- Box Tổng kết -->
                <div class="custom-bg-card p-6 rounded-[2.5rem] shadow-sm border custom-border relative overflow-hidden" id="work-stats-container">
                    <!-- JS Bơm thống kê vào đây -->
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Box Biểu đồ cột -->
                    <div class="custom-bg-card p-6 rounded-[2.5rem] shadow-sm border custom-border flex flex-col">
                        <div class="flex items-center gap-3 border-b border-dashed custom-border pb-4 mb-4">
                            <div class="w-10 h-10 rounded-full custom-primary text-white flex items-center justify-center text-lg shadow-md shadow-primary-500/30"><i class="fa-solid fa-chart-column"></i></div>
                            <div>
                                <p class="text-[10px] font-black custom-text-secondary uppercase tracking-widest">Biểu đồ chi tiêu</p>
                            </div>
                        </div>
                        <div class="flex-1 min-h-[180px] relative">
                            <canvas id="workChartExpense"></canvas>
                        </div>
                    </div>

                    <!-- 🔥 TÍNH NĂNG MỚI: TOP DANH MỤC CÔNG VIỆC -->
                    <div class="custom-bg-card p-6 rounded-[2.5rem] shadow-sm border custom-border flex flex-col">
                        <div class="flex items-center gap-3 border-b border-dashed custom-border pb-4 mb-4">
                            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 text-white flex items-center justify-center text-lg shadow-md shadow-orange-500/30"><i class="fa-solid fa-shapes"></i></div>
                            <div>
                                <p class="text-[10px] font-black custom-text-secondary uppercase tracking-widest">Cơ cấu chi tiêu</p>
                            </div>
                        </div>
                        <!-- Nơi JS bơm danh sách Top Danh Mục vào -->
                        <div id="work-cat-list" class="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2"></div>
                    </div>
                </div>
            </div>

            <!-- NÚT ĐĂNG NHẬT KÝ (FAB) -->
            <button onclick="workOpenJournalForm()" class="fixed bottom-24 right-5 sm:right-8 w-14 h-14 bg-gradient-to-tr from-primary-600 to-purple-600 text-white rounded-full shadow-xl shadow-primary-500/40 flex items-center justify-center text-xl active:scale-90 transition-transform z-40 border-[3px] border-white dark:border-gray-900 group">
                <i class="fa-solid fa-pen group-hover:rotate-12 transition-transform"></i>
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
            btn.className = "work-tab-btn flex-1 py-3 rounded-full text-sm font-bold whitespace-nowrap custom-text-secondary hover:text-gray-800 dark:hover:text-white transition-all duration-300 transform scale-95 hover:scale-100";
        });
        const activeBtn = document.getElementById("btn-" + tabId);
        if(activeBtn) activeBtn.className = "work-tab-btn active flex-1 py-3 rounded-full text-sm font-black whitespace-nowrap custom-primary text-white shadow-md transition-all duration-300 transform scale-100";

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
            if (t.isWork) return true; // Lọc theo công tắc mới
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
                dotHtml = `<div class="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></div><div class="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></div>`;
            } else if (hasTrans) {
                dotHtml = `<div class="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></div>`;
            } else if (hasJournal) {
                dotHtml = `<div class="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></div>`;
            }

            let cellClass = "w-10 h-10 mx-auto rounded-full flex flex-col items-center justify-center relative cursor-pointer transition-all active:scale-90 font-black text-sm ";
            if (isSelected) {
                cellClass += "bg-gradient-to-tr from-primary-600 to-primary-400 text-white shadow-lg shadow-primary-500/40 scale-110";
            } else if (isToday) {
                cellClass += "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border border-primary-500/50";
            } else {
                cellClass += "bg-transparent custom-text hover:bg-black/5 dark:hover:bg-white/5";
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
        // VẼ TIMELINE FEED CỰC ĐẸP
        // ==========================================
        const feedContainer = document.getElementById("work-daily-feed");
        if (feedContainer) {
            const selDateObj = new Date(window.workSelectedDate);
            const displayDateStr = `${String(selDateObj.getDate()).padStart(2,'0')}/${String(selDateObj.getMonth()+1).padStart(2,'0')}/${selDateObj.getFullYear()}`;
            
            let feedHtml = `
            <div class="relative pl-14 sm:pl-20 mb-6">
                <div class="absolute left-[1.1rem] sm:left-[2.85rem] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary-500 border-[3px] border-white dark:border-gray-900 shadow-sm z-20"></div>
                <h4 class="font-black text-lg custom-text tracking-tight">${displayDateStr}</h4>
                <p class="text-[10px] font-bold custom-text-secondary uppercase tracking-widest mt-0.5">Lịch trình làm việc</p>
            </div>`;

            const dayTrans = workTransAll.filter(t => t.date.startsWith(window.workSelectedDate));
            const dayLogs = data.logs.filter(l => l.date === window.workSelectedDate && (l.journalImages?.length > 0 || l.journalNote || l.journalMood));

            if (dayTrans.length === 0 && dayLogs.length === 0) {
                feedHtml += `
                    <div class="pl-14 sm:pl-20 pr-4">
                        <div class="custom-bg-card p-6 rounded-3xl border custom-border text-center flex flex-col items-center justify-center gap-3 mt-2 opacity-70 border-dashed">
                            <div class="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center custom-text-secondary text-2xl shadow-inner"><i class="fa-solid fa-mug-hot"></i></div>
                            <div>
                                <p class="text-sm font-black custom-text">Ngày bình yên!</p>
                                <p class="text-[10px] font-bold custom-text-secondary mt-0.5 uppercase tracking-wider">Không có hoạt động nào</p>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                // 1. Giao dịch đi làm (Chi phí)
                // 1. Giao dịch đi làm (Chi phí)
                dayTrans.forEach(t => {
                    const cat = state.categories.find(c => c.id === t.category) || { name: 'Khác', icon: '🌟', color: 'bg-gray-100 text-gray-500' };
                    const timeStr = t.date.split(" ")[1] ? t.date.split(" ")[1].substring(0,5) : "--:--";
                    
                    // --- TUYỆT CHIÊU XỬ LÝ ICON & ẢNH LỖI ---
                    let iconContent = cat.icon || '🌟';
                    // Xử lý nếu dùng FontAwesome cũ
                    if (iconContent.startsWith('fa-')) {
                        iconContent = `<i class="fa-solid ${iconContent}"></i>`;
                    } else if (/^[a-zA-Z0-9-]+$/.test(iconContent) && iconContent.length > 2) {
                        iconContent = `<i class="fa-solid fa-${iconContent}"></i>`;
                    }

                    // 1. Luôn luôn vẽ cái Icon mộc (Fallback) ở lớp dưới
                    const fallbackHtml = `<div class="w-12 h-12 rounded-2xl ${cat.color} flex items-center justify-center text-2xl shadow-sm border custom-border shrink-0">${iconContent}</div>`;
                    
                    let visualHtml = fallbackHtml;

                    // 2. Nếu có ảnh, úp cái ảnh lên trên. Nếu ảnh lỗi (onerror), tự động tàng hình để lộ Icon bên dưới!
                    if (t.image && typeof t.image === 'string' && t.image.length > 20 && t.image !== "null" && t.image !== "undefined") {
                        const imgSrc = window.getFastImage ? window.getFastImage(t.image) : t.image;
                        visualHtml = `
                        <div class="relative w-12 h-12 shrink-0">
                            ${fallbackHtml}
                            <img src="${imgSrc}" onerror="this.style.display='none'" class="absolute inset-0 w-full h-full rounded-2xl object-cover shadow-sm border custom-border cursor-pointer hover:opacity-80 z-10 bg-white dark:bg-gray-800" onclick="window.workViewImageFullScreen(this.src)">
                        </div>`;
                    }
                    // --- KẾT THÚC XỬ LÝ ---

                    feedHtml += `
                        <div class="relative pl-14 sm:pl-20 pr-4 mb-6 group">
                            <div class="absolute left-[1.1rem] sm:left-[2.85rem] top-6 w-3 h-3 rounded-full bg-rose-400 border-[3px] border-white dark:border-gray-900 shadow-sm z-20 group-hover:scale-125 transition-transform"></div>
                            
                            <div class="custom-bg-card p-4 rounded-3xl border custom-border shadow-sm hover:shadow-md transition-all group-hover:-translate-y-1 relative overflow-hidden">
                                <div class="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none"></div>
                                <div class="flex justify-between items-start mb-2 relative z-10">
                                    <div class="flex items-center gap-3">
                                        ${visualHtml}
                                        <div>
                                            <p class="text-sm font-black custom-text leading-tight">${cat.name}</p>
                                            <p class="text-[10px] font-bold custom-text-secondary mt-1 flex items-center gap-1.5"><i class="fa-regular fa-clock"></i> ${timeStr}</p>
                                        </div>
                                    </div>
                                    <p class="text-base font-black text-rose-500 bg-rose-50 dark:bg-rose-900/30 px-2.5 py-1 rounded-xl border border-rose-100 dark:border-rose-800">-${formatMoney(t.amount)}</p>
                                </div>
                                ${(t.note || t.locationName) ? `
                                <div class="flex flex-wrap gap-2 ml-[3.75rem] mt-3 relative z-10">
                                    ${t.note ? `<span class="bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg text-[11px] font-medium custom-text-secondary flex items-center gap-1.5 border custom-border"><i class="fa-solid fa-align-left text-gray-400"></i> ${t.note}</span>` : ''}
                                    ${t.locationName ? `<span class="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border border-rose-100 dark:border-rose-800"><i class="fa-solid fa-location-dot"></i> ${window.formatShortAddress ? window.formatShortAddress(t.locationName) : t.locationName}</span>` : ''}
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
                            imagesHtml = `<div class="flex gap-2 mb-3 overflow-x-auto custom-scrollbar snap-x pb-2">` + 
                                currentImages.map(img => `<img src="${window.getFastImage(img)}" onclick="window.workViewImageFullScreen('${img}')" class="h-32 w-auto min-w-[120px] object-cover rounded-2xl border custom-border shadow-sm snap-center cursor-pointer hover:brightness-90 active:scale-95 transition-all">`).join('') +
                                `</div>`;
                        }

                        feedHtml += `
                            <div class="relative pl-14 sm:pl-20 pr-4 mb-6 group">
                                <div class="absolute left-[1.1rem] sm:left-[2.85rem] top-6 w-3 h-3 rounded-full bg-amber-400 border-[3px] border-white dark:border-gray-900 shadow-sm z-20 group-hover:scale-125 transition-transform"></div>
                                
                                <div class="custom-bg-card p-5 rounded-3xl border custom-border shadow-sm hover:shadow-md transition-all group-hover:-translate-y-1 relative overflow-hidden">
                                    <div class="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none"></div>
                                    <div class="flex items-center justify-between mb-4 border-b border-dashed custom-border pb-3 relative z-10">
                                        <div class="flex items-center gap-2">
                                            <div class="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center shadow-inner"><i class="fa-solid fa-book-open text-xs"></i></div>
                                            <span class="text-[10px] font-black uppercase text-amber-500 tracking-widest">Ký sự công việc</span>
                                        </div>
                                        <button onclick="window.workOpenJournalForm('${logItem.id}')" class="custom-bg-input custom-text-secondary w-8 h-8 rounded-full flex justify-center items-center hover:text-primary-500 hover:bg-primary-50 transition-all border custom-border"><i class="fa-solid fa-pen text-xs"></i></button>
                                    </div>
                                    
                                    <div class="relative z-10">
                                        ${imagesHtml}
                                        ${(logItem.journalMood || logItem.journalNote) ? `
                                        <div class="flex items-start gap-3 bg-gray-50 dark:bg-gray-800/50 p-3.5 rounded-2xl border custom-border">
                                            ${logItem.journalMood ? `<span class="text-3xl leading-none drop-shadow-sm shrink-0 hover:scale-110 transition-transform cursor-default">${logItem.journalMood}</span>` : ''}
                                            <span class="flex-1 min-w-0 break-words text-sm font-medium custom-text leading-relaxed pt-1 italic">"${logItem.journalNote || ''}"</span>
                                        </div>
                                        ` : ''}
                                    </div>
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
                <div class="absolute top-0 right-0 w-40 h-40 bg-primary-500/5 rounded-bl-full pointer-events-none"></div>
                <div class="flex items-center justify-between mb-6 border-b border-dashed custom-border pb-4 relative z-10">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-500 text-white flex items-center justify-center text-xl shadow-lg shadow-primary-500/30"><i class="fa-solid fa-chart-pie"></i></div>
                        <div>
                            <p class="text-base font-black custom-text tracking-tight leading-tight">Tổng Kết</p>
                            <p class="text-[10px] font-bold custom-text-secondary uppercase tracking-widest mt-0.5">${statsTitle}</p>
                        </div>
                    </div>
                    ${(window.workFilterStart && window.workFilterEnd) ? `
                    <button onclick="window.workClearFilter()" class="w-9 h-9 bg-rose-50 text-rose-500 dark:bg-rose-900/30 hover:bg-rose-100 transition-colors rounded-xl flex items-center justify-center active:scale-90 border border-rose-100 dark:border-rose-800 shadow-sm">
                        <i class="fa-solid fa-xmark text-sm"></i>
                    </button>` : ''}
                </div>

                <div class="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-2xl border custom-border mb-6 relative z-10 shadow-inner">
                    <input type="date" id="work-filter-start" value="${window.workFilterStart}" onchange="window.workApplyFilter()" class="flex-1 bg-transparent text-[11px] font-bold custom-text outline-none text-center cursor-pointer uppercase tracking-wider">
                    <span class="custom-text-secondary bg-white dark:bg-gray-700 w-6 h-6 rounded-full flex items-center justify-center shadow-sm border custom-border"><i class="fa-solid fa-arrow-right text-[10px]"></i></span>
                    <input type="date" id="work-filter-end" value="${window.workFilterEnd}" onchange="window.workApplyFilter()" class="flex-1 bg-transparent text-[11px] font-bold custom-text outline-none text-center cursor-pointer uppercase tracking-wider">
                </div>

                <div class="grid grid-cols-2 gap-4 relative z-10">
                    <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 border custom-border shadow-sm flex flex-col items-center text-center group hover:border-rose-300 transition-colors">
                        <div class="w-8 h-8 rounded-full bg-rose-50 text-rose-500 dark:bg-rose-900/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><i class="fa-solid fa-arrow-trend-up text-xs"></i></div>
                        <p class="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1 opacity-80">Tổng chi</p>
                        <p class="text-xl font-black text-rose-600 dark:text-rose-400 break-words w-full truncate">${formatMoney(totalExpense)}</p>
                    </div>
                    <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 border custom-border shadow-sm flex flex-col items-center text-center group hover:border-amber-300 transition-colors">
                        <div class="w-8 h-8 rounded-full bg-amber-50 text-amber-500 dark:bg-amber-900/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><i class="fa-solid fa-book-open text-xs"></i></div>
                        <p class="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1 opacity-80">Ký sự</p>
                        <p class="text-xl font-black text-amber-600 dark:text-amber-400">${filteredLogs.length} <span class="text-xs">bài</span></p>
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
                const ctx = document.getElementById('workChartExpense').getContext('2d');
                
                // Tạo Gradient cho cột
                const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                gradient.addColorStop(0, '#f43f5e'); // Rose 500
                gradient.addColorStop(1, '#fb7185'); // Rose 400

                window.workChartExp = new Chart(ctx, {
                    type: 'bar', 
                    data: { 
                        labels: Object.keys(dailyExp), 
                        datasets: [{ 
                            label: 'Chi tiêu', 
                            data: Object.values(dailyExp), 
                            backgroundColor: gradient, 
                            borderRadius: 4,
                            borderSkipped: false
                        }] 
                    },
                    options: { 
                        maintainAspectRatio: false,
                        plugins: { 
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return formatMoney(context.raw);
                                    }
                                }
                            }
                        }, 
                        scales: { 
                            y: { display: false }, 
                            x: { grid: { display: false }, ticks: { font: {size: 9}, color: '#9ca3af' } } 
                        } 
                    }
                });
            }

            // ----------------------------------------
            // THUẬT TOÁN: BẢNG XẾP HẠNG DANH MỤC CHI TIÊU
            // ----------------------------------------
            const workCatListContainer = document.getElementById("work-cat-list");
            if (workCatListContainer) {
                if (filteredTrans.length === 0) {
                    workCatListContainer.innerHTML = `<div class="text-center py-6 opacity-50"><i class="fa-solid fa-box-open text-4xl mb-3 text-gray-400"></i><p class="text-sm font-bold custom-text-secondary">Chưa có dữ liệu danh mục</p></div>`;
                } else {
                    // Gom tiền theo từng danh mục
                    const catGroup = filteredTrans.reduce((acc, t) => {
                        acc[t.category] = (acc[t.category] || 0) + t.amount;
                        return acc;
                    }, {});

                    // Sắp xếp thằng nào tốn nhiều tiền nhất lên đầu
                    const sortedCats = Object.entries(catGroup).sort((a, b) => b[1] - a[1]);
                    const colorPalette = ['#f43f5e', '#f97316', '#eab308', '#84cc16', '#06b6d4', '#3b82f6'];

                    let catHtml = '';
                    sortedCats.forEach(([catId, amt], idx) => {
                        const cat = state.categories.find(c => c.id === catId) || { name: 'Khác', icon: '📦', color: 'bg-gray-100 text-gray-500' };
                        const pct = totalExpense > 0 ? ((amt / totalExpense) * 100).toFixed(1) : 0;
                        const barColor = colorPalette[idx % colorPalette.length];

                        catHtml += `
                        <div class="flex items-center gap-3.5 group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2.5 -mx-2.5 rounded-2xl transition-all active:scale-[0.98]" onclick="document.getElementById('filter-search').value = '${cat.name}'; window.workSwitchTab('tab-overview'); document.getElementById('btn-tab-overview').click();">
                            <div class="w-12 h-12 rounded-[14px] ${cat.color} flex items-center justify-center text-xl border border-white/40 dark:border-white/5 shadow-inner shrink-0 transition-transform group-hover:scale-110">${cat.icon}</div>
                            <div class="flex-1 min-w-0">
                                <div class="flex justify-between items-center mb-1.5">
                                    <span class="text-sm font-bold custom-text truncate pr-2">${cat.name}</span>
                                    <span class="text-sm font-black custom-text">${formatMoney(amt)}</span>
                                </div>
                                <div class="flex items-center gap-2.5">
                                    <div class="h-1.5 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div class="h-full rounded-full transition-all duration-1000" style="width: ${pct}%; background-color: ${barColor}"></div>
                                    </div>
                                    <span class="text-[10px] font-black custom-text-secondary w-8 text-right tracking-wider">${pct}%</span>
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
        const data = state.workData; 
        const dateStr = window.workSelectedDate;
        
        let log;
        if (logId) log = data.logs.find(l => l.id === logId);

        if (!log) {
            log = { id: "log-" + generateId(), date: dateStr, journalMood: '', journalNote: '', journalImages: [] };
        }

        const modal = document.getElementById("global-modal"); 
        modal.classList.remove("hidden");
        document.getElementById("modal-title").innerHTML = `<i class="fa-solid fa-pen text-primary-500"></i> Viết ký sự ${dateStr.split('-').reverse().join('/')}`;
        
        window.tempJournalImages = log.journalImages ? [...log.journalImages] : (log.journalImage ? [log.journalImage] : []);

        document.getElementById("modal-body").innerHTML = `
            <form id="frm-journal" class="space-y-5">
                <div class="custom-bg-card p-5 rounded-3xl border custom-border shadow-sm">
                    <label class="block text-[10px] font-black custom-text-secondary uppercase mb-3 text-center tracking-widest"><i class="fa-solid fa-face-smile text-amber-500 mr-1"></i> Tâm trạng hôm nay</label>
                    <div class="grid grid-cols-4 gap-2">
                        ${['😎','🚀','😴','😡','🍜','🤒','🍻','💸'].map(m => `
                            <label class="cursor-pointer group">
                                <input type="radio" name="j-mood" value="${m}" class="peer sr-only" ${log.journalMood === m ? 'checked' : ''}>
                                <div class="w-full aspect-square flex items-center justify-center text-3xl rounded-2xl border custom-border custom-bg-input peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/30 transition-all shadow-sm hover:scale-105 active:scale-95">${m}</div>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="custom-bg-card p-5 rounded-3xl border custom-border shadow-sm">
                    <label class="block text-[10px] font-black custom-text-secondary uppercase mb-3 tracking-widest">
                        <i class="fa-solid fa-camera text-blue-500 mr-1"></i> Hình ảnh đính kèm
                    </label>
                    <div class="relative">
                        <input type="file" id="j-image-multi" multiple accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">
                        <div class="w-full py-6 custom-bg-input border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex flex-col items-center justify-center custom-text-secondary transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                            <i class="fa-solid fa-cloud-arrow-up text-3xl mb-2 text-primary-500"></i>
                            <span class="text-xs font-bold">Chạm để chọn ảnh (Ép < 200kb)</span>
                        </div>
                    </div>
                    <div id="j-preview-container" class="flex flex-wrap gap-2 mt-4"></div>
                </div>

                <div>
                    <textarea id="j-note" rows="4" class="w-full p-4 custom-bg-input rounded-3xl border custom-border text-sm outline-none custom-focus shadow-sm font-medium" placeholder="Kể chuyện hôm nay...">${log.journalNote || ''}</textarea>
                </div>
                
                <div class="grid grid-cols-2 gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="py-4 custom-bg-input custom-text rounded-2xl font-black text-sm border custom-border active:scale-95 transition-transform hover:brightness-95">Hủy</button>
                    <button type="submit" class="py-4 bg-gradient-to-r from-primary-500 to-indigo-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-primary-500/30 active:scale-95 transition-transform hover:brightness-110"><i class="fa-solid fa-floppy-disk mr-1"></i> Lưu Ký Sự</button>
                </div>
            </form>
        `;

        window.workRenderJournalPreviews = () => {
            document.getElementById('j-preview-container').innerHTML = window.tempJournalImages.map((img, i) => `
                <div class="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border custom-border overflow-hidden shadow-sm group">
                    <img src="${window.getFastImage(img)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
                    <button type="button" onclick="window.tempJournalImages.splice(${i}, 1); window.workRenderJournalPreviews();" class="absolute top-1 right-1 w-6 h-6 bg-red-500/90 backdrop-blur-sm text-white rounded-full text-[10px] flex items-center justify-center shadow-md active:scale-90 opacity-0 group-hover:opacity-100 transition-opacity"><i class="fa-solid fa-times"></i></button>
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
        const overlay = document.createElement('div');
        overlay.className = "fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center cursor-pointer opacity-0 transition-opacity duration-300 backdrop-blur-md";
        overlay.innerHTML = `
            <div class="absolute top-6 right-6 text-white text-xl font-black w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-rose-500 transition-colors border border-white/20"><i class="fa-solid fa-xmark"></i></div>
            <img src="${src}" class="max-w-[95vw] max-h-[90vh] object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] scale-95 transition-transform duration-300">
        `;
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.classList.remove("opacity-0");
            overlay.querySelector("img").classList.remove("scale-95");
            overlay.querySelector("img").classList.add("scale-100");
        }, 10);

        overlay.onclick = () => {
            overlay.classList.add("opacity-0");
            overlay.querySelector("img").classList.remove("scale-100");
            overlay.querySelector("img").classList.add("scale-95");
            setTimeout(() => overlay.remove(), 300);
        };
    };

})();