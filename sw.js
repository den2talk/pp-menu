// Офлайн-режим: сначала сеть (чтобы получать обновления), без сети — сохранённая копия
const CACHE = 'pp-v1';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE))); self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  e.respondWith(fetch(r).then((res) => {
    if (res.ok && (new URL(r.url).origin === location.origin || /fonts\.(googleapis|gstatic)\.com/.test(r.url))) {
      const copy = res.clone(); caches.open(CACHE).then((c) => c.put(r, copy));
    }
    return res;
  }).catch(() => caches.match(r).then((m) => m || (r.mode === 'navigate' ? caches.match('./index.html') : undefined))));
});
