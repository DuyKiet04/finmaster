// ==============================================================
// FILE: location-analytics.js - V3: GIAO DIỆN HIỆN ĐẠI & ĐỒNG BỘ THEME
// ==============================================================

// 1. TỰ ĐỘNG BƠM GIAO DIỆN
(function injectLocationAnalyticsUI() {
    if (document.getElementById('loc-analytics-overlay')) return;

    const locHTML = `
    <div id="loc-analytics-overlay" class="fixed inset-0 z-[200] custom-bg-body transition-all duration-500 translate-y-full opacity-0 flex flex-col hidden font-sans">
        
        <!-- HEADER (NỔI TRÊN BẢN ĐỒ) -->
        <div class="absolute top-0 left-0 right-0 z-[9999] px-4 py-4 flex items-center justify-between pointer-events-none">
            <button onclick="closeLocAnalytics()" class="w-11 h-11 pointer-events-auto flex items-center justify-center rounded-full custom-bg-header custom-text custom-shadow-sm custom-border hover:scale-105 active:scale-95 transition-all backdrop-blur-xl">
                <i class="fa-solid fa-arrow-left"></i>
            </button>
            <div class="pointer-events-auto custom-bg-header px-5 py-2.5 rounded-full custom-shadow-sm custom-border flex items-center gap-2 backdrop-blur-xl">
                <div class="w-2 h-2 rounded-full animate-pulse" style="background-color: var(--icon-active)"></div>
                <h3 class="font-extrabold text-sm custom-text tracking-wide">Bản Đồ Chi Tiêu</h3>
            </div>
            <div class="w-11"></div> <!-- Spacer -->
        </div>

        <!-- BẢN ĐỒ HERO (NỬA TRÊN) -->
        <div class="w-full h-[45vh] relative custom-bg-input shrink-0" id="loc-heatmap-container">
            <div id="loc-map-loading" class="absolute inset-0 flex flex-col items-center justify-center custom-bg-body opacity-80 backdrop-blur-md z-0">
                <div class="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mb-3" style="border-color: var(--icon-active); border-top-color: transparent;"></div>
                <span class="text-xs font-bold custom-text-secondary tracking-widest uppercase">Đang quét vị trí...</span>
            </div>
        </div>

        <!-- PANEL DỮ LIỆU (NỬA DƯỚI) -->
        <div class="flex-1 custom-bg-body -mt-6 rounded-t-[2rem] z-20 custom-shadow-lg flex flex-col relative overflow-hidden custom-border border-b-0 border-x-0">
            <!-- Handle bar nhỏ xíu -->
            <div class="w-full flex justify-center pt-3 pb-1 absolute top-0 left-0 right-0 custom-bg-body z-30 opacity-95 backdrop-blur-sm rounded-t-[2rem]">
                <div class="w-12 h-1.5 custom-bg-input rounded-full"></div>
            </div>

            <!-- Tổng quan & Bộ lọc -->
            <div class="px-5 pt-8 pb-4 shrink-0 border-b custom-border custom-bg-body relative z-20">
                
                <div class="flex items-center justify-between mb-5">
                    <div>
                        <p class="text-[11px] font-bold custom-text-secondary uppercase tracking-widest mb-1">Tổng đốt tiền tại</p>
                        <div class="flex items-baseline gap-1">
                            <span id="loc-total-places" class="text-2xl font-black" style="color: var(--icon-active)">0</span>
                            <span class="text-sm font-bold custom-text-secondary">địa điểm</span>
                        </div>
                    </div>
                    
                    <!-- Nút chọn tháng -->
                    <div class="flex items-center custom-bg-input rounded-full p-1 custom-shadow-sm custom-border">
                        <button onclick="changeLocMonth(-1)" class="w-8 h-8 rounded-full hover:custom-bg-card custom-text-secondary hover:custom-text flex items-center justify-center transition-all"><i class="fa-solid fa-chevron-left text-[10px]"></i></button>
                        <span id="loc-month-label" class="px-3 text-xs font-black custom-text uppercase tracking-wider min-w-[70px] text-center">T9</span>
                        <button onclick="changeLocMonth(1)" class="w-8 h-8 rounded-full hover:custom-bg-card custom-text-secondary hover:custom-text flex items-center justify-center transition-all"><i class="fa-solid fa-chevron-right text-[10px]"></i></button>
                    </div>
                </div>

                <!-- Tabs Sắp xếp -->
                <div class="flex custom-bg-input p-1 rounded-xl custom-border">
                    <button id="tab-sort-amount" onclick="setLocSort('amount')" class="flex-1 py-2 text-xs font-bold rounded-lg custom-bg-card custom-text custom-shadow-sm transition-all">Chi nhiều nhất</button>
                    <button id="tab-sort-freq" onclick="setLocSort('freq')" class="flex-1 py-2 text-xs font-bold rounded-lg custom-text-secondary transition-all bg-transparent">Ghé thường xuyên</button>
                </div>
            </div>

            <!-- Danh sách -->
            <div class="flex-1 overflow-y-auto px-5 py-2 pb-24 custom-scrollbar custom-bg-body" id="loc-leaderboard">
                <!-- Data render here -->
            </div>
        </div>
    </div>

    <!-- BOTTOM SHEET CHI TIẾT -->
    <div id="loc-bottom-sheet-backdrop" onclick="closeLocBottomSheet()" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] hidden opacity-0 transition-opacity duration-300"></div>
    <div id="loc-bottom-sheet" class="fixed bottom-0 left-0 right-0 custom-bg-body z-[300] rounded-t-[2.5rem] custom-shadow-lg transform translate-y-full transition-transform duration-400 ease-out flex flex-col max-h-[85vh] custom-border border-b-0 border-x-0">
        <div class="w-full flex justify-center pt-4 pb-2 cursor-pointer" onclick="closeLocBottomSheet()">
            <div class="w-12 h-1.5 custom-bg-input rounded-full"></div>
        </div>
        
        <div class="px-6 pb-5 pt-2 flex gap-4 items-start relative">
            <div class="w-14 h-14 rounded-2xl custom-bg-primary-soft flex items-center justify-center custom-border shrink-0 mt-1" style="color: var(--icon-active)">
                <i class="fa-solid fa-shop text-2xl"></i>
            </div>
            <div class="flex-1 min-w-0 pr-12">
                <h3 id="loc-bs-title" class="font-black text-xl custom-text leading-tight mb-1">Tên Địa Điểm</h3>
                <div class="flex items-center gap-2 text-xs font-bold custom-text-secondary">
                    <span id="loc-bs-count" class="custom-bg-input px-2 py-0.5 rounded-md custom-border">0 lần ghé</span>
                    <span id="loc-bs-avg">Trung bình 0đ</span>
                </div>
            </div>
            <!-- Nút Map bay bay -->
            <button onclick="viewLocOnMap()" class="absolute right-6 top-2 w-10 h-10 rounded-full custom-primary custom-shadow flex items-center justify-center hover:scale-110 active:scale-90 transition-transform">
                <i class="fa-solid fa-location-arrow"></i>
            </button>
        </div>

        <div class="w-full h-px custom-bg-input"></div>

        <div class="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
            <h4 class="font-bold text-[11px] uppercase tracking-widest custom-text-secondary mb-4">Lịch sử giao dịch tại đây</h4>
            <div id="loc-bs-tx-list" class="space-y-3"></div>
        </div>
    </div>
    
    <style>
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }
    </style>`;
    
    document.body.insertAdjacentHTML('beforeend', locHTML);
})();

