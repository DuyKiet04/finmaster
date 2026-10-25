// ==============================================================
// FILE: form-pro.js - UNIVERSAL FINTECH FORM DESIGN SYSTEM (V3.0)
// Thiết Kế Lại Toàn Bộ Form Nhập Toàn Bộ Các Trang Siêu Đẹp
// ==============================================================

(function initFormProSystem() {

  // Helper hỗ trợ cộng nhanh số tiền bằng nút bấm
  window.addPresetToInput = function(inputId, addAmount) {
    const el = document.getElementById(inputId);
    if (!el) return;
    let cur = (typeof getRawNumber === 'function' ? getRawNumber(el.value) : parseInt((el.value || '').replace(/\D/g, '') || 0)) || 0;
    if (addAmount === 0) {
      el.value = "";
    } else {
      cur += addAmount;
      el.value = cur.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    if (typeof playSound === 'function') playSound("pop");
  };

  // Helper tạo hàng nút Quick Amount Presets
  function renderQuickAmountPills(targetInputId) {
    return `
      <div class="flex flex-wrap items-center gap-1.5 pt-2 justify-center">
        <button type="button" onclick="addPresetToInput('${targetInputId}', 50000)" class="quick-amt-pill">+50k</button>
        <button type="button" onclick="addPresetToInput('${targetInputId}', 100000)" class="quick-amt-pill">+100k</button>
        <button type="button" onclick="addPresetToInput('${targetInputId}', 200000)" class="quick-amt-pill">+200k</button>
        <button type="button" onclick="addPresetToInput('${targetInputId}', 500000)" class="quick-amt-pill">+500k</button>
        <button type="button" onclick="addPresetToInput('${targetInputId}', 1000000)" class="quick-amt-pill">+1Tr</button>
        <button type="button" onclick="addPresetToInput('${targetInputId}', 5000000)" class="quick-amt-pill hidden sm:inline-flex">+5Tr</button>
        <button type="button" onclick="addPresetToInput('${targetInputId}', 0)" class="quick-amt-pill text-rose-400 hover:text-rose-500" title="Xóa số tiền">
          <i class="fa-solid fa-rotate-left text-[10px]"></i> Xóa
        </button>
      </div>
    `;
  }

  // Hook vào hàm openModal gốc
  const origOpenModal = window.openModal;

  window.openModal = function(type, id = null, tripIdPreset = null) {
    // Gọi hàm gốc để chuẩn bị dữ liệu và mở modal
    if (origOpenModal) {
      origOpenModal(type, id, tripIdPreset);
    }

    const modal = document.getElementById("global-modal");
    const title = document.getElementById("modal-title");
    const sub = document.getElementById("modal-subtitle");
    const badge = document.getElementById("modal-icon-badge");
    const body = document.getElementById("modal-body");

    if (!modal || !body) return;

    // Cập nhật biểu tượng và phụ đề cho từng loại form
    const FORM_META = {
      transaction: { icon: "fa-receipt", color: "text-indigo-400", sub: "Ghi chép thu chi & quản lý dòng tiền" },
      walletAction: { icon: "fa-wallet", color: "text-emerald-400", sub: "Chuyển tiền, nạp tiền & thiết lập thẻ ví" },
      debt: { icon: "fa-hand-holding-dollar", color: "text-amber-400", sub: "Quản lý công nợ, vay mượn & hạn trả" },
      debtPayment: { icon: "fa-coins", color: "text-teal-400", sub: "Thanh toán từng phần hoặc tất toán nợ" },
      goal: { icon: "fa-bullseye", color: "text-purple-400", sub: "Heo đất tích lũy & mục tiêu tài chính" },
      addTripFund: { icon: "fa-piggy-bank", color: "text-pink-400", sub: "Nạp tiền vào quỹ chung chuyến đi" },
      budget: { icon: "fa-chart-pie", color: "text-blue-400", sub: "Thiết lập hạn mức chi tiêu theo danh mục" },
      trip: { icon: "fa-plane-departure", color: "text-orange-400", sub: "Lập kế hoạch du lịch & chia tiền quỹ" },
      itinerary: { icon: "fa-map-location-dot", color: "text-cyan-400", sub: "Lịch trình hoạt động chuyến đi" },
      category: { icon: "fa-shapes", color: "text-fuchsia-400", sub: "Kho danh mục thu chi & icon biểu tượng" },
      task: { icon: "fa-clipboard-check", color: "text-emerald-400", sub: "Công việc, deadline & độ ưu tiên" },
      splitBill: { icon: "fa-users", color: "text-rose-400", sub: "Chia đều tiền nhóm hoặc theo tỷ lệ" },
      grabShift: { icon: "fa-motorcycle", color: "text-green-500", sub: "Chốt ca tài xế & tính toán lợi nhuận ròng" },
      addInvest: { icon: "fa-gem", color: "text-amber-400", sub: "Thêm tài sản tích sản vào danh mục" }
    };

    const meta = FORM_META[type] || { icon: "fa-pen-to-square", color: "text-primary-500", sub: "Biểu mẫu FinMaster Pro" };
    if (badge) {
      badge.innerHTML = `<i class="fa-solid ${meta.icon} ${meta.color}"></i>`;
    }
    if (sub) {
      sub.innerText = meta.sub;
    }

    // ==============================================================
    // 1. TỰ ĐỘNG BỔ SUNG QUICK PRESETS CHO CÁC FORM CHƯA CÓ
    // ==============================================================
    setTimeout(() => {
      // Form Giao dịch (frm-tx)
      const amtInput = document.getElementById("m-amt");
      if (amtInput && !document.getElementById("tx-quick-presets")) {
        const wrap = document.createElement("div");
        wrap.id = "tx-quick-presets";
        wrap.className = "w-full pt-1";
        wrap.innerHTML = renderQuickAmountPills("m-amt");
        amtInput.parentElement?.appendChild(wrap);
      }

      // Form Chuyển tiền (tr-amt)
      const trAmt = document.getElementById("tr-amt");
      if (trAmt && !document.getElementById("tr-quick-presets")) {
        const wrap = document.createElement("div");
        wrap.id = "tr-quick-presets";
        wrap.innerHTML = renderQuickAmountPills("tr-amt");
        trAmt.parentElement?.appendChild(wrap);
      }

      // Form Nạp tiền (topup-amount)
      const topupAmt = document.getElementById("topup-amount");
      if (topupAmt && !document.getElementById("topup-quick-presets")) {
        const wrap = document.createElement("div");
        wrap.id = "topup-quick-presets";
        wrap.innerHTML = renderQuickAmountPills("topup-amount");
        topupAmt.parentElement?.appendChild(wrap);
      }

      // Form Nợ (d-amount)
      const debtAmt = document.getElementById("d-amount");
      if (debtAmt && !document.getElementById("debt-quick-presets")) {
        const wrap = document.createElement("div");
        wrap.id = "debt-quick-presets";
        wrap.innerHTML = renderQuickAmountPills("d-amount");
        debtAmt.parentElement?.appendChild(wrap);
      }

      // Form Mục tiêu Heo Đất (g-amt)
      const goalAmt = document.getElementById("g-amt");
      if (goalAmt && !document.getElementById("goal-quick-presets")) {
        const wrap = document.createElement("div");
        wrap.id = "goal-quick-presets";
        wrap.innerHTML = renderQuickAmountPills("g-amt");
        goalAmt.parentElement?.appendChild(wrap);
      }

      // Form Ngân Sách (b-amt)
      const bAmt = document.getElementById("b-amt");
      if (bAmt && !document.getElementById("b-quick-presets")) {
        const wrap = document.createElement("div");
        wrap.id = "b-quick-presets";
        wrap.innerHTML = renderQuickAmountPills("b-amt");
        bAmt.parentElement?.appendChild(wrap);
      }

      // Nâng cấp style các nút trong modal
      const submitBtn = body.querySelector('button[type="submit"]');
      if (submitBtn && !submitBtn.classList.contains("custom-shadow-lg")) {
        submitBtn.classList.add("custom-shadow-lg", "hover:brightness-110", "active:scale-95");
      }
    }, 50);
  };

  // ==============================================================
  // 2. MODAL FORM MỚI: THÊM TÀI SẢN ĐẦU TƯ (THAY THẾ PROMPT CŨ)
  // ==============================================================
  window.openAddInvestModal = function() {
    const modal = document.getElementById("global-modal");
    const title = document.getElementById("modal-title");
    const sub = document.getElementById("modal-subtitle");
    const badge = document.getElementById("modal-icon-badge");
    const body = document.getElementById("modal-body");

    if (!modal || !body) return;

    modal.classList.remove("hidden");
    if (title) title.innerText = "Thêm Tài Sản Tích Sản";
    if (sub) sub.innerText = "Theo dõi Vàng, Cổ phiếu, Quỹ mở & Tiền số";
    if (badge) badge.innerHTML = `<i class="fa-solid fa-gem text-amber-400"></i>`;

    body.innerHTML = `
      <form id="frm-add-invest" class="space-y-4">
        
        <!-- Loại tài sản -->
        <div>
          <label class="form-label"><i class="fa-solid fa-layer-group text-amber-400"></i> Loại Tài Sản</label>
          <div class="grid grid-cols-4 gap-2">
            <button type="button" onclick="setInvestType('gold')" id="inv-t-gold" class="py-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold flex flex-col items-center gap-1">
              <span>🥇</span><span>Vàng</span>
            </button>
            <button type="button" onclick="setInvestType('fund')" id="inv-t-fund" class="py-2 rounded-xl custom-bg-input text-gray-400 border custom-border text-xs font-bold flex flex-col items-center gap-1 hover:border-indigo-400">
              <span>📈</span><span>Quỹ ETF</span>
            </button>
            <button type="button" onclick="setInvestType('bank')" id="inv-t-bank" class="py-2 rounded-xl custom-bg-input text-gray-400 border custom-border text-xs font-bold flex flex-col items-center gap-1 hover:border-emerald-400">
              <span>🏦</span><span>Tiết Kiệm</span>
            </button>
            <button type="button" onclick="setInvestType('crypto')" id="inv-t-crypto" class="py-2 rounded-xl custom-bg-input text-gray-400 border custom-border text-xs font-bold flex flex-col items-center gap-1 hover:border-purple-400">
              <span>🪙</span><span>Crypto</span>
            </button>
          </div>
          <input type="hidden" id="inv-type-val" value="gold">
        </div>

        <!-- Tên tài sản -->
        <div>
          <label class="form-label"><i class="fa-solid fa-tag text-indigo-400"></i> Tên Tài Sản / Mã Cổ Phiếu</label>
          <input type="text" id="inv-name" required value="Vàng Nhẫn 9999 (1 chỉ)" placeholder="VD: Vàng SJC, FPT, VN30, BTC..." class="w-full">
        </div>

        <!-- Vốn ban đầu -->
        <div>
          <label class="form-label"><i class="fa-solid fa-coins text-emerald-400"></i> Vốn Giải Ngân Ban Đầu (VNĐ)</label>
          <input type="text" inputmode="numeric" oninput="formatInputCurrency(event)" id="inv-init-val" required value="7.600.000" class="w-full text-lg font-black text-emerald-400 text-right">
          <div class="w-full pt-1">
            ${renderQuickAmountPills("inv-init-val")}
          </div>
        </div>

        <!-- Giá trị thị trường hiện tại -->
        <div>
          <label class="form-label"><i class="fa-solid fa-arrow-trend-up text-amber-400"></i> Giá Trị Thị Trường Hiện Tại (VNĐ)</label>
          <input type="text" inputmode="numeric" oninput="formatInputCurrency(event)" id="inv-cur-val" required value="8.750.000" class="w-full text-lg font-black text-amber-400 text-right">
          <div class="w-full pt-1">
            ${renderQuickAmountPills("inv-cur-val")}
          </div>
        </div>

        <button type="submit" class="w-full py-4 custom-primary rounded-2xl font-black text-base flex items-center justify-center gap-2 mt-4 shadow-lg shadow-amber-500/25 active:scale-95 transition-all">
          <i class="fa-solid fa-check-circle"></i> Thêm Vào Danh Mục Tích Sản
        </button>
      </form>
    `;

    window.setInvestType = function(t) {
      document.getElementById('inv-type-val').value = t;
      ['gold', 'fund', 'bank', 'crypto'].forEach(k => {
        const b = document.getElementById('inv-t-' + k);
        if (!b) return;
        if (k === t) {
          b.className = "py-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold flex flex-col items-center gap-1";
        } else {
          b.className = "py-2 rounded-xl custom-bg-input text-gray-400 border custom-border text-xs font-bold flex flex-col items-center gap-1 hover:border-amber-400";
        }
      });

      const nameInput = document.getElementById('inv-name');
      if (nameInput) {
        if (t === 'gold') nameInput.value = "Vàng Nhẫn 9999 (1 chỉ)";
        else if (t === 'fund') nameInput.value = "Chứng Chỉ Quỹ VN30";
        else if (t === 'bank') nameInput.value = "Tiết Kiệm Ngân Hàng Kỳ Hạn 6T";
        else if (t === 'crypto') nameInput.value = "Bitcoin (BTC)";
      }
      if (typeof playSound === 'function') playSound("pop");
    };

    document.getElementById('frm-add-invest').onsubmit = function(e) {
      e.preventDefault();
      const type = document.getElementById('inv-type-val').value;
      const name = document.getElementById('inv-name').value;
      const initVal = getRawNumber(document.getElementById('inv-init-val').value) || 0;
      const curVal = getRawNumber(document.getElementById('inv-cur-val').value) || initVal;

      if (!state.investments) state.investments = [];
      state.investments.push({
        id: 'inv-' + (typeof generateId === 'function' ? generateId() : Date.now()),
        name: name,
        type: type,
        initialVal: initVal,
        currentVal: curVal
      });

      if (typeof saveData === 'function') saveData();
      closeModal();
      if (typeof window.renderInvest === 'function') window.renderInvest();
      if (typeof playSound === 'function') playSound("success");
      if (typeof confetti === 'function') confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    };
  };

})();
