// ==============================================================
// FILE: offline-sync.js - FINMASTER OFFLINE & PWA ENGINE (V1.0)
// Giám Sát Kết Nối, Lưu Trữ Cục Bộ & Tự Động Đồng Bộ Khi Có Mạng
// ==============================================================

(function initOfflineSync() {

  let deferredPrompt = null;

  // Lắng nghe sự kiện PWA Install (Thêm vào Màn hình chính)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = document.getElementById('btn-pwa-install');
    if (btn) btn.classList.remove('hidden');
  });

  window.installPWAApp = function() {
    if (!deferredPrompt) {
      alert("💡 Ứng dụng đã được cài đặt hoặc trình duyệt của bạn hỗ trợ cài trực tiếp từ thanh địa chỉ (Icon Cài Đặt)!");
      return;
    }
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install prompt');
      }
      deferredPrompt = null;
    });
  };

  // Toast thông báo trạng thái mạng
  function showNetworkToast(isOnline) {
    let toast = document.getElementById('network-status-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'network-status-toast';
      toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-[10001] px-4 py-2.5 rounded-2xl text-xs font-black shadow-2xl flex items-center gap-2 transition-all duration-300 pointer-events-none';
      document.body.appendChild(toast);
    }

    if (isOnline) {
      toast.style.background = 'linear-gradient(135deg, #064e3b, #059669)';
      toast.style.color = '#ffffff';
      toast.style.border = '1px solid rgba(16, 185, 129, 0.4)';
      toast.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span> 🟢 Đã khôi phục Internet! Đang đồng bộ dữ liệu...`;
      if (typeof playSound === 'function') playSound("success");
    } else {
      toast.style.background = 'linear-gradient(135deg, #451a03, #d97706)';
      toast.style.color = '#ffffff';
      toast.style.border = '1px solid rgba(245, 158, 11, 0.4)';
      toast.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-300"></span> 📴 Chế độ Ngoại tuyến: Dữ liệu đang được lưu an toàn trên máy!`;
      if (typeof playSound === 'function') playSound("pop");
    }

    toast.style.opacity = '1';
    toast.style.transform = 'translate(-50%, 0)';

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, -10px)';
    }, 4500);
  }

  // Cập nhật huy hiệu trạng thái trên Header
  function updateHeaderNetworkBadge() {
    const isOnline = navigator.onLine;
    const badges = document.querySelectorAll('.header-network-status-badge');
    badges.forEach(b => {
      if (isOnline) {
        b.className = 'header-network-status-badge hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
        b.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Trực tiếp`;
      } else {
        b.className = 'header-network-status-badge inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40';
        b.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400"></span> Ngoại tuyến (Offline)`;
      }
    });
  }

  // Quản lý hàng đợi đồng bộ ngoại tuyến (Offline Sync Queue)
  window.queueOfflineAction = function(actionType, payload) {
    if (!state.offlineQueue) state.offlineQueue = [];
    state.offlineQueue.push({
      action: actionType,
      payload: payload,
      timestamp: Date.now()
    });
    if (typeof saveData === 'function') saveData();
    console.log(`[Offline Sync] Đã lưu tác vụ '${actionType}' vào hàng đợi ngoại tuyến (${state.offlineQueue.length} tác vụ).`);
  };

  // Tự động đẩy hàng đợi lên đám mây khi có mạng trở lại
  window.flushOfflineQueue = async function() {
    if (!navigator.onLine || !state.offlineQueue || state.offlineQueue.length === 0) return;
    console.log(`[Offline Sync] Đang đồng bộ ${state.offlineQueue.length} tác vụ ngoại tuyến lên máy chủ...`);

    const queue = [...state.offlineQueue];
    state.offlineQueue = [];
    if (typeof saveData === 'function') saveData();

    for (const item of queue) {
      try {
        if (typeof syncToGoogle === 'function') {
          await syncToGoogle(item.action, item.payload);
        }
      } catch (err) {
        console.warn("[Offline Sync] Lỗi đẩy tác vụ:", item, err);
        // Nếu lỗi, đưa lại vào hàng đợi
        state.offlineQueue.push(item);
      }
    }
  };

  // Hook vào hàm syncToGoogle để bảo vệ khi mất mạng
  const origSyncToGoogle = window.syncToGoogle;
  if (typeof origSyncToGoogle === 'function') {
    window.syncToGoogle = async function(action, payload) {
      if (!navigator.onLine) {
        window.queueOfflineAction(action, payload);
        return { success: true, offline: true };
      }
      try {
        return await origSyncToGoogle(action, payload);
      } catch (err) {
        console.warn("[Sync] Mất kết nối, tự động chuyển vào hàng đợi ngoại tuyến:", err);
        window.queueOfflineAction(action, payload);
        return { success: true, offline: true };
      }
    };
  }

  // Lắng nghe sự kiện Online / Offline của trình duyệt
  window.addEventListener('online', () => {
    updateHeaderNetworkBadge();
    showNetworkToast(true);
    window.flushOfflineQueue();
  });

  window.addEventListener('offline', () => {
    updateHeaderNetworkBadge();
    showNetworkToast(false);
  });

  // Khởi tạo ban đầu
  window.addEventListener('DOMContentLoaded', () => {
    updateHeaderNetworkBadge();
  });

  // Hỗ trợ kiểm tra trạng thái Cache Storage trong Cài Đặt
  window.renderOfflineSettingsCard = function() {
    const cont = document.getElementById('offline-settings-container');
    if (!cont) return;

    const isOnline = navigator.onLine;
    cont.innerHTML = `
      <div class="p-5 rounded-3xl custom-bg-card border custom-border space-y-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center text-lg border border-indigo-500/20">
              <i class="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <div>
              <h4 class="font-bold text-sm custom-text">Chế Độ Ngoại Tuyến & PWA</h4>
              <p class="text-[11px] custom-text-secondary">Sử dụng không cần mạng, dữ liệu tự động lưu máy</p>
            </div>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-bold ${isOnline ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}">
            ${isOnline ? '🟢 Đang Online' : '📴 Đang Offline'}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-3 pt-1">
          <button onclick="installPWAApp()" id="btn-pwa-install" class="py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 active:scale-95 transition-all">
            <i class="fa-solid fa-download"></i> Cài Đặt Ứng Dụng
          </button>
          <button onclick="updateOfflineCacheNow()" class="py-2.5 px-3 rounded-xl custom-bg-input border custom-border custom-text font-bold text-xs flex items-center justify-center gap-2 hover:border-indigo-400 active:scale-95 transition-all">
            <i class="fa-solid fa-rotate"></i> Cập Nhật Cache
          </button>
        </div>
      </div>
    `;
  };

  window.updateOfflineCacheNow = async function() {
    if ('serviceWorker' in navigator) {
      if (typeof playSound === 'function') playSound("pop");
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (let reg of regs) {
          await reg.update();
        }
        alert("✅ Đã kiểm tra và đồng bộ gói giao diện ngoại tuyến mới nhất!");
        if (typeof confetti === 'function') confetti({ particleCount: 40, spread: 50 });
      } catch (e) {
        alert("💡 Gói dữ liệu ngoại tuyến hiện tại đã sẵn sàng để sử dụng!");
      }
    }
  };

  // Đồng bộ hoàn tất
  console.log('[FinMaster Offline] Hệ thống sẵn sàng hoạt động ngoại tuyến 100%.');

})();