// 2. LOGIC XỬ LÝ
let locCurrentDate = new Date();
let locMapInstance = null;
let locHeatLayer = null;
let locRawData = [];
let locCurrentLat = null;
let locCurrentLng = null;
let locCurrentSort = 'amount'; // 'amount' hoặc 'freq'

window.openLocAnalytics = async () => {
    document.getElementById("loc-map-loading").classList.remove("hidden");
    
    if (typeof L === 'undefined' && typeof window.loadScript === 'function') {
        await window.loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css", true);
        await window.loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js");
        await window.loadScript("https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js");
    }

    const overlay = document.getElementById("loc-analytics-overlay");
    overlay.classList.remove("hidden");
    
    requestAnimationFrame(() => {
        overlay.classList.remove("translate-y-full", "opacity-0");
    });
    
    renderLocAnalyticsData();
    initLocMap();
    if (typeof playSound === 'function') playSound("pop");
};

window.closeLocAnalytics = () => {
    const overlay = document.getElementById("loc-analytics-overlay");
    overlay.classList.add("translate-y-full", "opacity-0");
    setTimeout(() => overlay.classList.add("hidden"), 500);
};

window.changeLocMonth = (dir) => {
    locCurrentDate.setMonth(locCurrentDate.getMonth() + dir);
    renderLocAnalyticsData();
};

