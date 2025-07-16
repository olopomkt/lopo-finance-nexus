// PWA Utility Functions

export interface PWAInstallPrompt extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Detectar se o app está rodando como PWA
export const isPWA = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone ||
    document.referrer.includes('android-app://')
  );
};

// Detectar iOS
export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// Detectar Android
export const isAndroid = (): boolean => {
  return /Android/.test(navigator.userAgent);
};

// Verificar se PWA pode ser instalado
export const canInstallPWA = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

// Registrar Service Worker
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker não suportado');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registrado com sucesso:', registration);
    
    // Verificar atualizações
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Nova versão disponível
            console.log('Nova versão do Service Worker disponível');
            notifyUpdate();
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('Erro ao registrar Service Worker:', error);
    return null;
  }
};

// Notificar usuário sobre atualização
const notifyUpdate = () => {
  if (window.confirm('Nova versão disponível! Deseja atualizar?')) {
    window.location.reload();
  }
};

// Gerenciar cache manualmente
export const updateCache = async (cacheName: string, urls: string[]) => {
  if (!('caches' in window)) return;

  try {
    const cache = await caches.open(cacheName);
    await cache.addAll(urls);
    console.log('Cache atualizado com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar cache:', error);
  }
};

// Limpar cache antigo
export const clearOldCaches = async (currentCacheName: string) => {
  if (!('caches' in window)) return;

  try {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => name !== currentCacheName);
    
    await Promise.all(
      oldCaches.map(name => caches.delete(name))
    );
    
    console.log('Caches antigos removidos:', oldCaches);
  } catch (error) {
    console.error('Erro ao limpar caches:', error);
  }
};

// Verificar status de conexão
export const getConnectionStatus = () => {
  return {
    online: navigator.onLine,
    connection: (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection,
    effectiveType: ((navigator as any).connection || {}).effectiveType || 'unknown'
  };
};

// Adicionar listener para mudanças de conectividade
export const addConnectionListeners = (
  onOnline: () => void,
  onOffline: () => void
) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};

// Configurar notificações push (se necessário)
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Notificações não suportadas');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// Mostrar notificação local
export const showNotification = (title: string, options: NotificationOptions = {}) => {
  if (Notification.permission !== 'granted') return;

  const notification = new Notification(title, {
    icon: '/pwa-icons/icon-192x192.png',
    badge: '/pwa-icons/icon-72x72.png',
    ...options
  });

  // Auto-close após 5 segundos
  setTimeout(() => notification.close(), 5000);

  return notification;
};

// Analytics para PWA
export const trackPWAEvent = (event: string, data?: any) => {
  console.log('PWA Event:', event, data);
  
  // Aqui você pode integrar com Google Analytics, Mixpanel, etc.
  if ((window as any).gtag) {
    (window as any).gtag('event', event, {
      event_category: 'PWA',
      ...data
    });
  }
};

// Detectar modo de instalação
export const getInstallationMode = () => {
  if (isPWA()) return 'standalone';
  if (isIOS()) return 'ios-browser';
  if (isAndroid()) return 'android-browser';
  return 'desktop-browser';
};

// Shortcut para URLs com parâmetros
export const handleShortcutUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');
  
  if (action) {
    trackPWAEvent('shortcut_used', { action });
    
    switch (action) {
      case 'new-revenue':
        // Trigger para abrir modal de nova receita
        document.dispatchEvent(new CustomEvent('pwa-shortcut-revenue'));
        break;
      case 'new-expense':
        // Trigger para abrir modal de nova despesa
        document.dispatchEvent(new CustomEvent('pwa-shortcut-expense'));
        break;
    }
  }
};