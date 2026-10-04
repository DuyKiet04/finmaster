// ==============================================================
// FILE: diary.js - NHẬT KÝ & KỶ NIỆM (TIMELINE, EMOTION, GALLERY)
// ==============================================================

window.currentDiaryTab = "timeline";
let tempDiaryImage = null; // Biến tạm chứa ảnh đã ép dung lượng

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
    tempDiaryImage = null; // Xóa ảnh tạm
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
    }, 100); 
};

// ==========================================
// TÍNH NĂNG 1: DÒNG THỜI GIAN (STORY / FEED)
// ==========================================
function renderDiaryTimeline(container) {
    let html = `
        <!-- KHUNG ĐĂNG BÀI CHUẨN MẠNG XÃ HỘI -->
        <div class="custom-bg-card p-4 rounded-3xl border custom-border shadow-sm mb-6 relative">
            <div class="flex gap-3 mb-3">
                <div class="w-10 h-10 rounded-full bg-gray-200 shrink-0 overflow-hidden border custom-border shadow-sm">
                    <img src="${state.userProfile?.avatar || 'https://img.magnific.com/vector-mien-phi/hinh-minh-hoa-cau-be-toc-do-tuoi-cuoi_1308-176664.jpg?semt=ais_hybrid&w=740&q=80'}" class="w-full h-full object-cover">
                </div>
                <textarea id="diary-status-input" rows="2" placeholder="Ông vừa thấy gì thú vị? Viết vào đây..." class="w-full bg-transparent p-2 outline-none font-medium custom-text text-sm resize-none custom-placeholder"></textarea>
            </div>
            
            <!-- Khung chứa ảnh Preview (Ẩn mặc định) -->
            <div id="diary-img-preview-box" class="relative hidden mb-3 rounded-2xl overflow-hidden border custom-border">
                <img id="diary-img-preview" src="" class="w-full h-40 object-cover">
                <button onclick="removeTempDiaryImage()" class="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-md active:scale-90"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="flex justify-between items-center pt-3 border-t custom-border border-dashed">
                <div class="flex gap-2">
                    <input type="file" id="diary-camera-input" accept="image/*" class="hidden" onchange="compressAndPreviewDiaryImage(this)">
                    <button onclick="document.getElementById('diary-camera-input').click()" class="w-10 h-10 rounded-full bg-blue-50 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 transition-colors" title="Thêm ảnh">
                        <i class="fa-solid fa-image text-lg"></i>
                    </button>
                    <!-- Nút bắt GPS nhanh -->
                    <button onclick="fastGetLocationDiary()" id="btn-diary-gps" class="w-10 h-10 rounded-full bg-rose-50 text-rose-500 dark:bg-rose-900/30 dark:text-rose-400 flex items-center justify-center hover:bg-rose-100 transition-colors" title="Check-in vị trí">
                        <i class="fa-solid fa-location-dot text-lg"></i>
                    </button>
                    <span id="diary-loc-text" class="hidden text-[10px] font-bold text-rose-500 self-center max-w-[100px] truncate"></span>
                </div>
                <button onclick="saveDiaryStatus()" class="px-5 py-2 custom-primary text-white font-bold text-sm rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-2"><i class="fa-solid fa-paper-plane"></i> Đăng</button>
            </div>
        </div>
        
        <div class="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 dark:before:via-gray-700 before:to-transparent">
    `;

    // Quét 7 ngày gần nhất
    for (let i = 0; i < 7; i++) {
        let d = new Date();
        d.setDate(d.getDate() - i);
        let dStr = d.toISOString().split('T')[0];
        
        let dayTxs = state.transactions.filter(t => t.date.startsWith(dStr) && t.category !== 'transfer');
        let dayRuns = (state.runs || []).filter(r => r.date.startsWith(dStr));
        let dayFavs = (state.mapPoints || []).filter(p => p.date.startsWith(dStr));
        
        // MỚI: Lọc TẤT CẢ các bài post nhật ký trong ngày hôm đó
        let dayNotes = (state.diaryNotes || []).filter(n => n.date === dStr).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (dayTxs.length === 0 && dayRuns.length === 0 && dayNotes.length === 0 && dayFavs.length === 0) continue;

        let eventsHtml = "";
        
        // 1. In Danh sách Nhật Ký Đời Thường (Post)
        dayNotes.forEach(note => {
            const timeObj = new Date(note.timestamp);
            const timeFmt = timeObj.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'});
            
            eventsHtml += `
            <div class="p-4 mb-3 bg-white dark:bg-gray-800 rounded-3xl border custom-border shadow-sm">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200"><i class="fa-solid fa-pen-nib text-sm"></i></div>
                        <div>
                            <p class="text-xs font-bold custom-text-secondary"><i class="fa-regular fa-clock"></i> ${timeFmt}</p>
                            ${note.location ? `<p class="text-[9px] font-bold text-rose-500 mt-0.5 max-w-[180px] truncate"><i class="fa-solid fa-location-dot"></i> ${note.location}</p>` : ''}
                        </div>
                    </div>
                    <button onclick="deleteDiaryPost('${note.id}')" class="text-gray-300 hover:text-red-500 transition-colors"><i class="fa-solid fa-xmark"></i></button>
                </div>
                ${note.text ? `<p class="text-sm font-medium custom-text leading-relaxed mb-3 break-words whitespace-pre-wrap">"${note.text}"</p>` : ''}
                ${note.image ? `<img src="${note.image}" class="w-full rounded-2xl border custom-border cursor-pointer object-cover max-h-60" onclick="openImageModal(this.src)">` : ''}
            </div>`;
        });

        // 2. Chạy bộ
        dayRuns.forEach(r => {
            eventsHtml += `<div class="flex items-center gap-3 p-3 mb-3 custom-bg-card rounded-2xl border custom-border shadow-sm"><div class="w-8 h-8 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center shrink-0"><i class="fa-solid fa-person-running"></i></div><p class="text-xs font-bold custom-text">Đã chạy <span class="text-amber-500">${r.distance.toFixed(2)}km</span> đốt cháy ${Math.round(r.calories)} kcal.</p></div>`;
        });

        // 3. Ghi chú điểm bản đồ
        dayFavs.forEach(f => {
            eventsHtml += `<div class="flex items-center gap-3 p-3 mb-3 custom-bg-card rounded-2xl border custom-border shadow-sm"><div class="w-8 h-8 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shrink-0"><i class="fa-solid fa-map-pin"></i></div><p class="text-xs font-bold custom-text">Lưu điểm bản đồ: <span class="text-rose-500 font-black">${f.name}</span></p></div>`;
        });

        // 4. Chi tiêu khủng (>100k)
        let bigSpends = dayTxs.filter(t => t.type === 'expense' && t.amount >= 100000);
        bigSpends.forEach(tx => {
            let catName = state.categories.find(c => c.id === tx.category)?.name || "Chi tiêu";
            eventsHtml += `<div class="flex items-center gap-3 p-3 mb-3 custom-bg-card rounded-2xl border border-rose-100 dark:border-rose-900/50 shadow-sm"><div class="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0"><i class="fa-solid fa-money-bill-wave"></i></div><p class="text-xs font-bold custom-text">Chi <span class="text-rose-500 font-black">${formatMoney(tx.amount)}</span> cho ${catName}.</p></div>`;
        });

        const dayName = i === 0 ? "Hôm nay" : i === 1 ? "Hôm qua" : d.toLocaleDateString('vi-VN');

        html += `
        <div class="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-2">
            <div class="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white dark:border-gray-900 custom-bg-input text-gray-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10 ml-0 mr-4 mt-2">
                <i class="fa-solid fa-calendar-day text-[10px]"></i>
            </div>
            <div class="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-1">
                <h4 class="font-black text-sm custom-text-secondary uppercase mb-3 ml-1">${dayName}</h4>
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

// ==========================================
// CÁC HÀM HỖ TRỢ XỬ LÝ ẢNH & ĐĂNG BÀI (<200KB)
// ==========================================

// Hàm bóp ảnh cực mạnh
window.compressAndPreviewDiaryImage = (input) => {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            // Ép kích thước tối đa 600px để chống đầy bộ nhớ
            const MAX_WIDTH = 600; 
            let scaleSize = 1;
            if (img.width > MAX_WIDTH) {
                scaleSize = MAX_WIDTH / img.width;
            }
            
            canvas.width = img.width * scaleSize;
            canvas.height = img.height * scaleSize;
            
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Ép chất lượng JPEG cực mạnh (0.4) để đảm bảo size < 150KB
            tempDiaryImage = canvas.toDataURL("image/jpeg", 0.4); 

            // Hiển thị Preview
            document.getElementById("diary-img-preview").src = tempDiaryImage;
            document.getElementById("diary-img-preview-box").classList.remove("hidden");
            if(typeof playSound === 'function') playSound("pop");
        };
    };
    input.value = ""; // Reset input
};

window.removeTempDiaryImage = () => {
    tempDiaryImage = null;
    document.getElementById("diary-img-preview-box").classList.add("hidden");
    document.getElementById("diary-img-preview").src = "";
};

window.fastGetLocationDiary = () => {
    const btn = document.getElementById("btn-diary-gps");
    const locText = document.getElementById("diary-loc-text");
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                // 🔥 ĐÃ ĐỔI SANG MÁY CHỦ BIGDATACLOUD (Bao test thoải mái, không bị block IP)
                const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=vi`);
                const data = await res.json();
                
                // Trích xuất dữ liệu phường/quận/thành phố
                const ward = data.locality || "";
                const city = data.city || data.principalSubdivision || "";
                
                let finalLoc = ward && city ? `${ward}, ${city}` : ward || city || "Vị trí hiện tại";
                
                // Dùng hàm rút gọn tên nếu có
                finalLoc = typeof window.formatShortAddress === 'function' ? window.formatShortAddress(finalLoc) : finalLoc;
                
                btn.innerHTML = '<i class="fa-solid fa-check"></i>';
                // Đổi nút sang màu xanh lá báo thành công
                btn.classList.replace("text-rose-500", "text-success-500");
                btn.classList.replace("dark:text-rose-400", "dark:text-success-400");
                
                locText.innerText = finalLoc;
                locText.classList.remove("hidden");
                
                // Gắn ngầm location vào dataset để lát đăng bài lưu vào state
                document.getElementById("diary-status-input").dataset.location = finalLoc;
                
                if(typeof playSound === 'function') playSound("success");
            } catch (err) {
                btn.innerHTML = '<i class="fa-solid fa-location-dot"></i>';
                alert("Lỗi mạng: Không thể dịch tọa độ sang tên địa điểm!");
            }
        }, (error) => {
            btn.innerHTML = '<i class="fa-solid fa-location-dot"></i>';
            alert(`Lỗi GPS: ${error.message}`);
        }, 
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
    } else {
        btn.innerHTML = '<i class="fa-solid fa-location-dot"></i>';
        alert("Trình duyệt không hỗ trợ GPS!");
    }
};

