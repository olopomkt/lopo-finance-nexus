
// PWA Utility Functions

export interface PWAInstallPrompt extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Detect if app is running as PWA
export const isPWA = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone ||
    document.referrer.includes('android-app://')
  );
};

// Detect iOS
export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// Detect Android
export const isAndroid = (): boolean => {
  return /Android/.test(navigator.userAgent);
};

// Check if PWA can be installed
export const canInstallPWA = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

// Get connection status
export const getConnectionStatus = () => {
  return {
    online: navigator.onLine,
    connection: (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection,
    effectiveType: ((navigator as any).connection || {}).effectiveType || 'unknown'
  };
};

// Add connection listeners
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

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
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

// Show local notification
export const showNotification = (title: string, options: NotificationOptions = {}) => {
  if (Notification.permission !== 'granted') return;

  const notification = new Notification(title, {
    icon: '/pwa-icons/icon-192x192.png',
    badge: '/pwa-icons/icon-72x72.png',
    ...options
  });

  // Auto-close after 5 seconds
  setTimeout(() => notification.close(), 5000);

  return notification;
};

// Track PWA events
export const trackPWAEvent = (event: string, data?: any) => {
  console.log('PWA Event:', event, data);
  
  // Integration with analytics can be added here
  if ((window as any).gtag) {
    (window as any).gtag('event', event, {
      event_category: 'PWA',
      ...data
    });
  }
};

// Get installation mode
export const getInstallationMode = () => {
  if (isPWA()) return 'standalone';
  if (isIOS()) return 'ios-browser';
  if (isAndroid()) return 'android-browser';
  return 'desktop-browser';
};