window.setLocSort = (type) => {
    locCurrentSort = type;
    
    const tabAmount = document.getElementById("tab-sort-amount");
    const tabFreq = document.getElementById("tab-sort-freq");
    
    const activeClasses = ["custom-bg-card", "custom-text", "custom-shadow-sm"];
    const inactiveClasses = ["custom-text-secondary", "bg-transparent"];

    if (type === 'amount') {
        tabAmount.classList.add(...activeClasses);
        tabAmount.classList.remove(...inactiveClasses);
        tabFreq.classList.add(...inactiveClasses);
        tabFreq.classList.remove(...activeClasses);
    } else {
        tabFreq.classList.add(...activeClasses);
        tabFreq.classList.remove(...inactiveClasses);
        tabAmount.classList.add(...inactiveClasses);
        tabAmount.classList.remove(...activeClasses);
    }
    
    renderLocAnalyticsData();
};

window.renderLocAnalyticsData = () => {
    const y = locCurrentDate.getFullYear();
    const m = locCurrentDate.getMonth();
    
    document.getElementById("loc-month-label").innerText = `Tháng ${m + 1}`;

    const txs = state.transactions.filter(t => {
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
        grouped[t.locationName].totalAmount += t.amount;
        grouped[t.locationName].count += 1;
        grouped[t.locationName].txs.push(t);
    });

    locRawData = Object.values(grouped);
    
    const maxAmount = Math.max(...locRawData.map(l => l.totalAmount), 1);
    const maxFreq = Math.max(...locRawData.map(l => l.count), 1);

    if (locCurrentSort === 'amount') {
        locRawData.sort((a, b) => b.totalAmount - a.totalAmount);
    } else {
        locRawData.sort((a, b) => b.count - a.count);
    }

    document.getElementById("loc-total-places").innerText = locRawData.length;

    const boardEl = document.getElementById("loc-leaderboard");
    if (locRawData.length === 0) {
        boardEl.innerHTML = `
            <div class="flex flex-col items-center justify-center h-40 opacity-50 mt-10">
                <i class="fa-solid fa-satellite-dish text-4xl custom-text-secondary mb-3"></i>
                <p class="text-sm font-bold custom-text-secondary">Chưa có tín hiệu quét thẻ tháng này!</p>
            </div>`;
        updateHeatmap();
        return;
    }

    boardEl.innerHTML = locRawData.map((loc, idx) => {
        const mainCatId = loc.txs.sort((a, b) => b.amount - a.amount)[0].category;
        const cat = state.categories.find(c => c.id === mainCatId) || { name: "Khác", icon: "📍" };
        const shortName = typeof window.formatShortAddress === 'function' ? window.formatShortAddress(loc.name) : loc.name.split(',')[0];
        
        const percent = locCurrentSort === 'amount' 
            ? (loc.totalAmount / maxAmount) * 100 
            : (loc.count / maxFreq) * 100;

        const isTop3 = idx < 3;
        const textClass = isTop3 ? "custom-text" : "custom-text-secondary";
        
        // Cấu hình thanh progress theo theme
        const barContent = isTop3 
            ? `<div class="h-full custom-gradient rounded-full" style="width: ${percent}%"></div>`
            : `<div class="h-full rounded-full" style="width: ${percent}%; background-color: var(--text-placeholder)"></div>`;

        return `
        <div onclick="openLocBottomSheet('${loc.name.replace(/'/g, "\\'")}')" class="group relative mb-4 p-4 custom-bg-card rounded-2xl custom-border hover:custom-shadow transition-all cursor-pointer overflow-hidden">
            <!-- Nền mờ -->
            <div class="absolute top-0 left-0 bottom-0 custom-bg-primary-soft opacity-50 transition-all duration-700" style="width: ${percent}%"></div>
            
            <div class="relative z-10 flex items-center gap-4">
                <div class="w-12 h-12 rounded-full custom-bg-input flex items-center justify-center text-xl shrink-0 custom-shadow-sm custom-border">
                    ${cat.icon}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-baseline mb-1">
                        <p class="font-extrabold text-[15px] ${textClass} truncate pr-2">${shortName}</p>
                        <p class="font-black text-[15px] shrink-0" style="color: var(--icon-active)">-${formatMoney(loc.totalAmount)}</p>
                    </div>
                    <div class="flex items-center justify-between">
                        <p class="text-[11px] font-bold custom-text-secondary truncate">${cat.name}</p>
                        <div class="flex items-center gap-1.5 custom-bg-input px-2 py-0.5 rounded text-[10px] font-bold custom-text-secondary custom-border">
                            <i class="fa-solid fa-shoe-prints opacity-60"></i> ${loc.count} lần
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Thanh chỉ báo -->
            <div class="w-full h-1 custom-bg-input rounded-full mt-3 overflow-hidden">
                ${barContent}
            </div>
        </div>`;
    }).join("");

    updateHeatmap();
};

