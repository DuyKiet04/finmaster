// ==============================================================
// FILE: location-analytics.js - LIQUID GLASS & BENTO EDITION
// Phân Tích Thực Địa, Bản Đồ Nhiệt, Chỉ Đường & Xếp Hạng Đốt Tiền
// ==============================================================

// 1. TỰ ĐỘNG BƠM GIAO DIỆN CHÍNH
(function injectLocationAnalyticsUI() {
    if (document.getElementById('loc-analytics-overlay')) return;

    const locHTML = `
    <div id="loc-analytics-overlay" class="fixed inset-0 z-[200] custom-bg-body transition-all duration-400 translate-y-full opacity-0 flex flex-col hidden font-sans">
        
        <!-- HEADER NỔI TRÊN BẢN ĐỒ (FLOATING GLASS CONTROLS) -->
        <div class="absolute top-0 left-0 right-0 z-[9999] px-3 sm:px-4 py-3 flex items-center justify-between pointer-events-none">
            <button onclick="closeLocAnalytics()" class="w-10 h-10 pointer-events-auto flex items-center justify-center rounded-2xl loc-hero-glass custom-text hover:text-primary-500 hover:scale-105 active:scale-95 transition-all shadow-md" title="Đóng">
                <i class="fa-solid fa-arrow-left"></i>
            </button>
            
            <!-- Capsule Tiêu Đề Trung Tâm -->
            <div class="pointer-events-auto loc-hero-glass px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-sm shadow-rose-500/80"></div>
                <h3 class="font-black text-xs sm:text-sm custom-text tracking-wide">Bản Đồ Chi Tiêu</h3>
                <span id="loc-header-total-pill" class="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/20 truncate max-w-[120px]">0 ₫</span>
            </div>

            <!-- Nhóm nút điều khiển nhanh bản đồ -->
            <div class="flex items-center gap-1.5 pointer-events-auto">
                <button onclick="toggleLocMapHeight()" id="btn-loc-map-toggle" class="w-10 h-10 flex items-center justify-center rounded-2xl loc-hero-glass custom-text hover:text-primary-500 active:scale-90 transition-all shadow-md" title="Mở rộng / Thu gọn bản đồ">
                    <i class="fa-solid fa-up-down text-xs"></i>
                </button>
                <button onclick="locLocateMe()" class="w-10 h-10 flex items-center justify-center rounded-2xl loc-hero-glass text-primary-500 active:scale-90 transition-all shadow-md" title="Về vị trí hiện tại của tôi">
                    <i class="fa-solid fa-location-crosshairs text-xs"></i>
                </button>
            </div>
        </div>

        <!-- BẢN ĐỒ HERO (NỬA TRÊN) -->
        <div class="w-full h-[45vh] relative custom-bg-input shrink-0 transition-all duration-300" id="loc-heatmap-container">
            <div id="loc-map-loading" class="absolute inset-0 flex flex-col items-center justify-center custom-bg-body opacity-80 backdrop-blur-md z-0">
                <div class="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mb-3" style="border-color: var(--icon-active, #6366f1); border-top-color: transparent;"></div>
                <span class="text-xs font-bold custom-text-secondary tracking-widest uppercase">Đang quét vị trí thực địa...</span>
            </div>

            <!-- Nút chuyển Layer Bản Đồ (Góc dưới phải bản đồ) -->
            <div class="absolute bottom-6 right-3 z-20 flex items-center gap-1.5 loc-hero-glass p-1 rounded-2xl shadow-lg pointer-events-auto">
                <button onclick="setLocMapTile('street')" id="btn-tile-street" class="px-2.5 py-1 rounded-xl text-[10px] font-black bg-primary-500 text-white shadow-sm transition-all">Đường phố</button>
                <button onclick="setLocMapTile('sat')" id="btn-tile-sat" class="px-2.5 py-1 rounded-xl text-[10px] font-bold custom-text-secondary hover:custom-text transition-all">Vệ tinh</button>
                <button onclick="toggleLocViewMode()" id="btn-toggle-viewmode" class="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-black/5 dark:bg-white/10 custom-text transition-all flex items-center gap-1">
                    <i class="fa-solid fa-layer-group text-[9px]"></i> <span id="loc-viewmode-label">Ghim</span>
                </button>
            </div>
        </div>

        <!-- PANEL DỮ LIỆU (NỬA DƯỚI) -->
        <div class="flex-1 custom-bg-body -mt-5 rounded-t-[2.25rem] z-20 custom-shadow-lg flex flex-col relative overflow-hidden custom-border border-b-0 border-x-0">
            <!-- Handle bar -->
            <div class="w-full flex justify-center pt-3 pb-1 shrink-0 cursor-pointer" onclick="toggleLocMapHeight()">
                <div class="w-12 h-1.5 custom-bg-input rounded-full"></div>
            </div>

            <!-- Tổng quan Bento & Bộ lọc -->
            <div class="px-4 sm:px-5 pt-2 pb-3 shrink-0 space-y-3 custom-bg-body border-b custom-border">
                
                <!-- DẢI BENTO 4 CHỈ SỐ THỰC ĐỊA -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <!-- KPI 1: Số địa điểm -->
                    <div class="loc-kpi-card p-2.5 sm:p-3 flex flex-col justify-between">
                        <div class="flex items-center justify-between mb-0.5">
                            <span class="text-[9px] font-black uppercase tracking-wider text-rose-500">Điểm ghé</span>
                            <div class="w-5 h-5 rounded-md bg-rose-500/15 text-rose-500 flex items-center justify-center text-[9px]"><i class="fa-solid fa-location-dot"></i></div>
                        </div>
                        <div id="loc-total-places" class="text-base sm:text-lg font-black custom-text">0</div>
                        <div class="text-[8px] font-semibold custom-text-secondary">Địa điểm phát sinh</div>
                    </div>

                    <!-- KPI 2: Tổng đốt tiền -->
                    <div class="loc-kpi-card p-2.5 sm:p-3 flex flex-col justify-between">
                        <div class="flex items-center justify-between mb-0.5">
                            <span class="text-[9px] font-black uppercase tracking-wider text-blue-500">Tổng chi</span>
                            <div class="w-5 h-5 rounded-md bg-blue-500/15 text-blue-500 flex items-center justify-center text-[9px]"><i class="fa-solid fa-receipt"></i></div>
                        </div>
                        <div id="loc-total-spent" class="text-base sm:text-lg font-black text-rose-500 truncate">0 ₫</div>
                        <div class="text-[8px] font-semibold custom-text-secondary">Chi tiêu thực địa</div>
                    </div>

                    <!-- KPI 3: Chi đậm nhất -->
                    <div class="loc-kpi-card p-2.5 sm:p-3 flex flex-col justify-between">
                        <div class="flex items-center justify-between mb-0.5">
                            <span class="text-[9px] font-black uppercase tracking-wider text-amber-500">Đậm nhất</span>
                            <div class="w-5 h-5 rounded-md bg-amber-500/15 text-amber-500 flex items-center justify-center text-[9px]"><i class="fa-solid fa-crown"></i></div>
                        </div>
                        <div id="loc-top-place-name" class="text-xs sm:text-sm font-black text-amber-500 truncate">Chưa có</div>
                        <div id="loc-top-place-amt" class="text-[8px] font-semibold custom-text-secondary truncate">0 ₫</div>
                    </div>

                    <!-- KPI 4: Quán ruột -->
                    <div class="loc-kpi-card p-2.5 sm:p-3 flex flex-col justify-between">
                        <div class="flex items-center justify-between mb-0.5">
                            <span class="text-[9px] font-black uppercase tracking-wider text-emerald-500">Quán ruột</span>
                            <div class="w-5 h-5 rounded-md bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-[9px]"><i class="fa-solid fa-repeat"></i></div>
                        </div>
                        <div id="loc-freq-place-name" class="text-xs sm:text-sm font-black text-emerald-500 truncate">Chưa có</div>
                        <div id="loc-freq-place-count" class="text-[8px] font-semibold custom-text-secondary truncate">0 lần ghé</div>
                    </div>
                </div>

                <!-- THANH CHỌN THÁNG & TÌM KIẾM -->
                <div class="flex items-center justify-between gap-2">
                    <!-- Nút chọn tháng -->
                    <div class="flex items-center custom-bg-card rounded-2xl border custom-border p-1 shadow-sm shrink-0">
                        <button onclick="changeLocMonth(-1)" class="w-8 h-8 rounded-xl custom-bg-input custom-text flex items-center justify-center transition-colors active:scale-90" title="Tháng trước">
                            <i class="fa-solid fa-chevron-left text-xs"></i>
                        </button>
                        <span id="loc-month-label" class="px-3 text-xs sm:text-sm font-black custom-text uppercase tracking-wider min-w-[85px] text-center">Tháng 10</span>
                        <button onclick="changeLocMonth(1)" class="w-8 h-8 rounded-xl custom-bg-input custom-text flex items-center justify-center transition-colors active:scale-90" title="Tháng sau">
                            <i class="fa-solid fa-chevron-right text-xs"></i>
                        </button>
                    </div>

                    <!-- Ô tìm kiếm địa điểm -->
                    <div class="relative flex-1 min-w-0">
                        <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[10px] custom-text-secondary"></i>
                        <input
                            type="text"
                            id="loc-search-input"
                            oninput="setLocSearch(this.value)"
                            placeholder="Tìm quán, tên đường..."
                            class="w-full pl-8 pr-7 py-2 rounded-2xl custom-bg-card border custom-border font-bold text-xs custom-text outline-none custom-focus custom-placeholder shadow-sm"
                        />
                        <button id="loc-search-clear" onclick="clearLocSearch()" class="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full custom-bg-input text-[9px] custom-text-secondary flex items-center justify-center hidden">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>

                <!-- TABS SẮP XẾP (3 TIÊU CHÍ) -->
                <div class="flex custom-bg-input p-1 rounded-2xl border custom-border shadow-sm text-xs font-black">
                    <button id="tab-sort-amount" onclick="setLocSort('amount')" class="an-tab-btn active flex-1 py-1.5 rounded-xl text-center custom-primary text-white shadow-sm">
                        💰 Chi nhiều nhất
                    </button>
                    <button id="tab-sort-freq" onclick="setLocSort('freq')" class="an-tab-btn flex-1 py-1.5 rounded-xl text-center custom-text-secondary">
                        🔁 Ghé thường xuyên
                    </button>
                    <button id="tab-sort-avg" onclick="setLocSort('avg')" class="an-tab-btn flex-1 py-1.5 rounded-xl text-center custom-text-secondary">
                        📊 TB / Lần
                    </button>
                </div>
            </div>

            <!-- DANH SÁCH ĐỊA ĐIỂM -->
            <div class="flex-1 overflow-y-auto px-4 sm:px-5 py-3 pb-24 custom-scrollbar custom-bg-body space-y-3" id="loc-leaderboard">
                <!-- Data render here -->
            </div>
        </div>
    </div>

    <!-- BOTTOM SHEET CHI TIẾT ĐỊA ĐIỂM -->
    <div id="loc-bottom-sheet-backdrop" onclick="closeLocBottomSheet()" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] hidden opacity-0 transition-opacity duration-300 pointer-events-auto"></div>
    <div id="loc-bottom-sheet" class="fixed bottom-0 left-0 right-0 custom-bg-body z-[300] rounded-t-[2.5rem] custom-shadow-lg transform translate-y-full transition-transform duration-300 ease-out flex flex-col max-h-[85vh] custom-border border-b-0 border-x-0">
        <div class="w-full flex justify-center pt-3.5 pb-1 cursor-pointer" onclick="closeLocBottomSheet()">
            <div class="w-12 h-1.5 custom-bg-input rounded-full"></div>
        </div>
        
        <div class="px-5 pb-4 pt-2 flex gap-3.5 items-start relative border-b border-dashed custom-border">
            <div id="loc-bs-cat-icon" class="w-14 h-14 rounded-2xl custom-bg-primary-soft flex items-center justify-center custom-border shrink-0 text-2xl shadow-inner mt-0.5">
                🍔
            </div>
            <div class="flex-1 min-w-0 pr-12">
                <h3 id="loc-bs-title" class="font-black text-base sm:text-lg custom-text leading-tight mb-1 truncate">Tên Địa Điểm</h3>
                <div class="flex items-center gap-2 text-xs font-bold custom-text-secondary flex-wrap">
                    <span id="loc-bs-count" class="custom-bg-input px-2 py-0.5 rounded-lg border custom-border">0 lần ghé</span>
                    <span id="loc-bs-avg" class="text-primary-500">TB 0đ / lần</span>
                    <span id="loc-bs-total" class="font-black text-rose-500">Tổng: 0đ</span>
                </div>
            </div>
            <!-- Nút Map chỉ đường Google Maps trực tiếp -->
            <button onclick="viewLocOnMap()" class="absolute right-5 top-3 w-10 h-10 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md flex items-center justify-center hover:scale-105 active:scale-90 transition-transform" title="Chỉ đường Google Maps">
                <i class="fa-solid fa-diamond-turn-right text-sm"></i>
            </button>
        </div>

        <div class="flex-1 overflow-y-auto px-5 py-3.5 custom-scrollbar bg-black/5 dark:bg-white/5 space-y-2.5">
            <h4 class="font-black text-[11px] uppercase tracking-wider custom-text-secondary mb-2 flex items-center gap-1.5">
                <i class="fa-solid fa-clock-rotate-left text-primary-500"></i> Lịch sử hóa đơn tại đây
            </h4>
            <div id="loc-bs-tx-list" class="space-y-2"></div>
        </div>
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', locHTML);
})();

// =====================================
// 2. BIẾN TOÀN CỤC & ENGINE XỬ LÝ
// =====================================
let locCurrentDate = new Date();
let locMapInstance = null;
let locHeatLayer = null;
let locMarkerLayer = null;
let locRawData = [];
let locCurrentLat = null;
let locCurrentLng = null;
let locCurrentSort = 'amount'; // 'amount', 'freq', 'avg'
let locSearchQuery = '';
let locMapHeightMode = 'split'; // 'split' (45vh), 'tall' (68vh), 'compact' (28vh)
let locTileType = 'street';     // 'street', 'sat'
let locViewMode = 'heat';       // 'heat', 'pins'

window.openLocAnalytics = async () => {
    const loadingEl = document.getElementById("loc-map-loading");
    if (loadingEl) loadingEl.classList.remove("hidden");
    
    if (typeof L === 'undefined' && typeof window.loadScript === 'function') {
        await window.loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css", true);
        await window.loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js");
        await window.loadScript("https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js");
    }

    const overlay = document.getElementById("loc-analytics-overlay");
    if (overlay) {
        overlay.classList.remove("hidden");
        requestAnimationFrame(() => {
            overlay.classList.remove("translate-y-full", "opacity-0");
        });
    }
    
    renderLocAnalyticsData();
    initLocMap();
    if (typeof playSound === 'function') playSound("pop");
};

window.closeLocAnalytics = () => {
    const overlay = document.getElementById("loc-analytics-overlay");
    if (overlay) {
        overlay.classList.add("translate-y-full", "opacity-0");
        setTimeout(() => overlay.classList.add("hidden"), 350);
    }
};

window.changeLocMonth = (dir) => {
    locCurrentDate.setMonth(locCurrentDate.getMonth() + dir);
    renderLocAnalyticsData();
    if (typeof playSound === 'function') playSound("click");
};

window.setLocSearch = (val) => {
    locSearchQuery = val ? val.trim().toLowerCase() : '';
    const clearBtn = document.getElementById("loc-search-clear");
    if (clearBtn) {
        if (locSearchQuery) clearBtn.classList.remove("hidden");
        else clearBtn.classList.add("hidden");
    }
    renderLocAnalyticsData();
};

window.clearLocSearch = () => {
    const inp = document.getElementById("loc-search-input");
    if (inp) inp.value = '';
    locSearchQuery = '';
    const clearBtn = document.getElementById("loc-search-clear");
    if (clearBtn) clearBtn.classList.add("hidden");
    renderLocAnalyticsData();
};

window.setLocSort = (type) => {
    locCurrentSort = type;
    ['amount', 'freq', 'avg'].forEach(t => {
        const btn = document.getElementById(`tab-sort-${t}`);
        if (btn) {
            if (t === type) {
                btn.className = "an-tab-btn active flex-1 py-1.5 rounded-xl text-center custom-primary text-white shadow-sm";
            } else {
                btn.className = "an-tab-btn flex-1 py-1.5 rounded-xl text-center custom-text-secondary";
            }
        }
    });
    renderLocAnalyticsData();
    if (typeof playSound === 'function') playSound("click");
};

window.toggleLocMapHeight = () => {
    const mapBox = document.getElementById("loc-heatmap-container");
    if (!mapBox) return;

    if (locMapHeightMode === 'split') {
        locMapHeightMode = 'tall';
        mapBox.style.height = '68vh';
    } else if (locMapHeightMode === 'tall') {
        locMapHeightMode = 'compact';
        mapBox.style.height = '28vh';
    } else {
        locMapHeightMode = 'split';
        mapBox.style.height = '45vh';
    }

    setTimeout(() => {
        if (locMapInstance) locMapInstance.invalidateSize();
    }, 320);
    if (typeof playSound === 'function') playSound("pop");
};

window.setLocMapTile = (type) => {
    locTileType = type;
    const btnStreet = document.getElementById("btn-tile-street");
    const btnSat = document.getElementById("btn-tile-sat");

    if (type === 'sat') {
        if (btnSat) btnSat.className = "px-2.5 py-1 rounded-xl text-[10px] font-black bg-primary-500 text-white shadow-sm transition-all";
        if (btnStreet) btnStreet.className = "px-2.5 py-1 rounded-xl text-[10px] font-bold custom-text-secondary hover:custom-text transition-all";
    } else {
        if (btnStreet) btnStreet.className = "px-2.5 py-1 rounded-xl text-[10px] font-black bg-primary-500 text-white shadow-sm transition-all";
        if (btnSat) btnSat.className = "px-2.5 py-1 rounded-xl text-[10px] font-bold custom-text-secondary hover:custom-text transition-all";
    }

    if (locMapInstance) {
        locMapInstance.eachLayer(layer => {
            if (layer instanceof L.TileLayer) locMapInstance.removeLayer(layer);
        });

        const tileUrl = type === 'sat'
            ? 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
            : 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

        L.tileLayer(tileUrl, { subdomains: ['0', '1', '2', '3'], maxZoom: 20 }).addTo(locMapInstance);
        
        // Re-add heat / markers
        updateHeatmap();
    }
};

window.toggleLocViewMode = () => {
    locViewMode = locViewMode === 'heat' ? 'pins' : 'heat';
    const label = document.getElementById("loc-viewmode-label");
    if (label) label.innerText = locViewMode === 'heat' ? 'Nhiệt' : 'Ghim';
    updateHeatmap();
    if (typeof playSound === 'function') playSound("click");
};

window.locLocateMe = () => {
    if (!locMapInstance) return;
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(pos => {
            locMapInstance.flyTo([pos.coords.latitude, pos.coords.longitude], 16, { duration: 1.2 });
        });
    }
    if (typeof playSound === 'function') playSound("pop");
};

// =====================================
// 3. RENDER DỮ LIỆU THỰC ĐỊA
// =====================================
window.renderLocAnalyticsData = () => {
    const y = locCurrentDate.getFullYear();
    const m = locCurrentDate.getMonth();
    
    const monthLabel = document.getElementById("loc-month-label");
    if (monthLabel) monthLabel.innerText = `Tháng ${m + 1}`;

    const txs = (state.transactions || []).filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === m && d.getFullYear() === y && t.type === 'expense' && t.locationName;
    });

    const grouped = {};
    txs.forEach(t => {
        if (!grouped[t.locationName]) {
            grouped[t.locationName] = { 
                name: t.locationName, 
                totalAmount: 0, 
                count: 0, 
                lat: t.lat, 
                lng: t.lng,
                txs: [] 
            };
        }
        grouped[t.locationName].totalAmount += (Number(t.amount) || 0);
        grouped[t.locationName].count += 1;
        grouped[t.locationName].txs.push(t);
    });

    locRawData = Object.values(grouped);
    
    // Tổng số tiền đốt tại các địa điểm
    const totalSpentAtPlaces = locRawData.reduce((sum, l) => sum + l.totalAmount, 0);
    const headerPill = document.getElementById("loc-header-total-pill");
    if (headerPill) headerPill.innerText = `-${formatMoney(totalSpentAtPlaces)}`;
    const totalSpentEl = document.getElementById("loc-total-spent");
    if (totalSpentEl) totalSpentEl.innerText = formatMoney(totalSpentAtPlaces);

    // Tìm quán tiêu đậm nhất & quán ruột
    const topPlace = [...locRawData].sort((a, b) => b.totalAmount - a.totalAmount)[0];
    const freqPlace = [...locRawData].sort((a, b) => b.count - a.count)[0];

    const topPlaceName = document.getElementById("loc-top-place-name");
    const topPlaceAmt = document.getElementById("loc-top-place-amt");
    if (topPlaceName && topPlaceAmt) {
        if (topPlace) {
            topPlaceName.innerText = typeof window.formatShortAddress === 'function' ? window.formatShortAddress(topPlace.name) : topPlace.name.split(',')[0];
            topPlaceAmt.innerText = formatMoney(topPlace.totalAmount);
        } else {
            topPlaceName.innerText = "Chưa có";
            topPlaceAmt.innerText = "0 ₫";
        }
    }

    const freqPlaceName = document.getElementById("loc-freq-place-name");
    const freqPlaceCount = document.getElementById("loc-freq-place-count");
    if (freqPlaceName && freqPlaceCount) {
        if (freqPlace) {
            freqPlaceName.innerText = typeof window.formatShortAddress === 'function' ? window.formatShortAddress(freqPlace.name) : freqPlace.name.split(',')[0];
            freqPlaceCount.innerText = `${freqPlace.count} lần ghé`;
        } else {
            freqPlaceName.innerText = "Chưa có";
            freqPlaceCount.innerText = "0 lần ghé";
        }
    }

    // Lọc theo search input
    let displayList = [...locRawData];
    if (locSearchQuery) {
        displayList = displayList.filter(l => l.name.toLowerCase().includes(locSearchQuery));
    }

    // Sắp xếp
    if (locCurrentSort === 'amount') {
        displayList.sort((a, b) => b.totalAmount - a.totalAmount);
    } else if (locCurrentSort === 'freq') {
        displayList.sort((a, b) => b.count - a.count);
    } else {
        displayList.sort((a, b) => (b.totalAmount / b.count) - (a.totalAmount / a.count));
    }

    const totalPlacesEl = document.getElementById("loc-total-places");
    if (totalPlacesEl) totalPlacesEl.innerText = displayList.length;

    const boardEl = document.getElementById("loc-leaderboard");
    if (!boardEl) return;

    if (displayList.length === 0) {
        boardEl.innerHTML = `
            <div class="flex flex-col items-center justify-center py-10 opacity-60">
                <div class="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-3xl custom-text-secondary mb-3">
                    <i class="fa-solid fa-satellite-dish"></i>
                </div>
                <p class="text-xs font-bold custom-text-secondary text-center">
                    ${locRawData.length === 0 ? "Chưa có dữ liệu vị trí nào trong tháng này!" : "Không tìm thấy địa điểm khớp với từ khóa."}
                </p>
            </div>`;
        updateHeatmap();
        return;
    }

    const maxAmount = Math.max(...displayList.map(l => l.totalAmount), 1);
    const medals = ['🥇', '🥈', '🥉'];

    boardEl.innerHTML = displayList.map((loc, idx) => {
        const sortedTxs = loc.txs.sort((a, b) => b.amount - a.amount);
        const mainCatId = sortedTxs[0] ? sortedTxs[0].category : null;
        const cat = (state.categories || []).find(c => c.id === mainCatId) || { name: "Khác", icon: "📍", color: "bg-gray-100 text-gray-500" };
        const shortName = typeof window.formatShortAddress === 'function' ? window.formatShortAddress(loc.name) : loc.name.split(',')[0];
        
        const percent = Math.min(100, Math.round((loc.totalAmount / maxAmount) * 100));
        const avgPerVisit = Math.round(loc.totalAmount / loc.count);
        const pctOfTotal = totalSpentAtPlaces > 0 ? ((loc.totalAmount / totalSpentAtPlaces) * 100).toFixed(1) : 0;
        const medal = medals[idx] || `<span class="text-[10px] font-black text-gray-400">#${idx + 1}</span>`;

        return `
        <div class="loc-card-glass p-3.5 sm:p-4 border custom-border group cursor-pointer transition-all active:scale-[0.99] relative" onclick="openLocBottomSheet('${loc.name.replace(/'/g, "\\'")}')">
            <div class="flex items-start gap-3 relative z-10">
                <div class="w-6 text-center text-sm font-bold shrink-0 mt-2">${medal}</div>
                <div class="w-11 h-11 rounded-2xl ${cat.color} flex items-center justify-center text-xl shrink-0 border custom-border shadow-sm group-hover:scale-105 transition-transform mt-0.5">
                    ${cat.icon}
                </div>
                
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-baseline mb-0.5">
                        <p class="font-black text-xs sm:text-sm custom-text truncate pr-2 group-hover:text-primary-500 transition-colors">${shortName}</p>
                        <p class="font-black text-xs sm:text-sm text-rose-500 shrink-0">-${formatMoney(loc.totalAmount)}</p>
                    </div>

                    <p class="text-[10px] font-medium custom-text-secondary truncate mb-1.5">${loc.name}</p>

                    <!-- Indicators line -->
                    <div class="flex items-center gap-2 mb-2 flex-wrap">
                        <span class="px-2 py-0.5 rounded-lg custom-bg-input border custom-border text-[9px] font-bold custom-text-secondary">
                            <i class="fa-solid fa-shoe-prints text-[8px] opacity-70"></i> ${loc.count} lần
                        </span>
                        <span class="px-2 py-0.5 rounded-lg custom-bg-input border custom-border text-[9px] font-bold text-primary-500">
                            TB ${formatMoney(avgPerVisit)}/lần
                        </span>
                        <span class="text-[9px] font-bold custom-text-secondary ml-auto">${pctOfTotal}%</span>
                    </div>

                    <!-- Progress bar -->
                    <div class="h-1.5 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                        <div class="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-1000" style="width: ${percent}%;"></div>
                    </div>
                </div>
            </div>

            <!-- Quick Action Row at bottom of card -->
            <div class="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-dashed custom-border text-xs" onclick="event.stopPropagation();">
                ${(loc.lat && loc.lng) ? `
                <a href="https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}" target="_blank" class="px-2.5 py-1 rounded-xl custom-bg-input hover:bg-primary-500 hover:text-white transition-all text-[10px] font-black custom-text-secondary border custom-border flex items-center gap-1">
                    <i class="fa-solid fa-diamond-turn-right text-primary-500"></i> Chỉ đường
                </a>
                <button onclick="flyToLocOnTopMap(${loc.lat}, ${loc.lng}, '${loc.name.replace(/'/g, "\\'")}', ${loc.totalAmount})" class="px-2.5 py-1 rounded-xl bg-primary-500/10 hover:bg-primary-500/25 text-primary-500 transition-all text-[10px] font-black border border-primary-500/20 flex items-center gap-1">
                    <i class="fa-solid fa-location-crosshairs"></i> Xem trên bản đồ
                </button>` : ''}
            </div>
        </div>`;
    }).join("");

    updateHeatmap();
};

