/* Finanzas JB · service worker: permite instalar la app y abrirla sin conexión.
   Cambia VERSION en cada despliegue para que los celulares tomen la versión nueva. */
const VERSION = 'fjb-v0.2.1';
const ARCHIVOS = [
  './', 'index.html', 'css/app.css?v=0.2.1',
  'js/store.js?v=0.2.1', 'js/app.js?v=0.2.1',
  'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Primero la red (para ver siempre lo último publicado); si no hay conexión, lo guardado.
// Los archivos propios se piden revalidando, para no mezclar una página nueva con código viejo de la caché del navegador.
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  const own = new URL(e.request.url).origin === location.origin;
  e.respondWith(
    fetch(e.request, own ? {cache:'no-cache'} : undefined).then(r => {
      if(r.ok && (new URL(e.request.url).origin === location.origin || e.request.url.includes('fonts.g'))){
        const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy));
      }
      return r;
    }).catch(() => caches.match(e.request, {ignoreSearch:true}).then(r => r || caches.match('index.html')))
  );
});
