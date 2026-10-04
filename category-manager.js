// ==========================================
// KHO ICON & STUDIO CHẾ TẠO DANH MỤC (BENTO UI 4.0 - ĐÃ FIX LỖI SPAM CLICK)
// ==========================================

(function () {
    // ============================================================
// KHO EMOJI CHIA THEO CHỦ ĐỀ - FINANCE APP
// ============================================================

const ICON_LIBRARY = {

    // 🍔 1. ĂN UỐNG
    "Ăn uống": [
        "🍔", "🍟", "🍕", "🌭", "🍗", "🥩", "🍖", "🍜", "🍝", "🍲",
        "🍛", "🍣", "🍱", "🍙", "🍚", "🥟", "🥪", "🌮", "🌯", "🥗",
        "🥘", "🍳", "🥞", "🧇", "🥐", "🍞", "🥖", "🧀", "🥚", "🥑",
        "🍎", "🍌", "🍉", "🍇", "🍓", "🍊", "🍋", "🍰", "🎂", "🍩",
        "🍪", "🍫", "🍬", "🍨", "🍦", "☕", "🧋", "🥤", "🧃", "🍺",
        "🍻", "🍷", "🍹", "🍸", "🥛"
    ],

    // 🛵 2. DI CHUYỂN
    "Di chuyển": [
        "🚗", "🚙", "🚕", "🚖", "🚌", "🚎", "🚐", "🚑", "🚓",
        "🛵", "🏍️", "🚲", "🛴", "🚆", "🚄", "🚅", "🚇", "🚉",
        "✈️", "🛫", "🛬", "🚁", "🚀", "🚤", "⛵", "🛳️", "⛽",
        "🅿️", "🚦", "🗺️", "🧭", "🛣️", "🎫"
    ],

    // 🛍️ 3. MUA SẮM
    "Mua sắm": [
        "🛍️", "🛒", "🛒", "👕", "👚", "👔", "👗", "👖", "🧥",
        "🧤", "🧣", "🧢", "👒", "👟", "👞", "👠", "🥾", "👜",
        "🎒", "👝", "💼", "🕶️", "💍", "💎", "⌚", "💄", "💅",
        "🧴", "🧼", "🧽", "🎁", "📦", "🏷️"
    ],

    // 🎮 4. GIẢI TRÍ
    "Giải trí": [
        "🎬", "🎞️", "📽️", "🎥", "🎮", "🕹️", "🎰", "🎯", "🎲",
        "🧩", "🎵", "🎶", "🎧", "🎤", "🎸", "🎹", "🥁", "🎻",
        "🎺", "🎷", "🎫", "🎟️", "🎭", "🎪", "🎨", "🖼️", "📺",
        "📻", "🎡", "🎢", "🎠", "🏆", "🎉", "🎊"
    ],

    // 👨‍👩‍👧 5. GIA ĐÌNH
    "Gia đình": [
        "👨‍👩‍👧", "👨‍👩‍👦", "👪", "👶", "🍼", "🧒", "👧", "👦",
        "👩", "👨", "👵", "👴", "❤️", "💝", "💖", "💐",
        "🎁", "🏠", "🫶", "🤝", "💑"
    ],

    // 🏠 6. NHÀ CỬA
    "Nhà cửa": [
        "🏠", "🏡", "🏢", "🏘️", "🏚️", "🛋️", "🛏️", "🪑",
        "🚪", "🪟", "🧹", "🧺", "🧽", "🧼", "🪣", "🧴",
        "🛠️", "🔨", "🔧", "🪛", "🪚", "💡", "🔌", "🔋",
        "🚿", "🛁", "🚽", "🪴", "🌱", "🗑️"
    ],

    // 💡 7. HÓA ĐƠN & DỊCH VỤ
    "Hóa đơn & Dịch vụ": [
        "💡", "💧", "🔥", "⚡", "📱", "☎️", "📡", "🌐", "📺",
        "📶", "🧾", "💳", "🏠", "🔌", "🚿", "🛜", "📬",
        "📮", "🗑️", "♻️"
    ],

    // 🏥 8. SỨC KHỎE
    "Sức khỏe": [
        "🏥", "🏨", "💊", "💉", "🩺", "🩹", "🧪", "🧬",
        "🦷", "🦷", "👓", "🩻", "❤️", "🫀", "🧠", "🩸",
        "🌡️", "😷", "🧴", "🧘", "🧘‍♂️", "🧘‍♀️"
    ],

    // 📚 9. HỌC TẬP
    "Học tập": [
        "📚", "📖", "📕", "📗", "📘", "📙", "📓", "📔",
        "📝", "✏️", "🖊️", "🖋️", "📐", "📏", "🔖", "📎",
        "📌", "🎓", "🏫", "🎒", "💻", "🧑‍💻", "👨‍🏫", "👩‍🏫",
        "🧮", "🔬", "🧪"
    ],

    // 💼 10. CÔNG VIỆC
    "Công việc": [
        "💼", "👔", "🏢", "🧑‍💻", "👨‍💻", "👩‍💻", "🖥️", "💻",
        "⌨️", "🖱️", "📊", "📈", "📋", "📁", "📂", "📑",
        "📝", "📧", "📞", "📅", "⏰", "☕", "🤝", "🎯",
        "💡", "🏆"
    ],

    // 🏋️ 11. THỂ THAO
    "Thể thao": [
        "⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏓", "🏸", "🥊",
        "🥋", "🏆", "🥇", "🥈", "🥉", "🏋️", "🏃", "🚴",
        "🏊", "🧘", "⛳", "🎿", "🏂", "🛹", "🛼", "🎯",
        "🏹", "🥅", "🏟️"
    ],

    // ✈️ 12. DU LỊCH
    "Du lịch": [
        "✈️", "🛫", "🛬", "🧳", "🏨", "🏝️", "🏖️", "🏕️",
        "⛺", "🗺️", "🧭", "📸", "📷", "🎒", "🚗", "🚆",
        "🚢", "⛵", "🌴", "🌊", "🏔️", "🗿", "🗽", "🗼",
        "🏰", "🎫", "🛂", "🪪"
    ],

    // 🐶 13. THÚ CƯNG
    "Thú cưng": [
        "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
        "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔",
        "🐧", "🐦", "🐤", "🦆", "🦅", "🐴", "🐢", "🐍",
        "🦎", "🐠", "🐟", "🐡", "🦜", "🐾"
    ],

    // 💰 14. TÀI CHÍNH
    "Tài chính": [
        "💰", "💵", "💴", "💶", "💷", "💸", "🤑", "💳",
        "🏦", "🏧", "📈", "📉", "💹", "💎", "🪙", "🤑",
        "🐷", "🏆", "🎁", "🔥", "⭐", "🌟", "💯", "🧾",
        "📊", "💼", "🔐", "🔒"
    ],

    // 💵 15. THU NHẬP
    "Thu nhập": [
        "💰", "💵", "💶", "💷", "💴", "💸", "💳", "🏦",
        "📈", "💼", "👔", "💻", "🧾", "🎁", "🏆", "🥇",
        "⭐", "🌟", "💎", "🪙", "🐷", "🚀", "💯"
    ],

    // 📉 16. ĐẦU TƯ
    "Đầu tư": [
        "📈", "📉", "💹", "📊", "💰", "💵", "💎", "🏦",
        "🏢", "🏠", "🏘️", "🌱", "🚀", "🎯", "💼", "🪙",
        "₿", "🪙", "📋", "🔐", "🧠", "⭐", "🏆"
    ],

    // 💳 17. THANH TOÁN
    "Thanh toán": [
        "💳", "💵", "💴", "💶", "💷", "🪙", "💰", "🏦",
        "🏧", "📱", "📲", "🧾", "💸", "🔐", "🔒", "✅",
        "❌", "📷", "🔢", "💯"
    ],

    // 🎁 18. QUÀ TẶNG
    "Quà tặng": [
        "🎁", "🎀", "💝", "💖", "❤️", "💐", "🌹", "🌷",
        "🌸", "🍫", "🍰", "🎂", "🍾", "🥂", "💎", "💍",
        "🧸", "🎈", "🎉", "🎊", "🥳", "⭐"
    ],

    // 💻 19. CÔNG NGHỆ
    "Công nghệ": [
        "📱", "💻", "🖥️", "⌨️", "🖱️", "🖨️", "📷", "📹",
        "🎧", "🎤", "🔊", "📺", "⌚", "🔋", "🔌", "💾",
        "💿", "📀", "🕹️", "🎮", "🤖", "🧠", "⚙️", "🔧"
    ],

    // 👕 20. THỜI TRANG & LÀM ĐẸP
    "Thời trang & Làm đẹp": [
        "👕", "👚", "👔", "👗", "👖", "🧥", "🧦", "🧤",
        "🧣", "🧢", "👒", "👟", "👞", "👠", "🥾", "👜",
        "🎒", "💄", "💋", "💅", "🧴", "🧼", "🪮", "💇",
        "💇‍♂️", "💇‍♀️", "💎", "⌚", "🕶️"
    ],

    // 🌱 21. SỐNG XANH
    "Sống xanh": [
        "🌱", "🌿", "☘️", "🍀", "🌳", "🌲", "🌴", "🌵",
        "🌻", "🌷", "🌹", "🌸", "🪴", "♻️", "🌎", "🌍",
        "🌏", "💧", "☀️", "🌤️", "🔋", "🚲", "🛴", "🚶",
        "🛍️", "🧺"
    ],

    // 🐷 22. TIẾT KIỆM & MỤC TIÊU
    "Tiết kiệm & Mục tiêu": [
        "🐷", "💰", "🏦", "🪙", "💵", "💎", "🎯", "🏆",
        "⭐", "🌟", "🚀", "📈", "🔒", "🔐", "📦", "🏠",
        "🚗", "✈️", "🎓", "💍", "🎁", "💯"
    ],

    // 💸 23. NỢ & VAY
    "Nợ & Vay": [
        "💸", "💳", "🏦", "💰", "🧾", "📋", "📉", "📊",
        "🤝", "🔄", "⏰", "📅", "🔔", "⚠️", "❗", "🔐",
        "🔒", "💵", "🪙", "✅", "❌"
    ],

    // 🧾 24. HÀNG NGÀY
    "Sinh hoạt hàng ngày": [
        "🧾", "🛒", "🏠", "🍚", "🥤", "☕", "🚿", "🧼",
        "🧹", "🧺", "💡", "💧", "📱", "🚌", "🛵", "⛽",
        "💊", "🛍️", "☀️", "🌙", "⏰", "📅"
    ],

    // ❤️ 25. TỪ THIỆN & CỘNG ĐỒNG
    "Từ thiện & Cộng đồng": [
        "❤️", "🫶", "🤝", "🙏", "💝", "🎁", "💰", "🏥",
        "🏫", "👶", "👵", "👴", "🐶", "🐱", "🌱", "🌍",
        "♻️", "🕊️", "⭐", "💐"
    ],

    // ⚡ 26. KHÁC
    "Khác": [
        "⭐", "🌟", "✨", "🔥", "💯", "❗", "❓", "⚡",
        "💡", "🎯", "🏆", "❤️", "💙", "💚", "💛", "🧡",
        "💜", "🖤", "🤍", "🤎", "🔵", "🟢", "🟡", "🟠",
        "🟣", "⚪", "⚫"
    ]
};

    const COLOR_PALETTE = [
        "bg-blue-100 text-blue-500 border-blue-200 dark:border-blue-800 dark:bg-blue-900/30",
        "bg-red-100 text-red-500 border-red-200 dark:border-red-800 dark:bg-red-900/30",
        "bg-emerald-100 text-emerald-500 border-emerald-200 dark:border-emerald-800 dark:bg-emerald-900/30",
        "bg-amber-100 text-amber-500 border-amber-200 dark:border-amber-800 dark:bg-amber-900/30",
        "bg-orange-100 text-orange-500 border-orange-200 dark:border-orange-800 dark:bg-orange-900/30",
        "bg-purple-100 text-purple-500 border-purple-200 dark:border-purple-800 dark:bg-purple-900/30",
        "bg-pink-100 text-pink-500 border-pink-200 dark:border-pink-800 dark:bg-pink-900/30",
        "bg-cyan-100 text-cyan-500 border-cyan-200 dark:border-cyan-800 dark:bg-cyan-900/30",
        "bg-teal-100 text-teal-500 border-teal-200 dark:border-teal-800 dark:bg-teal-900/30",
        "bg-gray-200 text-gray-600 border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
    ];

    let editCatId = null;
    let tIcon = "🌟";
    let tColor = COLOR_PALETTE[0];
    let tType = "expense";
    let activeTab = Object.keys(ICON_LIBRARY)[0];
    
    // KHÓA CHỐNG KẸT NÚT (SPAM CLICK)
    let isSavingCat = false; 

    const extractBaseColor = (str) => {
        const match = str.match(/text-([a-z]+)-/);
        return match ? match[1] : "gray";
    };

    function injectUI() {
        if (document.getElementById('cat-studio-overlay')) return;
        
        // Đã thêm class 'hidden' vào để nó hoàn toàn biến mất khi đóng
        const html = `
        <div id="cat-studio-overlay" class="fixed inset-0 z-[250] custom-bg-body transition-all duration-300 opacity-0 scale-95 pointer-events-none hidden flex-col overflow-hidden">
            
            <div class="px-6 py-4 flex items-center justify-between z-20">
                <button onclick="closeCategoryManager()" class="w-10 h-10 flex items-center justify-center rounded-full custom-bg-card hover:brightness-95 transition-colors custom-text border custom-border active:scale-90 shadow-sm">
                    <i class="fa-solid fa-chevron-down"></i>
                </button>
                <p id="cat-studio-title" class="font-black text-xs tracking-[0.2em] uppercase custom-text opacity-50">Thêm Mới</p>
                <div class="w-10"></div>
            </div>

            <div class="w-full px-8 pt-2 pb-8 z-20 flex justify-center perspective-[1000px]">
                <div id="cat-preview-card" class="relative w-full max-w-[280px] aspect-[4/3] rounded-[2.5rem] shadow-2xl p-6 flex flex-col items-center justify-center transition-all duration-500 transform hover:scale-105 hover:-rotate-y-6">
                    <div id="cat-preview-glow" class="absolute inset-0 rounded-[2.5rem] blur-2xl opacity-40 -z-10 transition-all duration-500"></div>
                    <div class="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-[2.5rem] pointer-events-none"></div>
                    <div class="absolute inset-0 border-[3px] border-white/40 dark:border-white/10 rounded-[2.5rem] pointer-events-none"></div>

                    <div class="relative mb-4 group cursor-pointer" onclick="document.getElementById('studio-icon-section').scrollIntoView({behavior: 'smooth'})">
                        <div class="w-20 h-20 bg-white/20 dark:bg-black/20 rounded-full blur-md absolute inset-0"></div>
                        <span id="cat-preview-icon" class="relative text-[60px] leading-none drop-shadow-xl transition-transform duration-300 group-hover:scale-110">🌟</span>
                    </div>

                    <input type="text" id="cat-preview-name" placeholder="Tên danh mục..." class="w-full text-center text-xl font-black text-white bg-transparent outline-none placeholder-white/50 drop-shadow-md z-10" autocomplete="off">
                </div>
            </div>

            <div class="flex-1 custom-bg-card rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] overflow-y-auto custom-scrollbar relative z-30 pb-32 border-t custom-border">
                <div class="p-6 space-y-6 max-w-lg mx-auto">
                    
                    <div class="grid grid-cols-1 gap-6">
                        <div>
                            <p class="text-[10px] font-black custom-text-secondary uppercase tracking-widest mb-3 ml-1"><i class="fa-solid fa-money-bill-transfer text-blue-500 mr-1"></i> Tính chất</p>
                            <div class="flex custom-bg-input p-1.5 rounded-[1.25rem] relative isolate border custom-border">
                                <div id="type-slider" class="absolute top-1.5 bottom-1.5 w-1/3 custom-bg-card rounded-xl shadow-sm transition-all duration-300 z-0 border custom-border"></div>
                                <button id="type-expense" onclick="selectCatType('expense', 0)" class="flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-colors z-10 text-rose-500">Chi Tiền</button>
                                <button id="type-income" onclick="selectCatType('income', 1)" class="flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-colors z-10 text-success-500">Thu Tiền</button>
                                <button id="type-both" onclick="selectCatType('both', 2)" class="flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-colors z-10 text-primary-500">Cả Hai</button>
                            </div>
                        </div>

                        <div>
                            <p class="text-[10px] font-black custom-text-secondary uppercase tracking-widest mb-3 ml-1"><i class="fa-solid fa-palette text-pink-500 mr-1"></i> Pha màu</p>
                            <div class="flex gap-4 overflow-x-auto hidden-scrollbar pb-2 px-1" id="studio-colors"></div>
                        </div>
                    </div>

                    <div id="studio-icon-section">
                        <p class="text-[10px] font-black custom-text-secondary uppercase tracking-widest mb-3 ml-1"><i class="fa-solid fa-icons text-purple-500 mr-1"></i> Biểu tượng</p>
                        <div class="flex gap-2 overflow-x-auto hidden-scrollbar mb-4 pb-1" id="studio-icon-tabs"></div>
                        <div class="grid grid-cols-5 sm:grid-cols-6 gap-3" id="studio-icon-grid"></div>
                    </div>
                </div>
            </div>

            <div class="fixed bottom-6 left-0 right-0 px-6 flex justify-center z-50 pointer-events-none">
                <!-- THÊM ID VÀO NÚT ĐỂ HIỂN THỊ LOADING -->
                <button id="btn-save-cat-studio" onclick="saveCategoryManager()" class="w-full max-w-sm py-4 custom-primary text-white rounded-full font-black text-lg custom-shadow-lg active:scale-95 hover:-translate-y-1 transition-all pointer-events-auto flex items-center justify-center gap-2">
                    <i class="fa-solid fa-check-circle"></i> Lưu Danh Mục
                </button>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    window.openCategoryManager = (id = null) => {
        injectUI();
        editCatId = id;
        isSavingCat = false; // Reset khóa
        
        const titleEl = document.getElementById("cat-studio-title");
        const nameEl = document.getElementById("cat-preview-name");
        
        // Trả lại trạng thái gốc cho nút lưu
        const btnSave = document.getElementById("btn-save-cat-studio");
        if(btnSave) {
            btnSave.innerHTML = `<i class="fa-solid fa-check-circle"></i> Lưu Danh Mục`;
            btnSave.classList.remove("opacity-50");
        }

        if (id) {
            const cat = state.categories.find(c => c.id === id);
            if (cat) {
                titleEl.innerText = "Sửa Danh Mục";
                nameEl.value = cat.name;
                tIcon = cat.icon || "🌟";
                tColor = COLOR_PALETTE.find(c => c.includes(cat.color.split(' ')[0])) || COLOR_PALETTE[0];
                tType = cat.type || "expense";
                
                for (const [key, arr] of Object.entries(ICON_LIBRARY)) {
                    if (arr.includes(tIcon)) { activeTab = key; break; }
                }
            }
        } else {
            titleEl.innerText = "Thêm Mới";
            nameEl.value = "";
            tIcon = "🌟";
            tColor = COLOR_PALETTE[0];
            tType = "expense";
            activeTab = Object.keys(ICON_LIBRARY)[0];
        }

        renderCatPreview();
        renderColorPalette();
        renderIconTabs();
        renderIconGrid();
        
        const typeIndex = tType === 'expense' ? 0 : tType === 'income' ? 1 : 2;
        selectCatType(tType, typeIndex);

        const overlay = document.getElementById("cat-studio-overlay");
        
        // 1. Gỡ bỏ display:none trước
        overlay.classList.remove("hidden");
        overlay.classList.add("flex");
        
        // 2. Ép reflow để CSS bắt kịp
        void overlay.offsetWidth; 
        
        // 3. Chạy hiệu ứng trồi lên
        overlay.classList.remove("opacity-0", "scale-95", "pointer-events-none");
        
        if (typeof playSound === 'function') playSound("pop");
    };

    window.closeCategoryManager = () => {
        const overlay = document.getElementById("cat-studio-overlay");
        // Mờ dần
        overlay.classList.add("opacity-0", "scale-95", "pointer-events-none");
        
        // BIẾN MẤT HOÀN TOÀN SAU KHI MỜ ĐỂ KHÔNG KẸT MÀN HÌNH
        setTimeout(() => {
            overlay.classList.add("hidden");
            overlay.classList.remove("flex");
        }, 300);
    };

    window.selectCatType = (type, index) => {
        tType = type;
        const slider = document.getElementById("type-slider");
        slider.style.transform = `translateX(${index * 100}%)`;

        ['expense', 'income', 'both'].forEach((t, i) => {
            const btn = document.getElementById('type-' + t);
            if (i === index) {
                if(t==='expense') btn.className = "flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-colors z-10 text-rose-500 drop-shadow-sm";
                else if(t==='income') btn.className = "flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-colors z-10 text-success-500 drop-shadow-sm";
                else btn.className = "flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-colors z-10 text-primary-500 drop-shadow-sm";
            } else {
                btn.className = "flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-colors z-10 custom-text-secondary opacity-70 hover:opacity-100";
            }
        });
        if (typeof playSound === 'function') playSound("click");
    };

    window.selectCatColor = (colorStr) => {
        tColor = colorStr;
        renderCatPreview();
        renderColorPalette();
        if (typeof playSound === 'function') playSound("click");
    };

    window.selectStudioTab = (tabName) => {
        activeTab = tabName;
        renderIconTabs();
        renderIconGrid();
        if (typeof playSound === 'function') playSound("click");
    };

    window.selectCatIcon = (iconStr) => {
        tIcon = iconStr;
        renderCatPreview();
        renderIconGrid();
        if (typeof playSound === 'function') playSound("click");
    };

    function renderCatPreview() {
        const card = document.getElementById("cat-preview-card");
        const glow = document.getElementById("cat-preview-glow");
        const iconEl = document.getElementById("cat-preview-icon");
        
        const baseColor = extractBaseColor(tColor);
        const colorGradients = {
            "blue": "from-blue-400 to-blue-600",
            "red": "from-rose-400 to-rose-600",
            "emerald": "from-emerald-400 to-emerald-600",
            "amber": "from-amber-400 to-amber-600",
            "orange": "from-orange-400 to-orange-600",
            "purple": "from-purple-400 to-purple-600",
            "pink": "from-pink-400 to-pink-600",
            "cyan": "from-cyan-400 to-cyan-600",
            "teal": "from-teal-400 to-teal-600",
            "gray": "from-gray-400 to-gray-600"
        };
        const gradClass = colorGradients[baseColor] || colorGradients["gray"];
        
        card.className = `relative w-full max-w-[280px] aspect-[4/3] rounded-[2.5rem] shadow-2xl p-6 flex flex-col items-center justify-center transition-all duration-500 transform hover:scale-105 hover:-rotate-y-6 bg-gradient-to-br ${gradClass}`;
        glow.className = `absolute inset-0 rounded-[2.5rem] blur-2xl opacity-40 -z-10 transition-all duration-500 bg-gradient-to-br ${gradClass}`;
        
        iconEl.innerText = tIcon;
        iconEl.classList.add('scale-125');
        setTimeout(() => iconEl.classList.remove('scale-125'), 150);
    }

    function renderColorPalette() {
        const container = document.getElementById("studio-colors");
        container.innerHTML = COLOR_PALETTE.map(c => {
            const isActive = tColor === c;
            const baseColor = extractBaseColor(c);
            const bgColorMap = { "blue":"bg-blue-500", "red":"bg-rose-500", "emerald":"bg-emerald-500", "amber":"bg-amber-500", "orange":"bg-orange-500", "purple":"bg-purple-500", "pink":"bg-pink-500", "cyan":"bg-cyan-500", "teal":"bg-teal-500", "gray":"bg-gray-500" };
            const hexClass = bgColorMap[baseColor] || "bg-gray-500";

            return `
            <button onclick="selectCatColor('${c}')" class="w-10 h-10 shrink-0 rounded-full ${hexClass} flex items-center justify-center transition-all duration-300 relative border-[3px] shadow-sm ${isActive ? 'border-primary-500 scale-125 z-10' : 'border-white dark:border-gray-800 hover:scale-110 z-0'}">
                ${isActive ? '<i class="fa-solid fa-check text-white text-xs drop-shadow-md"></i>' : ''}
            </button>
            `;
        }).join('');
    }

    function renderIconTabs() {
        const container = document.getElementById("studio-icon-tabs");
        container.innerHTML = Object.keys(ICON_LIBRARY).map(tab => {
            const isActive = activeTab === tab;
            return `
            <button onclick="selectStudioTab('${tab}')" class="px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${isActive ? 'custom-primary text-white border-transparent custom-shadow-sm' : 'bg-transparent custom-text-secondary border-gray-200 dark:border-gray-800 hover:custom-bg-input'}">
                ${tab}
            </button>
            `;
        }).join('');
    }

    function renderIconGrid() {
        const container = document.getElementById("studio-icon-grid");
        const icons = ICON_LIBRARY[activeTab] || [];
        
        container.innerHTML = icons.map(ic => {
            const isActive = tIcon === ic;
            return `
            <button onclick="selectCatIcon('${ic}')" class="aspect-square rounded-[1.25rem] text-3xl sm:text-[32px] flex items-center justify-center transition-all duration-200 ${isActive ? 'custom-bg-primary-soft border-[2.5px] border-primary-500 scale-110 shadow-sm' : 'custom-bg-input border custom-border hover:brightness-95 hover:scale-105 active:scale-95'}">
                ${ic}
            </button>
            `;
        }).join('');
    }

    window.saveCategoryManager = () => {
        // NẾU ĐANG CHẠY LƯU RỒI THÌ CHẶN KHÔNG CHO BẤM NỮA (CHỐNG LỖI ĐẺ TRỨNG)
        if (isSavingCat) return;

        const nameEl = document.getElementById("cat-preview-name");
        const name = nameEl.value.trim();
        
        if (!name) {
            alert("Tên danh mục đang để trống kìa đại ka!");
            nameEl.focus();
            return;
        }

        // BẬT KHÓA
        isSavingCat = true;
        const btnSave = document.getElementById("btn-save-cat-studio");
        if(btnSave) {
            btnSave.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...`;
            btnSave.classList.add("opacity-50");
        }

        const newData = {
            id: editCatId ? editCatId : "c" + generateId(),
            name: name,
            icon: tIcon,
            type: tType,
            color: tColor 
        };

        if (editCatId) {
            const idx = state.categories.findIndex(c => c.id === editCatId);
            if(idx > -1) state.categories[idx] = newData;
        } else {
            state.categories.push(newData);
        }

        // LƯU DATA VÀO Ổ CỨNG
        if (typeof saveData === 'function') saveData();
        
        // ĐÓNG MÀN HÌNH NGAY LẬP TỨC ĐỂ TRÁNH KẸT
        closeCategoryManager(); 
        
        // VẼ LẠI GIAO DIỆN
        if (typeof renderSettings === 'function') renderSettings();
        if (typeof playSound === 'function') playSound("success");
    };

})();