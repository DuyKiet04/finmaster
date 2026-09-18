// ==========================================
// FINMASTER GALLERY CENTER (image.js)
// Thu thập, Quản lý & Xem toàn bộ hình ảnh
// ==========================================

(function () {
    // 1. TỰ ĐỘNG BƠM GIAO DIỆN VÀO APP
    function injectGalleryUI() {
        if (document.getElementById("view-gallery")) return;

        const galleryHtml = `
        <div id="view-gallery" class="view-section hidden pt-6 pb-28 relative min-h-screen font-sans  px-4 max-w-5xl mx-auto">
            
            
            <!-- Bộ lọc Tab (Tất cả, Giao dịch, Ký sự...) -->
            <div class="flex overflow-x-auto gap-2 pb-4 mb-2 hidden-scrollbar" id="gallery-filters">
                <!-- JS sẽ bơm nút vào đây -->
            </div>

            <!-- Lưới ảnh -->
            <div id="gallery-grid" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 sm:gap-2">
                <!-- JS sẽ bơm ảnh vào đây -->
            </div>
            
            <!-- Trạng thái trống -->
            <div id="gallery-empty" class="hidden flex-col items-center justify-center py-20 opacity-60">
                <i class="fa-solid fa-folder-open text-6xl text-gray-400 mb-4"></i>
                <p class="text-sm font-bold custom-text-secondary">Chưa có bức ảnh nào ở đây</p>
            </div>
        </div>
        `;
        
        const scrollArea = document.getElementById("main-scroll-area");
        if (scrollArea) scrollArea.insertAdjacentHTML("beforeend", galleryHtml);
    }

    // Tích hợp vào hệ thống chuyển trang (switchView) của App
    const origSwitchView = window.switchView;
    window.switchView = function(viewId) {
        if (viewId === "gallery") { 
            injectGalleryUI(); 
        }
        if (origSwitchView) origSwitchView(viewId);
        if (viewId === "gallery") {
            window.renderGalleryDashboard();
            const fM = document.getElementById("fab-mobile"); 
            const fD = document.getElementById("fab-desktop");
            if(fM) fM.classList.add("hidden"); 
            if(fD) fD.classList.add("hidden");
        }
    };

    // 2. BỘ NÃO QUÉT & GOM ẢNH
    window.currentGalleryFilter = 'all';

    window.renderGalleryDashboard = () => {
        let allImages = [];

        // Quét 1: Giao dịch
        if (state.transactions) {
            state.transactions.forEach(t => {
                if (t.image && t.image.length > 50) {
                    allImages.push({ src: t.image, type: 'tx', id: t.id, date: t.date, note: t.note || 'Giao dịch' });
                }
            });
        }
        // Quét 2: Nhật ký công sở (Từ file work.js)
        if (state.workData && state.workData.logs) {
            state.workData.logs.forEach(l => {
                if (l.journalImage && l.journalImage.length > 50) {
                    allImages.push({ src: l.journalImage, type: 'worklog', id: l.id, date: l.date, note: l.journalNote || 'Nhật ký' });
                }
                if (l.journalImages && l.journalImages.length > 0) {
                    l.journalImages.forEach((img, index) => {
                        allImages.push({ src: img, type: 'worklog_multi', id: l.id, date: l.date, note: l.journalNote || 'Nhật ký', idx: index });
                    });
                }
            });
        }
        // Quét 3: Bản đồ cá nhân
        if (state.mapPoints) {
            state.mapPoints.forEach(p => {
                if (p.image && p.image.length > 50) {
                    allImages.push({ src: p.image, type: 'map', id: p.id, date: p.date, note: p.name });
                }
            });
        }
        // Quét 4: Sổ Quán ruột
        if (state.favorites) {
            state.favorites.forEach(f => {
                if (f.image && f.image.length > 50) {
                    allImages.push({ src: f.image, type: 'fav', id: f.id, date: new Date().toISOString(), note: f.name });
                }
            });
        }
        // Quét 5: Nhật ký Chuyến đi
        if (state.trips) {
            state.trips.forEach(tr => {
                if (tr.checkins) {
                    tr.checkins.forEach(chk => {
                        if (chk.image && chk.image.length > 50) {
                            allImages.push({ src: chk.image, type: 'trip', id: tr.id, chkId: chk.id, date: chk.timestamp, note: chk.locationName });
                        }
                    });
                }
            });
        }

        // Sắp xếp mới nhất lên đầu
        allImages.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Lọc theo Tab
        if (window.currentGalleryFilter !== 'all') {
            allImages = allImages.filter(img => {
                if(window.currentGalleryFilter === 'worklog') return img.type.includes('worklog');
                return img.type === window.currentGalleryFilter;
            });
        }

        // Vẽ Lưới Ảnh
        const grid = document.getElementById("gallery-grid");
        const empty = document.getElementById("gallery-empty");

        if (allImages.length === 0) {
            grid.innerHTML = "";
            empty.classList.remove("hidden");
            empty.classList.add("flex");
        } else {
            empty.classList.add("hidden");
            empty.classList.remove("flex");

            grid.innerHTML = allImages.map((imgObj) => {
                const delParams = `window.deleteGalleryImage('${imgObj.type}', '${imgObj.id}', '${imgObj.chkId || ''}', ${imgObj.idx !== undefined ? imgObj.idx : -1})`;
                return `
                <div class="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border custom-border aspect-square group bg-gray-100 dark:bg-gray-800"
                     onclick="handleGalleryClick(this, '${imgObj.src}')">
                    <img src="${imgObj.src}" class="w-full h-full object-cover transition-transform duration-300 pointer-events-none">
                    
                    <!-- Lớp mờ và Ghi chú (Mặc định ẩn) -->
                    <div class="gallery-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 opacity-0 transition-opacity duration-200 flex flex-col justify-end p-2 pointer-events-none">
                        <p class="text-white text-[9px] sm:text-xs font-bold truncate drop-shadow-md">${imgObj.note || "Không có tên"}</p>
                    </div>

                    <!-- Nút Xóa (Góc trên phải) -->
                    <button onclick="event.stopPropagation(); ${delParams}"
                            class="gallery-del-btn absolute top-2 right-2 w-8 h-8 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 scale-50 transition-all duration-200 active:scale-90 shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>`;
            }).join('');
        }

        // Vẽ Bộ lọc Tabs
        const tabs = [
            { id: 'all', label: 'Tất cả' },
            { id: 'tx', label: 'Giao dịch' },
            { id: 'worklog', label: 'Đi làm' },
            { id: 'trip', label: 'Chuyến đi' },
            { id: 'map', label: 'Bản đồ' },
            { id: 'fav', label: 'Quán ưu thích' }
        ];
        document.getElementById('gallery-filters').innerHTML = tabs.map(t => `
            <button onclick="window.currentGalleryFilter='${t.id}'; window.renderGalleryDashboard();" class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${window.currentGalleryFilter === t.id ? 'custom-primary text-white border-transparent shadow-md' : 'custom-bg-card custom-text-secondary custom-border hover:brightness-95'}">${t.label}</button>
        `).join('');
    };

    // 3. THUẬT TOÁN TƯƠNG TÁC: CHẠM 1 LẦN HIỆN NÚT, CHẠM 2 LẦN ZOOM
    window.activeGalleryCard = null;
    window.handleGalleryClick = (cardEl, src) => {
        if (window.activeGalleryCard === cardEl) {
            // Đã chọn -> Chạm lần 2 -> Xem Full HD
            if (typeof openImageModal === 'function') {
                openImageModal(src);
            } else if (typeof window.workViewImageFullScreen === 'function') {
                window.workViewImageFullScreen(src);
            }
            window.resetGalleryState(); // Xem xong thì reset về bình thường
        } else {
            // Chưa chọn -> Chạm lần 1 -> Mở chế độ chọn (Hiện nút xóa)
            window.resetGalleryState();
            window.activeGalleryCard = cardEl;
            
            cardEl.querySelector('.gallery-overlay').classList.remove('opacity-0');
            cardEl.querySelector('.gallery-overlay').classList.add('opacity-100');
            
            const btn = cardEl.querySelector('.gallery-del-btn');
            btn.classList.remove('opacity-0', 'scale-50');
            btn.classList.add('opacity-100', 'scale-100');
            
            cardEl.querySelector('img').classList.add('scale-110');
            
            if(typeof playSound === 'function') playSound('click');
        }
    };

    window.resetGalleryState = () => {
        if (window.activeGalleryCard) {
            const card = window.activeGalleryCard;
            card.querySelector('.gallery-overlay').classList.add('opacity-0');
            card.querySelector('.gallery-overlay').classList.remove('opacity-100');
            
            const btn = card.querySelector('.gallery-del-btn');
            btn.classList.add('opacity-0', 'scale-50');
            btn.classList.remove('opacity-100', 'scale-100');
            
            card.querySelector('img').classList.remove('scale-110');
            window.activeGalleryCard = null;
        }
    };

    // Bấm ra ngoài khoảng trống thì Hủy chọn ảnh
    document.addEventListener('click', (e) => {
        if (window.activeGalleryCard && !e.target.closest('#gallery-grid .group')) {
            window.resetGalleryState();
        }
    });

    // 4. BỘ NÃO XÓA ẢNH (CHỈ XÓA ẢNH ĐỂ TIẾT KIỆM BỘ NHỚ, GIỮ NGUYÊN GIAO DỊCH)
    window.deleteGalleryImage = (type, id, chkId, idx) => {
        if (!confirm("XÓA VĨNH VIỄN bức ảnh này khỏi hệ thống? (Giải phóng dung lượng)")) return;

        if (type === 'tx') {
            const tx = state.transactions.find(t => t.id === id);
            if(tx) tx.image = null;
        } 
        else if (type === 'worklog') {
            const log = state.workData.logs.find(l => l.id === id);
            if(log) log.journalImage = null; 
        }
        else if (type === 'worklog_multi') {
            const log = state.workData.logs.find(l => l.id === id);
            if(log && log.journalImages) {
                log.journalImages.splice(idx, 1);
            }
        }
        else if (type === 'map') {
            const pt = state.mapPoints.find(p => p.id === id);
            if(pt) pt.image = null;
        }
        else if (type === 'fav') {
            const fav = state.favorites.find(f => f.id === id);
            if(fav) fav.image = null;
        }
        else if (type === 'trip') {
            const trip = state.trips.find(t => t.id === id);
            if(trip && trip.checkins) {
                const chkIndex = trip.checkins.findIndex(c => c.id === chkId);
                if(chkIndex > -1) {
                    trip.checkins[chkIndex].image = null; 
                }
            }
        }

        saveData();
        if(typeof playSound === 'function') playSound('trash');
        window.renderGalleryDashboard(); // Load lại mảng ảnh
        
        // Cập nhật lại thanh dung lượng trong Cài đặt (Nếu có)
        if(typeof updateStorageUI === 'function') updateStorageUI();
    };
})();