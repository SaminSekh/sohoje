const CACHE_NAME = 'shop-menu-v1';
const ASSETS = [
    './',
    './shop-products.html',
    './css/style.css',
    './js/supabase-config.js',
    './js/shop-products.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