// =====================================
// 4. MAP & HEATMAP ENGINE
// =====================================
window.initLocMap = () => {
    setTimeout(() => {
        if (!locMapInstance && typeof L !== 'undefined') {
            locMapInstance = L.map('loc-heatmap-container', { 
                zoomControl: false,
                attributionControl: false
            }).setView([10.8231, 106.6297], 12);
            
            L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
                subdomains: ['0', '1', '2', '3'],
                maxZoom: 20
            }).addTo(locMapInstance);

            locMarkerLayer = L.layerGroup().addTo(locMapInstance);
        } else if (locMapInstance) {
            locMapInstance.invalidateSize();
        }
        
        const loadingEl = document.getElementById("loc-map-loading");
        if (loadingEl) loadingEl.classList.add("hidden");
        updateHeatmap();
    }, 350);
};

window.updateHeatmap = () => {
    if (!locMapInstance || typeof L === 'undefined') return;
    
    // Clear heat layer
    if (locHeatLayer) {
        locMapInstance.removeLayer(locHeatLayer);
        locHeatLayer = null;
    }
    // Clear markers
    if (locMarkerLayer) {
        locMarkerLayer.clearLayers();
    }

    const validLocs = locRawData.filter(loc => loc.lat && loc.lng);
    if (validLocs.length === 0) {
        locMapInstance.setView([10.8231, 106.6297], 12);
        return;
    }

    if (locViewMode === 'heat' && typeof L.heatLayer !== 'undefined') {
        const heatData = validLocs.map(loc => [loc.lat, loc.lng, Math.min(loc.totalAmount, 5000000)]);
        locHeatLayer = L.heatLayer(heatData, {
            radius: 32,
            blur: 20,
            maxZoom: 16,
            gradient: { 0.2: '#3b82f6', 0.4: '#10b981', 0.7: '#f59e0b', 1.0: '#f43f5e' }
        }).addTo(locMapInstance);
    } else {
        // Pins Mode: Interactive markers
        validLocs.forEach(loc => {
            const shortName = typeof window.formatShortAddress === 'function' ? window.formatShortAddress(loc.name) : loc.name.split(',')[0];
            const sortedTxs = loc.txs.sort((a, b) => b.amount - a.amount);
            const mainCatId = sortedTxs[0] ? sortedTxs[0].category : null;
            const cat = (state.categories || []).find(c => c.id === mainCatId) || { icon: "📍" };

            const iconHtml = `
                <div style="position: relative; width: 42px; height: 42px; transition: transform 0.2s;" class="hover:scale-110 active:scale-95">
                    <div style="width: 42px; height: 42px; background: white; border-radius: 50%; padding: 2px; box-shadow: 0 4px 14px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; font-size: 19px; position: relative; z-index: 10;">
                        ${cat.icon}
                    </div>
                    <div style="position: absolute; bottom: -7px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 9px solid white; z-index: 0;"></div>
                </div>
            `;

            const icon = L.divIcon({
                html: iconHtml,
                className: '',
                iconSize: [42, 50],
                iconAnchor: [21, 50]
            });

            const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(locMarkerLayer);
            
            const popupHtml = `
                <div class="font-sans w-[210px]">
                    <h4 class="font-black text-sm custom-text mb-0.5 leading-tight">${shortName}</h4>
                    <p class="text-[10px] text-gray-500 font-medium mb-1.5 truncate">${loc.name}</p>
                    <p class="text-xs font-black text-rose-500 mb-2">-${formatMoney(loc.totalAmount)} (${loc.count} lần ghé)</p>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}" target="_blank" class="w-full py-2 flex items-center justify-center gap-1.5 custom-primary text-white font-bold text-xs rounded-xl shadow-md no-underline">
                        <i class="fa-solid fa-diamond-turn-right text-white"></i> Chỉ đường Google Maps
                    </a>
                </div>
            `;
            marker.bindPopup(popupHtml);
        });
    }

    const bounds = L.latLngBounds(validLocs.map(h => [h.lat, h.lng]));
    locMapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
};

