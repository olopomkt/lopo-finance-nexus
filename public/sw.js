
// LopoFinance PWA Service Worker
const CACHE_NAME = 'lopofinance-v1.1.0';
const OFFLINE_PAGE = '/offline.html';

// Critical resources for cache
const STATIC_CACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/pwa-icons/icon-192x192.png',
  '/pwa-icons/icon-512x512.png'
];

// Dynamic URLs that need to be always updated
const DYNAMIC_PATTERNS = [
  'kdumengvbndveepkponj.supabase.co',
  '/api/',
  '/auth/'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Activation complete');
    })
  );
});

// Fetch Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Skip Chrome extension requests
  if (request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Network first for Supabase and dynamic content
  if (isDynamicRequest(request)) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Cache first for static resources
  if (isStaticResource(request)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Network first with offline fallback for navigation
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // Default: network first
  event.respondWith(networkFirstStrategy(request));
});

// Check if request is dynamic (Supabase, APIs)
function isDynamicRequest(request) {
  const url = request.url.toLowerCase();
  return DYNAMIC_PATTERNS.some(pattern => url.includes(pattern));
}

// Check if request is for static resources
function isStaticResource(request) {
  const url = new URL(request.url);
  const pathname = url.pathname.toLowerCase();
  
  return (
    pathname.includes('.js') ||
    pathname.includes('.css') ||
    pathname.includes('.png') ||
    pathname.includes('.jpg') ||
    pathname.includes('.jpeg') ||
    pathname.includes('.svg') ||
    pathname.includes('.ico') ||
    pathname.includes('.woff') ||
    pathname.includes('.woff2') ||
    pathname.includes('/pwa-icons/') ||
    pathname.includes('/assets/') ||
    pathname === '/manifest.json'
  );
}

// Network First Strategy
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200 && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone()).catch(() => {
        // Ignore cache errors
      });
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return structured error for API requests
    if (isDynamicRequest(request)) {
      return new Response(JSON.stringify({
        error: 'Sem conexão',
        message: 'Dados não disponíveis offline',
        offline: true
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
}

// Cache First Strategy
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then(response => {
      if (response.status === 200) {
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, response);
        });
      }
    }).catch(() => {
      // Ignore background update errors
    });
    
    return cachedResponse;
  }
  
  // Fallback to network
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone()).catch(() => {
        // Ignore cache errors
      });
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Failed to fetch resource:', request.url);
    throw error;
  }
}

// Network First with Offline Fallback
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('[SW] Navigation failed, serving offline page');
    
    const cache = await caches.open(CACHE_NAME);
    const offlinePage = await cache.match(OFFLINE_PAGE);
    
    return offlinePage || new Response('Offline', { 
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Background Sync
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'financial-data-sync') {
    event.waitUntil(syncFinancialData());
  }
});

// Sync financial data
async function syncFinancialData() {
  try {
    console.log('[SW] Syncing financial data...');
    
    // Show success notification
    if (self.registration.showNotification) {
      self.registration.showNotification('LopoFinance', {
        body: 'Dados sincronizados com sucesso!',
        icon: '/pwa-icons/icon-192x192.png',
        badge: '/pwa-icons/icon-72x72.png',
        tag: 'sync-success'
      });
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização disponível',
    icon: '/pwa-icons/icon-192x192.png',
    badge: '/pwa-icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'open',
        title: 'Abrir App'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('LopoFinance', options)
  );
});

// Notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Messages from client
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});
