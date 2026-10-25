// ==============================================================
// FILE: calendar-pro.js - SPATIAL LIQUID GLASS & BENTO CALENDAR
// Bộ Lịch Tài Chính & Đời Sống Siêu Cấp Cho FinMaster
// ==============================================================

(function initCalendarProModule() {
    window.calCurrentDate = new Date();
    window.calSelectedDate = new Date().toISOString().split('T')[0];
    window.calFilterType = 'all'; // 'all', 'txs', 'tasks', 'debts', 'runs', 'trips', 'diary'
    window.calViewMode = 'grid';   // 'grid', 'agenda'

    // Format tiền gọn gàng cho mini badges (vd: 150k, 1.2m)
    function formatCompactMoney(amount) {
        if (!amount || isNaN(amount)) return '0';
        const num = Math.abs(amount);
        if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'tỷ';
        if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
        if (num >= 1000) return Math.round(num / 1000) + 'k';
        return num.toString();
    }

    // ==========================================
    // 1. ĐIỀU HƯỚNG THÁNG & BỘ LỌC
    // ==========================================
    window.changeCalMonth = (dir) => {
        window.calCurrentDate.setMonth(window.calCurrentDate.getMonth() + dir);
        
        // Cập nhật selected date sang tháng mới
        const y = window.calCurrentDate.getFullYear();
        const m = String(window.calCurrentDate.getMonth() + 1).padStart(2, '0');
        const now = new Date();
        if (now.getFullYear() === y && now.getMonth() === window.calCurrentDate.getMonth()) {
            window.calSelectedDate = now.toISOString().split('T')[0];
        } else {
            window.calSelectedDate = `${y}-${m}-01`;
        }

        renderCalendar();
        if (typeof playSound === 'function') playSound("click");
    };

    window.jumpCalToday = () => {
        window.calCurrentDate = new Date();
        window.calSelectedDate = new Date().toISOString().split('T')[0];
        renderCalendar();
        if (typeof playSound === 'function') playSound("pop");
    };

    window.setCalFilter = (filterType) => {
        window.calFilterType = filterType;
        renderCalendar();
        if (typeof playSound === 'function') playSound("click");
    };

    window.setCalViewMode = (mode) => {
        window.calViewMode = mode;
        renderCalendar();
        if (typeof playSound === 'function') playSound("pop");
    };

    window.selectCalDay = (dateStr) => {
        window.calSelectedDate = dateStr;
        renderCalendar();
        if (typeof playSound === 'function') playSound("click");
    };

    // ==========================================
    // 2. RENDER CHÍNH MÀN HÌNH LỊCH
    // ==========================================
    window.renderCalendar = () => {
        const year = window.calCurrentDate.getFullYear();
        const month = window.calCurrentDate.getMonth();
        const monthStr = String(month + 1).padStart(2, '0');
        const prefixMonth = `${year}-${monthStr}`;

        // Header tháng
        const monthYearEl = document.getElementById("cal-month-year");
        if (monthYearEl) {
            monthYearEl.innerText = `Tháng ${month + 1}/${year}`;
        }

        // Lọc tất cả dữ liệu trong tháng đang xem
        const monthTxs = (state.transactions || []).filter(t => t.date && t.date.startsWith(prefixMonth) && t.category !== 'transfer');
        const monthTasks = (state.tasks || []).filter(t => t.date && t.date.startsWith(prefixMonth));
        const monthDebts = (state.debts || []).filter(d => d.dueDate && d.dueDate.startsWith(prefixMonth) && d.status === 'active');
        const monthRuns = (state.runs || []).filter(r => r.date && r.date.startsWith(prefixMonth));
        const monthTrips = (state.trips || []).filter(tr => {
            if (!tr.startDate || !tr.endDate) return false;
            return (tr.startDate.startsWith(prefixMonth) || tr.endDate.startsWith(prefixMonth) || (tr.startDate <= `${prefixMonth}-31` && tr.endDate >= `${prefixMonth}-01`));
        });
        const monthDiaries = (state.diaryNotes || []).filter(n => n.date && n.date.startsWith(prefixMonth) && n.text);

        // Tính toán các chỉ số Bento
        const totalIncome = monthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const totalExpense = monthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const netCashflow = totalIncome - totalExpense;
        const totalActivities = monthTxs.length + monthTasks.length + monthDebts.length + monthRuns.length + monthTrips.length + monthDiaries.length;

        // Cập nhật Dải Bento 4 Chỉ Số nếu phần tử tồn tại
        const kpiIncEl = document.getElementById("cal-kpi-income");
        if (kpiIncEl) kpiIncEl.innerText = `+${formatMoney(totalIncome)}`;
        
        const kpiExpEl = document.getElementById("cal-kpi-expense");
        if (kpiExpEl) kpiExpEl.innerText = `-${formatMoney(totalExpense)}`;

        const kpiNetEl = document.getElementById("cal-kpi-net");
        if (kpiNetEl) {
            kpiNetEl.innerText = (netCashflow >= 0 ? '+' : '') + formatMoney(netCashflow);
            kpiNetEl.className = `text-base sm:text-lg font-black truncate ${netCashflow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`;
        }

        const kpiActEl = document.getElementById("cal-kpi-activities");
        if (kpiActEl) kpiActEl.innerText = `${totalActivities} sự kiện`;

        // Render Dải Sóng Chi Tiêu Sparkline (30/31 Ngày)
        renderCalSparkline(year, month, monthTxs);

        // Cập nhật các nút Filter Pills
        renderCalFilterPills(monthTxs, monthTasks, monthDebts, monthRuns, monthTrips, monthDiaries);

        // Render Lưới Ngày hoặc Agenda
        if (window.calViewMode === 'agenda') {
            renderCalAgendaView(year, month);
        } else {
            renderCalGridView(year, month);
        }

        // TỰ ĐỘNG HIỂN THỊ CHI TIẾT NGÀY ĐANG CHỌN (KHÔNG BAO GIỜ BỎ TRỐNG NỬA DƯỚI)
        window.showDayEvents(window.calSelectedDate);
    };

    // ==========================================
    // 3. VẼ DẢI SÓNG CHI TIÊU HÀNG NGÀY (SPARKLINE)
    // ==========================================
    function renderCalSparkline(year, month, monthTxs) {
        const sparkContainer = document.getElementById("cal-sparkline");
        if (!sparkContainer) return;

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dailyExpenses = new Array(daysInMonth).fill(0);

        monthTxs.filter(t => t.type === 'expense').forEach(t => {
            const dayNum = parseInt(t.date.split('T')[0].split('-')[2], 10);
            if (dayNum >= 1 && dayNum <= daysInMonth) {
                dailyExpenses[dayNum - 1] += (Number(t.amount) || 0);
            }
        });

        const maxExpense = Math.max(...dailyExpenses, 1);
        const selectedDayNum = parseInt(window.calSelectedDate.split('-')[2], 10);
        const isCurrentViewingMonth = window.calSelectedDate.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`);

        let barsHtml = '';
        for (let d = 1; d <= daysInMonth; d++) {
            const exp = dailyExpenses[d - 1];
            const heightPct = Math.max(8, Math.round((exp / maxExpense) * 100));
            const isSelected = isCurrentViewingMonth && d === selectedDayNum;
            const targetDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            
            let barColor = exp > 0 ? 'bg-rose-500/50 hover:bg-rose-500' : 'bg-black/10 dark:bg-white/10 hover:bg-black/20';
            if (isSelected) barColor = 'bg-primary-500 shadow-md shadow-primary-500/50';

            barsHtml += `
                <div onclick="selectCalDay('${targetDate}')" class="flex-1 flex flex-col items-center justify-end h-12 cursor-pointer group relative py-0.5" title="Ngày ${d}: ${formatMoney(exp)}">
                    <div class="w-full max-w-[8px] rounded-full cal-spark-bar ${barColor}" style="height: ${heightPct}%;"></div>
                    ${isSelected ? `<div class="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1"></div>` : ''}
                </div>
            `;
        }
        sparkContainer.innerHTML = barsHtml;
    }

    // ==========================================
    // 4. VẼ THANH PILL BỘ LỌC TƯƠNG TÁC
    // ==========================================
    function renderCalFilterPills(txs, tasks, debts, runs, trips, diaries) {
        const pillsBox = document.getElementById("cal-filter-pills");
        if (!pillsBox) return;

        const filters = [
            { id: 'all', label: 'Tất cả', icon: 'fa-shapes', count: txs.length + tasks.length + debts.length + runs.length + trips.length + diaries.length },
            { id: 'txs', label: 'Thu / Chi', icon: 'fa-money-bill-transfer', count: txs.length },
            { id: 'tasks', label: 'Công việc', icon: 'fa-clipboard-check', count: tasks.length },
            { id: 'debts', label: 'Nợ & Vay', icon: 'fa-hand-holding-dollar', count: debts.length },
            { id: 'runs', label: 'Chạy bộ', icon: 'fa-person-running', count: runs.length },
            { id: 'trips', label: 'Chuyến đi', icon: 'fa-plane-departure', count: trips.length },
            { id: 'diary', label: 'Nhật ký', icon: 'fa-book-open', count: diaries.length }
        ];

        pillsBox.innerHTML = filters.map(f => {
            const isActive = window.calFilterType === f.id;
            return `
                <button onclick="setCalFilter('${f.id}')" class="cal-pill-btn shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                    isActive 
                        ? 'active' 
                        : 'custom-bg-input custom-text-secondary hover:custom-text'
                }">
                    <i class="fa-solid ${f.icon} text-[10px]"></i>
                    <span>${f.label}</span>
                    <span class="text-[9px] px-1.5 py-0.2 rounded-md ${isActive ? 'bg-white/20 text-white' : 'custom-bg-card opacity-70'}">${f.count}</span>
                </button>
            `;
        }).join("");
    }

    // ==========================================
    // 5. VẼ LƯỚI LỊCH THÁNG (MONTH GRID)
    // ==========================================
    function renderCalGridView(year, month) {
        const gridBox = document.getElementById("cal-grid");
        if (!gridBox) return;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let emptyCells = firstDay === 0 ? 6 : firstDay - 1;

        let html = "";
        for (let i = 0; i < emptyCells; i++) {
            html += `<div class="aspect-square rounded-2xl bg-transparent pointer-events-none opacity-20"></div>`;
        }

        const todayStr = new Date().toISOString().split('T')[0];

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === window.calSelectedDate;
            const dayOfWeek = new Date(year, month, d).getDay(); // 0 is Sunday

            // Lọc dữ liệu ngày
            const dayTasks = (state.tasks || []).filter(t => t.date && t.date.startsWith(dateStr));
            const dayDebts = (state.debts || []).filter(db => db.status === "active" && db.dueDate === dateStr);
            const dayRuns = (state.runs || []).filter(r => r.date && r.date.startsWith(dateStr));
            const dayTrips = (state.trips || []).filter(tr => dateStr >= tr.startDate && dateStr <= tr.endDate);
            const dayTxs = (state.transactions || []).filter(tx => tx.date && tx.date.startsWith(dateStr) && tx.category !== "transfer");
            const dayDiary = (state.diaryNotes || []).filter(n => n.date === dateStr && n.text);

            // Tính toán thu/chi ngày
            const dayExpense = dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0);
            const dayIncome = dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + (Number(t.amount) || 0), 0);

            // Chấm màu theo bộ lọc
            let dotsHtml = "";
            const showAll = window.calFilterType === 'all';

            if ((showAll || window.calFilterType === 'tasks') && dayTasks.length)
                dotsHtml += `<div class="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm" title="${dayTasks.length} việc"></div>`;
            if ((showAll || window.calFilterType === 'debts') && dayDebts.length)
                dotsHtml += `<div class="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm animate-pulse" title="Hạn nợ"></div>`;
            if ((showAll || window.calFilterType === 'trips') && dayTrips.length)
                dotsHtml += `<div class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" title="Chuyến đi"></div>`;
            if ((showAll || window.calFilterType === 'runs') && dayRuns.length)
                dotsHtml += `<div class="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-sm" title="Chạy bộ"></div>`;
            if ((showAll || window.calFilterType === 'txs') && dayTxs.length)
                dotsHtml += `<div class="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-sm" title="Thu chi"></div>`;
            if ((showAll || window.calFilterType === 'diary') && dayDiary.length)
                dotsHtml += `<div class="w-1.5 h-1.5 rounded-full bg-pink-400 shadow-sm" title="Nhật ký"></div>`;

            // Badge tóm tắt tiền mặt
            let cashflowBadge = "";
            if (dayExpense > 0) {
                cashflowBadge = `<span class="text-[9px] font-black text-rose-500 truncate leading-none">-${formatCompactMoney(dayExpense)}</span>`;
            } else if (dayIncome > 0) {
                cashflowBadge = `<span class="text-[9px] font-black text-emerald-500 truncate leading-none">+${formatCompactMoney(dayIncome)}</span>`;
            }

            let cellClass = "cal-cell-glass";
            if (isSelected) {
                cellClass += " cal-cell-selected";
            } else if (isToday) {
                cellClass += " cal-cell-today";
            }

            html += `
                <div onclick="selectCalDay('${dateStr}')" class="aspect-square p-1 sm:p-2 flex flex-col justify-between ${cellClass}">
                    <div class="flex items-center justify-between w-full">
                        <span class="text-xs sm:text-sm font-black ${isSelected ? 'text-white' : (dayOfWeek === 0 ? 'text-rose-500' : 'custom-text')}">${d}</span>
                        ${isToday && !isSelected ? `<span class="text-[8px] font-black uppercase px-1 rounded-md bg-primary-500/20 text-primary-500">Nay</span>` : ''}
                    </div>

                    <div class="w-full text-center my-auto overflow-hidden hidden sm:block">
                        ${isSelected ? '' : cashflowBadge}
                    </div>

                    <div class="flex gap-1 justify-center flex-wrap w-full mt-auto pt-0.5">
                        ${dotsHtml}
                    </div>
                </div>
            `;
        }

        gridBox.innerHTML = html;
        gridBox.classList.remove("hidden");

        const agendaBox = document.getElementById("cal-agenda-list");
        if (agendaBox) agendaBox.classList.add("hidden");
    }

    // ==========================================
    // 6. VẼ CHẾ ĐỘ LỊCH TRÌNH (AGENDA STREAM)
    // ==========================================
    function renderCalAgendaView(year, month) {
        const gridBox = document.getElementById("cal-grid");
        if (gridBox) gridBox.classList.add("hidden");

        const agendaBox = document.getElementById("cal-agenda-list");
        if (!agendaBox) return;

        agendaBox.classList.remove("hidden");
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let agendaHtml = "";

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const dayTxs = (state.transactions || []).filter(tx => tx.date && tx.date.startsWith(dateStr) && tx.category !== "transfer");
            const dayTasks = (state.tasks || []).filter(t => t.date && t.date.startsWith(dateStr));
            const dayDebts = (state.debts || []).filter(db => db.status === "active" && db.dueDate === dateStr);
            const dayRuns = (state.runs || []).filter(r => r.date && r.date.startsWith(dateStr));
            const dayTrips = (state.trips || []).filter(tr => dateStr >= tr.startDate && dateStr <= tr.endDate);
            const dayDiary = (state.diaryNotes || []).filter(n => n.date === dateStr && n.text);

            const totalEv = dayTxs.length + dayTasks.length + dayDebts.length + dayRuns.length + dayTrips.length + dayDiary.length;
            if (totalEv === 0) continue;

            const isSelected = dateStr === window.calSelectedDate;
            const dayOfWeekStr = new Date(year, month, d).toLocaleDateString("vi-VN", { weekday: 'short' });

            agendaHtml += `
                <div onclick="selectCalDay('${dateStr}')" class="p-3.5 rounded-2xl border custom-border mb-2.5 cursor-pointer transition-all ${isSelected ? 'cal-cell-selected' : 'custom-bg-card hover:bg-black/5 dark:hover:bg-white/5'} flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl ${isSelected ? 'bg-white/20 text-white' : 'custom-bg-input text-primary-500'} flex flex-col items-center justify-center font-black leading-tight">
                            <span class="text-xs uppercase">${dayOfWeekStr}</span>
                            <span class="text-sm">${d}</span>
                        </div>
                        <div>
                            <p class="text-xs font-black ${isSelected ? 'text-white' : 'custom-text'}">${totalEv} hoạt động ghi nhận</p>
                            <p class="text-[10px] font-bold ${isSelected ? 'text-white/80' : 'custom-text-secondary'}">Ngày ${d}/${month + 1}/${year}</p>
                        </div>
                    </div>
                    <i class="fa-solid fa-chevron-right text-xs opacity-50"></i>
                </div>
            `;
        }

        if (!agendaHtml) {
            agendaHtml = `
                <div class="text-center py-12 opacity-60">
                    <i class="fa-solid fa-calendar-xmark text-4xl mb-3 text-primary-500"></i>
                    <p class="text-xs font-bold custom-text-secondary">Tháng này chưa có lịch trình hoặc hoạt động nào!</p>
                </div>
            `;
        }

        agendaBox.innerHTML = agendaHtml;
    }

    // ==========================================
    // 7. CHI TIẾT SỰ KIỆN TRONG NGÀY (SELECTED DAY)
    // ==========================================
    window.showDayEvents = (dateStr) => {
        window.calSelectedDate = dateStr;
        const detailBox = document.getElementById("cal-day-detail");
        const contentBox = document.getElementById("cdd-content");
        if (!detailBox || !contentBox) return;

        const parts = dateStr.split("-");
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);

        const dateObj = new Date(y, m - 1, d);
        const dayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
        const dayName = dayNames[dateObj.getDay()];

        // Lọc toàn bộ sự kiện của ngày
        let dayTasks = (state.tasks || []).filter(t => t.date && t.date.startsWith(dateStr));
        let dayDebts = (state.debts || []).filter(db => db.status === "active" && db.dueDate === dateStr);
        let dayRuns = (state.runs || []).filter(r => r.date && r.date.startsWith(dateStr));
        let dayTrips = (state.trips || []).filter(tr => dateStr >= tr.startDate && dateStr <= tr.endDate);
        let dayTxs = (state.transactions || []).filter(tx => tx.date && tx.date.startsWith(dateStr) && tx.category !== "transfer");
        let dayDiary = (state.diaryNotes || []).find(n => n.date === dateStr);

        // Áp dụng bộ lọc
        if (window.calFilterType === 'txs') {
            dayTasks = []; dayDebts = []; dayRuns = []; dayTrips = []; dayDiary = null;
        } else if (window.calFilterType === 'tasks') {
            dayTxs = []; dayDebts = []; dayRuns = []; dayTrips = []; dayDiary = null;
        } else if (window.calFilterType === 'debts') {
            dayTxs = []; dayTasks = []; dayRuns = []; dayTrips = []; dayDiary = null;
        } else if (window.calFilterType === 'runs') {
            dayTxs = []; dayTasks = []; dayDebts = []; dayTrips = []; dayDiary = null;
        } else if (window.calFilterType === 'trips') {
            dayTxs = []; dayTasks = []; dayDebts = []; dayRuns = []; dayDiary = null;
        } else if (window.calFilterType === 'diary') {
            dayTxs = []; dayTasks = []; dayDebts = []; dayRuns = []; dayTrips = [];
        }

        // Tính tổng ngày
        const dayExpense = dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0);
        const dayIncome = dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + (Number(t.amount) || 0), 0);
        const totalItems = dayTxs.length + dayTasks.length + dayDebts.length + dayRuns.length + dayTrips.length + (dayDiary && dayDiary.text ? 1 : 0);

        // Header Chi Tiết Ngày
        const titleEl = document.getElementById("cdd-title");
        if (titleEl) {
            titleEl.innerHTML = `
                <div class="flex items-center justify-between flex-wrap gap-2 w-full">
                    <div class="flex items-center gap-2.5">
                        <div class="w-9 h-9 rounded-2xl bg-primary-500/15 text-primary-500 flex items-center justify-center text-sm shadow-sm">
                            <i class="fa-solid fa-calendar-day"></i>
                        </div>
                        <div>
                            <h3 class="font-black text-sm sm:text-base custom-text leading-tight">${dayName}, ${d}/${m}/${y}</h3>
                            <div class="flex items-center gap-2 text-[10px] font-bold custom-text-secondary mt-0.5">
                                ${dayIncome > 0 ? `<span class="text-emerald-500 font-black">+${formatMoney(dayIncome)}</span>` : ''}
                                ${dayExpense > 0 ? `<span class="text-rose-500 font-black">-${formatMoney(dayExpense)}</span>` : ''}
                                <span>${totalItems} hoạt động</span>
                            </div>
                        </div>
                    </div>

                    <!-- 3 Nút Hành Động Nhanh Cho Ngày Này -->
                    <div class="flex items-center gap-1.5 ml-auto">
                        <button onclick="openCalAddTx('${dateStr}')" class="px-2.5 py-1.5 rounded-xl bg-primary-500 text-white text-[10px] font-black shadow-sm active:scale-95 transition-all flex items-center gap-1">
                            <i class="fa-solid fa-plus text-[9px]"></i> Thu / Chi
                        </button>
                        <button onclick="openCalAddTask('${dateStr}')" class="px-2.5 py-1.5 rounded-xl custom-bg-input custom-text text-[10px] font-black border custom-border active:scale-95 transition-all flex items-center gap-1">
                            <i class="fa-solid fa-list-check text-[9px] text-blue-500"></i> Việc
                        </button>
                        <button onclick="toggleCalDiaryInput('${dateStr}')" class="w-8 h-8 rounded-xl custom-bg-input text-pink-500 flex items-center justify-center text-xs border custom-border active:scale-95 transition-all" title="Viết nhật ký ngày này">
                            <i class="fa-solid fa-pen-nib"></i>
                        </button>
                    </div>
                </div>
            `;
        }

        let html = "";

        // KHUNG NHẬP NHẬT KÝ INLINE CỦA NGÀY (Ẩn mặc định, bật khi bấm bút hoặc nếu đã có text)
        const noteText = dayDiary && dayDiary.text ? dayDiary.text : "";
        html += `
            <div id="cal-inline-diary-box" class="${noteText ? '' : 'hidden'} p-3.5 mb-3 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 border border-purple-500/20 shadow-sm relative">
                <div class="flex items-center justify-between mb-1.5">
                    <span class="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                        <i class="fa-solid fa-quote-left text-xs"></i> Nhật ký & Cảm xúc ngày này
                    </span>
                    <button onclick="document.getElementById('cal-inline-diary-box').classList.add('hidden')" class="w-5 h-5 rounded-full custom-bg-input text-[10px] custom-text-secondary flex items-center justify-center">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <textarea id="cal-diary-input-${dateStr}" rows="2" placeholder="Hôm nay có điều gì đáng nhớ, tâm trạng ra sao?..." class="w-full bg-white/60 dark:bg-black/30 p-2.5 rounded-xl font-medium custom-text border custom-border text-xs resize-none outline-none focus:ring-1 focus:ring-purple-500/40">${noteText}</textarea>
                <div class="flex justify-end gap-2 mt-2">
                    <button onclick="saveCalDiaryNote('${dateStr}')" class="px-3 py-1 rounded-xl bg-purple-600 text-white font-bold text-[10px] shadow-sm active:scale-95 transition-all">Lưu Nhật Ký</button>
                </div>
            </div>
        `;

        // 1. CHUYẾN ĐI
        dayTrips.forEach(tr => {
            html += `
                <div class="cal-kpi-bento p-3.5 flex items-center gap-3 cursor-pointer group" onclick="switchView('trips')">
                    <div class="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-lg shrink-0 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                        <i class="fa-solid fa-plane-departure"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="font-black text-xs sm:text-sm custom-text truncate leading-tight">${tr.name}</p>
                        <p class="text-[10px] font-bold text-emerald-500 mt-0.5 uppercase tracking-wide">
                            ${tr.startDate.split('-').reverse().join('/')} ➔ ${tr.endDate.split('-').reverse().join('/')}
                        </p>
                    </div>
                    <i class="fa-solid fa-chevron-right text-xs custom-text-secondary opacity-60"></i>
                </div>
            `;
        });

        // 2. HẠN NỢ & VAY
        dayDebts.forEach(db => {
            const isLend = db.type === 'lend';
            const remain = db.amount - (db.paidAmount || 0);
            html += `
                <div class="cal-kpi-bento p-3.5 flex items-center gap-3 cursor-pointer group" onclick="switchView('debts')">
                    <div class="w-11 h-11 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center text-lg shrink-0 border border-rose-500/20 group-hover:scale-105 transition-transform">
                        <i class="fa-solid fa-handshake"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="font-black text-xs sm:text-sm custom-text truncate leading-tight">
                            Hạn chót: ${isLend ? 'Thu nợ từ' : 'Trả nợ cho'} <span class="text-rose-500">${db.person}</span>
                        </p>
                        <p class="text-[10px] font-bold custom-text-secondary mt-0.5">Khoản vay còn lại</p>
                    </div>
                    <p class="font-black text-xs sm:text-sm text-rose-500 shrink-0">${formatMoney(remain)}</p>
                </div>
            `;
        });

        // 3. CÔNG VIỆC (CHECKBOX TICK ĐƯỢC TRỰC TIẾP TRÊN LỊCH)
        dayTasks.forEach(t => {
            let tTime = "";
            if (t.date.includes("T")) tTime = t.date.split("T")[1].substring(0, 5);
            else if (t.date.includes(" ")) tTime = t.date.split(" ")[1].substring(0, 5);

            html += `
                <div class="cal-kpi-bento p-3.5 flex items-center gap-3 ${t.isCompleted ? 'opacity-60' : ''}">
                    <button onclick="toggleCalTask('${t.id}')" class="w-10 h-10 rounded-2xl ${t.isCompleted ? 'bg-emerald-500 text-white' : 'custom-bg-input text-blue-500 border custom-border'} flex items-center justify-center text-base shrink-0 active:scale-90 transition-all shadow-sm" title="${t.isCompleted ? 'Bấm để hủy hoàn thành' : 'Bấm để hoàn thành'}">
                        <i class="fa-solid ${t.isCompleted ? 'fa-check' : 'fa-circle'} text-xs"></i>
                    </button>
                    <div class="flex-1 min-w-0 cursor-pointer" onclick="switchView('tasks')">
                        <p class="font-black text-xs sm:text-sm custom-text truncate leading-tight ${t.isCompleted ? 'line-through opacity-70' : ''}">${t.name}</p>
                        <p class="text-[10px] font-bold custom-text-secondary mt-0.5 flex items-center gap-1.5">
                            <i class="fa-regular fa-clock text-[9px] text-blue-500"></i> ${tTime || "Cả ngày"}
                            ${t.priority ? `• <span class="text-amber-500 font-bold uppercase">${t.priority}</span>` : ''}
                        </p>
                    </div>
                    ${t.amount ? `<p class="font-black text-xs sm:text-sm text-blue-500 shrink-0">${formatMoney(t.amount)}</p>` : ''}
                </div>
            `;
        });

        // 4. CHẠY BỘ
        dayRuns.forEach(r => {
            html += `
                <div class="cal-kpi-bento p-3.5 flex items-center gap-3 cursor-pointer group" onclick="switchView('running')">
                    <div class="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-lg shrink-0 border border-amber-500/20 group-hover:scale-105 transition-transform">
                        <i class="fa-solid fa-person-running"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="font-black text-xs sm:text-sm custom-text truncate leading-tight">Chạy bộ ${r.distance.toFixed(2)} km</p>
                        <p class="text-[10px] font-bold custom-text-secondary mt-0.5">
                            Pace: ${typeof formatPace === 'function' ? formatPace(r.pace) : r.pace} • Đốt: ${Math.round(r.calories)} kcal
                        </p>
                    </div>
                    <i class="fa-solid fa-chevron-right text-xs custom-text-secondary opacity-60"></i>
                </div>
            `;
        });

        // 5. THU CHI (CARD LIQUID GLASS VỚI CÁC ACTION ĐẦY ĐỦ)
        dayTxs.forEach(tx => {
            const isInc = tx.type === "income";
            const cat = (state.categories || []).find(c => c.id === tx.category) || { name: "Khác", icon: "📦" };

            let txTime = "";
            if (tx.date.includes("T")) txTime = tx.date.split("T")[1].substring(0, 5);
            else if (tx.date.includes(" ")) txTime = tx.date.split(" ")[1].substring(0, 5);

            const imgHtml = (tx.image && tx.image.length > 50)
                ? `<img src="${tx.image}" class="w-full h-full object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity" onclick="event.stopPropagation(); if (typeof openImageModal === 'function') openImageModal(this.src);">`
                : `<span class="text-xl">${cat.icon}</span>`;

            html += `
                <div class="cal-kpi-bento p-3.5 flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.99] transition-all" onclick="if (typeof openModal === 'function') openModal('transaction', '${tx.id}');">
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="w-11 h-11 rounded-2xl ${isInc ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/15 text-rose-500 border border-rose-500/20'} flex items-center justify-center shrink-0 shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                            ${imgHtml}
                        </div>
                        <div class="min-w-0">
                            <p class="font-black text-xs sm:text-sm custom-text truncate leading-tight group-hover:text-primary-500 transition-colors">
                                ${tx.note || cat.name}
                            </p>
                            <p class="text-[10px] font-bold custom-text-secondary mt-0.5 flex items-center gap-1.5 truncate">
                                <span class="px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 font-bold">${cat.name}</span>
                                <span><i class="fa-regular fa-clock text-[9px]"></i> ${txTime || '--:--'}</span>
                                ${tx.locationName ? `<span class="truncate max-w-[100px]"><i class="fa-solid fa-location-dot text-rose-500 text-[9px]"></i> ${tx.locationName.split(',')[0]}</span>` : ''}
                            </p>
                        </div>
                    </div>
                    <div class="text-right shrink-0 ml-2">
                        <p class="font-black text-xs sm:text-sm ${isInc ? 'text-emerald-500' : 'text-rose-500'}">
                            ${isInc ? '+' : '-'}${formatMoney(tx.amount)}
                        </p>
                    </div>
                </div>
            `;
        });

        // EMPTY STATE BENTO SANG TRỌNG NẾU KHÔNG CÓ HOẠT ĐỘNG
        if (totalItems === 0) {
            html += `
                <div class="cal-kpi-bento p-8 text-center flex flex-col items-center justify-center">
                    <div class="w-16 h-16 rounded-3xl bg-primary-500/10 text-primary-500 flex items-center justify-center text-3xl mb-3 border border-primary-500/20 shadow-inner">
                        <i class="fa-solid fa-calendar-check"></i>
                    </div>
                    <h4 class="font-black text-sm custom-text mb-1">Chưa có hoạt động nào trong ngày này</h4>
                    <p class="text-xs font-bold custom-text-secondary max-w-xs mb-4">Bạn có thể ghi chép một khoản chi tiêu hoặc tạo công việc cần làm ngay bên dưới!</p>
                    <div class="flex items-center gap-2">
                        <button onclick="openCalAddTx('${dateStr}')" class="px-4 py-2 rounded-2xl bg-primary-500 text-white font-black text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5">
                            <i class="fa-solid fa-plus"></i> Ghi Chi Tiêu
                        </button>
                        <button onclick="openCalAddTask('${dateStr}')" class="px-4 py-2 rounded-2xl custom-bg-input custom-text font-black text-xs border custom-border active:scale-95 transition-all flex items-center gap-1.5">
                            <i class="fa-solid fa-list-check text-blue-500"></i> Thêm Việc
                        </button>
                    </div>
                </div>
            `;
        }

        contentBox.innerHTML = html;
        detailBox.classList.remove("hidden");
    };

    // ==========================================
    // 8. CÁC HÀM XỬ LÝ NHANH (QUICK ACTIONS)
    // ==========================================
    window.openCalAddTx = (dateStr) => {
        if (typeof openModal === 'function') {
            openModal('transaction');
            setTimeout(() => {
                const dateInput = document.getElementById("m-date");
                if (dateInput) {
                    const now = new Date();
                    const hh = String(now.getHours()).padStart(2, '0');
                    const mm = String(now.getMinutes()).padStart(2, '0');
                    dateInput.value = `${dateStr}T${hh}:${mm}`;
                }
            }, 60);
        }
    };

    window.openCalAddTask = (dateStr) => {
        if (typeof openModal === 'function') {
            openModal('task');
            setTimeout(() => {
                const dateInput = document.getElementById("task-date");
                if (dateInput) {
                    const now = new Date();
                    const hh = String(now.getHours()).padStart(2, '0');
                    const mm = String(now.getMinutes()).padStart(2, '0');
                    dateInput.value = `${dateStr}T${hh}:${mm}`;
                }
            }, 60);
        }
    };

    window.toggleCalDiaryInput = (dateStr) => {
        const box = document.getElementById("cal-inline-diary-box");
        if (box) {
            box.classList.toggle("hidden");
            if (!box.classList.contains("hidden")) {
                const textarea = document.getElementById(`cal-diary-input-${dateStr}`);
                if (textarea) textarea.focus();
            }
        }
    };

    window.saveCalDiaryNote = (dateStr) => {
        const textarea = document.getElementById(`cal-diary-input-${dateStr}`);
        if (!textarea) return;
        const text = textarea.value.trim();

        if (!state.diaryNotes) state.diaryNotes = [];
        const idx = state.diaryNotes.findIndex(n => n.date === dateStr);

        if (idx > -1) {
            if (text === "") state.diaryNotes.splice(idx, 1);
            else state.diaryNotes[idx].text = text;
        } else {
            if (text !== "") {
                state.diaryNotes.push({
                    id: (typeof generateId === 'function') ? generateId() : Math.random().toString(36).substr(2, 9),
                    date: dateStr,
                    text: text
                });
            }
        }

        if (typeof saveData === 'function') saveData();
        if (typeof playSound === 'function') playSound("success");
        renderCalendar();
    };

    window.toggleCalTask = (taskId) => {
        if (!state.tasks) return;
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
            task.isCompleted = !task.isCompleted;
            if (typeof saveData === 'function') saveData();
            if (typeof playSound === 'function') playSound("pop");
            renderCalendar();
        }
    };

})();
