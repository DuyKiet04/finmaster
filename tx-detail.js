// ==============================================================
// FILE: tx-detail.js - TRUNG TÂM XỬ LÝ TOÀN BỘ NGHIỆP VỤ GIAO DỊCH
// ==============================================================

window.txViewMode = "list";
window.txSortOrder = "date_desc"; 
window.dateFilter = "all";
window.walletFilter = "all";
window.lastDateGroup = ""; 

// ==========================================
// 1. KHỞI TẠO UI (MODAL CHI TIẾT) - GIAO DIỆN SIÊU MƯỢT KÍNH MỜ
// ==========================================
function initTxDetailModal() {
    if (document.getElementById('tx-detail-modal')) return; 

    const modalHtml = `
    <div id="tx-detail-modal" class="fixed inset-0 z-[100000] custom-bg-body transition-transform duration-300 translate-x-full flex flex-col hidden">
        <!-- Header Kính mờ -->
        <div class="flex justify-between items-center px-6 py-4 custom-bg-card dark:bg-gray-900/60 backdrop-blur-2xl z-20 sticky top-0 border-b border-gray-200/50 dark:border-gray-800/50">
            <button onclick="closeTxDetail()" class="w-10 h-10 rounded-full custom-bg-card flex items-center justify-center active:scale-90 transition-transform shadow-sm border custom-border custom-text hover:brightness-95">
                <i class="fa-solid fa-arrow-left"></i>
            </button>
            <h2 class="font-black text-[17px] custom-text tracking-wide uppercase opacity-90">Chi tiết Giao dịch</h2>
            <div class="w-10"></div>
        </div>
        
        <!-- Nội dung chi tiết (Sẽ cuộn bên dưới Header và Bottom Bar) -->
        <div class="flex-1 overflow-y-auto px-5 pt-6 pb-32 space-y-6 custom-scrollbar relative" id="tx-detail-content">
        </div>
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
// 2. THUẬT TOÁN VUỐT THẺ VẬT LÝ (TỰ ĐỘNG NHẬN DIỆN MỌI NƠI)
// ==========================================
window.currentlyOpenContent = null; // Biến toàn cục để nhớ thẻ nào đang mở

window.initSwipeActions = () => {
    // 🔥 CHỈ TÌM NHỮNG THẺ CHƯA ĐƯỢC GẮN ĐỘNG CƠ (tránh gắn trùng 2 lần gây giật lag)
    const swipeItems = document.querySelectorAll(".swipe-item:not(.swipe-inited)");
    
    swipeItems.forEach((item) => {
        item.classList.add("swipe-inited"); // Đóng mộc "Đã kiểm định"
        
        const content = item.querySelector(".swipe-content");
        const actionsBox = item.querySelector(".actions-container");
        if (!content || !actionsBox) return;

        let startX = 0, startY = 0;
        let currentTranslate = 0, startTranslate = 0;
        let isDragging = false, isScrolling = false; 
        let maxOpen = 0; 

        item.addEventListener("touchstart", (e) => {
            maxOpen = actionsBox.offsetWidth || 150; 
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
            isScrolling = false;
            startTranslate = currentTranslate;
            content.style.transition = "none";

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

            if (Math.abs(diffY) > Math.abs(diffX) + 5) isScrolling = true;
            if (isScrolling) { isDragging = false; return; }

            let targetTranslate = startTranslate + diffX;
            if (targetTranslate > 0) targetTranslate = targetTranslate * 0.15; 
            else if (targetTranslate < -maxOpen) {
                const overpull = targetTranslate + maxOpen;
                targetTranslate = -maxOpen + (overpull * 0.15); 
            }
            content.style.transform = `translateX(${targetTranslate}px)`;
        }, { passive: true });

        item.addEventListener("touchend", () => {
            if (!isDragging || isScrolling) return;
            isDragging = false;

            const transformMatrix = window.getComputedStyle(content).transform;
            if (transformMatrix !== 'none') currentTranslate = parseFloat(transformMatrix.split(',')[4]);

            content.style.transition = "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)";

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

// 🔥 SIÊU VŨ KHÍ: TỰ ĐỘNG BẮT SỰ KIỆN TOÀN APP (MUTATION OBSERVER) 🔥
if (!window.swipeObserverInited) {
    window.swipeObserverInited = true;
    const observer = new MutationObserver((mutations) => {
        let shouldInit = false;
        mutations.forEach(m => {
            if (m.addedNodes.length > 0) shouldInit = true;
        });
        
        if (shouldInit) {
            // Đợi HTML vẽ xong hẳn (20ms) rồi mới gắn động cơ
            setTimeout(() => { window.initSwipeActions(); }, 20);
        }
    });
    
    // Khởi động Camera giám sát toàn bộ màn hình
    observer.observe(document.body, { childList: true, subtree: true });
}

// ==========================================
// 3. COMPONENT: VẼ 1 THẺ GIAO DỊCH (GỌN GÀNG, BO GÓC SANG TRỌNG)
// ==========================================
window.createSwipeableTxCard = (tx) => {
    const cat = state.categories.find(c => c.id === tx.category) || { name: 'Khác', icon: '📦', color: 'bg-gray-100 text-gray-600' };
    const wallet = state.wallets.find(w => w.id === tx.walletId) || { name: 'Ví ẩn', icon: '💳' };
    const isInc = tx.type === 'income' || cat.type === 'income';
    
    const timeStr = typeof window.formatDateTime === 'function' ? window.formatDateTime(tx.date) : tx.date;
    const locStr = tx.locationName && typeof window.formatShortAddress === 'function' ? window.formatShortAddress(tx.locationName) : tx.locationName;
    const amtStr = typeof window.formatMoney === 'function' ? window.formatMoney(tx.amount) : tx.amount;

    const hasImage = tx.image && tx.image.length > 50;
    
    // 🔥 ĐÃ ÁP DỤNG CÔNG NGHỆ LÕI BLOB VÀ LAZY LOAD Ở ĐÂY 🔥
    const fastImgUrl = hasImage && typeof window.getFastImage === 'function' ? window.getFastImage(tx.image) : tx.image;
    
    const imgHtml = hasImage 
        ? `<img src="${fastImgUrl}" loading="lazy" class="w-full h-full object-cover cursor-pointer" onclick="event.stopPropagation(); openImageModal('${fastImgUrl}')">` 
        : `<span class="text-2xl drop-shadow-sm">${cat.icon}</span>`;

    let splitInfoHtml = "";
    if (tx.isSplit && tx.splitDetails && tx.splitDetails.length > 0) {
        splitInfoHtml = `<div class="mt-1 flex flex-wrap gap-1">${tx.splitDetails.map(d => `<span class="custom-bg-primary-soft text-primary-600 dark:text-primary-400 border border-primary-200/50 dark:border-primary-800/50 text-[9px] px-1.5 py-0.5 rounded font-bold">${d}</span>`).join("")}</div>`;
    }

    const latStr = tx.lat ? tx.lat : "null";
    const lngStr = tx.lng ? tx.lng : "null";

    return `
    <div class="relative mb-3 swipe-item group bg-transparent">
        
        <!-- LỚP ĐÁY: 3 NÚT TRÒN ĐỘC LẬP -->
        <div class="actions-container absolute inset-y-0 right-0 flex items-center justify-end gap-2 pr-1 z-0 w-[180px]">
            <button onclick="viewTransactionOnMap('${tx.id}', ${latStr}, ${lngStr})" class="w-11 h-11 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 flex items-center justify-center text-lg shadow-sm active:scale-90 transition-transform" title="Bản đồ"><i class="fa-solid fa-map-location-dot"></i></button>
            <button onclick="openEditTransaction('${tx.id}')" class="w-11 h-11 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400 flex items-center justify-center text-lg shadow-sm active:scale-90 transition-transform"><i class="fa-solid fa-pen"></i></button>
            <button onclick="deleteTransaction('${tx.id}')" class="w-11 h-11 rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 flex items-center justify-center text-lg shadow-sm active:scale-90 transition-transform"><i class="fa-solid fa-trash"></i></button>
        </div>

        <!-- LỚP NỔI: THẺ GIAO DỊCH CHÍNH -->
        <div class="swipe-content relative z-10 w-full p-3.5 custom-bg-card dark:bg-gray-800 border custom-border rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] cursor-pointer will-change-transform hover:shadow-md transition-shadow" onclick="openTxDetail('${tx.id}')">
            <div class="flex items-center gap-4">
                <!-- Icon to, vuông bo góc tròn -->
                <div class="w-[52px] h-[52px] shrink-0 rounded-[18px] flex items-center justify-center text-2xl ${cat.color} overflow-hidden border border-black/5 dark:border-white/5 shadow-inner relative z-20">
                    ${imgHtml}
                </div>

                <!-- Cột thông tin -->
                <div class="flex-1 min-w-0 pointer-events-none">
                    <div class="flex items-center justify-between mb-0.5">
                        <p class="font-black text-[15px] custom-text truncate pr-2">${cat.name}</p>
                        <p class="font-black text-[15px] ${isInc ? 'text-success-500' : 'custom-text dark:text-gray-100'} shrink-0">${isInc ? '+' : '-'}${amtStr}</p>
                    </div>
                    
                    <div class="flex items-center gap-1.5 mb-1.5">
                        <span class="text-[10px] font-bold text-gray-500 truncate max-w-[60%]">${tx.note || "Không có ghi chú"}</span>
                        ${tx.note ? '<span class="text-gray-300 dark:text-gray-600 text-[10px]">•</span>' : ''}
                        <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-md custom-bg-body custom-text-secondary border custom-border truncate">${wallet.icon} ${wallet.name}</span>
                    </div>

                    ${splitInfoHtml}

                    <div class="flex items-center justify-between mt-1 pt-1 border-t border-gray-100 dark:border-gray-800/50">
                        <p class="text-[9px] text-gray-400 font-bold uppercase tracking-wider"><i class="fa-regular fa-clock mr-0.5"></i> ${timeStr}</p>
                        ${tx.locationName ? `<p class="text-[9px] text-rose-400 font-bold uppercase tracking-wider truncate max-w-[45%]"><i class="fa-solid fa-location-dot mr-0.5"></i> ${locStr}</p>` : ''}
                    </div>
                </div>
            </div>
            <!-- Vạch màu nhận diện Thu/Chi ở mép trái -->
            <div class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full ${isInc ? 'bg-success-400' : 'bg-transparent'}"></div>
        </div>
    </div>
    `;
};

// ==========================================
// 4. HIỂN THỊ CHI TIẾT (FULL SCREEN - GIAO DIỆN HÓA ĐƠN XỊN)
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

    // Phân tích nền gradient dựa trên loại giao dịch
    const heroGradient = isInc 
        ? "bg-gradient-to-br from-emerald-400/20 to-teal-500/5 dark:from-emerald-900/40 dark:to-teal-900/10 border-emerald-500/20" 
        : "bg-gradient-to-br from-rose-400/20 to-orange-500/5 dark:from-rose-900/40 dark:to-orange-900/10 border-rose-500/20";

    content.innerHTML = `
        <!-- Khối Số tiền Cực lớn (Hero Section) -->
        <div class="flex flex-col items-center justify-center p-8 rounded-[2rem] border ${heroGradient} custom-bg-card shadow-sm relative overflow-hidden">
            <!-- Vòng tròn trang trí mờ phía sau -->
            <div class="absolute -top-10 -right-10 w-32 h-32 rounded-full ${isInc ? 'bg-emerald-500/10' : 'bg-rose-500/10'} blur-2xl"></div>
            <div class="absolute -bottom-10 -left-10 w-32 h-32 rounded-full ${isInc ? 'bg-teal-500/10' : 'bg-orange-500/10'} blur-2xl"></div>

            <div class="relative z-10 w-20 h-20 rounded-[24px] flex items-center justify-center text-4xl mb-5 shadow-xl border border-white/50 dark:border-white/10 ${cat.color}">
                <span class="drop-shadow-sm">${cat.icon}</span>
            </div>
            
            <h3 class="relative z-10 text-[42px] font-black ${isInc ? 'text-success-500' : 'custom-text dark:text-white'} tracking-tighter leading-none mb-2">
                ${isInc ? '+' : '-'}${formatMoney(tx.amount)}
            </h3>
            <span class="relative z-10 text-xs font-bold custom-text-secondary uppercase tracking-widest bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full border border-black/5 dark:border-white/5">${cat.name}</span>
        </div>

        <!-- Bảng Thông tin Chi tiết (Kiểu List iOS) -->
        <div class="custom-bg-card rounded-[2rem] border custom-border shadow-sm overflow-hidden">
            
            <div class="flex justify-between items-center p-5 border-b custom-border dark:border-gray-800/50">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500"><i class="fa-solid fa-wallet text-sm"></i></div>
                    <span class="text-xs font-bold custom-text-secondary uppercase">Ví giao dịch</span>
                </div>
                <span class="text-sm font-black custom-text custom-primary px-3 py-1.5 rounded-xl border custom-border">${wallet.name}</span>
            </div>
            
            <div class="flex justify-between items-center p-5 border-b custom-border dark:border-gray-800/50">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-500"><i class="fa-regular fa-calendar-days text-sm"></i></div>
                    <span class="text-xs font-bold custom-text-secondary uppercase">Thời gian</span>
                </div>
                <div class="text-right">
                    <span class="block text-sm font-black custom-text">${dateStr}</span>
                    <span class="block text-[10px] font-bold text-gray-400 mt-0.5">${timeStr}</span>
                </div>
            </div>

            <div class="p-5 border-b custom-border dark:border-gray-800/50">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-500"><i class="fa-solid fa-align-left text-sm"></i></div>
                    <span class="text-xs font-bold custom-text-secondary uppercase">Ghi chú</span>
                </div>
                <p class="text-sm font-bold custom-text custom-bg-input p-4 rounded-2xl border custom-border leading-relaxed min-h-[60px]">
                    ${tx.note || '<span class="italic text-gray-400 font-medium">Không có ghi chú...</span>'}
                </p>
            </div>

            ${tx.locationName ? `
            <div class="p-5">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-500"><i class="fa-solid fa-location-dot text-sm"></i></div>
                    <span class="text-xs font-bold custom-text-secondary uppercase">Vị trí</span>
                </div>
                <div class="flex items-start gap-2 text-sm font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/50">
                    <i class="fa-solid fa-map-pin mt-1 shrink-0"></i> <span>${tx.locationName}</span>
                </div>
            </div>` : ''}
        </div>

        <!-- Ảnh Hóa Đơn -->
        ${tx.image && tx.image.length > 50 ? `
        <div class="custom-bg-card rounded-[2rem] border custom-border p-5 shadow-sm">
            <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 rounded-full bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center text-pink-500"><i class="fa-solid fa-camera text-sm"></i></div>
                <span class="text-xs font-bold custom-text-secondary uppercase">Chứng từ đính kèm</span>
            </div>
            <div class="relative rounded-2xl overflow-hidden border custom-border shadow-sm group cursor-pointer" onclick="openImageModal('${typeof window.getFastImage === 'function' ? window.getFastImage(tx.image) : tx.image}')">
                <img src="${typeof window.getFastImage === 'function' ? window.getFastImage(tx.image) : tx.image}" loading="lazy" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div class="bg-white/90 text-black px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-sm"><i class="fa-solid fa-expand mr-1"></i> Phóng to</div>
                </div>
            </div>
        </div>` : ''}

        <!-- NÚT HÀNH ĐỘNG NỔI Ở ĐÁY (Sticky Bottom Bar) -->
        <div class="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white dark:from-gray-900 dark:via-gray-900 to-transparent pt-12 z-30 flex gap-3">
            <button onclick="openEditTransaction('${tx.id}'); closeTxDetail();" class="flex-1 py-4 custom-bg-input hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 custom-text rounded-2xl font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2 border custom-border shadow-sm">
                <i class="fa-solid fa-pen"></i> Chỉnh sửa
            </button>
            <button onclick="deleteTransaction('${tx.id}'); closeTxDetail();" class="flex-1 py-4 bg-danger-500 hover:bg-danger-600 text-white rounded-2xl font-black text-sm shadow-[0_8px_20px_rgba(244,63,94,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2">
                <i class="fa-solid fa-trash"></i> Xóa bỏ
            </button>
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
// 5. RENDER DANH SÁCH CHÍNH (Đã loại bỏ code thừa)
// ==========================================
window.renderTransactions = () => {
    window.lastDateGroup = ""; 
    const searchInput = document.getElementById("filter-search").value.trim().toLowerCase();
    const removeAccents = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const searchNoAccent = removeAccents(searchInput);

    const specificDate = document.getElementById("tx-date-picker")?.value;
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    const filteredTx = state.transactions.filter((t) => {
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

    filteredTx.sort((a, b) => {
        if (window.txSortOrder === "amount_desc") return b.amount - a.amount;
        if (window.txSortOrder === "amount_asc") return a.amount - b.amount;
        if (window.txSortOrder === "date_asc") return new Date(a.date) - new Date(b.date);
        return new Date(b.date) - new Date(a.date);
    });

    const inc = filteredTx.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
    const exp = filteredTx.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);

    const sumIncEl = document.getElementById("sum-inc");
    const sumExpEl = document.getElementById("sum-exp");
    if (sumIncEl) sumIncEl.innerText = formatMoney(inc);
    if (sumExpEl) sumExpEl.innerText = formatMoney(exp);

    const container = document.getElementById("tx-list-container");
    if (!container) return;

    if (filteredTx.length === 0) {
        container.innerHTML = "";
        container.className = "border custom-border rounded-3xl"; 
        document.getElementById("tx-empty").classList.remove("hidden");
    } else {
        document.getElementById("tx-empty").classList.add("hidden");

        if (window.txViewMode === "grid") {
            container.className = "p-1 sm:p-2 bg-transparent border-0";
            let gridHtml = "";
            filteredTx.forEach((tx) => {
                const isInc = tx.type === "income";
                const cat = state.categories.find(c => c.id === tx.category) || { name: "Khác", icon: "📦", color: "bg-gray-100 text-gray-600" };
                const hasImage = tx.image && tx.image.length > 50;

                let txTime = "";
                if (tx.date.includes("T")) txTime = tx.date.split("T")[1].substring(0, 5);
                else if (tx.date.includes(" ")) txTime = tx.date.split(" ")[1].substring(0, 5);

                let headerHtml = "";
                if (window.txSortOrder === "date_desc" || window.txSortOrder === "date_asc") {
                    const d = new Date(tx.date);
                    const dateStr = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

                    if (dateStr !== window.lastDateGroup) {
                        window.lastDateGroup = dateStr;
                        const dayTxs = filteredTx.filter(t => {
                            const td = new Date(t.date);
                            return `${td.getFullYear()}-${td.getMonth()}-${td.getDate()}` === dateStr;
                        });
                        const dInc = dayTxs.filter(t => t.type === "income").reduce((a, b) => a + b.amount, 0);
                        const dExp = dayTxs.filter(t => t.type === "expense").reduce((a, b) => a + b.amount, 0);

                        const todayObj = new Date();
                        const yesterdayObj = new Date();
                        yesterdayObj.setDate(yesterdayObj.getDate() - 1);
                        let dayName = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

                        if (d.toDateString() === todayObj.toDateString()) dayName = "Hôm nay - " + dayName;
                        else if (d.toDateString() === yesterdayObj.toDateString()) dayName = "Hôm qua - " + dayName;
                        else {
                            const days = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
                            dayName = days[d.getDay()] + " - " + dayName;
                        }

                        headerHtml = `
                        <div class="sticky top-0 z-30 pt-1 pb-2 custom-bg-body w-full col-span-full break-inside-avoid">
                            <div class="custom-bg-card border custom-border px-3 py-2 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.05)] flex justify-between items-center bg-opacity-95 backdrop-blur-sm">
                                <span class="text-xs font-black custom-text">${dayName}</span>
                                <div class="text-[10px] font-bold flex gap-2 tracking-wide">
                                    ${dInc > 0 ? `<span class="text-success-500">+${formatMoney(dInc)}</span>` : ""}
                                    ${dInc > 0 && dExp > 0 ? `<span class="custom-text-secondary">|</span>` : ""}
                                    ${dExp > 0 ? `<span class="text-danger-500">-${formatMoney(dExp)}</span>` : ""}
                                </div>
                            </div>
                        </div>`;
                    }
                }

                gridHtml += headerHtml + `
                <div onclick="openModal('transaction', '${tx.id}')" class="break-inside-avoid relative flex flex-col rounded-[20px] overflow-hidden custom-bg-card border custom-border shadow-sm cursor-pointer group transition-transform hover:scale-[1.02] active:scale-95 mb-3">
                    <button onclick="event.stopPropagation(); deleteTransaction('${tx.id}')" class="absolute top-2 right-2 w-8 h-8 rounded-full bg-danger-500/90 text-white flex items-center justify-center text-xs backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-danger-600"><i class="fa-solid fa-trash"></i></button>
                    <div class="relative w-full ${hasImage ? "" : "h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"}">
                        ${hasImage ? `<img src="${tx.image}" class="w-full h-auto object-cover max-h-60">` : `<div class="w-full h-full flex items-center justify-center text-4xl opacity-50">${cat.icon}</div>`}
                        <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent pointer-events-none"></div>
                        <div class="absolute top-2.5 left-2.5 right-10 flex items-center gap-2 z-10">
                            <div class="w-6 h-6 rounded-full ${cat.color} flex items-center justify-center text-[10px] shadow-md border border-white/20 backdrop-blur-md shrink-0">${cat.icon}</div>
                            <span class="text-white text-xs font-bold drop-shadow-md truncate tracking-wide">${cat.name}</span>
                        </div>
                    </div>
                    <div class="p-3.5 flex flex-col gap-2.5">
                        <p class="font-bold text-sm custom-text leading-tight line-clamp-2">${tx.note || "Không có ghi chú"}</p>
                        ${tx.locationName ? `<div class="flex items-start gap-1.5 text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-1.5 rounded-lg border border-rose-100 dark:border-rose-800/50 w-fit max-w-full"><i class="fa-solid fa-location-dot mt-0.5 shrink-0"></i><span class="line-clamp-2 leading-snug">${typeof window.formatShortAddress === 'function' ? window.formatShortAddress(tx.locationName) : tx.locationName}</span></div>` : ""}
                        <div class="flex items-end justify-between mt-1 pt-2 border-t border-dashed custom-border">
                            <div class="flex items-center gap-1.5 text-[9px] font-bold custom-text-secondary w-2/3">
                                <i class="fa-regular fa-clock shrink-0 text-gray-400"></i><span class="leading-snug line-clamp-2">${typeof window.formatDateTime === 'function' ? window.formatDateTime(tx.date) : tx.date}</span>
                            </div>
                            <p class="font-black text-sm shrink-0 ml-1 ${isInc ? "text-success-500" : "custom-text dark:text-gray-100"}">${isInc ? "+" : "-"}${typeof window.formatMoney === 'function' ? window.formatMoney(tx.amount) : tx.amount}</p>
                        </div>
                    </div>
                </div>`;
            });
            container.innerHTML = `<div class="columns-2 sm:columns-3 gap-3 space-y-0">${gridHtml}</div>`;
        } 
        else {
            container.className = "bg-transparent border-0"; // Bỏ viền bao quanh list
            container.innerHTML = filteredTx.map((tx) => createSwipeableTxCard(tx)).join("");
            if (typeof initSwipeActions === "function") initSwipeActions();
        }
    }
};

// ==========================================
// 6. CÁC HÀM XỬ LÝ LỌC & TÌM KIẾM
// ==========================================
window.setTxFilter = (val) => {
    window.dateFilter = val;
    if (val !== "date") document.getElementById("tx-date-picker").value = "";
    window.renderTransactions();
    document.getElementById("filter-dropdown").classList.add("hidden");
};

window.toggleTxFilter = () => {
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
    document.getElementById("filter-dropdown").classList.add("hidden");
};

window.toggleTxViewMode = () => {
    window.txViewMode = window.txViewMode === "list" ? "grid" : "list";
    const btnIcon = document.querySelector("#view-mode-btn i");
    if (btnIcon) btnIcon.className = window.txViewMode === "grid" ? "fa-solid fa-list" : "fa-solid fa-table-cells-large";
    window.renderTransactions();
    if (typeof playSound === 'function') playSound("click");
};

window.setTxSortOrder = (val) => {
    window.txSortOrder = val;
    ["date_desc", "date_asc", "amount_desc", "amount_asc"].forEach((id) => {
        const btn = document.getElementById("sort-" + id);
        if (btn) {
            btn.className = (id === val)
                ? "flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold transition-all custom-primary custom-shadow-sm text-white border border-transparent"
                : "flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold transition-all custom-bg-input custom-text-secondary hover:brightness-95 border custom-border";
        }
    });
    window.renderTransactions();
    document.getElementById("filter-dropdown").classList.add("hidden");
};

// ==========================================
// 7. CÁC HÀM HÀNH ĐỘNG CỤ THỂ
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
            else if (typeof renderTransactions === 'function') renderTransactions();
            
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

            const highlightCircle = L.circleMarker(target, {
                radius: 25, color: "#a855f7", fillColor: "#a855f7", fillOpacity: 0.5, className: "animate-ping",
            }).addTo(mapObj);

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