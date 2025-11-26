// service-worker.js

// Nombre de la caché y versión (cambiar esto fuerza una actualización)
const CACHE_NAME = 'mexico-se-entere-que-v1';

// Evento de Instalación: El Service Worker se instala.
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Instalando...');
    // Fuerza la activación inmediata del Service Worker nuevo
    self.skipWaiting(); 
});

// Evento de Activación: El Service Worker toma el control.
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activando...');
    // Asegura que la página actual use el Service Worker
    event.waitUntil(self.clients.claim()); 
});

// Evento Fetch: Define cómo manejar las solicitudes de red.
// Por ahora, solo deja que todo pase por la red.
self.addEventListener('fetch', (event) => {
    // Si no definimos ninguna estrategia de caché, simplemente se usa la red
    event.respondWith(fetch(event.request));
});
