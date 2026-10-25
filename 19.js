/* ============================================================
   TX-UI-UPGRADE.JS — Motion Layer (drop-in, không sửa tx-detail.js)
   Import SAU tx-detail.js
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 1. COUNT-UP MƯỢT cho header ---------- */
  const countUp = (el, target, dur = 900) => {
    if (!el) return;
    const from = parseFloat((el.dataset.val || "0").replace(/\D/g, "")) || 0;
    const start = performance.now();
    const fmt = (window.formatMoney) ? window.formatMoney : (n) => n.toLocaleString("vi-VN") + " ₫";
    el.dataset.val = target;
    if (from === target) { el.innerText = fmt(target); return; }
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 4); // easeOutQuart
      el.innerText = fmt(Math.round(from + (target - from) * e));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  // Override animateMoney cũ → mượt hơn
  window.animateMoney = countUp;

  /* ---------- 2. STAGGER REVEAL sau mỗi lần render ---------- */
  const stagger = (containerSel) => {
    const root = document.querySelector(containerSel);
    if (!root) return;
    const items = root.querySelectorAll(".swipe-item, .swipe-content, .grid > div[class*='rounded']");
    items.forEach((it, i) => {
      if (it.classList.contains("tx-reveal")) return;
      it.classList.add("tx-reveal");
      it.style.animationDelay = Math.min(i % 15, 10) * 0.035 + "s";
    });
  };

  const observeRender = () => {
    const target = document.getElementById("tx-list-container");
    if (!target) return;
    new MutationObserver(() => stagger("#tx-list-container"))
      .observe(target, { childList: true, subtree: true });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", observeRender);
  else observeRender();

  /* ---------- 3. RIPPLE cho mọi nút ---------- */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button, .swipe-content");
    if (!btn || btn.classList.contains("tx-rippled")) return;
    const rect = btn.getBoundingClientRect();
    const r = Math.max(rect.width, rect.height);
    const s = document.createElement("span");
    s.className = "tx-ripple";
    s.style.cssText = `width:${r}px;height:${r}px;left:${e.clientX - rect.left - r/2}px;top:${e.clientY - rect.top - r/2}px;position:absolute;overflow:hidden;`;
    const oldPos = getComputedStyle(btn).position;
    if (oldPos === "static") btn.style.position = "relative";
    btn.appendChild(s);
    setTimeout(() => s.remove(), 600);
  }, { passive: true });

  /* ---------- 4. SKELETON khi load more ---------- */
  const oldLoadMore = window.loadMoreTransactions;
  window.loadMoreTransactions = function () {
    const sensor = document.getElementById("tx-load-sensor");
    if (sensor && !sensor.dataset.sk) {
      sensor.dataset.sk = "1";
      const sk = document.createElement("div");
      sk.innerHTML = '<div class="tx-skeleton mb-3"></div><div class="tx-skeleton mb-3" style="width:85%"></div><div class="tx-skeleton" style="width:92%"></div>';
      sensor.parentNode.insertBefore(sk, sensor);
      setTimeout(() => sk.remove(), 400);
    }
    oldLoadMore && oldLoadMore.apply(this, arguments);
  };

  /* ---------- 5. SWIPE: thêm vibration nhẹ (haptic feel) ---------- */
  const oldInitSwipe = window.initSwipeActions;
  window.initSwipeActions = function () {
    oldInitSwipe && oldInitSwipe.apply(this, arguments);
    document.querySelectorAll(".swipe-item").forEach((item) => {
      if (item.dataset.haptic) return;
      item.dataset.haptic = "1";
      item.addEventListener("touchend", () => {
        const c = item.querySelector(".swipe-content");
        if (c && Math.abs(parseFloat(c.dataset.translate || 0)) > 50 && navigator.vibrate) {
          navigator.vibrate(8);
        }
      }, { passive: true });
    });
  };

  /* ---------- 6. Modal: tự mở nhạc nổi + lock scroll ---------- */
  const oldOpen = window.openTxDetail;
  if (oldOpen) {
    window.openTxDetail = function (id) {
      document.body.style.overflow = "hidden";
      oldOpen(id);
    };
  }
  const oldClose = window.closeTxDetail;
  if (oldClose) {
    window.closeTxDetail = function () {
      document.body.style.overflow = "";
      oldClose();
    };
  }

  /* ---------- 7. Tilt 3D nhẹ cho card grid (desktop) ---------- */
  if (matchMedia("(pointer:fine)").matches) {
    document.addEventListener("mousemove", (e) => {
      const card = e.target.closest("#tx-inner-list .grid > div");
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(600px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) translateY(-3px)`;
      card.style.transition = "transform .1s ease-out";
    }, { passive: true });
    document.addEventListener("mouseout", (e) => {
      const card = e.target.closest("#tx-inner-list .grid > div");
      if (card) { card.style.transform = ""; card.style.transition = "transform .4s cubic-bezier(0.34,1.56,0.64,1)"; }
    }, { passive: true });
  }
})();