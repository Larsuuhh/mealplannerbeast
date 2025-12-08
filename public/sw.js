// Minimale Service Worker voor PWA installatie
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simpele pass-through (laat alles door naar het internet)
  // Dit zorgt ervoor dat de app werkt, maar wel 'installeerbaar' is.
  event.respondWith(fetch(event.request));
});
