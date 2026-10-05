/* ==========================================================
   AGENDA VIRTUAL · PEDRO LEÓN
   SERVICE WORKER
========================================================== */

const CACHE_NAME =
    "agenda-quindio-v5";


const STATIC_FILES = [

    "./",

    "./index.html",

    "./styles.css",

    "./app.js",

    "./manifest.json",

    "./icons/logo-diputado.png",

    "./icons/icon-192.png",

    "./icons/icon-512.png"

];


/* ==========================================================
   INSTALACIÓN
========================================================== */

self.addEventListener(
    "install",
    event => {

        console.log(
            "Service Worker: instalación"
        );


        event.waitUntil(

            caches
                .open(
                    CACHE_NAME
                )
                .then(
                    cache =>
                        cache.addAll(
                            STATIC_FILES
                        )
                )
                .then(
                    () =>
                        self.skipWaiting()
                )

        );

    }
);


/* ==========================================================
   ACTIVACIÓN
========================================================== */

self.addEventListener(
    "activate",
    event => {

        console.log(
            "Service Worker: activado"
        );


        event.waitUntil(

            caches
                .keys()
                .then(
                    cacheNames => {

                        return Promise.all(

                            cacheNames
                                .filter(
                                    name =>
                                        name !==
                                        CACHE_NAME
                                )
                                .map(
                                    name =>
                                        caches.delete(
                                            name
                                        )
                                )

                        );

                    }
                )
                .then(
                    () =>
                        self.clients.claim()
                )

        );

    }
);


/* ==========================================================
   FETCH
========================================================== */

self.addEventListener(
    "fetch",
    event => {

        const request =
            event.request;


        /*
         * SOLUCIÓN AL ERROR:
         *
         * chrome-extension://
         * moz-extension://
         * etc.
         *
         * NO se intentan guardar
         * en Cache.
         */

        if (
            request.method !== "GET"
        ) {

            return;

        }


        if (
            !(
                request.url.startsWith(
                    "http://"
                ) ||
                request.url.startsWith(
                    "https://"
                )
            )
        ) {

            return;

        }


        event.respondWith(

            caches.match(
                request
            )
            .then(
                cachedResponse => {

                    if (
                        cachedResponse
                    ) {

                        return cachedResponse;

                    }


                    return fetch(
                        request
                    )
                    .then(
                        response => {

                            /*
                             * Solo almacenamos
                             * respuestas válidas.
                             */

                            if (
                                !response ||
                                response.status !== 200
                            ) {

                                return response;

                            }


                            const responseClone =
                                response.clone();


                            caches
                                .open(
                                    CACHE_NAME
                                )
                                .then(
                                    cache => {

                                        cache.put(
                                            request,
                                            responseClone
                                        );

                                    }
                                );


                            return response;

                        }
                    );

                }
            )
            .catch(
                () =>
                    caches.match(
                        "./index.html"
                    )
            )

        );

    }
);


/* ==========================================================
   NOTIFICACIONES
========================================================== */

self.addEventListener(
    "notificationclick",
    event => {

        event.notification.close();


        event.waitUntil(

            clients.matchAll(
                {
                    type: "window",
                    includeUncontrolled: true
                }
            )
            .then(
                clientList => {

                    /*
                     * Si la aplicación
                     * ya está abierta,
                     * la enfocamos.
                     */

                    for (
                        const client of clientList
                    ) {

                        if (
                            "focus" in client
                        ) {

                            return client.focus();

                        }

                    }


                    /*
                     * Si no está abierta,
                     * abrimos la aplicación.
                     */

                    if (
                        clients.openWindow
                    ) {

                        return clients.openWindow(
                            "./"
                        );

                    }

                }
            )

        );

    }
);


/* ==========================================================
   MENSAJE DESDE LA APP
========================================================== */

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
