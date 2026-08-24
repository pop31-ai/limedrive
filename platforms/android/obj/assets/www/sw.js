/* LimeDrive service worker: cache-first, runtime-caches game JSONs. */
const CACHE = "limedrive-v2";
const CORE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./lang/i18n.js",
  "./lang/en.json",
  "./lang/ru.json",
  "./lang/es.json",
  "./lang/de.json",
  "./examples/player.html",
  "./examples/index.html",
  "./engine/limedrive-core.js",
  "./engine/limedrive-components.js",
  "./engine/limedrive-systems.js",
  "./engine/limedrive-3d.js",
  "./engine/limedrive-ai.js",
  "./engine/limedrive-ui.js"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return resp;
    }).catch(() => caches.match("./examples/player.html")))
  );
});
