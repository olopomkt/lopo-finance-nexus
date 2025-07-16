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
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detectar se já está em modo standalone
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone ||
                      document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    // Event listener para o prompt de instalação
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Mostrar card de instalação após 5 segundos
      setTimeout(() => {
        if (!standalone) {
          setShowInstallCard(true);
        }
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detectar quando o app foi instalado
    window.addEventListener('appinstalled', () => {
      console.log('PWA foi instalado com sucesso');
      setShowInstallCard(false);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('Usuário aceitou instalar o PWA');
      } else {
        console.log('Usuário rejeitou instalar o PWA');
      }
      
      setInstallPrompt(null);
      setShowInstallCard(false);
    } catch (error) {
      console.error('Erro ao tentar instalar PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallCard(false);
    // Não mostrar novamente por 1 hora
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Não mostrar se já está instalado ou em standalone
  if (isStandalone) return null;

  // Verificar se foi dismissado recentemente
  const dismissed = localStorage.getItem('pwa-install-dismissed');
  if (dismissed) {
    const dismissedTime = parseInt(dismissed);
    const oneHour = 60 * 60 * 1000;
    if (Date.now() - dismissedTime < oneHour) {
      return null;
    }
  }

  if (!showInstallCard && !isIOS) return null;
  if (isIOS && !showInstallCard) return null;

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