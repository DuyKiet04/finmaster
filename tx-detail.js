// ==============================================================
// FILE: tx-detail.js - TRUNG TÂM XỬ LÝ TOÀN BỘ NGHIỆP VỤ GIAO DỊCH
// BẢN V8: LIQUID GLASS BANKING & MOTION UI
// ==============================================================

window.txViewMode = "list";
window.txSortOrder = "date_desc"; 
window.dateFilter = "all";
window.walletFilter = "all";
window.lastDateGroup = ""; 

// ==========================================
// 1. GIAO DIỆN CHÍNH (HERO GLASS & FLOATING SEARCH)
// ==========================================
function injectTransactionsUI() {
    if (document.getElementById("view-transactions")) return;

    const html = `
    <div id="view-transactions" class="view-section hidden flex-col h-full bg-transparent font-sans">
        
        <!-- LIQUID GLASS HERO BANNER -->
        <div class="sticky top-0 z-[60] pt-4 pb-8 px-3 transition-all rounded-b-[2rem] mb-2 custom-bg-header backdrop-blur-3xl shadow-sm border-b custom-border">
            
            <div class="flex justify-between items-center mb-5 px-2">
                <h2 class="text-2xl font-black custom-text tracking-tight">Sổ Giao Dịch</h2>
                
                <div class="flex items-center gap-2">
                    <button id="view-mode-btn" onclick="toggleTxViewMode()" class="w-10 h-10 rounded-[14px] custom-bg-card flex items-center justify-center custom-text-secondary hover:text-primary-500 transition-all active:scale-90 border custom-border shadow-sm hover:-translate-y-0.5" title="Chế độ hiển thị">
                        <i class="fa-solid fa-table-cells-large text-sm"></i>
                    </button>
                    <button id="filter-btn" onclick="openTxFilterModal()" class="w-10 h-10 rounded-[14px] custom-bg-card flex items-center justify-center custom-text-secondary hover:text-primary-500 transition-all active:scale-90 border custom-border shadow-sm relative hover:-translate-y-0.5" title="Bộ lọc nâng cao">
                        <i class="fa-solid fa-filter-list text-sm"></i>
                        <span id="filter-badge" class="hidden absolute -top-1 -right-1 w-3.5 h-3.5 bg-danger-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
                    </button>
                </div>
            </div>

            <!-- GỘP KHỐI TỔNG (NET BALANCE TÂM ĐIỂM) -->
            <div class="relative custom-bg-card p-5 rounded-[1.75rem] border custom-border shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col items-center text-center group">
                <!-- Ánh sáng hắt (Glow) -->
                <div class="absolute -top-10 -left-10 w-32 h-32 bg-success-500/20 blur-[40px] rounded-full pointer-events-none"></div>
                <div class="absolute -bottom-10 -right-10 w-32 h-32 bg-danger-500/20 blur-[40px] rounded-full pointer-events-none"></div>
                
                <p class="relative z-10 text-[10px] font-black uppercase tracking-widest mb-1 custom-text-secondary">Chênh Lệch Thực Tế</p>
                <h2 id="tx-head-net" class="relative z-10 text-[38px] font-black tracking-tighter mb-4 custom-text drop-shadow-sm transition-all duration-500">0 ₫</h2>
                
                <div class="relative z-10 w-full grid grid-cols-2 gap-3 pt-3 border-t border-dashed custom-border">
                    <div class="flex flex-col items-center">
                        <span class="text-[9px] font-bold text-success-500 uppercase tracking-widest flex items-center gap-1"><i class="fa-solid fa-arrow-trend-down"></i> Tổng Thu</span>
                        <span class="font-black text-base text-success-600 dark:text-success-400 mt-0.5" id="tx-head-inc">0 ₫</span>
                    </div>
                    <div class="flex flex-col items-center border-l border-dashed custom-border">
                        <span class="text-[9px] font-bold text-danger-500 uppercase tracking-widest flex items-center gap-1"><i class="fa-solid fa-arrow-trend-up"></i> Tổng Chi</span>
                        <span class="font-black text-base text-danger-600 dark:text-danger-400 mt-0.5" id="tx-head-exp">0 ₫</span>
                    </div>
                </div>
            </div>

            <!-- FLOATING SEARCH BAR (Chồm xuống danh sách) -->
            <div class="absolute -bottom-6 left-5 right-5 z-20">
                <div class="relative w-full shadow-[0_8px_25px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_25px_rgba(0,0,0,0.3)] rounded-[1.25rem]">
                    <i class="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 custom-text-secondary text-sm pointer-events-none"></i>
                    <input type="text" id="filter-search" oninput="window.handleSearchInput(this.value)" onfocus="if(this.value) document.getElementById('search-autocomplete').classList.remove('hidden');" placeholder="Tìm Note, Giá tiền (VD: 100k, -50k)..." autocomplete="off" class="w-full pl-11 pr-10 py-3.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-[1.25rem] text-sm font-bold custom-text outline-none focus:ring-2 focus:ring-primary-500/50 transition-all border custom-border">
                    <!-- Nút xóa nhanh khi có text -->
                    <i id="clear-search-btn" class="fa-solid fa-circle-xmark absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-rose-400 cursor-pointer hidden transition-colors" onclick="document.getElementById('filter-search').value=''; window.handleSearchInput('');"></i>
                </div>
                <!-- BẢNG GỢI Ý TÌM KIẾM -->
                <div id="search-autocomplete" class="hidden absolute top-[110%] left-0 right-0 custom-bg-card rounded-[1.5rem] shadow-2xl border custom-border z-[70] max-h-[60vh] overflow-y-auto p-2 backdrop-blur-3xl bg-opacity-95"></div>
            </div>
        </div>

        <!-- KHU VỰC DANH SÁCH GIAO DỊCH -->
        <div class="flex-1 overflow-y-auto px-2 sm:px-4 pt-10 pb-32">
            <div id="tx-list-container" class="w-full max-w-4xl mx-auto"></div>
            
            <div id="tx-empty" class="hidden flex-col items-center justify-center py-24 text-center opacity-70 custom-bg-card rounded-[2rem] border custom-border shadow-sm mt-4">
                <div class="w-24 h-24 mb-5 rounded-full custom-bg-input flex items-center justify-center text-4xl custom-text-secondary shadow-inner border custom-border">
                    <i class="fa-solid fa-ghost animate-bounce"></i>
                </div>
                <h3 class="text-lg font-black custom-text mb-1">Khu vực tĩnh lặng!</h3>
                <p class="text-xs font-medium custom-text-secondary max-w-[250px] leading-relaxed">Chưa có giao dịch nào xuất hiện hoặc bị giấu bởi bộ lọc.</p>
            </div>
        </div>
    </div>
    `;
    const scrollArea = document.getElementById("main-scroll-area");
    if (scrollArea) scrollArea.insertAdjacentHTML("beforeend", html);
    initTxFilterModal(); // Tạo Modal Lọc Nâng Cao
}

