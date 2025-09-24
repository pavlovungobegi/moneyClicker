const CACHE_NAME = 'interest-inc-v5';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './backround.mp3',
  './manifest.json',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './404.html',
  // Font Awesome resources
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.ttf'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache.map(url => {
          // Handle both relative and absolute URLs
          if (url.startsWith('http')) {
            // External URLs (Font Awesome)
            return new Request(url, { mode: 'cors' });
          } else {
            // Local URLs
            return new Request(url, { mode: 'no-cors' });
          }
        }));
      })
      .catch((error) => {
        console.log('Cache addAll failed:', error);
        // Continue even if some files fail to cache
        return Promise.resolve();
      })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        // Clone the request because it's a stream
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response because it's a stream
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // If fetch fails, try to serve a fallback page
          if (event.request.destination === 'document') {
            // Try multiple fallback options for GitHub Pages
            return caches.match('./index.html')
              .then((response) => {
                if (response) return response;
                return caches.match('./');
              })
              .then((response) => {
                if (response) return response;
                return caches.match('/index.html');
              })
              .then((response) => {
                if (response) return response;
                return caches.match('/');
              });
          }
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all clients immediately
  return self.clients.claim();
});
