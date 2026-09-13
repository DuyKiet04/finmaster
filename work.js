// ==========================================
// FINMASTER WORK CENTER - CALENDAR & JOURNAL EDITION
// Perfect Match with theme.css, Super Optimized UI/UX
// ==========================================

(function () {
    // ==========================================
    // 1. TỰ ĐỘNG BƠM GIAO DIỆN CHÍNH
    // ==========================================
    function injectWorkUI() {
        if (document.getElementById("view-work")) return;

        const workHtml = `
        <div id="view-work" class="view-section hidden pt-6 pb-28 relative min-h-screen  font-sans">
            
            <!-- THANH ĐIỀU HƯỚNG TABS -->
            <div class="px-4 mb-6">
                <div class="custom-bg-card p-1.5 rounded-[1.5rem] flex gap-1 shadow-sm border custom-border relative z-10">
                    <button onclick="workSwitchTab('tab-overview')" id="btn-tab-overview" class="work-tab-btn active flex-1 py-3 rounded-2xl text-sm font-black whitespace-nowrap custom-primary text-white shadow-md transition-all">
                        <i class="fa-solid fa-calendar-day mr-1"></i> Lịch Trình
                    </button>
                    <button onclick="workSwitchTab('tab-stats')" id="btn-tab-stats" class="work-tab-btn flex-1 py-3 rounded-2xl text-sm font-bold whitespace-nowrap custom-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                        <i class="fa-solid fa-chart-simple mr-1"></i> Thống kê
                    </button>
                </div>
            </div>

            <!-- ============================== -->
            <!-- TAB 1: TỔNG QUAN (CALENDAR + DETAILS) -->
            <!-- ============================== -->
            <div id="tab-overview" class="work-tab-content animate-fadeIn block px-4 space-y-6">
                
                <!-- CALENDAR CARD -->
                <div class="custom-bg-card p-5 sm:p-6 rounded-[2rem] shadow-sm border custom-border">
                    <!-- Calendar Header -->
                    <div class="flex justify-between items-center mb-6 px-2">
                        <button onclick="workChangeMonth(-1)" class="w-10 h-10 flex items-center justify-center rounded-2xl custom-primary dark:bg-gray-800 custom-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors active:scale-90 border custom-border">
                            <i class="fa-solid fa-chevron-left text-sm"></i>
                        </button>
                        <span id="work-calendar-title" class="text-lg font-black custom-text tracking-widest uppercase">THÁNG --/----</span>
                        <button onclick="workChangeMonth(1)" class="w-10 h-10 flex items-center justify-center rounded-2xl custom-primary dark:bg-gray-800 custom-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors active:scale-90 border custom-border">
                            <i class="fa-solid fa-chevron-right text-sm"></i>
                        </button>
                    </div>
                    
                    <!-- Days of Week -->
                    <div class="grid grid-cols-7 gap-1 mb-4 text-center text-[11px] font-black uppercase tracking-wider">
                        <div class="custom-text-secondary">T2</div>
                        <div class="custom-text-secondary">T3</div>
                        <div class="custom-text-secondary">T4</div>
                        <div class="custom-text-secondary">T5</div>
                        <div class="custom-text-secondary">T6</div>
                        <div class="custom-text-secondary">T7</div>
                        <div class="text-rose-500">CN</div>
                    </div>
                    
                    <!-- Calendar Grid -->
                    <div id="work-calendar-grid" class="grid grid-cols-7 gap-y-3 gap-x-1 sm:gap-x-2 text-center mb-6">
                        <!-- JS bơm ngày vào đây -->
                    </div>
                    
                    <!-- Legend -->
                    <div class="flex flex-wrap justify-center gap-x-5 gap-y-2 pt-5 border-t border-dashed custom-border text-[11px] font-bold custom-text-secondary">
                        <span class="flex items-center gap-2"><div class="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></div> Chi tiêu</span>
                        <span class="flex items-center gap-2"><div class="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></div> Nhật ký</span>
                    </div>
                </div>

                <!-- LỊCH TRÌNH CHI TIẾT THEO NGÀY (DAILY FEED) -->
                <div id="work-daily-feed" class="space-y-4 pb-10">
                    <!-- JS bơm nội dung chi tiêu & nhật ký vào đây -->
                </div>
            </div>

            <!-- ============================== -->
            <!-- TAB 2: THỐNG KÊ (STATS) -->
            <!-- ============================== -->
            <div id="tab-stats" class="work-tab-content animate-fadeIn hidden px-4 space-y-6">
                <div class="custom-bg-card p-6 rounded-[2rem] shadow-sm border custom-border" id="work-stats-container">
                    <!-- JS Bơm thống kê vào đây -->
                </div>
                <div class="custom-bg-card p-6 rounded-[2rem] shadow-sm border custom-border">
                    <div class="flex items-center gap-3 border-b border-dashed custom-border pb-4">
                     <div class="w-10 h-10 rounded-2xl custom-primary dark:bg-primary-900/30 text-primary-500 flex items-center justify-center text-lg"><i class="fa-solid fa-chart-column text-white"></i></div>
                    <div>
                        <p class="text-[10px] font-bold custom-text-secondary uppercase tracking-widest">Biểu đồ tháng </p>
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
            btn.className = "work-tab-btn flex-1 py-3 rounded-2xl text-sm font-bold whitespace-nowrap custom-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 transition-all";
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
        if (!state.workData || !state.workData.logs) { 
            state.workData = { logs: [] };
        }
        if (!window.workSelectedDate) {
            window.workSelectedDate = getToday().split("T")[0];
        }
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

    // Hàm chuẩn hóa chuỗi để tìm kiếm chính xác các từ "làm, lam, LÀM..."
    const normalizeStr = str => str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

    // ==========================================
    // 3. RENDER MASTER ENGINE
    // ==========================================
    window.renderWorkDashboard = () => {
        const data = state.workData;

        // Xử lý View Lịch
        if (window.workViewMonth === undefined) {
            const sdObj = new Date(window.workSelectedDate);
            window.workViewMonth = sdObj.getMonth();
            window.workViewYear = sdObj.getFullYear();
        }
        const curM = window.workViewMonth;
        const curY = window.workViewYear;
        
        const titleEl = document.getElementById("work-calendar-title");
        if (titleEl) titleEl.innerText = `THÁNG ${curM + 1}/${curY}`;

        // Lấy toàn bộ giao dịch công việc trong tháng để đánh dấu trên Lịch
        const monthStr = `${curY}-${String(curM + 1).padStart(2,'0')}`;
        const workTransInMonth = state.transactions.filter(t => {
            if (!t.date.startsWith(monthStr) || t.type !== 'expense') return false;
            const cat = state.categories.find(c => c.id === t.category);
            return cat && normalizeStr(cat.name).includes("lam");
        });

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

            // Check Dấu chấm
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

            // Giao diện ô Lịch chuẩn theme.css
            let cellClass = "w-10 h-10 mx-auto rounded-full flex flex-col items-center justify-center relative cursor-pointer transition-all active:scale-90 font-black text-sm ";
            if (isSelected) {
                cellClass += "custom-primary text-white shadow-md shadow-primary-500/30 scale-110";
            } else if (isToday) {
                cellClass += "bg-transparent custom-text border border-primary-500";
            } else {
                cellClass += "bg-transparent custom-text hover:bg-gray-100 dark:hover:bg-gray-800";
            }

            calHtml += `
                <div class="relative py-1">
                    <div onclick="window.workSelectDay('${currentScanDateStr}')" class="${cellClass}">
                        ${d}
                    </div>
                    <div class="absolute -bottom-1 left-0 right-0 flex justify-center gap-1">
                        ${dotHtml}
                    </div>
                </div>
            `;
        }
        const calGrid = document.getElementById("work-calendar-grid");
        if (calGrid) calGrid.innerHTML = calHtml;

        // ==========================================
        // VẼ DAILY FEED (NỘI DUNG NGÀY ĐÃ CHỌN - BẢN GỌN GÀNG)
        // ==========================================
        const feedContainer = document.getElementById("work-daily-feed");
        if (feedContainer) {
            const selDateObj = new Date(window.workSelectedDate);
            const displayDateStr = `${String(selDateObj.getDate()).padStart(2,'0')}/${String(selDateObj.getMonth()+1).padStart(2,'0')}/${selDateObj.getFullYear()}`;
            
            let feedHtml = `<h4 class="font-black text-sm custom-text-secondary uppercase tracking-widest custom-text flex items-center gap-2 mb-3 px-1"><i class="fa-solid fa-calendar-check text-primary-500"></i> Lịch trình ${displayDateStr}</h4>`;

            // 1. Giao dịch đi làm trong ngày (Gộp thành 1 List gọn gàng)
            const dayTrans = state.transactions.filter(t => {
                if (!t.date.startsWith(window.workSelectedDate) || t.type !== 'expense') return false;
                const cat = state.categories.find(c => c.id === t.category);
                return cat && normalizeStr(cat.name).includes("lam");
            });

            if (dayTrans.length > 0) {
                feedHtml += `<div class="custom-bg-card rounded-3xl border custom-border shadow-sm mb-4 overflow-hidden">`;
                feedHtml += dayTrans.map((t, index) => {
                    const cat = state.categories.find(c => c.id === t.category) || { name: 'Khác', icon: 'fa-box', color: 'text-primary-500', bg: 'custom-bg-input' };
                    const timeStr = t.date.split(" ")[1] ? t.date.split(" ")[1].substring(0,5) : "--:--";
                    
                    const visualHtml = t.image 
                        ? `<img src="${t.image}" class="w-10 h-10 rounded-xl object-cover shadow-sm border custom-border shrink-0">` 
                        : `<div class="w-10 h-10 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center text-lg shadow-sm border custom-border shrink-0"><i class="fa-solid ${cat.icon}"></i></div>`;

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

            // 2. Nhật ký trong ngày (Nhỏ gọn, cuộn ngang ảnh)
            const dayLog = data.logs.find(l => l.date === window.workSelectedDate);
            if (dayLog && (dayLog.journalImages?.length > 0 || dayLog.journalNote || dayLog.journalMood)) {
                let imagesHtml = '';
                const currentImages = dayLog.journalImages || (dayLog.journalImage ? [dayLog.journalImage] : []);
                if (currentImages.length > 0) {
                    imagesHtml = `<div class="flex gap-2 mb-3 overflow-x-auto hide-scrollbar snap-x pb-1">` + 
                        currentImages.map(img => `<img src="${img}" class="h-28 w-auto min-w-[112px] object-cover rounded-2xl border custom-border shadow-sm snap-center">`).join('') +
                        `</div>`;
                }

                feedHtml += `
                    <div class="custom-bg-card p-4 rounded-3xl border custom-border shadow-sm relative group mb-4">
                        <div class="flex items-center justify-between mb-3 border-b border-dashed custom-border pb-2">
                            <div class="flex items-center gap-2">
                                <i class="fa-solid fa-book-open text-amber-500 text-sm"></i>
                                <span class="text-[11px] font-black uppercase text-amber-500 tracking-widest">Ký sự</span>
                            </div>
                            <button onclick="workOpenJournalForm()" class="custom-bg-input custom-text-secondary w-7 h-7 rounded-full flex justify-center items-center active:scale-90 transition-transform"><i class="fa-solid fa-pen text-[10px]"></i></button>
                        </div>
                        
                        ${imagesHtml}
                        
                        ${(dayLog.journalMood || dayLog.journalNote) ? `
                        <div class="flex items-start gap-2.5 custom-bg-input p-3 rounded-2xl border custom-border">
                            ${dayLog.journalMood ? `<span class="text-2xl leading-none drop-shadow-sm">${dayLog.journalMood}</span>` : ''}
                            <span class="flex-1 text-xs font-medium custom-text italic leading-relaxed pt-0.5">"${dayLog.journalNote || ''}"</span>
                        </div>
                        ` : ''}
                    </div>
                `;
            }

            // Trạng thái trống (Mini size)
            if (dayTrans.length === 0 && (!dayLog || (!dayLog.journalImages?.length && !dayLog.journalNote && !dayLog.journalMood))) {
                feedHtml += `
                    <div class="custom-bg-card p-6 rounded-3xl border custom-border text-center flex flex-col items-center justify-center gap-2">
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
        // VẼ THỐNG KÊ (TAB 2)
        // ==========================================
        const statsContainer = document.getElementById("work-stats-container");
        if (statsContainer) {
            const totalExpense = workTransInMonth.reduce((sum, t) => sum + t.amount, 0);
            const monthLogs = data.logs.filter(l => l.date.startsWith(monthStr) && (l.journalImages?.length > 0 || l.journalNote || l.journalMood));
            
            statsContainer.innerHTML = `
                <div class="flex items-center gap-3 mb-2 border-b border-dashed custom-border pb-4">
                    <div class="w-10 h-10 rounded-2xl custom-primary dark:bg-primary-900/30 text-primary-500 flex items-center justify-center text-lg"><i class="fa-solid fa-chart-pie text-white"></i></div>
                    <div>
                        <p class="text-[10px] font-bold custom-text-secondary uppercase tracking-widest">Tổng kết tháng ${curM+1}/${curY}</p>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-rose-50 dark:bg-rose-900/10 rounded-3xl p-5 border border-rose-100 dark:border-rose-900/30">
                        <p class="text-[10px] font-black text-rose-500 uppercase mb-1">Tổng chi đi làm</p>
                        <p class="text-xl font-black text-rose-600 dark:text-rose-400">${formatMoney(totalExpense)}</p>
                    </div>
                    <div class="bg-amber-50 dark:bg-amber-900/10 rounded-3xl p-5 border border-amber-100 dark:border-amber-900/30">
                        <p class="text-[10px] font-black text-amber-500 uppercase mb-1">Nhật ký đã viết</p>
                        <p class="text-xl font-black text-amber-600 dark:text-amber-400">${monthLogs.length} bài</p>
                    </div>
                </div>
            `;

            // Vẽ Biểu đồ Chart.js
            if (typeof Chart !== 'undefined' && document.getElementById('tab-stats').classList.contains('block')) {
                const dailyExp = {};
                for(let d=1; d<=daysInMonth; d++) dailyExp[d] = 0;
                workTransInMonth.forEach(t => {
                    const day = parseInt(t.date.substring(8, 10));
                    dailyExp[day] += t.amount;
                });

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
    window.workOpenJournalForm = () => {
        const data = state.workData; 
        const dateStr = window.workSelectedDate;
        
        let log = data.logs.find(l => l.date === dateStr);
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
                        <div class="w-full py-6 custom-bg-input border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center custom-text-secondary transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                            <i class="fa-solid fa-cloud-arrow-up text-3xl mb-2 text-primary-500"></i>
                            <span class="text-xs font-bold">Chạm để chọn ảnh </span>
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

        const renderPreviews = () => {
            document.getElementById('j-preview-container').innerHTML = window.tempJournalImages.map((img, i) => `
                <div class="relative w-14 h-14 sm:w-20 sm:h-20 rounded-2xl border custom-border overflow-hidden shadow-sm">
                    <img src="${img}" class="w-full h-full object-cover">
                    <button type="button" onclick="window.tempJournalImages.splice(${i}, 1); document.getElementById('j-preview-container').innerHTML = ''; window.workOpenJournalForm();" class="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center shadow-md active:scale-90"><i class="fa-solid fa-times"></i></button>
                </div>
            `).join('');
        };
        renderPreviews();

        // Thuật toán nén ảnh sâu (< 200kb)
        document.getElementById('j-image-multi').addEventListener('change', async function(e) {
            const files = Array.from(e.target.files); if (!files.length) return;
            for (let file of files) {
                const base64 = await new Promise(resolve => {
                    const reader = new FileReader(); reader.readAsDataURL(file);
                    reader.onload = event => {
                        const img = new Image(); img.src = event.target.result;
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const MAX_WIDTH = 800; // Khóa chết độ rộng max 800px
                            let width = img.width; let height = img.height;
                            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                            canvas.width = width; canvas.height = height;
                            const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
                            // Quality 0.6 + resize 800px đảm bảo file < 200KB
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
            
            // Nếu là log mới tạo, push vào mảng
            if (!data.logs.find(l => l.id === log.id)) {
                data.logs.push(log);
            }

            saveData(); if(typeof playSound === "function") playSound("success");
            closeModal(); window.renderWorkDashboard(); 
        };
    };

})();