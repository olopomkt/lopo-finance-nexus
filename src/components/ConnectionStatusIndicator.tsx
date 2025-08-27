
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export const ConnectionStatusIndicator = () => {
  const { isOnline } = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-amber-500/90 backdrop-blur-sm border-b border-amber-600/20 transition-all duration-300 ease-in-out">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center gap-2 text-amber-900">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">
            Você está offline. Suas alterações serão sincronizadas automaticamente.
          </span>
        </div>
      </div>
    </div>
  );
};
