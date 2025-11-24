// Nombre de la caché y versión. ¡Actualiza este número para forzar la actualización de la caché!
const CACHE_NAME = 'mexico-se-entere-que-cache-v2';

// Lista de archivos estáticos esenciales para que la aplicación funcione offline
// (Los mismos que están referenciados en tu HTML y CSS).
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/service-worker.js',
    
    // Recursos externos (fuentes) que deben ser cacheados para funcionar offline:
    'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&family=Open+Sans:wght@400;600;700&display=swap',
    'https://fonts.gstatic.com', 
    
    // URL simulada del manifiesto WAP (para permitir la navegación offline incluso en este enlace)
    '/downloads/MexicoSeEntereQue.jad',
    '/downloads/MexicoSeEntereQue.jar' 
];

/*
 * ========================================
 * 1. EVENTO: INSTALL
 * Instala la caché de recursos estáticos.
 * ========================================
 */
self.addEventListener('install', event => {
    console.log('[Service Worker] Instalando la versión:', CACHE_NAME);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Archivos estáticos agregados al caché.');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('[Service Worker] Falló al cachear los recursos estáticos:', error);
            })
    );
});

/*
 * ========================================
 * 2. EVENTO: ACTIVATE
 * Limpia cachés antiguas (actualización del SW).
 * ========================================
 */
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activando...');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('[Service Worker] Limpiando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Asegura que el SW toma control de la página inmediatamente
    return self.clients.claim();
});

/*
 * ========================================
 * 3. EVENTO: FETCH
 * Estrategia de caching para todas las peticiones.
 * ========================================
 */
self.addEventListener('fetch', event => {
    // ----------------------------------------------------
    // Estrategia 1: Cache First (para recursos estáticos)
    // ----------------------------------------------------
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 1. Si está en caché, lo devuelve inmediatamente (¡muy rápido!)
                if (response) {
                    return response;
                }
                
                // 2. Si no está en caché, va a la red
                return fetch(event.request).then(
                    networkResponse => {
                        // Verificación de respuesta válida antes de cachear
                        if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        
                        // 3. Cacheo dinámico para imágenes de noticias y el JSON de datos
                        // Clonamos la respuesta porque el stream solo puede ser consumido una vez.
                        const responseToCache = networkResponse.clone();
                        
                        // Si es una petición GET y es para una imagen o datos dinámicos, la cacheamos
                        if (event.request.method === 'GET') {
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                });
                        }

                        // Devuelve la respuesta de la red
                        return networkResponse;
                    }
                ).catch(() => {
                    // Fallo total: No está en caché ni hay red.
                    // Aquí podrías retornar una página genérica de "Sin Conexión".
                    // return caches.match('/offline.html'); 
                });
            })
    );
});
