const CACHE_NAME =
    "octacore-sykemeldingskalkulator-v6";

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

        const requestUrl =
            new URL(
                event.request.url
            );

        if (
            requestUrl.origin !==
            self.location.origin
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
                    async () => {
                        const cachedResponse =
                            await caches.match(
                                event.request
                            );

                        if (cachedResponse) {
                            return cachedResponse;
                        }

                        if (
                            event.request.mode ===
                            "navigate"
                        ) {
                            return caches.match(
                                "./index.html"
                            );
                        }

                        return new Response(
                            "Innholdet er ikke tilgjengelig uten nett.",
                            {
                                status: 503,
                                headers: {
                                    "Content-Type":
                                        "text/plain; charset=utf-8"
                                }
                            }
                        );
                    }
                )
        );
    }
);
