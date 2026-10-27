// ==========================================================================
// FILE: theme-pro.js - FINMASTER APPLE iOS COLOR THEMES & COIN BURST ENGINE
// Bảng màu chuẩn Apple iOS (8 màu sắc tinh tế) & Hiệu ứng đồng tiền vàng bay vào thẻ
// ==========================================================================

(function initThemeProSystem() {
  'use strict';

  // ------------------------------------------------------------------------
  // 1. DANH SÁCH 8 CHỦ ĐỀ MÀU CHUẨN APPLE iOS
  // ------------------------------------------------------------------------
  const IOS_COLOR_THEMES = [
    {
      id: 'theme-ios-deepspace',
      name: 'Deep Space Black',
      sub: 'Titan Đen Không Gian (iPhone 16 Pro)',
      hue: '215',
      hex: '#0ea5e9',
      bgPreview: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
      accentColor: '#38bdf8'
    },
    {
      id: 'theme-ios-midnight',
      name: 'Midnight Blue',
      sub: 'Xanh Nửa Đêm Cổ Điển (iOS 18)',
      hue: '238',
      hex: '#6366f1',
      bgPreview: 'linear-gradient(135deg, #090d1e 0%, #171e3b 100%)',
      accentColor: '#818cf8'
    },
    {
      id: 'theme-ios-titanium',
      name: 'Desert Titanium',
      sub: 'Vàng Cát Sa Mạc Hoàng Gia',
      hue: '38',
      hex: '#f59e0b',
      bgPreview: 'linear-gradient(135deg, #1f1604 0%, #382909 100%)',
      accentColor: '#fbbf24'
    },
    {
      id: 'theme-ios-alpine',
      name: 'Alpine Green',
      sub: 'Xanh Rêu Đồi Núi Bắc Âu',
      hue: '155',
      hex: '#10b981',
      bgPreview: 'linear-gradient(135deg, #031c13 0%, #063826 100%)',
      accentColor: '#34d399'
    },
    {
      id: 'theme-ios-purple',
      name: 'Royal Deep Purple',
      sub: 'Tím Hoàng Gia (iPhone 14 Pro)',
      hue: '275',
      hex: '#a855f7',
      bgPreview: 'linear-gradient(135deg, #18092a 0%, #2e0d4e 100%)',
      accentColor: '#c084fc'
    },
    {
      id: 'theme-ios-sierra',
      name: 'Sierra Azure',
      sub: 'Xanh Sierra Tinh Khiết Mát Mẻ',
      hue: '205',
      hex: '#0284c7',
      bgPreview: 'linear-gradient(135deg, #041b2d 0%, #0c3656 100%)',
      accentColor: '#38bdf8'
    },
    {
      id: 'theme-ios-rosegold',
      name: 'Rose Quartz Gold',
      sub: 'Hồng Thạch Anh Pha Lê',
      hue: '330',
      hex: '#ec4899',
      bgPreview: 'linear-gradient(135deg, #240b17 0%, #44142d 100%)',
      accentColor: '#f472b6'
    },
    {
      id: 'theme-ios-silver',
      name: 'Cupertino Frost',
      sub: 'Bạch Kim Sáng Tuyết Tối Giản',
      hue: '220',
      hex: '#94a3b8',
      bgPreview: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      accentColor: '#e2e8f0'
    }
  ];

  const STATE = {
    colorTheme: localStorage.getItem('fin_ios_color_theme') || 'theme-ios-deepspace'
  };

  // ------------------------------------------------------------------------
  // 2. MÀN HÌNH LOADING CHUYỂN MÀU MƯỢT MÀ
  // ------------------------------------------------------------------------
  function showThemeTransitionLoader(themeName, callback) {
    let loader = document.getElementById('fin-theme-loader');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'fin-theme-loader';
      loader.className = 'fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xl transition-opacity duration-300 pointer-events-none opacity-0';
      loader.innerHTML = `
        <div class="flex flex-col items-center gap-3.5 p-7 rounded-3xl bg-slate-900/90 border border-white/15 shadow-2xl max-w-xs text-center animate-popIn">
          <div class="relative w-14 h-14 flex items-center justify-center">
            <div class="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
            <div class="w-14 h-14 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
            <i class="fa-solid fa-palette text-lg text-indigo-400 absolute"></i>
          </div>
          <div>
            <h4 class="font-black text-xs text-white uppercase tracking-wider">Đang Đổi Màu</h4>
            <p id="fin-theme-loader-name" class="text-xs text-indigo-300 font-semibold mt-1">Đang thiết lập giao diện...</p>
          </div>
        </div>
      `;
      document.body.appendChild(loader);
    }

    const nameEl = document.getElementById('fin-theme-loader-name');
    if (nameEl) nameEl.textContent = themeName || 'Đang áp dụng bảng màu...';

    loader.classList.remove('pointer-events-none', 'opacity-0');
    loader.classList.add('opacity-100');

    setTimeout(() => {
      if (typeof callback === 'function') callback();

      setTimeout(() => {
        loader.classList.remove('opacity-100');
        loader.classList.add('opacity-0', 'pointer-events-none');
        if (typeof window.playSound === 'function') window.playSound('success');
      }, 150);
    }, 250);
  }

  // ------------------------------------------------------------------------
  // 3. ÁP DỤNG CHỦ ĐỀ MÀU iOS
  // ------------------------------------------------------------------------
  function applyColorTheme(themeId, skipAnimation = false) {
    const item = IOS_COLOR_THEMES.find(t => t.id === themeId) || IOS_COLOR_THEMES[0];

    const execute = () => {
      // Xóa tất cả các class theme màu cũ
      IOS_COLOR_THEMES.forEach(t => document.body.classList.remove(t.id));
      document.body.classList.remove(
        'theme-red', 'theme-green', 'theme-orange', 'theme-pink', 'theme-cyan', 
        'theme-purple', 'theme-neon', 'theme-ocean', 'theme-sunset', 'theme-lavender', 
        'theme-rosegold', 'theme-emerald', 'adv-banking', 'adv-gamerpg', 'adv-three3d', 'adv-standard'
      );

      // Gắn class theme mới và đổi hue
      document.body.classList.add(item.id);
      document.documentElement.style.setProperty('--primary-hue', item.hue);

      STATE.colorTheme = item.id;
      localStorage.setItem('fin_ios_color_theme', item.id);
      if (window.state) window.state.currentTheme = item.id;

      if (typeof window.renderDashboard === 'function' && window.state?.currentView === 'dashboard') {
        window.renderDashboard();
      }
    };

    if (skipAnimation) {
      execute();
    } else {
      showThemeTransitionLoader(`Bảng Màu: ${item.name}`, execute);
    }
  }

  // ------------------------------------------------------------------------
  // 4. HIỆU ỨNG ĐỒNG TIỀN VÀNG BAY VÀO THẺ (COIN BURST ANIMATION)
  // ------------------------------------------------------------------------
  function triggerCoinBurstAnimation(sourceX, sourceY) {
    if (typeof window.playSound === 'function') window.playSound('coin');

    const startX = sourceX || (window.innerWidth / 2);
    const startY = sourceY || (window.innerHeight * 0.7);
    const targetEl = document.querySelector('#dash-hero-balance, #mobile-bottom-bar, #header-balance');
    let targetX = window.innerWidth / 2;
    let targetY = 160;

    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      targetX = rect.left + rect.width / 2;
      targetY = rect.top + rect.height / 2;
    }

    const coinCount = 16;
    for (let i = 0; i < coinCount; i++) {
      const coin = document.createElement('div');
      coin.className = 'fin-flying-coin';
      coin.innerHTML = '<i class="fa-solid fa-coins text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.95)]"></i>';
      coin.style.left = `${startX}px`;
      coin.style.top = `${startY}px`;
      document.body.appendChild(coin);

      const angle = (Math.PI * 2 / coinCount) * i;
      const spread = 70 + Math.random() * 80;
      const midX = startX + Math.cos(angle) * spread;
      const midY = startY + Math.sin(angle) * spread - 45;

      const delay = i * 22;
      setTimeout(() => {
        coin.animate([
          { transform: 'translate(0, 0) scale(0.6)', opacity: 0 },
          { transform: `translate(${midX - startX}px, ${midY - startY}px) scale(1.35)`, opacity: 1, offset: 0.35 },
          { transform: `translate(${targetX - startX}px, ${targetY - startY}px) scale(0.35)`, opacity: 0 }
        ], {
          duration: 650,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'forwards'
        }).onfinish = () => {
          coin.remove();
        };
      }, delay);
    }
  }

  // Hook submit form thêm giao dịch tự động bắn xu
  document.addEventListener('submit', (e) => {
    setTimeout(() => {
      triggerCoinBurstAnimation();
    }, 200);
  });

  window.triggerCoinBurstAnimation = triggerCoinBurstAnimation;

  // ------------------------------------------------------------------------
  // 5. CUNG CẤP API TOÀN CỤC CHO THEME ENGINE
  // ------------------------------------------------------------------------
  window.FinTheme = {
    getColorThemes: () => IOS_COLOR_THEMES,
    getAdvancedThemes: () => [],
    getState: () => ({ ...STATE }),
    setColorTheme: (id) => applyColorTheme(id),
    setAdvancedTheme: () => {},
    triggerCoinBurst: triggerCoinBurstAnimation
  };

  // Khởi động khi tải trang
  document.addEventListener('DOMContentLoaded', () => {
    applyColorTheme(STATE.colorTheme, true);
  });

  console.log('[FinMaster Theme Pro Engine] Đã kích hoạt 8 bảng màu chuẩn Apple iOS & Hiệu ứng đồng tiền bay.');
})();
