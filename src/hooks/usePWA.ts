import React, { useState, useEffect } from 'react';

interface PWAInstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAStatus {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  showInstallPrompt: () => void;
  dismissPrompt: () => void;
}

export const usePWA = (): PWAStatus => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(null);

  useEffect(() => {
    console.log('usePWA: Inicializando hook PWA');
    
    // Check if already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      const isInstalled = isStandalone || isIOSStandalone;
      setIsInstalled(isInstalled);
      
      console.log('usePWA: Verificação de instalação:', {
        isStandalone,
        isIOSStandalone,
        isInstalled,
        userAgent: navigator.userAgent
      });
    };

    // Check PWA criteria
    const checkPWACriteria = () => {
      const hasManifest = !!document.querySelector('link[rel="manifest"]');
      const hasServiceWorker = 'serviceWorker' in navigator;
      const isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost';
      const hasValidIcons = true; // Agora temos ícones adequados
      
      console.log('usePWA: Critérios PWA:', {
        hasManifest,
        hasServiceWorker,
        isHTTPS,
        hasValidIcons,
        allCriteriaMet: hasManifest && hasServiceWorker && isHTTPS && hasValidIcons
      });
      
      return hasManifest && hasServiceWorker && isHTTPS && hasValidIcons;
    };

    checkInstalled();
    
    // Verificar critérios PWA sem forçar o evento
    setTimeout(() => {
      if (!isInstalled) {
        const criteriasMet = checkPWACriteria();
        if (criteriasMet && !deferredPrompt) {
          console.log('usePWA: Todos os critérios PWA atendidos. Aguardando evento beforeinstallprompt do navegador.');
        }
      }
    }, 1000);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('usePWA: Evento beforeinstallprompt recebido', e);
      e.preventDefault();
      setDeferredPrompt(e as PWAInstallPrompt);
      setIsInstallable(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      console.log('usePWA: App instalado com sucesso!');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Listen for online/offline status
    const handleOnline = () => {
      console.log('usePWA: Online');
      setIsOnline(true);
    };
    
    const handleOffline = () => {
      console.log('usePWA: Offline');
      setIsOnline(false);
    };

    // Listen for display mode changes
    const handleDisplayModeChange = () => {
      console.log('usePWA: Modo de exibição alterado');
      checkInstalled();
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Listen for display mode changes (for when user installs/uninstalls)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    // Service Worker update detection
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('usePWA: Service Worker controller alterado');
        if (!window.location.hash.includes('skipReload')) {
          window.location.reload();
        }
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, [isInstalled]);

  const showInstallPrompt = async () => {
    if (!deferredPrompt) {
      console.log('Prompt de instalação não disponível');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('Usuário aceitou instalar o PWA');
      } else {
        console.log('Usuário rejeitou instalar o PWA');
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Erro ao mostrar prompt de instalação:', error);
    }
  };

  const dismissPrompt = () => {
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return {
    isInstallable,
    isInstalled,
    isOnline,
    showInstallPrompt,
    dismissPrompt
  };
};