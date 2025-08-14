
import { motion } from 'framer-motion';
import { StarsBackground } from '@/components/ui/stars';
import { ShinyText } from "@/components/ui/shiny-text";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export const Header = () => {
  const { user, signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="relative w-full h-[650px] bg-black overflow-hidden">
      {/* Logout button */}
      {user && (
        <div className="absolute top-4 right-4 z-30">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSignOut}
            className="flex items-center gap-2 bg-black/20 border-white/20 text-white hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      )}
      
      {/* User info */}
      {user && (
        <div className="absolute top-4 left-4 z-30">
          <div className="text-white/70 text-sm">
            {user.email}
          </div>
        </div>
      )}
      
      {/* Fundo de estrelas */}
      <StarsBackground className="absolute inset-0 z-0" />

      {/* Imagem do buraco negro (tamanho fixo e visível, mas controlado) */}
      <img
        src="/lovable-uploads/0f9579c4-e6ad-4aab-800e-e273a39c0b37.png"
        alt="Buraco Negro"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1400px] h-auto max-w-none opacity-90 z-10 pointer-events-none animate-pulseGlow"
      />

      {/* Texto acima do buraco negro */}
      <div className="relative z-20 flex flex-col items-center mt-60">
        <div className="font-florence font-normal text-7xl text-[#444444] text-center">
          FINANCE CONTROL
        </div>
        <div className="mt-4">
          <ShinyText
            text="MARLON LOPO"
            className="font-montserrat italic text-lg tracking-wider text-center"
            speed={4}
          />
        </div>
      </div>
    </div>
  );
};