window.flyToLocOnTopMap = (lat, lng, name, amount) => {
    if (!locMapInstance || !lat || !lng) return;
    
    // Expand map if compact
    if (locMapHeightMode === 'compact') {
        toggleLocMapHeight();
    }

    locMapInstance.flyTo([lat, lng], 17, { duration: 1 });

    setTimeout(() => {
        const shortName = typeof window.formatShortAddress === 'function' ? window.formatShortAddress(name) : name.split(',')[0];
        L.popup()
            .setLatLng([lat, lng])
            .setContent(`
                <div class="font-sans w-[200px]">
                    <h4 class="font-black text-sm custom-text leading-tight mb-1">${shortName}</h4>
                    <p class="text-xs font-black text-rose-500 mb-2">-${formatMoney(amount)}</p>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" class="w-full py-1.5 flex items-center justify-center gap-1 custom-primary text-white font-bold text-xs rounded-xl no-underline shadow-sm">
                        <i class="fa-solid fa-diamond-turn-right text-white"></i> Chỉ đường
                    </a>
                </div>
            `)
            .openOn(locMapInstance);
    }, 1100);

    if (typeof playSound === 'function') playSound("pop");
};

// =====================================
// 5. BOTTOM SHEET CHI TIẾT ĐỊA ĐIỂM
// =====================================
window.openLocBottomSheet = (locationName) => {
    const loc = locRawData.find(l => l.name === locationName);
    if (!loc) return;

    locCurrentLat = loc.lat;
    locCurrentLng = loc.lng;

    const shortName = typeof window.formatShortAddress === 'function' ? window.formatShortAddress(loc.name) : loc.name.split(',')[0];
    const sortedTxs = [...loc.txs].sort((a, b) => b.amount - a.amount);
    const mainCatId = sortedTxs[0] ? sortedTxs[0].category : null;
    const cat = (state.categories || []).find(c => c.id === mainCatId) || { icon: "🍔" };

    const catIconEl = document.getElementById("loc-bs-cat-icon");
    if (catIconEl) catIconEl.innerText = cat.icon;

    const bsTitle = document.getElementById("loc-bs-title");
    if (bsTitle) bsTitle.innerText = shortName;

    const bsCount = document.getElementById("loc-bs-count");
    if (bsCount) bsCount.innerText = `${loc.count} lần ghé`;

    const bsAvg = document.getElementById("loc-bs-avg");
    if (bsAvg) bsAvg.innerText = `TB: ${formatMoney(Math.round(loc.totalAmount / loc.count))}/lần`;

    const bsTotal = document.getElementById("loc-bs-total");
    if (bsTotal) bsTotal.innerText = `Tổng: -${formatMoney(loc.totalAmount)}`;

    const listTxs = [...loc.txs].sort((a, b) => new Date(b.date) - new Date(a.date));
    const txListEl = document.getElementById("loc-bs-tx-list");
    if (txListEl) {
        txListEl.innerHTML = listTxs.map(tx => {
            const txCat = (state.categories || []).find(c => c.id === tx.category) || { name: "Khác", icon: "📦" };
            const dateStr = new Date(tx.date).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
            let tTime = tx.date.includes("T") ? tx.date.split("T")[1].substring(0, 5) : (tx.date.split(" ")[1] ? tx.date.split(" ")[1].substring(0, 5) : '--:--');

            return `
            <div class="flex items-center justify-between p-3 custom-bg-card border custom-border rounded-2xl shadow-sm cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-[0.99]" onclick="openModal('transaction', '${tx.id}')">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="w-10 h-10 rounded-xl custom-bg-input flex items-center justify-center text-lg custom-border shrink-0">${txCat.icon}</div>
                    <div class="min-w-0">
                        <p class="font-black text-xs sm:text-sm custom-text truncate leading-tight">${tx.note || txCat.name}</p>
                        <p class="text-[10px] font-bold custom-text-secondary mt-0.5"><i class="fa-regular fa-clock text-[9px]"></i> Ngày ${dateStr} - ${tTime}</p>
                    </div>
                </div>
                <p class="font-black text-xs sm:text-sm text-rose-500 shrink-0 ml-2">-${formatMoney(tx.amount)}</p>
            </div>`;
        }).join("");
    }

    const backdrop = document.getElementById("loc-bottom-sheet-backdrop");
    const sheet = document.getElementById("loc-bottom-sheet");
    if (backdrop && sheet) {
        backdrop.classList.remove("hidden");
        setTimeout(() => {
            backdrop.classList.remove("opacity-0");
            sheet.classList.remove("translate-y-full");
        }, 10);
    }
    if (typeof playSound === 'function') playSound("pop");
};

window.closeLocBottomSheet = () => {
    const backdrop = document.getElementById("loc-bottom-sheet-backdrop");
    const sheet = document.getElementById("loc-bottom-sheet");
    if (backdrop && sheet) {
        backdrop.classList.add("opacity-0");
        sheet.classList.add("translate-y-full");
        setTimeout(() => backdrop.classList.add("hidden"), 300);
    }
};

// BAY ĐẾN ĐỊA ĐIỂM GOOGLE MAPS HOẶC TRÊN BẢN ĐỒ CHÍNH
window.viewLocOnMap = () => {
    if (!locCurrentLat || !locCurrentLng) return alert("Điểm này không có tọa độ GPS cụ thể!");
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${locCurrentLat},${locCurrentLng}`, '_blank');
    if (typeof playSound === 'function') playSound("pop");
};