window.saveDiaryStatus = () => {
    const inputEl = document.getElementById("diary-status-input");
    const text = inputEl.value.trim();
    const location = inputEl.dataset.location || "";
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (text === "" && !tempDiaryImage) {
        return alert("Viết gì đó hoặc thêm ảnh đi đại ka!");
    }

    if (!state.diaryNotes) state.diaryNotes = [];
    
    // Thêm bài Post mới vào mảng
    state.diaryNotes.push({ 
        id: "note-" + new Date().getTime(), 
        date: todayStr,
        timestamp: new Date().toISOString(),
        text: text,
        image: tempDiaryImage,
        location: location
    });

    saveData();
    tempDiaryImage = null; // Xóa ảnh tạm sau khi lưu
    
    if (typeof playSound === 'function') playSound("success");
    switchDiaryTab("timeline"); // Load lại UI timeline mới nhất
};

window.deleteDiaryPost = (id) => {
    if(!confirm("Xóa bài viết này?")) return;
    state.diaryNotes = state.diaryNotes.filter(n => n.id !== id);
    saveData();
    switchDiaryTab("timeline");
    if(typeof playSound === 'function') playSound("trash");
}


// ==========================================
// TÍNH NĂNG 2: TÂM LÝ HỌC MUA SẮM (EMOTION)
// ==========================================
function renderDiaryEmotion(container) {
    const curM = new Date().getMonth();
    const curY = new Date().getFullYear();

    const monthExps = state.transactions.filter(t => t.type === 'expense' && t.category !== 'transfer' && new Date(t.date).getMonth() === curM && new Date(t.date).getFullYear() === curY);

    let sumHappy = 0, sumNormal = 0, sumRegret = 0, sumNone = 0;
    
    monthExps.forEach(t => {
        if (t.emotion === 'happy') sumHappy += t.amount;
        else if (t.emotion === 'normal') sumNormal += t.amount;
        else if (t.emotion === 'regret') sumRegret += t.amount;
        else sumNone += t.amount;
    });

    let insightHtml = "";
    if (sumRegret > 0 && sumRegret > sumHappy) {
        insightHtml = `<div class="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-3xl border border-rose-200 dark:border-rose-800 mb-6 flex gap-4 shadow-sm items-center"><div class="text-4xl animate-bounce">😭</div><div class="flex-1"><p class="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Báo Động Chi Tiêu</p><p class="text-xs font-bold text-rose-600 dark:text-rose-400 leading-snug">Tháng này ném <b class="text-base">${formatMoney(sumRegret)}</b> qua cửa sổ cho những thứ hối hận. Kìm hãm lại đại ka!</p></div></div>`;
    } else if (sumHappy > 0 && sumHappy >= sumRegret) {
        insightHtml = `<div class="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-3xl border border-emerald-200 dark:border-emerald-800 mb-6 flex gap-4 shadow-sm items-center"><div class="text-4xl animate-bounce">🤩</div><div class="flex-1"><p class="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Tận Hưởng Cuộc Sống</p><p class="text-xs font-bold text-emerald-600 dark:text-emerald-400 leading-snug">Tuyệt vời! Đa số tiền chi tiêu đều mang lại niềm vui. Tiền là để phục vụ mình!</p></div></div>`;
    }

    let untaggedList = monthExps.filter(t => !t.emotion).map(tx => {
        const catName = state.categories.find(c => c.id === tx.category)?.name || "Khác";
        return `
        <div class="flex items-center justify-between p-4 custom-bg-card rounded-2xl border custom-border shadow-sm mb-3">
            <div class="flex-1 min-w-0 pr-2">
                <p class="font-bold text-sm custom-text truncate">${catName}</p>
                <p class="text-[10px] custom-text-secondary truncate mt-0.5">${tx.note || "Không ghi chú"}</p>
                <p class="text-sm font-black text-danger-500 mt-1">-${formatMoney(tx.amount)}</p>
            </div>
            <div class="flex flex-col gap-1 shrink-0 bg-gray-100 dark:bg-gray-700/50 p-1.5 rounded-[18px]">
                <button onclick="setTxEmotion('${tx.id}', 'happy')" class="w-9 h-9 rounded-xl hover:bg-emerald-100 hover:scale-110 transition-all text-xl" title="Đáng tiền">🤩</button>
                <button onclick="setTxEmotion('${tx.id}', 'normal')" class="w-9 h-9 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-110 transition-all text-xl" title="Bình thường">😐</button>
                <button onclick="setTxEmotion('${tx.id}', 'regret')" class="w-9 h-9 rounded-xl hover:bg-rose-100 hover:scale-110 transition-all text-xl" title="Hối hận">😭</button>
            </div>
        </div>`;
    }).join("");

    container.innerHTML = `
        ${insightHtml}
        
        <h4 class="font-black text-xs custom-text-secondary uppercase tracking-widest mb-4"><i class="fa-solid fa-chart-pie text-blue-500"></i> Chỉ số Cảm xúc Tháng</h4>
        <div class="grid grid-cols-3 gap-3 mb-8">
            <div class="custom-bg-card border border-emerald-100 dark:border-emerald-900/50 p-3 rounded-[20px] text-center shadow-sm relative overflow-hidden">
                <div class="absolute -bottom-2 -right-2 text-5xl opacity-10">🤩</div>
                <p class="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Đáng tiền</p>
                <p class="font-black custom-text text-sm mt-1.5">${formatMoney(sumHappy)}</p>
            </div>
            <div class="custom-bg-card border custom-border p-3 rounded-[20px] text-center shadow-sm relative overflow-hidden">
                <div class="absolute -bottom-2 -right-2 text-5xl opacity-10">😐</div>
                <p class="text-[9px] font-black custom-text-secondary uppercase tracking-widest">Bình thường</p>
                <p class="font-black custom-text text-sm mt-1.5">${formatMoney(sumNormal)}</p>
            </div>
            <div class="custom-bg-card border border-rose-100 dark:border-rose-900/50 p-3 rounded-[20px] text-center shadow-sm relative overflow-hidden">
                <div class="absolute -bottom-2 -right-2 text-5xl opacity-10">😭</div>
                <p class="text-[9px] font-black text-rose-500 uppercase tracking-widest">Hối hận</p>
                <p class="font-black custom-text text-sm mt-1.5">${formatMoney(sumRegret)}</p>
            </div>
        </div>

        <h4 class="font-black text-xs custom-text-secondary uppercase tracking-widest mb-4 flex justify-between">
            <span><i class="fa-solid fa-clipboard-question text-amber-500"></i> Chờ đánh giá (${untaggedList ? monthExps.filter(t => !t.emotion).length : 0})</span>
        </h4>
        <div class="space-y-0">
            ${untaggedList || `<div class="text-center py-6 opacity-60"><i class="fa-solid fa-check-double text-4xl text-emerald-500 mb-3"></i><p class="text-sm font-bold">Ông đã duyệt hết các khoản chi tháng này!</p></div>`}
        </div>
    `;
}

