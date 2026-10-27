const CACHE_NAME = 'finmaster-v139'; // Cập nhật trung tâm cài đặt siêu sang & trang chi tiết trượt

// 1. FILE TĨNH & GIAO DIỆN HỆ THỐNG
const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon.svg',
    './work.js',
    './image.js',
    './custommaps.js',
    './theme.css',
    './1.css',
    './12.js',
    './chart.js',
    './tx-detail.js',
    './diary.js',
    './diary1.js',
    './analytics.js',
    './location-analytics.js',
    './trend-analytics.js',
    './category-manager.js',
    './tx-full-page.js',
    './calendar-pro.js',
    './three.min.js',
    './three-spatial.js',
    './system-pro.js',
    './form-pro.js',
    './offline-sync.js',
    './budget-pro.js',
    './goals-pro.js',
    './driver-pro.js',
    './tasks-pro.js',
    './geo-pro.js',
    './settings-pro.js'
];

// 2. THƯ VIỆN GIAO DIỆN
const CDN_ASSETS = [
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://unpkg.com/leaflet/dist/leaflet.css',
    'https://unpkg.com/leaflet/dist/leaflet.js',
    'https://cdn.jsdelivr.net/npm/leaflet.heat@0.2.0/dist/leaflet-heat.js',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js',
    'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css',
    'https://cdn.jsdelivr.net/npm/flatpickr/dist/themes/dark.css',
    'https://cdn.jsdelivr.net/npm/flatpickr',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js',
    'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js',
    'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js'
];

// 3. BỘ NÃO AI FACE ID (Đã đổi link sang JSDelivr)
const AI_MODELS = [
    'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.min.js',
    'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/tiny_face_detector_model-weights_manifest.json',
    'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/tiny_face_detector_model-shard1',
    'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_landmark_68_model-weights_manifest.json',
    'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_landmark_68_model-shard1',
    'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_recognition_model-weights_manifest.json',
    'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_recognition_model-shard1',
    'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_recognition_model-shard2'
];

self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Tải file nội bộ
            cache.addAll(STATIC_ASSETS).catch((err) => console.log('Lỗi cache file tĩnh:', err));
            
            // Tải trước CDN UI với mode no-cors để không bị trình duyệt chặn CORS
            CDN_ASSETS.forEach((url) => {
                fetch(url, { mode: 'no-cors' })
                    .then((response) => {
                        if (response.status === 200 || response.type === 'opaque') {
                            cache.put(url, response);
                        }
                    })
                    .catch(() => {});
            });

            // Tải model Face API (JSDelivr hỗ trợ CORS đầy đủ)
            AI_MODELS.forEach((url) => {
                fetch(url, { mode: 'cors' })
                    .then((response) => {
                        if (response.ok) cache.put(url, response);
                    })
                    .catch((err) => console.log('Lỗi tải AI Model:', url, err));
            });
        })
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => {
                    console.log(`[FinMaster] Làm mới tài nguyên giao diện (${key} -> ${CACHE_NAME}). Toàn bộ cơ sở dữ liệu chi tiêu (IndexedDB) được bảo toàn nguyên vẹn 100%.`);
                    return caches.delete(key);
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('fetch', (e) => {
    if (e.request.url.includes('api.open-meteo.com') || 
        e.request.url.includes('api.openweathermap.org') ||
        e.request.url.includes('nominatim.openstreetmap.org') ||
        e.request.url.includes('photon.komoot.io') ||
        e.request.url.includes('script.google.com') || 
        e.request.url.includes('overpass-api.de')) {
        return; 
    }

    // Không chặn các request CDN bên ngoài nếu xảy ra lỗi mạng
    if (!e.request.url.startsWith(self.location.origin)) {
        e.respondWith(
            caches.match(e.request).then((cachedRes) => {
                return cachedRes || fetch(e.request);
            })
        );
        return;
    }

    e.respondWith(
        caches.match(e.request).then((cachedRes) => {
            if (cachedRes) return cachedRes; 
            
            return fetch(e.request).then((networkRes) => {
                if (e.request.method === 'GET' && networkRes.status === 200 && networkRes.type === 'basic') {
                    const resClone = networkRes.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
                }
                return networkRes;
            }).catch(() => {
                console.log('Mất mạng:', e.request.url);
            });
        })
    );
});