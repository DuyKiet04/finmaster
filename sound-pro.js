// ==========================================================================
// FILE: sound-pro.js - FINMASTER UNIVERSAL AUDIO ENGINE & SOUND PACK SYSTEM
// Hệ thống âm thanh toàn trang: Nút bấm, Xóa, Tiền về, Chuyển trang, Pop, Cảnh báo
// Tích hợp 4 Sound Packs: iOS Haptic, Phím cơ Mech, Ngân hàng Banking, Arcade Game
// ==========================================================================

(function initSoundProSystem() {
  'use strict';

  // Cấu hình âm thanh lưu trong localStorage
  const SOUND_CONFIG = {
    enabled: localStorage.getItem('fin_sound_enabled') !== 'false',
    volume: parseFloat(localStorage.getItem('fin_sound_vol') || '0.7'),
    pack: localStorage.getItem('fin_sound_pack') || 'ios', // 'ios', 'mech', 'banking', 'game'
    haptic: localStorage.getItem('fin_sound_haptic') !== 'false'
  };

  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // ------------------------------------------------------------------------
  // BỘ TỔNG HỢP ÂM THANH THEO TỪNG SOUND PACK
  // ------------------------------------------------------------------------
  const SOUND_SYNTH = {
    // 1. GÓI ÂM THANH iOS SYSTEM (Haptic Click, Chime thanh lịch)
    ios: {
      click: (ctx, now, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(350, now + 0.02);
        gain.gain.setValueAtTime(vol * 0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.025);
      },
      trash: (ctx, now, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.06);
        gain.gain.setValueAtTime(vol * 0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.07);
      },
      pop: (ctx, now, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(950, now + 0.045);
        gain.gain.setValueAtTime(vol * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.05);
      },
      success: (ctx, now, vol) => {
        // Hợp âm đôi thanh nhã C5 + E5
        [523.25, 659.25, 783.99].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.06);
          gain.gain.setValueAtTime(vol * 0.12, now + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.16);
          osc.connect(gain); gain.connect(ctx.destination);
          osc.start(now + i * 0.06); osc.stop(now + i * 0.06 + 0.16);
        });
      },
      coin: (ctx, now, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.06); // E6
        gain.gain.setValueAtTime(vol * 0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.28);
      },
      switchView: (ctx, now, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(680, now + 0.04);
        gain.gain.setValueAtTime(vol * 0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.05);
      },
      error: (ctx, now, vol) => {
        [220, 196].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          gain.gain.setValueAtTime(vol * 0.14, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.1);
          osc.connect(gain); gain.connect(ctx.destination);
          osc.start(now + i * 0.08); osc.stop(now + i * 0.08 + 0.1);
        });
      }
    },

    // 2. GÓI ÂM THANH PHÍM CƠ TACTILE (Cherry MX Blue & Brown)
    mech: {
      click: (ctx, now, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1900, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.02);
        gain.gain.setValueAtTime(vol * 0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.025);
      },
      trash: (ctx, now, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.05);
        gain.gain.setValueAtTime(vol * 0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.055);
      },
      pop: (ctx, now, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(550, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.035);
        gain.gain.setValueAtTime(vol * 0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.04);
      },
      success: (ctx, now, vol) => {
        [600, 800, 1000].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.05);
          gain.gain.setValueAtTime(vol * 0.16, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.12);
          osc.connect(gain); gain.connect(ctx.destination);
          osc.start(now + i * 0.05); osc.stop(now + i * 0.05 + 0.12);
        });
      },
      coin: (ctx, now, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1050, now);
        osc.frequency.setValueAtTime(1400, now + 0.05);
        gain.gain.setValueAtTime(vol * 0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.22);
      },
      switchView: (ctx, now, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.035);
        gain.gain.setValueAtTime(vol * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.04);
      },
      error: (ctx, now, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(90, now + 0.12);
        gain.gain.setValueAtTime(vol * 0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.14);
      }
    },

    // 3. GÓI ÂM THANH NGÂN HÀNG SỐ (Fintech Banking, POS Beep, Cash Register)
    banking: {
      click: (ctx, now, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2200, now);
        gain.gain.setValueAtTime(vol * 0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.02);
      },
      trash: (ctx, now, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(150, now + 0.08);
        gain.gain.setValueAtTime(vol * 0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.09);
      },
      pop: (ctx, now, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.setValueAtTime(1600, now + 0.02);
        gain.gain.setValueAtTime(vol * 0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.04);
      },
      success: (ctx, now, vol) => {
        // Ting-ting chuông vàng ngân hàng
        [1046.5, 1318.5, 1567.98].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.05);
          gain.gain.setValueAtTime(vol * 0.15, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.22);
          osc.connect(gain); gain.connect(ctx.destination);
          osc.start(now + i * 0.05); osc.stop(now + i * 0.05 + 0.22);
        });
      },
      coin: (ctx, now, vol) => {
        // Tiếng đồng xu rơi kim loại sáng loáng
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(1864.66, now); // A#6
        osc2.frequency.setValueAtTime(2349.32, now + 0.03); // D7
        gain.gain.setValueAtTime(vol * 0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc1.connect(gain); osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(now); osc1.stop(now + 0.35);
        osc2.start(now + 0.03); osc2.stop(now + 0.35);
      },
      switchView: (ctx, now, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.04);
        gain.gain.setValueAtTime(vol * 0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.045);
      },
      error: (ctx, now, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.setValueAtTime(250, now + 0.08);
        gain.gain.setValueAtTime(vol * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.18);
      }
    },

    // 4. GÓI ÂM THANH ARCADE GAME 8-BIT (Retro, Đồng xu bay, Level up)
    game: {
      click: (ctx, now, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(900, now + 0.02);
        gain.gain.setValueAtTime(vol * 0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.035);
      },
      trash: (ctx, now, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.1);
        gain.gain.setValueAtTime(vol * 0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.11);
      },
      pop: (ctx, now, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
        gain.gain.setValueAtTime(vol * 0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.06);
      },
      success: (ctx, now, vol) => {
        // Giai điệu chiến thắng Game 8-bit Mario style
        const notes = [659.25, 659.25, 0, 659.25, 0, 523.25, 659.25, 0, 783.99];
        notes.forEach((freq, idx) => {
          if (freq === 0) return;
          const t = now + idx * 0.05;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(vol * 0.09, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
          osc.connect(gain); gain.connect(ctx.destination);
          osc.start(t); osc.stop(t + 0.045);
        });
      },
      coin: (ctx, now, vol) => {
        // Âm đồng xu 8-bit Mario kinh điển (B5 -> E6)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.07);
        gain.gain.setValueAtTime(vol * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.3);
      },
      switchView: (ctx, now, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.04);
        gain.gain.setValueAtTime(vol * 0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.05);
      },
      error: (ctx, now, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.setValueAtTime(150, now + 0.07);
        gain.gain.setValueAtTime(vol * 0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.15);
      }
    }
  };

  // ------------------------------------------------------------------------
  // HÀM PHÁT ÂM THANH TOÀN CỤC (GLOBAL PLAY SOUND)
  // ------------------------------------------------------------------------
  function playSound(soundType = 'click') {
    if (!SOUND_CONFIG.enabled || SOUND_CONFIG.volume <= 0) return;

    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const pack = SOUND_SYNTH[SOUND_CONFIG.pack] || SOUND_SYNTH.ios;
      const fn = pack[soundType] || pack.click;

      if (typeof fn === 'function') {
        fn(ctx, now, SOUND_CONFIG.volume);
      }

      // Rung phản hồi haptic nếu được bật
      if (SOUND_CONFIG.haptic && navigator.vibrate) {
        if (soundType === 'trash' || soundType === 'error') {
          navigator.vibrate([15, 40, 15]);
        } else if (soundType === 'success' || soundType === 'coin') {
          navigator.vibrate([12, 30, 20]);
        } else {
          navigator.vibrate(8);
        }
      }
    } catch (e) {
      // Audio autoplay policy catch
    }
  }

  // Đè hàm playSound của window để toàn bộ app tự động dùng engine mới
  window.playSound = playSound;

  // ------------------------------------------------------------------------
  // LẮNG NGHE SỰ KIỆN CLICK TOÀN HỆ THỐNG ĐỂ PHÁT ÂM TỰ ĐỘNG
  // ------------------------------------------------------------------------
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!target) return;

    const btn = target.closest('button, .mobile-nav-item, .quick-amt-pill, .settings-app-tile, [role="button"]');
    if (!btn) return;

    // Phân loại âm thanh thông minh dựa trên nội dung & icon
    const html = btn.innerHTML || '';
    const text = (btn.innerText || '').toLowerCase();
    const cls = btn.className || '';

    if (html.includes('fa-trash') || html.includes('fa-trash-can') || text.includes('xóa') || cls.includes('danger')) {
      playSound('trash');
    } else if (html.includes('fa-plus') || cls.includes('fab') || html.includes('fa-wand') || html.includes('fa-pen')) {
      playSound('pop');
    } else if (cls.includes('quick-amt-pill') || text.includes('đ') || text.includes('k') || text.includes('tr')) {
      playSound('coin');
    } else if (cls.includes('mobile-nav-item') || cls.includes('nav-tab')) {
      playSound('switchView');
    } else {
      playSound('click');
    }
  }, true);

  // Bắt submit form để phát âm success
  document.addEventListener('submit', () => {
    playSound('success');
  }, true);

  // ------------------------------------------------------------------------
  // CUNG CẤP API ĐIỀU KHIỂN & CÀI ĐẶT
  // ------------------------------------------------------------------------
  window.FinSound = {
    play: playSound,
    getConfig: () => ({ ...SOUND_CONFIG }),
    setEnabled: (val) => {
      SOUND_CONFIG.enabled = !!val;
      localStorage.setItem('fin_sound_enabled', SOUND_CONFIG.enabled ? 'true' : 'false');
      if (SOUND_CONFIG.enabled) playSound('click');
    },
    setVolume: (val) => {
      SOUND_CONFIG.volume = Math.max(0, Math.min(1, parseFloat(val)));
      localStorage.setItem('fin_sound_vol', SOUND_CONFIG.volume.toString());
      playSound('click');
    },
    setPack: (packName) => {
      if (SOUND_SYNTH[packName]) {
        SOUND_CONFIG.pack = packName;
        localStorage.setItem('fin_sound_pack', packName);
        playSound('success');
      }
    },
    setHaptic: (val) => {
      SOUND_CONFIG.haptic = !!val;
      localStorage.setItem('fin_sound_haptic', SOUND_CONFIG.haptic ? 'true' : 'false');
    },
    getPacks: () => [
      { id: 'ios', name: 'Apple iOS Haptic', desc: 'Thanh lịch, siêu mượt chuẩn iPhone', icon: 'fa-apple' },
      { id: 'mech', name: 'Phím Cơ Tactile', desc: 'm đanh giòn, cơ học Cherry MX', icon: 'fa-keyboard' },
      { id: 'banking', name: 'Ngân Hàng Số', desc: 'Ting-ting chuông vàng, máy POS ATM', icon: 'fa-building-columns' },
      { id: 'game', name: 'Arcade 8-Bit Game', desc: 'Coin retro, chiến thắng game vui nhộn', icon: 'fa-gamepad' }
    ]
  };

  console.log('[FinMaster Sound Engine Pro] Đã khởi tạo hệ thống âm thanh toàn trang.');
})();
