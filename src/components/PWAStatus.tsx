import { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Wifi, WifiOff, Smartphone, X } from 'lucide-react';

export const PWAStatus = () => {
  const { isInstallable, isInstalled, isOnline, showInstallPrompt, dismissPrompt } = usePWA();
  const [showOfflineBanner, setShowOfflineBanner] = useState(!isOnline);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showOnlineBanner, setShowOnlineBanner] = useState(false);

  // Update install banner when PWA state changes
  useEffect(() => {
    setShowInstallBanner(isInstallable && !isInstalled);
  }, [isInstallable, isInstalled]);

  // Show online banner when connection is restored
  useEffect(() => {
    if (isOnline && showOfflineBanner) {
      setShowOfflineBanner(false);
      setShowOnlineBanner(true);
      // Auto-hide online banner after 3 seconds
      const timer = setTimeout(() => setShowOnlineBanner(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, showOfflineBanner]);

  // Show offline status
  if (!isOnline && showOfflineBanner) {
    return (
      <Alert className="fixed top-4 left-4 right-4 z-50 border-orange-500 bg-orange-50 dark:bg-orange-950">
        <WifiOff className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Você está offline. Algumas funcionalidades podem estar limitadas.</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowOfflineBanner(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Show install prompt for installable PWA
  if (isInstallable && !isInstalled && showInstallBanner) {
    return (
      <Alert className="fixed top-4 left-4 right-4 z-50 border-green-500 bg-green-50 dark:bg-green-950">
        <Smartphone className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>📱 Instale o Lopo Finance para acesso rápido!</span>
            <Button
              onClick={() => {
                showInstallPrompt();
                setShowInstallBanner(false);
              }}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Instalar
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              dismissPrompt();
              setShowInstallBanner(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Show online status when back online
  if (showOnlineBanner) {
    return (
      <Alert className="fixed top-4 left-4 right-4 z-50 border-green-600 bg-green-600 text-white animate-in slide-in-from-top-2">
        <Wifi className="h-4 w-4 text-white" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-white font-medium">Conectado! Todas as funcionalidades estão disponíveis.</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-green-700 hover:text-white"
            onClick={() => setShowOnlineBanner(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};