const origSwitchViewTx = window.switchView;
window.switchView = function(viewId) {
    if (viewId === "transactions") injectTransactionsUI();
    if (origSwitchViewTx) origSwitchViewTx(viewId);
};


// ==========================================
// 2. MODAL LỌC NÂNG CAO (BOTTOM SHEET)
// ==========================================
function initTxFilterModal() {
    if (document.getElementById('tx-filter-modal')) return; 
    const modalHtml = `
    <div id="tx-filter-modal" class="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-sm transition-opacity duration-300 opacity-0 pointer-events-none flex items-end justify-center">
        <div class="absolute inset-0" onclick="closeTxFilterModal()"></div>
        
        <div id="tx-filter-content" class="w-full max-w-md custom-bg-body border-t custom-border rounded-t-[2.5rem] transform translate-y-full transition-transform duration-400 cubic-bezier(0.34, 1.56, 0.64, 1) flex flex-col max-h-[85vh] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] relative">
            <div class="w-full flex justify-center py-4 cursor-pointer" onclick="closeTxFilterModal()">
                <div class="w-14 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            </div>
            
            <div class="px-6 pb-4 border-b border-dashed custom-border flex items-center justify-between shrink-0">
                <h3 class="font-black text-xl custom-text flex items-center gap-2"><i class="fa-solid fa-filter-list text-primary-500"></i> Lọc Nâng Cao</h3>
                <button onclick="setTxFilter('all'); setTxWalletFilter('all'); setTxSortOrder('date_desc'); closeTxFilterModal();" class="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-lg border border-rose-100 dark:border-rose-900/50 active:scale-95 transition-transform">Xóa lọc</button>
            </div>

            <div class="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar space-y-6">
                <!-- KHỐI 1: CHỌN NGÀY -->
                <div>
                    <label class="text-[10px] font-black custom-text-secondary uppercase tracking-widest mb-3 flex items-center gap-2"><i class="fa-regular fa-calendar text-primary-500"></i> Thời gian cụ thể</label>
                    <div class="grid grid-cols-2 gap-3 mb-3">
                        <div class="custom-bg-input p-3 rounded-2xl border custom-border">
                            <p class="text-[9px] font-bold custom-text-secondary mb-1">Từ ngày</p>
                            <input type="date" id="tx-date-start" onchange="applyFiltersFromModal()" class="w-full bg-transparent text-sm font-bold custom-text outline-none cursor-pointer custom-focus">
                        </div>
                        <div class="custom-bg-input p-3 rounded-2xl border custom-border">
                            <p class="text-[9px] font-bold custom-text-secondary mb-1">Đến ngày</p>
                            <input type="date" id="tx-date-end" onchange="applyFiltersFromModal()" class="w-full bg-transparent text-sm font-bold custom-text outline-none cursor-pointer custom-focus">
                        </div>
                    </div>
                    <div class="grid grid-cols-3 gap-2">
                        <button onclick="quickSelectDate('all')" id="btn-filter-all" class="py-2.5 text-[11px] font-bold rounded-xl custom-primary text-white custom-shadow-sm transition-all active:scale-95">Tất cả</button>
                        <button onclick="quickSelectDate('today')" id="btn-filter-today" class="py-2.5 text-[11px] font-bold rounded-xl custom-bg-card border custom-border custom-text-secondary hover:brightness-95 transition-all active:scale-95">Hôm nay</button>
                        <button onclick="quickSelectDate('yesterday')" id="btn-filter-yesterday" class="py-2.5 text-[11px] font-bold rounded-xl custom-bg-card border custom-border custom-text-secondary hover:brightness-95 transition-all active:scale-95">Hôm qua</button>
                    </div>
                </div>

                <!-- KHỐI 2: CHỌN VÍ -->
                <div>
                    <label class="text-[10px] font-black custom-text-secondary uppercase tracking-widest mb-3 flex items-center gap-2"><i class="fa-solid fa-wallet text-sky-500"></i> Nguồn tiền (Ví)</label>
                    <div class="relative">
                        <select id="filter-wallet-select" onchange="applyFiltersFromModal()" class="w-full custom-bg-input text-sm font-bold custom-text outline-none border custom-border rounded-2xl px-4 py-4 cursor-pointer appearance-none custom-focus">
                            <option value="all">Tất cả ví</option>
                        </select>
                        <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"></i>
                    </div>
                </div>

                <!-- KHỐI 3: SẮP XẾP -->
                <div>
                    <label class="text-[10px] font-black custom-text-secondary uppercase tracking-widest mb-3 flex items-center gap-2"><i class="fa-solid fa-arrow-down-a-z text-amber-500"></i> Thứ tự sắp xếp</label>
                    <div class="grid grid-cols-2 gap-3">
                        <button onclick="quickSelectSort('date_desc')" id="sort-date_desc" class="py-3 rounded-2xl text-xs font-bold custom-primary text-white border border-transparent shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"><i class="fa-solid fa-clock"></i> Mới nhất</button>
                        <button onclick="quickSelectSort('date_asc')" id="sort-date_asc" class="py-3 rounded-2xl text-xs font-bold custom-bg-card border custom-border custom-text-secondary flex items-center justify-center gap-2 transition-all active:scale-95 hover:brightness-95"><i class="fa-solid fa-clock-rotate-left"></i> Cũ nhất</button>
                        <button onclick="quickSelectSort('amount_desc')" id="sort-amount_desc" class="py-3 rounded-2xl text-xs font-bold custom-bg-card border custom-border custom-text-secondary flex items-center justify-center gap-2 transition-all active:scale-95 hover:brightness-95"><i class="fa-solid fa-arrow-down-9-1"></i> Giá giảm</button>
                        <button onclick="quickSelectSort('amount_asc')" id="sort-amount_asc" class="py-3 rounded-2xl text-xs font-bold custom-bg-card border custom-border custom-text-secondary flex items-center justify-center gap-2 transition-all active:scale-95 hover:brightness-95"><i class="fa-solid fa-arrow-up-1-9"></i> Giá tăng</button>
                    </div>
                </div>
            </div>

            <div class="p-4 custom-bg-card border-t custom-border shrink-0 z-10">
                <button onclick="closeTxFilterModal()" class="w-full py-4 custom-primary text-white rounded-2xl font-black text-[15px] shadow-[0_8px_20px_rgba(var(--primary-hue),_100%,_50%,_0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <i class="fa-solid fa-check-double"></i> Xem Kết Quả
                </button>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

window.openTxFilterModal = () => {
    // Nạp lại danh sách ví mới nhất
    const sel = document.getElementById("filter-wallet-select");
    if (sel) {
        sel.innerHTML = '<option value="all">Tất cả ví</option>' + state.wallets.map(w => `<option value="${w.id}" ${window.walletFilter === w.id ? "selected" : ""}>${w.name}</option>`).join("");
    }

    const modal = document.getElementById("tx-filter-modal");
    const content = document.getElementById("tx-filter-content");
    modal.classList.remove("hidden", "pointer-events-none");
    modal.classList.remove("opacity-0");
    setTimeout(() => { content.classList.remove("translate-y-full"); }, 10);
    if (typeof playSound === 'function') playSound("click");
};

window.closeTxFilterModal = () => {
    const modal = document.getElementById("tx-filter-modal");
    const content = document.getElementById("tx-filter-content");
    content.classList.add("translate-y-full");
    setTimeout(() => { 
        modal.classList.add("opacity-0", "pointer-events-none");
        setTimeout(() => modal.classList.add("hidden"), 300);
    }, 300);
};

// Hàm gán màu nhanh trong Modal Lọc
window.quickSelectDate = (val) => {
    window.dateFilter = val;
    if (val !== "range") {
        document.getElementById("tx-date-start").value = "";
        document.getElementById("tx-date-end").value = "";
    }
    ['all', 'today', 'yesterday'].forEach(id => {
        const btn = document.getElementById(`btn-filter-${id}`);
        if (btn) btn.className = id === val ? "py-2.5 text-[11px] font-bold rounded-xl custom-primary text-white custom-shadow-sm transition-all active:scale-95" : "py-2.5 text-[11px] font-bold rounded-xl custom-bg-card border custom-border custom-text-secondary hover:brightness-95 transition-all active:scale-95";
    });
    applyFiltersFromModal();
};

window.quickSelectSort = (val) => {
    window.txSortOrder = val;
    ["date_desc", "date_asc", "amount_desc", "amount_asc"].forEach((id) => {
        const btn = document.getElementById("sort-" + id);
        if (btn) {
            btn.className = (id === val)
                ? "py-3 rounded-2xl text-xs font-bold custom-primary text-white border border-transparent shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                : "py-3 rounded-2xl text-xs font-bold custom-bg-card border custom-border custom-text-secondary flex items-center justify-center gap-2 transition-all active:scale-95 hover:brightness-95";
        }
    });
    applyFiltersFromModal();
};

window.applyFiltersFromModal = () => {
    if(document.getElementById("tx-date-start").value || document.getElementById("tx-date-end").value) {
        window.dateFilter = "range";
        ['all', 'today', 'yesterday'].forEach(id => {
            const btn = document.getElementById(`btn-filter-${id}`);
            if (btn) btn.className = "py-2.5 text-[11px] font-bold rounded-xl custom-bg-card border custom-border custom-text-secondary hover:brightness-95 transition-all active:scale-95";
        });
    }
    window.walletFilter = document.getElementById("filter-wallet-select").value;
    window.renderTransactions();
};

// ==========================================
// 3. TÌM KIẾM THÔNG MINH (THEO GIÁ TIỀN & AUTO FORMAT)
// ==========================================
window.handleSearchInput = (val) => {
    const rawVal = val.trim().toLowerCase();
    const inputEl = document.getElementById("filter-search");
    const clearBtn = document.getElementById("clear-search-btn");
    const box = document.getElementById("search-autocomplete");
    
    // Hiện nút X
    if(clearBtn) clearBtn.style.display = rawVal ? "block" : "none";

    // 1. THUẬT TOÁN BẮT SỐ TIỀN & ĐỊNH DẠNG TRỰC TIẾP
    // Hỗ trợ: "100k", "-50k", "100000", "+50.000"
    let isSearchByAmount = false;
    let targetAmount = 0;
    let amountSign = "any"; // 'income', 'expense', 'any'
    
    // Check xem user có đang gõ số hoặc k/m không
    const amountMatch = rawVal.match(/^([+-]?)\s*(\d+(?:[.,]\d+)*)\s*([km]?)$/i);
    
    if (amountMatch) {
        isSearchByAmount = true;
        const sign = amountMatch[1];
        let numStr = amountMatch[2].replace(/[.,]/g, ''); // Bỏ dấu chấm phẩy
        const multiplier = amountMatch[3].toLowerCase();
        
        targetAmount = parseInt(numStr, 10);
        if (multiplier === 'k') targetAmount *= 1000;
        if (multiplier === 'm') targetAmount *= 1000000;

        if (sign === '+') amountSign = 'income';
        else if (sign === '-') amountSign = 'expense';
        
        // Tự động format lại text trong ô input cho đẹp (Thêm dấu chấm)
        // inputEl.value = (sign || '') + targetAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    // 2. LUÔN RENDER LẠI DANH SÁCH CHÍNH TRƯỚC
    window.renderTransactions();

    if (!rawVal) {
        box.classList.add("hidden");
        return;
    }

    // 3. LỌC GỢI Ý DROPDOWN
    const removeAccents = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const queryNoAccent = removeAccents(rawVal);

    const results = state.transactions.filter((t) => {
        if (t.category === "transfer") return false;

        // Nếu là tìm theo số tiền
        if (isSearchByAmount) {
            if (amountSign !== 'any' && t.type !== amountSign) return false;
            // Tìm các khoản NHỎ HƠN HOẶC BẰNG số tiền nhập (Rất tiện cho việc tìm hóa đơn dưới 100k)
            return t.amount > 0 && t.amount <= targetAmount;
        }

        // Nếu là tìm theo Chữ
        if (rawVal === "thu" || rawVal === "thu nhập") return t.type === "income";
        if (rawVal === "chi" || rawVal === "chi tiêu") return t.type === "expense";

        const catName = state.categories.find((c) => c.id === t.category)?.name.toLowerCase() || "";
        const note = (t.note || "").toLowerCase();
        return (
            note.includes(rawVal) || catName.includes(rawVal) ||
            removeAccents(note).includes(queryNoAccent) || removeAccents(catName).includes(queryNoAccent)
        );
    }).slice(0, 15); // Lấy 15 kết quả gợi ý

    if (results.length === 0) {
        box.innerHTML = `<div class="text-center py-6 opacity-50"><div class="text-4xl mb-2">👻</div><p class="text-sm font-bold custom-text-secondary">Không thấy "${rawVal}" đâu đại ka!</p></div>`;
    } else {
        box.innerHTML = results.map((tx) => {
            const isInc = tx.type === "income";
            const cat = state.categories.find((c) => c.id === tx.category) || { name: "Khác", icon: "📦" };
            
            const fastImgUrl = tx.image && typeof window.getFastImage === 'function' ? window.getFastImage(tx.image) : tx.image;
            const imgHtml = (tx.image && tx.image.length > 50)
                ? `<img src="${fastImgUrl}" class="w-10 h-10 object-cover rounded-xl shrink-0 border custom-border">`
                : `<div class="w-10 h-10 rounded-[14px] ${cat.color} bg-opacity-20 flex items-center justify-center text-lg shrink-0 border custom-border shadow-inner">${cat.icon}</div>`;

            // Tự động Highlight số tiền hoặc chữ khớp
            let noteDisplay = tx.note || "...";
            if(!isSearchByAmount && rawVal.length > 1) {
               const regex = new RegExp(`(${rawVal})`, "gi");
               noteDisplay = noteDisplay.replace(regex, `<span class="bg-primary-500/20 text-primary-500 rounded px-0.5">$1</span>`);
            }

            let amtDisplay = formatMoney(tx.amount);
            if(isSearchByAmount) {
                amtDisplay = `<span class="bg-primary-500/20 px-1 rounded">${amtDisplay}</span>`;
            }

            return `
            <div onclick="openTxDetail('${tx.id}'); document.getElementById('search-autocomplete').classList.add('hidden'); document.getElementById('filter-search').value = '';"
                 class="flex items-center gap-3 p-2.5 custom-bg-card hover:brightness-95 rounded-xl cursor-pointer transition-colors border-b border-dashed custom-border last:border-0 w-full mb-1 hover:-translate-y-0.5 active:scale-95">
                ${imgHtml}
                <div class="flex-1 min-w-0">
                    <p class="font-bold text-[13px] custom-text truncate leading-tight">${cat.name}</p>
                    <p class="text-[10px] custom-text-secondary truncate mt-0.5 font-medium">${noteDisplay}</p>
                </div>
                <div class="text-right shrink-0 ml-2">
                    <p class="font-black text-[13px] ${isInc ? "text-success-500" : "custom-text"}">${isInc ? "+" : "-"}${amtDisplay}</p>
                </div>
            </div>`;
        }).join("");
    }
    box.classList.remove("hidden");
};


// ==========================================
// 4. BỘ CẢM BIẾN VUỐT THẺ (SPRING BOUNCE MOTION)
// ==========================================
window.currentlyOpenContent = null; 

window.initSwipeActions = () => {
    const swipeItems = document.querySelectorAll(".swipe-item:not(.swipe-inited)");
    
    swipeItems.forEach((item) => {
        item.classList.add("swipe-inited");
        const content = item.querySelector(".swipe-content");
        const actionsBox = item.querySelector(".actions-container");
        if (!content || !actionsBox) return;

        let startX = 0, startY = 0, currentTranslate = 0, startTranslate = 0;
        let isDragging = false, isScrolling = false, maxOpen = 0; 

        item.addEventListener("touchstart", (e) => {
            maxOpen = actionsBox.offsetWidth || 140; 
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
            isScrolling = false;
            startTranslate = currentTranslate;
            content.style.transition = "none";

            // Đóng cái cũ đang mở
            if (window.currentlyOpenContent && window.currentlyOpenContent !== content) {
                window.currentlyOpenContent.style.transition = "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"; // Lò xo mượt
                window.currentlyOpenContent.style.transform = "translateX(0px)";
                window.currentlyOpenContent.dataset.translate = 0;
                window.currentlyOpenContent = null;
            }
        }, { passive: true });

        item.addEventListener("touchmove", (e) => {
            if (!isDragging) return;
            const diffX = e.touches[0].clientX - startX;
            const diffY = e.touches[0].clientY - startY;

            if (Math.abs(diffY) > Math.abs(diffX) + 5) isScrolling = true;
            if (isScrolling) { isDragging = false; return; }

            let targetTranslate = startTranslate + diffX;
            
            // Kéo kháng lực (Rubber band)
            if (targetTranslate > 0) targetTranslate = targetTranslate * 0.15; // Cứng hơn
            else if (targetTranslate < -maxOpen) {
                const overpull = targetTranslate + maxOpen;
                targetTranslate = -maxOpen + (overpull * 0.15); // Rít chặt lại
            }
            content.style.transform = `translateX(${targetTranslate}px)`;
        }, { passive: true });

        item.addEventListener("touchend", () => {
            if (!isDragging || isScrolling) return;
            isDragging = false;
            const transformMatrix = window.getComputedStyle(content).transform;
            if (transformMatrix !== 'none') currentTranslate = parseFloat(transformMatrix.split(',')[4]);

            // Thả tay: Nhảy bằng gia tốc Spring
            content.style.transition = "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
            
            if (currentTranslate < -(maxOpen / 2.5)) {
                currentTranslate = -maxOpen;
                window.currentlyOpenContent = content;
                // Rung nhẹ haptic
                if (navigator.vibrate) navigator.vibrate(8);
            } else {
                currentTranslate = 0;
                if (window.currentlyOpenContent === content) window.currentlyOpenContent = null;
            }
            content.dataset.translate = currentTranslate;
            content.style.transform = `translateX(${currentTranslate}px)`;
        });
    });
};

// ==========================================
// 5. RENDER DANH SÁCH (TÍCH HỢP STAGGER REVEAL)
// ==========================================
window.txPageSize = 20;
window.currentTxPage = 1;
window.currentFilteredTxs = [];
window.txObserver = null;

window.renderTransactions = () => {
    window.lastDateGroup = ""; 
    const searchInput = document.getElementById("filter-search")?.value.trim().toLowerCase() || "";
    const removeAccents = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const searchNoAccent = removeAccents(searchInput);

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    
    const startDateVal = document.getElementById("tx-date-start")?.value;
    const endDateVal = document.getElementById("tx-date-end")?.value;

    // Check xem có phải đang gõ số tiền không
    let isSearchByAmount = false;
    let targetAmount = 0;
    let amountSign = "any"; 
    const amountMatch = searchInput.match(/^([+-]?)\s*(\d+(?:[.,]\d+)*)\s*([km]?)$/i);
    if (amountMatch) {
        isSearchByAmount = true;
        const sign = amountMatch[1];
        let numStr = amountMatch[2].replace(/[.,]/g, '');
        const multiplier = amountMatch[3].toLowerCase();
        targetAmount = parseInt(numStr, 10);
        if (multiplier === 'k') targetAmount *= 1000;
        if (multiplier === 'm') targetAmount *= 1000000;
        if (sign === '+') amountSign = 'income';
        else if (sign === '-') amountSign = 'expense';
    }

    let filteredTx = state.transactions.filter((t) => {
        if (t.category === "transfer") return false;

        let matchS = false;
        const catName = state.categories.find((c) => c.id === t.category)?.name.toLowerCase() || "";
        const note = (t.note || "").toLowerCase();
        const walletName = state.wallets.find((w) => w.id === t.walletId)?.name.toLowerCase() || "";

        if (isSearchByAmount) {
            if (amountSign !== 'any' && t.type !== amountSign) matchS = false;
            else matchS = t.amount > 0 && t.amount <= targetAmount;
        } else {
            if (["thu", "thu nhập", "thu chi", "thu tiền"].includes(searchInput)) matchS = t.type === "income";
            else if (["chi", "chi tiêu", "chi tiền"].includes(searchInput)) matchS = t.type === "expense";
            else if (searchInput === "") matchS = true;
            else {
                matchS = note.includes(searchInput) || catName.includes(searchInput) || walletName.includes(searchInput) ||
                         removeAccents(note).includes(searchNoAccent) || removeAccents(catName).includes(searchNoAccent) || removeAccents(walletName).includes(searchNoAccent);
            }
        }

        let matchDate = true;
        const txDateOnly = t.date.split("T")[0].split(" ")[0]; 

        if (window.dateFilter === "today") matchDate = txDateOnly === today;
        else if (window.dateFilter === "yesterday") matchDate = txDateOnly === yesterday;
        else if (window.dateFilter === "range") {
            if (startDateVal && endDateVal) matchDate = txDateOnly >= startDateVal && txDateOnly <= endDateVal;
            else if (startDateVal) matchDate = txDateOnly >= startDateVal;
            else if (endDateVal) matchDate = txDateOnly <= endDateVal;
        }

        let matchWallet = window.walletFilter === "all" || t.walletId === window.walletFilter;
        return matchS && matchDate && matchWallet;
    });

    filteredTx.sort((a, b) => {
        if (window.txSortOrder === "amount_desc") return b.amount - a.amount;
        if (window.txSortOrder === "amount_asc") return a.amount - b.amount;
        if (window.txSortOrder === "date_asc") return new Date(a.date) - new Date(b.date);
        return new Date(b.date) - new Date(a.date);
    });

    window.currentFilteredTxs = filteredTx;
    window.currentTxPage = 1;

    // Tính tổng Thu/Chi/Net mượt mà
    const inc = filteredTx.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
    const exp = filteredTx.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
    const net = inc - exp;

    if (typeof window.animateMoney === 'function') {
        window.animateMoney("tx-head-inc", inc, 800);
        window.animateMoney("tx-head-exp", exp, 800);
        window.animateMoney("tx-head-net", net, 1000);
    } else {
        document.getElementById("tx-head-inc").innerText = formatMoney(inc);
        document.getElementById("tx-head-exp").innerText = formatMoney(exp);
        document.getElementById("tx-head-net").innerText = formatMoney(net);
    }
    
    // Đổi màu chữ Net
    const netEl = document.getElementById("tx-head-net");
    if(netEl) netEl.className = `relative z-10 text-[38px] font-black tracking-tighter mb-4 drop-shadow-sm transition-colors duration-500 ${net > 0 ? "text-success-500" : net < 0 ? "text-danger-500" : "custom-text"}`;

    const badge = document.getElementById("filter-badge");
    if (badge) {
        if (window.dateFilter !== "all" || window.walletFilter !== "all" || window.txSortOrder !== "date_desc") badge.classList.remove("hidden");
        else badge.classList.add("hidden");
    }

    const container = document.getElementById("tx-list-container");
    const emptyState = document.getElementById("tx-empty");
    if (!container) return;

    if (filteredTx.length === 0) {
        container.innerHTML = "";
        if(emptyState) emptyState.classList.remove("hidden");
        if(emptyState) emptyState.classList.add("flex");
        return;
    }

    if(emptyState) emptyState.classList.add("hidden");
    if(emptyState) emptyState.classList.remove("flex");

    const pageTxs = filteredTx.slice(0, window.txPageSize);
    const html = window.generateTxHtml(pageTxs);

    let innerWrapperClass = window.txViewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-3 gap-3" : "flex flex-col space-y-3 w-full"; 

    container.innerHTML = `
        <div id="tx-inner-list" class="${innerWrapperClass}">
            ${html}
        </div>
        <div id="tx-load-sensor" class="w-full h-14 flex items-center justify-center mt-2 opacity-50">
            <i id="tx-loading-icon" class="fa-solid fa-circle-notch fa-spin text-2xl text-primary-500 hidden"></i>
        </div>
    `;

    // Hiệu ứng Stagger Reveal (Hiện lần lượt từng thẻ)
    const cards = container.querySelectorAll('.stagger-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.remove('opacity-0', 'translate-y-4');
        }, index * 35); // Trễ 35ms mỗi thẻ
    });

    if (typeof window.initSwipeActions === "function") window.initSwipeActions();
    window.initTxObserver();
};

window.initTxObserver = () => {
    if (window.txObserver) window.txObserver.disconnect();
    const sensor = document.getElementById("tx-load-sensor");
    if (!sensor) return;

    window.txObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) window.loadMoreTransactions();
    }, { root: document.getElementById("main-scroll-area"), rootMargin: "200px" });
    window.txObserver.observe(sensor);
};

window.loadMoreTransactions = () => {
    const start = window.currentTxPage * window.txPageSize;
    const end = start + window.txPageSize;
    const nextTxs = window.currentFilteredTxs.slice(start, end);
    const sensor = document.getElementById("tx-load-sensor");

    if (nextTxs.length === 0) {
        if (window.txObserver) window.txObserver.disconnect();
        return;
    }

    // Skeleton Shimmer Load
    if (sensor) {
        sensor.innerHTML = `
        <div class="w-full space-y-3">
            <div class="h-[76px] w-full bg-gray-200 dark:bg-gray-800 rounded-[1.25rem] animate-pulse"></div>
            <div class="h-[76px] w-full bg-gray-200 dark:bg-gray-800 rounded-[1.25rem] animate-pulse"></div>
        </div>`;
    }

    setTimeout(() => {
        const html = window.generateTxHtml(nextTxs);
        const innerList = document.getElementById("tx-inner-list");
        
        if (innerList) {
            // Chèn HTML
            innerList.insertAdjacentHTML("beforeend", html);
            
            // Tìm những thẻ vừa mới nhét vào (có class opacity-0) để diễn Animation Stagger
            const newCards = innerList.querySelectorAll('.opacity-0.stagger-card');
            newCards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.remove('opacity-0', 'translate-y-4');
                }, index * 35);
            });
        }
        
        window.currentTxPage++;
        if (typeof window.initSwipeActions === "function") window.initSwipeActions();
        
        // Trả Sensor về cục xoay
        if (sensor) sensor.innerHTML = `<i id="tx-loading-icon" class="fa-solid fa-circle-notch fa-spin text-2xl text-primary-500 hidden"></i>`;
    }, 400); // Tạo độ trễ xíu cho nó ảo
};

// ==========================================
// 6. COMPONENT VẼ CARD LIQUID
// ==========================================
window.generateTxHtml = (txList) => {
    let html = "";
    txList.forEach((tx) => {
        const cat = state.categories.find(c => c.id === tx.category) || { name: 'Khác', icon: '📦', color: 'bg-gray-100 text-gray-600' };
        const wallet = state.wallets.find(w => w.id === tx.walletId) || { name: 'Ví ẩn', icon: '💳' };
        const isInc = tx.type === 'income' || cat.type === 'income';
        const hasImage = tx.image && tx.image.length > 50;

        let txTime = "";
        if (tx.date.includes("T")) txTime = tx.date.split("T")[1].substring(0, 5);
        else if (tx.date.includes(" ")) txTime = tx.date.split(" ")[1].substring(0, 5);

        // STICKY HEADER (LIQUID BLUR STYLE)
        let headerHtml = "";
        if (window.txSortOrder === "date_desc" || window.txSortOrder === "date_asc") {
            const d = new Date(tx.date);
            const dateStr = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

            if (dateStr !== window.lastDateGroup) {
                window.lastDateGroup = dateStr;
                const dayTxs = window.currentFilteredTxs.filter(t => {
                    const td = new Date(t.date);
                    return `${td.getFullYear()}-${td.getMonth()}-${td.getDate()}` === dateStr;
                });
                const dInc = dayTxs.filter(t => t.type === "income").reduce((a, b) => a + b.amount, 0);
                const dExp = dayTxs.filter(t => t.type === "expense").reduce((a, b) => a + b.amount, 0);

                const todayObj = new Date();
                const yesterdayObj = new Date(Date.now() - 86400000);
                let dayName = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

                if (d.toDateString() === todayObj.toDateString()) dayName = "Hôm nay, " + dayName;
                else if (d.toDateString() === yesterdayObj.toDateString()) dayName = "Hôm qua, " + dayName;

                let sumStr = "";
                if(dInc > 0 && dExp === 0) sumStr = `<span class="text-success-500 font-bold drop-shadow-sm">+${formatMoney(dInc)}</span>`;
                else if(dExp > 0 && dInc === 0) sumStr = `<span class="text-danger-500 font-bold drop-shadow-sm">-${formatMoney(dExp)}</span>`;
                else sumStr = `<span class="text-success-500 font-bold">+${formatMoney(dInc)}</span> <span class="custom-text-secondary px-1 font-normal opacity-50">|</span> <span class="text-danger-500 font-bold">-${formatMoney(dExp)}</span>`;

                headerHtml = `
                <div class="col-span-full pt-6 pb-2 w-full break-inside-avoid flex items-center justify-between px-1">
                    <div class="custom-bg-primary-soft text-primary-600 dark:text-primary-400 border border-primary-500/20 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md">
                        ${dayName}
                    </div>
                    <div class="text-[10px] bg-white/60 dark:bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/40 dark:border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                        ${sumStr}
                    </div>
                </div>`;
            }
        }

        if (window.txViewMode === "grid") {
            const fastImgUrl = hasImage && typeof window.getFastImage === 'function' ? window.getFastImage(tx.image) : tx.image;
            html += headerHtml + `
            <div onclick="openTxDetail('${tx.id}')" class="stagger-card opacity-0 translate-y-4 transition-all duration-500 ease-out relative flex flex-col rounded-[1.5rem] overflow-hidden custom-bg-card border custom-border shadow-[0_5px_15px_-5px_rgba(0,0,0,0.05)] cursor-pointer group hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.1)] active:scale-[0.97] w-full">
                <div class="relative w-full ${hasImage ? "aspect-square" : "h-32"} custom-bg-input flex items-center justify-center overflow-hidden">
                    ${hasImage ? `<img src="${fastImgUrl}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">` : `<span class="text-5xl drop-shadow-md opacity-70 group-hover:scale-110 transition-transform duration-500">${cat.icon}</span>`}
                    <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20 pointer-events-none opacity-60"></div>
                    <div class="absolute top-3 left-3 flex items-center gap-1.5 z-10 bg-white/90 dark:bg-black/80 px-2.5 py-1 rounded-lg border border-black/5 dark:border-white/10 shadow-sm backdrop-blur-md">
                        <span class="text-[10px] drop-shadow-sm">${cat.icon}</span>
                    </div>
                </div>
                <div class="p-3.5 flex flex-col justify-between flex-1">
                    <p class="font-black text-[13px] custom-text leading-snug line-clamp-1 mb-1.5">${cat.name}</p>
                    <p class="font-black text-sm ${isInc ? "text-success-500" : "custom-text"} mb-1.5">${isInc ? "+" : "-"}${formatMoney(tx.amount)}</p>
                    <div class="flex items-center justify-between text-[10px] font-bold custom-text-secondary">
                        <span class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border custom-border truncate max-w-[70%]">${wallet.name}</span>
                        <span>${txTime}</span>
                    </div>
                </div>
            </div>`;
        } else {
            html += headerHtml + window.createSwipeableTxCard(tx);
        }
    });
    return html;
};

// THẺ VIEW LIST VỚI HIỆU ỨNG NỔI 3D LỚP
window.createSwipeableTxCard = (tx) => {
    const cat = state.categories.find(c => c.id === tx.category) || { name: 'Khác', icon: '📦', color: 'bg-gray-100 text-gray-600' };
    const wallet = state.wallets.find(w => w.id === tx.walletId) || { name: 'Ví ẩn', icon: '💳' };
    const isInc = tx.type === 'income' || cat.type === 'income';
    
    let txTime = "";
    if (tx.date.includes("T")) txTime = tx.date.split("T")[1].substring(0, 5);
    else if (tx.date.includes(" ")) txTime = tx.date.split(" ")[1].substring(0, 5);
    
    const locStr = tx.locationName && typeof window.formatShortAddress === 'function' ? window.formatShortAddress(tx.locationName) : tx.locationName;
    const hasImage = tx.image && tx.image.length > 50;
    const fastImgUrl = hasImage && typeof window.getFastImage === 'function' ? window.getFastImage(tx.image) : tx.image;
    
    const imgHtml = hasImage 
        ? `<img src="${fastImgUrl}" loading="lazy" class="w-full h-full object-cover rounded-[14px] cursor-pointer hover:opacity-80 transition-opacity hover:scale-105 duration-300" onclick="event.stopPropagation(); openImageModal('${fastImgUrl}')">` 
        : `<span class="text-[26px] drop-shadow-sm">${cat.icon}</span>`;

    const latStr = tx.lat ? tx.lat : "null";
    const lngStr = tx.lng ? tx.lng : "null";

    return `
    <div class="relative w-full swipe-item group bg-transparent overflow-visible stagger-card opacity-0 translate-y-4 transition-all duration-500 ease-out">
        
        <!-- MÂM NÚT ĐÁY NẨY LÒ XO -->
        <div class="actions-container absolute inset-y-0 right-0 flex items-center justify-end gap-1.5 pr-2 w-[150px] z-0">
            <button onclick="viewTransactionOnMap('${tx.id}', ${latStr}, ${lngStr})" class="w-10 h-10 rounded-[14px] custom-bg-primary-soft text-primary-500 flex items-center justify-center text-sm active:scale-75 transition-transform" title="Bản đồ"><i class="fa-solid fa-map-location-dot"></i></button>
            <button onclick="openEditTransaction('${tx.id}')" class="w-10 h-10 rounded-[14px] custom-bg-card custom-text-secondary flex items-center justify-center text-sm active:scale-75 transition-transform border custom-border"><i class="fa-solid fa-pen"></i></button>
            <button onclick="deleteTransaction('${tx.id}')" class="w-10 h-10 rounded-[14px] bg-danger-50 text-danger-500 dark:bg-danger-900/30 flex items-center justify-center text-sm active:scale-75 transition-transform"><i class="fa-solid fa-trash"></i></button>
        </div>

        <!-- THẺ KÍNH NỔI Z-INDEX 10 -->
        <div class="swipe-content relative z-10 w-full px-3 py-3.5 custom-bg-card rounded-[1.25rem] border custom-border shadow-[0_5px_15px_-5px_rgba(0,0,0,0.05)] cursor-pointer hover:brightness-95 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1)] transition-all active:scale-[0.98]" onclick="openTxDetail('${tx.id}')">
            <div class="flex items-center gap-3.5 w-full">
                <!-- Icon Ring Glow (Viền sáng theo màu) -->
                <div class="w-[50px] h-[50px] shrink-0 rounded-[16px] flex items-center justify-center border-2 border-white/50 dark:border-white/10 overflow-hidden ${cat.color} bg-opacity-20 dark:bg-opacity-20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] relative">
                    <div class="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent pointer-events-none"></div>
                    ${imgHtml}
                </div>

                <!-- Nội dung chính -->
                <div class="flex-1 min-w-0 flex flex-col justify-center">
                    <div class="flex justify-between items-center mb-0.5 w-full gap-2">
                        <p class="font-black text-[14px] custom-text truncate leading-tight">${cat.name}</p>
                        <p class="font-black text-[16px] tracking-tight shrink-0 ${isInc ? 'text-success-500' : 'custom-text dark:text-white'}">${isInc ? '+' : '-'}${formatMoney(tx.amount)}</p>
                    </div>
                    
                    <p class="text-[11px] font-medium custom-text-secondary truncate w-full mb-1.5">${tx.note || "..."}</p>

                    <div class="flex items-center justify-between w-full">
                        <div class="flex items-center gap-1.5 min-w-0">
                            <span class="text-[9px] font-bold custom-bg-input custom-text-secondary px-2 py-0.5 rounded-[6px] border custom-border truncate uppercase tracking-widest"><i class="fa-solid fa-wallet"></i> ${wallet.name}</span>
                            ${tx.locationName ? `<span class="text-[9px] text-danger-500 font-bold bg-danger-50 dark:bg-danger-900/20 uppercase truncate max-w-[80px] sm:max-w-[150px] tracking-widest px-2 py-0.5 rounded-[6px] border border-danger-100 dark:border-danger-900/50"><i class="fa-solid fa-location-dot"></i> ${locStr}</span>` : ''}
                        </div>
                        <span class="text-[9px] font-bold custom-text-secondary shrink-0 ml-2 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded border custom-border"><i class="fa-regular fa-clock"></i> ${txTime}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
};

