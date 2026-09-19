const CACHE_NAME = 'finmaster-v112'; // Tăng lên v111 để ép trình duyệt nhả bộ nhớ cũ, thay áo mới ngay lập tức!

// 1. FILE Ở MÁY ĐẠI KA (File nội bộ)
const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './work.js',
    './image.js',
    './theme.css' ,
    './12.js',       // Bơm lại vào đây
    './chart.js'
];

// 2. THƯ VIỆN GIAO DIỆN & CÔNG CỤ (Tải từ CDN về giấu trong ổ cứng)
const CDN_ASSETS = [
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://unpkg.com/leaflet/dist/leaflet.css',
    'https://unpkg.com/leaflet/dist/leaflet.js',
    'https://unpkg.com/leaflet-heat@0.2.0/dist/leaflet-heat.js',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js',
    'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css',
    'https://npmcdn.com/flatpickr/dist/themes/dark.css',
    'https://cdn.jsdelivr.net/npm/flatpickr',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js',
    'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js',
    'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js'
];

// 3. BỘ NÃO AI FACE ID (Bắt buộc phải tải về để quét Offline 100%)
const AI_MODELS = [
    'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.min.js',
    'https://vladmandic.github.io/face-api/model/tiny_face_detector_model-weights_manifest.json',
    'https://vladmandic.github.io/face-api/model/tiny_face_detector_model-shard1',
    'https://vladmandic.github.io/face-api/model/face_landmark_68_model-weights_manifest.json',
    'https://vladmandic.github.io/face-api/model/face_landmark_68_model-shard1',
    'https://vladmandic.github.io/face-api/model/face_recognition_model-weights_manifest.json',
    'https://vladmandic.github.io/face-api/model/face_recognition_model-shard1',
    'https://vladmandic.github.io/face-api/model/face_recognition_model-shard2'
];

// Gộp chung CDN và AI lại để fetch bằng chế độ lách luật (no-cors)
const EXTERNAL_ASSETS = [...CDN_ASSETS, ...AI_MODELS];

// SỰ KIỆN 1: KHI APP ĐƯỢC CÀI ĐẶT
self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Nhét file nội bộ vào trước
            cache.addAll(STATIC_ASSETS);
            
            // Nhét thư viện ngoài vào bằng no-cors (để lách luật bảo mật chéo domain của trình duyệt)
            EXTERNAL_ASSETS.forEach((url) => {
                fetch(url, { mode: 'no-cors' })
                    .then((response) => cache.put(url, response))
                    .catch((err) => console.log('Lỗi tải CDN offline:', url, err));
            });
        })
    );
});

// SỰ KIỆN 2: DỌN RÁC BẢN CŨ
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// SỰ KIỆN 3: NHẬN LỆNH TỪ NÚT "CẬP NHẬT" TRÊN GIAO DIỆN
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// SỰ KIỆN 4: ĐÁNH CHẶN YÊU CẦU MẠNG KHI APP CHẠY
self.addEventListener('fetch', (e) => {
    // Tấm khiên bảo vệ: Né những thằng gọi API dữ liệu thay đổi liên tục ra
    // Mấy thằng này đéo được lưu vào máy, có mạng thì xài, mất mạng thì bỏ qua!
    if (e.request.url.includes('api.open-meteo.com') || 
        e.request.url.includes('api.openweathermap.org') ||
        e.request.url.includes('nominatim.openstreetmap.org') ||
        e.request.url.includes('photon.komoot.io') ||
        e.request.url.includes('script.google.com') || 
        e.request.url.includes('overpass-api.de')) {
        return; 
    }

    // Thuật toán: Cache First (Vào kho tìm trước, đéo có mới ra mạng tải)
    e.respondWith(
        caches.match(e.request).then((cachedRes) => {
            if (cachedRes) return cachedRes; // Nếu có sẵn trong kho thì lấy ra xài luôn (Dù cúp mạng)
            
            return fetch(e.request).then((networkRes) => {
                // Nếu là GET request hợp lệ thì đem vào cache để lần sau xài offline
                if (e.request.method === 'GET' && networkRes.status === 200 && networkRes.type === 'basic') {
                    const resClone = networkRes.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
                }
                return networkRes;
            }).catch(() => {
                console.log('Mất mạng và file này chưa được cache:', e.request.url);
            });
        })
    );
});