function updateHeatmap() {
    if (!locMapInstance || typeof L === 'undefined' || typeof L.heatLayer === 'undefined') return;
    
    if (locHeatLayer) locMapInstance.removeLayer(locHeatLayer);
    
    const heatData = locRawData
        .filter(loc => loc.lat && loc.lng)
        .map(loc => [loc.lat, loc.lng, loc.totalAmount]);

    if (heatData.length > 0) {
        locHeatLayer = L.heatLayer(heatData, {
            radius: 28,
            blur: 18,
            maxZoom: 15,
            gradient: { 0.3: '#3b82f6', 0.5: '#10b981', 0.7: '#eab308', 1.0: '#f43f5e' } // Màu heatmap chuẩn để dễ nhìn dữ liệu bản đồ
        }).addTo(locMapInstance);
        
        const bounds = L.latLngBounds(heatData.map(h => [h[0], h[1]]));
        locMapInstance.fitBounds(bounds, { paddingBottomRight: [0, window.innerHeight * 0.4], paddingTopLeft: [20, 20] });
    }
}

// 3. DRILL-DOWN (BOTTOM SHEET TỐI ƯU HƠN)
window.openLocBottomSheet = (locationName) => {
    const loc = locRawData.find(l => l.name === locationName);
    if (!loc) return;

    locCurrentLat = loc.lat;
    locCurrentLng = loc.lng;

    const shortName = typeof window.formatShortAddress === 'function' ? window.formatShortAddress(loc.name) : loc.name.split(',')[0];
    document.getElementById("loc-bs-title").innerText = shortName;
    document.getElementById("loc-bs-count").innerText = `${loc.count} lần ghé`;
    document.getElementById("loc-bs-avg").innerText = `TB: ${formatMoney(Math.round(loc.totalAmount / loc.count))}/lần`;

    const listTxs = [...loc.txs].sort((a, b) => new Date(b.date) - new Date(a.date));
    document.getElementById("loc-bs-tx-list").innerHTML = listTxs.map(tx => {
        const cat = state.categories.find(c => c.id === tx.category) || { name: "Khác", icon: "📦" };
        const dateStr = new Date(tx.date).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
        
        return `
        <div class="flex items-center justify-between py-3 border-b custom-border last:border-0 cursor-pointer hover:custom-bg-input rounded-xl px-2 -mx-2 transition-colors" onclick="openModal('transaction', '${tx.id}')">
            <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-full custom-bg-input flex items-center justify-center text-lg custom-border">${cat.icon}</div>
                <div class="min-w-0">
                    <p class="font-extrabold text-sm custom-text truncate">${tx.note || cat.name}</p>
                    <p class="text-[11px] font-bold custom-text-secondary mt-0.5"><i class="fa-regular fa-calendar mr-1"></i>${dateStr}</p>
                </div>
            </div>
            <p class="font-black text-sm shrink-0 ml-2" style="color: var(--icon-active)">-${formatMoney(tx.amount)}</p>
        </div>`;
    }).join("");

    const backdrop = document.getElementById("loc-bottom-sheet-backdrop");
    const sheet = document.getElementById("loc-bottom-sheet");
    backdrop.classList.remove("hidden");
    setTimeout(() => {
        backdrop.classList.remove("opacity-0");
        sheet.classList.remove("translate-y-full");
    }, 10);
};

