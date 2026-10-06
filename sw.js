// Primero intento la red; si falla, uso la copia guardada.
const CACHE = 'ayvar-v1';
const CORE = ['/', 'index.html', 'css/style.css', 'css/enhancements.css', 'css/extras.css', 'css/ayvarcitoo.css', 'js/preferences.js', 'js/script.js', 'js/enhancements.js', 'js/extras.js', 'js/ayvarcitoo.js', 'img/yo.jpg', 'img/favicon.ico', 'img/icon-192.png'];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
    const req = e.request;
    // Solo guardo peticiones GET, no los envíos del formulario.
    if (req.method !== 'GET' || !req.url.startsWith('http')) return;
    e.respondWith(
        fetch(req).then(res => {
            if (res.ok && (res.type === 'basic' || res.type === 'cors')) {
                const copy = res.clone();
                caches.open(CACHE).then(c => c.put(req, copy));
            }
            return res;
        }).catch(() => caches.match(req).then(hit => hit || (req.mode === 'navigate' ? caches.match('/') : Response.error())))
    );
});
