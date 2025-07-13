const CACHE_NAME = 'lopo-finance-v1';
const STATIC_CACHE_NAME = 'lopo-finance-static-v1';
const DYNAMIC_CACHE_NAME = 'lopo-finance-dynamic-v1';

// App Shell - arquivos essenciais para funcionamento offline
const APP_SHELL = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  '/manifest.json',
  '/favicon.png'
];

// Recursos estáticos
const STATIC_ASSETS = [
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-144x144.png'
];

// URLs do Supabase para cache especial
const SUPABASE_URLS = [
  'https://kdumengvbndveepkponj.supabase.co'
];

// Install event - cache app shell e recursos estáticos
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache App Shell
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching App Shell');
        return cache.addAll(APP_SHELL);
      }),
      // Cache recursos estáticos
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching Static Assets');
        return cache.addAll(STATIC_ASSETS);
      })
    ]).then(() => {
      console.log('Service Worker: Installation Complete');
      return self.skipWaiting();
    }).catch((error) => {
      console.error('Service Worker: Installation Failed', error);
    })
  );
});

// Activate event - limpa caches antigos
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE_NAME && 
              cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation Complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - estratégias de cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // App Shell - Cache First
  if (APP_SHELL.includes(url.pathname) || url.pathname === '/') {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // Recursos estáticos - Cache First
  if (STATIC_ASSETS.some(asset => url.pathname.includes(asset)) || 
      url.pathname.includes('/icons/') ||
      url.pathname.includes('/images/') ||
      url.pathname.includes('.png') ||
      url.pathname.includes('.jpg') ||
      url.pathname.includes('.jpeg') ||
      url.pathname.includes('.svg') ||
      url.pathname.includes('.ico')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
    return;
  }

  // Supabase API - Network First com fallback
  if (SUPABASE_URLS.some(supabaseUrl => request.url.includes(supabaseUrl))) {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  // Scripts e CSS - Stale While Revalidate
  if (url.pathname.includes('.js') || 
      url.pathname.includes('.css') ||
      url.pathname.includes('.tsx') ||
      url.pathname.includes('.ts')) {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE_NAME));
    return;
  }

  // Outras requisições - Network First
  event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME));
});

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache First Error:', error);
    // Fallback offline page se disponível
    if (request.destination === 'document') {
      const cache = await caches.open(CACHE_NAME);
      return cache.match('/') || new Response('Offline - App não disponível');
    }
    throw error;
  }
}

// Network First Strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Network First com Fallback para Supabase
async function networkFirstWithFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache apenas respostas bem-sucedidas do Supabase
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Supabase request failed, checking cache:', request.url);
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Retorna erro offline para requisições do Supabase
    return new Response(
      JSON.stringify({ 
        error: 'Offline - Dados não disponíveis',
        offline: true 
      }), 
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Fetch em background para atualizar cache
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Ignore network errors in background
  });

  // Retorna cache imediatamente se disponível, senão espera network
  return cachedResponse || fetchPromise;
}

// Background Sync para when online
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background Sync');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implementar sincronização de dados pendentes com Supabase
  console.log('Background sync - sincronizando dados pendentes...');
  
  try {
    // Recuperar dados pendentes do IndexedDB e sincronizar com Supabase
    // Isso será implementado conforme necessário
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Message handler para comunicação com o cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});