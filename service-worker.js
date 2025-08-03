const CACHE_NAME = 'pomodoro-timer-cache-v1';
const urlToCache = ['/pomodoro-timer/', '/pomodoro-timer/index.html', '/pomodoro-timer/manifest.json', '/pomodoro-timer/logo.png'];

self.addEventListener('install', (ev) => {
    console.log('[Service Worker] installed');
    ev.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlToCache);
        })
    );
});

self.addEventListener('activate', (ev) => {
    ev.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('notificationclick', (ev) => {
    const notification = ev.notification;
    const action = ev.action;

    if (action === 'close') {
        notification.close();
    }
});

self.addEventListener('message', function (event) {
    const message = event.data;

    if (message.type === 'NOTIFICATION_UPDATE') {
        console.log('Show notif');

        self.registration.showNotification(message.data.title, {
            body: message.data.body,
            icon: '/pomodoro-timer/logo.png',
            vibrate: [200, 100, 200],
            tag: 'pomodoro-notification' + Date.now(),
            actions: [
                {
                    action: 'close',
                    title: 'Close',
                },
            ],
        });
    }
});
