// ==============================================================
// FILE: tx-detail.js - TRUNG TÂM XỬ LÝ TOÀN BỘ NGHIỆP VỤ GIAO DỊCH
// BẢN SỬA LỖI UI MỚI NHẤT (MARGIN, SPACING, CLICK, SWIPE)
// ==============================================================

window.txViewMode = "list";
window.txSortOrder = "date_desc"; 
window.dateFilter = "all";
window.walletFilter = "all";
window.lastDateGroup = ""; 

// ==========================================
// 1. TỰ ĐỘNG BƠM GIAO DIỆN TRANG GIAO DỊCH VÀO INDEX.HTML
// ==========================================
function injectTransactionsUI() {
    if (document.getElementById("view-transactions")) return;

    // Đã sửa px-4 thành px-2 cho lề nhỏ lại theo yêu cầu đại ka
    const html = `
    <div id="view-transactions" class="view-section hidden space-y-4 max-w-5xl mx-auto pt-4 pb-28 px-2 sm:px-4">
        
        <!-- THANH TÌM KIẾM NỔI (FLOATING SEARCH BAR) CHUẨN YOUTUBE -->
        <div id="tx-search-bar" class="sticky top-2 z-[60] transition-all duration-300">
            <div class="relative flex items-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border custom-border rounded-full shadow-lg p-1.5 z-10">
                <i class="fa-solid fa-magnifying-glass absolute left-6 text-primary-500 z-20 pointer-events-none"></i>
                <input type="text" id="filter-search" oninput="window.handleSearchInput(this.value)" onfocus="if(this.value) document.getElementById('search-autocomplete').classList.remove('hidden');" placeholder="Tìm kiếm giao dịch, ghi chú..." autocomplete="off" class="w-full pl-12 pr-24 py-3 bg-transparent font-bold custom-text outline-none placeholder-gray-400 text-sm">
                
                <div class="absolute right-2.5 flex items-center gap-1">
                    <button id="view-mode-btn" onclick="toggleTxViewMode()" class="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Chế độ hiển thị">
                        <i class="fa-solid fa-table-cells-large"></i>
                    </button>
                    <button id="filter-btn" onclick="toggleTxFilter(event)" class="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Lọc">
                        <i class="fa-solid fa-filter"></i>
                    </button>
                </div>
            </div>

            <!-- BẢNG GỢI Ý TÌM KIẾM -->
            <div id="search-autocomplete" class="hidden absolute top-[110%] left-0 right-0 custom-bg-card rounded-[1.5rem] shadow-2xl border custom-border z-[70] max-h-[60vh] overflow-y-auto p-2"></div>

            <!-- BẢNG ĐIỀU KHIỂN LỌC (DROPDOWN) -->
            <div id="filter-dropdown" class="hidden absolute right-0 top-[110%] w-[280px] custom-bg-card/95 backdrop-blur-2xl rounded-3xl shadow-2xl border custom-border z-[70] p-5 transform origin-top-right transition-all">
                <div class="mb-4">
                    <label class="text-[10px] font-black custom-text-secondary uppercase tracking-widest mb-2 flex items-center gap-2"><i class="fa-regular fa-calendar text-primary-500"></i> Thời gian</label>
                    <input type="date" id="tx-date-picker" onchange="setTxFilter('date')" class="w-full bg-gray-50 dark:bg-gray-800/50 text-sm font-bold custom-text outline-none border custom-border rounded-xl px-4 py-3 focus:border-primary-500 transition-colors cursor-pointer">
                    
                    <div class="grid grid-cols-3 gap-2 mt-2">
                        <button onclick="setTxFilter('all')" id="btn-filter-all" class="py-2 text-[10px] font-bold rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 custom-text">Tất cả</button>
                        <button onclick="setTxFilter('today')" id="btn-filter-today" class="py-2 text-[10px] font-bold rounded-lg bg-gray-50 dark:bg-gray-800/50 border custom-border hover:bg-gray-100 custom-text-secondary">Hôm nay</button>
                        <button onclick="setTxFilter('yesterday')" id="btn-filter-yesterday" class="py-2 text-[10px] font-bold rounded-lg bg-gray-50 dark:bg-gray-800/50 border custom-border hover:bg-gray-100 custom-text-secondary">Hôm qua</button>
                    </div>
                </div>

                <div class="mb-4">
                    <label class="text-[10px] font-black custom-text-secondary uppercase tracking-widest mb-2 flex items-center gap-2"><i class="fa-solid fa-wallet text-blue-500"></i> Nguồn tiền</label>
                    <select id="filter-wallet-select" onchange="setTxWalletFilter(this.value)" class="w-full bg-gray-50 dark:bg-gray-800/50 text-sm font-bold custom-text outline-none border custom-border rounded-xl px-4 py-3 cursor-pointer appearance-none">
                        <option value="all">Tất cả ví</option>
                    </select>
                </div>

                <div>
                    <label class="text-[10px] font-black custom-text-secondary uppercase tracking-widest mb-2 flex items-center gap-2"><i class="fa-solid fa-arrow-down-a-z text-rose-500"></i> Sắp xếp</label>
                    <div class="grid grid-cols-2 gap-2">
                        <button onclick="setTxSortOrder('date_desc')" id="sort-date_desc" class="flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-bold custom-primary text-white border border-transparent shadow-sm gap-1"><i class="fa-solid fa-clock"></i> Mới nhất</button>
                        <button onclick="setTxSortOrder('date_asc')" id="sort-date_asc" class="flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-bold bg-gray-50 dark:bg-gray-800/50 border custom-border custom-text-secondary gap-1"><i class="fa-solid fa-clock-rotate-left"></i> Cũ nhất</button>
                        <button onclick="setTxSortOrder('amount_desc')" id="sort-amount_desc" class="flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-bold bg-gray-50 dark:bg-gray-800/50 border custom-border custom-text-secondary gap-1"><i class="fa-solid fa-arrow-down-9-1"></i> Giá giảm</button>
                        <button onclick="setTxSortOrder('amount_asc')" id="sort-amount_asc" class="flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-bold bg-gray-50 dark:bg-gray-800/50 border custom-border custom-text-secondary gap-1"><i class="fa-solid fa-arrow-up-1-9"></i> Giá tăng</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- KHỐI THỐNG KÊ TỔNG QUAN -->
        <div id="tx-summary" class="flex gap-4 mb-2">
            <div class="flex-1 custom-bg-card p-5 rounded-3xl border custom-border shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
                <div class="absolute top-0 right-0 w-20 h-20 bg-success-500/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-125"></div>
                <p class="text-[11px] font-black text-success-500 uppercase tracking-widest mb-1 opacity-90 flex items-center gap-1.5"><i class="fa-solid fa-arrow-trend-down"></i> Thu Tiền</p>
                <p id="sum-inc" class="font-black text-2xl text-success-600 dark:text-success-400">0 ₫</p>
            </div>
            <div class="flex-1 custom-bg-card p-5 rounded-3xl border custom-border shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
                <div class="absolute top-0 right-0 w-20 h-20 bg-danger-500/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-125"></div>
                <p class="text-[11px] font-black text-danger-500 uppercase tracking-widest mb-1 opacity-90 flex items-center gap-1.5"><i class="fa-solid fa-arrow-trend-up"></i> Chi Tiền</p>
                <p id="sum-exp" class="font-black text-2xl text-danger-600 dark:text-danger-400">0 ₫</p>
            </div>
        </div>

        <!-- KHU VỰC DANH SÁCH -->
        <div class="min-h-[300px] relative z-10 w-full">
            <div id="tx-list-container" class="w-full"></div>
            
            <div id="tx-empty" class="hidden flex-col items-center justify-center py-20 px-6 text-center opacity-70 custom-bg-card rounded-[2rem] border custom-border">
                <div class="w-24 h-24 mb-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-4xl text-gray-400 shadow-inner border custom-border">
                    <i class="fa-solid fa-receipt"></i>
                </div>
                <h3 class="text-lg font-black custom-text mb-2">Không có giao dịch nào!</h3>
                <p class="text-sm font-medium custom-text-secondary max-w-[280px]">Thử điều chỉnh lại bộ lọc hoặc bấm dấu + bên dưới để thêm mới nhé.</p>
            </div>
        </div>
    </div>
    `;
    const scrollArea = document.getElementById("main-scroll-area");
    if (scrollArea) scrollArea.insertAdjacentHTML("beforeend", html);
}

