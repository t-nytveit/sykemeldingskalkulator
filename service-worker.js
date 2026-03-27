const cacheName = 'kiwi-enkel-v1';
const assets = [
  './',
  './index.html',
  './manifest.json',
  './kiwi-logo-e1620058626739-1024x346.png',
  './k_icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assets);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});
