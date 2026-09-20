const CACHE_NAME = 'finmaster-v115'; // Ép trình duyệt dọn sạch rác cũ đi

// 1. FILE Ở MÁY ĐẠI KA
const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './work.js',
    './image.js',
    './theme.css',
    './12.js',
    './chart.js'
];

// 2. THƯ VIỆN GIAO DIỆN
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

const EXTERNAL_ASSETS = [...CDN_ASSETS, ...AI_MODELS];

self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            cache.addAll(STATIC_ASSETS);
            
            // XÓA LỆNH "no-cors" ĐI ĐỂ AI ĐỌC ĐƯỢC CHỮ BÊN TRONG FILE
            EXTERNAL_ASSETS.forEach((url) => {
                fetch(url)
                    .then((response) => {
                        if (response.ok) cache.put(url, response);
                    })
                    .catch((err) => console.log('Lỗi tải CDN:', url, err));
            });
        })
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
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