// Bắt cóc luồng chuyển trang để bơm UI
const origSwitchViewTx = window.switchView;
window.switchView = function(viewId) {
    if (viewId === "transactions") injectTransactionsUI();
    if (origSwitchViewTx) origSwitchViewTx(viewId);
};

// ==========================================
// 2. KHỞI TẠO UI MODAL CHI TIẾT
// ==========================================
function initTxDetailModal() {
    if (document.getElementById('tx-detail-modal')) return; 

    const modalHtml = `
    <div id="tx-detail-modal" class="fixed inset-0 z-[100000] custom-bg-body transition-transform duration-300 translate-x-full flex flex-col hidden">
        <div class="flex justify-between items-center px-6 py-4 custom-bg-card/80 backdrop-blur-2xl z-20 sticky top-0 border-b custom-border shadow-sm">
            <button onclick="closeTxDetail()" class="w-10 h-10 rounded-full custom-bg-input flex items-center justify-center active:scale-90 transition-transform shadow-sm border custom-border custom-text hover:brightness-95">
                <i class="fa-solid fa-arrow-left"></i>
            </button>
            <h2 class="font-black text-[17px] custom-text tracking-wide uppercase opacity-90">Chi tiết Giao dịch</h2>
            <div class="w-10"></div>
        </div>
        
        <div class="flex-1 overflow-y-auto px-4 sm:px-6 pt-6 pb-32 space-y-6 custom-scrollbar relative w-full" id="tx-detail-content"></div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTxDetailModal);
} else {
    initTxDetailModal();
}

// ==========================================
// 3. AUTOCOMPLETE TÌM KIẾM (YOUTUBE STYLE)
// ==========================================
window.handleSearchInput = (val) => {
    const query = val.trim().toLowerCase();
    const box = document.getElementById("search-autocomplete");

    window.renderTransactions();

    if (!query) {
        box.classList.add("hidden");
        return;
    }

    const removeAccents = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const queryNoAccent = removeAccents(query);

    const results = state.transactions.filter((t) => {
        if (t.category === "transfer") return false;
        if (query === "thu" || query === "thu nhập") return t.type === "income";
        if (query === "chi" || query === "chi tiêu") return t.type === "expense";

        const catName = state.categories.find((c) => c.id === t.category)?.name.toLowerCase() || "";
        const note = (t.note || "").toLowerCase();
        return (
            note.includes(query) || catName.includes(query) ||
            removeAccents(note).includes(queryNoAccent) || removeAccents(catName).includes(queryNoAccent)
        );
    }).slice(0, 10); 

    if (results.length === 0) {
        box.innerHTML = `<div class="text-center py-6 opacity-60"><div class="text-4xl mb-2">👻</div><p class="text-sm custom-text-secondary font-bold">Không tìm thấy "${val}"</p></div>`;
    } else {
        box.innerHTML = results.map((tx) => {
            const isInc = tx.type === "income";
            const cat = state.categories.find((c) => c.id === tx.category) || { name: "Khác", icon: "📦" };
            const wallet = state.wallets.find((w) => w.id === tx.walletId) || { name: "Ví ẩn", icon: "💳" };
            
            const fastImgUrl = tx.image && typeof window.getFastImage === 'function' ? window.getFastImage(tx.image) : tx.image;
            const imgHtml = (tx.image && tx.image.length > 50)
                ? `<img src="${fastImgUrl}" class="w-12 h-12 object-cover rounded-xl shrink-0 border custom-border shadow-sm">`
                : `<div class="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl shrink-0 border custom-border shadow-inner">${cat.icon}</div>`;

            return `
            <div onclick="openTxDetail('${tx.id}'); document.getElementById('search-autocomplete').classList.add('hidden');"
                 class="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 w-full">
                ${imgHtml}
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-0.5">
                        <p class="font-black text-sm custom-text truncate">${cat.name}</p>
                        <span class="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded bg-white dark:bg-gray-700 custom-text-secondary border custom-border shadow-sm">${wallet.icon} ${wallet.name}</span>
                    </div>
                    <p class="text-[11px] custom-text-secondary truncate font-medium">${tx.note || "Không có ghi chú"}</p>
                </div>
                <div class="text-right shrink-0 ml-2">
                    <p class="font-black text-sm ${isInc ? "text-success-500" : "text-danger-500"}">${isInc ? "+" : "-"}${formatMoney(tx.amount)}</p>
                </div>
            </div>`;
        }).join("");
    }
    box.classList.remove("hidden");
};

// Đóng dropdown khi click ra ngoài
document.addEventListener("click", function (e) {
    const searchBox = document.getElementById("search-autocomplete");
    const searchInput = document.getElementById("filter-search");
    const filterDropdown = document.getElementById("filter-dropdown");
    const filterBtn = document.getElementById("filter-btn");

    if (searchBox && !searchBox.contains(e.target) && e.target !== searchInput) {
        searchBox.classList.add("hidden");
    }
    
    if (filterDropdown && !filterDropdown.contains(e.target) && e.target !== filterBtn && !filterBtn.contains(e.target)) {
        filterDropdown.classList.add("hidden");
    }
});

// ==========================================
// 4. BỘ CẢM BIẾN VUỐT THẺ (SWIPE ACTIONS) ĐÃ FIX HOÀN CHỈNH
// ==========================================
window.currentlyOpenContent = null; 

window.initSwipeActions = () => {
    // Chỉ chọn những thằng chưa được gán động cơ
    const swipeItems = document.querySelectorAll(".swipe-item:not(.swipe-inited)");
    
    swipeItems.forEach((item) => {
        item.classList.add("swipe-inited");
        
        const content = item.querySelector(".swipe-content");
        const actionsBox = item.querySelector(".actions-container");
        
        // Cực kỳ quan trọng: Nếu đéo có 2 thẻ này thì bỏ qua ngay để không văng lỗi
        if (!content || !actionsBox) return;

        let startX = 0, startY = 0;
        let currentTranslate = 0, startTranslate = 0;
        let isDragging = false, isScrolling = false; 
        let maxOpen = 0; 

        item.addEventListener("touchstart", (e) => {
            // Lấy độ rộng của mâm chứa nút
            maxOpen = actionsBox.offsetWidth || 180; 
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
            isScrolling = false;
            startTranslate = currentTranslate;
            content.style.transition = "none";

            // Tự động đóng thẻ cũ nếu đang mở thẻ khác
            if (window.currentlyOpenContent && window.currentlyOpenContent !== content) {
                window.currentlyOpenContent.style.transition = "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)";
                window.currentlyOpenContent.style.transform = "translateX(0px)";
                window.currentlyOpenContent.dataset.translate = 0;
                window.currentlyOpenContent = null;
            }
        }, { passive: true });

        item.addEventListener("touchmove", (e) => {
            if (!isDragging) return;
            const diffX = e.touches[0].clientX - startX;
            const diffY = e.touches[0].clientY - startY;

            // Phân biệt vuốt dọc (cuộn trang) vs vuốt ngang
            if (Math.abs(diffY) > Math.abs(diffX) + 5) isScrolling = true;
            if (isScrolling) { isDragging = false; return; }

            let targetTranslate = startTranslate + diffX;
            
            // Giới hạn kéo
            if (targetTranslate > 0) targetTranslate = targetTranslate * 0.15; // Kéo qua phải hơi cứng
            else if (targetTranslate < -maxOpen) {
                const overpull = targetTranslate + maxOpen;
                targetTranslate = -maxOpen + (overpull * 0.15); // Kéo qua trái lố thì rít lại
            }
            content.style.transform = `translateX(${targetTranslate}px)`;
        }, { passive: true });

        item.addEventListener("touchend", () => {
            if (!isDragging || isScrolling) return;
            isDragging = false;

            const transformMatrix = window.getComputedStyle(content).transform;
            if (transformMatrix !== 'none') currentTranslate = parseFloat(transformMatrix.split(',')[4]);

            // Hiệu ứng lò xo giật về mượt mà
            content.style.transition = "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)";

            // Nếu vuốt quá nửa thì mở toác ra luôn
            if (currentTranslate < -(maxOpen / 2.5)) {
                currentTranslate = -maxOpen;
                window.currentlyOpenContent = content;
            } else {
                currentTranslate = 0;
                if (window.currentlyOpenContent === content) window.currentlyOpenContent = null;
            }
            content.dataset.translate = currentTranslate;
            content.style.transform = `translateX(${currentTranslate}px)`;
        });
    });
};

// Theo dõi DOM thay đổi để nạp động cơ
if (!window.swipeObserverInited) {
    window.swipeObserverInited = true;
    const observer = new MutationObserver((mutations) => {
        let shouldInit = false;
        mutations.forEach(m => {
            if (m.addedNodes.length > 0) shouldInit = true;
        });
        if (shouldInit) setTimeout(() => window.initSwipeActions(), 20);
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

// ==========================================
// 5. BỘ NÃO RENDER DANH SÁCH & LAZY LOAD
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

    const specificDate = document.getElementById("tx-date-picker")?.value;
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // Lọc
    let filteredTx = state.transactions.filter((t) => {
        if (t.category === "transfer") return false;

        let matchS = false;
        const catName = state.categories.find((c) => c.id === t.category)?.name.toLowerCase() || "";
        const note = (t.note || "").toLowerCase();
        const walletName = state.wallets.find((w) => w.id === t.walletId)?.name.toLowerCase() || "";

        if (["thu", "thu nhập", "thu chi", "thu tiền"].includes(searchInput)) matchS = t.type === "income";
        else if (["chi", "chi tiêu", "chi tiền"].includes(searchInput)) matchS = t.type === "expense";
        else if (searchInput === "") matchS = true;
        else {
            matchS = note.includes(searchInput) || catName.includes(searchInput) || walletName.includes(searchInput) ||
                     removeAccents(note).includes(searchNoAccent) || removeAccents(catName).includes(searchNoAccent) || removeAccents(walletName).includes(searchNoAccent);
        }

        let matchDate = true;
        if (window.dateFilter === "today") matchDate = t.date.startsWith(today);
        else if (window.dateFilter === "yesterday") matchDate = t.date.startsWith(yesterday);
        else if (window.dateFilter === "date" && specificDate) matchDate = t.date.startsWith(specificDate);

        let matchWallet = window.walletFilter === "all" || t.walletId === window.walletFilter;

        return matchS && matchDate && matchWallet;
    });

    // Xếp
    filteredTx.sort((a, b) => {
        if (window.txSortOrder === "amount_desc") return b.amount - a.amount;
        if (window.txSortOrder === "amount_asc") return a.amount - b.amount;
        if (window.txSortOrder === "date_asc") return new Date(a.date) - new Date(b.date);
        return new Date(b.date) - new Date(a.date);
    });

    window.currentFilteredTxs = filteredTx;
    window.currentTxPage = 1;

    // Tổng kết
    const inc = filteredTx.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
    const exp = filteredTx.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);

    const sumIncEl = document.getElementById("sum-inc");
    const sumExpEl = document.getElementById("sum-exp");
    if (sumIncEl && typeof window.animateMoney === 'function') window.animateMoney("sum-inc", inc, 800);
    else if (sumIncEl) sumIncEl.innerText = formatMoney(inc);
    if (sumExpEl && typeof window.animateMoney === 'function') window.animateMoney("sum-exp", exp, 800);
    else if (sumExpEl) sumExpEl.innerText = formatMoney(exp);

    const container = document.getElementById("tx-list-container");
    const emptyState = document.getElementById("tx-empty");
    if (!container) return;

    if (filteredTx.length === 0) {
        container.innerHTML = "";
        container.parentElement.classList.remove("custom-bg-card", "border", "custom-border", "shadow-sm");
        if(emptyState) emptyState.classList.remove("hidden");
        if(emptyState) emptyState.classList.add("flex");
        return;
    }

    if(emptyState) emptyState.classList.add("hidden");
    if(emptyState) emptyState.classList.remove("flex");

    const pageTxs = filteredTx.slice(0, window.txPageSize);
    const html = window.generateTxHtml(pageTxs);

    let innerWrapperClass = window.txViewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-3 gap-3" : "flex flex-col gap-3 w-full"; // Đã sửa padding hở
    container.parentElement.classList.remove("custom-bg-card", "border", "custom-border", "shadow-sm"); // Bỏ khung bọc ngoài

    container.innerHTML = `
        <div id="tx-inner-list" class="${innerWrapperClass} w-full">
            ${html}
        </div>
        <div id="tx-load-sensor" class="w-full h-14 flex items-center justify-center mt-2 opacity-50">
            <i id="tx-loading-icon" class="fa-solid fa-circle-notch fa-spin text-2xl text-primary-500 hidden"></i>
        </div>
    `;

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
    const icon = document.getElementById("tx-loading-icon");

    if (nextTxs.length === 0) {
        if (window.txObserver) window.txObserver.disconnect();
        return;
    }

    if (icon) icon.classList.remove("hidden");

    setTimeout(() => {
        const html = window.generateTxHtml(nextTxs);
        const innerList = document.getElementById("tx-inner-list");
        if (innerList) innerList.insertAdjacentHTML("beforeend", html);
        
        window.currentTxPage++;
        if (typeof window.initSwipeActions === "function") window.initSwipeActions();
        if (icon) icon.classList.add("hidden");
    }, 150);
};

// ==========================================
// 6. COMPONENT VẼ CARD (FIXED KHOẢNG CÁCH, NÚT, CLICK)
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

        // STICKY HEADER NGÀY
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

                headerHtml = `
                <div class="col-span-full sticky top-[72px] z-30 pt-2 pb-3 w-full bg-custom-body break-inside-avoid">
                    <div class="px-5 py-3 custom-bg-card border custom-border rounded-[1.25rem] shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex justify-between items-center bg-opacity-95 backdrop-blur-xl">
                        <span class="text-[13px] font-black custom-text">${dayName}</span>
                        <div class="text-[10px] font-bold flex gap-2 tracking-wide">
                            ${dInc > 0 ? `<span class="text-success-500 bg-success-50 dark:bg-success-900/30 px-2 py-0.5 rounded-lg border border-success-100 dark:border-success-800">+${formatMoney(dInc)}</span>` : ""}
                            ${dExp > 0 ? `<span class="text-danger-500 bg-danger-50 dark:bg-danger-900/30 px-2 py-0.5 rounded-lg border border-danger-100 dark:border-danger-800">-${formatMoney(dExp)}</span>` : ""}
                        </div>
                    </div>
                </div>`;
            }
        }

        if (window.txViewMode === "grid") {
            const fastImgUrl = hasImage && typeof window.getFastImage === 'function' ? window.getFastImage(tx.image) : tx.image;
            html += headerHtml + `
            <div onclick="openTxDetail('${tx.id}')" class="relative flex flex-col rounded-3xl overflow-hidden custom-bg-card border custom-border shadow-sm cursor-pointer group hover:-translate-y-1 active:scale-95 transition-all w-full">
                <button onclick="event.stopPropagation(); deleteTransaction('${tx.id}')" class="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/90 text-white flex items-center justify-center text-xs backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-red-600 shadow-lg"><i class="fa-solid fa-trash"></i></button>
                <div class="relative w-full ${hasImage ? "aspect-square" : "h-28"} bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center">
                    ${hasImage ? `<img src="${fastImgUrl}" loading="lazy" class="w-full h-full object-cover">` : `<span class="text-5xl drop-shadow-sm">${cat.icon}</span>`}
                    <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent pointer-events-none"></div>
                    <div class="absolute top-2.5 left-2.5 right-10 flex items-center gap-2 z-10">
                        <div class="w-7 h-7 rounded-full ${cat.color} flex items-center justify-center text-[11px] shadow-md border border-white/20 backdrop-blur-md shrink-0">${cat.icon}</div>
                        <span class="text-white text-xs font-bold drop-shadow-md truncate tracking-wide">${cat.name}</span>
                    </div>
                </div>
                <div class="p-4 bg-white dark:bg-gray-800 flex flex-col justify-between flex-1">
                    <p class="font-bold text-xs custom-text leading-snug line-clamp-2 mb-2">${tx.note || "..."}</p>
                    <div>
                        <p class="font-black text-base ${isInc ? "text-success-500" : "text-danger-500"} mb-1">${isInc ? "+" : "-"}${formatMoney(tx.amount)}</p>
                        <div class="flex items-center justify-between text-[9px] font-bold custom-text-secondary">
                            <span><i class="fa-regular fa-clock"></i> ${txTime}</span>
                            <span class="truncate max-w-[60%]"><i class="fa-solid fa-wallet"></i> ${wallet.name}</span>
                        </div>
                    </div>
                </div>
            </div>`;
        } else {
            // DÙNG HÀM VẼ THẺ VUỐT BÊN DƯỚI
            html += headerHtml + window.createSwipeableTxCard(tx);
        }
    });
    return html;
};

// VẼ THẺ LIST (ĐÃ SỬA CLICK SỰ KIỆN & OVERFLOW ẨN MẤT NÚT)
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
        ? `<img src="${fastImgUrl}" loading="lazy" class="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity" onclick="event.stopPropagation(); openImageModal('${fastImgUrl}')">` 
        : `<span class="text-3xl drop-shadow-md">${cat.icon}</span>`;

    const latStr = tx.lat ? tx.lat : "null";
    const lngStr = tx.lng ? tx.lng : "null";

    // CSS Xương Sống: .relative.w-full và absolute inset-y-0
    return `
    <div class="relative w-full swipe-item group bg-transparent">
        
        <!-- MÂM NÚT ĐÁY (Đã sửa z-0 và w-[180px]) -->
        <div class="actions-container absolute inset-y-0 right-0 flex items-center justify-end gap-2.5 pr-2 z-0 w-[180px]">
            <button onclick="viewTransactionOnMap('${tx.id}', ${latStr}, ${lngStr})" class="w-12 h-12 rounded-[1rem] bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 flex items-center justify-center text-xl shadow-sm active:scale-90 border custom-border transition-transform" title="Bản đồ"><i class="fa-solid fa-map-location-dot"></i></button>
            <button onclick="openEditTransaction('${tx.id}')" class="w-12 h-12 rounded-[1rem] bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400 flex items-center justify-center text-xl shadow-sm active:scale-90 border custom-border transition-transform"><i class="fa-solid fa-pen"></i></button>
            <button onclick="deleteTransaction('${tx.id}')" class="w-12 h-12 rounded-[1rem] bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400 flex items-center justify-center text-xl shadow-sm active:scale-90 border custom-border transition-transform"><i class="fa-solid fa-trash"></i></button>
        </div>

        <!-- THẺ CHÍNH (Đã sửa Flexbox để chống đè chữ) -->
        <div class="swipe-content relative z-10 w-full p-4 custom-bg-card border custom-border rounded-[1.75rem] shadow-[0_2px_10px_rgba(0,0,0,0.03)] cursor-pointer hover:shadow-md transition-all active:scale-[0.98]" onclick="openTxDetail('${tx.id}')">
            <div class="flex items-start gap-4 w-full">
                <!-- Vùng Trái: Icon -->
                <div class="w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center border border-black/5 dark:border-white/5 shadow-inner overflow-hidden ${cat.color}">
                    ${imgHtml}
                </div>

                <!-- Vùng Phải: Nội dung (Dùng min-w-0 để kích hoạt truncate) -->
                <div class="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                    
                    <!-- Hàng 1: Tên Danh mục & Tiền -->
                    <div class="flex justify-between items-start mb-1 w-full gap-2">
                        <p class="font-black text-base custom-text truncate leading-tight">${cat.name}</p>
                        <p class="font-black text-[17px] tracking-tight shrink-0 ${isInc ? 'text-success-500' : 'text-danger-500'}">${isInc ? '+' : '-'}${formatMoney(tx.amount)}</p>
                    </div>
                    
                    <!-- Hàng 2: Ghi chú -->
                    <p class="text-xs font-medium custom-text-secondary truncate w-full mb-2.5">${tx.note || "..."}</p>

                    <!-- Hàng 3: Thẻ Tags và Giờ (Dùng flex-wrap cho Tags và Giữ cứng Giờ) -->
                    <div class="flex items-center justify-between w-full gap-3 mt-auto pt-2 border-t border-dashed custom-border">
                        <!-- Khối bọc thẻ: Ép không cho thẻ đè chữ -->
                        <div class="flex gap-2 items-center flex-1 min-w-0 overflow-hidden">
                            <span class="text-[9px] font-bold px-2 py-1 rounded-md custom-bg-input custom-text-secondary border custom-border truncate uppercase tracking-widest flex-shrink-0 max-w-[50%]"><i class="fa-solid fa-wallet"></i> ${wallet.name}</span>
                            ${tx.locationName ? `<span class="text-[9px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-md border border-rose-100 dark:border-rose-900/50 uppercase tracking-widest truncate flex-1 min-w-0"><i class="fa-solid fa-location-dot"></i> ${locStr}</span>` : ''}
                        </div>
                        
                        <!-- Cột báo Giờ: Giữ nguyên size ko bị ép nhỏ -->
                        <span class="text-[10px] font-bold text-gray-400 shrink-0"><i class="fa-regular fa-clock"></i> ${txTime}</span>
                    </div>
                </div>
            </div>
            
            <!-- Vạch màu bên trái -->
            <div class="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 rounded-r-full ${isInc ? 'bg-success-400' : 'bg-transparent'}"></div>
        </div>
    </div>`;
};

// ==========================================
// 7. CÁC HÀM XỬ LÝ LỌC & TÌM KIẾM
// ==========================================
window.setTxFilter = (val) => {
    window.dateFilter = val;
    if (val !== "date") document.getElementById("tx-date-picker").value = "";
    
    ['all', 'today', 'yesterday'].forEach(id => {
        const btn = document.getElementById(`btn-filter-${id}`);
        if (btn) btn.className = id === val ? "py-2 text-[10px] font-bold rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-400 dark:border-gray-500 custom-text shadow-inner" : "py-2 text-[10px] font-bold rounded-lg bg-gray-50 dark:bg-gray-800/50 border custom-border hover:bg-gray-100 custom-text-secondary";
    });

    window.renderTransactions();
};

window.toggleTxFilter = (event) => {
    event.stopPropagation();
    const dropdown = document.getElementById("filter-dropdown");
    if (dropdown.classList.contains("hidden")) {
        const sel = document.getElementById("filter-wallet-select");
        if (sel) {
            sel.innerHTML = '<option value="all">Tất cả ví</option>' + state.wallets.map(w => `<option value="${w.id}" ${window.walletFilter === w.id ? "selected" : ""}>${w.icon} ${w.name}</option>`).join("");
        }
        dropdown.classList.remove("hidden");
    } else dropdown.classList.add("hidden");
};

window.setTxWalletFilter = (val) => {
    window.walletFilter = val;
    window.renderTransactions();
};

window.toggleTxViewMode = () => {
    window.txViewMode = window.txViewMode === "list" ? "grid" : "list";
    const btnIcon = document.querySelector("#view-mode-btn i");
    if (btnIcon) btnIcon.className = window.txViewMode === "grid" ? "fa-solid fa-list" : "fa-solid fa-table-cells-large";
    window.renderTransactions();
    if (typeof playSound === 'function') playSound("pop");
};

window.setTxSortOrder = (val) => {
    window.txSortOrder = val;
    ["date_desc", "date_asc", "amount_desc", "amount_asc"].forEach((id) => {
        const btn = document.getElementById("sort-" + id);
        if (btn) {
            btn.className = (id === val)
                ? "flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-bold custom-primary text-white border border-transparent shadow-sm gap-1"
                : "flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-bold bg-gray-50 dark:bg-gray-800/50 border custom-border custom-text-secondary gap-1";
        }
    });
    window.renderTransactions();
};

// ==========================================
// 8. CÁC HÀM HIỂN THỊ CHI TIẾT
// ==========================================
window.openTxDetail = (txId) => {
    if (!state || !state.transactions) return;
    const tx = state.transactions.find(t => t.id === txId);
    if (!tx) return;

    const modal = document.getElementById("tx-detail-modal");
    const content = document.getElementById("tx-detail-content");
    
    const cat = state.categories.find(c => c.id === tx.category) || { name: "Khác", icon: "📦", color: "bg-gray-200 text-gray-600", type: "expense" };
    const wallet = state.wallets.find(w => w.id === tx.walletId) || { name: "Ví ẩn" };
    const isInc = tx.type === 'income' || cat.type === 'income';
    
    const d = new Date(tx.date);
    const dateStr = !isNaN(d) ? d.toLocaleDateString("vi-VN", { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) : tx.date;
    const timeStr = !isNaN(d) ? d.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }) : "Không ghi nhận";

    const heroGradient = isInc 
        ? "bg-gradient-to-br from-emerald-400/20 to-teal-500/5 dark:from-emerald-900/40 dark:to-teal-900/10 border-emerald-500/20" 
        : "bg-gradient-to-br from-rose-400/20 to-orange-500/5 dark:from-rose-900/40 dark:to-orange-900/10 border-rose-500/20";

    content.innerHTML = `
        <div class="flex flex-col items-center justify-center p-8 rounded-[2rem] border ${heroGradient} custom-bg-card shadow-sm relative overflow-hidden">
            <div class="absolute -top-10 -right-10 w-32 h-32 rounded-full ${isInc ? 'bg-emerald-500/10' : 'bg-rose-500/10'} blur-2xl pointer-events-none"></div>
            <div class="relative z-10 w-24 h-24 rounded-[2rem] flex items-center justify-center text-5xl mb-6 shadow-lg border-2 border-white/50 dark:border-white/10 ${cat.color}"><span class="drop-shadow-sm">${cat.icon}</span></div>
            <h3 class="relative z-10 text-[46px] font-black ${isInc ? 'text-success-500' : 'custom-text dark:text-white'} tracking-tighter leading-none mb-3">${isInc ? '+' : '-'}${formatMoney(tx.amount)}</h3>
            <span class="relative z-10 text-xs font-black custom-text-secondary uppercase tracking-widest bg-white/60 dark:bg-black/20 px-4 py-1.5 rounded-full border border-black/5 dark:border-white/5 shadow-sm">${cat.name}</span>
        </div>

        <div class="custom-bg-card rounded-[2rem] border custom-border shadow-sm overflow-hidden">
            <div class="flex justify-between items-center p-6 border-b border-dashed custom-border dark:border-gray-800/50">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 shadow-inner"><i class="fa-solid fa-wallet text-sm"></i></div>
                    <span class="text-xs font-black custom-text-secondary uppercase tracking-widest">Ví giao dịch</span>
                </div>
                <span class="text-sm font-black custom-text custom-primary px-4 py-2 rounded-xl border custom-border shadow-sm">${wallet.name}</span>
            </div>
            <div class="flex justify-between items-center p-6 border-b border-dashed custom-border dark:border-gray-800/50">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-500 shadow-inner"><i class="fa-regular fa-calendar-days text-sm"></i></div>
                    <span class="text-xs font-black custom-text-secondary uppercase tracking-widest">Thời gian</span>
                </div>
                <div class="text-right"><span class="block text-sm font-black custom-text">${dateStr}</span><span class="block text-[11px] font-bold text-gray-400 mt-0.5">${timeStr}</span></div>
            </div>
            <div class="p-6 border-b border-dashed custom-border dark:border-gray-800/50">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-500 shadow-inner"><i class="fa-solid fa-align-left text-sm"></i></div>
                    <span class="text-xs font-black custom-text-secondary uppercase tracking-widest">Ghi chú</span>
                </div>
                <p class="text-sm font-bold custom-text custom-bg-input p-5 rounded-[1.25rem] border custom-border leading-relaxed min-h-[70px] shadow-inner">${tx.note || '<span class="italic text-gray-400 font-medium">Không có ghi chú...</span>'}</p>
            </div>
            ${tx.locationName ? `<div class="p-6">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-500 shadow-inner"><i class="fa-solid fa-location-dot text-sm"></i></div>
                    <span class="text-xs font-black custom-text-secondary uppercase tracking-widest">Vị trí</span>
                </div>
                <div class="flex items-start gap-2.5 text-sm font-black text-rose-600 bg-rose-50 dark:bg-rose-900/20 p-5 rounded-[1.25rem] border border-rose-100 dark:border-rose-900/50 shadow-inner"><i class="fa-solid fa-map-pin mt-1 shrink-0"></i> <span class="leading-snug">${tx.locationName}</span></div>
            </div>` : ''}
        </div>

        ${tx.image && tx.image.length > 50 ? `
        <div class="custom-bg-card rounded-[2rem] border custom-border p-6 shadow-sm">
            <div class="flex items-center gap-3 mb-5">
                <div class="w-10 h-10 rounded-full bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center text-pink-500 shadow-inner"><i class="fa-solid fa-camera text-sm"></i></div>
                <span class="text-xs font-black custom-text-secondary uppercase tracking-widest">Chứng từ đính kèm</span>
            </div>
            <div class="relative rounded-2xl overflow-hidden border custom-border shadow-sm group cursor-pointer" onclick="openImageModal('${typeof window.getFastImage === 'function' ? window.getFastImage(tx.image) : tx.image}')">
                <img src="${typeof window.getFastImage === 'function' ? window.getFastImage(tx.image) : tx.image}" loading="lazy" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"><div class="bg-white/90 text-black px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest backdrop-blur-sm shadow-lg"><i class="fa-solid fa-expand mr-1"></i> Phóng to</div></div>
            </div>
        </div>` : ''}

        <div class="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white dark:from-gray-900 dark:via-gray-900 to-transparent pt-12 z-30 flex gap-4">
            <button onclick="openEditTransaction('${tx.id}'); closeTxDetail();" class="flex-1 py-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 custom-text rounded-2xl font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2 border custom-border shadow-sm"><i class="fa-solid fa-pen"></i> Chỉnh sửa</button>
            <button onclick="deleteTransaction('${tx.id}'); closeTxDetail();" class="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black text-sm shadow-[0_8px_20px_rgba(244,63,94,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2"><i class="fa-solid fa-trash"></i> Xóa bỏ</button>
        </div>
    `;

    modal.classList.remove("hidden");
    if (typeof playSound === 'function') playSound("click");
    setTimeout(() => { modal.classList.remove("translate-x-full"); modal.classList.add("translate-x-0"); }, 10);
};

window.closeTxDetail = () => {
    const modal = document.getElementById("tx-detail-modal");
    if (!modal) return;
    modal.classList.remove("translate-x-0");
    modal.classList.add("translate-x-full");
    setTimeout(() => { modal.classList.add("hidden"); }, 300);
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
    if (!lat || !lng) return alert("Giao dịch này không có gắn vị trí (GPS) đại ka ơi!");
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
    if (document.getElementById("tx-date-picker")) document.getElementById("tx-date-picker").value = "";
    window.dateFilter = "all";
    window.walletFilter = "all";

    if (typeof switchView === 'function') switchView("transactions");

    setTimeout(() => {
        const txEl = document.querySelector(`div.swipe-content[onclick*="${txId}"], div.aspect-\\[3\\/4\\][onclick*="${txId}"]`);
        if (txEl) {
            txEl.scrollIntoView({ behavior: "smooth", block: "center" });
            const oldBorder = txEl.style.border;
            const oldBg = txEl.style.backgroundColor;
            const oldTransform = txEl.style.transform;

            txEl.style.transition = "all 0.3s ease";
            txEl.style.border = "3px solid var(--primary-hue)"; 
            txEl.style.backgroundColor = "var(--bg-primary-soft)"; 
            txEl.style.transform = "scale(1.02)"; 

            if (typeof playSound === "function") playSound("success");
            setTimeout(() => {
                txEl.style.border = oldBorder;
                txEl.style.backgroundColor = oldBg;
                txEl.style.transform = oldTransform;
            }, 2500);
        } else alert("Lỗi: Không tìm thấy giao dịch trên màn hình!");
    }, 400);
};