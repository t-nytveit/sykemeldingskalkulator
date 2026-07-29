const CACHE_NAME = "octacore-sykemeldingskalkulator-v1";

const APP_ASSETS = [
    "./",
    "./index.html",
    "./manifest.json",

    "./OctaCore_Horizontal_Dark.png",

    "./favicon.ico",
    "./favicon-16.png",
    "./favicon-32.png",
    "./favicon-48.png",

    "./apple-touch-icon.png",

    "./icon-192.png",
    "./icon-512.png"
];

// Installer service worker
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(APP_ASSETS);
        })
    );

    self.skipWaiting();
});

// Fjern gamle cacher
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => caches.delete(cacheName))
            );
        })
    );

    self.clients.claim();
});

// Håndter forespørsler
self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        caches.match(event.request).then(cachedResponse => {

            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request)
                .then(networkResponse => {

                    if (
                        !networkResponse ||
                        networkResponse.status !== 200 ||
                        networkResponse.type === "opaque"
                    ) {
                        return networkResponse;
                    }

                    const responseToCache = networkResponse.clone();

                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });

                    return networkResponse;

                })
                .catch(() => {

                    return caches.match("./index.html");

                });

        })

    );

});
