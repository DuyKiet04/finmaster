const CACHE_NAME = 'finmaster-v20'; // Tăng version để ép trình duyệt cập nhật

// Các file nằm ngay trên máy của ông
const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json'
];

// Danh sách TOÀN BỘ thư viện bên ngoài ông đang xài trong HTML
const CDN_ASSETS = [
    'https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://unpkg.com/leaflet/dist/leaflet.css',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css',
    'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css',
    'https://npmcdn.com/flatpickr/dist/themes/dark.css',
    'https://cdn.jsdelivr.net/npm/flatpickr',
    'https://unpkg.com/leaflet/dist/leaflet.js',
    'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js'
];

self.addEventListener('install', (e) => {
    self.skipWaiting(); // Ép kích hoạt ngay lập tức
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Lưu file nội bộ
            cache.addAll(STATIC_ASSETS);
            
            // Ép lưu các file CDN (bỏ qua lỗi CORS bằng mode: 'no-cors')
            CDN_ASSETS.forEach((url) => {
                fetch(url, { mode: 'no-cors' })
                    .then((response) => cache.put(url, response))
                    .catch((err) => console.log('Lỗi lưu CDN:', url, err));
            });
        })
    );
});

self.addEventListener('activate', (e) => {
    // Xóa sạch các bộ nhớ đệm đời cũ (v1, v2)
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
});

self.addEventListener('fetch', (e) => {
    // Bỏ qua các đường dẫn không hợp lệ (như extension của Chrome)
    if (!e.request.url.startsWith('http')) return;

    e.respondWith(
        caches.match(e.request).then((cachedRes) => {
            // Lấy từ kho ra xài luôn nếu có
            if (cachedRes) return cachedRes;

            // Nếu chưa có thì tải từ mạng, tải xong cất vào kho luôn
            return fetch(e.request).then((networkRes) => {
                const resClone = networkRes.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
                return networkRes;
            }).catch(() => {
                console.log('Mất mạng và file này chưa được cache:', e.request.url);
            });
        })
    );
});