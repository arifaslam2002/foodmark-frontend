const CACHE_NAME = "foodmark-v1";
const urlsToCache = [
    "/",
    "/index.html",
    "/static/js/main.chunk.js",
    "/static/js/bundle.js",
    "/manifest.json"
];

// Install
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
});

// Activate
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // return cached version or fetch from network
            return response || fetch(event.request);
        })
    );
});