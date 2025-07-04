// Service Worker for Push Notifications
self.addEventListener('push', event => {
  console.log('Push notification received:', event);
  
  if (!event.data) {
    console.log('No data in push event');
    return;
  }

  try {
    const data = event.data.json();
    console.log('Push data:', data);

    const options = {
      body: data.body || data.content,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: {
        orderId: data.orderId,
        messageId: data.messageId,
        url: data.url || '/'
      },
      actions: [
        {
          action: 'open-chat',
          title: 'فتح الدردشة',
          icon: '/favicon.ico'
        },
        {
          action: 'close',
          title: 'إغلاق'
        }
      ],
      requireInteraction: true,
      silent: false,
      vibrate: [200, 100, 200]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'رسالة جديدة', options)
    );
  } catch (error) {
    console.error('Error processing push notification:', error);
  }
});

self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'open-chat') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

self.addEventListener('install', event => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker activating');
  event.waitUntil(clients.claim());
});