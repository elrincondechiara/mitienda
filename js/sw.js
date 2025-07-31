self.addEventListener('install', e => {
    e.waitUntil(
      caches.open('chiara-v1').then(cache => {
        return cache.addAll([
          '/',
          '/index.html',
          '/css/style.css',
          '/js/main.js',
          '/logo.png'
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', e => {
    e.respondWith(
      caches.match(e.request).then(res => res || fetch(e.request))
    );
  });