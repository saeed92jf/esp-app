// Service Worker for Euroslot Pars (ESP) Platform
// Handles persistent Windows background desktop notifications and action clicks

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const payload = event.data.json();
    const title = payload.title || 'اعلان جدید - یورواسلات پارس';
    const options = {
      body: payload.body || '',
      icon: payload.icon || '/esp-core-fav-icon.svg',
      badge: payload.badge || '/esp-core-fav-icon.svg',
      tag: payload.tag || `esp-${Date.now()}`,
      silent: true,
      data: payload.data || { url: '/' },
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('[SW] Push error:', err);
  }
});

// When user clicks the Windows desktop toast notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if (targetUrl && targetUrl !== '/') {
            try {
              client.navigate(targetUrl);
            } catch {}
          }
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
