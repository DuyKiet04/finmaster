// ==============================================================
// FILE: settings-pro.js - FINMASTER ULTRA-LUXURY SETTINGS & SLIDING DETAIL HUB
// Giao Diện Cài Đặt Siêu Sang + Hệ Thống Chi Tiết Trượt Đa Tầng (iOS Style)
// ==============================================================

(function initSettingsPro() {
  console.log('[FinMaster Settings Pro] Khởi tạo Trung tâm Cài đặt & Trang Chi tiết Trượt.');

  let currentOpenSection = null;

  // 1. Tạo Khung Slider Chi Tiết Nếu Chưa Có
  function ensureSliderDOM() {
    let slider = document.getElementById('settings-detail-slider');
    if (slider) return slider;

    slider = document.createElement('div');
    slider.id = 'settings-detail-slider';
    slider.className = 'fixed inset-0 z-[250] custom-bg-body overflow-hidden flex flex-col font-sans select-none slide-closed';
    slider.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease';

    slider.innerHTML = `
      <!-- STICKY TOP NAVIGATION BAR (GLASSMORPHIC) -->
      <div class="sticky top-0 inset-x-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-2xl border-b border-white/10 text-white shadow-lg">
        <button type="button" onclick="closeSettingsDetail()" class="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xs font-black border border-white/15 shadow-sm" title="Quay lại">
          <i class="fa-solid fa-arrow-left text-sm"></i>
          <span>Cài Đặt</span>
        </button>

        <div class="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 shadow-inner">
          <span id="settings-slider-icon" class="text-xs text-indigo-400"><i class="fa-solid fa-gear"></i></span>
          <span id="settings-slider-title" class="text-xs font-black uppercase tracking-wider text-white">Chi Tiết</span>
        </div>

        <button type="button" onclick="closeSettingsDetail()" class="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-xs font-bold border border-white/15 transition-all" title="Đóng">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <!-- SCROLLABLE BODY AREA -->
      <div id="settings-slider-content" class="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6 custom-scrollbar pb-32 max-w-3xl mx-auto w-full">
        <!-- Nội dung chi tiết từng mục sẽ được render động vào đây -->
      </div>
    `;

    document.body.appendChild(slider);
    return slider;
  }

  // 2. Mở Trang Chi Tiết Theo Mục Được Nhấp
  window.openSettingsDetail = function(sectionId) {
    ensureSliderDOM();
    currentOpenSection = sectionId;

    const slider = document.getElementById('settings-detail-slider');
    const content = document.getElementById('settings-slider-content');
    const titleEl = document.getElementById('settings-slider-title');
    const iconEl = document.getElementById('settings-slider-icon');

    if (!slider || !content) return;

    if (typeof playSound === 'function') playSound("pop");

    // Render nội dung tương ứng
    switch (sectionId) {
      case 'profile':
        titleEl.innerText = "Hồ Sơ & Danh Hiệu VIP";
        iconEl.innerHTML = '<i class="fa-solid fa-crown text-amber-400"></i>';
        content.innerHTML = renderProfileDetailHTML();
        break;

      case 'faceid':
        titleEl.innerText = "Bảo Mật Face ID AI";
        iconEl.innerHTML = '<i class="fa-solid fa-camera text-emerald-400"></i>';
        content.innerHTML = renderFaceIdDetailHTML();
        break;

      case 'physical':
        titleEl.innerText = "Chỉ Số Cơ Thể & Thể Trạng";
        iconEl.innerHTML = '<i class="fa-solid fa-heart-pulse text-rose-400"></i>';
        content.innerHTML = renderPhysicalDetailHTML();
        break;

      case 'pin':
        titleEl.innerText = "Bảo Mật Mã PIN 4 Số";
        iconEl.innerHTML = '<i class="fa-solid fa-shield-halved text-orange-400"></i>';
        content.innerHTML = renderPinDetailHTML();
        break;

      case 'reminder':
        titleEl.innerText = "Nhắc Nhở & Thông Báo";
        iconEl.innerHTML = '<i class="fa-solid fa-bell text-blue-400"></i>';
        content.innerHTML = renderReminderDetailHTML();
        break;

      case 'recurring':
        titleEl.innerText = "Hóa Đơn & Gói Định Kỳ";
        iconEl.innerHTML = '<i class="fa-solid fa-arrows-rotate text-teal-400"></i>';
        content.innerHTML = renderRecurringDetailHTML();
        break;

      case 'favorites':
        titleEl.innerText = "Sổ Tay Quán Ruột";
        iconEl.innerHTML = '<i class="fa-solid fa-heart text-rose-400"></i>';
        content.innerHTML = renderFavoritesDetailHTML();
        break;

      case 'themes':
        titleEl.innerText = "Studio Giao Diện & Hình Nền";
        iconEl.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles text-fuchsia-400"></i>';
        content.innerHTML = renderThemesDetailHTML();
        break;

      case 'sound':
        titleEl.innerText = "Âm Thanh & Rung Phản Hồi";
        iconEl.innerHTML = '<i class="fa-solid fa-volume-high text-cyan-400"></i>';
        content.innerHTML = renderSoundDetailHTML();
        break;

      case 'keyboard':
        titleEl.innerText = "Bàn Phím Ảo FinMaster Pro";
        iconEl.innerHTML = '<i class="fa-solid fa-keyboard text-purple-400"></i>';
        content.innerHTML = renderKeyboardDetailHTML();
        break;

      case 'categories':
        titleEl.innerText = "Quản Lý Danh Mục Chi Tiêu";
        iconEl.innerHTML = '<i class="fa-solid fa-tags text-indigo-400"></i>';
        content.innerHTML = renderCategoriesDetailHTML();
        break;

      case 'modules':
        titleEl.innerText = "Menu Siêu Ứng Dụng (Mô-đun)";
        iconEl.innerHTML = '<i class="fa-solid fa-puzzle-piece text-purple-400"></i>';
        content.innerHTML = renderModulesDetailHTML();
        break;

      case 'vault':
        titleEl.innerText = "Dữ Liệu & Sao Lưu Đám Mây";
        iconEl.innerHTML = '<i class="fa-solid fa-database text-blue-500"></i>';
        content.innerHTML = renderVaultDetailHTML();
        break;

      default:
        titleEl.innerText = "Cài Đặt Chi Tiết";
        iconEl.innerHTML = '<i class="fa-solid fa-gear"></i>';
        content.innerHTML = `<div class="p-8 text-center text-slate-400">Mục đang được cập nhật!</div>`;
    }

    // Hiệu ứng trượt mượt mà
    slider.classList.remove('slide-closed');
    slider.classList.add('slide-open');
    slider.style.transform = 'translateX(0)';
    slider.style.opacity = '1';
    slider.style.pointerEvents = 'auto';

    // Cuộn lên đầu
    content.scrollTop = 0;
  };

  // 3. Đóng Trang Chi Tiết
  window.closeSettingsDetail = function() {
    const slider = document.getElementById('settings-detail-slider');
    if (!slider) return;

    if (typeof playSound === 'function') playSound("pop");

    slider.style.transform = 'translateX(100%)';
    slider.style.opacity = '0';
    slider.style.pointerEvents = 'none';
    slider.classList.add('slide-closed');
    slider.classList.remove('slide-open');

    currentOpenSection = null;

    // Làm mới lại các số liệu trên màn hình chính
    if (typeof updateGlobalHeader === 'function') updateGlobalHeader();
    if (typeof renderSettings === 'function') renderSettings();
  };

  // ==============================================================
  // CHI TIẾT 1: HỒ SƠ & DANH HIỆU VIP (PROFILE DETAIL)
  // ==============================================================
  function renderProfileDetailHTML() {
    const p = state.userProfile || {};
    const name = p.name || "Đại Ka";
    const avatar = p.avatar || "https://img.magnific.com/vector-mien-phi/hinh-minh-hoa-cau-be-toc-do-tuoi-cuoi_1308-176664.jpg?semt=ais_hybrid&w=740&q=80";
    const bio = p.bio || "Quản lý dòng tiền thông minh cùng FinMaster Pro";
    const motto = p.motto || "Tự do tài chính, làm chủ cuộc đời";

    return `
      <!-- VIP GOLD MEMBERSHIP CARD -->
      <div class="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-700 text-white shadow-2xl border border-amber-300/40">
        <div class="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-black/25 backdrop-blur-md border border-white/20 text-xs font-black tracking-widest uppercase">
            <i class="fa-solid fa-crown text-yellow-300 animate-pulse"></i> FINMASTER BLACK VIP
          </div>
          <span class="text-xs font-bold text-amber-100 opacity-90">ID: FM-${Math.abs(name.split('').reduce((a,b)=>((a<<5)-a)+b.charCodeAt(0),0)%900000+100000)}</span>
        </div>

        <div class="flex items-center gap-4 mb-6">
          <img src="${avatar}" class="w-16 h-16 rounded-full border-2 border-white shadow-lg object-cover">
          <div>
            <h2 class="text-xl font-black text-white">${name}</h2>
            <p class="text-xs text-amber-100 font-medium">${bio}</p>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2.5 pt-4 border-t border-white/20 text-center">
          <div class="bg-black/20 p-2.5 rounded-2xl">
            <div class="text-[10px] text-amber-200 font-bold uppercase">Điểm Tài Chính</div>
            <div class="text-base font-black text-white mt-0.5">98 / 100</div>
          </div>
          <div class="bg-black/20 p-2.5 rounded-2xl">
            <div class="text-[10px] text-amber-200 font-bold uppercase">Cấp Bảo Mật</div>
            <div class="text-base font-black text-emerald-300 mt-0.5">Tối Cao</div>
          </div>
          <div class="bg-black/20 p-2.5 rounded-2xl">
            <div class="text-[10px] text-amber-200 font-bold uppercase">Chuỗi Ghi</div>
            <div class="text-base font-black text-white mt-0.5">${state.transactions ? Math.min(state.transactions.length, 99) : 30} Ngày</div>
          </div>
        </div>
      </div>

      <!-- FORM CHỈNH SỬA THÔNG TIN -->
      <div class="p-6 rounded-3xl custom-bg-card border custom-border space-y-4 shadow-sm">
        <h4 class="font-black text-sm custom-text flex items-center gap-2">
          <i class="fa-solid fa-user-pen text-indigo-400"></i> Chỉnh Sửa Thông Tin Cá Nhân
        </h4>
        <div class="space-y-3">
          <div>
            <label class="block text-[11px] font-bold custom-text-secondary uppercase mb-1.5">Tên hiển thị</label>
            <input type="text" id="prof-detail-name" value="${name}" class="w-full p-3.5 rounded-2xl custom-bg-input border custom-border font-bold text-sm custom-text focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block text-[11px] font-bold custom-text-secondary uppercase mb-1.5">Tiểu sử / Nghề nghiệp</label>
            <input type="text" id="prof-detail-bio" value="${bio}" class="w-full p-3.5 rounded-2xl custom-bg-input border custom-border font-bold text-sm custom-text focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block text-[11px] font-bold custom-text-secondary uppercase mb-1.5">Châm ngôn tài chính</label>
            <input type="text" id="prof-detail-motto" value="${motto}" class="w-full p-3.5 rounded-2xl custom-bg-input border custom-border font-bold text-sm custom-text focus:border-indigo-500 focus:outline-none">
          </div>
        </div>
        <button onclick="saveProfileDetailData()" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-sm shadow-lg shadow-indigo-500/25 active:scale-95 transition-all">
          <i class="fa-solid fa-floppy-disk mr-1.5"></i> Lưu Thông Tin Hồ Sơ
        </button>
      </div>

      <!-- HUÂN CHƯƠNG & THÀNH TỰU (ACHIEVEMENTS) -->
      <div class="p-6 rounded-3xl custom-bg-card border custom-border space-y-4 shadow-sm">
        <h4 class="font-black text-sm custom-text flex items-center gap-2">
          <i class="fa-solid fa-medal text-amber-500"></i> Huân Chương Tài Chính
        </h4>
        <div class="grid grid-cols-2 gap-3">
          <div class="p-3.5 rounded-2xl custom-bg-input border custom-border flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg shrink-0">
              <i class="fa-solid fa-bolt"></i>
            </div>
            <div>
              <div class="text-xs font-black custom-text">Kỷ Luật Thép</div>
              <div class="text-[10px] custom-text-secondary font-medium">Ghi chép đều đặn</div>
            </div>
          </div>
          <div class="p-3.5 rounded-2xl custom-bg-input border custom-border flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg shrink-0">
              <i class="fa-solid fa-piggy-bank"></i>
            </div>
            <div>
              <div class="text-xs font-black custom-text">Thần Tiết Kiệm</div>
              <div class="text-[10px] custom-text-secondary font-medium">Đạt mục tiêu quỹ</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  window.saveProfileDetailData = function() {
    const nameInput = document.getElementById('prof-detail-name');
    const bioInput = document.getElementById('prof-detail-bio');
    const mottoInput = document.getElementById('prof-detail-motto');

    if (!state.userProfile) state.userProfile = {};
    if (nameInput) state.userProfile.name = nameInput.value.trim() || "Người dùng";
    if (bioInput) state.userProfile.bio = bioInput.value.trim();
    if (mottoInput) state.userProfile.motto = mottoInput.value.trim();

    const nameDisp = document.getElementById('profile-name-disp');
    if (nameDisp) nameDisp.innerText = state.userProfile.name;

    if (typeof saveData === 'function') saveData();
    if (typeof playSound === 'function') playSound("success");
    alert("✅ Đã cập nhật thông tin hồ sơ cá nhân thành công!");
    closeSettingsDetail();
  };

  // ==============================================================
  // CHI TIẾT 2: FACE ID AI (BIOMETRIC DETAIL)
  // ==============================================================
  function renderFaceIdDetailHTML() {
    const hasFace = !!localStorage.getItem("finmaster_face_data");

    return `
      <!-- FACE ID RADAR HERO -->
      <div class="p-8 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 text-center flex flex-col items-center justify-center shadow-xl relative overflow-hidden">
        <div class="w-28 h-28 rounded-full border-4 ${hasFace ? 'border-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.35)]' : 'border-slate-600'} flex items-center justify-center text-4xl ${hasFace ? 'text-emerald-400' : 'text-slate-400'} mb-4 relative bg-black/30">
          <i class="fa-solid fa-camera"></i>
          ${hasFace ? '<div class="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-25"></div>' : ''}
        </div>
        <h3 class="text-lg font-black text-white">${hasFace ? 'Face ID Đang Hoạt Động' : 'Chưa Thiết Lập Face ID'}</h3>
        <p class="text-xs text-slate-400 mt-1 max-w-sm">Mô hình AI nhận diện khuôn mặt sinh trắc học chuẩn xác, bảo vệ dữ liệu tài chính của bạn an toàn tuyệt đối.</p>
        <span class="mt-4 px-3 py-1 rounded-full text-xs font-bold ${hasFace ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}">
          ${hasFace ? '🟢 Trạng Thái: Đã Kích Hoạt' : '⚠️ Trạng Thái: Chưa Đăng Ký'}
        </span>
      </div>

      <!-- HÀNH ĐỘNG FACE ID -->
      <div class="p-6 rounded-3xl custom-bg-card border custom-border space-y-3.5 shadow-sm">
        <button onclick="closeSettingsDetail(); registerFaceID();" class="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2">
          <i class="fa-solid fa-expand"></i> ${hasFace ? 'Quét Lại Khuôn Mặt Mới' : 'Bắt Đầu Quét Khuôn Mặt'}
        </button>

        ${hasFace ? `
          <button onclick="closeSettingsDetail(); startFaceIDLogin();" class="w-full py-3.5 rounded-2xl custom-bg-input border custom-border font-bold text-xs custom-text hover:border-emerald-500 active:scale-95 transition-all flex items-center justify-center gap-2">
            <i class="fa-solid fa-play text-emerald-400"></i> Thử Nghiệm Mở Khóa Face ID
          </button>
          <button onclick="removeFaceIDData()" class="w-full py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-xs border border-rose-500/30 active:scale-95 transition-all">
            <i class="fa-solid fa-trash mr-1.5"></i> Xóa Dữ Liệu Khuôn Mặt
          </button>
        ` : ''}
      </div>

      <!-- TÍNH NĂNG NÂNG CAO -->
      <div class="p-6 rounded-3xl custom-bg-card border custom-border space-y-3 text-xs custom-text shadow-sm">
        <h4 class="font-black text-xs uppercase tracking-wider text-slate-400">Ghi chú bảo mật</h4>
        <p class="custom-text-secondary leading-relaxed">
          • Dữ liệu khuôn mặt được mã hóa vector số và lưu hoàn toàn trên bộ nhớ thiết bị của bạn (Local Storage), tuyệt đối không gửi lên bất kỳ máy chủ nào.<br>
          • Đảm bảo ngồi trong không gian đủ ánh sáng khi quét khuôn mặt.
        </p>
      </div>
    `;
  }

  window.removeFaceIDData = function() {
    if (confirm("Bạn có chắc chắn muốn xóa dữ liệu Face ID đã đăng ký?")) {
      localStorage.removeItem("finmaster_face_data");
      if (typeof playSound === 'function') playSound("pop");
      alert("Đã xóa dữ liệu khuôn mặt. Bạn có thể sử dụng mã PIN để đăng nhập.");
      openSettingsDetail('faceid');
    }
  };

  // ==============================================================
  // CHI TIẾT 3: CHỈ SỐ CƠ THỂ & BMI PRO (PHYSICAL HEALTH DETAIL)
  // ==============================================================
  function renderPhysicalDetailHTML() {
    const p = state.userProfile || {};
    const w = parseFloat(p.weight) || 65;
    const h = parseFloat(p.height) || 170;

    const bmi = (w / ((h / 100) * (h / 100))).toFixed(1);
    let bmiText = "Cân đối";
    let bmiColor = "text-emerald-400";
    let bmiBg = "bg-emerald-500/15 border-emerald-500/30";

    if (bmi < 18.5) {
      bmiText = "Hơi gầy";
      bmiColor = "text-amber-400";
      bmiBg = "bg-amber-500/15 border-amber-500/30";
    } else if (bmi >= 25 && bmi < 30) {
      bmiText = "Thừa cân nhẹ";
      bmiColor = "text-orange-400";
      bmiBg = "bg-orange-500/15 border-orange-500/30";
    } else if (bmi >= 30) {
      bmiText = "Cần giảm cân";
      bmiColor = "text-rose-400";
      bmiBg = "bg-rose-500/15 border-rose-500/30";
    }

    const bmr = Math.round(10 * w + 6.25 * h - 5 * 25 + 5);
    const water = (w * 0.035).toFixed(1);

    return `
      <!-- BMI GAUGE CARD -->
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900/60 to-purple-900/60 border border-indigo-500/30 text-white shadow-xl flex flex-col items-center text-center">
        <div class="text-[11px] font-black uppercase tracking-wider text-indigo-300 mb-1">Chỉ Số Khối Cơ Thể (BMI)</div>
        <div class="text-4xl sm:text-5xl font-black text-white my-2">${bmi}</div>
        <span class="px-4 py-1.5 rounded-full text-xs font-black ${bmiColor} ${bmiBg} border shadow-sm">
          Thể Trạng: ${bmiText}
        </span>
        <div class="grid grid-cols-2 gap-3 w-full mt-6 pt-4 border-t border-white/10">
          <div class="bg-black/25 p-3 rounded-2xl">
            <div class="text-[10px] text-indigo-300 font-bold uppercase">Calo Tối Thiểu (BMR)</div>
            <div class="text-base font-black text-white mt-0.5">${bmr} kcal/ngày</div>
          </div>
          <div class="bg-black/25 p-3 rounded-2xl">
            <div class="text-[10px] text-indigo-300 font-bold uppercase">Nước Uống Tối Thiểu</div>
            <div class="text-base font-black text-cyan-300 mt-0.5">${water} Lít/ngày</div>
          </div>
        </div>
      </div>

      <!-- FORM NHẬP THÔNG SỐ -->
      <div class="p-6 rounded-3xl custom-bg-card border custom-border space-y-4 shadow-sm">
        <h4 class="font-black text-sm custom-text flex items-center gap-2">
          <i class="fa-solid fa-weight-scale text-rose-400"></i> Cập Nhật Chỉ Số Chiều Cao & Cân Nặng
        </h4>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-[11px] font-bold custom-text-secondary uppercase mb-1.5">Cân nặng (kg)</label>
            <input type="number" id="phys-detail-w" value="${w}" step="0.5" class="w-full p-4 rounded-2xl custom-bg-input border custom-border text-center font-black text-xl custom-text focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block text-[11px] font-bold custom-text-secondary uppercase mb-1.5">Chiều cao (cm)</label>
            <input type="number" id="phys-detail-h" value="${h}" step="1" class="w-full p-4 rounded-2xl custom-bg-input border custom-border text-center font-black text-xl custom-text focus:border-indigo-500 focus:outline-none">
          </div>
        </div>

        <button onclick="savePhysicalDetailData()" class="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black text-sm shadow-lg shadow-rose-500/25 active:scale-95 transition-all">
          <i class="fa-solid fa-check mr-1.5"></i> Lưu Chỉ Số & Tự Động Tính BMI
        </button>
      </div>
    `;
  }

  window.savePhysicalDetailData = function() {
    const wEl = document.getElementById('phys-detail-w');
    const hEl = document.getElementById('phys-detail-h');

    if (!state.userProfile) state.userProfile = {};
    if (wEl) state.userProfile.weight = parseFloat(wEl.value) || 60;
    if (hEl) state.userProfile.height = parseFloat(hEl.value) || 170;

    if (typeof saveData === 'function') saveData();
    if (typeof playSound === 'function') playSound("success");
    alert("✅ Đã cập nhật chỉ số cơ thể thành công!");
    openSettingsDetail('physical');
  };

  // ==============================================================
  // CHI TIẾT 4: MÃ PIN (SECURITY PIN DETAIL)
  // ==============================================================
  function renderPinDetailHTML() {
    return `
      <div class="p-8 rounded-3xl custom-bg-card border custom-border text-center flex flex-col items-center justify-center shadow-sm">
        <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center text-3xl shadow-xl mb-4">
          <i class="fa-solid fa-shield-halved"></i>
        </div>
        <h3 class="text-base font-black custom-text">Mã PIN & Khóa Ứng Dụng</h3>
        <p class="text-xs custom-text-secondary mt-1 max-w-sm">Mã PIN 4 số bảo vệ toàn bộ dữ liệu tài chính, nhật ký và số dư của bạn khỏi người khác tò mò.</p>
        
        <div class="w-full mt-6 space-y-3">
          <button onclick="closeSettingsDetail(); openChangePassword();" class="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-black text-sm shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2">
            <i class="fa-solid fa-key"></i> Đổi Mã PIN Mới
          </button>
        </div>
      </div>
    `;
  }

  // ==============================================================
  // CHI TIẾT 5: NHẮC NHỞ (REMINDER DETAIL)
  // ==============================================================
  function renderReminderDetailHTML() {
    return `
      <div class="p-6 rounded-3xl custom-bg-card border custom-border space-y-5 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl shrink-0">
            <i class="fa-solid fa-bell"></i>
          </div>
          <div>
            <h3 class="text-sm font-black custom-text">Cài Đặt Nhắc Nhở Ghi Chép</h3>
            <p class="text-xs custom-text-secondary">Tạo thói quen tài chính kỷ luật mỗi ngày</p>
          </div>
        </div>

        <div class="space-y-3 pt-2">
          <div class="p-4 rounded-2xl custom-bg-input border custom-border flex items-center justify-between">
            <div>
              <div class="text-xs font-bold custom-text">Nhắc nhở buổi tối</div>
              <div class="text-[11px] custom-text-secondary">Gửi thông báo lúc 21:00 hàng ngày</div>
            </div>
            <input type="checkbox" checked class="w-5 h-5 accent-indigo-500 rounded">
          </div>

          <div class="p-4 rounded-2xl custom-bg-input border custom-border flex items-center justify-between">
            <div>
              <div class="text-xs font-bold custom-text">Cảnh báo vượt hạn mức</div>
              <div class="text-[11px] custom-text-secondary">Khi chi tiêu chạm 80% ngân sách</div>
            </div>
            <input type="checkbox" checked class="w-5 h-5 accent-indigo-500 rounded">
          </div>
        </div>

        <button onclick="requestNotificationPermission(); alert('🔔 Đã kích hoạt hệ thống nhắc nhở thông minh!');" class="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-sm shadow-lg shadow-blue-500/25 active:scale-95 transition-all">
          <i class="fa-solid fa-bell mr-1.5"></i> Cấp Quyền & Lưu Nhắc Nhở
        </button>
      </div>
    `;
  }

  // ==============================================================
  // CHI TIẾT 6: HÓA ĐƠN ĐỊNH KỲ (RECURRING DETAIL)
  // ==============================================================
  function renderRecurringDetailHTML() {
    return `
      <div class="p-6 rounded-3xl custom-bg-card border custom-border space-y-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-lg">
              <i class="fa-solid fa-arrows-rotate"></i>
            </div>
            <div>
              <h3 class="text-sm font-black custom-text">Khoản Chi Định Kỳ</h3>
              <p class="text-[11px] custom-text-secondary">Tiền nhà, tiền mạng, các gói Netflix, Spotify...</p>
            </div>
          </div>
          <button onclick="closeSettingsDetail(); openModal('recurring');" class="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs shadow-md shadow-teal-500/20 active:scale-95 transition-all">
            + Thêm Mới
          </button>
        </div>

        <div class="p-4 rounded-2xl custom-bg-input border custom-border text-center text-xs custom-text-secondary">
          Bấm "+ Thêm Mới" để thiết lập khoản chi tự động lặp lại hàng tháng mà không cần nhập tay!
        </div>
      </div>
    `;
  }

  // ==============================================================
  // CHI TIẾT 7: QUÁN RUỘT (FAVORITES DETAIL)
  // ==============================================================
  function renderFavoritesDetailHTML() {
    return `
      <div class="p-6 rounded-3xl custom-bg-card border custom-border space-y-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-lg">
              <i class="fa-solid fa-heart"></i>
            </div>
            <div>
              <h3 class="text-sm font-black custom-text">Quán Ruột & Địa Điểm Yêu Thích</h3>
              <p class="text-[11px] custom-text-secondary">Lưu danh sách quán cafe, ăn uống quen thuộc</p>
            </div>
          </div>
          <button onclick="closeSettingsDetail(); openModal('favoritePlaces');" class="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 active:scale-95 transition-all">
            + Thêm Quán
          </button>
        </div>

        <div class="p-4 rounded-2xl custom-bg-input border custom-border text-center text-xs custom-text-secondary">
          Quản lý toàn bộ quán ruột, pass wifi và món ngon yêu thích để tìm kiếm trong 1 giây!
        </div>
      </div>
    `;
  }

  // ==============================================================
  // CHI TIẾT 8: GIAO DIỆN & NỀN (THEMES DETAIL)
  // ==============================================================
  function renderThemesDetailHTML() {
    const themeEngine = window.FinTheme;
    const colorThemes = (themeEngine && typeof themeEngine.getColorThemes === 'function')
      ? themeEngine.getColorThemes()
      : [];
    const curState = (themeEngine && typeof themeEngine.getState === 'function')
      ? themeEngine.getState()
      : { colorTheme: 'theme-ios-deepspace' };

    return `
      <div class="space-y-6">
        <!-- BẢNG CHỦ ĐỀ MÀU CHUẨN APPLE iOS -->
        <div class="p-6 rounded-3xl custom-bg-card border custom-border space-y-4 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-black text-sm custom-text flex items-center gap-2">
                <i class="fa-solid fa-palette text-sky-400"></i> Bảng Màu Chuẩn Apple iOS (8 Màu Sắc Đẳng Cấp)
              </h4>
              <p class="text-[11px] custom-text-secondary">Tone màu kính mờ & Titanium lấy cảm hứng trực tiếp từ iOS</p>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/25">
              iOS Palettes
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 animate-fadeIn">
            ${colorThemes.map(t => {
              const isSelected = curState.colorTheme === t.id;
              return `
                <div onclick="window.FinTheme?.setColorTheme('${t.id}'); openSettingsDetail('themes');" 
                  class="p-3.5 rounded-2xl border ${isSelected ? 'border-sky-400 bg-sky-500/15 shadow-md shadow-sky-500/20' : 'custom-border custom-bg-input'} flex items-center gap-3 cursor-pointer hover:border-sky-400 active:scale-98 transition-all">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center border border-white/20 shadow-inner shrink-0" style="background: ${t.bgPreview};">
                    <span class="w-3.5 h-3.5 rounded-full" style="background: ${t.hex};"></span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-xs font-black custom-text flex items-center gap-1.5 truncate">
                      <span>${t.name}</span>
                      ${isSelected ? '<i class=\"fa-solid fa-circle-check text-sky-400 text-xs\"></i>' : ''}
                    </div>
                    <div class="text-[10px] custom-text-secondary truncate">${t.sub}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- HIỆU ỨNG ĐỒNG TIỀN VÀNG FINMASTER -->
        <div class="p-6 rounded-3xl custom-bg-card border custom-border space-y-3 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-black text-xs uppercase tracking-wider custom-text flex items-center gap-2">
                <i class="fa-solid fa-coins text-amber-400"></i> Hiệu Ứng Đồng Tiền Bay Vào Thẻ
              </h4>
              <p class="text-[11px] custom-text-secondary mt-0.5">Tự động kích hoạt khi nhập hoặc lưu giao dịch thành công</p>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/25">Đang bật</span>
          </div>
          <button type="button" onclick="if(window.triggerCoinBurstAnimation) window.triggerCoinBurstAnimation();" class="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/30 text-amber-300 font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md">
            <i class="fa-solid fa-coins text-amber-400"></i>
            <span>Bấm Thử Hiệu Ứng Đồng Tiền Bay Vào Thẻ</span>
          </button>
        </div>

        <!-- TÙY CHỌN BỔ TRỢ -->
        <div class="p-6 rounded-3xl custom-bg-card border custom-border space-y-3 shadow-sm">
          <label class="block text-xs font-bold custom-text-secondary uppercase">Chế Độ Hiển Thị Khác</label>
          <div class="grid grid-cols-2 gap-3">
            <button onclick="document.getElementById('bg-image-input').click()" class="p-3.5 rounded-2xl custom-bg-input border custom-border flex flex-col items-center justify-center gap-2 hover:border-indigo-500 active:scale-95 transition-all">
              <i class="fa-solid fa-image text-xl text-indigo-400"></i>
              <span class="text-xs font-bold custom-text">Đổi Ảnh Nền Riêng</span>
            </button>
            <button onclick="toggleDarkMode(); closeSettingsDetail();" class="p-3.5 rounded-2xl custom-bg-input border custom-border flex flex-col items-center justify-center gap-2 hover:border-indigo-500 active:scale-95 transition-all">
              <i class="fa-solid fa-circle-half-stroke text-xl text-amber-400"></i>
              <span class="text-xs font-bold custom-text">Sáng / Tối (Dark)</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ==============================================================
  // CHI TIẾT 9: ÂM THANH TOÀN DIỆN (SOUND ENGINE PRO)
  // ==============================================================
  function renderSoundDetailHTML() {
    const soundEngine = window.FinSound;
    const cfg = soundEngine ? soundEngine.getConfig() : { enabled: true, volume: 0.7, pack: 'ios', haptic: true };
    const packs = soundEngine ? soundEngine.getPacks() : [];

    return `
      <div class="p-6 rounded-3xl custom-bg-card border custom-border space-y-5 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-black text-sm custom-text flex items-center gap-2">
              <i class="fa-solid fa-volume-high text-cyan-400"></i> Trung Tâm m Thanh Toàn Hệ Thống
            </h4>
            <p class="text-[11px] custom-text-secondary">Web Audio API mô phỏng xúc giác, thao tác nút bấm, xóa và tiền về</p>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/25">
            Engine V3.0
          </span>
        </div>

        <!-- 1. CÔNG TẮC BẬT / TẮT ÂM THANH -->
        <div class="p-4 rounded-2xl custom-bg-input border custom-border flex items-center justify-between">
          <div>
            <div class="text-xs font-bold custom-text">Bật âm thanh hiệu ứng</div>
            <div class="text-[11px] custom-text-secondary">Phát âm thanh khi chạm nút, lưu tiền, xóa mục, chuyển trang</div>
          </div>
          <button type="button" onclick="window.FinSound?.setEnabled(${!cfg.enabled}); openSettingsDetail('sound');" 
            class="px-3.5 py-2 rounded-xl ${cfg.enabled ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-400'} text-xs font-bold active:scale-95 transition-all">
            ${cfg.enabled ? '<i class=\"fa-solid fa-volume-high\"></i> Đang Bật' : '<i class=\"fa-solid fa-volume-xmark\"></i> Đang Tắt'}
          </button>
        </div>

        <!-- 2. THANH TRƯỢT ÂM LƯỢNG -->
        <div class="p-4 rounded-2xl custom-bg-input border custom-border space-y-2">
          <div class="flex items-center justify-between text-xs font-bold custom-text">
            <span>m Lượng Hệ Thống</span>
            <span class="text-cyan-400">${Math.round(cfg.volume * 100)}%</span>
          </div>
          <input type="range" min="0" max="1" step="0.05" value="${cfg.volume}" 
            onchange="window.FinSound?.setVolume(this.value); openSettingsDetail('sound');"
            class="w-full accent-cyan-400 cursor-pointer">
        </div>

        <!-- 3. CHỌN SOUND PACKS -->
        <div class="space-y-2">
          <label class="block text-xs font-bold custom-text-secondary uppercase">Chọn Gói m Thanh (4 Sound Packs)</label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            ${packs.map(p => {
              const isSelected = cfg.pack === p.id;
              return `
                <div onclick="window.FinSound?.setPack('${p.id}'); openSettingsDetail('sound');" 
                  class="p-3.5 rounded-2xl border ${isSelected ? 'border-cyan-400 bg-cyan-500/15 shadow-sm shadow-cyan-500/20' : 'custom-border custom-bg-input'} flex items-center gap-3 cursor-pointer hover:border-cyan-400 active:scale-98 transition-all">
                  <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-cyan-400 text-lg shrink-0">
                    <i class="fa-solid ${p.icon}"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-xs font-black custom-text flex items-center gap-1.5 truncate">
                      <span>${p.name}</span>
                      ${isSelected ? '<i class=\"fa-solid fa-circle-check text-cyan-400 text-xs\"></i>' : ''}
                    </div>
                    <div class="text-[10px] custom-text-secondary truncate">${p.desc}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 4. BẢNG NGHE THỬ TỪNG LOẠI ÂM THANH -->
        <div class="space-y-2">
          <label class="block text-xs font-bold custom-text-secondary uppercase">Nghe Thử Từng Loại m Thanh</label>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <button type="button" onclick="window.FinSound?.play('click')" class="p-3 rounded-xl custom-bg-input border custom-border flex items-center justify-between hover:border-cyan-400 active:scale-95 transition-all">
              <span class="font-bold custom-text"><i class="fa-solid fa-arrow-pointer text-indigo-400 mr-1.5"></i> Nút Bấm</span>
              <span class="text-[10px] text-cyan-400 font-bold">Nghe</span>
            </button>

            <button type="button" onclick="window.FinSound?.play('trash')" class="p-3 rounded-xl custom-bg-input border custom-border flex items-center justify-between hover:border-rose-400 active:scale-95 transition-all">
              <span class="font-bold custom-text"><i class="fa-solid fa-trash-can text-rose-400 mr-1.5"></i> Xóa Mục</span>
              <span class="text-[10px] text-rose-400 font-bold">Nghe</span>
            </button>

            <button type="button" onclick="window.FinSound?.play('coin')" class="p-3 rounded-xl custom-bg-input border custom-border flex items-center justify-between hover:border-amber-400 active:scale-95 transition-all">
              <span class="font-bold custom-text"><i class="fa-solid fa-coins text-amber-400 mr-1.5"></i> Tiền Rơi</span>
              <span class="text-[10px] text-amber-400 font-bold">Nghe</span>
            </button>

            <button type="button" onclick="window.FinSound?.play('success')" class="p-3 rounded-xl custom-bg-input border custom-border flex items-center justify-between hover:border-emerald-400 active:scale-95 transition-all">
              <span class="font-bold custom-text"><i class="fa-solid fa-circle-check text-emerald-400 mr-1.5"></i> Lưu Thành Công</span>
              <span class="text-[10px] text-emerald-400 font-bold">Nghe</span>
            </button>

            <button type="button" onclick="window.FinSound?.play('pop')" class="p-3 rounded-xl custom-bg-input border custom-border flex items-center justify-between hover:border-purple-400 active:scale-95 transition-all">
              <span class="font-bold custom-text"><i class="fa-solid fa-wand-magic-sparkles text-purple-400 mr-1.5"></i> Nút Nổi Pop</span>
              <span class="text-[10px] text-purple-400 font-bold">Nghe</span>
            </button>

            <button type="button" onclick="window.FinSound?.play('switchView')" class="p-3 rounded-xl custom-bg-input border custom-border flex items-center justify-between hover:border-sky-400 active:scale-95 transition-all">
              <span class="font-bold custom-text"><i class="fa-solid fa-arrows-turn-to-dots text-sky-400 mr-1.5"></i> Đổi Trang</span>
              <span class="text-[10px] text-sky-400 font-bold">Nghe</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ==============================================================
  // CHI TIẾT: BÀN PHÍM ẢO FINMASTER PRO (KEYBOARD DETAIL)
  // ==============================================================
  function renderKeyboardDetailHTML() {
    const kb = window.FinKeyboard;
    const stateKb = kb ? kb.getState() : { enabled: true, theme: 'obsidian', soundEnabled: true, soundProfile: 'mech' };
    const themes = kb ? kb.getThemes() : [];

    return `
      <div class="p-6 rounded-3xl custom-bg-card border custom-border space-y-5 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-black text-sm custom-text flex items-center gap-2">
              <i class="fa-solid fa-keyboard text-purple-400"></i> Bàn Phím Độc Quyền FinMaster Pro
            </h4>
            <p class="text-[11px] custom-text-secondary">Thay thế hoàn toàn bàn phím mặc định của điện thoại / thiết bị</p>
          </div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
            V3.0 Smart
          </span>
        </div>

        <!-- CÔNG TẮC BẬT / TẮT BÀN PHÍM TÙY BIẾN -->
        <div class="p-4 rounded-2xl custom-bg-input border custom-border flex items-center justify-between">
          <div>
            <div class="text-xs font-bold custom-text">Kích hoạt bàn phím FinMaster</div>
            <div class="text-[11px] custom-text-secondary">Tự động chặn bàn phím ảo của thiết bị khi nhấp vào ô nhập</div>
          </div>
          <button type="button" onclick="const res = window.FinKeyboard?.toggleCustomKeyboard(); openSettingsDetail('keyboard');" class="px-3.5 py-2 rounded-xl ${stateKb.customKeyboardEnabled ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'} text-xs font-bold transition-all active:scale-95">
            ${stateKb.customKeyboardEnabled ? '<i class=\"fa-solid fa-check\"></i> Đang Bật' : '<i class=\"fa-solid fa-ban\"></i> Đang Tắt'}
          </button>
        </div>

        <!-- CÀI ĐẶT ÂM THANH GÕ PHÍM CƠ HỌC -->
        <div class="p-4 rounded-2xl custom-bg-input border custom-border space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs font-bold custom-text">m thanh phản hồi khi gõ phím</div>
              <div class="text-[11px] custom-text-secondary">Web Audio API mô phỏng bàn phím cơ tactile click</div>
            </div>
            <button type="button" onclick="localStorage.setItem('fin_kb_sound', '${stateKb.soundEnabled ? 'false' : 'true'}'); if(window.FinKeyboard) window.FinKeyboard.getState().soundEnabled = ${!stateKb.soundEnabled}; openSettingsDetail('keyboard');" class="px-3 py-1.5 rounded-xl ${stateKb.soundEnabled ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'} text-xs font-bold transition-all active:scale-95">
              ${stateKb.soundEnabled ? '<i class=\"fa-solid fa-volume-high\"></i> Bật' : '<i class=\"fa-solid fa-volume-xmark\"></i> Tắt'}
            </button>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-1">
            <button type="button" onclick="localStorage.setItem('fin_kb_sound_type', 'mech'); if(window.FinKeyboard) window.FinKeyboard.getState().soundProfile = 'mech'; openSettingsDetail('keyboard');" class="p-2.5 rounded-xl border ${stateKb.soundProfile === 'mech' ? 'border-purple-400 bg-purple-500/10 text-purple-300' : 'custom-border custom-bg-card custom-text-secondary'} text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all">
              <i class="fa-solid fa-gear"></i> Phím cơ Tactile
            </button>
            <button type="button" onclick="localStorage.setItem('fin_kb_sound_type', 'bubble'); if(window.FinKeyboard) window.FinKeyboard.getState().soundProfile = 'bubble'; openSettingsDetail('keyboard');" class="p-2.5 rounded-xl border ${stateKb.soundProfile === 'bubble' ? 'border-purple-400 bg-purple-500/10 text-purple-300' : 'custom-border custom-bg-card custom-text-secondary'} text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all">
              <i class="fa-solid fa-circle-dot"></i> Bong bóng Pop
            </button>
          </div>
        </div>

        <!-- DANH SÁCH 7 CHỦ ĐỀ SIÊU ĐẸP -->
        <div class="space-y-2">
          <label class="block text-xs font-bold custom-text-secondary uppercase">7 Bộ Chủ Đề Bàn Phím Đẳng Cấp</label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            ${themes.map(t => {
              const isSelected = stateKb.theme === t.id;
              return `
                <div onclick="if(window.FinKeyboard) window.FinKeyboard.setTheme('${t.id}'); openSettingsDetail('keyboard');" class="p-3 rounded-2xl border ${isSelected ? 'border-sky-400 bg-sky-500/15 shadow-sm shadow-sky-500/20' : 'custom-border custom-bg-input'} flex items-center gap-3 cursor-pointer hover:border-sky-300 active:scale-98 transition-all">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center border border-white/20 shadow-inner flex-shrink-0" style="background: ${t.bgPreview};">
                    <i class="fa-solid ${t.icon}" style="color: ${t.accentColor}; font-size: 1.1rem;"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-xs font-black custom-text flex items-center gap-1.5 truncate">
                      <span>${t.name}</span>
                      ${isSelected ? '<i class=\"fa-solid fa-circle-check text-sky-400 text-[10px]\"></i>' : ''}
                    </div>
                    <div class="text-[10px] custom-text-secondary truncate">${t.desc}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Ô THỬ NGHIỆM GÕ PHÍM TRỰC TIẾP -->
        <div class="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-indigo-500/30 space-y-2.5">
          <div class="flex items-center gap-2 text-indigo-300 font-bold text-xs">
            <i class="fa-solid fa-vial"></i> Khu Vực Thử Nghiệm Bàn Phím
          </div>
          <p class="text-[11px] text-slate-400">Chạm vào ô dưới để mở bàn phím ảo FinMaster, trải nghiệm tính toán và gõ văn bản:</p>
          <div class="space-y-2">
            <input type="text" inputmode="numeric" placeholder="Chạm thử ô Số tiền (Mở Numpad & Máy tính)..." class="w-full p-3 rounded-xl custom-bg-input custom-text text-sm font-bold border custom-border outline-none focus:border-indigo-400">
            <input type="text" placeholder="Chạm thử ô Ghi chú (Mở QWERTY & Tiếng Việt)..." class="w-full p-3 rounded-xl custom-bg-input custom-text text-sm font-medium border custom-border outline-none focus:border-indigo-400">
          </div>
        </div>
      </div>
    `;
  }

  // ==============================================================
  // CHI TIẾT 10: DANH MỤC (CATEGORIES DETAIL)
  // ==============================================================
  function renderCategoriesDetailHTML() {
    const cats = state.categories || [];
    return `
      <div class="p-6 rounded-3xl custom-bg-card border custom-border space-y-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-black text-sm custom-text">Quản Lý Toàn Bộ Danh Mục</h4>
            <p class="text-[11px] custom-text-secondary">Đang có ${cats.length} danh mục chi tiêu & thu nhập</p>
          </div>
          <button onclick="closeSettingsDetail(); openCategoryManager();" class="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-all">
            + Thêm Danh Mục
          </button>
        </div>

        <div class="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1 custom-scrollbar pt-2">
          ${cats.map(c => `
            <div onclick="closeSettingsDetail(); openCategoryManager('${c.id}');" class="p-3 rounded-2xl custom-bg-input border custom-border flex items-center gap-2.5 cursor-pointer hover:border-indigo-400 active:scale-95 transition-all">
              <span class="text-xl">${c.icon || '📁'}</span>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-bold custom-text truncate">${c.name}</div>
                <div class="text-[10px] ${c.type === 'income' ? 'text-emerald-400' : 'text-rose-400'} font-semibold">${c.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ==============================================================
  // CHI TIẾT 11: MÔ-ĐUN SIÊU ỨNG DỤNG (MODULES DETAIL)
  // ==============================================================
  // CHI TIẾT 11: MENU ỨNG DỤNG & PHÂN HỆ (MODULES DETAIL)
  // ==============================================================
  function renderModulesDetailHTML() {
    const DEFAULT_MODULES = [
      { id: "calendar", name: "Lịch trình", icon: "fa-calendar-days", color: "text-blue-500" },
      { id: "tasks", name: "Quản lý Công việc", icon: "fa-clipboard-check", color: "text-indigo-500" },
      { id: "debts", name: "Sổ Nợ & Cho vay", icon: "fa-hand-holding-dollar", color: "text-rose-500" },
      { id: "goals", name: "Mục tiêu Tiết kiệm", icon: "fa-bullseye", color: "text-amber-500" },
      { id: "budgets", name: "Ngân sách chi tiêu", icon: "fa-wallet", color: "text-emerald-500" },
      { id: "favorites", name: "Sổ tay Quán ruột", icon: "fa-heart", color: "text-pink-500" },
      { id: "map", name: "Bản đồ nhiệt & Vị trí", icon: "fa-map-location-dot", color: "text-cyan-500" },
      { id: "custommaps", name: "Tự tạo Bản đồ", icon: "fa-map-pin", color: "text-purple-500" },
      { id: "trips", name: "Lên kế hoạch Chuyến đi", icon: "fa-plane-departure", color: "text-orange-500" },
      { id: "grab", name: "Chốt ca Tài xế Grab", icon: "fa-motorcycle", color: "text-green-600" },
      { id: "diary", name: "Xem nhật ký của bạn", icon: "fa-book-open", color: "text-orange-600" },
      { id: "running", name: "Theo dõi Chạy bộ", icon: "fa-person-running", color: "text-red-500" },
      { id: "work", name: "Chấm công & Ký sự", icon: "fa-briefcase", color: "text-teal-500" },
      { id: "gallery", name: "Thư viện Ảnh", icon: "fa-images", color: "text-fuchsia-500" },
      { id: "report", name: "Báo cáo Wrapped E-Statement", icon: "fa-file-invoice", color: "text-emerald-400" },
    ];
    const modules = (window.OPTIONAL_MODULES && window.OPTIONAL_MODULES.length > 0) ? window.OPTIONAL_MODULES : DEFAULT_MODULES;
    const modSettings = window.state?.moduleSettings || {};

    return `
      <div class="p-6 rounded-3xl custom-bg-card border custom-border space-y-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-black text-sm custom-text">Menu Ứng Dụng & Phân Hệ</h4>
            <p class="text-[11px] custom-text-secondary">Bật hoặc tắt từng trang. Trang bật sẽ ngay lập tức xuất hiện trên thanh điều hướng!</p>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/25">
            ${modules.length} Phân Hệ
          </span>
        </div>

        <div class="space-y-2.5 pt-2">
          ${modules.map(mod => {
            const isChecked = modSettings[mod.id] !== false;
            return `
              <div class="flex items-center justify-between p-3.5 custom-bg-input border custom-border rounded-2xl shadow-sm hover:border-purple-500/40 transition-colors">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${mod.color} border custom-border text-base shrink-0">
                    <i class="fa-solid ${mod.icon}"></i>
                  </div>
                  <div>
                    <div class="text-xs font-black custom-text">${mod.name}</div>
                    <div class="text-[10px] custom-text-secondary">Mã: view-${mod.id}</div>
                  </div>
                </div>

                <label class="relative inline-flex items-center cursor-pointer active:scale-90 transition-transform">
                  <input type="checkbox" onchange="toggleAppModule('${mod.id}', this.checked); openSettingsDetail('modules');" ${isChecked ? 'checked' : ''} class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all border custom-border shadow-sm"></div>
                </label>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // ==============================================================
  // CHI TIẾT 12: DỮ LIỆU & SAO LƯU (VAULT DETAIL)
  // ==============================================================
  function renderVaultDetailHTML() {
    return `
      <div class="p-6 rounded-3xl custom-bg-card border custom-border space-y-4 shadow-sm">
        <h4 class="font-black text-sm custom-text flex items-center gap-2">
          <i class="fa-solid fa-cloud-arrow-down text-blue-500"></i> Trung Tâm Sao Lưu & An Toàn Dữ Liệu
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button onclick="exportToExcel()" class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-3 hover:bg-emerald-500/20 active:scale-95 transition-all">
            <i class="fa-solid fa-file-excel text-2xl"></i>
            <div class="text-left">
              <div class="font-black text-sm">Xuất Excel Pro</div>
              <div class="text-[10px] opacity-80">Báo cáo thu chi chi tiết</div>
            </div>
          </button>

          <button onclick="cleanOldImages()" class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center gap-3 hover:bg-amber-500/20 active:scale-95 transition-all">
            <i class="fa-solid fa-broom text-2xl"></i>
            <div class="text-left">
              <div class="font-black text-sm">Dọn Dẹp Ảnh Cũ</div>
              <div class="text-[10px] opacity-80">Giải phóng dung lượng máy</div>
            </div>
          </button>
        </div>

        <div class="pt-4 border-t border-slate-700/50">
          <button onclick="clearAllData()" class="w-full py-3.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 font-black text-xs active:scale-95 transition-all">
            <i class="fa-solid fa-skull mr-1.5"></i> Xóa Dữ Liệu & Khởi Động Lại Hệ Thống
          </button>
        </div>
      </div>
    `;
  }

})();
