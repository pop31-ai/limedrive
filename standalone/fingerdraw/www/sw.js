const CACHE = 'fingerdraw-v1';
const ASSETS = [
  '/fingerdraw/index.html',
  '/fingerdraw/manifest.json',
  '/fingerdraw/src/styles.css',
  '/fingerdraw/src/app.js',
  '/fingerdraw/src/canvas/mainCanvas.js',
  '/fingerdraw/src/canvas/layerManager.js',
  '/fingerdraw/src/canvas/previewCanvas.js',
  '/fingerdraw/src/canvas/zoomCanvas.js',
  '/fingerdraw/src/tools/pen.js',
  '/fingerdraw/src/modes/preciseMode.js',
  '/fingerdraw/src/modes/visibleMode.js',
  '/fingerdraw/src/utils/touch.js',
  '/fingerdraw/src/utils/history.js',
  '/fingerdraw/src/utils/selection.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
