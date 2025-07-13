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
      <Alert className="fixed top-4 left-4 right-4 max-w-md mx-auto z-50 border-green-500 bg-green-600 text-white shadow-lg">
        <Smartphone className="h-4 w-4 text-white" />
        <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-sm font-medium text-white">📱 Instale o Lopo Finance!</span>
            <Button
              onClick={() => {
                showInstallPrompt();
                setShowInstallBanner(false);
              }}
              size="sm"
              className="bg-white text-green-600 hover:bg-gray-100 border-0"
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
            className="text-white hover:bg-green-700 p-1"
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