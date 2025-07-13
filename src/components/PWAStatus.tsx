import { useState } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Wifi, WifiOff, Smartphone, X } from 'lucide-react';

export const PWAStatus = () => {
  const { isInstallable, isInstalled, isOnline, showInstallPrompt, dismissPrompt } = usePWA();
  const [showOfflineBanner, setShowOfflineBanner] = useState(!isOnline);
  const [showInstallBanner, setShowInstallBanner] = useState(isInstallable && !isInstalled);

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
  if (isOnline && !showOfflineBanner) {
    return (
      <Alert className="fixed top-4 left-4 right-4 z-50 border-green-500 bg-green-50 dark:bg-green-950 animate-in slide-in-from-top-2">
        <Wifi className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Conectado! Todas as funcionalidades estão disponíveis.</span>
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

  return null;
};