
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export const PWAInstaller: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallCard, setShowInstallCard] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detect if already in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone ||
                      document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    // Don't show if already installed
    if (standalone) return;

    // Check if recently dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const oneHour = 60 * 60 * 1000;
      if (Date.now() - dismissedTime < oneHour) {
        return;
      }
    }

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
      
      // Show install card after 3 seconds
      setTimeout(() => {
        setShowInstallCard(true);
      }, 3000);
    };

    const handleAppInstalled = () => {
      console.log('PWA installed successfully');
      setShowInstallCard(false);
      setInstallPrompt(null);
      localStorage.removeItem('pwa-install-dismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For iOS, show install card after delay
    if (iOS && !standalone) {
      setTimeout(() => {
        setShowInstallCard(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      console.log('Install outcome:', outcome);
      
      setInstallPrompt(null);
      setShowInstallCard(false);
    } catch (error) {
      console.error('Install error:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallCard(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if already installed
  if (isStandalone) return null;

  // Don't show if not ready
  if (!showInstallCard) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 z-50 border-[#8B5CF6] bg-gradient-to-r from-[#8B5CF6] to-[#00D4FF] p-1">
      <div className="bg-background rounded-[calc(var(--radius)-1px)] p-4">
        <CardContent className="p-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#8B5CF6] to-[#00D4FF] rounded-lg flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Instalar LopoFinance</h3>
                <p className="text-xs text-muted-foreground">
                  Acesso rápido na sua tela inicial
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {isIOS ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Para instalar no iOS:
              </p>
              <ol className="text-xs space-y-1 text-muted-foreground">
                <li>1. Toque no ícone <span className="font-mono">⎙</span> (Compartilhar)</li>
                <li>2. Selecione "Adicionar à Tela de Início"</li>
                <li>3. Toque em "Adicionar" para confirmar</li>
              </ol>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleInstallClick}
                disabled={!installPrompt}
                className="flex-1 bg-gradient-to-r from-[#8B5CF6] to-[#00D4FF] hover:opacity-90 text-white border-0"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Instalar App
              </Button>
              <Button
                variant="outline"
                onClick={handleDismiss}
                size="sm"
              >
                Agora não
              </Button>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Monitor className="h-3 w-3" />
                Desktop
              </div>
              <div className="flex items-center gap-1">
                <Smartphone className="h-3 w-3" />
                Mobile
              </div>
              <span>• Funciona offline</span>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