window.setTxEmotion = (txId, emotion) => {
    const tx = state.transactions.find(t => t.id === txId);
    if (tx) {
        tx.emotion = emotion;
        saveData();
        if (typeof playSound === 'function') playSound("pop");
        switchDiaryTab("emotion"); 
    }
};

// ==========================================
// TÍNH NĂNG 3: GÓC KỶ NIỆM (GALLERY - NƠI GOM TẤT CẢ ẢNH CỦA APP)
// ==========================================
function renderDiaryGallery(container) {
    let allPhotos = [];

    // 1. Ảnh Nhật ký (Status)
    (state.diaryNotes || []).forEach(n => {
        if (n.image && n.image.length > 50) {
            allPhotos.push({ src: n.image, type: 'note', date: n.timestamp || n.date, amount: 0, note: n.text || "Nhật ký của tôi", icon: "fa-book" });
        }
    });

    // 2. Ảnh Giao dịch
    state.transactions.forEach(tx => {
        if (tx.image && tx.image.length > 50) {
            allPhotos.push({ src: tx.image, type: 'tx', date: tx.date, amount: tx.amount, note: tx.note || (state.categories.find(c => c.id === tx.category)?.name || "Giao dịch"), icon: "fa-receipt" });
        }
    });

    // 3. Ảnh Quán ruột
    (state.favorites || []).forEach(f => {
        if (f.image && f.image.length > 50) {
            const txs = state.transactions.filter(t => t.favId === f.id);
            const date = txs.length > 0 ? txs[0].date : new Date().toISOString();
            allPhotos.push({ src: f.image, type: 'fav', date: date, amount: 0, note: f.name, icon: "fa-heart" });
        }
    });

    // 4. Ảnh Bản đồ
    (state.mapPoints || []).forEach(p => {
        if (p.image && p.image.length > 50) {
            allPhotos.push({ src: p.image, type: 'map', date: p.date, amount: 0, note: p.name, icon: "fa-map-pin" });
        }
    });

    // 5. Ảnh Đi Phượt
    (state.trips || []).forEach(tr => {
        (tr.checkins || []).forEach(c => {
            if (c.image && c.image.length > 50) {
                allPhotos.push({ src: c.image, type: 'trip', date: c.timestamp || new Date().toISOString(), amount: 0, note: c.locationName || "Đi phượt", icon: "fa-plane" });
            }
        });
    });

    allPhotos.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (allPhotos.length === 0) {
        container.innerHTML = `<div class="text-center py-20 opacity-50"><i class="fa-solid fa-images text-6xl mb-4 text-gray-400"></i><p class="font-bold">Trống trơn! Hãy đính kèm ảnh vào bất cứ đâu để chúng xuất hiện ở đây.</p></div>`;
        return;
    }

    let photosHtml = allPhotos.map(p => {
        let dStr = new Date(p.date).toLocaleDateString('vi-VN');
        return `
        <div class="break-inside-avoid mb-3 relative group rounded-[20px] overflow-hidden border border-black/5 dark:border-white/5 cursor-pointer shadow-sm active:scale-95 transition-transform" onclick="openImageModal('${p.src}')">
            <img src="${p.src}" class="w-full h-auto object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-90"></div>
            
            <div class="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center text-[10px] border border-white/20"><i class="fa-solid ${p.icon}"></i></div>

            <div class="absolute bottom-3 left-3 right-3">
                <p class="text-white text-[12px] font-bold leading-snug line-clamp-2 drop-shadow-md mb-1">${p.note}</p>
                <div class="flex items-center justify-between">
                    <span class="text-gray-300 text-[9px] font-bold tracking-wider"><i class="fa-regular fa-clock"></i> ${dStr}</span>
                    ${p.amount > 0 ? `<span class="bg-rose-500 text-white px-1.5 py-0.5 rounded text-[9px] font-black shadow-md border border-rose-400">-${formatMoney(p.amount)}</span>` : ""}
                </div>
            </div>
        </div>
        `;
    }).join("");

    container.innerHTML = `<div class="columns-2 sm:columns-3 gap-3 space-y-0">${photosHtml}</div>`;
}