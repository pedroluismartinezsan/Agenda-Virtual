const CACHE_NAME = "agenda-quindio-v3";

const APP_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json"
];


// ==========================================
// INSTALACIÓN
// ==========================================

self.addEventListener("install", event => {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(APP_FILES);
      })
  );

  self.skipWaiting();

});


// ==========================================
// ACTIVACIÓN
// ==========================================

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(cacheNames => {

        return Promise.all(

          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))

        );

      })

  );

  self.clients.claim();

});


// ==========================================
// FETCH
// ==========================================

self.addEventListener("fetch", event => {

  const request = event.request;

  // Solo manejar solicitudes GET
  if (request.method !== "GET") {
    return;
  }

  // Solo manejar http y https
  const url = new URL(request.url);

  if (
    url.protocol !== "http:" &&
    url.protocol !== "https:"
  ) {
    return;
  }


  event.respondWith(

    caches.match(request)
      .then(cachedResponse => {

        // Si está en caché, utilizarlo
        if (cachedResponse) {
          return cachedResponse;
        }


        // Si no está en caché, solicitarlo
        return fetch(request)
          .then(networkResponse => {

            // Verificar respuesta válida
            if (
              !networkResponse ||
              networkResponse.status !== 200
            ) {
              return networkResponse;
            }


            // Guardar únicamente recursos http/https
            // y del mismo origen
            if (
              url.origin === self.location.origin
            ) {

              const responseClone =
                networkResponse.clone();

              caches.open(CACHE_NAME)
                .then(cache => {

                  cache.put(
                    request,
                    responseClone
                  ).catch(error => {

                    console.warn(
                      "No se pudo guardar en caché:",
                      request.url,
                      error
                    );

                  });

                });

            }


            return networkResponse;

          })
          .catch(() => {

            // Si estamos sin conexión,
            // devolver index.html
            return caches.match(
              "./index.html"
            );

          });

      })

  );

});
