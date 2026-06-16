// service-worker.js - ColectTap PWA
const CACHE_NAME = 'colecttap-cache-v2.18';
const FILES_TO_CACHE = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  // Nunca interceptar GAS (evita cache de resposta opaca e interferência com POST/redirect)
  if (url.includes('script.google.com')) return;
  // Nunca cachear POST (cache.put rejeita POST silenciosamente no Chrome)
  if (event.request.method !== 'GET') return;
  // Nunca cachear data: ou blob:
  if (url.startsWith('data:') || url.startsWith('blob:')) return;

  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
