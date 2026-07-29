const CACHE_NAME =
    "octacore-sykemeldingskalkulator-v7";

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
                .then(
                    () =>
                        self.clients.claim()
                )
        );
    }
);

self.addEventListener(
    "message",
    event => {
        if (
            event.data &&
            event.data.type ===
                "SKIP_WAITING"
        ) {
            self.skipWaiting();
        }
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

        if (
            event.request.mode ===
            "navigate"
        ) {
            event.respondWith(
                fetch(
                    event.request
                )
                    .then(
                        networkResponse => {
                            const responseCopy =
                                networkResponse.clone();

                            caches
                                .open(
                                    CACHE_NAME
                                )
                                .then(
                                    cache =>
                                        cache.put(
                                            "./index.html",
                                            responseCopy
                                        )
                                );

                            return networkResponse;
                        }
                    )
                    .catch(
                        () =>
                            caches.match(
                                "./index.html"
                            )
                    )
            );

            return;
        }

        event.respondWith(
            caches
                .match(
                    event.request
                )
                .then(
                    cachedResponse => {
                        if (
                            cachedResponse
                        ) {
                            return cachedResponse;
                        }

                        return fetch(
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

                                    const responseCopy =
                                        networkResponse.clone();

                                    caches
                                        .open(
                                            CACHE_NAME
                                        )
                                        .then(
                                            cache =>
                                                cache.put(
                                                    event.request,
                                                    responseCopy
                                                )
                                        );

                                    return networkResponse;
                                }
                            );
                    }
                )
                .catch(
                    () =>
                        new Response(
                            "Innholdet er ikke tilgjengelig uten nett.",
                            {
                                status: 503,
                                headers: {
                                    "Content-Type":
                                        "text/plain; charset=utf-8"
                                }
                            }
                        )
                )
        );
    }
);
