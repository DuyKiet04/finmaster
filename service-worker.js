const CACHE_NAME = 'finmaster-v108'; // Lên 103 để ép nó cởi bộ quần áo cũ ra!

// 1. NHÉT HẾT CODE Ở MÁY VÀO ĐÂY (Thiếu 1 file là offline lỗi 1 file)
const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './work.js',        // <--- Bắt buộc phải có
    './12.js',          // <--- File Tailwind ông tải về
    './chart.js',       // <--- File ChartJS ông tải về
    './theme.css',   // <--- Nếu ông có file CSS riêng thì bỏ dấu // ở đầu đi
];

// 2. Danh sách thư viện bên ngoài
const CDN_ASSETS = [
    'https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://unpkg.com/leaflet/dist/leaflet.css',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css',
    'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css',
    'https://npmcdn.com/flatpickr/dist/themes/dark.css',
    'https://cdn.jsdelivr.net/npm/flatpickr',
    'https://unpkg.com/leaflet/dist/leaflet.js',
    'https://unpkg.com/leaflet-heat@0.2.0/dist/leaflet-heat.js',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js'
];

self.addEventListener('install', (e) => {
    // Nghe ngóng xem khi nào đại ka bấm nút "Cập nhật" trên màn hình thì mới kích hoạt bản mới
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            cache.addAll(STATIC_ASSETS);
            
            CDN_ASSETS.forEach((url) => {
                fetch(url, { mode: 'no-cors' })
                    .then((response) => cache.put(url, response))
                    .catch((err) => console.log('Lỗi lưu CDN:', url, err));
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
        }).then(() => self.clients.claim()) // Thêm dòng này để giành quyền điều khiển ngay lập tức
    );
});

self.addEventListener('fetch', (e) => {
    // Chỉ xử lý link HTTP/HTTPS, bỏ qua chrome-extension:// v.v..
    if (!e.request.url.startsWith('http')) return;

    // Tha cho lệnh POST (cấm lưu cache khi đẩy data đi)
    if (e.request.method !== 'GET') {
        return; 
    }

    // ĐÃ XÓA CÁI LỆNH CHẶN ORIGIN NGU NGỐC Ở ĐÂY ĐỂ NÓ LOAD ĐƯỢC FONTAWESOME!

    e.respondWith(
        caches.match(e.request).then((cachedRes) => {
            if (cachedRes) return cachedRes;

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