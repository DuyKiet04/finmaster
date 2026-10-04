// ==============================================================
// FILE: location-analytics.js - CHUYÊN VIÊN PHÂN TÍCH KHÔNG GIAN
// ==============================================================

// 1. TỰ ĐỘNG BƠM GIAO DIỆN (ĐỘC LẬP HOÀN TOÀN)
(function injectLocationAnalyticsUI() {
    if (document.getElementById('loc-analytics-overlay')) return;

    const locHTML = `
    <div id="loc-analytics-overlay" class="fixed inset-0 z-[200] custom-bg-body transition-transform duration-300 translate-x-full flex flex-col hidden">
        <div class="custom-bg-header dark:bg-gray-800/90 backdrop-blur-xl px-4 py-3 flex items-center justify-between shadow-sm shrink-0 z-30 border-b custom-border">
            <button onclick="closeLocAnalytics()" class="w-10 h-10 flex items-center justify-center rounded-full custom-bg-card dark:bg-gray-700 custom-text-secondary hover:brightness-95 active:scale-90 transition-transform custom-shadow-sm border custom-border">
                <i class="fa-solid fa-arrow-left"></i>
            </button>
            <h3 class="font-black text-lg custom-text truncate flex-1 text-center mr-10">Phân tích Địa điểm</h3>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar relative pb-20" id="loc-scroll-area">
            <!-- Bộ lọc -->
            <div class="sticky top-0 z-20 custom-bg-body/95 backdrop-blur-md px-4 py-3 border-b custom-border shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-3">
                <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg border custom-border p-1">
                        <button onclick="changeLocMonth(-1)" class="w-8 h-8 rounded-md hover:bg-white dark:hover:bg-gray-700 custom-text flex items-center justify-center transition-colors"><i class="fa-solid fa-chevron-left text-xs"></i></button>
                        <span id="loc-month-label" class="px-3 text-xs font-black custom-text uppercase tracking-widest min-w-[90px] text-center">T9/2026</span>
                        <button onclick="changeLocMonth(1)" class="w-8 h-8 rounded-md hover:bg-white dark:hover:bg-gray-700 custom-text flex items-center justify-center transition-colors"><i class="fa-solid fa-chevron-right text-xs"></i></button>
                    </div>
                    <select id="loc-sort-select" onchange="renderLocAnalyticsData()" class="flex-1 bg-gray-100 dark:bg-gray-800 border custom-border rounded-lg outline-none text-xs font-bold custom-text px-2 py-2.5 appearance-none text-right">
                        <option value="amount">Sắp xếp: Tiêu nhiều nhất</option>
                        <option value="freq">Sắp xếp: Ghé nhiều nhất</option>
                    </select>
                </div>
            </div>

            <!-- Vùng Bản đồ Nhiệt (Heatmap) -->
            <div class="w-full h-[30vh] min-h-[250px] relative bg-gray-200 dark:bg-gray-800 z-10" id="loc-heatmap-container">
                <!-- Map sẽ render ở đây -->
                <div id="loc-map-loading" class="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm z-20">
                    <i class="fa-solid fa-spinner fa-spin text-3xl text-primary-500"></i>
                </div>
            </div>

            <!-- Bảng xếp hạng -->
            <div class="p-4 relative z-20 -mt-6">
                <div class="custom-bg-card p-6 rounded-[2rem] border custom-border custom-shadow-sm">
                    <div class="flex items-center justify-between mb-5">
                        <h4 class="font-black text-sm uppercase tracking-widest custom-text-secondary flex items-center gap-2"><i class="fa-solid fa-map-location-dot text-rose-500"></i> "Hố đen" hút máu</h4>
                        <span id="loc-total-places" class="text-xs font-bold bg-rose-50 text-rose-600 dark:bg-rose-900/30 px-2 py-1 rounded-lg">0 địa điểm</span>
                    </div>
                    <div id="loc-leaderboard" class="space-y-4"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- BOTTOM SHEET CHI TIẾT ĐỊA ĐIỂM -->
    <div id="loc-bottom-sheet-backdrop" onclick="closeLocBottomSheet()" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] hidden opacity-0 transition-opacity duration-300"></div>
    <div id="loc-bottom-sheet" class="fixed bottom-0 left-0 right-0 custom-bg-body z-[300] rounded-t-[2rem] border-t custom-border shadow-[0_-10px_40px_rgba(0,0,0,0.2)] transform translate-y-full transition-transform duration-300 flex flex-col max-h-[85vh]">
        <div class="w-full flex justify-center py-3 cursor-pointer" onclick="closeLocBottomSheet()">
            <div class="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
        <div class="px-6 pb-4 border-b custom-border flex items-center justify-between shrink-0">
            <div>
                <h3 id="loc-bs-title" class="font-black text-xl custom-text line-clamp-1">Tên Địa Điểm</h3>
                <p id="loc-bs-stats" class="text-xs font-bold text-gray-500 mt-1">Đã ghé X lần • Tổng Y đ</p>
            </div>
            <button onclick="viewLocOnMap()" class="w-10 h-10 rounded-full bg-blue-50 text-blue-500 dark:bg-blue-900/30 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800"><i class="fa-solid fa-location-crosshairs"></i></button>
        </div>
        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50 dark:bg-gray-900/50">
            <h4 class="font-black text-xs uppercase tracking-widest custom-text-secondary mb-3 pl-1">Lịch sử quẹt thẻ tại đây</h4>
            <div id="loc-bs-tx-list" class="space-y-0"></div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', locHTML);
})();

// 2. LOGIC XỬ LÝ (BỘ NÃO)
let locCurrentDate = new Date();
let locMapInstance = null;
let locHeatLayer = null;
let locRawData = [];
let locCurrentLat = null;
let locCurrentLng = null;

window.openLocAnalytics = async () => {
    // Tải Leaflet Map & Heatmap plugin nếu chưa có
    document.getElementById("loc-map-loading").classList.remove("hidden");
    
    if (typeof L === 'undefined' && typeof window.loadScript === 'function') {
        await window.loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css", true);
        await window.loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js");
        // Dùng CDNJS cho Leaflet Heat (Không bị chặn CORS)
        await window.loadScript("https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js");
    }

    const overlay = document.getElementById("loc-analytics-overlay");
    overlay.classList.remove("hidden");
    setTimeout(() => overlay.classList.remove("translate-x-full"), 10);
    
    renderLocAnalyticsData();
    initLocMap();
    if (typeof playSound === 'function') playSound("pop");
};

window.closeLocAnalytics = () => {
    const overlay = document.getElementById("loc-analytics-overlay");
    overlay.classList.add("translate-x-full");
    setTimeout(() => overlay.classList.add("hidden"), 300);
};

window.changeLocMonth = (dir) => {
    locCurrentDate.setMonth(locCurrentDate.getMonth() + dir);
    renderLocAnalyticsData();
};



window.renderLocAnalyticsData = () => {
    const y = locCurrentDate.getFullYear();
    const m = locCurrentDate.getMonth();
    const sortBy = document.getElementById("loc-sort-select").value;
    
    document.getElementById("loc-month-label").innerText = `T${m + 1}/${y}`;

    // Lọc giao dịch CHI TIÊU CÓ ĐỊA ĐIỂM
    const txs = state.transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === m && d.getFullYear() === y && t.type === 'expense' && t.locationName;
    });

    // Gom cụm theo Tên Địa Điểm
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

    // Chuyển thành Mảng và Sắp xếp
    locRawData = Object.values(grouped);
    
    if (sortBy === 'amount') {
        locRawData.sort((a, b) => b.totalAmount - a.totalAmount);
    } else {
        locRawData.sort((a, b) => b.count - a.count); // Tần suất ghé
    }

    document.getElementById("loc-total-places").innerText = `${locRawData.length} địa điểm`;

    // Render Bảng xếp hạng (Y như hình ông thiết kế: Tròn icon, Tên, Category nhỏ ở dưới, Số tiền, Icon map bên phải)
    const boardEl = document.getElementById("loc-leaderboard");
    if (locRawData.length === 0) {
        boardEl.innerHTML = `<div class="text-center py-8 opacity-60"><i class="fa-solid fa-map-location-dot text-4xl text-gray-400 mb-2"></i><p class="text-sm font-bold custom-text-secondary">Tháng này chưa gắn định vị ở đâu cả!</p></div>`;
        updateHeatmap();
        return;
    }

    boardEl.innerHTML = locRawData.map((loc, idx) => {
        // Lấy danh mục chiếm tỷ trọng nhiều nhất ở địa điểm này
        const mainCatId = loc.txs.sort((a, b) => b.amount - a.amount)[0].category;
        const cat = state.categories.find(c => c.id === mainCatId) || { name: "Khác", icon: "📍" };
        
        // Trích xuất tên đường ngắn gọn (Ví dụ: "Đường số 18")
        const shortName = typeof window.formatShortAddress === 'function' ? window.formatShortAddress(loc.name) : loc.name.split(',')[0];

        return `
        <div onclick="openLocBottomSheet('${loc.name.replace(/'/g, "\\'")}')" class="flex items-center justify-between p-3 custom-bg-input rounded-2xl border custom-border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group">
            <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-black text-sm shrink-0 border border-white/20 shadow-inner">
                    ${cat.icon}
                </div>
                <div class="flex-1 min-w-0">
                    <p class="font-black text-sm text-blue-600 dark:text-blue-400 truncate leading-tight">${shortName}</p>
                    <p class="text-[10px] font-bold text-gray-500 mt-0.5 truncate">${cat.name} • ${loc.count} lần</p>
                </div>
            </div>
            <div class="flex items-center gap-3 shrink-0 ml-2">
                <span class="font-black text-[15px] text-danger-500">-${formatMoney(loc.totalAmount)}</span>
                <i class="fa-solid fa-location-dot text-amber-500 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all"></i>
            </div>
        </div>`;
    }).join("");

    updateHeatmap();
};

function updateHeatmap() {
    if (!locMapInstance || typeof L === 'undefined' || typeof L.heatLayer === 'undefined') return;
    
    if (locHeatLayer) locMapInstance.removeLayer(locHeatLayer);
    
    // Gom mảng data: [lat, lng, intensity]
    const heatData = locRawData
        .filter(loc => loc.lat && loc.lng) // Bắt buộc phải có tọa độ
        .map(loc => [loc.lat, loc.lng, loc.totalAmount]); // Càng nhiều tiền càng đỏ rực

    if (heatData.length > 0) {
        locHeatLayer = L.heatLayer(heatData, {
            radius: 25,
            blur: 15,
            maxZoom: 14,
            gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' }
        }).addTo(locMapInstance);
        
        // Tự động zoom vừa vặn các điểm
        const bounds = L.latLngBounds(heatData.map(h => [h[0], h[1]]));
        locMapInstance.fitBounds(bounds, { padding: [20, 20] });
    }
}

// 3. DRILL-DOWN (BOTTOM SHEET CHO TỪNG ĐỊA ĐIỂM)
window.openLocBottomSheet = (locationName) => {
    const loc = locRawData.find(l => l.name === locationName);
    if (!loc) return;

    locCurrentLat = loc.lat;
    locCurrentLng = loc.lng;

    const shortName = typeof window.formatShortAddress === 'function' ? window.formatShortAddress(loc.name) : loc.name.split(',')[0];
    document.getElementById("loc-bs-title").innerText = shortName;
    document.getElementById("loc-bs-stats").innerText = `Đã ghé ${loc.count} lần • Trung bình ${formatMoney(Math.round(loc.totalAmount / loc.count))}/lần`;

    const listTxs = [...loc.txs].sort((a, b) => new Date(b.date) - new Date(a.date));
    document.getElementById("loc-bs-tx-list").innerHTML = listTxs.map(tx => {
        const cat = state.categories.find(c => c.id === tx.category) || { name: "Khác", icon: "📦" };
        const dateStr = new Date(tx.date).toLocaleDateString("vi-VN");
        
        return `
        <div class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 mb-2 border custom-border rounded-xl shadow-sm cursor-pointer" onclick="openModal('transaction', '${tx.id}')">
            <div class="flex items-center gap-3 min-w-0">
                <span class="text-xl">${cat.icon}</span>
                <div class="min-w-0">
                    <p class="font-bold text-sm custom-text truncate">${tx.note || cat.name}</p>
                    <p class="text-[10px] font-bold text-gray-400 mt-0.5">${dateStr}</p>
                </div>
            </div>
            <p class="font-black text-sm text-danger-500 shrink-0 ml-2">-${formatMoney(tx.amount)}</p>
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

// =========================================================
// KHỞI TẠO BẢN ĐỒ ĐỒNG BỘ 100% VỚI GOOGLE MAPS
// =========================================================
window.initLocMap = () => {
    setTimeout(() => {
        if (!locMapInstance && typeof L !== 'undefined') {
            locMapInstance = L.map('loc-heatmap-container', { zoomControl: false }).setView([10.8231, 106.6297], 12);
            
            // 🔥 THAY BẰNG LÕI TILE CỦA GOOGLE MAPS (Chuẩn màu, chuẩn đường phố)
            L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
                subdomains: ['0', '1', '2', '3'],
                maxZoom: 20,
                attribution: '&copy; Google Maps'
            }).addTo(locMapInstance);

            // Thủ thuật đồng bộ Dark Mode: Chuyển màu Google Maps thành xám đen nếu app đang bật Dark Mode
            if (state.darkMode) {
                setTimeout(() => {
                    const mapLayer = document.querySelector('#loc-heatmap-container .leaflet-layer');
                    if(mapLayer) mapLayer.style.filter = "invert(90%) hue-rotate(180deg) brightness(85%) contrast(85%)";
                }, 100);
            }

        } else if (locMapInstance) {
            locMapInstance.invalidateSize();
        }
        
        document.getElementById("loc-map-loading").classList.add("hidden");
        updateHeatmap();
    }, 400);
};

// =========================================================
// BAY ĐẾN ĐỊA ĐIỂM (TƯƠNG THÍCH MỌI LOẠI MAP CỦA ĐẠI KA)
// =========================================================
window.viewLocOnMap = () => {
    if (!locCurrentLat || !locCurrentLng) return alert("Điểm này không có tọa độ GPS cụ thể!");
    closeLocBottomSheet();
    closeLocAnalytics();
    if (typeof switchView === 'function') switchView('map');
    
    setTimeout(() => {
        if (window.myMap || typeof myMap !== 'undefined') {
            const mapObj = window.myMap || myMap;
            
            // Tự động nhận diện ông đang xài Leaflet hay Google Maps Native để gọi hàm cho đúng
            if (typeof mapObj.flyTo === 'function') {
                // Nếu là Leaflet bọc GG Map
                mapObj.invalidateSize();
                mapObj.flyTo([locCurrentLat, locCurrentLng], 18, { duration: 1.5 });
            } else if (typeof mapObj.panTo === 'function') {
                // Nếu ông xài Google Maps API gốc
                mapObj.panTo({lat: locCurrentLat, lng: locCurrentLng});
                mapObj.setZoom(18);
            }
        }
    }, 500);
};