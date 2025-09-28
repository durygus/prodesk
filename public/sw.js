// Herzen Core PWA Service Worker
const CACHE_NAME = 'herzen-core-v1';
const urlsToCache = [
    '/',
    '/css/normalize.min.css',
    '/css/plugins.min.css', 
    '/css/app.min.css',
    '/js/vendor.js',
    '/js/trudesk.min.js',
    '/socket.io/socket.io.js'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
    console.log('PWA Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('PWA caching resources...');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Return cached version or fetch from network
                if (response) {
                    console.log('PWA serving from cache:', event.request.url);
                    return response;
                }
                
                console.log('PWA fetching from network:', event.request.url);
                return fetch(event.request);
            })
            .catch(function() {
                // If both cache and network fail, show offline page
                if (event.request.destination === 'document') {
                    return caches.match('/');
                }
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
    console.log('PWA Service Worker activating...');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('PWA deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Background sync for when connection is restored
self.addEventListener('sync', function(event) {
    if (event.tag === 'background-sync') {
        console.log('PWA background sync triggered');
        // Handle background sync tasks here
    }
});

// Push notifications support
self.addEventListener('push', function(event) {
    if (event.data) {
        const data = event.data.json();
        console.log('PWA push notification received:', data);
        
        const options = {
            body: data.body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: data.primaryKey
            }
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
    console.log('PWA notification clicked:', event.notification.tag);
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});
