// LopoFinance PWA Service Worker
const CACHE_NAME = 'lopofinance-v1.0.0';
const OFFLINE_PAGE = '/offline.html';

// Recursos críticos para cache
const STATIC_CACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/pwa-icons/icon-192x192.png',
  '/pwa-icons/icon-512x512.png'
];

// URLs dinâmicas do Supabase que precisam ser sempre atualizadas
const DYNAMIC_URLS = [
  'https://kdumengvbndveepkponj.supabase.co',
  '/api'
];

// Instalar Service Worker
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

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// Estratégia de cache para diferentes tipos de recursos
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }

  // Estratégia para Supabase - sempre network first
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Estratégia para recursos estáticos - cache first
  if (isStaticResource(request)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Estratégia para navegação - network first com fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // Estratégia padrão - network first
  event.respondWith(networkFirstStrategy(request));
});

// Network First Strategy (para Supabase e dados dinâmicos)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache apenas respostas bem-sucedidas
    if (networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se não há cache e é uma API request, retornar erro estruturado
    if (request.url.includes('/api/') || request.url.includes('supabase.co')) {
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

// Cache First Strategy (para recursos estáticos)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Atualizar cache em background
    fetch(request).then(response => {
      if (response.status === 200) {
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, response);
        });
      }
    }).catch(() => {
      // Ignorar erros de rede em background update
    });
    
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Failed to fetch resource:', request.url);
    throw error;
  }
}

// Network First with Offline Fallback (para navegação)
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('[SW] Navigation failed, serving offline page');
    const cache = await caches.open(CACHE_NAME);
    const offlinePage = await cache.match(OFFLINE_PAGE);
    return offlinePage || new Response('Offline', { status: 503 });
  }
}

// Verificar se é recurso estático
function isStaticResource(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
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
    pathname.includes('/assets/')
  );
}

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'financial-data-sync') {
    event.waitUntil(syncFinancialData());
  }
});

// Função de sincronização de dados financeiros
async function syncFinancialData() {
  try {
    console.log('[SW] Syncing financial data...');
    // Aqui você pode implementar lógica específica de sincronização
    // Por exemplo, enviar dados que foram salvos offline
    
    // Exemplo de notificação de sincronização bem-sucedida
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

// Ação de notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Mensagens do cliente
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});