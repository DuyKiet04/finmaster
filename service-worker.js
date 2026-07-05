const CACHE_NAME = 'finmaster-v2'; // Đổi tên cache để nó làm mới

// Chỉ lưu những file nội bộ chắc chắn 100% không bị lỗi CORS
const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json'
];

// Sự kiện Cài đặt: Lưu các file nội bộ
self.addEventListener('install', (e) => {
    self.skipWaiting(); // Ép nó cập nhật ngay bản mới
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Đang lưu trữ file tĩnh...');
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// Sự kiện Kích hoạt: Dọn rác bản cũ
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Xóa cache cũ:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Sự kiện Fetch: Tự động lưu những file tải từ mạng (CSS, JS, Icon...)
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            // 1. Nếu có trong cache rồi thì lấy ra dùng luôn (Cực nhanh, offline vẫn có)
            if (cachedResponse) {
                return cachedResponse;
            }

            // 2. Nếu chưa có, thì phi ra mạng tải về
            return fetch(e.request).then((networkResponse) => {
                // Kiểm tra xem phản hồi có hợp lệ không
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    // Nếu là file từ CDN (như Tailwind, FontAwesome có type là 'opaque'), vẫn ráng lưu lại
                    if(networkResponse && networkResponse.type === 'opaque') {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(e.request, responseToCache);
                        });
                    }
                    return networkResponse;
                }

                // Copy 1 bản để lưu vào kho, 1 bản trả về cho trình duyệt
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(e.request, responseToCache);
                });

                return networkResponse;
            }).catch((err) => {
                console.error('[Service Worker] Mất mạng và không có cache cho:', e.request.url);
                // Nếu rớt mạng mà file không có trong cache, nó sẽ báo lỗi ở đây
            });
        })
    );
});