// Screened Service Worker for Progressive Web App (PWA) Notifications & Offline Shell
const CACHE_NAME = 'screened-pwa-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Notification click handler — focus or open the investigation tab
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Push notification event listener (for Web Push payloads from Cloud Run)
self.addEventListener('push', (event) => {
  let payload = {
    title: 'Screened: Investigation Ready',
    body: 'Your cinema due-diligence dossier has finished synthesizing.',
    url: '/',
  };

  if (event.data) {
    try {
      payload = Object.assign(payload, event.data.json());
    } catch {
      payload.body = event.data.text() || payload.body;
    }
  }

  const options = {
    body: payload.body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    data: { url: payload.url },
    tag: 'screened-dossier-notification',
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});