// ==========================================
// 8. HÓA ĐƠN RECEIPT (CÓ ANIMATION DROP & GLOW)
// ==========================================
window.openTxDetail = (txId) => {
    // Trỏ quyền xử lý sang file tx-full-page.js (Trang chi tiết chuẩn Super App)
    if (typeof window.openFullTxPage === 'function') {
        window.openFullTxPage(txId);
    } else {
        alert("Lỗi: Không tìm thấy Module Chi tiết toàn màn hình!");
    }
};

window.closeTxDetail = () => {
    // Fallback nếu lỡ gọi hàm cũ
    if (typeof window.closeFullTxPage === 'function') {
        window.closeFullTxPage();
    }
};

// ==========================================
// 9. CÁC HÀM HÀNH ĐỘNG CỤ THỂ
// ==========================================
window.deleteTransaction = (id) => {
    if (confirm("Xóa giao dịch này?")) {
        const idx = state.transactions.findIndex((t) => t.id === id);
        if (idx > -1) {
            const tx = state.transactions[idx];
            state.transactions.splice(idx, 1);
            const w = state.wallets.find((w) => w.id === tx.walletId);
            if (w) w.balance -= tx.type === "income" ? tx.amount : -tx.amount;
            if (typeof addLog === 'function') addLog("Xóa giao dịch", typeof window.formatMoney === 'function' ? window.formatMoney(tx.amount) : tx.amount);
            if (typeof saveData === 'function') saveData();
            
            if (state.currentView === "dashboard" && typeof renderDashboard === 'function') renderDashboard();
            else window.renderTransactions();
            
            if (typeof playSound === 'function') playSound('trash');
        }
    }
};

