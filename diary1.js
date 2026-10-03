// ==============================================================
// FILE: diary.js - NHẬT KÝ & KỶ NIỆM (TIMELINE, EMOTION, GALLERY)
// ==============================================================

window.currentDiaryTab = "timeline";

// 1. KHỞI TẠO GIAO DIỆN MÀN HÌNH NHẬT KÝ
function initDiaryModal() {
    if (document.getElementById('diary-modal')) return;

    const modalHtml = `
    <div id="diary-modal" class="fixed inset-0 z-[200000] custom-bg-body transition-transform duration-400 translate-y-full flex flex-col hidden">
        
        <!-- Header Kính mờ -->
        <div class="flex flex-col pt-3 pb-2 px-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl z-30 sticky top-0 border-b custom-border">
            <div class="flex justify-between items-center mb-3">
                <button onclick="closeDiary()" class="w-10 h-10 flex items-center justify-center active:scale-90 transition-transform custom-text opacity-70 hover:opacity-100 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <i class="fa-solid fa-chevron-down text-lg"></i>
                </button>
                <h2 class="font-black text-[17px] custom-text tracking-wide uppercase flex items-center gap-2"><i class="fa-solid fa-book-open text-primary-500"></i> Nhật Ký</h2>
                <div class="w-10"></div>
            </div>

            <!-- 3 Tabs Điều hướng -->
            <div class="flex bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-[16px] border custom-border">
                <button id="tab-diary-timeline" onclick="switchDiaryTab('timeline')" class="flex-1 py-2 text-[11px] uppercase tracking-wider font-bold rounded-[12px] transition-all custom-primary text-white shadow-sm">Dòng thời gian</button>
                <button id="tab-diary-emotion" onclick="switchDiaryTab('emotion')" class="flex-1 py-2 text-[11px] uppercase tracking-wider font-bold rounded-[12px] transition-all custom-text-secondary hover:text-gray-800">Cảm xúc</button>
                <button id="tab-diary-gallery" onclick="switchDiaryTab('gallery')" class="flex-1 py-2 text-[11px] uppercase tracking-wider font-bold rounded-[12px] transition-all custom-text-secondary hover:text-gray-800">Kỷ niệm</button>
            </div>
        </div>
        
        <!-- Khu vực Nội dung chính -->
        <div class="flex-1 overflow-y-auto p-4 pb-32 custom-scrollbar relative" id="diary-content">
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDiaryModal);
} else {
    initDiaryModal();
}

// 2. CÁC HÀM MỞ / ĐÓNG VÀ CHUYỂN TAB
window.openDiary = () => {
    const modal = document.getElementById("diary-modal");
    modal.classList.remove("hidden");
    if (typeof playSound === 'function') playSound("click");
    
    // Đảm bảo state có mảng diaryNotes để lưu status
    if (!state.diaryNotes) state.diaryNotes = [];

    setTimeout(() => { 
        modal.classList.remove("translate-y-full"); 
        modal.classList.add("translate-y-0"); 
        switchDiaryTab(window.currentDiaryTab);
    }, 10);
};

window.closeDiary = () => {
    const modal = document.getElementById("diary-modal");
    modal.classList.remove("translate-y-0");
    modal.classList.add("translate-y-full");
    setTimeout(() => { modal.classList.add("hidden"); }, 400);
};

window.switchDiaryTab = (tab) => {
    window.currentDiaryTab = tab;
    ["timeline", "emotion", "gallery"].forEach(t => {
        const btn = document.getElementById("tab-diary-" + t);
        if (t === tab) btn.className = "flex-1 py-2 text-[11px] uppercase tracking-wider font-bold rounded-[12px] transition-all custom-primary text-white shadow-md";
        else btn.className = "flex-1 py-2 text-[11px] uppercase tracking-wider font-bold rounded-[12px] transition-all custom-text-secondary hover:text-gray-800 dark:hover:text-gray-200";
    });

    const content = document.getElementById("diary-content");
    content.innerHTML = '<div class="flex justify-center py-10"><i class="fa-solid fa-spinner fa-spin text-2xl text-primary-500"></i></div>';

    setTimeout(() => {
        if (tab === "timeline") renderDiaryTimeline(content);
        else if (tab === "emotion") renderDiaryEmotion(content);
        else if (tab === "gallery") renderDiaryGallery(content);
    }, 100); // Tạo độ trễ xíu cho mượt
};

// ==========================================
// TÍNH NĂNG 1: DÒNG THỜI GIAN (STORY)
// ==========================================
function renderDiaryTimeline(container) {
    const todayStr = new Date().toISOString().split('T')[0];
    const myNote = state.diaryNotes.find(n => n.date === todayStr)?.text || "";

    let html = `
        <!-- Ô nhập Status hôm nay -->
        <div class="custom-bg-card p-4 rounded-3xl border custom-border shadow-sm mb-6 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-500/10 rounded-bl-full -mr-4 -mt-4 pointer-events-none"></div>
            <p class="text-xs font-black custom-text-secondary uppercase mb-2 flex items-center gap-2"><i class="fa-solid fa-pen-nib text-purple-500"></i> Viết đôi dòng cho hôm nay</p>
            <textarea id="diary-status-input" rows="2" placeholder="Hôm nay đại ka cảm thấy thế nào?" class="w-full bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl outline-none font-medium custom-text border border-dashed custom-border text-sm resize-none">${myNote}</textarea>
            <div class="flex justify-end mt-2">
                <button onclick="saveDiaryStatus()" class="px-5 py-2 custom-primary text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all">Lưu Status</button>
            </div>
        </div>
        
        <div class="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 dark:before:via-gray-700 before:to-transparent">
    `;

    // Lấy 7 ngày gần nhất để gom sự kiện
    for (let i = 0; i < 7; i++) {
        let d = new Date();
        d.setDate(d.getDate() - i);
        let dStr = d.toISOString().split('T')[0];
        
        // Lọc dữ liệu của ngày dStr
        let dayTxs = state.transactions.filter(t => t.date.startsWith(dStr) && t.category !== 'transfer');
        let dayRuns = (state.runs || []).filter(r => r.date.startsWith(dStr));
        let dayNote = state.diaryNotes.find(n => n.date === dStr);
        let dayFavs = (state.mapPoints || []).filter(p => p.date.startsWith(dStr));

        if (dayTxs.length === 0 && dayRuns.length === 0 && !dayNote && dayFavs.length === 0) continue;

        let eventsHtml = "";
        
        // 1. In Status (Nếu có)
        if (dayNote && dayNote.text) {
            eventsHtml += `<div class="p-3 mb-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-100 dark:border-purple-800 shadow-sm"><p class="text-sm font-bold text-purple-700 dark:text-purple-300 italic">" ${dayNote.text} "</p></div>`;
        }

        // 2. Chạy bộ
        dayRuns.forEach(r => {
            eventsHtml += `<div class="flex items-center gap-3 p-3 mb-2 custom-bg-card rounded-2xl border custom-border shadow-sm"><div class="w-8 h-8 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center shrink-0"><i class="fa-solid fa-person-running"></i></div><p class="text-xs font-bold custom-text">Đã chạy <span class="text-amber-500">${r.distance.toFixed(2)}km</span> đốt cháy ${Math.round(r.calories)} kcal.</p></div>`;
        });

        // 3. Ghi chú điểm bản đồ mới
        dayFavs.forEach(f => {
            eventsHtml += `<div class="flex items-center gap-3 p-3 mb-2 custom-bg-card rounded-2xl border custom-border shadow-sm"><div class="w-8 h-8 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shrink-0"><i class="fa-solid fa-map-pin"></i></div><p class="text-xs font-bold custom-text">Lưu điểm mới: <span class="text-rose-500">${f.name}</span></p></div>`;
        });

        // 4. Tiêu dùng nổi bật (Chỉ lấy món bự nhất > 100k)
        let bigSpends = dayTxs.filter(t => t.type === 'expense' && t.amount >= 100000);
        bigSpends.forEach(tx => {
            let catName = state.categories.find(c => c.id === tx.category)?.name || "Chi tiêu";
            eventsHtml += `<div class="flex items-center gap-3 p-3 mb-2 custom-bg-card rounded-2xl border border-rose-100 dark:border-rose-900/50 shadow-sm"><div class="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0"><i class="fa-solid fa-money-bill-wave"></i></div><p class="text-xs font-bold custom-text">Đốt <span class="text-rose-500">${formatMoney(tx.amount)}</span> cho ${catName}.</p></div>`;
        });

        const dayName = i === 0 ? "Hôm nay" : i === 1 ? "Hôm qua" : d.toLocaleDateString('vi-VN');

        html += `
        <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div class="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white dark:border-gray-900 custom-bg-input text-gray-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10 ml-0 mr-4">
                <i class="fa-solid fa-calendar-day text-[10px]"></i>
            </div>
            <div class="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-1">
                <h4 class="font-black text-sm custom-text-secondary uppercase mb-2 ml-1">${dayName}</h4>
                ${eventsHtml}
            </div>
        </div>`;
    }

    if (html.includes("is-active")) {
        container.innerHTML = html + "</div>";
    } else {
        container.innerHTML = `<div class="text-center py-10 opacity-50"><i class="fa-solid fa-clock-rotate-left text-5xl mb-4"></i><p class="font-bold text-sm">Chưa có hoạt động nào trong 7 ngày qua.</p></div>`;
    }
}

window.saveDiaryStatus = () => {
    const text = document.getElementById("diary-status-input").value.trim();
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Tìm xem hôm nay có chưa, có thì ghi đè, chưa có thì thêm mới
    const idx = state.diaryNotes.findIndex(n => n.date === todayStr);
    if (idx > -1) {
        if (text === "") state.diaryNotes.splice(idx, 1);
        else state.diaryNotes[idx].text = text;
    } else {
        if (text !== "") state.diaryNotes.push({ id: generateId(), date: todayStr, text: text });
    }

    saveData();
    if (typeof playSound === 'function') playSound("success");
    switchDiaryTab("timeline"); // Load lại UI
};

// ==========================================
// TÍNH NĂNG 2: TÂM LÝ HỌC MUA SẮM (EMOTION)
// ==========================================
function renderDiaryEmotion(container) {
    const curM = new Date().getMonth();
    const curY = new Date().getFullYear();

    // Lọc giao dịch CHI TIÊU tháng này
    const monthExps = state.transactions.filter(t => t.type === 'expense' && t.category !== 'transfer' && new Date(t.date).getMonth() === curM && new Date(t.date).getFullYear() === curY);

    let sumHappy = 0, sumNormal = 0, sumRegret = 0, sumNone = 0;
    
    monthExps.forEach(t => {
        if (t.emotion === 'happy') sumHappy += t.amount;
        else if (t.emotion === 'normal') sumNormal += t.amount;
        else if (t.emotion === 'regret') sumRegret += t.amount;
        else sumNone += t.amount;
    });

    const total = sumHappy + sumNormal + sumRegret + sumNone;

    // Insight chửi thề
    let insightHtml = "";
    if (sumRegret > 0 && sumRegret > sumHappy) {
        insightHtml = `<div class="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-200 dark:border-rose-800 mb-6 flex gap-3 shadow-sm"><div class="text-3xl animate-bounce">😭</div><div><p class="text-xs font-black text-rose-600 uppercase tracking-widest">Báo Động Chi Tiêu</p><p class="text-[11px] font-medium text-rose-600 dark:text-rose-400 mt-1">Tháng này đại ka đã ném <b class="text-lg">${formatMoney(sumRegret)}</b> qua cửa sổ cho những thứ vô bổ. Nhịn lại đi ba!</p></div></div>`;
    } else if (sumHappy > 0 && sumHappy >= sumRegret) {
        insightHtml = `<div class="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 mb-6 flex gap-3 shadow-sm"><div class="text-3xl animate-bounce">🤩</div><div><p class="text-xs font-black text-emerald-600 uppercase tracking-widest">Tận Hưởng Cuộc Sống</p><p class="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">Tuyệt vời! Phần lớn chi tiêu tháng này đều mang lại niềm vui cho đại ka. Tiền làm ra là để xài mà!</p></div></div>`;
    }

    let untaggedList = monthExps.filter(t => !t.emotion).map(tx => {
        const catName = state.categories.find(c => c.id === tx.category)?.name || "Khác";
        return `
        <div class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-2xl border custom-border shadow-sm mb-2">
            <div class="flex-1 min-w-0 pr-2">
                <p class="font-bold text-sm custom-text truncate">${catName}</p>
                <p class="text-xs font-black text-danger-500 mt-0.5">-${formatMoney(tx.amount)}</p>
            </div>
            <div class="flex gap-1 shrink-0 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                <button onclick="setTxEmotion('${tx.id}', 'happy')" class="w-8 h-8 rounded-lg hover:bg-emerald-100 hover:scale-110 transition-all text-lg" title="Đáng tiền">🤩</button>
                <button onclick="setTxEmotion('${tx.id}', 'normal')" class="w-8 h-8 rounded-lg hover:bg-gray-200 hover:scale-110 transition-all text-lg" title="Bình thường">😐</button>
                <button onclick="setTxEmotion('${tx.id}', 'regret')" class="w-8 h-8 rounded-lg hover:bg-rose-100 hover:scale-110 transition-all text-lg" title="Hối hận">😭</button>
            </div>
        </div>`;
    }).join("");

    container.innerHTML = `
        ${insightHtml}
        
        <h4 class="font-black text-xs custom-text-secondary uppercase tracking-widest mb-3">Chỉ số Cảm xúc Tháng này</h4>
        <div class="grid grid-cols-3 gap-2 mb-6">
            <div class="custom-bg-card border border-emerald-100 dark:border-emerald-900/50 p-3 rounded-2xl text-center shadow-sm relative overflow-hidden">
                <div class="absolute -bottom-2 -right-2 text-5xl opacity-10">🤩</div>
                <p class="text-[10px] font-bold text-emerald-500 uppercase">Đáng tiền</p>
                <p class="font-black custom-text text-sm mt-1">${formatMoney(sumHappy)}</p>
            </div>
            <div class="custom-bg-card border custom-border p-3 rounded-2xl text-center shadow-sm relative overflow-hidden">
                <div class="absolute -bottom-2 -right-2 text-5xl opacity-10">😐</div>
                <p class="text-[10px] font-bold custom-text-secondary uppercase">Bình thường</p>
                <p class="font-black custom-text text-sm mt-1">${formatMoney(sumNormal)}</p>
            </div>
            <div class="custom-bg-card border border-rose-100 dark:border-rose-900/50 p-3 rounded-2xl text-center shadow-sm relative overflow-hidden">
                <div class="absolute -bottom-2 -right-2 text-5xl opacity-10">😭</div>
                <p class="text-[10px] font-bold text-rose-500 uppercase">Hối hận</p>
                <p class="font-black custom-text text-sm mt-1">${formatMoney(sumRegret)}</p>
            </div>
        </div>

        <h4 class="font-black text-xs custom-text-secondary uppercase tracking-widest mb-3 flex justify-between">
            <span>Đánh giá chi tiêu (${untaggedList ? monthExps.filter(t => !t.emotion).length : 0})</span>
        </h4>
        <div class="space-y-0">
            ${untaggedList || `<p class="text-center text-sm custom-text-secondary py-4 italic">Đại ka đã phân loại hết cảm xúc tháng này rồi!</p>`}
        </div>
    `;
}

window.setTxEmotion = (txId, emotion) => {
    const tx = state.transactions.find(t => t.id === txId);
    if (tx) {
        tx.emotion = emotion;
        saveData();
        if (typeof playSound === 'function') playSound("pop");
        switchDiaryTab("emotion"); // Render lại để nó mất thẻ đó đi và cập nhật lại số tiền
    }
};


// ==========================================
// TÍNH NĂNG 3: GÓC KỶ NIỆM (GALLERY)
// ==========================================
function renderDiaryGallery(container) {
    // Thu thập tất cả ảnh từ mọi ngóc ngách trong state
    let allPhotos = [];

    // 1. Ảnh Giao dịch
    state.transactions.forEach(tx => {
        if (tx.image && tx.image.length > 50) {
            allPhotos.push({
                src: tx.image,
                type: 'tx',
                date: tx.date,
                amount: tx.amount,
                note: tx.note || (state.categories.find(c => c.id === tx.category)?.name || ""),
                icon: "fa-receipt"
            });
        }
    });

    // 2. Ảnh Quán ruột
    (state.favorites || []).forEach(f => {
        if (f.image && f.image.length > 50) {
            // Lấy giao dịch gần nhất của quán này để lấy ngày
            const txs = state.transactions.filter(t => t.favId === f.id);
            const date = txs.length > 0 ? txs[0].date : new Date().toISOString();
            allPhotos.push({
                src: f.image, type: 'fav', date: date, amount: 0, note: f.name, icon: "fa-heart"
            });
        }
    });

    // 3. Ảnh Bản đồ
    (state.mapPoints || []).forEach(p => {
        if (p.image && p.image.length > 50) {
            allPhotos.push({
                src: p.image, type: 'map', date: p.date, amount: 0, note: p.name, icon: "fa-map-pin"
            });
        }
    });

    // 4. Ảnh Đi Phượt (Checkins)
    (state.trips || []).forEach(tr => {
        (tr.checkins || []).forEach(c => {
            if (c.image && c.image.length > 50) {
                allPhotos.push({
                    src: c.image, type: 'trip', date: c.timestamp || new Date().toISOString(), amount: 0, note: c.locationName || "Đi phượt", icon: "fa-plane"
                });
            }
        });
    });

    // Sắp xếp mới nhất lên đầu
    allPhotos.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (allPhotos.length === 0) {
        container.innerHTML = `<div class="text-center py-20 opacity-50"><i class="fa-solid fa-images text-6xl mb-4 text-gray-400"></i><p class="font-bold">Trống trơn! Hãy đính kèm ảnh vào giao dịch hoặc chụp ảnh check-in nhé.</p></div>`;
        return;
    }

    // Hiển thị Masonry (Dùng columns css)
    let photosHtml = allPhotos.map(p => {
        let moneyHtml = p.amount > 0 ? `<p class="text-[10px] font-black text-rose-400 mt-1">-${formatMoney(p.amount)}</p>` : "";
        let dStr = new Date(p.date).toLocaleDateString('vi-VN');
        
        return `
        <div class="break-inside-avoid mb-3 relative group rounded-[18px] overflow-hidden border border-black/5 dark:border-white/5 cursor-pointer shadow-sm active:scale-95 transition-transform" onclick="openImageModal('${p.src}')">
            <img src="${p.src}" class="w-full h-auto object-cover">
            
            <!-- Lớp phủ Gradient đen dưới chân ảnh -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
            
            <!-- Icon Nguồn ảnh góc trên trái -->
            <div class="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center text-[10px]"><i class="fa-solid ${p.icon}"></i></div>

            <!-- Chữ ở dưới -->
            <div class="absolute bottom-2 left-2 right-2">
                <p class="text-white text-[11px] font-bold leading-tight line-clamp-2 drop-shadow-md">${p.note}</p>
                <div class="flex items-center justify-between mt-1">
                    <span class="text-gray-300 text-[9px] font-medium"><i class="fa-regular fa-clock"></i> ${dStr}</span>
                    ${p.amount > 0 ? `<span class="text-rose-400 text-[10px] font-black shadow-black drop-shadow-md">-${formatMoney(p.amount)}</span>` : ""}
                </div>
            </div>
        </div>
        `;
    }).join("");

    container.innerHTML = `<div class="columns-2 gap-3 space-y-0">${photosHtml}</div>`;
}