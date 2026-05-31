const CACHE_NAME = 'skyla-v2';

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(['/'])));
});

self.addEventListener('fetch', event => {
  // Never intercept API calls
  if (event.request.url.includes('api.anthropic.com') || 
      event.request.url.includes('supabase.co') ||
      event.request.url.includes('open-meteo.com') ||
      event.request.url.includes('googleapis.com') ||
      event.request.method !== 'GET') {
    return;
  }
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
