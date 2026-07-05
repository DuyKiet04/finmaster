const CACHE_NAME = 'finmaster-v1';

// CHỈ CHỨA CÁC FILE LOCAL NẰM TRONG MÁY CỦA ÔNG
const ASSETS = [
  '/',
  './index.html',
  './manifest.json',
  // Nếu ông có file CSS hay JS tự viết, thêm vào đây
  // './style.css', 
  // './script.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Đang cache các file local...');
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Trả về file đã cache nếu có, nếu không thì tải từ mạng (Network)
      return response || fetch(event.request);
    })
  );
});