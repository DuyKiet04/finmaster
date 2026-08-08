// ========================================================
// 🌌 TẦNG 1: SPATIAL DESIGN SYSTEM (Tự động nhúng CSS)
// ========================================================
const injectSpatialDesignSystem = () => {
    if (document.getElementById('spatial-finance-style')) return;
    const style = document.createElement('style');
    style.id = 'spatial-finance-style';
    style.innerHTML = `
        :root {
            /* Nền & Thẻ */
            --bg-primary: #0f172a;
            --bg-card: rgba(30, 41, 59, 0.4);
            --bg-card-hover: rgba(30, 41, 59, 0.7);
            --blur-glass: blur(12px);
            
            /* Màu trạng thái cực nhẹ (Soft UI) */
            --income-bg: rgba(16, 185, 129, 0.1);
            --income-text: #34d399;
            --expense-bg: rgba(244, 63, 94, 0.1);
            --expense-text: #fb7185;
            --accent-primary: #8b5cf6;
            
            /* Cấu trúc */
            --radius-card: 24px;
            --radius-button: 16px;
            --shadow-card: 0 8px 32px rgba(0, 0, 0, 0.15);
            --shadow-floating: 0 12px 48px rgba(139, 92, 246, 0.2);
        }

        /* Vật lý UI & Animations cho Financial Object */
        .financial-object {
            background: var(--bg-card);
            backdrop-filter: var(--blur-glass);
            -webkit-backdrop-filter: var(--blur-glass);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: var(--radius-card);
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .financial-object:hover {
            transform: translateY(-3px) scale(1.01);
            background: var(--bg-card-hover);
            box-shadow: var(--shadow-card);
            border-color: rgba(255, 255, 255, 0.1);
        }
        .financial-object:active {
            transform: scale(0.97);
        }

        /* Animation xuất hiện tuần tự */
        @keyframes slideInUp {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-in { 
            animation: slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
            opacity: 0; 
        }

        /* Hiệu ứng biến mất khi xóa (Collapse) */
        .collapse-delete {
            animation: collapseTx 0.4s cubic-bezier(0.5, 0, 0, 1) forwards;
        }
        @keyframes collapseTx {
            0% { opacity: 1; transform: scale(1); height: var(--tx-height); margin-bottom: 0.75rem; }
            40% { opacity: 0; transform: scale(0.9); height: var(--tx-height); margin-bottom: 0.75rem; }
            100% { opacity: 0; transform: scale(0.8); height: 0; margin-bottom: 0; padding: 0; border: none; overflow: hidden; }
        }

        /* Hiệu ứng Teleport từ Bản đồ */
        .teleport-glow {
            animation: teleportEffect 2.5s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }
        @keyframes teleportEffect {
            0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7); border-color: rgba(139, 92, 246, 0.8); transform: scale(1); }
            15% { box-shadow: 0 0 30px 10px rgba(139, 92, 246, 0.4); border-color: #a855f7; transform: scale(1.03); background: rgba(139, 92, 246, 0.1); }
            100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); border-color: rgba(255, 255, 255, 0.05); transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
};
injectSpatialDesignSystem();

// ========================================================
// ⚙️ TẦNG 2: QUẢN LÝ TRẠNG THÁI (STATE)
// ========================================================
window.dateFilter = "all";
window.walletFilter = "all";
window.txViewMode = "list"; // list | grid

// Helper sinh màu gradient thông minh cho Story Card dựa trên Category
const getCategoryGradient = (catName) => {
    const name = catName.toLowerCase();
    if (name.includes('ăn') || name.includes('uống')) return 'from-orange-500/80 to-amber-600/90';
    if (name.includes('mua sắm') || name.includes('shopping')) return 'from-purple-500/80 to-fuchsia-600/90';
    if (name.includes('di chuyển') || name.includes('xe')) return 'from-blue-500/80 to-cyan-600/90';
    if (name.includes('sức khỏe') || name.includes('thuốc')) return 'from-emerald-500/80 to-teal-600/90';
    if (name.includes('lương') || name.includes('thu')) return 'from-green-400/80 to-emerald-600/90';
    if (name.includes('hóa đơn') || name.includes('điện')) return 'from-rose-500/80 to-red-600/90';
    return 'from-slate-700/80 to-gray-900/90'; // Default
};

// ========================================================
// 🎛️ TẦNG 3: BỘ LỌC (FILTERS) & CHUYỂN CHẾ ĐỘ XEM
// ========================================================
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
            sel.innerHTML = '<option value="all">Tất cả ví</option>' +
                state.wallets.map(w => `<option value="${w.id}" ${window.walletFilter === w.id ? "selected" : ""}>${w.icon} ${w.name}</option>`).join("");
        }
        dropdown.classList.remove("hidden");
    } else {
        dropdown.classList.add("hidden");
    }
};

window.setTxWalletFilter = (val) => {
    window.walletFilter = val;
    window.renderTransactions();
    document.getElementById("filter-dropdown").classList.add("hidden");
};

window.toggleTxViewMode = () => {
    window.txViewMode = window.txViewMode === "list" ? "grid" : "list";
    const btnIcon = document.querySelector("#view-mode-btn i");
    if (btnIcon) {
        btnIcon.className = window.txViewMode === "grid" ? "fa-solid fa-table-cells-large" : "fa-solid fa-list";
    }
    window.renderTransactions();
    if(typeof playSound === 'function') playSound("click");
};

// ========================================================
// 🖼️ TẦNG 4: HÀM RENDER CHÍNH - SPATIAL UI
// ========================================================
window.renderTransactions = () => {
    const searchInput = (document.getElementById("filter-search")?.value || "").trim().toLowerCase();
    const removeAccents = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const searchNoAccent = removeAccents(searchInput);
    
    const specificDate = document.getElementById("tx-date-picker")?.value;
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // LỌC DỮ LIỆU
    const filteredTx = state.transactions.filter((t) => {
        if (t.category === "transfer") return false;
        
        let matchS = false;
        const catName = state.categories.find((c) => c.id === t.category)?.name.toLowerCase() || "";
        const note = (t.note || "").toLowerCase();
        const walletName = state.wallets.find((w) => w.id === t.walletId)?.name.toLowerCase() || "";
        
        // Command/Smart Search support
        const cleanSearch = searchInput.startsWith(">") ? searchInput.replace(">", "").trim() : searchInput;
        const cleanSearchNoAccent = removeAccents(cleanSearch);

        if (["thu", "thu nhập"].includes(cleanSearch)) matchS = t.type === "income";
        else if (["chi", "chi tiêu"].includes(cleanSearch)) matchS = t.type === "expense";
        else if (cleanSearch === "") matchS = true;
        else {
            matchS = note.includes(cleanSearch) || catName.includes(cleanSearch) || walletName.includes(cleanSearch) ||
                     removeAccents(note).includes(cleanSearchNoAccent) || removeAccents(catName).includes(cleanSearchNoAccent) || removeAccents(walletName).includes(cleanSearchNoAccent);
        }

        let matchDate = true;
        if (window.dateFilter === "today") matchDate = t.date.startsWith(today);
        else if (window.dateFilter === "yesterday") matchDate = t.date.startsWith(yesterday);
        else if (window.dateFilter === "date" && specificDate) matchDate = t.date.startsWith(specificDate);

        let matchWallet = window.walletFilter === "all" || t.walletId === window.walletFilter;
        return matchS && matchDate && matchWallet;
    });

    // TÍNH TOÁN DÒNG TIỀN
    const inc = filteredTx.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
    const exp = filteredTx.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
    const netFlow = inc - exp;

    const container = document.getElementById("tx-list-container");
    const isGrid = window.txViewMode === "grid";

    // 🌟 HEADER: FINANCIAL SUMMARY
    const summaryHeader = `
        <div class="mb-6 financial-object p-5 relative overflow-hidden group">
            <div class="absolute right-0 top-0 opacity-10 pointer-events-none transform group-hover:scale-110 transition-transform duration-700">
                <svg width="150" height="80" viewBox="0 0 150 80"><path d="M0 60 Q 30 30, 60 50 T 120 20 T 150 40" fill="none" stroke="currentColor" stroke-width="4"/></svg>
            </div>
            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">Dòng tiền kỳ này</p>
            <h2 class="text-4xl font-black tracking-tight ${netFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'} drop-shadow-lg">
                ${netFlow >= 0 ? '+' : ''}${formatMoney(netFlow)}
            </h2>
            <div class="flex gap-8 mt-5 border-t border-white/5 pt-4">
                <div>
                    <p class="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-0.5">Tổng thu</p>
                    <p class="text-sm font-black text-emerald-300/90">+${formatMoney(inc)}</p>
                </div>
                <div>
                    <p class="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-0.5">Tổng chi</p>
                    <p class="text-sm font-black text-rose-300/90">-${formatMoney(exp)}</p>
                </div>
            </div>
        </div>
    `;

    // Empty State
    if (filteredTx.length === 0) {
        container.innerHTML = summaryHeader + `
            <div class="text-center py-16 opacity-50 financial-object border-dashed">
                <div class="text-5xl mb-4">🛸</div>
                <p class="font-medium text-gray-300">Không gian tĩnh lặng.</p>
                <p class="text-xs text-gray-500 mt-1">Chưa có giao dịch nào ở trạm này.</p>
            </div>
        `;
        return;
    }

    // 🌟 RENDER CHẾ ĐỘ LƯỚI (STORY CARDS)
    if (isGrid) {
        container.className = "pb-24 bg-transparent"; 
        container.innerHTML = summaryHeader + `<div class="grid grid-cols-2 gap-4">` + filteredTx.map((tx, i) => {
            const isInc = tx.type === "income";
            const cat = state.categories.find((c) => c.id === tx.category) || { name: "Khác", icon: "📦" };
            const hasImage = tx.image && tx.image.length > 50;
            const bgGradient = getCategoryGradient(cat.name);
            
            return `
            <div onclick="openModal('transaction', '${tx.id}')" 
                 class="aspect-[3/4] rounded-[24px] relative overflow-hidden shadow-lg cursor-pointer hover:scale-[1.02] active:scale-95 transition-all group animate-slide-in border border-white/5"
                 style="animation-delay: ${i * 0.05}s; ${hasImage ? `background-image: url('${tx.image}'); background-size: cover; background-position: center;` : ''}">
                 
                ${!hasImage ? `<div class="absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-90 group-hover:opacity-100 transition-opacity"></div>` : ''}
                <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent"></div>
                
                <div class="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-xl shadow-inner border border-white/20">
                    ${cat.icon}
                </div>
                
                <div class="absolute bottom-4 left-4 right-4 flex flex-col gap-0.5">
                    <p class="text-[11px] font-bold text-gray-300/80 drop-shadow uppercase tracking-wider">${cat.name}</p>
                    <p class="text-sm font-bold text-white truncate drop-shadow-md mb-1">${tx.note || "Giao dịch"}</p>
                    <p class="font-black text-xl ${isInc ? "text-emerald-400" : "text-white"} drop-shadow-lg tracking-tight">
                        ${isInc ? "+" : "−"}${formatMoney(tx.amount)}
                    </p>
                    <span class="text-[9px] text-gray-400/80 mt-1 font-medium"><i class="fa-regular fa-clock"></i> ${formatDateTime(tx.date)}</span>
                </div>
            </div>`;
        }).join("") + `</div>`;
    } 
    // 🌟 RENDER CHẾ ĐỘ DANH SÁCH (FINANCIAL OBJECTS)
    else {
        container.className = "pb-24 flex flex-col gap-3 bg-transparent";
        container.innerHTML = summaryHeader + filteredTx.map((tx, i) => {
            const isInc = tx.type === "income";
            const cat = state.categories.find((c) => c.id === tx.category) || { name: "Khác", icon: "📦" };
            const wallet = state.wallets.find((w) => w.id === tx.walletId) || { name: "Ví ảo", icon: "💳" };
            
            const typeStyle = isInc 
                ? 'bg-[var(--income-bg)] text-[var(--income-text)]' 
                : 'bg-[var(--expense-bg)] text-[var(--expense-text)]';

            return `
            <div id="tx-${tx.id}" class="relative w-full group animate-slide-in" style="animation-delay: ${i * 0.04}s">
                
                <!-- Background Actions (Nằm dưới lớp kính) -->
                <div class="absolute inset-y-0 right-0 w-1/2 bg-rose-500/20 rounded-[24px] flex justify-end items-center pr-5 z-0">
                    <button onclick="deleteTransaction('${tx.id}')" class="w-11 h-11 bg-rose-500 rounded-full text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>

                <!-- Lớp Kính Chính (Financial Object) -->
                <div class="financial-object relative z-10 p-3.5 flex items-center gap-3.5 cursor-pointer swipe-content" onclick="openModal('transaction', '${tx.id}')">
                    
                    <!-- 3D Bubble Category Icon -->
                    <div class="w-12 h-12 rounded-[18px] flex items-center justify-center text-2xl shrink-0 shadow-inner border border-white/10 bg-white/5 backdrop-blur-md">
                        ${tx.image && tx.image.length > 50 
                            ? `<img src="${tx.image}" class="w-full h-full object-cover rounded-[18px]">` 
                            : cat.icon}
                    </div>
                    
                    <!-- Meta Info -->
                    <div class="flex-1 min-w-0 flex flex-col justify-center gap-1">
                        <h3 class="font-bold text-[14px] text-gray-100 truncate pr-2">${tx.note || cat.name}</h3>
                        <div class="flex items-center gap-2 text-[10px] text-gray-400 font-medium tracking-wide">
                            <span class="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded-md border border-white/5">${wallet.icon} ${wallet.name}</span>
                            <span>•</span>
                            <span>${tx.date.split("T")[1]?.slice(0,5) || formatDateTime(tx.date).split(' ')[1]}</span>
                        </div>
                    </div>
                    
                    <!-- Huge Typography Amount -->
                    <div class="text-right shrink-0 pl-1">
                        <p class="font-black text-[15px] tracking-tight ${typeStyle} px-2.5 py-1 rounded-xl">
                            ${isInc ? "+" : "−"}${formatMoney(tx.amount)}
                        </p>
                    </div>
                </div>
            </div>`;
        }).join("");
        
        if (typeof initSwipeActions === "function") initSwipeActions();
    }
};

// ========================================================
// 🔎 TẦNG 5: COMMAND CENTER (TÌM KIẾM AI-NATIVE)
// ========================================================
window.handleSearchInput = (val) => {
    const query = val.trim().toLowerCase();
    const box = document.getElementById("search-autocomplete");
    window.renderTransactions(); 
    
    if (!query) {
        box.classList.add("hidden");
        return;
    }
    
    // UI của Command Center (Floating Card)
    box.className = "absolute top-full left-0 right-0 mt-2 bg-[#1e293b]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden";
    
    // Hỗ trợ Command Syntax
    const isCommand = query.startsWith(">");
    const cleanQuery = isCommand ? query.replace(">", "").trim() : query;
    const removeAccents = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const qNoAccent = removeAccents(cleanQuery);
    
    const results = state.transactions.filter((t) => {
        if (t.category === "transfer") return false;
        if (cleanQuery === "thu" || cleanQuery === "thu nhập") return t.type === "income";
        if (cleanQuery === "chi" || cleanQuery === "chi tiêu") return t.type === "expense";
        
        const catName = state.categories.find((c) => c.id === t.category)?.name.toLowerCase() || "";
        const note = (t.note || "").toLowerCase();
        
        return removeAccents(note).includes(qNoAccent) || removeAccents(catName).includes(qNoAccent);
    }).slice(0, 6); 

    if (results.length === 0) {
        box.innerHTML = `
            <div class="px-4 py-8 text-center text-gray-400">
                <i class="fa-solid fa-ghost text-3xl mb-3 opacity-40"></i>
                <p class="text-sm font-bold text-gray-300">Không tìm thấy kết quả</p>
                <p class="text-[11px] mt-1.5 opacity-60">Mẹo: Thử gõ <b>> thu nhập</b> hoặc <b>> grab</b></p>
            </div>`;
    } else {
        box.innerHTML = `
            <div class="px-4 pt-3 pb-2 flex justify-between items-center bg-white/5 border-b border-white/5">
                <span class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Gợi ý</span>
                <span class="text-[10px] text-gray-500 font-medium">Nhấn để xem</span>
            </div>` + 
        results.map((tx) => {
            const isInc = tx.type === "income";
            const cat = state.categories.find((c) => c.id === tx.category) || { icon: "📦", name: "Khác" };
            return `
                <div onclick="openModal('transaction', '${tx.id}'); document.getElementById('search-autocomplete').classList.add('hidden');"
                     class="flex items-center gap-3 p-3.5 hover:bg-white/10 cursor-pointer transition-colors group border-b border-white/5 last:border-0">
                    <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg border border-white/5">${cat.icon}</div>
                    <div class="flex-1 min-w-0">
                        <p class="font-bold text-sm text-gray-200 truncate group-hover:text-white transition-colors">${tx.note || cat.name}</p>
                        <p class="text-[10px] text-gray-500 font-medium mt-0.5">${formatDateTime(tx.date)}</p>
                    </div>
                    <div class="font-black text-sm ${isInc ? 'text-emerald-400' : 'text-gray-300'} bg-black/20 px-2.5 py-1 rounded-lg">
                        ${isInc ? '+' : '−'}${formatMoney(tx.amount)}
                    </div>
                </div>`;
        }).join("");
    }
    box.classList.remove("hidden");
};

// ========================================================
// 🗑️ TẦNG 6: XÓA VẬT LÝ (COLLAPSE ANIMATION)
// ========================================================
window.deleteTransaction = (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) return;
    
    const el = document.getElementById(`tx-${id}`);
    if (el) {
        // Gắn biến --tx-height để CSS Animation thu nhỏ mượt mà
        el.style.setProperty('--tx-height', `${el.offsetHeight}px`);
        el.classList.add('collapse-delete');
    }
    
    // Đợi 400ms cho animation chạy xong rồi mới xóa data
    setTimeout(() => {
        const idx = state.transactions.findIndex((t) => t.id === id);
        if (idx > -1) {
            const tx = state.transactions[idx];
            state.transactions.splice(idx, 1);
            
            // Hoàn tiền
            const w = state.wallets.find((w) => w.id === tx.walletId);
            if (w) w.balance -= tx.type === "income" ? tx.amount : -tx.amount;
            
            if(typeof addLog === 'function') addLog("Xóa giao dịch", formatMoney(tx.amount));
            if(typeof saveData === 'function') saveData();
            
            // Xóa element khỏi DOM thay vì render lại toàn bộ để giữ vị trí cuộn
            if (el) el.remove(); 
            
            // Cập nhật lại Summary Header (Dòng tiền) sau khi xóa
            window.renderTransactions();
        }
    }, 400);
};

// ========================================================
// ⚡ TẦNG 7: TELEPORT EFFECT (TỪ BẢN ĐỒ)
// ========================================================
window.viewAndHighlightTransaction = (txId) => {
    // 1. Reset Filters (Gỡ phễu lọc)
    document.getElementById("filter-search").value = "";
    if (document.getElementById("tx-date-picker")) document.getElementById("tx-date-picker").value = "";
    window.dateFilter = "all";
    window.walletFilter = "all";
    
    // 2. Chuyển hướng Tab
    if(typeof switchView === 'function') switchView("transactions");
    window.renderTransactions();
    
    // 3. Kích hoạt năng lượng Teleport (Sau 300ms đợi DOM render xong)
    setTimeout(() => {
        const txWrapper = document.getElementById(`tx-${txId}`);
        if (!txWrapper) {
            // Hỗ trợ highlight cho Grid Mode
            const gridEl = document.querySelector(`div.aspect-\\[3\\/4\\][onclick*="${txId}"]`);
            if(gridEl) {
                gridEl.scrollIntoView({ behavior: "smooth", block: "center" });
                gridEl.classList.remove('teleport-glow');
                void gridEl.offsetWidth; 
                gridEl.classList.add('teleport-glow');
            }
            return;
        }
        
        // Highlight List Mode
        const txCard = txWrapper.querySelector('.financial-object');
        if (txCard) {
            txWrapper.scrollIntoView({ behavior: "smooth", block: "center" });
            
            // Xóa class cũ, force reflow (trick để restart CSS animation), thêm class mới
            txCard.classList.remove('teleport-glow');
            void txCard.offsetWidth; 
            txCard.classList.add('teleport-glow');
            
            if (typeof playSound === "function") playSound("success");
            
            // Clean up
            setTimeout(() => txCard.classList.remove('teleport-glow'), 2500);
        }
    }, 300);
};