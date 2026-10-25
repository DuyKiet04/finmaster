// ============================================================
// FINMASTER CUSTOM MAPS & FIELD EXPLORATION — LIQUID GLASS EDITION
// Spatial Depth, Bento KPIs, Master Map Explorer, Instant Templates
// ============================================================

(function () {
    const uid = () => typeof generateId === 'function' ? generateId() : Math.random().toString(36).substring(2, 9);
    const normalizeStr = str => str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

    window.cmCurrentSubView = 'cards';
    window.cmSearchQuery = '';
    window.cmActiveCategory = 'all';
    window.cmMasterMapObj = null;
    window.cmMasterLayerGroup = null;
    window.cmCurrentTileType = 'auto'; // 'auto', 'sat', 'street'

    // ============================================================
    // 1. SUBVIEW SWITCHER (Cards vs Master Map)
    // ============================================================
    window.cmSwitchSubView = function (mode) {
        window.cmCurrentSubView = mode;
        const btnCards = document.getElementById("btn-cm-view-cards");
        const btnMaster = document.getElementById("btn-cm-view-master");
        const viewCards = document.getElementById("cm-subview-cards");
        const viewMaster = document.getElementById("cm-subview-master");
        const kpiRibbon = document.getElementById("cm-kpi-ribbon");
        const searchWrap = document.getElementById("cm-search-bar-wrap");

        if (mode === 'master') {
            if (btnCards) { btnCards.classList.remove("active"); btnCards.classList.add("custom-text-secondary"); }
            if (btnMaster) { btnMaster.classList.add("active"); btnMaster.classList.remove("custom-text-secondary"); }
            if (viewCards) { viewCards.classList.add("hidden"); viewCards.classList.remove("block"); }
            if (viewMaster) { viewMaster.classList.remove("hidden"); viewMaster.classList.add("block"); }
            if (kpiRibbon) kpiRibbon.classList.add("hidden");
            if (searchWrap) searchWrap.classList.add("hidden");

            setTimeout(() => {
                window.cmInitMasterMap();
            }, 100);
        } else {
            if (btnMaster) { btnMaster.classList.remove("active"); btnMaster.classList.add("custom-text-secondary"); }
            if (btnCards) { btnCards.classList.add("active"); btnCards.classList.remove("custom-text-secondary"); }
            if (viewMaster) { viewMaster.classList.add("hidden"); viewMaster.classList.remove("block"); }
            if (viewCards) { viewCards.classList.remove("hidden"); viewCards.classList.add("block"); }
            if (kpiRibbon) kpiRibbon.classList.remove("hidden");
            if (searchWrap) searchWrap.classList.remove("hidden");

            window.renderCustomMapsList();
        }

        if (typeof playSound === "function") playSound("pop");
    };

    // ============================================================
    // 2. SEARCH & FILTER HANDLERS
    // ============================================================
    window.cmHandleSearch = function (val) {
        window.cmSearchQuery = val ? val.trim().toLowerCase() : "";
        const clearBtn = document.getElementById("cm-search-clear");
        if (clearBtn) {
            if (window.cmSearchQuery) clearBtn.classList.remove("hidden");
            else clearBtn.classList.add("hidden");
        }
        window.renderCustomMapsList();
    };

    window.cmClearSearch = function () {
        const inp = document.getElementById("cm-search-input");
        if (inp) inp.value = "";
        window.cmSearchQuery = "";
        const clearBtn = document.getElementById("cm-search-clear");
        if (clearBtn) clearBtn.classList.add("hidden");
        window.renderCustomMapsList();
    };

    window.cmFilterCategory = function (cat) {
        window.cmActiveCategory = cat;
        document.querySelectorAll(".cm-filter-pill").forEach(el => {
            if (el.id.startsWith("cm-cat-")) {
                el.classList.remove("active");
                el.classList.add("custom-text-secondary");
            }
        });
        const activeBtn = document.getElementById("cm-cat-" + cat);
        if (activeBtn) {
            activeBtn.classList.add("active");
            activeBtn.classList.remove("custom-text-secondary");
        }
        window.renderCustomMapsList();
        if (typeof playSound === "function") playSound("pop");
    };

    // Auto detect category and icon for maps
    function getMapMetadata(m) {
        const n = normalizeStr(m.name);
        if (m.icon && m.color) return { icon: m.icon, color: m.color, emoji: m.emoji || '📍' };

        if (n.includes('vinfast') || n.includes('sac') || n.includes('dien') || n.includes('ev')) {
            return { icon: 'fa-bolt', color: 'from-cyan-500 to-blue-600', emoji: '⚡' };
        }
        if (n.includes('cafe') || n.includes('ca phe') || n.includes('tra')) {
            return { icon: 'fa-mug-hot', color: 'from-amber-500 to-orange-600', emoji: '☕' };
        }
        if (n.includes('xe') || n.includes('do') || n.includes('gui') || n.includes('gara')) {
            return { icon: 'fa-square-parking', color: 'from-blue-500 to-indigo-600', emoji: '🚗' };
        }
        if (n.includes('an') || n.includes('quan') || n.includes('com') || n.includes('pho')) {
            return { icon: 'fa-utensils', color: 'from-rose-500 to-pink-600', emoji: '🍜' };
        }
        if (n.includes('du lich') || n.includes('phuot') || n.includes('tour') || n.includes('choi')) {
            return { icon: 'fa-umbrella-beach', color: 'from-emerald-500 to-teal-600', emoji: '🏖️' };
        }
        return { icon: 'fa-map-pin', color: 'from-purple-500 to-indigo-600', emoji: '📍' };
    }

    // ============================================================
    // 3. RENDER MASTER ENGINE: BENTO RIBBON & CARDS LIST
    // ============================================================
    window.renderCustomMapsList = function () {
        const container = document.getElementById("cm-list-container");
        if (!container) return;

        if (!state.customMaps) state.customMaps = [];
        if (!state.mapPoints) state.mapPoints = [];

        // 3.1 Cập nhật Bento KPI Ribbon
        const totalMaps = state.customMaps.length;
        const totalPts = state.mapPoints.length;
        const totalPhotos = state.mapPoints.filter(p => p.image && p.image.length > 30).length;

        const statMaps = document.getElementById("cm-stat-maps");
        if (statMaps) statMaps.innerText = `${totalMaps} bản đồ`;

        const statPts = document.getElementById("cm-stat-points");
        if (statPts) statPts.innerText = `${totalPts} vị trí`;

        const statPhotos = document.getElementById("cm-stat-photos");
        if (statPhotos) statPhotos.innerText = `${totalPhotos} ảnh`;

        const statRecent = document.getElementById("cm-stat-recent");
        if (statRecent) {
            if (state.mapPoints.length > 0) {
                const latestPt = [...state.mapPoints].sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0))[0];
                const mapOwner = state.customMaps.find(m => m.id === latestPt.mapId);
                statRecent.innerText = mapOwner ? mapOwner.name : latestPt.name;
            } else if (state.customMaps.length > 0) {
                statRecent.innerText = state.customMaps[0].name;
            } else {
                statRecent.innerText = "Chưa có";
            }
        }

        // 3.2 Lọc theo Search & Category
        let filteredMaps = [...state.customMaps];

        if (window.cmSearchQuery) {
            const q = window.cmSearchQuery;
            filteredMaps = filteredMaps.filter(m => {
                const matchName = m.name && m.name.toLowerCase().includes(q);
                const hasMatchingPoint = state.mapPoints.some(p => p.mapId === m.id && ((p.name && p.name.toLowerCase().includes(q)) || (p.address && p.address.toLowerCase().includes(q)) || (p.note && p.note.toLowerCase().includes(q))));
                return matchName || hasMatchingPoint;
            });
        }

        if (window.cmActiveCategory !== 'all') {
            const cat = window.cmActiveCategory;
            filteredMaps = filteredMaps.filter(m => {
                const n = normalizeStr(m.name);
                if (cat === 'ev') return n.includes('vinfast') || n.includes('sac') || n.includes('dien') || n.includes('ev');
                if (cat === 'food') return n.includes('an') || n.includes('quan') || n.includes('cafe') || n.includes('tra') || n.includes('com') || n.includes('pho');
                if (cat === 'parking') return n.includes('xe') || n.includes('do') || n.includes('gui') || n.includes('gara') || n.includes('bai');
                if (cat === 'travel') return n.includes('du lich') || n.includes('phuot') || n.includes('tour') || n.includes('choi') || n.includes('bien');
                return true;
            });
        }

        // 3.3 Hiển thị Empty State nếu không có bản đồ
        if (filteredMaps.length === 0) {
            container.innerHTML = `
                <div class="col-span-full py-10 px-4">
                    <div class="work-empty-glass p-8 text-center flex flex-col items-center justify-center gap-4 max-w-lg mx-auto">
                        <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500/15 to-amber-500/15 text-rose-500 flex items-center justify-center text-3xl shadow-inner cm-float-anim">
                            <i class="fa-solid fa-compass"></i>
                        </div>
                        <div>
                            <p class="text-base font-black custom-text">
                                ${state.customMaps.length === 0 ? "Bắt đầu tạo bản đồ thực địa của bạn!" : "Không tìm thấy bản đồ phù hợp"}
                            </p>
                            <p class="text-xs font-semibold custom-text-secondary mt-1 max-w-xs mx-auto">
                                ${state.customMaps.length === 0 ? "Lưu lại trạm sạc xe, quán cafe làm việc ruột, bãi đỗ xe hoặc các điểm check-in thú vị." : "Hãy thử nhập từ khóa tìm kiếm khác hoặc chuyển danh mục."}
                            </p>
                        </div>

                        ${state.customMaps.length === 0 ? `
                        <div class="w-full pt-2">
                            <p class="text-[10px] font-black uppercase tracking-wider custom-text-secondary mb-3">Mẫu tạo nhanh chỉ với 1 chạm:</p>
                            <div class="grid grid-cols-2 gap-2 text-left">
                                <button onclick="cmCreateFromTemplate('Trạm sạc VinFast', '⚡', 'from-cyan-500 to-blue-600')" class="p-3 rounded-2xl custom-bg-card border custom-border hover:border-cyan-400/50 transition-all flex items-center gap-2.5 active:scale-95 group">
                                    <span class="text-2xl group-hover:scale-110 transition-transform">⚡</span>
                                    <div>
                                        <div class="text-xs font-black custom-text">Trạm Sạc VinFast</div>
                                        <div class="text-[9px] font-bold custom-text-secondary">Xe điện & toạ độ</div>
                                    </div>
                                </button>
                                <button onclick="cmCreateFromTemplate('Quán Cafe làm việc', '☕', 'from-amber-500 to-orange-600')" class="p-3 rounded-2xl custom-bg-card border custom-border hover:border-amber-400/50 transition-all flex items-center gap-2.5 active:scale-95 group">
                                    <span class="text-2xl group-hover:scale-110 transition-transform">☕</span>
                                    <div>
                                        <div class="text-xs font-black custom-text">Quán Cafe Ruột</div>
                                        <div class="text-[9px] font-bold custom-text-secondary">Wifi nhanh & yên tĩnh</div>
                                    </div>
                                </button>
                                <button onclick="cmCreateFromTemplate('Bãi Đỗ Xe Ô Tô', '🚗', 'from-blue-500 to-indigo-600')" class="p-3 rounded-2xl custom-bg-card border custom-border hover:border-blue-400/50 transition-all flex items-center gap-2.5 active:scale-95 group">
                                    <span class="text-2xl group-hover:scale-110 transition-transform">🚗</span>
                                    <div>
                                        <div class="text-xs font-black custom-text">Bãi Đỗ Xe</div>
                                        <div class="text-[9px] font-bold custom-text-secondary">Hầm & bãi gửi xe</div>
                                    </div>
                                </button>
                                <button onclick="cmCreateFromTemplate('Quán Ăn Yêu Thích', '🍜', 'from-rose-500 to-pink-600')" class="p-3 rounded-2xl custom-bg-card border custom-border hover:border-rose-400/50 transition-all flex items-center gap-2.5 active:scale-95 group">
                                    <span class="text-2xl group-hover:scale-110 transition-transform">🍜</span>
                                    <div>
                                        <div class="text-xs font-black custom-text">Quán Ăn Ngon</div>
                                        <div class="text-[9px] font-bold custom-text-secondary">Ẩm thực & địa chỉ</div>
                                    </div>
                                </button>
                            </div>
                        </div>` : ''}
                    </div>
                </div>
            `;
            return;
        }

        // 3.4 Render thẻ bản đồ siêu đẹp
        container.innerHTML = filteredMaps.map(m => {
            const pts = state.mapPoints.filter(p => p.mapId === m.id);
            const meta = getMapMetadata(m);
            const ptsWithImages = pts.filter(p => p.image && p.image.length > 30);
            const latestPt = pts.length > 0 ? pts[pts.length - 1] : null;

            // Dải ảnh xem trước (Mini Photo Collage)
            let collageHtml = '';
            if (ptsWithImages.length > 0) {
                const previewImages = ptsWithImages.slice(0, 4);
                collageHtml = `
                    <div class="flex items-center gap-1.5 mt-3 pt-3 border-t border-dashed custom-border">
                        <div class="flex -space-x-2 overflow-hidden py-1">
                            ${previewImages.map(p => `
                                <img src="${p.image}" onclick="event.stopPropagation(); window.openImageModal ? openImageModal('${p.image}') : (window.workViewImageFullScreen ? workViewImageFullScreen('${p.image}') : null)" class="inline-block h-9 w-9 rounded-xl object-cover ring-2 ring-white dark:ring-gray-900 shadow-sm hover:scale-110 hover:z-20 transition-transform cursor-pointer" title="${p.name}">
                            `).join('')}
                        </div>
                        <div class="text-[10px] font-bold custom-text-secondary pl-2 truncate flex-1">
                            <span class="text-primary-500 font-black">${ptsWithImages.length}</span> ảnh thực địa
                        </div>
                    </div>
                `;
            }

            // Điểm ghim gần nhất
            let latestInfoHtml = '';
            if (latestPt) {
                latestInfoHtml = `
                    <div class="mt-2.5 flex items-center gap-2 text-xs custom-text-secondary bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border custom-border truncate">
                        <i class="fa-solid fa-location-crosshairs text-rose-500 text-[10px] shrink-0"></i>
                        <span class="font-bold custom-text truncate">${latestPt.name}</span>
                        ${latestPt.address ? `<span class="opacity-50 text-[10px] truncate">• ${latestPt.address}</span>` : ''}
                    </div>
                `;
            } else {
                latestInfoHtml = `
                    <div class="mt-2.5 flex items-center gap-2 text-[11px] custom-text-secondary bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-dashed custom-border">
                        <i class="fa-solid fa-circle-info text-amber-500 text-[10px]"></i>
                        <span>Chưa có điểm nào. Bấm <b>Mở Bản Đồ</b> để ghim ngay!</span>
                    </div>
                `;
            }

            return `
            <div class="cm-card-glass p-4 sm:p-5 flex flex-col justify-between group">
                <div>
                    <!-- Header Thẻ -->
                    <div class="flex items-start justify-between gap-3 mb-2">
                        <div class="flex items-center gap-3 min-w-0" onclick="openCustomMap('${m.id}')" style="cursor: pointer;">
                            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr ${meta.color} text-white flex items-center justify-center text-2xl shadow-md shadow-black/10 shrink-0 group-hover:scale-105 transition-transform">
                                ${meta.emoji || `<i class="fa-solid ${meta.icon}"></i>`}
                            </div>
                            <div class="min-w-0">
                                <h4 class="font-black text-base custom-text truncate leading-tight group-hover:text-primary-500 transition-colors">${m.name}</h4>
                                <div class="flex items-center gap-2 mt-1">
                                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${pts.length > 0 ? 'bg-rose-500/15 text-rose-500 border border-rose-500/20' : 'bg-black/5 dark:bg-white/10 custom-text-secondary'}">
                                        <i class="fa-solid fa-location-dot text-[9px]"></i> ${pts.length} Điểm
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Dropdown Actions -->
                        <div class="flex items-center gap-1 shrink-0">
                            <button onclick="openModal('editCustomMap', '${m.id}')" class="w-8 h-8 rounded-xl custom-bg-input custom-text-secondary hover:text-primary-500 flex items-center justify-center border custom-border active:scale-90 transition-all" title="Chỉnh sửa bản đồ">
                                <i class="fa-solid fa-pen text-xs"></i>
                            </button>
                            <button onclick="cmShareMap('${m.id}')" class="w-8 h-8 rounded-xl custom-bg-input custom-text-secondary hover:text-amber-500 flex items-center justify-center border custom-border active:scale-90 transition-all" title="Chia sẻ điểm ghim">
                                <i class="fa-solid fa-share-nodes text-xs"></i>
                            </button>
                            <button onclick="deleteCustomMap('${m.id}')" class="w-8 h-8 rounded-xl custom-bg-input custom-text-secondary hover:text-rose-500 flex items-center justify-center border custom-border active:scale-90 transition-all" title="Xóa bản đồ">
                                <i class="fa-solid fa-trash text-xs"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Thông tin điểm mới nhất -->
                    ${latestInfoHtml}

                    <!-- Dải ảnh -->
                    ${collageHtml}
                </div>

                <!-- Footer Thẻ: Action Buttons -->
                <div class="flex items-center gap-2 mt-4 pt-3 border-t custom-border">
                    <button onclick="openCustomMap('${m.id}')" class="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-black text-xs shadow-md shadow-primary-500/25 flex items-center justify-center gap-1.5 active:scale-95 transition-all hover:brightness-110">
                        <i class="fa-solid fa-map-location-dot"></i> Mở Bản Đồ
                    </button>
                    <button onclick="cmQuickPinDirect('${m.id}')" class="px-3.5 py-2.5 rounded-2xl custom-bg-input border custom-border font-black text-xs custom-text hover:text-rose-500 flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm" title="Ghim điểm nhanh không cần ảnh">
                        <i class="fa-solid fa-location-crosshairs text-rose-500"></i> Ghim Điểm
                    </button>
                </div>
            </div>`;
        }).join("");
    };

    // Tạo bản đồ từ mẫu template có sẵn
    window.cmCreateFromTemplate = function (name, emoji, color) {
        if (!state.customMaps) state.customMaps = [];
        const newMap = {
            id: "cmap-" + uid(),
            name: name,
            emoji: emoji,
            color: color,
            createdAt: new Date().toISOString()
        };
        state.customMaps.unshift(newMap);
        if (typeof saveData === 'function') saveData();
        window.renderCustomMapsList();
        if (typeof playSound === "function") playSound("success");
    };

    // ============================================================
    // 4. CHIA SẺ BẢN ĐỒ & TOẠ ĐỘ (SHARE TO CLIPBOARD)
    // ============================================================
    window.cmShareMap = function (mapId) {
        const m = (state.customMaps || []).find(x => x.id === mapId);
        if (!m) return;
        const pts = (state.mapPoints || []).filter(p => p.mapId === mapId);

        let text = `🗺️ BẢN ĐỒ THỰC ĐỊA: ${m.name}\n📍 Tổng số điểm đã ghim: ${pts.length}\n`;
        if (pts.length === 0) {
            text += `Chưa có địa điểm nào được ghim.`;
        } else {
            pts.forEach((pt, i) => {
                text += `\n${i + 1}. ${pt.name}`;
                if (pt.address) text += `\n   📍 Địa chỉ: ${pt.address}`;
                if (pt.note) text += `\n   📝 Ghi chú: ${pt.note}`;
                if (pt.lat && pt.lng) {
                    text += `\n   🧭 Chỉ đường: https://www.google.com/maps/dir/?api=1&destination=${pt.lat},${pt.lng}`;
                }
            });
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                alert(`✅ Đã sao chép danh sách ${pts.length} điểm ghim của "${m.name}" vào bộ nhớ tạm! Bạn có thể dán vào Zalo/Tin nhắn để chia sẻ.`);
            });
        } else {
            alert(text);
        }
        if (typeof playSound === "function") playSound("pop");
    };

    // ============================================================
    // 5. MASTER MAP EXPLORER (Xem toàn cảnh tất cả các bản đồ)
    // ============================================================
    window.cmInitMasterMap = function () {
        const mapContainer = document.getElementById("cm-master-leaflet-map");
        if (!mapContainer) return;

        if (!window.cmMasterMapObj) {
            window.cmMasterMapObj = L.map("cm-master-leaflet-map", {
                zoomControl: false,
                attributionControl: false
            });

            const isDark = document.documentElement.classList.contains("dark");
            const tileUrl = isDark
                ? "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                : "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";

            L.tileLayer(tileUrl).addTo(window.cmMasterMapObj);
            window.cmMasterLayerGroup = L.layerGroup().addTo(window.cmMasterMapObj);
        }

        // Cập nhật dropdown bộ lọc
        const selectEl = document.getElementById("cm-master-filter-select");
        if (selectEl) {
            const currentVal = selectEl.value;
            selectEl.innerHTML = `<option value="all">🗺️ Xem tất cả (${state.customMaps.length} bản đồ)</option>` +
                state.customMaps.map(m => {
                    const count = state.mapPoints.filter(p => p.mapId === m.id).length;
                    return `<option value="${m.id}" ${currentVal === m.id ? 'selected' : ''}>${m.name} (${count} điểm)</option>`;
                }).join("");
        }

        window.cmMasterMapObj.invalidateSize();
        window.cmRenderMasterMap();
    };

    window.cmRenderMasterMap = function () {
        if (!window.cmMasterMapObj || !window.cmMasterLayerGroup) return;
        window.cmMasterLayerGroup.clearLayers();

        const selectEl = document.getElementById("cm-master-filter-select");
        const filterMapId = selectEl ? selectEl.value : 'all';

        let targetPoints = [];
        if (filterMapId === 'all') {
            targetPoints = [...(state.mapPoints || [])];
        } else {
            targetPoints = (state.mapPoints || []).filter(p => p.mapId === filterMapId);
        }

        const countBadge = document.getElementById("cm-master-count-badge");
        if (countBadge) countBadge.innerText = `${targetPoints.length} điểm`;

        if (targetPoints.length === 0) {
            window.cmMasterMapObj.setView([10.823, 106.629], 12);
            return;
        }

        targetPoints.forEach(pt => {
            const ownerMap = state.customMaps.find(m => m.id === pt.mapId) || { name: 'Thực địa', emoji: '📍' };
            const meta = getMapMetadata(ownerMap);

            let markerInner = meta.emoji || '📍';
            if (pt.image && pt.image.length > 30) {
                markerInner = `<img src="${pt.image}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            }

            const iconHtml = `
                <div style="position: relative; width: 40px; height: 40px; transition: transform 0.2s;" class="hover:scale-110">
                    <div style="width: 40px; height: 40px; background: white; border-radius: 50%; padding: 2px; box-shadow: 0 4px 12px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; font-size: 18px; position: relative; z-index: 10;">
                        ${markerInner}
                    </div>
                    <div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 8px solid white; z-index: 0;"></div>
                </div>
            `;

            const icon = L.divIcon({
                html: iconHtml,
                className: '',
                iconSize: [40, 48],
                iconAnchor: [20, 48]
            });

            const marker = L.marker([pt.lat, pt.lng], { icon }).addTo(window.cmMasterLayerGroup);

            const popupHtml = `
                <div class="font-sans w-[220px]">
                    <span class="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary-50 text-primary-600 mb-1.5 border border-primary-100">${ownerMap.name}</span>
                    ${pt.image ? `<img src="${pt.image}" class="w-full h-24 object-cover rounded-xl mb-2 shadow-sm">` : ''}
                    <h4 class="font-black text-sm custom-text mb-1">${pt.name}</h4>
                    <p class="text-[10px] custom-text-secondary font-bold mb-2"><i class="fa-solid fa-location-dot text-rose-500"></i> ${pt.address || 'Đã lưu toạ độ'}</p>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${pt.lat},${pt.lng}" target="_blank" class="w-full py-2 flex items-center justify-center gap-1.5 custom-primary text-white font-bold text-xs rounded-xl shadow-md no-underline">
                        <i class="fa-solid fa-diamond-turn-right text-white"></i> Chỉ đường Google Maps
                    </a>
                </div>
            `;
            marker.bindPopup(popupHtml);
        });

        const bounds = L.latLngBounds(targetPoints.map(p => [p.lat, p.lng]));
        window.cmMasterMapObj.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
    };

    window.cmLocateMaster = function () {
        if (!window.cmMasterMapObj) return;
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(pos => {
                window.cmMasterMapObj.flyTo([pos.coords.latitude, pos.coords.longitude], 16, { duration: 1 });
            });
        }
        if (typeof playSound === "function") playSound("pop");
    };

    // ============================================================
    // 6. GHIM ĐIỂM NHANH BẰNG GPS / TOẠ ĐỘ (QUICK PIN WITHOUT CAMERA)
    // ============================================================
    window.cmQuickPinDirect = function (mapId) {
        currentMapId = mapId;
        const targetMap = (state.customMaps || []).find(m => m.id === mapId);
        const mapName = targetMap ? targetMap.name : "Bản đồ";

        const modal = document.getElementById("modal-cm-checkin");
        if (!modal) return;
        modal.classList.remove("hidden");
        modal.classList.add("flex");

        document.getElementById("cm-preview").classList.add("hidden");
        document.getElementById("cm-loading").classList.remove("hidden");
        document.getElementById("btn-save-cm").classList.add("opacity-50", "pointer-events-none");
        document.getElementById("cm-point-name").value = "";
        document.getElementById("cm-point-note").value = "";
        document.getElementById("cm-loc-text").innerText = "Đang lấy toạ độ GPS chính xác...";

        tempCMData = { img: null, lat: null, lng: null, addr: "" };

        // Bắt GPS & Reverse Geocoding OSM
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    tempCMData.lat = pos.coords.latitude;
                    tempCMData.lng = pos.coords.longitude;
                    document.getElementById("cm-loading").classList.add("hidden");

                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${tempCMData.lat}&lon=${tempCMData.lng}&zoom=18&addressdetails=1&accept-language=vi`);
                        const data = await res.json();
                        const addr = data.address || {};
                        const road = addr.road || addr.pedestrian || "";
                        const ward = addr.suburb || addr.quarter || addr.village || addr.city_district || "";
                        tempCMData.addr = (road && ward) ? `${road}, ${ward}` : (road || ward || "Khu vực toạ độ");
                    } catch (err) {
                        tempCMData.addr = `Toạ độ: ${tempCMData.lat.toFixed(4)}, ${tempCMData.lng.toFixed(4)}`;
                    }

                    document.getElementById("cm-loc-text").innerText = tempCMData.addr;
                    document.getElementById("btn-save-cm").classList.remove("opacity-50", "pointer-events-none");
                    if (typeof playSound === "function") playSound("success");
                },
                () => {
                    document.getElementById("cm-loading").classList.add("hidden");
                    tempCMData.lat = 10.823;
                    tempCMData.lng = 106.629;
                    tempCMData.addr = "Toạ độ mặc định (Chưa bật GPS)";
                    document.getElementById("cm-loc-text").innerText = tempCMData.addr;
                    document.getElementById("btn-save-cm").classList.remove("opacity-50", "pointer-events-none");
                },
                { enableHighAccuracy: true, timeout: 8000 }
            );
        }
    };

    // ============================================================
    // 7. OVERRIDE & NÂNG CẤP MODAL TẠO BẢN ĐỒ (CREATE & EDIT MAP)
    // ============================================================
    const origOpenModal = window.openModal;
    window.openModal = function (type, id = null, preset = null) {
        if (type === "createCustomMap" || type === "editCustomMap") {
            const isEdit = type === "editCustomMap";
            const mapData = isEdit
                ? (state.customMaps || []).find(m => m.id === id) || { name: "" }
                : { name: "", emoji: "⚡", color: "from-cyan-500 to-blue-600" };

            const modal = document.getElementById("global-modal");
            const title = document.getElementById("modal-title");
            const body = document.getElementById("modal-body");
            if (!modal || !title || !body) return;

            modal.classList.remove("hidden");
            title.innerHTML = isEdit
                ? '<span class="flex items-center gap-2"><i class="fa-solid fa-pen text-primary-500"></i> Sửa Bản Đồ Thực Địa</span>'
                : '<span class="flex items-center gap-2"><i class="fa-solid fa-map-location-dot text-primary-500"></i> Tạo Bộ Sưu Tập Bản Đồ Mới</span>';

            const emojis = ['⚡','☕','🍜','🚗','🏖️','🏠','⛽','📍','💎','🛒'];
            const currentEmoji = mapData.emoji || '⚡';

            body.innerHTML = `
                <form id="frm-create-cm" class="space-y-4">
                    <div>
                        <label class="block text-xs font-black custom-text-secondary uppercase mb-2">Tên Bộ Sưu Tập</label>
                        <input type="text" id="cm-map-name" required value="${mapData.name || ''}" placeholder="VD: Trạm sạc VinFast, Quán Cafe yên tĩnh..." class="w-full p-4 custom-bg-input rounded-2xl outline-none font-bold custom-text border custom-border custom-focus text-sm custom-placeholder">
                    </div>

                    <div>
                        <label class="block text-xs font-black custom-text-secondary uppercase mb-2">Biểu Tượng Đặc Trưng</label>
                        <div class="grid grid-cols-5 gap-2">
                            ${emojis.map(em => `
                                <label class="cursor-pointer">
                                    <input type="radio" name="cm-emoji-choice" value="${em}" class="peer sr-only" ${em === currentEmoji ? 'checked' : ''}>
                                    <div class="w-full aspect-square flex items-center justify-center text-2xl rounded-2xl border custom-border custom-bg-input peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/30 peer-checked:scale-105 transition-all shadow-sm hover:scale-105 active:scale-95">${em}</div>
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    ${!isEdit ? `
                    <div>
                        <label class="block text-[10px] font-black custom-text-secondary uppercase mb-2">Gợi Ý Mẫu Nhanh</label>
                        <div class="flex flex-wrap gap-1.5">
                            <span onclick="document.getElementById('cm-map-name').value='Trạm sạc xe điện VinFast'; document.querySelector('input[name=cm-emoji-choice][value=⚡]').checked=true;" class="px-2.5 py-1 rounded-xl custom-bg-input border custom-border text-xs font-bold custom-text-secondary hover:custom-text cursor-pointer active:scale-95">⚡ VinFast EV</span>
                            <span onclick="document.getElementById('cm-map-name').value='Quán Cafe & Làm Việc'; document.querySelector('input[name=cm-emoji-choice][value=☕]').checked=true;" class="px-2.5 py-1 rounded-xl custom-bg-input border custom-border text-xs font-bold custom-text-secondary hover:custom-text cursor-pointer active:scale-95">☕ Cafe Ruột</span>
                            <span onclick="document.getElementById('cm-map-name').value='Bãi Gửi Xe & Gara'; document.querySelector('input[name=cm-emoji-choice][value=🚗]').checked=true;" class="px-2.5 py-1 rounded-xl custom-bg-input border custom-border text-xs font-bold custom-text-secondary hover:custom-text cursor-pointer active:scale-95">🚗 Bãi Đỗ Xe</span>
                            <span onclick="document.getElementById('cm-map-name').value='Quán Ăn Gia Đình'; document.querySelector('input[name=cm-emoji-choice][value=🍜]').checked=true;" class="px-2.5 py-1 rounded-xl custom-bg-input border custom-border text-xs font-bold custom-text-secondary hover:custom-text cursor-pointer active:scale-95">🍜 Quán Ăn</span>
                        </div>
                    </div>` : ''}

                    <div class="pt-2">
                        <button type="submit" class="w-full py-4 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-primary-500/30 active:scale-95 transition-all hover:brightness-110">
                            ${isEdit ? "Lưu Cập Nhật Bản Đồ" : "Tạo Bộ Sưu Tập Ngay"}
                        </button>
                    </div>
                </form>
            `;

            document.getElementById("frm-create-cm").onsubmit = (e) => {
                e.preventDefault();
                const newName = document.getElementById("cm-map-name").value.trim();
                const selectedEmoji = document.querySelector('input[name="cm-emoji-choice"]:checked')?.value || '📍';

                let chosenColor = 'from-purple-500 to-indigo-600';
                if (selectedEmoji === '⚡') chosenColor = 'from-cyan-500 to-blue-600';
                else if (selectedEmoji === '☕') chosenColor = 'from-amber-500 to-orange-600';
                else if (selectedEmoji === '🚗') chosenColor = 'from-blue-500 to-indigo-600';
                else if (selectedEmoji === '🍜') chosenColor = 'from-rose-500 to-pink-600';
                else if (selectedEmoji === '🏖️') chosenColor = 'from-emerald-500 to-teal-600';

                if (isEdit) {
                    const idx = (state.customMaps || []).findIndex(m => m.id === id);
                    if (idx > -1) {
                        state.customMaps[idx].name = newName;
                        state.customMaps[idx].emoji = selectedEmoji;
                        state.customMaps[idx].color = chosenColor;
                    }
                } else {
                    if (!state.customMaps) state.customMaps = [];
                    state.customMaps.unshift({
                        id: "cmap-" + uid(),
                        name: newName,
                        emoji: selectedEmoji,
                        color: chosenColor,
                        createdAt: new Date().toISOString()
                    });
                }

                if (typeof saveData === 'function') saveData();
                if (typeof closeModal === 'function') closeModal();
                window.renderCustomMapsList();
                if (typeof playSound === "function") playSound("success");
            };
        } else if (origOpenModal) {
            origOpenModal(type, id, preset);
        }
    };

    // Tự động hook khi switchView sang 'custommaps'
    const origSwitch = window.switchView;
    window.switchView = function (viewId) {
        if (origSwitch) origSwitch(viewId);
        if (viewId === "custommaps") {
            window.renderCustomMapsList();
        }
    };

})();