window.openEditTransaction = (id) => {
    if (typeof openModal === 'function') openModal("transaction", id);
};

window.viewTransactionOnMap = (txId, lat, lng) => {
    if (!lat || !lng) return alert("Giao dịch này không có gắn vị trí!");
    if (typeof switchView === 'function') switchView("map");
    if (typeof setMapMode === "function") setMapMode("marker");

    setTimeout(() => {
        if (window.myMap || typeof myMap !== 'undefined') {
            const mapObj = window.myMap || myMap;
            mapObj.invalidateSize();
            const target = L.latLng(lat, lng);
            mapObj.flyTo(target, 18, { duration: 1.5 });

            const highlightCircle = L.circleMarker(target, { radius: 25, color: "#a855f7", fillColor: "#a855f7", fillOpacity: 0.5, className: "animate-ping" }).addTo(mapObj);
            if (typeof playSound === "function") playSound("pop");
            setTimeout(() => mapObj.removeLayer(highlightCircle), 3000);
        }
    }, 500);
};

window.viewAndHighlightTransaction = (txId) => {
    document.getElementById("filter-search").value = "";
    if (document.getElementById("tx-date-start")) document.getElementById("tx-date-start").value = "";
    if (document.getElementById("tx-date-end")) document.getElementById("tx-date-end").value = "";
    window.dateFilter = "all";
    window.walletFilter = "all";

    if (typeof switchView === 'function') switchView("transactions");

    setTimeout(() => {
        const txEl = document.querySelector(`div.swipe-content[onclick*="${txId}"]`);
        if (txEl) {
            txEl.scrollIntoView({ behavior: "smooth", block: "center" });
            const oldBg = txEl.style.backgroundColor;
            const oldTransform = txEl.style.transform;

            txEl.style.transition = "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";
            txEl.style.backgroundColor = "var(--bg-primary-soft)"; 
            txEl.style.transform = "scale(1.05)"; 

            if (typeof playSound === "function") playSound("success");
            setTimeout(() => {
                txEl.style.backgroundColor = oldBg;
                txEl.style.transform = oldTransform;
            }, 2500);
        } else alert("Lỗi: Không tìm thấy giao dịch trên màn hình!");
    }, 400);
};