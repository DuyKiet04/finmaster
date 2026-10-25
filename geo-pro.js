// ==============================================================
// FILE: geo-pro.js - FINMASTER UNIVERSAL SMART GEOLOCATION & MAP PICKER
// Định Vị Đa Tầng Thông Minh + Bản Đồ Chọn Vị Trí Kéo Thả (Leaflet)
// Tìm Kiếm Địa Chỉ Nhanh + Giải Mã Địa Chỉ Tiếng Việt Chi Tiết
// ==============================================================

(function initSmartGeolocation() {
  console.log('[FinMaster Geo] Khởi tạo Hệ thống Định vị & Bản đồ Chọn Vị Trí.');

  let pickerMap = null;
  let pickerMarker = null;
  let currentPickerCoords = { lat: 10.823, lng: 106.629 };
  let currentPickerAddress = "Chưa chọn vị trí";
  let pickerOnSelectCallback = null;
  let searchDebounceTimer = null;

  /**
   * 1. Giải mã toạ độ sang địa chỉ tiếng Việt chi tiết
   * Ưu tiên 1: BigDataCloud (Rất nhanh, chính xác phường/xã, quận/huyện tại Việt Nam)
   * Ưu tiên 2: Photon Komoot (Lấy tên đường, số nhà nếu có)
   */
  window.reverseGeocodeSmart = async function(lat, lng) {
    if (!lat || !lng) return "Chưa xác định toạ độ";

    // 1. Thử BigDataCloud
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=vi`
      );
      if (res.ok) {
        const d = await res.json();
        const ward = d.locality || '';
        const city = d.city || d.principalSubdivision || '';
        
        let district = '';
        const infoList = d.localityInfo?.informative || [];
        for (const item of infoList) {
          if (item.name && (item.name.includes('Quận') || item.name.includes('Huyện') || item.name.includes('Thị xã') || item.name.includes('TP.'))) {
            district = item.name;
            break;
          }
        }
        if (!district && d.localityInfo?.administrative) {
          const admin6 = d.localityInfo.administrative.find(a => a.adminLevel === 6 || a.adminLevel === 5);
          if (admin6 && admin6.name !== ward) district = admin6.name;
        }

        const parts = [ward, district, city].filter(p => p && p.trim().length > 0);
        if (parts.length > 0) {
          return parts.join(', ');
        }
      }
    } catch (eBDC) {
      console.warn('[Geo-Pro] BigDataCloud lỗi:', eBDC);
    }

    // 2. Thử Photon Komoot
    try {
      const res2 = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`);
      if (res2.ok) {
        const d2 = await res2.json();
        if (d2.features && d2.features.length > 0) {
          const props = d2.features[0].properties;
          const street = props.street || props.name || '';
          const district = props.district || props.locality || '';
          const city = props.city || '';
          const parts = [street, district, city].filter(p => p && p.trim().length > 0);
          if (parts.length > 0) return parts.join(', ');
        }
      }
    } catch (ePhoton) {
      console.warn('[Geo-Pro] Photon Komoot lỗi:', ePhoton);
    }

    return `Toạ độ: ${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
  };

  /**
   * 2. Tìm kiếm địa chỉ với gợi ý tức thì (Photon API)
   */
  window.searchAddressLocations = async function(query) {
    if (!query || query.trim().length < 2) return [];
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query.trim())}&limit=6`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.features || []).map(f => {
        const p = f.properties || {};
        const parts = [p.name, p.street, p.district || p.locality, p.city, p.country].filter(Boolean);
        // Lọc trùng tên
        const uniqueParts = parts.filter((v, i, a) => a.indexOf(v) === i);
        return {
          displayName: uniqueParts.join(', '),
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
          raw: p
        };
      });
    } catch (err) {
      console.warn('[Geo-Pro] Lỗi tìm kiếm địa chỉ:', err);
      return [];
    }
  };

  /**
   * 3. Lấy GPS thiết bị thực tế (Có hỗ trợ timeout đủ dài 12s)
   */
  window.getDeviceGPS = function(timeoutMs = 12000) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error('Trình duyệt không hỗ trợ định vị GPS'));
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            source: 'device-gps'
          });
        },
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 }
      );
    });
  };

  /**
   * 4. Khởi tạo Modal Chọn Vị Trí Trên Bản Đồ (Leaflet Picker Modal)
   */
  function ensurePickerModalDOM() {
    let modal = document.getElementById('modal-location-picker');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'modal-location-picker';
    modal.className = 'fixed inset-0 z-[10005] bg-black/70 backdrop-blur-md hidden items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300';
    modal.innerHTML = `
      <div class="w-full sm:max-w-xl bg-slate-900 border border-slate-700/80 rounded-t-[28px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] h-[85vh] sm:h-[640px] overflow-hidden text-white animate-iosPopIn">
        
        <!-- Header -->
        <div class="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm border border-indigo-500/30">
              <i class="fa-solid fa-map-location-dot"></i>
            </div>
            <div>
              <h3 class="font-extrabold text-sm text-white">Chọn Vị Trí Chính Xác</h3>
              <p class="text-[10px] text-slate-400">Kéo thả ghim đỏ hoặc tìm kiếm tên địa điểm</p>
            </div>
          </div>
          <button type="button" onclick="closeLocationPickerModal()" class="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm hover:bg-slate-700 active:scale-90 transition-all">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Ô Tìm Kiếm Địa Điểm -->
        <div class="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800/80 relative z-30">
          <div class="relative flex items-center">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 text-slate-400 text-xs"></i>
            <input id="loc-picker-search-input" type="text" placeholder="Tìm kiếm địa chỉ, quán cà phê, tên đường..." 
              class="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 text-xs font-semibold focus:border-indigo-500 focus:outline-none transition-all">
            <button id="loc-picker-clear-search" onclick="clearLocationPickerSearch()" class="hidden absolute right-3 text-slate-400 hover:text-white text-xs">
              <i class="fa-solid fa-circle-xmark"></i>
            </button>
          </div>
          <!-- Dropdown Gợi Ý Tìm Kiếm -->
          <div id="loc-picker-search-results" class="hidden absolute left-4 right-4 top-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-52 overflow-y-auto z-50 divide-y divide-slate-700/50"></div>
        </div>

        <!-- Khung Bản Đồ Leaflet -->
        <div class="relative flex-1 w-full min-h-[220px] bg-slate-950 overflow-hidden">
          <div id="loc-picker-leaflet-map" class="w-full h-full z-10"></div>
          
          <!-- Nút Bắt GPS Nhanh Nổi Trên Bản Đồ -->
          <button id="btn-loc-picker-gps" type="button" onclick="triggerPickerDeviceGPS()" 
            class="absolute bottom-3 right-3 z-[400] px-3.5 py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white font-bold text-xs shadow-xl backdrop-blur-sm border border-indigo-400/30 flex items-center gap-1.5 active:scale-95 transition-all">
            <i class="fa-solid fa-crosshairs text-indigo-200"></i>
            <span>GPS Thiết Bị</span>
          </button>
        </div>

        <!-- Thanh Hiển Thị Vị Trí Đã Chọn & Nút Xác Nhận -->
        <div class="p-4 bg-slate-950 border-t border-slate-800 flex flex-col gap-3">
          <div class="flex items-start gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
            <div class="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 border border-rose-500/30">
              <i class="fa-solid fa-location-dot"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-black text-indigo-400 uppercase tracking-wider">Vị Trí Đang Chọn</span>
                <span id="loc-picker-coords-text" class="text-[10px] text-slate-400 font-mono">10.823, 106.629</span>
              </div>
              <div id="loc-picker-selected-address" class="text-xs font-bold text-white truncate mt-0.5">
                Đang nạp địa chỉ...
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2.5">
            <button type="button" onclick="closeLocationPickerModal()" class="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs active:scale-95 transition-all">
              Huỷ
            </button>
            <button id="btn-loc-picker-confirm" type="button" onclick="confirmLocationPickerSelection()" class="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:brightness-110 text-white font-black text-xs shadow-lg shadow-indigo-500/30 active:scale-95 transition-all flex items-center justify-center gap-2">
              <i class="fa-solid fa-check"></i>
              <span>Xác Nhận Vị Trí Này</span>
            </button>
          </div>
        </div>

      </div>
    `;

    document.body.appendChild(modal);

    // Gắn sự kiện ô tìm kiếm
    const searchInput = document.getElementById('loc-picker-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value;
        const clearBtn = document.getElementById('loc-picker-clear-search');
        if (clearBtn) clearBtn.classList.toggle('hidden', !q);

        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(async () => {
          if (!q || q.trim().length < 2) {
            document.getElementById('loc-picker-search-results').classList.add('hidden');
            return;
          }
          const results = await window.searchAddressLocations(q);
          renderSearchDropdown(results);
        }, 350);
      });
    }

    return modal;
  }

  function renderSearchDropdown(results) {
    const box = document.getElementById('loc-picker-search-results');
    if (!box) return;
    if (!results || results.length === 0) {
      box.innerHTML = `<div class="p-3 text-xs text-slate-400 text-center font-medium">Không tìm thấy địa điểm phù hợp</div>`;
      box.classList.remove('hidden');
      return;
    }

    box.innerHTML = results.map((r, i) => `
      <div onclick="selectSearchResult(${r.lat}, ${r.lng}, '${encodeURIComponent(r.displayName)}')" class="p-3 hover:bg-slate-700/60 cursor-pointer flex items-center gap-2.5 transition-colors">
        <i class="fa-solid fa-location-dot text-indigo-400 text-xs shrink-0"></i>
        <div class="text-xs text-slate-200 font-medium truncate">${r.displayName}</div>
      </div>
    `).join('');
    box.classList.remove('hidden');
  }

  window.clearLocationPickerSearch = function() {
    const input = document.getElementById('loc-picker-search-input');
    if (input) input.value = '';
    const clearBtn = document.getElementById('loc-picker-clear-search');
    if (clearBtn) clearBtn.classList.add('hidden');
    const box = document.getElementById('loc-picker-search-results');
    if (box) box.classList.add('hidden');
  };

  window.selectSearchResult = function(lat, lng, encodedName) {
    const name = decodeURIComponent(encodedName);
    updatePickerLocation(lat, lng, name);
    window.clearLocationPickerSearch();
  };

  // Cập nhật vị trí trên bản đồ và hiển thị
  async function updatePickerLocation(lat, lng, knownAddress = null) {
    currentPickerCoords = { lat: parseFloat(lat), lng: parseFloat(lng) };
    
    if (pickerMarker) {
      pickerMarker.setLatLng([currentPickerCoords.lat, currentPickerCoords.lng]);
    }
    if (pickerMap) {
      pickerMap.setView([currentPickerCoords.lat, currentPickerCoords.lng], 16);
    }

    const coordsEl = document.getElementById('loc-picker-coords-text');
    if (coordsEl) {
      coordsEl.innerText = `${currentPickerCoords.lat.toFixed(4)}, ${currentPickerCoords.lng.toFixed(4)}`;
    }

    const addrEl = document.getElementById('loc-picker-selected-address');
    if (knownAddress) {
      currentPickerAddress = knownAddress;
      if (addrEl) addrEl.innerText = knownAddress;
    } else {
      if (addrEl) addrEl.innerText = 'Đang giải mã tên địa chỉ...';
      const addr = await window.reverseGeocodeSmart(currentPickerCoords.lat, currentPickerCoords.lng);
      currentPickerAddress = addr;
      if (addrEl) addrEl.innerText = addr;
    }
  }

  /**
   * 5. Mở Modal Chọn Vị Trí (Public API)
   */
  window.openLocationPickerModal = function(options = {}) {
    ensurePickerModalDOM();
    const modal = document.getElementById('modal-location-picker');
    if (!modal) return;

    pickerOnSelectCallback = options.onSelect || null;

    let initLat = parseFloat(options.currentLat) || 10.823;
    let initLng = parseFloat(options.currentLng) || 106.629;
    let initAddress = options.currentAddress || "";

    currentPickerCoords = { lat: initLat, lng: initLng };
    currentPickerAddress = initAddress || "Chưa chọn vị trí";

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    const addrEl = document.getElementById('loc-picker-selected-address');
    if (addrEl) addrEl.innerText = currentPickerAddress;
    const coordsEl = document.getElementById('loc-picker-coords-text');
    if (coordsEl) coordsEl.innerText = `${initLat.toFixed(4)}, ${initLng.toFixed(4)}`;

    // Khởi tạo bản đồ Leaflet sau khi modal hiển thị
    setTimeout(() => {
      const mapContainer = document.getElementById('loc-picker-leaflet-map');
      if (!mapContainer || typeof L === 'undefined') return;

      if (!pickerMap) {
        pickerMap = L.map('loc-picker-leaflet-map', {
          zoomControl: true,
          attributionControl: false
        }).setView([initLat, initLng], 15);

        L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
          maxZoom: 19
        }).addTo(pickerMap);

        // Icon Ghim Đỏ Đẹp Mắt
        const pinIcon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-full cursor-grab active:cursor-grabbing">
              <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 border-2 border-white shadow-xl flex items-center justify-center text-white text-base">
                <i class="fa-solid fa-location-dot"></i>
              </div>
              <div class="absolute -bottom-1 w-2.5 h-2.5 bg-rose-600 rotate-45 border-r border-b border-white"></div>
            </div>
          `,
          className: '',
          iconSize: [36, 42],
          iconAnchor: [18, 42]
        });

        pickerMarker = L.marker([initLat, initLng], {
          icon: pinIcon,
          draggable: true
        }).addTo(pickerMap);

        // Khi người dùng kéo thả ghim
        pickerMarker.on('dragend', async (e) => {
          const pos = e.target.getLatLng();
          await updatePickerLocation(pos.lat, pos.lng);
        });

        // Khi người dùng chạm/nhấp vào bản đồ
        pickerMap.on('click', async (e) => {
          await updatePickerLocation(e.latlng.lat, e.latlng.lng);
        });
      } else {
        pickerMap.invalidateSize();
        pickerMap.setView([initLat, initLng], 15);
        if (pickerMarker) pickerMarker.setLatLng([initLat, initLng]);
      }

      // Nếu chưa có địa chỉ cụ thể, tự động giải mã
      if (!initAddress || initAddress === "Chưa chọn vị trí") {
        updatePickerLocation(initLat, initLng);
      }
    }, 150);
  };

  window.closeLocationPickerModal = function() {
    const modal = document.getElementById('modal-location-picker');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  window.confirmLocationPickerSelection = function() {
    if (typeof pickerOnSelectCallback === 'function') {
      pickerOnSelectCallback({
        lat: currentPickerCoords.lat,
        lng: currentPickerCoords.lng,
        address: currentPickerAddress
      });
    }
    closeLocationPickerModal();
    if (typeof playSound === 'function') playSound("success");
  };

  /**
   * Bấm nút "GPS Thiết Bị" trong Picker Modal
   */
  window.triggerPickerDeviceGPS = async function() {
    const btn = document.getElementById('btn-loc-picker-gps');
    if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang bắt sóng...';

    try {
      const gps = await window.getDeviceGPS(15000);
      await updatePickerLocation(gps.lat, gps.lng);
      if (btn) btn.innerHTML = '<i class="fa-solid fa-check text-emerald-300"></i> Đã bắt GPS';
      setTimeout(() => {
        if (btn) btn.innerHTML = '<i class="fa-solid fa-crosshairs text-indigo-200"></i> GPS Thiết Bị';
      }, 2500);
    } catch (err) {
      console.warn('[Geo-Pro] Không lấy được GPS thiết bị:', err);
      alert('💡 Trình duyệt hoặc Windows chưa cho phép quyền GPS, hoặc thiết bị chưa bắt được vệ tinh.\n\n👉 Bạn hãy gõ tên địa chỉ vào ô Tìm kiếm hoặc chạm trực tiếp trên bản đồ để ghim đúng vị trí nhé!');
      if (btn) btn.innerHTML = '<i class="fa-solid fa-crosshairs text-indigo-200"></i> GPS Thiết Bị';
    }
  };

  /**
   * 6. Nâng Cấp Hàm Toàn Cục requestLocation() Trong Form Nhập Giao Dịch
   */
  window.requestLocation = function() {
    const latEl = document.getElementById("frm-lat");
    const lngEl = document.getElementById("frm-lng");
    const nameEl = document.getElementById("frm-loc-name");

    const curLat = latEl && latEl.value ? parseFloat(latEl.value) : null;
    const curLng = lngEl && lngEl.value ? parseFloat(lngEl.value) : null;
    const curAddr = nameEl ? nameEl.value : "";

    // Mở trực tiếp Bản Đồ Chọn Vị Trí để người dùng thấy rõ và chỉnh chính xác từng mét
    window.openLocationPickerModal({
      currentLat: curLat,
      currentLng: curLng,
      currentAddress: curAddr,
      onSelect: (loc) => {
        if (latEl) latEl.value = loc.lat;
        if (lngEl) lngEl.value = loc.lng;
        if (nameEl) {
          nameEl.value = loc.address;
          nameEl.classList.remove("text-danger-500");
        }
        const btn = document.getElementById("btn-get-loc");
        if (btn) {
          btn.innerHTML = '<i class="fa-solid fa-check text-success-500"></i>';
          setTimeout(() => {
            btn.innerHTML = '<i class="fa-solid fa-location-dot text-cyan-600"></i>';
          }, 2500);
        }
      }
    });
  };

  /**
   * 7. Nâng cấp gắn vị trí trong Nhật Ký & Chi tiết giao dịch
   */
  window.fastGetLocationDiary = function() {
    window.openLocationPickerModal({
      onSelect: (loc) => {
        const btn = document.getElementById("btn-diary-gps");
        const locText = document.getElementById("diary-loc-text");
        if (btn) {
          btn.innerHTML = '<i class="fa-solid fa-check"></i>';
          btn.classList.replace("text-rose-500", "text-success-500");
          btn.classList.replace("dark:text-rose-400", "dark:text-success-400");
        }
        if (locText) {
          locText.innerText = loc.address;
          locText.classList.remove("hidden");
        }
        const diaryInput = document.getElementById("diary-status-input");
        if (diaryInput) diaryInput.dataset.location = loc.address;
        if (typeof playSound === 'function') playSound("success");
      }
    });
  };

  window.attachCurrentLocationToTx = function() {
    if (!window.currentFullTxId) return;
    const tx = (state.transactions || []).find(t => t.id === window.currentFullTxId);
    if (!tx) return;

    window.openLocationPickerModal({
      currentLat: tx.lat,
      currentLng: tx.lng,
      currentAddress: tx.locationName,
      onSelect: (loc) => {
        tx.lat = loc.lat;
        tx.lng = loc.lng;
        tx.locationName = loc.address;
        if (typeof saveData === 'function') saveData();
        if (typeof openFullTxPage === 'function') openFullTxPage(window.currentFullTxId);
        if (typeof playSound === 'function') playSound("success");
      }
    });
  };

  /**
   * 8. Cho phép nhấp vào ô nhập #frm-loc-name để mở bản đồ chọn vị trí
   */
  document.addEventListener('dblclick', (e) => {
    if (e.target && e.target.id === 'frm-loc-name') {
      window.requestLocation();
    }
  });

})();
