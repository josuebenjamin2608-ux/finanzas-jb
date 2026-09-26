/* Finanzas JB · service worker: permite instalar la app y abrirla sin conexión.
   Cambia VERSION en cada despliegue para que los celulares tomen la versión nueva. */
const VERSION = 'fjb-v0.1.0';
const ARCHIVOS = [
  './', 'index.html', 'css/app.css',
  'js/datos-ejemplo.js', 'js/store.js', 'js/app.js',
  'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Primero la red (para ver siempre lo último publicado); si no hay conexión, lo guardado.
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      if(r.ok && (new URL(e.request.url).origin === location.origin || e.request.url.includes('fonts.g'))){
        const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy));
      }
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
