// ==============================================================
// FILE: tasks-pro.js - ULTRA TASK & DEADLINE BENTO PRODUCTIVITY
// Quản Lý Công Việc, Deadline & Nhiệm Vụ Siêu Cấp Cho FinMaster
// ==============================================================

(function initTasksProModule() {
  window.taskCalDate = new Date();
  window.taskSelectedDate = (typeof getToday === 'function' ? getToday() : new Date().toISOString()).split('T')[0];
  window.taskActiveTab = 'selected_day'; // 'selected_day', 'today', 'overdue', 'upcoming', 'done'
  window.taskViewMode = 'calendar'; // 'calendar', 'list'
  window.taskSearchQuery = '';

  // 1. NHÚNG STYLE CSS CHUYÊN BIỆT CHO BENTO TASKS & CALENDAR
  const taskStyles = `
    /* Bento Glass Card cho Task */
    .task-bento-glass {
      background: var(--bg-card, rgba(255, 255, 255, 0.9));
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--border-color, rgba(226, 232, 240, 0.8));
      transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
    }
    .task-bento-glass:hover {
      border-color: color-mix(in srgb, var(--icon-active, #6366f1) 40%, transparent);
      box-shadow: 0 12px 30px -8px var(--theme-glow, rgba(99, 102, 241, 0.25));
      transform: translateY(-2px);
    }

    /* Shimmer Bar */
    @keyframes taskLiquidShimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
    .task-shimmer-bar {
      position: relative;
      overflow: hidden;
    }
    .task-shimmer-bar::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
      transform: translateX(-100%);
      animation: taskLiquidShimmer 2.4s infinite ease-in-out;
    }

    /* Pulse Alert cho việc quá hạn */
    @keyframes taskAlertPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.4); }
      50% { box-shadow: 0 0 16px 3px rgba(244, 63, 94, 0.25); }
    }
    .task-card-overdue {
      animation: taskAlertPulse 3s infinite ease-in-out;
      border-color: rgba(244, 63, 94, 0.6) !important;
    }

    /* Filter Pill */
    .task-filter-pill {
      padding: 0.45rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      transition: all 0.2s ease;
      border: 1px solid transparent;
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      cursor: pointer;
      user-select: none;
      background: var(--bg-input, rgba(241, 245, 249, 0.7));
      color: var(--text-secondary, #64748b);
      white-space: nowrap;
    }
    .task-filter-pill:hover {
      color: var(--text-primary, #0f172a);
      transform: scale(1.02);
    }
    .task-filter-pill.active {
      background: var(--bg-primary-soft, rgba(99, 102, 241, 0.15));
      color: var(--icon-active, #6366f1);
      border-color: color-mix(in srgb, var(--icon-active, #6366f1) 45%, transparent);
      box-shadow: 0 2px 10px -2px var(--theme-glow, rgba(99, 102, 241, 0.3));
    }
  `;

  let styleEl = document.getElementById('tasks-pro-styles');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'tasks-pro-styles';
    styleEl.innerHTML = taskStyles;
    document.head.appendChild(styleEl);
  }

  // ==============================================================
  // 2. ĐIỀU HƯỚNG THỜI GIAN & TAB BỘ LỌC
  // ==============================================================
  window.changeTaskMonth = function(dir) {
    window.taskCalDate.setMonth(window.taskCalDate.getMonth() + dir);
    renderTasks();
    if (typeof playSound === 'function') playSound("click");
  };

  window.jumpTaskToday = function() {
    window.taskCalDate = new Date();
    window.taskSelectedDate = (typeof getToday === 'function' ? getToday() : new Date().toISOString()).split('T')[0];
    window.taskActiveTab = 'selected_day';
    renderTasks();
    if (typeof playSound === 'function') playSound("pop");
  };

  window.selectTaskDate = function(dateStr) {
    window.taskSelectedDate = dateStr;
    window.taskActiveTab = 'selected_day';
    renderTasks();
    if (typeof playSound === 'function') playSound("click");
  };

  window.setTaskTab = function(tabName) {
    window.taskActiveTab = tabName;
    renderTasks();
    if (typeof playSound === 'function') playSound("click");
  };

  window.setTaskViewMode = function(mode) {
    window.taskViewMode = mode;
    renderTasks();
    if (typeof playSound === 'function') playSound("pop");
  };

  window.onTaskSearch = function(query) {
    window.taskSearchQuery = (query || '').trim().toLowerCase();
    renderTasks();
  };

  // ==============================================================
  // 3. THÊM NHANH CÔNG VIỆC 1-CLICK (QUICK ADD TASK)
  // ==============================================================
  window.quickAddTask = function(name, type = 'normal', amount = 0, dateStr = null) {
    if (!state.tasks) state.tasks = [];

    const targetDateStr = dateStr || window.taskSelectedDate || (typeof getToday === 'function' ? getToday().split('T')[0] : new Date().toISOString().split('T')[0]);
    const nowTime = new Date().toTimeString().split(' ')[0].substring(0, 5);
    const fullDate = `${targetDateStr}T${nowTime}`;

    state.tasks.push({
      id: generateId(),
      name: name,
      type: type, // 'normal', 'expense', 'income'
      amount: amount,
      date: fullDate,
      isCompleted: false
    });

    if (typeof addLog === 'function') {
      addLog("Tạo công việc", `${name} (${targetDateStr})`);
    }

    saveData();
    renderTasks();
    if (typeof renderDashboard === 'function') renderDashboard();

    if (typeof playSound === 'function') playSound("pop");
  };

  // Xử lý submit thanh gõ nhanh
  window.submitQuickTaskBar = function(e) {
    e.preventDefault();
    const input = document.getElementById('input-quick-task-name');
    if (!input || !input.value.trim()) return;

    const name = input.value.trim();
    const type = document.getElementById('select-quick-task-type')?.value || 'normal';

    let amount = 0;
    if (type !== 'normal') {
      const amtInput = prompt("Nhập số tiền dự kiến (VNĐ):", "0");
      if (amtInput) {
        amount = typeof getRawNumber === 'function' ? getRawNumber(amtInput) : parseInt(amtInput.replace(/\D/g, '') || 0);
      }
    }

    window.quickAddTask(name, type, amount, window.taskSelectedDate);
    input.value = '';
  };

  // ==============================================================
  // 4. HÀM CHÍNH: RENDER TOÀN BỘ GIAO DIỆN CÔNG VIỆC (BENTO TASKS)
  // ==============================================================
  window.renderTasks = function() {
    const root = document.getElementById("view-tasks");
    if (!root) return;

    if (!state.tasks) state.tasks = [];

    const todayStr = (typeof getToday === 'function' ? getToday() : new Date().toISOString()).split('T')[0];
    const selDateStr = window.taskSelectedDate || todayStr;

    const calYear = window.taskCalDate.getFullYear();
    const calMonth = window.taskCalDate.getMonth();

    const isThisMonth = (new Date().getFullYear() === calYear && new Date().getMonth() === calMonth);

    // Tính toán các chỉ số thống kê
    let todayTasksCount = 0;
    let todayCompletedCount = 0;
    let totalCompleted = 0;
    let overdueCount = 0;
    let upcomingCount = 0;

    state.tasks.forEach(t => {
      const tDate = t.date ? t.date.split('T')[0] : '';
      if (t.isCompleted) {
        totalCompleted++;
      } else {
        if (tDate < todayStr) {
          overdueCount++;
        } else if (tDate === todayStr) {
          todayTasksCount++;
        } else {
          upcomingCount++;
        }
      }

      if (tDate === todayStr) {
        if (t.isCompleted) todayCompletedCount++;
      }
    });

    const todayTotal = todayTasksCount + todayCompletedCount;
    const todayPct = todayTotal > 0 ? Math.round((todayCompletedCount / todayTotal) * 100) : 0;
    const monthCompletionPct = state.tasks.length > 0 ? Math.round((totalCompleted / state.tasks.length) * 100) : 0;

    // Lọc danh sách công việc hiển thị bên dưới
    let displayTasks = [];
    let sectionTitle = "";
    let sectionSubtitle = "";

    if (window.taskActiveTab === 'selected_day') {
      displayTasks = state.tasks.filter(t => t.date && t.date.startsWith(selDateStr));
      const [sy, sm, sd] = selDateStr.split('-');
      sectionTitle = `Công Việc Ngày ${sd}/${sm}/${sy}`;
      sectionSubtitle = selDateStr === todayStr ? 'Hôm nay' : '';
    } else if (window.taskActiveTab === 'today') {
      displayTasks = state.tasks.filter(t => t.date && t.date.startsWith(todayStr));
      sectionTitle = "Công Việc Hôm Nay";
      sectionSubtitle = "Các việc cần xử lý trong ngày";
    } else if (window.taskActiveTab === 'overdue') {
      displayTasks = state.tasks.filter(t => !t.isCompleted && t.date && t.date.split('T')[0] < todayStr);
      sectionTitle = "Việc Quá Hạn Deadline";
      sectionSubtitle = "Cần ưu tiên xử lý ngay";
    } else if (window.taskActiveTab === 'upcoming') {
      displayTasks = state.tasks.filter(t => !t.isCompleted && t.date && t.date.split('T')[0] > todayStr);
      sectionTitle = "Kế Hoạch Sắp Tới";
      sectionSubtitle = "Các công việc trong tương lai";
    } else if (window.taskActiveTab === 'done') {
      displayTasks = state.tasks.filter(t => t.isCompleted);
      sectionTitle = "Việc Đã Hoàn Thành";
      sectionSubtitle = "Lịch sử các mục tiêu đã xong";
    }

    // Lọc tìm kiếm nếu có
    if (window.taskSearchQuery) {
      displayTasks = displayTasks.filter(t => t.name.toLowerCase().includes(window.taskSearchQuery));
    }

    // Sắp xếp: việc chưa xong lên trước, ưu tiên theo giờ
    displayTasks.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      return new Date(a.date) - new Date(b.date);
    });

    // ==============================================================
    // BẮT ĐẦU DỰNG HTML GIAO DIỆN BENTO
    // ==============================================================
    let html = `
      <div class="space-y-4 sm:space-y-5 pb-24">

        <!-- 1. SPATIAL TOP HERO HEADER -->
        <header class="flex items-center justify-between gap-2 p-2 rounded-2xl sm:rounded-3xl custom-bg-card border custom-border custom-shadow-sm">
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black bg-primary-500/15 text-primary-500 border border-primary-500/25">
              <i class="fa-solid fa-clipboard-list"></i> <span class="hidden sm:inline">Công Việc</span>
            </span>
          </div>

          <!-- Chế độ Xem: Lịch vs Danh Sách & Nút Thêm Việc -->
          <div class="flex items-center gap-1.5 sm:gap-2">
            <div class="flex items-center gap-1 bg-black/5 dark:bg-white/10 p-1 rounded-2xl shrink-0">
              <button onclick="setTaskViewMode('calendar')" 
                class="px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${window.taskViewMode === 'calendar' ? 'custom-primary text-white shadow-sm' : 'custom-text-secondary hover:custom-text'}" 
                title="Xem theo Lịch">
                <i class="fa-solid fa-calendar-days"></i>
              </button>
              <button onclick="setTaskViewMode('list')" 
                class="px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${window.taskViewMode === 'list' ? 'custom-primary text-white shadow-sm' : 'custom-text-secondary hover:custom-text'}" 
                title="Xem danh sách">
                <i class="fa-solid fa-list-check"></i>
              </button>
            </div>

            <!-- Nút Tạo Mới -->
            <button onclick="openModal('task')" 
              class="py-2.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl custom-primary text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-primary-500/25 hover:scale-105 active:scale-95 transition-all shrink-0">
              <i class="fa-solid fa-plus"></i> <span class="hidden sm:inline">Thêm Việc</span>
            </button>
          </div>
        </header>

        <!-- 2. HERO LIQUID BENTO: 4 CHỈ SỐ NĂNG SUẤT -->
        <div class="task-bento-glass rounded-3xl p-5 sm:p-6 custom-shadow-md">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
            <!-- Hôm nay -->
            <div onclick="setTaskTab('today')" class="p-4 rounded-2xl custom-bg-input border custom-border flex flex-col justify-between cursor-pointer hover:border-primary-500/50 transition-all">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] font-black uppercase tracking-wider text-primary-500">Hôm Nay</span>
                <div class="w-7 h-7 rounded-xl bg-primary-500/15 text-primary-500 flex items-center justify-center text-xs font-black">
                  <i class="fa-solid fa-calendar-day"></i>
                </div>
              </div>
              <div class="text-xl sm:text-2xl font-black custom-text tracking-tight">${todayTasksCount} việc</div>
              <div class="text-[10px] font-bold custom-text-secondary mt-1">Đã xong ${todayCompletedCount}/${todayTotal}</div>
            </div>

            <!-- Quá hạn -->
            <div onclick="setTaskTab('overdue')" class="p-4 rounded-2xl custom-bg-input border custom-border flex flex-col justify-between cursor-pointer hover:border-rose-500/50 transition-all ${overdueCount > 0 ? 'bg-rose-500/10 border-rose-500/30' : ''}">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] font-black uppercase tracking-wider text-rose-500">Quá Hạn</span>
                <div class="w-7 h-7 rounded-xl ${overdueCount > 0 ? 'bg-rose-500 text-white animate-pulse' : 'bg-rose-500/15 text-rose-500'} flex items-center justify-center text-xs font-black">
                  <i class="fa-solid fa-clock-rotate-left"></i>
                </div>
              </div>
              <div class="text-xl sm:text-2xl font-black ${overdueCount > 0 ? 'text-rose-500' : 'custom-text'} tracking-tight">${overdueCount} việc</div>
              <div class="text-[10px] font-bold custom-text-secondary mt-1">${overdueCount > 0 ? 'Cần xử lý ngay ⚠️' : 'Không trễ hạn'}</div>
            </div>

            <!-- Sắp tới -->
            <div onclick="setTaskTab('upcoming')" class="p-4 rounded-2xl custom-bg-input border custom-border flex flex-col justify-between cursor-pointer hover:border-blue-500/50 transition-all">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] font-black uppercase tracking-wider text-blue-500">Sắp Tới</span>
                <div class="w-7 h-7 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center text-xs font-black">
                  <i class="fa-solid fa-hourglass-half"></i>
                </div>
              </div>
              <div class="text-xl sm:text-2xl font-black text-blue-500 tracking-tight">${upcomingCount} việc</div>
              <div class="text-[10px] font-bold custom-text-secondary mt-1">Đã lên lịch trước</div>
            </div>

            <!-- Đã hoàn thành -->
            <div onclick="setTaskTab('done')" class="p-4 rounded-2xl custom-bg-input border custom-border flex flex-col justify-between cursor-pointer hover:border-emerald-500/50 transition-all">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] font-black uppercase tracking-wider text-emerald-500">Đã Xong</span>
                <div class="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-xs font-black">
                  <i class="fa-solid fa-circle-check"></i>
                </div>
              </div>
              <div class="text-xl sm:text-2xl font-black text-emerald-500 tracking-tight">${totalCompleted} việc</div>
              <div class="text-[10px] font-bold custom-text-secondary mt-1">Đạt ${monthCompletionPct}% tổng số</div>
            </div>
          </div>

          <!-- Daily Shimmer Progress Bar -->
          <div>
            <div class="flex justify-between items-center text-xs font-bold mb-2">
              <span class="custom-text flex items-center gap-1.5">
                <i class="fa-solid fa-trophy text-amber-500"></i> Tiến độ công việc hôm nay
              </span>
              <span class="custom-text font-black">${todayPct}% (${todayCompletedCount}/${todayTotal} việc)</span>
            </div>
            <div class="relative h-3.5 w-full custom-bg-body rounded-full overflow-hidden border custom-border">
              <div class="h-full rounded-full task-shimmer-bar transition-all duration-700 bg-gradient-to-r from-teal-400 via-emerald-500 to-primary-500" 
                style="width: ${todayPct}%;">
              </div>
            </div>
          </div>
        </div>
    `;

    // 3. NẾU CHẾ ĐỘ XEM LỊCH (CALENDAR VIEW) -> RENDER LƯỚI LỊCH BENTO
    if (window.taskViewMode === 'calendar') {
      const firstDay = new Date(calYear, calMonth, 1).getDay();
      const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
      const emptyCells = firstDay === 0 ? 6 : firstDay - 1;

      html += `
        <div class="task-bento-glass rounded-3xl p-5 sm:p-6 custom-shadow-sm">
          <!-- Month Header Controls -->
          <div class="flex justify-between items-center mb-5">
            <button onclick="changeTaskMonth(-1)" class="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl custom-bg-input flex items-center justify-center custom-text hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-90 transition-all">
              <i class="fa-solid fa-chevron-left text-xs"></i>
            </button>
            <div class="text-center">
              <h3 class="text-base sm:text-lg font-black custom-text uppercase tracking-widest flex items-center justify-center gap-2">
                <span>Tháng ${calMonth + 1}/${calYear}</span>
                ${isThisMonth ? `<span class="w-2 h-2 rounded-full bg-emerald-500"></span>` : ''}
              </h3>
            </div>
            <button onclick="changeTaskMonth(1)" class="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl custom-bg-input flex items-center justify-center custom-text hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-90 transition-all">
              <i class="fa-solid fa-chevron-right text-xs"></i>
            </button>
          </div>

          <!-- Ngày trong tuần Thứ 2 -> CN -->
          <div class="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center text-[11px] font-black custom-text-secondary uppercase">
            <div>T2</div>
            <div>T3</div>
            <div>T4</div>
            <div>T5</div>
            <div>T6</div>
            <div>T7</div>
            <div class="text-rose-500">CN</div>
          </div>

          <!-- Lưới các ô ngày -->
          <div class="grid grid-cols-7 gap-1.5 sm:gap-2">
      `;

      for (let i = 0; i < emptyCells; i++) {
        html += `<div class="aspect-square rounded-2xl bg-transparent"></div>`;
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isToday = (dateStr === todayStr);
        const isSelected = (dateStr === selDateStr);

        // Các task trong ngày
        const dayTasks = state.tasks.filter(t => t.date && t.date.startsWith(dateStr));

        let hasPending = false;
        let hasCompleted = false;
        let hasOverdue = false;

        dayTasks.forEach(t => {
          if (t.isCompleted) hasCompleted = true;
          else {
            if (dateStr < todayStr) hasOverdue = true;
            else hasPending = true;
          }
        });

        let dotsHtml = "";
        if (hasOverdue) dotsHtml += `<span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_6px_#f43f5e]"></span>`;
        if (hasPending) dotsHtml += `<span class="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm"></span>`;
        if (hasCompleted) dotsHtml += `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm"></span>`;

        let cellClasses = "";
        if (isSelected) {
          cellClasses = "ring-2 ring-primary-500 custom-bg-card font-black scale-105 z-10 shadow-md";
        } else if (isToday) {
          cellClasses = "bg-primary-500/20 text-primary-500 border-primary-500/40 font-black";
        } else {
          cellClasses = "custom-bg-input custom-text border custom-border hover:bg-gray-200 dark:hover:bg-gray-700";
        }

        html += `
          <div onclick="selectTaskDate('${dateStr}')" 
            class="aspect-square rounded-2xl flex flex-col items-center justify-between p-1 sm:p-2 border cursor-pointer active:scale-90 transition-all ${cellClasses}">
            <span class="text-xs sm:text-sm font-black ${isToday ? 'text-primary-500' : ''}">${d}</span>
            <div class="flex items-center justify-center gap-1 mt-auto pb-0.5">
              ${dotsHtml}
            </div>
          </div>
        `;
      }

      html += `
          </div> <!-- End grid -->

          <!-- Chú thích chấm màu -->
          <div class="flex items-center justify-center gap-4 mt-5 pt-4 border-t custom-border text-[11px] font-bold custom-text-secondary">
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-blue-500"></span> Chưa xong</span>
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> Đã xong</span>
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-rose-500"></span> Quá hạn</span>
          </div>
        </div>
      `;
    }

    // 4. THANH NHẬP NHANH CÔNG VIỆC (QUICK ADD BAR)
    html += `
      <div class="task-bento-glass rounded-3xl p-4 sm:p-5 custom-shadow-sm">
        <form onsubmit="submitQuickTaskBar(event)" class="flex flex-col sm:flex-row items-center gap-2">
          <div class="relative flex-1 w-full">
            <i class="fa-solid fa-plus-circle absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-primary-500"></i>
            <input 
              type="text" 
              id="input-quick-task-name"
              placeholder="Thêm nhanh việc cần làm cho ngày ${selDateStr.split('-')[2]}/${selDateStr.split('-')[1]}..." 
              required
              class="w-full pl-10 pr-4 py-3 rounded-2xl custom-bg-input border custom-border text-xs sm:text-sm font-bold custom-text outline-none focus:border-primary-500 transition-all"
            />
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <select id="select-quick-task-type" class="py-3 px-3 rounded-2xl custom-bg-input border custom-border text-xs font-bold custom-text outline-none">
              <option value="normal">📌 Việc thường</option>
              <option value="expense">💸 Chi tiền</option>
              <option value="income">💰 Thu tiền</option>
            </select>

            <button type="submit" class="py-3 px-5 rounded-2xl custom-primary text-white font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all whitespace-nowrap flex items-center gap-1.5">
              <i class="fa-solid fa-check"></i> Thêm Nhanh
            </button>
          </div>
        </form>
      </div>

      <!-- 5. DANH SÁCH CÔNG VIỆC THEO TAB & NGÀY ĐANG CHỌN -->
      <div class="task-bento-glass rounded-3xl p-5 sm:p-6 custom-shadow-sm">
        <!-- Sub-tabs bar -->
        <div class="flex items-center justify-between pb-4 mb-4 border-b custom-border gap-2 flex-wrap">
          <div>
            <h3 class="font-black text-sm sm:text-base custom-text flex items-center gap-2">
              <i class="fa-solid fa-clipboard-list text-primary-500"></i> ${sectionTitle}
            </h3>
            ${sectionSubtitle ? `<p class="text-[11px] custom-text-secondary mt-0.5">${sectionSubtitle}</p>` : ''}
          </div>

          <!-- Pills chọn danh sách -->
          <div class="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            <button onclick="setTaskTab('selected_day')" class="task-filter-pill ${window.taskActiveTab === 'selected_day' ? 'active' : ''}">
              Ngày này (${state.tasks.filter(t => t.date && t.date.startsWith(selDateStr)).length})
            </button>
            <button onclick="setTaskTab('today')" class="task-filter-pill ${window.taskActiveTab === 'today' ? 'active' : ''}">
              Hôm nay (${todayTotal})
            </button>
            <button onclick="setTaskTab('overdue')" class="task-filter-pill ${window.taskActiveTab === 'overdue' ? 'active' : ''}">
              Quá hạn (${overdueCount})
            </button>
            <button onclick="setTaskTab('upcoming')" class="task-filter-pill ${window.taskActiveTab === 'upcoming' ? 'active' : ''}">
              Sắp tới (${upcomingCount})
            </button>
            <button onclick="setTaskTab('done')" class="task-filter-pill ${window.taskActiveTab === 'done' ? 'active' : ''}">
              Đã xong (${totalCompleted})
            </button>
          </div>
        </div>

        <div id="tasks-content-list" class="space-y-3">
    `;

    if (displayTasks.length === 0) {
      html += `
        <div class="py-10 text-center">
          <div class="w-16 h-16 rounded-3xl bg-primary-500/10 text-primary-500 flex items-center justify-center text-3xl mx-auto mb-3">
            ☕
          </div>
          <h4 class="text-base font-bold custom-text">Ngày này thảnh thơi, không có việc nào!</h4>
          <p class="text-xs custom-text-secondary max-w-xs mx-auto mt-1 mb-5">
            Hãy tận hưởng thời gian nghỉ ngơi hoặc chọn một gói việc thường gặp bên dưới để lên lịch ngay.
          </p>

          <!-- Gói 4 Việc Mẫu 1-Click (Starter Tasks) -->
          <div class="border-t custom-border pt-5 text-left max-w-lg mx-auto">
            <span class="text-xs font-black uppercase tracking-wider custom-text-secondary block mb-3 text-center">
              ⚡ Gợi Ý Thêm Việc Thường Gặp (1-Click)
            </span>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button onclick="quickAddTask('Đóng tiền điện / nước / internet', 'expense', 450000, '${selDateStr}')"
                class="p-3 rounded-2xl custom-bg-input border custom-border text-left hover:border-primary-500 flex items-center justify-between group transition-all">
                <div>
                  <div class="text-xs font-bold custom-text group-hover:text-primary-500">💡 Tiền điện / nước</div>
                  <div class="text-[10px] custom-text-secondary">Chi phí sinh hoạt</div>
                </div>
                <span class="w-7 h-7 rounded-xl custom-bg-card flex items-center justify-center text-xs custom-text-secondary group-hover:bg-primary-500 group-hover:text-white transition-all"><i class="fa-solid fa-plus"></i></span>
              </button>

              <button onclick="quickAddTask('Thanh toán tiền trọ / tiền nhà', 'expense', 2500000, '${selDateStr}')"
                class="p-3 rounded-2xl custom-bg-input border custom-border text-left hover:border-primary-500 flex items-center justify-between group transition-all">
                <div>
                  <div class="text-xs font-bold custom-text group-hover:text-primary-500">🏠 Đóng tiền trọ / nhà</div>
                  <div class="text-[10px] custom-text-secondary">Hạn chót tháng</div>
                </div>
                <span class="w-7 h-7 rounded-xl custom-bg-card flex items-center justify-center text-xs custom-text-secondary group-hover:bg-primary-500 group-hover:text-white transition-all"><i class="fa-solid fa-plus"></i></span>
              </button>

              <button onclick="quickAddTask('Tập thể dục / Chạy bộ 30 phút', 'normal', 0, '${selDateStr}')"
                class="p-3 rounded-2xl custom-bg-input border custom-border text-left hover:border-primary-500 flex items-center justify-between group transition-all">
                <div>
                  <div class="text-xs font-bold custom-text group-hover:text-primary-500">🏃 Tập thể dục / Chạy bộ</div>
                  <div class="text-[10px] custom-text-secondary">Sức khỏe dẻo dai</div>
                </div>
                <span class="w-7 h-7 rounded-xl custom-bg-card flex items-center justify-center text-xs custom-text-secondary group-hover:bg-primary-500 group-hover:text-white transition-all"><i class="fa-solid fa-plus"></i></span>
              </button>

              <button onclick="quickAddTask('Học bài / Đọc 10 trang sách', 'normal', 0, '${selDateStr}')"
                class="p-3 rounded-2xl custom-bg-input border custom-border text-left hover:border-primary-500 flex items-center justify-between group transition-all">
                <div>
                  <div class="text-xs font-bold custom-text group-hover:text-primary-500">📚 Đọc sách / Học tập</div>
                  <div class="text-[10px] custom-text-secondary">Phát triển bản thân</div>
                </div>
                <span class="w-7 h-7 rounded-xl custom-bg-card flex items-center justify-center text-xs custom-text-secondary group-hover:bg-primary-500 group-hover:text-white transition-all"><i class="fa-solid fa-plus"></i></span>
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      displayTasks.forEach(t => {
        const isFin = t.type === 'expense';
        const isInc = t.type === 'income';
        const isOverdue = (!t.isCompleted && t.date && t.date.split('T')[0] < todayStr);

        let timeStr = "";
        if (t.date) {
          if (t.date.includes('T')) timeStr = t.date.split('T')[1].substring(0, 5);
          else if (t.date.includes(' ')) timeStr = t.date.split(' ')[1].substring(0, 5);
        }

        const dateOnly = t.date ? t.date.split('T')[0] : '';
        const isTodayTask = dateOnly === todayStr;

        let iconEl = '📌';
        if (t.isCompleted) iconEl = '✅';
        else if (isFin) iconEl = '💸';
        else if (isInc) iconEl = '💰';

        html += `
          <div class="p-4 rounded-2xl custom-bg-input border custom-border flex items-center justify-between gap-3 group hover:border-primary-500/40 transition-all ${isOverdue ? 'task-card-overdue' : ''}">
            <div class="flex items-center gap-3.5 min-w-0">
              <!-- Custom Checkbox Button -->
              <button onclick="completeTask('${t.id}')" 
                class="w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 ${t.isCompleted ? 'bg-emerald-500 text-white shadow-sm' : 'custom-bg-card border custom-border hover:border-primary-500 text-transparent hover:text-gray-400'}"
                title="${t.isCompleted ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}">
                <i class="fa-solid fa-check text-xs"></i>
              </button>

              <div class="w-10 h-10 rounded-xl ${t.isCompleted ? 'bg-emerald-500/10 text-emerald-500' : 'custom-bg-card text-primary-500'} border custom-border flex items-center justify-center text-lg shrink-0">
                ${iconEl}
              </div>

              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h4 class="font-bold text-sm custom-text truncate ${t.isCompleted ? 'line-through opacity-50' : ''}">${t.name}</h4>
                  ${isOverdue ? `<span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500/15 text-rose-500 border border-rose-500/30">Trễ hạn</span>` : ''}
                </div>

                <div class="text-[11px] custom-text-secondary mt-1 flex items-center gap-2 flex-wrap">
                  ${timeStr ? `<span><i class="fa-regular fa-clock text-[10px]"></i> ${timeStr}</span>` : ''}
                  <span>• ${dateOnly.split('-')[2]}/${dateOnly.split('-')[1]}</span>
                  ${isFin ? `<span class="text-rose-500 font-bold">• Chi: -${formatMoney(t.amount)}</span>` : ''}
                  ${isInc ? `<span class="text-emerald-500 font-bold">• Thu: +${formatMoney(t.amount)}</span>` : ''}
                </div>
              </div>
            </div>

            <!-- Action Delete -->
            <div class="shrink-0 flex items-center gap-1.5">
              <button onclick="deleteTask('${t.id}')" 
                class="w-8 h-8 rounded-xl custom-bg-card border custom-border text-xs text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center"
                title="Xóa công việc">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        `;
      });
    }

    html += `
          </div> <!-- End tasks-content-list -->
        </div> <!-- End bento list -->
      </div> <!-- End space-y-4 -->
    `;

    root.innerHTML = html;
  };

  // Khởi chạy khi module load nếu đang ở tab tasks
  if (state && state.currentView === 'tasks') {
    window.renderTasks();
  }
})();
