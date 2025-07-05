// Service Worker for Push Notifications
const CACHE_NAME = 'app-cache-v1';

// تثبيت Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

// تفعيل Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker activating');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// استقبال Push Notifications
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
      vibrate: [200, 100, 200],
      // إضافة خصائص مهمة للإشعارات الخارجية
      renotify: true,
      timestamp: Date.now(),
      tag: `message-${data.messageId || Date.now()}` // لمنع تكرار الإشعارات
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'رسالة جديدة', options)
    );
  } catch (error) {
    console.error('Error processing push notification:', error);
    // عرض إشعار احتياطي
    event.waitUntil(
      self.registration.showNotification('رسالة جديدة', {
        body: 'لديك رسالة جديدة',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: true,
        vibrate: [200, 100, 200]
      })
    );
  }
});

// التعامل مع الرسائل من التطبيق الرئيسي
self.addEventListener('message', event => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { data } = event.data;
    
    const options = {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: {
        orderId: data.orderId,
        messageId: data.messageId,
        url: data.url || '/'
      },
      requireInteraction: true,
      silent: false,
      vibrate: [200, 100, 200],
      renotify: true,
      timestamp: Date.now(),
      tag: `message-${data.messageId}`
    };

    self.registration.showNotification(data.title, options);
  }
});

// التعامل مع النقر على الإشعارات
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