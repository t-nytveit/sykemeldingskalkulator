const CACHE_NAME =
    "octacore-sykemeldingskalkulator-v3";

const APP_ASSETS = [
    "./",
    "./index.html",
    "./manifest.json",

    "./OctaCore_Core_Symbol_Transparent.svg",

    "./favicon.ico",
    "./favicon-16.png",
    "./favicon-32.png",
    "./favicon-48.png",

    "./apple-touch-icon.png",

    "./icon-192.png",
    "./icon-512.png"
];

self.addEventListener(
    "install",
    event => {
        event.waitUntil(
            caches
                .open(
                    CACHE_NAME
                )
                .then(
                    cache => {
                        return cache.addAll(
                            APP_ASSETS
                        );
                    }
                )
        );

        self.skipWaiting();
    }
);

self.addEventListener(
    "activate",
    event => {
        event.waitUntil(
            caches
                .keys()
                .then(
                    cacheNames => {
                        return Promise.all(
                            cacheNames
                                .filter(
                                    cacheName =>
                                        cacheName !==
                                        CACHE_NAME
                                )
                                .map(
                                    cacheName =>
                                        caches.delete(
                                            cacheName
                                        )
                                )
                        );
                    }
                )
        );

        self.clients.claim();
    }
);

self.addEventListener(
    "fetch",
    event => {
        if (
            event.request.method !==
            "GET"
        ) {
            return;
        }

        event.respondWith(
            fetch(
                event.request
            )
                .then(
                    networkResponse => {
                        if (
                            !networkResponse ||
                            networkResponse.status !==
                                200
                        ) {
                            return networkResponse;
                        }

                        const responseToCache =
                            networkResponse.clone();

                        caches
                            .open(
                                CACHE_NAME
                            )
                            .then(
                                cache => {
                                    cache.put(
                                        event.request,
                                        responseToCache
                                    );
                                }
                            );

                        return networkResponse;
                    }
                )
                .catch(
                    () => {
                        return caches
                            .match(
                                event.request
                            )
                            .then(
                                cachedResponse => {
                                    return (
                                        cachedResponse ||
                                        caches.match(
                                            "./index.html"
                                        )
                                    );
                                }
                            );
                    }
                )
        );
    }
);
