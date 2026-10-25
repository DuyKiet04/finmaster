// ==============================================================
// FILE: tx-full-page.js - DIGITAL LUXURY RECEIPT & SMART COPILOT
// Màn hình chi tiết giao dịch siêu sang phong cách Neo-Banking
// ==============================================================

(function () {
    let currentFullTxId = null;
    let detailMapObj = null;
    let isAmountHidden = false;

    // 1. TỰ ĐỘNG BƠM KHUNG GIAO DIỆN VÀO TRANG
    function injectFullPageUI() {
        if (document.getElementById("tx-full-page-overlay")) return;

        const html = `
        <div id="tx-full-page-overlay" class="fixed inset-0 z-[200] custom-bg-body transition-transform duration-350 ease-out translate-x-full overflow-hidden flex flex-col font-sans select-none">
            
            <!-- FLOATING GLASS TOP BAR -->
            <div class="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-4 py-3.5 bg-black/20 backdrop-blur-xl border-b border-white/10 text-white">
                <button onclick="closeFullTxPage()" class="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-sm shadow-md active:scale-90 transition-all border border-white/15" title="Đóng">
                    <i class="fa-solid fa-arrow-left"></i>
                </button>

                <div class="flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 shadow-sm">
                    <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span class="text-xs font-black uppercase tracking-wider">Chi Tiết Giao Dịch</span>
                </div>

                <div class="flex items-center gap-1.5">
                    <button onclick="openReceiptShareModal()" class="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-sm shadow-md active:scale-90 transition-all border border-white/15" title="Xem & Chia sẻ biên lai">
                        <i class="fa-solid fa-receipt"></i>
                    </button>
                    <button onclick="duplicateTransaction()" class="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-sm shadow-md active:scale-90 transition-all border border-white/15" title="Nhân bản sang hôm nay">
                        <i class="fa-solid fa-copy"></i>
                    </button>
                    <button onclick="deleteTransactionFromFull()" class="w-10 h-10 rounded-2xl bg-rose-500/25 hover:bg-rose-500/40 text-rose-300 backdrop-blur-md flex items-center justify-center text-sm shadow-md active:scale-90 transition-all border border-rose-400/30" title="Xóa giao dịch">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>

            <!-- NỘI DUNG CUỘN ĐƯỢC -->
            <div class="flex-1 overflow-y-auto pb-32 custom-scrollbar relative" id="tx-fp-scroll-area">
                
                <!-- KHU VỰC 1: HERO AURORA RECEIPT BANNER -->
                <div id="tx-fp-hero" class="relative pt-24 pb-12 px-6 flex flex-col items-center justify-center text-center text-white overflow-hidden shadow-2xl">
                    <!-- Dynamic Hero Inject -->
                </div>

                <!-- KHU VỰC 2: CÁC KHỐI BENTO MODULES -->
                <div class="px-3.5 sm:px-6 space-y-3.5 -mt-6 relative z-10">
                    
                    <!-- MODULE 1: BENTO THÔNG TIN CỐT LÕI (CORE INFO) -->
                    <div class="tx-fp-card-glass p-5 space-y-4">
                        <div class="grid grid-cols-2 gap-3.5">
                            <!-- Cột 1: Thời gian -->
                            <div class="custom-bg-input p-3.5 rounded-2xl border custom-border flex flex-col justify-between">
                                <div class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider custom-text-secondary mb-1">
                                    <i class="fa-regular fa-clock text-primary-500"></i> Thời gian
                                </div>
                                <p class="text-xs sm:text-sm font-black custom-text leading-snug" id="tx-fp-date">--/--/----</p>
                                <div class="flex items-center gap-2 mt-1">
                                    <span class="text-[10px] font-bold text-primary-500" id="tx-fp-time">--:--</span>
                                    <span class="text-[9px] font-bold custom-bg-card px-1.5 py-0.2 rounded border custom-border" id="tx-fp-relative-time">Vừa xong</span>
                                </div>
                            </div>

                            <!-- Cột 2: Nguồn tiền / Ví -->
                            <div class="custom-bg-input p-3.5 rounded-2xl border custom-border flex flex-col justify-between">
                                <div class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider custom-text-secondary mb-1">
                                    <i class="fa-solid fa-wallet text-sky-500"></i> Nguồn tiền
                                </div>
                                <p class="text-xs sm:text-sm font-black custom-text truncate" id="tx-fp-wallet">Ví chính</p>
                                <p class="text-[10px] font-bold custom-text-secondary mt-1 truncate" id="tx-fp-wallet-bal">Số dư: 0 ₫</p>
                            </div>
                        </div>

                        <!-- CẢM XÚC CHI TIÊU (1-TAP EMOTION TAGGER) -->
                        <div class="pt-3 border-t custom-border border-dashed">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-[10px] font-black uppercase tracking-wider custom-text-secondary flex items-center gap-1.5">
                                    <i class="fa-regular fa-face-smile text-amber-500"></i> Cảm xúc chi tiêu
                                </span>
                                <span class="text-[9px] font-bold custom-text-secondary">Chạm để đổi</span>
                            </div>
                            <div class="grid grid-cols-3 gap-2" id="tx-fp-emotion-group">
                                <button onclick="setTxEmotion('happy')" id="btn-emo-happy" class="tx-fp-emotion-btn py-2 px-2.5 rounded-2xl custom-bg-input flex items-center justify-center gap-1.5 text-xs font-bold custom-text hover:bg-emerald-500/10 active:scale-95">
                                    <span>🥰</span> <span class="text-[11px]">Đáng tiền</span>
                                </button>
                                <button onclick="setTxEmotion('normal')" id="btn-emo-normal" class="tx-fp-emotion-btn py-2 px-2.5 rounded-2xl custom-bg-input flex items-center justify-center gap-1.5 text-xs font-bold custom-text hover:bg-blue-500/10 active:scale-95">
                                    <span>😐</span> <span class="text-[11px]">Bình thường</span>
                                </button>
                                <button onclick="setTxEmotion('regret')" id="btn-emo-regret" class="tx-fp-emotion-btn py-2 px-2.5 rounded-2xl custom-bg-input flex items-center justify-center gap-1.5 text-xs font-bold custom-text hover:bg-rose-500/10 active:scale-95">
                                    <span>🥺</span> <span class="text-[11px]">Hối tiếc</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- MODULE 2: TRỢ LÝ PHÂN TÍCH THÔNG MINH (AI FINANCIAL COPILOT) -->
                    <div class="tx-fp-card-glass p-5 space-y-3.5" id="tx-fp-insights-box">
                        <!-- Rendered by JS -->
                    </div>

                    <!-- MODULE 3: DU LỊCH & CHIA TIỀN CAMPUCHIA (2 CỘT BENTO) -->
                    <div class="grid grid-cols-2 gap-3" id="tx-fp-links-box">
                        <!-- Rendered by JS -->
                    </div>

                    <!-- MODULE 4: GHI CHÚ NHANH -->
                    <div class="tx-fp-card-glass p-5">
                        <div class="flex items-center justify-between mb-2.5">
                            <h4 class="text-[10px] font-black custom-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                                <i class="fa-solid fa-comment-dots text-purple-500"></i> Ghi chú giao dịch
                            </h4>
                            <button onclick="toggleTxQuickNoteEdit()" class="text-[10px] font-bold text-primary-500 hover:underline flex items-center gap-1">
                                <i class="fa-solid fa-pen text-[9px]"></i> Sửa nhanh
                            </button>
                        </div>
                        <div class="custom-bg-input p-3.5 rounded-2xl border custom-border">
                            <p class="text-xs sm:text-sm font-medium custom-text leading-relaxed whitespace-pre-wrap" id="tx-fp-note">...</p>
                            
                            <!-- Inline Edit Box -->
                            <div id="tx-fp-note-edit-box" class="hidden mt-2 pt-2 border-t custom-border border-dashed">
                                <textarea id="tx-fp-note-textarea" rows="2" class="w-full bg-transparent border-none text-xs font-medium custom-text outline-none p-0 resize-none"></textarea>
                                <div class="flex justify-end gap-2 mt-2">
                                    <button onclick="saveTxQuickNote()" class="px-3 py-1 bg-primary-500 text-white rounded-xl text-[10px] font-bold shadow-sm active:scale-95">Lưu ghi chú</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- MODULE 5: THỰC ĐỊA & BẢN ĐỒ -->
                    <div id="tx-fp-location-box" class="tx-fp-card-glass overflow-hidden">
                        <div class="p-4 sm:p-5 pb-3 flex items-center justify-between">
                            <h4 class="text-[10px] font-black custom-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                                <i class="fa-solid fa-location-dot text-rose-500"></i> Địa điểm thực tế
                            </h4>
                            <button id="tx-fp-map-btn" class="px-3 py-1 rounded-xl bg-primary-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 active:scale-95 transition-transform">
                                <i class="fa-solid fa-diamond-turn-right text-[9px]"></i> Chỉ đường
                            </button>
                        </div>
                        <div class="px-4 sm:px-5 pb-3">
                            <p class="text-xs font-bold text-rose-500 bg-rose-500/10 px-3.5 py-2 rounded-xl border border-rose-500/20 leading-snug truncate" id="tx-fp-loc-name">
                                ...
                            </p>
                        </div>
                        <div class="w-full h-44 relative bg-black/10">
                            <div id="tx-fp-leaflet-map" class="absolute inset-0 z-0"></div>
                        </div>
                    </div>

                    <!-- MODULE 5B: NÚT GẮN VỊ TRÍ NẾU CHƯA CÓ -->
                    <div id="tx-fp-no-location-box" class="tx-fp-card-glass p-4 text-center hidden">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2.5 text-left">
                                <div class="w-9 h-9 rounded-xl custom-bg-input text-rose-500 flex items-center justify-center text-sm border custom-border">
                                    <i class="fa-solid fa-location-crosshairs"></i>
                                </div>
                                <div>
                                    <p class="text-xs font-black custom-text leading-tight">Chưa có vị trí GPS</p>
                                    <p class="text-[10px] font-bold custom-text-secondary mt-0.5">Lưu lại tọa độ quán xá nơi bạn đã thanh toán</p>
                                </div>
                            </div>
                            <button onclick="attachCurrentLocationToTx()" class="px-3 py-2 rounded-xl bg-rose-500 text-white font-black text-[10px] shadow-sm active:scale-95 transition-all flex items-center gap-1 shrink-0">
                                <i class="fa-solid fa-map-pin"></i> Gắn vị trí
                            </button>
                        </div>
                    </div>

                    <!-- MODULE 6: HÌNH ẢNH HÓA ĐƠN -->
                    <div id="tx-fp-image-box" class="tx-fp-card-glass p-5 hidden">
                        <div class="flex items-center justify-between mb-3">
                            <h4 class="text-[10px] font-black custom-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                                <i class="fa-solid fa-receipt text-pink-500"></i> Hóa đơn / Chứng từ
                            </h4>
                            <span class="text-[10px] font-bold text-primary-500">Chạm để phóng to</span>
                        </div>
                        <div class="relative rounded-2xl overflow-hidden border custom-border shadow-md group cursor-pointer" onclick="openImageModal(document.getElementById('tx-fp-img').src)">
                            <img id="tx-fp-img" src="" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300">
                            <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-lg">
                                <i class="fa-solid fa-magnifying-glass-plus"></i>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <!-- THANH CÔNG CỤ ĐÁY (STICKY ACTION BAR) -->
            <div class="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent pt-10 z-30 flex items-center gap-2">
                <button onclick="openReceiptShareModal()" class="w-14 h-13 rounded-2xl custom-bg-card border custom-border custom-text flex flex-col items-center justify-center text-xs font-bold active:scale-90 transition-all shadow-md" title="Biên lai">
                    <i class="fa-solid fa-qrcode text-base"></i>
                </button>
                <button onclick="openEditTransaction(currentFullTxId)" class="flex-1 py-3.5 custom-primary text-white rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-primary-500/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <i class="fa-solid fa-pen"></i> Chỉnh sửa giao dịch
                </button>
            </div>
        </div>

        <!-- ========================================== -->
        <!-- MODAL CHIA TIỀN CAMPUCHIA HOÀN CHỈNH -->
        <!-- ========================================== -->
        <div id="tx-split-modal-backdrop" onclick="closeTxSplitModal()" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] hidden opacity-0 transition-opacity duration-300"></div>
        <div id="tx-split-modal" class="fixed bottom-0 inset-x-0 custom-bg-body z-[300] rounded-t-[2.5rem] custom-shadow-lg transform translate-y-full transition-transform duration-300 ease-out flex flex-col max-h-[85vh] custom-border border-b-0 border-x-0 font-sans">
            <div class="w-full flex justify-center pt-3 pb-1 cursor-pointer" onclick="closeTxSplitModal()">
                <div class="w-12 h-1.5 custom-bg-input rounded-full"></div>
            </div>
            
            <div class="p-5 pb-3 border-b custom-border flex items-center justify-between">
                <div>
                    <h3 class="font-black text-base sm:text-lg custom-text flex items-center gap-2">
                        <i class="fa-solid fa-money-bill-transfer text-indigo-500"></i> Chia Hóa Đơn (Campuchia)
                    </h3>
                    <p class="text-xs font-bold custom-text-secondary mt-0.5" id="tx-split-modal-sub">Tổng bill: 0 ₫</p>
                </div>
                <button onclick="closeTxSplitModal()" class="w-8 h-8 rounded-full custom-bg-input flex items-center justify-center text-xs custom-text-secondary">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div class="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                <!-- Chọn số người chia -->
                <div>
                    <label class="block text-[11px] font-black custom-text-secondary uppercase mb-2">Số người cùng chia (bao gồm bạn)</label>
                    <div class="flex items-center gap-2">
                        <button onclick="setSplitCount(2)" class="split-count-btn flex-1 py-2 rounded-xl custom-bg-input font-black text-xs custom-text border custom-border active:scale-95">2 người</button>
                        <button onclick="setSplitCount(3)" class="split-count-btn flex-1 py-2 rounded-xl custom-bg-input font-black text-xs custom-text border custom-border active:scale-95">3 người</button>
                        <button onclick="setSplitCount(4)" class="split-count-btn flex-1 py-2 rounded-xl custom-bg-input font-black text-xs custom-text border custom-border active:scale-95">4 người</button>
                        <button onclick="setSplitCount(5)" class="split-count-btn flex-1 py-2 rounded-xl custom-bg-input font-black text-xs custom-text border custom-border active:scale-95">5 người</button>
                    </div>
                </div>

                <!-- Nhập tên danh sách người chia -->
                <div>
                    <label class="block text-[11px] font-black custom-text-secondary uppercase mb-1.5">Tên những người cần thu tiền (cách nhau bằng dấu phẩy)</label>
                    <input type="text" id="tx-split-names-input" oninput="calculateSplitPreview()" placeholder="VD: Tuấn, Linh, Nam..." class="w-full p-3.5 rounded-2xl custom-bg-input border custom-border font-bold text-xs custom-text outline-none custom-focus">
                </div>

                <!-- Thẻ tóm tắt kết quả chia -->
                <div class="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                    <div class="flex items-center justify-between text-xs font-bold">
                        <span class="custom-text-secondary">Mỗi người chịu:</span>
                        <span class="text-base font-black text-indigo-500" id="tx-split-per-person">0 ₫</span>
                    </div>
                    <div class="flex items-center justify-between text-[11px] font-medium custom-text-secondary">
                        <span>Phần của tôi:</span>
                        <span class="font-bold text-emerald-500" id="tx-split-my-share">0 ₫</span>
                    </div>
                    <div class="flex items-center justify-between text-[11px] font-medium custom-text-secondary">
                        <span>Tổng tiền cần thu hồi từ bạn bè:</span>
                        <span class="font-bold text-rose-500" id="tx-split-total-debt">0 ₫</span>
                    </div>
                </div>

                <button onclick="confirmExecuteBillSplit()" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-primary-600 text-white font-black text-sm shadow-lg shadow-indigo-500/30 active:scale-95 transition-all flex items-center justify-center gap-2">
                    <i class="fa-solid fa-check"></i> Xác nhận tạo khoản thu nợ
                </button>
            </div>
        </div>

        <!-- ========================================== -->
        <!-- MODAL BIÊN LAI KỸ THUẬT SỐ ĐỂ CHIA SẺ -->
        <!-- ========================================== -->
        <div id="tx-receipt-modal-backdrop" onclick="closeReceiptShareModal()" class="fixed inset-0 bg-black/75 backdrop-blur-md z-[350] hidden opacity-0 transition-opacity duration-300 flex items-center justify-center p-4">
            <div id="tx-receipt-card" class="w-full max-w-sm rounded-[2rem] bg-white text-gray-900 overflow-hidden shadow-2xl relative font-sans animate-scaleUp" onclick="event.stopPropagation()">
                <!-- Header Receipt -->
                <div class="p-6 pb-4 bg-gradient-to-b from-gray-50 to-white text-center border-b border-dashed border-gray-300 relative">
                    <button onclick="closeReceiptShareModal()" class="absolute top-4 right-4 w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                    <div class="w-12 h-12 rounded-2xl bg-indigo-500 text-white mx-auto flex items-center justify-center text-xl shadow-md mb-2">
                        <i class="fa-solid fa-wallet"></i>
                    </div>
                    <h3 class="font-black text-base uppercase tracking-wider text-gray-800">FinMaster Receipt</h3>
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Biên Lai Giao Dịch Số</p>
                    <p class="text-2xl font-black mt-2 text-gray-900" id="rc-amount">-0 ₫</p>
                </div>

                <!-- Body Receipt -->
                <div class="p-6 py-4 space-y-2.5 text-xs font-bold text-gray-600 border-b border-dashed border-gray-300">
                    <div class="flex justify-between">
                        <span class="text-gray-400 font-medium">Danh mục:</span>
                        <span class="text-gray-800 font-black" id="rc-cat">Ăn uống</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400 font-medium">Thời gian:</span>
                        <span class="text-gray-800" id="rc-date">--/--/----</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400 font-medium">Nguồn thanh toán:</span>
                        <span class="text-gray-800" id="rc-wallet">Ví chính</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400 font-medium">Ghi chú:</span>
                        <span class="text-gray-800 truncate max-w-[180px]" id="rc-note">--</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400 font-medium">Mã tham chiếu:</span>
                        <span class="font-mono text-gray-500" id="rc-id">#TX-000</span>
                    </div>
                </div>

                <!-- Footer Barcode -->
                <div class="p-5 text-center bg-gray-50">
                    <div class="flex gap-0.5 justify-center h-9 opacity-70 mb-1" id="rc-barcode"></div>
                    <p class="text-[9px] font-mono tracking-widest text-gray-400">FINMASTER VERIFIED TRANSACTION</p>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    }

    // ==========================================
    // 2. MỞ TRANG CHI TIẾT GIAO DỊCH
    // ==========================================
    window.openFullTxPage = (txId) => {
        if (!state || !state.transactions) return;
        const tx = state.transactions.find(t => t.id === txId);
        if (!tx) return;

        currentFullTxId = txId;
        isAmountHidden = false;

        const cat = (state.categories || []).find(c => c.id === tx.category) || { name: "Khác", icon: "📦", type: "expense" };
        const wallet = (state.wallets || []).find(w => w.id === tx.walletId) || { name: "Ví ẩn", balance: 0 };
        const isInc = tx.type === 'income' || cat.type === 'income';

        // --- 1. THỜI GIAN & VÍ ---
        const d = new Date(tx.date);
        const dayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
        const dayOfWeek = !isNaN(d) ? dayNames[d.getDay()] : "";
        
        document.getElementById("tx-fp-date").innerText = !isNaN(d) 
            ? `${dayOfWeek}, ${d.toLocaleDateString("vi-VN")}` 
            : tx.date;
        document.getElementById("tx-fp-time").innerText = !isNaN(d) 
            ? d.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }) 
            : "--:--";

        // Relative time badge
        const diffDays = Math.floor((new Date() - d) / (1000 * 60 * 60 * 24));
        let relTimeStr = "Hôm nay";
        if (diffDays === 1) relTimeStr = "Hôm qua";
        else if (diffDays > 1) relTimeStr = `${diffDays} ngày trước`;
        document.getElementById("tx-fp-relative-time").innerText = relTimeStr;

        document.getElementById("tx-fp-wallet").innerText = wallet.name;
        document.getElementById("tx-fp-wallet-bal").innerText = `Số dư: ${formatMoney(wallet.balance)}`;

        // --- 2. CẢM XÚC CHI TIÊU ---
        updateEmotionButtons(tx.emotion);

        // --- 3. GHI CHÚ ---
        document.getElementById("tx-fp-note").innerHTML = tx.note 
            ? tx.note.replace(/\n/g, '<br>') 
            : '<span class="italic custom-text-secondary">Không có ghi chú nào...</span>';
        const noteBox = document.getElementById("tx-fp-note-edit-box");
        if (noteBox) noteBox.classList.add("hidden");

        // --- 4. HERO AURORA RECEIPT BANNER ---
        renderHeroBanner(tx, cat, isInc);

        // --- 5. TRỢ LÝ PHÂN TÍCH THÔNG MINH ---
        renderCopilotInsights(tx, cat, isInc, d);

        // --- 6. DU LỊCH & CAMPUCHIA ---
        renderCrossLinks(tx, isInc);

        // --- 7. HÌNH ẢNH HÓA ĐƠN ---
        const imgBox = document.getElementById("tx-fp-image-box");
        if (tx.image && tx.image.length > 50) {
            imgBox.classList.remove("hidden");
            document.getElementById("tx-fp-img").src = typeof window.getFastImage === 'function' ? window.getFastImage(tx.image) : tx.image;
        } else {
            imgBox.classList.add("hidden");
        }

        // --- 8. THỰC ĐỊA & BẢN ĐỒ ---
        const locBox = document.getElementById("tx-fp-location-box");
        const noLocBox = document.getElementById("tx-fp-no-location-box");
        
        if (tx.lat && tx.lng) {
            locBox.classList.remove("hidden");
            if (noLocBox) noLocBox.classList.add("hidden");
            
            document.getElementById("tx-fp-loc-name").innerText = tx.locationName || "Vị trí GPS đã lưu";
            document.getElementById("tx-fp-map-btn").onclick = () => window.open(`https://www.google.com/maps/dir/?api=1&destination=${tx.lat},${tx.lng}`, '_blank');

            setTimeout(() => {
                if (detailMapObj) {
                    detailMapObj.off();
                    detailMapObj.remove();
                }
                detailMapObj = L.map('tx-fp-leaflet-map', { zoomControl: false, attributionControl: false, dragging: true, scrollWheelZoom: false }).setView([tx.lat, tx.lng], 16);
                
                L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
                    subdomains: ['0', '1', '2', '3'],
                    maxZoom: 20
                }).addTo(detailMapObj);

                L.circleMarker([tx.lat, tx.lng], {
                    radius: 9, fillColor: "#f43f5e", color: "#ffffff", weight: 3, fillOpacity: 1
                }).addTo(detailMapObj);
            }, 300);
        } else {
            locBox.classList.add("hidden");
            if (noLocBox) noLocBox.classList.remove("hidden");
        }

        // --- MỞ OVERLAY ---
        const overlay = document.getElementById("tx-full-page-overlay");
        overlay.classList.remove("translate-x-full");
        document.getElementById("tx-fp-scroll-area").scrollTo(0, 0);
        if (typeof playSound === 'function') playSound("click");
    };

    // ==========================================
    // 3. VẼ HERO BANNER SIÊU SANG
    // ==========================================
    function renderHeroBanner(tx, cat, isInc) {
        const heroEl = document.getElementById("tx-fp-hero");
        const heroGradient = isInc 
            ? "linear-gradient(135deg, #059669 0%, #0d9488 45%, #0284c7 100%)" 
            : "linear-gradient(135deg, #e11d48 0%, #ea580c 45%, #7c3aed 100%)";
        
        // Barcode giả mạo nghệ thuật
        const barcodeLines = Array.from({ length: 32 }, (_, i) => {
            const w = (i % 3 === 0) ? 3 : (i % 2 === 0 ? 1.5 : 2);
            return `<div class="bg-white/40 rounded-full" style="width: ${w}px;"></div>`;
        }).join('');

        const refCode = tx.id.startsWith("tx-") ? tx.id.replace("tx-", "#TX-").toUpperCase() : `#TX-${tx.id.toUpperCase()}`;

        heroEl.style.background = heroGradient;
        heroEl.innerHTML = `
            <!-- Ánh sáng hắt mờ -->
            <div class="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-white/20 blur-3xl pointer-events-none"></div>
            <div class="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-black/20 blur-3xl pointer-events-none"></div>

            <!-- Avatar Danh Mục Nổi 3D -->
            <div class="relative z-10 w-22 h-22 rounded-[1.75rem] flex items-center justify-center text-4xl mb-3.5 shadow-2xl border-4 border-white/25 bg-white/15 backdrop-blur-2xl ring-4 ring-white/10 hover:scale-105 transition-transform duration-300">
                ${cat.icon}
            </div>

            <!-- Capsule Danh Mục -->
            <div class="relative z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/25 backdrop-blur-md mb-2.5">
                <span class="text-[10px] font-black uppercase tracking-widest">${cat.name}</span>
                <span class="w-1 h-1 rounded-full bg-white/60"></span>
                <span class="text-[9px] font-bold opacity-80">${isInc ? 'Khoản Thu' : 'Khoản Chi'}</span>
            </div>

            <!-- Số Tiền Nghệ Thuật To Bản -->
            <div class="relative z-10 flex items-center justify-center gap-2 mb-3">
                <h2 id="tx-fp-hero-amt" class="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-md">
                    ${isInc ? '+' : '-'}${formatMoney(tx.amount)}
                </h2>
                <button onclick="toggleHideTxAmount()" class="opacity-60 hover:opacity-100 transition-opacity text-base active:scale-90" title="Ẩn/Hiện số tiền">
                    <i id="tx-fp-eye-icon" class="fa-solid fa-eye text-sm"></i>
                </button>
            </div>

            <!-- Mã Vạch & Ref ID -->
            <div class="relative z-10 flex flex-col items-center mt-2">
                <div class="flex gap-1 justify-center h-8 px-4 opacity-40">
                    ${barcodeLines}
                </div>
                <div class="flex items-center gap-1.5 mt-1">
                    <span class="text-[10px] font-mono tracking-wider opacity-60 font-bold">${refCode}</span>
                    <button onclick="copyTxRef('${refCode}')" class="opacity-60 hover:opacity-100 active:scale-90 transition-all text-[10px]" title="Sao chép mã giao dịch">
                        <i class="fa-regular fa-copy"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // ==========================================
    // 4. TRỢ LÝ PHÂN TÍCH THÔNG MINH (AI FINANCIAL COPILOT)
    // ==========================================
    function renderCopilotInsights(tx, cat, isInc, dateObj) {
        const box = document.getElementById("tx-fp-insights-box");
        const cm = dateObj.getMonth();
        const cy = dateObj.getFullYear();

        // 1. Số lần chi trong tháng
        const sameCatTxs = (state.transactions || []).filter(t => 
            t.category === tx.category && 
            new Date(t.date).getMonth() === cm && 
            new Date(t.date).getFullYear() === cy && 
            t.type === tx.type
        );
        const txOrder = sameCatTxs.findIndex(t => t.id === tx.id) + 1 || sameCatTxs.length;
        const totalCatSpent = sameCatTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        // 2. Tổng chi toàn tháng
        const totalMonthSpent = (state.transactions || []).filter(t => 
            t.type === 'expense' && 
            t.category !== 'transfer' && 
            new Date(t.date).getMonth() === cm && 
            new Date(t.date).getFullYear() === cy
        ).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        const pctOfMonth = totalMonthSpent > 0 && !isInc ? ((tx.amount / totalMonthSpent) * 100).toFixed(1) : 0;

        // 3. So với Ngân Sách
        let budgetHtml = "";
        if (!isInc) {
            const budget = (state.budgets || []).find(b => b.categoryId === tx.category);
            if (budget) {
                const bPct = Math.min(100, Math.round((totalCatSpent / budget.amount) * 100));
                const isOver = totalCatSpent > budget.amount;
                budgetHtml = `
                    <div class="custom-bg-input p-3.5 rounded-2xl border custom-border space-y-2">
                        <div class="flex items-center justify-between text-xs font-bold">
                            <span class="custom-text-secondary flex items-center gap-1.5"><i class="fa-solid fa-bullseye text-amber-500"></i> Ngân sách ${cat.name}:</span>
                            <span class="font-black ${isOver ? 'text-rose-500' : 'text-primary-500'}">${bPct}% (${formatMoney(totalCatSpent)} / ${formatMoney(budget.amount)})</span>
                        </div>
                        <div class="h-2 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                            <div class="h-full rounded-full transition-all duration-700 ${isOver ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-400 to-primary-500'}" style="width: ${bPct}%;"></div>
                        </div>
                    </div>
                `;
            } else {
                budgetHtml = `
                    <div class="custom-bg-input p-3 rounded-2xl border custom-border flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <div class="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center text-xs text-amber-500"><i class="fa-solid fa-bullseye"></i></div>
                            <span class="text-xs font-bold custom-text">Chưa đặt ngân sách cho ${cat.name}</span>
                        </div>
                        <button onclick="closeFullTxPage(); openModal('budget')" class="px-2.5 py-1 rounded-xl bg-primary-500/10 text-primary-500 text-[10px] font-black hover:bg-primary-500 hover:text-white transition-all">Thiết lập ngay</button>
                    </div>
                `;
            }
        }

        box.innerHTML = `
            <div class="flex items-center justify-between mb-1">
                <h4 class="text-[10px] font-black custom-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                    <i class="fa-solid fa-brain text-emerald-500"></i> Trợ lý Phân tích FinMaster
                </h4>
                <span class="text-[9px] font-bold text-emerald-500 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">AI Insights</span>
            </div>

            <div class="grid grid-cols-2 gap-2.5">
                <div class="custom-bg-input p-3 rounded-2xl border custom-border">
                    <span class="text-[9px] font-black uppercase custom-text-secondary">Tần suất chi</span>
                    <p class="text-xs sm:text-sm font-black custom-text mt-0.5">Lần thứ ${txOrder} / Tháng</p>
                    <p class="text-[9px] font-semibold custom-text-secondary mt-0.5">Đã chi ${formatMoney(totalCatSpent)} cho ${cat.name}</p>
                </div>
                
                <div class="custom-bg-input p-3 rounded-2xl border custom-border">
                    <span class="text-[9px] font-black uppercase custom-text-secondary">Tỷ trọng tháng</span>
                    <p class="text-xs sm:text-sm font-black text-rose-500 mt-0.5">${pctOfMonth}%</p>
                    <p class="text-[9px] font-semibold custom-text-secondary mt-0.5">Trên tổng chi tháng ${cm + 1}</p>
                </div>
            </div>

            ${budgetHtml}
        `;
    }

    // ==========================================
    // 5. LIÊN KẾT CHÉO: DU LỊCH & CHIA TIỀN
    // ==========================================
    function renderCrossLinks(tx, isInc) {
        const linksBox = document.getElementById("tx-fp-links-box");
        let linksHtml = "";

        // Cột 1: Chuyến đi
        if (tx.tripId) {
            const trip = (state.trips || []).find(t => t.id === tx.tripId);
            linksHtml += `
                <div class="tx-fp-card-glass p-3.5 flex flex-col justify-between cursor-pointer group hover:border-emerald-500 transition-colors" onclick="closeFullTxPage(); if (typeof viewTripMap === 'function') viewTripMap('${tx.tripId}'); else switchView('trips');">
                    <div class="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-sm mb-2 group-hover:scale-105 transition-transform">
                        <i class="fa-solid fa-plane-departure"></i>
                    </div>
                    <div>
                        <span class="text-[9px] font-black uppercase text-emerald-500 tracking-wider">Thuộc Chuyến Đi</span>
                        <p class="text-xs font-black custom-text truncate mt-0.5">${trip ? trip.name : 'Chuyến đi'}</p>
                    </div>
                </div>
            `;
        } else {
            linksHtml += `
                <div class="tx-fp-card-glass p-3.5 flex flex-col justify-between cursor-pointer group hover:border-emerald-400 transition-colors" onclick="attachTxToTripModal('${tx.id}')">
                    <div class="w-8 h-8 rounded-xl custom-bg-input text-gray-400 flex items-center justify-center text-sm mb-2 group-hover:scale-105 transition-transform">
                        <i class="fa-solid fa-plane"></i>
                    </div>
                    <div>
                        <span class="text-[9px] font-black uppercase custom-text-secondary tracking-wider">Du Lịch</span>
                        <p class="text-xs font-bold text-primary-500 mt-0.5">Gắn vào chuyến đi &rarr;</p>
                    </div>
                </div>
            `;
        }

        // Cột 2: Chia hóa đơn (Campuchia)
        if (tx.isSplit && tx.splitDetails && tx.splitDetails.length > 0) {
            linksHtml += `
                <div class="tx-fp-card-glass p-3.5 flex flex-col justify-between cursor-pointer group hover:border-indigo-500 transition-colors" onclick="closeFullTxPage(); switchView('debts');">
                    <div class="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center text-sm mb-2 group-hover:scale-105 transition-transform">
                        <i class="fa-solid fa-handshake"></i>
                    </div>
                    <div>
                        <span class="text-[9px] font-black uppercase text-indigo-500 tracking-wider">Đã Chia Tiền</span>
                        <p class="text-xs font-black custom-text truncate mt-0.5">${tx.splitDetails.length} người chung bill</p>
                    </div>
                </div>
            `;
        } else if (!isInc) {
            linksHtml += `
                <div class="tx-fp-card-glass p-3.5 flex flex-col justify-between cursor-pointer group hover:border-indigo-400 transition-colors bg-gradient-to-br from-indigo-500/5 to-purple-500/5" onclick="openTxSplitModal('${tx.id}')">
                    <div class="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center text-sm mb-2 group-hover:scale-105 transition-transform">
                        <i class="fa-solid fa-money-bill-transfer"></i>
                    </div>
                    <div>
                        <span class="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">Campuchia</span>
                        <p class="text-xs font-bold text-indigo-500 mt-0.5">Chia hóa đơn này &rarr;</p>
                    </div>
                </div>
            `;
        } else {
            linksHtml += `
                <div class="tx-fp-card-glass p-3.5 flex flex-col justify-between opacity-50">
                    <div class="w-8 h-8 rounded-xl custom-bg-input text-gray-400 flex items-center justify-center text-sm mb-2">
                        <i class="fa-solid fa-arrow-down-left"></i>
                    </div>
                    <div>
                        <span class="text-[9px] font-black uppercase custom-text-secondary tracking-wider">Thu Nhập</span>
                        <p class="text-xs font-bold custom-text-secondary mt-0.5">Khoản tiền cộng ví</p>
                    </div>
                </div>
            `;
        }

        linksBox.innerHTML = linksHtml;
    }

    // ==========================================
    // 6. CÁC HÀM XỬ LÝ TƯƠNG TÁC NHANH
    // ==========================================
    window.closeFullTxPage = () => {
        const overlay = document.getElementById("tx-full-page-overlay");
        if (overlay) overlay.classList.add("translate-x-full");
        currentFullTxId = null;
    };

    window.toggleHideTxAmount = () => {
        isAmountHidden = !isAmountHidden;
        const amtEl = document.getElementById("tx-fp-hero-amt");
        const eyeIcon = document.getElementById("tx-fp-eye-icon");
        if (!amtEl || !currentFullTxId) return;

        const tx = state.transactions.find(t => t.id === currentFullTxId);
        if (!tx) return;

        const isInc = tx.type === 'income';
        if (isAmountHidden) {
            amtEl.innerText = "•••••••• ₫";
            if (eyeIcon) eyeIcon.className = "fa-solid fa-eye-slash text-sm";
        } else {
            amtEl.innerText = `${isInc ? '+' : '-'}${formatMoney(tx.amount)}`;
            if (eyeIcon) eyeIcon.className = "fa-solid fa-eye text-sm";
        }
    };

    window.copyTxRef = (refCode) => {
        navigator.clipboard.writeText(refCode).then(() => {
            alert(`Đã sao chép mã giao dịch: ${refCode}`);
            if (typeof playSound === 'function') playSound("pop");
        });
    };

    window.setTxEmotion = (emotion) => {
        if (!currentFullTxId) return;
        const tx = state.transactions.find(t => t.id === currentFullTxId);
        if (!tx) return;

        tx.emotion = emotion;
        if (typeof saveData === 'function') saveData();
        updateEmotionButtons(emotion);
        if (typeof playSound === 'function') playSound("pop");
    };

    function updateEmotionButtons(currentEmotion) {
        ['happy', 'normal', 'regret'].forEach(emo => {
            const btn = document.getElementById(`btn-emo-${emo}`);
            if (btn) {
                if (emo === currentEmotion) {
                    btn.classList.add('active', 'border-primary-500', 'bg-primary-500/15', 'shadow-sm');
                } else {
                    btn.classList.remove('active', 'border-primary-500', 'bg-primary-500/15', 'shadow-sm');
                }
            }
        });
    }

    window.toggleTxQuickNoteEdit = () => {
        const editBox = document.getElementById("tx-fp-note-edit-box");
        const textarea = document.getElementById("tx-fp-note-textarea");
        if (!editBox || !currentFullTxId) return;

        const tx = state.transactions.find(t => t.id === currentFullTxId);
        if (tx && textarea) textarea.value = tx.note || "";
        editBox.classList.toggle("hidden");
        if (!editBox.classList.contains("hidden") && textarea) textarea.focus();
    };

    window.saveTxQuickNote = () => {
        if (!currentFullTxId) return;
        const tx = state.transactions.find(t => t.id === currentFullTxId);
        const textarea = document.getElementById("tx-fp-note-textarea");
        if (!tx || !textarea) return;

        tx.note = textarea.value.trim();
        if (typeof saveData === 'function') saveData();
        
        document.getElementById("tx-fp-note").innerHTML = tx.note 
            ? tx.note.replace(/\n/g, '<br>') 
            : '<span class="italic custom-text-secondary">Không có ghi chú nào...</span>';
        
        document.getElementById("tx-fp-note-edit-box").classList.add("hidden");
        if (typeof playSound === 'function') playSound("success");
    };

    window.attachCurrentLocationToTx = () => {
        if (!currentFullTxId) return;
        const tx = state.transactions.find(t => t.id === currentFullTxId);
        if (!tx) return;

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    tx.lat = pos.coords.latitude;
                    tx.lng = pos.coords.longitude;
                    tx.locationName = "Vị trí GPS hiện tại";
                    if (typeof saveData === 'function') saveData();
                    alert("Đã gắn vị trí GPS hiện tại vào giao dịch!");
                    openFullTxPage(currentFullTxId);
                },
                (err) => alert("Không lấy được tọa độ GPS. Vui lòng cho phép quyền truy cập vị trí!")
            );
        } else {
            alert("Thiết bị không hỗ trợ định vị GPS!");
        }
    };

    window.attachTxToTripModal = (txId) => {
        if (!state.trips || state.trips.length === 0) {
            return alert("Chưa có chuyến đi nào được tạo. Hãy vào mục Chuyến Đi để tạo hành trình mới!");
        }
        const tripNames = state.trips.map((t, idx) => `${idx + 1}. ${t.name}`).join("\n");
        const ans = prompt(`Chọn số thứ tự chuyến đi để gắn vào giao dịch:\n${tripNames}`);
        const idx = parseInt(ans, 10) - 1;
        if (!isNaN(idx) && state.trips[idx]) {
            const tx = state.transactions.find(t => t.id === txId);
            if (tx) {
                tx.tripId = state.trips[idx].id;
                if (typeof saveData === 'function') saveData();
                alert(`Đã gắn giao dịch vào chuyến đi: ${state.trips[idx].name}`);
                openFullTxPage(txId);
            }
        }
    };

    // ==========================================
    // 7. BỘ NÃO CHIA TIỀN CAMPUCHIA HOÀN CHỈNH
    // ==========================================
    let activeSplitTx = null;
    let currentSplitCount = 2;

    window.openTxSplitModal = (txId) => {
        const tx = state.transactions.find(t => t.id === txId);
        if (!tx) return;

        activeSplitTx = tx;
        currentSplitCount = 2;

        const subEl = document.getElementById("tx-split-modal-sub");
        if (subEl) subEl.innerText = `Hóa đơn: -${formatMoney(tx.amount)}`;

        document.getElementById("tx-split-names-input").value = "";
        calculateSplitPreview();

        const backdrop = document.getElementById("tx-split-modal-backdrop");
        const sheet = document.getElementById("tx-split-modal");
        if (backdrop && sheet) {
            backdrop.classList.remove("hidden");
            setTimeout(() => {
                backdrop.classList.remove("opacity-0");
                sheet.classList.remove("translate-y-full");
            }, 10);
        }
        if (typeof playSound === 'function') playSound("pop");
    };

    window.closeTxSplitModal = () => {
        const backdrop = document.getElementById("tx-split-modal-backdrop");
        const sheet = document.getElementById("tx-split-modal");
        if (backdrop && sheet) {
            backdrop.classList.add("opacity-0");
            sheet.classList.add("translate-y-full");
            setTimeout(() => backdrop.classList.add("hidden"), 300);
        }
    };

    window.setSplitCount = (count) => {
        currentSplitCount = count;
        calculateSplitPreview();
        if (typeof playSound === 'function') playSound("click");
    };

    window.calculateSplitPreview = () => {
        if (!activeSplitTx) return;
        const total = activeSplitTx.amount;
        const namesVal = document.getElementById("tx-split-names-input").value.trim();
        const names = namesVal ? namesVal.split(",").map(n => n.trim()).filter(n => n) : [];

        // Nếu có nhập tên, ưu tiên số người = số tên + 1 (mình)
        const peopleCount = names.length > 0 ? names.length + 1 : currentSplitCount;
        const perPerson = Math.round(total / peopleCount);
        const myShare = total - (perPerson * (peopleCount - 1));
        const totalDebt = perPerson * (peopleCount - 1);

        document.getElementById("tx-split-per-person").innerText = formatMoney(perPerson);
        document.getElementById("tx-split-my-share").innerText = formatMoney(myShare);
        document.getElementById("tx-split-total-debt").innerText = formatMoney(totalDebt);
    };

    window.confirmExecuteBillSplit = () => {
        if (!activeSplitTx) return;
        const total = activeSplitTx.amount;
        const namesVal = document.getElementById("tx-split-names-input").value.trim();
        let names = namesVal ? namesVal.split(",").map(n => n.trim()).filter(n => n) : [];

        // Nếu chưa nhập tên, tự sinh Bạn 1, Bạn 2
        if (names.length === 0) {
            for (let i = 1; i < currentSplitCount; i++) {
                names.push(`Bạn ${i}`);
            }
        }

        const peopleCount = names.length + 1;
        const perPerson = Math.round(total / peopleCount);

        const cat = (state.categories || []).find(c => c.id === activeSplitTx.category) || { name: "Chi tiêu" };
        const billTag = activeSplitTx.note || cat.name;

        // Tạo các khoản nợ vào state.debts
        if (!state.debts) state.debts = [];
        names.forEach(name => {
            state.debts.unshift({
                id: "debt-" + Math.random().toString(36).substr(2, 9),
                person: `${name} (Chia bill: ${billTag})`,
                amount: perPerson,
                paidAmount: 0,
                type: "lend", // Tôi cho mượn -> cần thu lại
                status: "active",
                dueDate: new Date().toISOString().split("T")[0],
                date: new Date().toISOString()
            });
        });

        // Đánh dấu giao dịch
        activeSplitTx.isSplit = true;
        activeSplitTx.splitDetails = names.map(n => ({ name: n, amount: perPerson }));

        if (typeof saveData === 'function') saveData();
        if (typeof playSound === 'function') playSound("success");

        closeTxSplitModal();
        alert(`Đã chia bill thành công! Đã ghi nhận ${names.length} khoản thu nợ vào mục Nợ & Vay.`);
        openFullTxPage(activeSplitTx.id);
    };

    // ==========================================
    // 8. BIÊN LAI KỸ THUẬT SỐ ĐỂ CHIA SẺ (RECEIPT SHARE MODAL)
    // ==========================================
    window.openReceiptShareModal = () => {
        if (!currentFullTxId) return;
        const tx = state.transactions.find(t => t.id === currentFullTxId);
        if (!tx) return;

        const cat = (state.categories || []).find(c => c.id === tx.category) || { name: "Khác", icon: "📦" };
        const wallet = (state.wallets || []).find(w => w.id === tx.walletId) || { name: "Ví chính" };
        const isInc = tx.type === 'income';

        document.getElementById("rc-amount").innerText = `${isInc ? '+' : '-'}${formatMoney(tx.amount)}`;
        document.getElementById("rc-amount").className = `text-2xl font-black mt-2 ${isInc ? 'text-emerald-600' : 'text-rose-600'}`;
        document.getElementById("rc-cat").innerText = `${cat.icon} ${cat.name}`;
        document.getElementById("rc-date").innerText = new Date(tx.date).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        document.getElementById("rc-wallet").innerText = wallet.name;
        document.getElementById("rc-note").innerText = tx.note || "Giao dịch cá nhân";
        document.getElementById("rc-id").innerText = `#${tx.id.toUpperCase()}`;

        // Sinh Barcode
        const barcodeEl = document.getElementById("rc-barcode");
        if (barcodeEl) {
            barcodeEl.innerHTML = Array.from({ length: 28 }, (_, i) => {
                const w = (i % 3 === 0) ? 3 : (i % 2 === 0 ? 1.5 : 2);
                return `<div class="bg-gray-800 rounded-full" style="width: ${w}px;"></div>`;
            }).join('');
        }

        const backdrop = document.getElementById("tx-receipt-modal-backdrop");
        if (backdrop) {
            backdrop.classList.remove("hidden");
            setTimeout(() => backdrop.classList.remove("opacity-0"), 10);
        }
        if (typeof playSound === 'function') playSound("pop");
    };

    window.closeReceiptShareModal = () => {
        const backdrop = document.getElementById("tx-receipt-modal-backdrop");
        if (backdrop) {
            backdrop.classList.add("opacity-0");
            setTimeout(() => backdrop.classList.add("hidden"), 300);
        }
    };

    // ==========================================
    // 9. NHÂN BẢN & XÓA GIAO DỊCH
    // ==========================================
    window.duplicateTransaction = () => {
        if (!currentFullTxId) return;
        const tx = state.transactions.find(t => t.id === currentFullTxId);
        if (!tx) return;

        if (confirm("Nhân bản giao dịch này sang ngày hôm nay?")) {
            const newTx = { ...tx };
            newTx.id = "tx-" + Math.random().toString(36).substr(2, 9);
            newTx.date = new Date().toISOString().replace("T", " ").substring(0, 16);
            newTx.note = (newTx.note || "Giao dịch") + " (Bản sao)";

            state.transactions.unshift(newTx);

            const w = (state.wallets || []).find(w => w.id === newTx.walletId);
            if (w) w.balance += newTx.type === "income" ? newTx.amount : -newTx.amount;

            if (typeof saveData === 'function') saveData();
            closeFullTxPage();
            if (typeof renderTransactions === 'function') renderTransactions();
            if (typeof playSound === 'function') playSound("success");
            alert("Đã nhân bản giao dịch thành công!");
        }
    };

    window.deleteTransactionFromFull = () => {
        if (!currentFullTxId) return;
        if (typeof deleteTransaction === 'function') {
            deleteTransaction(currentFullTxId);
            closeFullTxPage();
        }
    };

    // BƠM KHUNG VÀO TRANG LÚC LOAD
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", injectFullPageUI);
    } else {
        injectFullPageUI();
    }
})();