window.closeLocBottomSheet = () => {
    const backdrop = document.getElementById("loc-bottom-sheet-backdrop");
    const sheet = document.getElementById("loc-bottom-sheet");
    backdrop.classList.add("opacity-0");
    sheet.classList.add("translate-y-full");
    setTimeout(() => backdrop.classList.add("hidden"), 300);
};

// CẬP NHẬT MAP
window.initLocMap = () => {
    setTimeout(() => {
        if (!locMapInstance && typeof L !== 'undefined') {
            locMapInstance = L.map('loc-heatmap-container', { 
                zoomControl: false,
                attributionControl: false // Bỏ logo leafet cho sạch
            }).setView([10.8231, 106.6297], 12);
            
            L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
                subdomains: ['0', '1', '2', '3'],
                maxZoom: 20
            }).addTo(locMapInstance);

            // Kiểm tra Dark Mode từ App State để phủ màu bản đồ tối lại (nếu có)
            if (window.state && state.darkMode) {
                setTimeout(() => {
                    const mapLayer = document.querySelector('#loc-heatmap-container .leaflet-layer');
                    if(mapLayer) mapLayer.style.filter = "invert(90%) hue-rotate(180deg) brightness(85%) contrast(85%) grayscale(20%)";
                }, 100);
            }

        } else if (locMapInstance) {
            locMapInstance.invalidateSize();
        }
        
        document.getElementById("loc-map-loading").classList.add("hidden");
        updateHeatmap();
    }, 400); // Đợi Animation trượt xong mới init map để tránh lỗi Size
};

// BAY ĐẾN ĐỊA ĐIỂM
window.viewLocOnMap = () => {
    if (!locCurrentLat || !locCurrentLng) return alert("Điểm này không có tọa độ GPS cụ thể!");
    closeLocBottomSheet();
    closeLocAnalytics();
    if (typeof switchView === 'function') switchView('map');
    
    setTimeout(() => {
        if (window.myMap || typeof myMap !== 'undefined') {
            const mapObj = window.myMap || myMap;
            if (typeof mapObj.flyTo === 'function') {
                mapObj.invalidateSize();
                mapObj.flyTo([locCurrentLat, locCurrentLng], 18, { duration: 1.5 });
            } else if (typeof mapObj.panTo === 'function') {
                mapObj.panTo({lat: locCurrentLat, lng: locCurrentLng});
                mapObj.setZoom(18);
            }
        }
    }, 600);
};