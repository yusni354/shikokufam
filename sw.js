// Service worker sederhana: jaringan dulu, cadangan dari cache (agar tetap terbuka saat sinyal lemah)
const C = 'kid-v1';
const ASET = ['./', 'index.html', 'config.js', 'manifest.webmanifest', 'style.css', 'maskot.webp', 'icon-192.png', 'apple-touch-icon.png', 'icon-512.png', 'icon-maskable-512.png', 'core.js', 'supabase.js', 'views-dashboard.js', 'views-members.js', 'views-form.js', 'views-absen-forum.js', 'views-peta.js', 'views-admin.js', 'router.js', 'mascot.js', 'auth.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(ASET))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request)));
});
