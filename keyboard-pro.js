// ==========================================================================
// FILE: keyboard-pro.js - FINMASTER ULTRA-LUXURY CUSTOM VIRTUAL KEYBOARD
// Bàn phím ảo độc quyền thay thế hoàn toàn bàn phím mặc định của thiết bị.
// Hỗ trợ: Đa chủ đề siêu đẹp, Âm thanh cơ học (Web Audio), Họa tiết sang trọng,
// Bàn phím số & Máy tính tài chính thông minh, QWERTY tiếng Việt, Toàn hệ thống.
// ==========================================================================

(function initFinMasterKeyboard() {
  'use strict';

  // ------------------------------------------------------------------------
  // 1. CẤU HÌNH & TRẠNG THÁI HỆ THỐNG BÀN PHÍM
  // ------------------------------------------------------------------------
  const THEMES = [
    {
      id: 'obsidian',
      name: 'Obsidian Cyber',
      icon: 'fa-gem',
      desc: 'Bóng đêm huyền bí, viền ánh sapphire',
      bgPreview: 'linear-gradient(135deg, #090d16 0%, #111827 100%)',
      accentColor: '#38bdf8'
    },
    {
      id: 'neon-cyber',
      name: 'Neon Cyberpunk',
      icon: 'fa-bolt',
      desc: 'Rực rỡ sắc tím magenta & neon cyan',
      bgPreview: 'linear-gradient(135deg, #180926 0%, #2e0854 100%)',
      accentColor: '#ec4899'
    },
    {
      id: 'ios-glass',
      name: 'Frosted Glass',
      icon: 'fa-apple-whole',
      desc: 'Kính mờ bạch kim tối giản sang trọng',
      bgPreview: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(200,200,200,0.05) 100%)',
      accentColor: '#ffffff'
    },
    {
      id: 'sunset-gold',
      name: 'Imperial Gold',
      icon: 'fa-crown',
      desc: 'Hoàng gia kim tiền, vượng tài lộc',
      bgPreview: 'linear-gradient(135deg, #1c1503 0%, #3d2c06 100%)',
      accentColor: '#fbbf24'
    },
    {
      id: 'emerald-royal',
      name: 'Emerald Fortune',
      icon: 'fa-clover',
      desc: 'Ngọc lục bảo sinh tài & xanh mint',
      bgPreview: 'linear-gradient(135deg, #031c13 0%, #063826 100%)',
      accentColor: '#34d399'
    },
    {
      id: 'sakura-rose',
      name: 'Sakura Quartz',
      icon: 'fa-heart',
      desc: 'Hồng thạch anh pha lê thanh nhã',
      bgPreview: 'linear-gradient(135deg, #240b17 0%, #44142d 100%)',
      accentColor: '#f472b6'
    },
    {
      id: 'cosmic-aurora',
      name: 'Cosmic Aurora',
      icon: 'fa-wand-magic-sparkles',
      desc: 'Cực quang chuyển sắc đa chiều',
      bgPreview: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #064e3b 100%)',
      accentColor: '#a78bfa'
    }
  ];

  const STATE = {
    isOpen: false,
    activeInput: null,
    currentMode: 'numeric', // 'numeric' | 'qwerty' | 'symbols'
    capsLock: false,
    theme: localStorage.getItem('fin_kb_theme') || 'obsidian',
    soundEnabled: localStorage.getItem('fin_kb_sound') !== 'false',
    soundProfile: localStorage.getItem('fin_kb_sound_type') || 'mech', // 'mech' | 'bubble'
    hapticEnabled: true,
    customKeyboardEnabled: localStorage.getItem('fin_kb_enabled') !== 'false',
    calculatorBuffer: '',
    isEvaluatingMath: false
  };

  // Quick Vietnamese diacritics
  const VN_ACCENTS = ['á', 'à', 'ả', 'ã', 'ạ', 'ă', 'ắ', 'ằ', 'ẳ', 'ẵ', 'ặ', 'â', 'ấ', 'ầ', 'ẩ', 'ẫ', 'ậ', 'đ', 'é', 'è', 'ẻ', 'ẽ', 'ẹ', 'ê', 'ế', 'ề', 'ể', 'ễ', 'ệ', 'í', 'ì', 'ỉ', 'ĩ', 'ị', 'ó', 'ò', 'ỏ', 'õ', 'ọ', 'ô', 'ố', 'ồ', 'ổ', 'ỗ', 'ộ', 'ơ', 'ớ', 'ờ', 'ở', 'ỡ', 'ợ', 'ú', 'ù', 'ủ', 'ũ', 'ụ', 'ư', 'ứ', 'ừ', 'ử', 'ữ', 'ự', 'ý', 'ỳ', 'ỷ', 'ỹ', 'ỵ'];
  const QUICK_PHRASES = ['Ăn uống', 'Cà phê', 'Đi chợ', 'Xăng xe', 'Lương', 'Thuê nhà', 'Mua sắm', 'Tiền điện', 'Tiết kiệm'];

  // ------------------------------------------------------------------------
  // 2. BỘ TỔNG HỢP ÂM THANH CƠ HỌC (WEB AUDIO API SYNTHESIZER)
  // Không cần tải file mp3 bên ngoài, độ trễ 0ms cực nhạy và chân thực
  // ------------------------------------------------------------------------
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playKeySound(type = 'normal') {
    if (!STATE.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (STATE.soundProfile === 'bubble') {
        // Âm bong bóng pop hiện đại
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(840, now + 0.04);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
        return;
      }

      // Âm bàn phím cơ tactile click (Cherry MX Blue / Brown)
      if (type === 'action' || type === 'enter') {
        // Âm hoàn thành / enter: chime ấm áp
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'triangle';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc2.frequency.setValueAtTime(659.25, now); // E5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.12);
        osc2.stop(now + 0.12);
      } else if (type === 'backspace') {
        // Âm xóa: tiếng thud trầm tactile
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.04);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      } else {
        // Tiếng click phím tiêu chuẩn (Snap cao tần + click nhẹ)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.025);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.03);
      }
    } catch (e) {
      // Bỏ qua lỗi audio policy
    }
  }

  function triggerHaptic() {
    if (STATE.hapticEnabled && navigator.vibrate) {
      try {
        navigator.vibrate(10);
      } catch (e) {}
    }
  }

  // ------------------------------------------------------------------------
  // 3. XÂY DỰNG GIAO DIỆN BÀN PHÍM (DOM INJECTION)
  // ------------------------------------------------------------------------
  function createKeyboardDOM() {
    if (document.getElementById('fin-virtual-keyboard')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'fin-virtual-keyboard';
    wrapper.className = `fin-keyboard-container kb-theme-${STATE.theme} closed`;
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', 'FinMaster Virtual Keyboard');

    wrapper.innerHTML = `
      <!-- LỚP HỌA TIẾT & HIỆU ỨNG ÁNH SÁNG NỀN (TEXTURE MESH) -->
      <div class="fin-kb-mesh-pattern"></div>
      <div class="fin-kb-glow-orb"></div>

      <!-- THANH ĐIỀU KHIỂN TRÊN CÙNG (DOCK TOOLBAR) -->
      <div class="fin-kb-header">
        <!-- DRAG / MINIMIZE HANDLE -->
        <div class="fin-kb-handle-bar">
          <span class="fin-kb-pill-handle"></span>
        </div>

        <div class="fin-kb-toolbar">
          <!-- BÊN TRÁI: CHUYỂN CHẾ ĐỘ SỐ / CHỮ -->
          <div class="fin-kb-mode-switch">
            <button type="button" class="fin-kb-btn-mode active" data-mode="numeric" id="fin-kb-btn-mode-num">
              <i class="fa-solid fa-calculator"></i>
              <span>123 Số</span>
            </button>
            <button type="button" class="fin-kb-btn-mode" data-mode="qwerty" id="fin-kb-btn-mode-text">
              <i class="fa-solid fa-font"></i>
              <span>ABC Chữ</span>
            </button>
          </div>

          <!-- Ở GIỮA: PREVIEW NHÃN INPUT ĐANG NHẬP -->
          <div class="fin-kb-input-preview" id="fin-kb-preview-box">
            <span class="fin-kb-preview-icon"><i class="fa-solid fa-pen-to-square"></i></span>
            <span class="fin-kb-preview-label" id="fin-kb-preview-name">Đang nhập</span>
            <span class="fin-kb-preview-cursor">|</span>
          </div>

          <!-- BÊN PHẢI: TIỆN ÍCH (ÂM THANH, CON TRỎ, CHỦ ĐỀ, ĐÓNG) -->
          <div class="fin-kb-tools">
            <button type="button" class="fin-kb-tool-btn" id="fin-kb-btn-cursor-left" title="Dời con trỏ sang trái">
              <i class="fa-solid fa-arrow-left"></i>
            </button>
            <button type="button" class="fin-kb-tool-btn" id="fin-kb-btn-cursor-right" title="Dời con trỏ sang phải">
              <i class="fa-solid fa-arrow-right"></i>
            </button>
            <button type="button" class="fin-kb-tool-btn ${STATE.soundEnabled ? 'active' : ''}" id="fin-kb-btn-sound" title="Bật/Tắt âm phím">
              <i class="fa-solid ${STATE.soundEnabled ? 'fa-volume-high' : 'fa-volume-xmark'}"></i>
            </button>
            <button type="button" class="fin-kb-tool-btn highlight" id="fin-kb-btn-theme" title="Đổi giao diện bàn phím">
              <i class="fa-solid fa-palette"></i>
            </button>
            <button type="button" class="fin-kb-tool-btn close-btn" id="fin-kb-btn-close" title="Ẩn bàn phím">
              <i class="fa-solid fa-chevron-down"></i>
            </button>
          </div>
        </div>

        <!-- THANH PHỤ TRỢ (PRESETS TIỀN TỆ KHI Ở SỐ / DẤU TIẾNG VIỆT KHI Ở CHỮ) -->
        <div class="fin-kb-subbar" id="fin-kb-subbar">
          <!-- Render động bên dưới -->
        </div>
      </div>

      <!-- KHUNG BẢNG PHÍM NỘI DUNG (KEYPAD CONTENT) -->
      <div class="fin-kb-body" id="fin-kb-body">
        <!-- Render bảng phím tương ứng -->
      </div>

      <!-- POPUP CHỌN CHỦ ĐỀ BÀN PHÍM SIÊU ĐẸP -->
      <div class="fin-kb-theme-drawer hidden" id="fin-kb-theme-drawer">
        <div class="fin-kb-theme-header">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-palette text-amber-400"></i>
            <span class="font-black text-sm uppercase tracking-wider text-white">Chủ Đề Bàn Phím FinMaster</span>
          </div>
          <button type="button" class="fin-kb-theme-close" id="fin-kb-theme-close-btn">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="fin-kb-theme-grid" id="fin-kb-theme-grid">
          <!-- Render danh sách theme -->
        </div>
      </div>

      <!-- KEY POP BUBBLE PREVIEW (HIỆU ỨNG PHÓNG TO KÝ TỰ KHI BẤM) -->
      <div class="fin-kb-pop-bubble" id="fin-kb-pop-bubble">A</div>
    `;

    document.body.appendChild(wrapper);
    bindKeyboardEvents();
    renderThemeGrid();
    renderKeypad();
    renderSubbar();
  }

  // ------------------------------------------------------------------------
  // 4. RENDER CÁC LOẠI BẢNG PHÍM (NUMERIC & QWERTY & SUB-BAR)
  // ------------------------------------------------------------------------
  function renderSubbar() {
    const subbar = document.getElementById('fin-kb-subbar');
    if (!subbar) return;

    if (STATE.currentMode === 'numeric') {
      // Dải nút cộng tiền nhanh phong cách Fintech
      subbar.innerHTML = `
        <div class="fin-kb-chip-list">
          <button type="button" class="fin-kb-chip" data-amt="50000">+50k</button>
          <button type="button" class="fin-kb-chip" data-amt="100000">+100k</button>
          <button type="button" class="fin-kb-chip" data-amt="200000">+200k</button>
          <button type="button" class="fin-kb-chip" data-amt="500000">+500k</button>
          <button type="button" class="fin-kb-chip" data-amt="1000000">+1Tr</button>
          <button type="button" class="fin-kb-chip" data-amt="5000000">+5Tr</button>
          <button type="button" class="fin-kb-chip special-calc" data-action="math-parentheses" title="Ngoặc tính toán">( )</button>
          <button type="button" class="fin-kb-chip clear-chip" data-action="clear-all">
            <i class="fa-solid fa-rotate-left text-[10px]"></i> Xóa
          </button>
        </div>
      `;
    } else {
      // Dải thanh dấu tiếng Việt & cụm từ gợi ý nhanh
      let accentsHtml = VN_ACCENTS.map(acc => `
        <button type="button" class="fin-kb-chip vn-accent-chip" data-char="${acc}">${acc}</button>
      `).join('');

      let phrasesHtml = QUICK_PHRASES.map(p => `
        <button type="button" class="fin-kb-chip phrase-chip" data-phrase="${p}">${p}</button>
      `).join('');

      subbar.innerHTML = `
        <div class="fin-kb-chip-list">
          <span class="text-[10px] uppercase font-bold text-slate-400 self-center pl-1 whitespace-nowrap">Dấu:</span>
          ${accentsHtml}
          <span class="text-[10px] uppercase font-bold text-slate-400 self-center pl-2 whitespace-nowrap">Gợi ý:</span>
          ${phrasesHtml}
        </div>
      `;
    }

    // Gắn sự kiện cho các chips
    subbar.querySelectorAll('.fin-kb-chip').forEach(btn => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerHaptic();
        playKeySound('normal');

        if (btn.dataset.amt) {
          addPresetAmount(parseInt(btn.dataset.amt, 10));
        } else if (btn.dataset.char) {
          insertText(btn.dataset.char);
        } else if (btn.dataset.phrase) {
          insertText(btn.dataset.phrase + ' ');
        } else if (btn.dataset.action === 'clear-all') {
          clearActiveInput();
        } else if (btn.dataset.action === 'math-parentheses') {
          handleParentheses();
        }
      });
    });
  }

  function renderKeypad() {
    const body = document.getElementById('fin-kb-body');
    if (!body) return;

    if (STATE.currentMode === 'numeric') {
      // BÀN PHÍM SỐ & MÁY TÍNH TÀI CHÍNH THÔNG MINH
      body.innerHTML = `
        <div class="fin-kb-numpad-grid">
          <!-- HÀNG 1 -->
          <button type="button" class="fin-key num-key" data-key="7">7</button>
          <button type="button" class="fin-key num-key" data-key="8">8</button>
          <button type="button" class="fin-key num-key" data-key="9">9</button>
          <button type="button" class="fin-key op-key" data-op="÷" title="Chia">÷</button>
          <button type="button" class="fin-key func-key action-clear" data-action="clear" title="Xóa toàn bộ">C</button>

          <!-- HÀNG 2 -->
          <button type="button" class="fin-key num-key" data-key="4">4</button>
          <button type="button" class="fin-key num-key" data-key="5">5</button>
          <button type="button" class="fin-key num-key" data-key="6">6</button>
          <button type="button" class="fin-key op-key" data-op="×" title="Nhân">×</button>
          <button type="button" class="fin-key func-key action-backspace" data-action="backspace" title="Xóa ký tự">
            <i class="fa-solid fa-delete-left"></i>
          </button>

          <!-- HÀNG 3 -->
          <button type="button" class="fin-key num-key" data-key="1">1</button>
          <button type="button" class="fin-key num-key" data-key="2">2</button>
          <button type="button" class="fin-key num-key" data-key="3">3</button>
          <button type="button" class="fin-key op-key" data-op="-" title="Trừ">-</button>
          <button type="button" class="fin-key op-key eq-key" data-action="evaluate" title="Tính kết quả">=</button>

          <!-- HÀNG 4 -->
          <button type="button" class="fin-key num-key" data-key="0">0</button>
          <button type="button" class="fin-key num-key special" data-key="000">000</button>
          <button type="button" class="fin-key num-key special" data-key=".">.</button>
          <button type="button" class="fin-key op-key" data-op="+" title="Cộng">+</button>
          <button type="button" class="fin-key enter-key" data-action="done" title="Xong & Xác nhận">
            <i class="fa-solid fa-check"></i>
            <span>Xong</span>
          </button>
        </div>
      `;
    } else if (STATE.currentMode === 'qwerty') {
      // BÀN PHÍM CHỮ QWERTY ĐẦY ĐỦ
      const isCap = STATE.capsLock;
      const row1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
      const row2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
      const row3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];

      body.innerHTML = `
        <div class="fin-kb-qwerty-grid">
          <!-- HÀNG 1 -->
          <div class="fin-kb-row">
            ${row1.map(k => `<button type="button" class="fin-key char-key" data-char="${isCap ? k.toUpperCase() : k}">${isCap ? k.toUpperCase() : k}</button>`).join('')}
          </div>

          <!-- HÀNG 2 -->
          <div class="fin-kb-row row-indent">
            ${row2.map(k => `<button type="button" class="fin-key char-key" data-char="${isCap ? k.toUpperCase() : k}">${isCap ? k.toUpperCase() : k}</button>`).join('')}
          </div>

          <!-- HÀNG 3 -->
          <div class="fin-kb-row">
            <button type="button" class="fin-key func-key shift-key ${isCap ? 'active' : ''}" data-action="shift" title="Shift / Viết hoa">
              <i class="fa-solid fa-arrow-up"></i>
            </button>
            ${row3.map(k => `<button type="button" class="fin-key char-key" data-char="${isCap ? k.toUpperCase() : k}">${isCap ? k.toUpperCase() : k}</button>`).join('')}
            <button type="button" class="fin-key func-key action-backspace" data-action="backspace" title="Xóa ký tự">
              <i class="fa-solid fa-delete-left"></i>
            </button>
          </div>

          <!-- HÀNG 4 (ĐIỀU HƯỚNG & DẤU CÁCH) -->
          <div class="fin-kb-row bottom-row">
            <button type="button" class="fin-key switch-key" data-action="switch-symbols">#+=</button>
            <button type="button" class="fin-key special-char-key" data-char=",">,</button>
            <button type="button" class="fin-key space-key" data-action="space">Dấu cách</button>
            <button type="button" class="fin-key special-char-key" data-char=".">.</button>
            <button type="button" class="fin-key enter-key" data-action="done" title="Xong & Gửi">
              <i class="fa-solid fa-arrow-turn-down fa-rotate-90"></i>
              <span>Nhập</span>
            </button>
          </div>
        </div>
      `;
    } else if (STATE.currentMode === 'symbols') {
      // BÀN PHÍM KÝ TỰ ĐẶC BIỆT (#+=)
      const symRow1 = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
      const symRow2 = ['@', '#', '$', '%', '&', '*', '-', '+', '(', ')'];
      const symRow3 = ['!', '"', "'", ':', ';', '/', '?', '~', '='];

      body.innerHTML = `
        <div class="fin-kb-qwerty-grid">
          <div class="fin-kb-row">
            ${symRow1.map(k => `<button type="button" class="fin-key char-key" data-char="${k}">${k}</button>`).join('')}
          </div>
          <div class="fin-kb-row">
            ${symRow2.map(k => `<button type="button" class="fin-key char-key" data-char="${k}">${k}</button>`).join('')}
          </div>
          <div class="fin-kb-row">
            <button type="button" class="fin-key switch-key" data-action="switch-qwerty">ABC</button>
            ${symRow3.map(k => `<button type="button" class="fin-key char-key" data-char="${k}">${k}</button>`).join('')}
            <button type="button" class="fin-key func-key action-backspace" data-action="backspace" title="Xóa">
              <i class="fa-solid fa-delete-left"></i>
            </button>
          </div>
          <div class="fin-kb-row bottom-row">
            <button type="button" class="fin-key switch-key" data-action="switch-numeric">123</button>
            <button type="button" class="fin-key special-char-key" data-char="<">&lt;</button>
            <button type="button" class="fin-key space-key" data-action="space">Dấu cách</button>
            <button type="button" class="fin-key special-char-key" data-char=">">&gt;</button>
            <button type="button" class="fin-key enter-key" data-action="done">
              <i class="fa-solid fa-check"></i>
              <span>Xong</span>
            </button>
          </div>
        </div>
      `;
    }

    // Gắn sự kiện click / tap lên các phím
    attachKeyEvents();
  }

  function renderThemeGrid() {
    const grid = document.getElementById('fin-kb-theme-grid');
    if (!grid) return;

    grid.innerHTML = THEMES.map(t => {
      const isSelected = STATE.theme === t.id;
      return `
        <div class="fin-kb-theme-card ${isSelected ? 'selected' : ''}" data-theme-id="${t.id}">
          <div class="fin-kb-theme-preview" style="background: ${t.bgPreview}; border-color: ${t.accentColor};">
            <i class="fa-solid ${t.icon}" style="color: ${t.accentColor};"></i>
            ${isSelected ? '<span class="fin-kb-theme-check"><i class="fa-solid fa-circle-check"></i></span>' : ''}
          </div>
          <div class="fin-kb-theme-info">
            <div class="fin-kb-theme-name" style="${isSelected ? `color: ${t.accentColor}; font-weight: 800;` : ''}">${t.name}</div>
            <div class="fin-kb-theme-desc">${t.desc}</div>
          </div>
        </div>
      `;
    }).join('');

    // Sự kiện chọn theme
    grid.querySelectorAll('.fin-kb-theme-card').forEach(card => {
      card.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerHaptic();
        playKeySound('action');

        const themeId = card.dataset.themeId;
        applyTheme(themeId);
        renderThemeGrid();
      });
    });
  }

  // ------------------------------------------------------------------------
  // 5. LOGIC XỬ LÝ PHÍM & THAO TÁC TRÊN INPUT ĐANG ACTIVE
  // ------------------------------------------------------------------------
  function attachKeyEvents() {
    const body = document.getElementById('fin-kb-body');
    if (!body) return;

    body.querySelectorAll('.fin-key').forEach(keyEl => {
      // Pointer down xử lý nhanh hơn click thông thường, loại bỏ 300ms delay trên mobile
      keyEl.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();

        triggerHaptic();
        showKeyPopBubble(keyEl);

        // Xử lý các loại phím
        if (keyEl.dataset.key) {
          playKeySound('normal');
          insertText(keyEl.dataset.key);
        } else if (keyEl.dataset.char) {
          playKeySound('normal');
          insertText(keyEl.dataset.char);
        } else if (keyEl.dataset.op) {
          playKeySound('normal');
          handleMathOperator(keyEl.dataset.op);
        } else if (keyEl.dataset.action) {
          handleActionKey(keyEl.dataset.action);
        }
      });
    });
  }

  function showKeyPopBubble(keyEl) {
    const bubble = document.getElementById('fin-kb-pop-bubble');
    if (!bubble) return;

    const char = keyEl.dataset.key || keyEl.dataset.char || keyEl.innerText.trim();
    if (!char || char.length > 3) return;

    const rect = keyEl.getBoundingClientRect();
    bubble.textContent = char;
    bubble.style.left = `${rect.left + rect.width / 2}px`;
    bubble.style.top = `${rect.top - 20}px`;
    bubble.classList.add('visible');

    setTimeout(() => {
      bubble.classList.remove('visible');
    }, 180);
  }

  function handleActionKey(action) {
    switch (action) {
      case 'backspace':
        playKeySound('backspace');
        handleBackspace();
        break;
      case 'clear':
        playKeySound('backspace');
        clearActiveInput();
        break;
      case 'evaluate':
        playKeySound('action');
        evaluateCurrentMath();
        break;
      case 'done':
        playKeySound('action');
        finishEditing();
        break;
      case 'shift':
        playKeySound('normal');
        STATE.capsLock = !STATE.capsLock;
        renderKeypad();
        break;
      case 'space':
        playKeySound('normal');
        insertText(' ');
        break;
      case 'switch-symbols':
        playKeySound('normal');
        STATE.currentMode = 'symbols';
        updateModeButtons();
        renderKeypad();
        renderSubbar();
        break;
      case 'switch-qwerty':
        playKeySound('normal');
        STATE.currentMode = 'qwerty';
        updateModeButtons();
        renderKeypad();
        renderSubbar();
        break;
      case 'switch-numeric':
        playKeySound('normal');
        STATE.currentMode = 'numeric';
        updateModeButtons();
        renderKeypad();
        renderSubbar();
        break;
      default:
        break;
    }
  }

  function getActiveInput() {
    if (STATE.activeInput && document.body.contains(STATE.activeInput)) {
      return STATE.activeInput;
    }
    // Fallback nếu chưa lưu
    const el = document.activeElement;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
      return el;
    }
    return null;
  }

  function insertText(text) {
    const input = getActiveInput();
    if (!input) return;

    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const val = input.value || '';

    const newVal = val.slice(0, start) + text + val.slice(end);
    input.value = newVal;

    const newPos = start + text.length;
    try {
      input.setSelectionRange(newPos, newPos);
    } catch (e) {}

    dispatchChangeEvents(input);
    updatePreviewBox();
  }

  function handleBackspace() {
    const input = getActiveInput();
    if (!input) return;

    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const val = input.value || '';

    if (start === end) {
      if (start > 0) {
        input.value = val.slice(0, start - 1) + val.slice(end);
        const newPos = start - 1;
        try {
          input.setSelectionRange(newPos, newPos);
        } catch (e) {}
      }
    } else {
      input.value = val.slice(0, start) + val.slice(end);
      try {
        input.setSelectionRange(start, start);
      } catch (e) {}
    }

    dispatchChangeEvents(input);
    updatePreviewBox();
  }

  function clearActiveInput() {
    const input = getActiveInput();
    if (!input) return;
    input.value = '';
    dispatchChangeEvents(input);
    updatePreviewBox();
  }

  function handleMathOperator(op) {
    const input = getActiveInput();
    if (!input) return;

    let displayOp = ` ${op} `;
    insertText(displayOp);
  }

  function handleParentheses() {
    const input = getActiveInput();
    if (!input) return;

    const val = input.value || '';
    const openCount = (val.match(/\(/g) || []).length;
    const closeCount = (val.match(/\)/g) || []).length;

    if (openCount > closeCount) {
      insertText(')');
    } else {
      insertText('(');
    }
  }

  function evaluateCurrentMath() {
    const input = getActiveInput();
    if (!input) return;

    let expr = input.value || '';
    if (!expr) return;

    // Chuẩn hóa biểu thức toán học: thay × thành *, ÷ thành /, bỏ dấu chấm phân tách hàng nghìn
    // Nếu trong chuỗi có định dạng tiền tệ như "100.000 + 50.000"
    let cleanExpr = expr
      .replace(/\./g, '')
      .replace(/,/g, '.')
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/[^\d+\-*/().]/g, '');

    try {
      // Đánh giá phép toán an toàn
      // Sử dụng Function tạo sandbox toán học cơ bản
      if (!cleanExpr || !/[+\-*/]/.test(cleanExpr)) return;

      const result = new Function(`'use strict'; return (${cleanExpr});`)();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        const rounded = Math.round(result * 100) / 100;

        // Nếu là input số tiền thì format theo chuẩn vi-VN
        if (isAmountInput(input)) {
          input.value = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        } else {
          input.value = rounded.toString();
        }

        dispatchChangeEvents(input);
        updatePreviewBox();

        // Hiệu ứng nhấp nháy thành công
        const previewBox = document.getElementById('fin-kb-preview-box');
        if (previewBox) {
          previewBox.classList.add('calc-success');
          setTimeout(() => previewBox.classList.remove('calc-success'), 600);
        }
      }
    } catch (e) {
      console.warn('[FinMaster KB] Không thể tính toán biểu thức:', cleanExpr, e);
    }
  }

  function addPresetAmount(amt) {
    const input = getActiveInput();
    if (!input) return;

    // Lấy số hiện tại từ input
    let curVal = 0;
    if (typeof window.getRawNumber === 'function') {
      curVal = window.getRawNumber(input.value) || 0;
    } else {
      curVal = parseInt((input.value || '').replace(/\D/g, '') || '0', 10) || 0;
    }

    let total = curVal + amt;
    input.value = total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    dispatchChangeEvents(input);
    updatePreviewBox();
  }

  function dispatchChangeEvents(input) {
    // Kích hoạt event input và change để các hệ thống reactive của trang tự động cập nhật
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));

    // Nếu hàm formatInputCurrency có gắn trên oninput, gọi thủ công nếu cần
    if (typeof window.formatInputCurrency === 'function' && isAmountInput(input)) {
      try {
        window.formatInputCurrency({ target: input });
      } catch (e) {}
    }
  }

  function updatePreviewBox() {
    const nameEl = document.getElementById('fin-kb-preview-name');
    const input = getActiveInput();
    if (!nameEl) return;

    if (!input) {
      nameEl.textContent = 'Chưa chọn ô nhập';
      return;
    }

    // Tìm nhãn hoặc placeholder của input
    let label = '';
    const id = input.id || '';
    if (input.placeholder && input.placeholder !== '0' && input.placeholder !== '0 đ') {
      label = input.placeholder;
    } else if (id) {
      // Thử tìm thẻ label tương ứng
      const lblEl = document.querySelector(`label[for="${id}"]`);
      if (lblEl) label = lblEl.innerText.trim();
      else label = id;
    }

    const val = input.value || '';
    if (val) {
      nameEl.innerHTML = `<b class="text-white">${val}</b> <span class="text-xs text-slate-400">(${label || 'Dữ liệu'})</span>`;
    } else {
      nameEl.innerHTML = `<span class="italic text-slate-400">Nhập ${label || 'nội dung...'}</span>`;
    }
  }

  function finishEditing() {
    const input = getActiveInput();
    if (input) {
      // Nếu còn biểu thức toán chưa tính, tự động tính trước khi xong
      if (input.value && /[+\-×÷]/.test(input.value)) {
        evaluateCurrentMath();
      }
      input.blur();
    }
    closeKeyboard();
  }

  // ------------------------------------------------------------------------
  // 6. ĐIỀU HƯỚNG CON TRỎ (CURSOR NAVIGATION)
  // ------------------------------------------------------------------------
  function moveCursor(direction) {
    const input = getActiveInput();
    if (!input) return;

    playKeySound('normal');
    triggerHaptic();

    const start = input.selectionStart ?? input.value.length;
    let newPos = direction === 'left' ? Math.max(0, start - 1) : Math.min(input.value.length, start + 1);

    try {
      input.setSelectionRange(newPos, newPos);
    } catch (e) {}
  }

  // ------------------------------------------------------------------------
  // 7. GIAO DIỆN THEME ENGINE (7 CHỦ ĐỀ ĐẲNG CẤP)
  // ------------------------------------------------------------------------
  function applyTheme(themeId) {
    const kb = document.getElementById('fin-virtual-keyboard');
    if (!kb) return;

    // Gỡ các class theme cũ
    THEMES.forEach(t => kb.classList.remove(`kb-theme-${t.id}`));

    STATE.theme = themeId;
    kb.classList.add(`kb-theme-${themeId}`);
    localStorage.setItem('fin_kb_theme', themeId);

    // Bắn thông báo nhẹ
    if (typeof window.showNotification === 'function') {
      const cur = THEMES.find(t => t.id === themeId);
      window.showNotification(`Đã chuyển chủ đề bàn phím: ${cur?.name || themeId}`, 'success');
    }
  }

  function toggleThemeDrawer(force) {
    const drawer = document.getElementById('fin-kb-theme-drawer');
    if (!drawer) return;

    const isHidden = drawer.classList.contains('hidden');
    const shouldShow = force !== undefined ? force : isHidden;

    if (shouldShow) {
      drawer.classList.remove('hidden');
      renderThemeGrid();
    } else {
      drawer.classList.add('hidden');
    }
  }

  // ------------------------------------------------------------------------
  // 8. ĐIỀU KHIỂN ĐÓNG / MỞ BÀN PHÍM & BẮT SỰ KIỆN GLOBAL
  // ------------------------------------------------------------------------
  function openKeyboard(targetInput) {
    if (!STATE.customKeyboardEnabled) return;

    createKeyboardDOM();
    const kb = document.getElementById('fin-virtual-keyboard');
    if (!kb) return;

    STATE.activeInput = targetInput;
    STATE.isOpen = true;

    // Gắn viền sáng nổi bật cho input đang nhập
    document.querySelectorAll('.fin-kb-focused-input').forEach(el => el.classList.remove('fin-kb-focused-input'));
    targetInput.classList.add('fin-kb-focused-input');

    // Tự động phân loại chế độ Số vs Chữ dựa trên input
    if (isAmountInput(targetInput)) {
      STATE.currentMode = 'numeric';
    } else {
      STATE.currentMode = 'qwerty';
    }

    updateModeButtons();
    renderSubbar();
    renderKeypad();
    updatePreviewBox();

    // Hiển thị bàn phím với animation mượt
    kb.classList.remove('closed');
    kb.classList.add('open');

    // Đẩy màn hình nhẹ nếu input bị bàn phím che
    setTimeout(() => {
      if (typeof targetInput.scrollIntoViewIfNeeded === 'function') {
        targetInput.scrollIntoViewIfNeeded(true);
      } else {
        targetInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  }

  function closeKeyboard() {
    const kb = document.getElementById('fin-virtual-keyboard');
    if (!kb) return;

    STATE.isOpen = false;
    kb.classList.remove('open');
    kb.classList.add('closed');

    if (STATE.activeInput) {
      STATE.activeInput.classList.remove('fin-kb-focused-input');
      STATE.activeInput = null;
    }

    toggleThemeDrawer(false);
  }

  function updateModeButtons() {
    const btnNum = document.getElementById('fin-kb-btn-mode-num');
    const btnText = document.getElementById('fin-kb-btn-mode-text');

    if (btnNum && btnText) {
      if (STATE.currentMode === 'numeric') {
        btnNum.classList.add('active');
        btnText.classList.remove('active');
      } else {
        btnNum.classList.remove('active');
        btnText.classList.add('active');
      }
    }
  }

  function isAmountInput(input) {
    if (!input) return false;
    const mode = input.getAttribute('data-orig-inputmode') || input.getAttribute('inputmode') || '';
    const type = input.type || '';
    const id = (input.id || '').toLowerCase();
    const name = (input.name || '').toLowerCase();
    const cls = (input.className || '').toLowerCase();

    if (mode === 'numeric' || mode === 'decimal') return true;
    if (type === 'number' || type === 'tel') return true;
    if (id.includes('amt') || id.includes('amount') || id.includes('price') || id.includes('cost') ||
        id.includes('rev') || id.includes('val') || id.includes('budget') || id.includes('salary') ||
        id.includes('pin') || id.includes('fund') || id.includes('gas') || id.includes('food') ||
        id.includes('tip') || id.includes('saved')) return true;
    if (cls.includes('split-amt') || cls.includes('currency')) return true;

    return false;
  }

  // ------------------------------------------------------------------------
  // 9. CHẶN TRIỆT ĐỂ BÀN PHÍM MẶC ĐỊNH CỦA THIẾT BỊ (INPUTMODE NONE)
  // Áp dụng MutationObserver toàn trang để bao phủ tất cả modal động!
  // ------------------------------------------------------------------------
  function suppressNativeKeyboard(el) {
    if (!el || el.dataset.finKbHandled) return;

    const tag = el.tagName;
    const type = (el.type || '').toLowerCase();

    // Bỏ qua các loại không cần gõ văn bản
    if (type === 'file' || type === 'checkbox' || type === 'radio' || type === 'range' ||
        type === 'button' || type === 'submit' || type === 'reset' || type === 'color') {
      return;
    }

    if (tag === 'INPUT' || tag === 'TEXTAREA') {
      // Lưu lại inputmode ban đầu để tham chiếu chế độ
      if (el.hasAttribute('inputmode')) {
        el.setAttribute('data-orig-inputmode', el.getAttribute('inputmode'));
      } else if (type === 'number' || type === 'tel') {
        el.setAttribute('data-orig-inputmode', 'numeric');
      }

      // THẦN CHÚ: inputmode="none" ngăn chặn 100% bàn phím ảo của iOS Safari & Android Chrome!
      if (STATE.customKeyboardEnabled) {
        el.setAttribute('inputmode', 'none');
      }

      el.dataset.finKbHandled = 'true';
    }
  }

  function scanAndSuppressAllInputs() {
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(suppressNativeKeyboard);
  }

  function setupGlobalInterceptor() {
    // 1. Quét lần đầu
    scanAndSuppressAllInputs();

    // 2. Theo dõi các modal / form sinh ra động bằng MutationObserver
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length > 0) {
          m.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
                suppressNativeKeyboard(node);
              } else if (node.querySelectorAll) {
                node.querySelectorAll('input, textarea').forEach(suppressNativeKeyboard);
              }
            }
          });
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 3. Bắt sự kiện focus / click toàn cục
    document.addEventListener('pointerdown', (e) => {
      const target = e.target;
      if (!target) return;

      const input = target.closest('input, textarea');
      const kbContainer = target.closest('#fin-virtual-keyboard');

      // Nếu click vào một ô input
      if (input) {
        const type = (input.type || '').toLowerCase();
        if (type !== 'file' && type !== 'checkbox' && type !== 'radio' && type !== 'range' &&
            type !== 'button' && type !== 'submit' && type !== 'reset') {
          // Ngăn bàn phím mặc định
          if (STATE.customKeyboardEnabled) {
            input.setAttribute('inputmode', 'none');
            // Mở bàn phím ảo FinMaster
            openKeyboard(input);
          }
        }
      } else if (!kbContainer && STATE.isOpen) {
        // Nhấp ra ngoài bàn phím và ngoài input -> Đóng bàn phím
        // Kiểm tra xem có đang click vào các nút điều khiển modal không
        if (!target.closest('.quick-amt-pill') && !target.closest('.swal2-container')) {
          closeKeyboard();
        }
      }
    }, true);

    // Lắng nghe sự kiện focusin để chắc chắn bắt được khi người dùng tab hoặc focus bằng code
    document.addEventListener('focusin', (e) => {
      const target = e.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        const type = (target.type || '').toLowerCase();
        if (type !== 'file' && type !== 'checkbox' && type !== 'radio' && type !== 'button') {
          if (STATE.customKeyboardEnabled && !STATE.isOpen) {
            target.setAttribute('inputmode', 'none');
            openKeyboard(target);
          }
        }
      }
    });
  }

  // ------------------------------------------------------------------------
  // 10. GẮN CÁC SỰ KIỆN TRÊN TOOLBAR CỦA BÀN PHÍM
  // ------------------------------------------------------------------------
  function bindKeyboardEvents() {
    // Nút đổi mode 123
    const btnNum = document.getElementById('fin-kb-btn-mode-num');
    if (btnNum) {
      btnNum.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerHaptic();
        playKeySound('normal');
        STATE.currentMode = 'numeric';
        updateModeButtons();
        renderKeypad();
        renderSubbar();
      });
    }

    // Nút đổi mode ABC
    const btnText = document.getElementById('fin-kb-btn-mode-text');
    if (btnText) {
      btnText.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerHaptic();
        playKeySound('normal');
        STATE.currentMode = 'qwerty';
        updateModeButtons();
        renderKeypad();
        renderSubbar();
      });
    }

    // Nút con trỏ trái / phải
    const btnCurLeft = document.getElementById('fin-kb-btn-cursor-left');
    if (btnCurLeft) {
      btnCurLeft.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        moveCursor('left');
      });
    }

    const btnCurRight = document.getElementById('fin-kb-btn-cursor-right');
    if (btnCurRight) {
      btnCurRight.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        moveCursor('right');
      });
    }

    // Nút âm thanh
    const btnSound = document.getElementById('fin-kb-btn-sound');
    if (btnSound) {
      btnSound.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerHaptic();

        STATE.soundEnabled = !STATE.soundEnabled;
        localStorage.setItem('fin_kb_sound', STATE.soundEnabled ? 'true' : 'false');

        btnSound.className = `fin-kb-tool-btn ${STATE.soundEnabled ? 'active' : ''}`;
        btnSound.innerHTML = `<i class="fa-solid ${STATE.soundEnabled ? 'fa-volume-high' : 'fa-volume-xmark'}"></i>`;

        if (STATE.soundEnabled) playKeySound('action');
      });
    }

    // Nút mở bảng chủ đề
    const btnTheme = document.getElementById('fin-kb-btn-theme');
    if (btnTheme) {
      btnTheme.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerHaptic();
        playKeySound('normal');
        toggleThemeDrawer();
      });
    }

    // Nút đóng bảng chủ đề
    const btnCloseTheme = document.getElementById('fin-kb-theme-close-btn');
    if (btnCloseTheme) {
      btnCloseTheme.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleThemeDrawer(false);
      });
    }

    // Nút ẩn bàn phím
    const btnClose = document.getElementById('fin-kb-btn-close');
    if (btnClose) {
      btnClose.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerHaptic();
        closeKeyboard();
      });
    }

    // Thanh handle kéo xuống đóng
    const handle = document.querySelector('.fin-kb-handle-bar');
    if (handle) {
      handle.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        closeKeyboard();
      });
    }
  }

  // ------------------------------------------------------------------------
  // 11. CUNG CẤP CÁC API GLOBAL CHO TOÀN BỘ ỨNG DỤNG
  // ------------------------------------------------------------------------
  window.FinKeyboard = {
    open: (inputEl) => openKeyboard(inputEl || getActiveInput()),
    close: () => closeKeyboard(),
    toggle: () => (STATE.isOpen ? closeKeyboard() : openKeyboard(getActiveInput())),
    setTheme: (themeId) => applyTheme(themeId),
    getThemes: () => THEMES,
    getState: () => ({ ...STATE }),
    toggleCustomKeyboard: (enabled) => {
      STATE.customKeyboardEnabled = enabled !== undefined ? enabled : !STATE.customKeyboardEnabled;
      localStorage.setItem('fin_kb_enabled', STATE.customKeyboardEnabled ? 'true' : 'false');
      if (!STATE.customKeyboardEnabled) {
        closeKeyboard();
        // Phục hồi lại inputmode cho các input
        document.querySelectorAll('input, textarea').forEach(el => {
          const orig = el.getAttribute('data-orig-inputmode');
          if (orig) el.setAttribute('inputmode', orig);
          else el.removeAttribute('inputmode');
        });
      } else {
        scanAndSuppressAllInputs();
      }
      return STATE.customKeyboardEnabled;
    }
  };

  // Khởi chạy khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      createKeyboardDOM();
      setupGlobalInterceptor();
    });
  } else {
    createKeyboardDOM();
    setupGlobalInterceptor();
  }

  console.log('[FinMaster Virtual Keyboard Pro] Hệ thống bàn phím số & chữ tùy biến đã sẵn sàng.');
})();
