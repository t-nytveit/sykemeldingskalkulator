const CACHE_NAME =
    "octacore-sykemeldingskalkulator-v4";

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
                .open(CACHE_NAME)
                .then(
                    cache =>
                        cache.addAll(
                            APP_ASSETS
                        )
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
                    cacheNames =>
                        Promise.all(
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
                        )
                )
        );

        self.clients.claim();
    }
);

self.addEventListener(
    "fetch",
    event => {
        if (
            event.request.method !== "GET"
        ) {
            return;
        }

        event.respondWith(
            fetch(event.request)
                .then(
                    networkResponse => {
                        if (
                            !networkResponse ||
                            networkResponse.status !== 200
                        ) {
                            return networkResponse;
                        }

                        const responseCopy =
                            networkResponse.clone();

                        caches
                            .open(CACHE_NAME)
                            .then(
                                cache =>
                                    cache.put(
                                        event.request,
                                        responseCopy
                                    )
                            );

                        return networkResponse;
                    }
                )
                .catch(
                    () =>
                        caches
                            .match(event.request)
                            .then(
                                cachedResponse =>
                                    cachedResponse ||
                                    caches.match(
                                        "./index.html"
                                    )
                            )
                )
        );
    }
);
