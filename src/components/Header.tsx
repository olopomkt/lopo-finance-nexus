
import { motion } from 'framer-motion';
import { StarsBackground } from '@/components/ui/stars';

export const Header = () => {
  return (
    <div>
      {/* Espaço de 300px com fundo preto */}
      <div className="bg-black h-[300px] relative flex items-center justify-center">
        <img 
          src="/lovable-uploads/e98ea35f-8b93-4e6b-8564-21b6de4a5dfb.png" 
          alt="Logo" 
          className="max-h-[200px] w-auto z-10 relative"
        />
      </div>

      {/* Header com efeito de estrelas */}
      <StarsBackground className="min-h-[400px]">
        <motion.header 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-effect border-b border-neon-blue/20 p-6"
        >
          <div className="container mx-auto">
            <motion.h1 
              className="text-4xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent"
              animate={{ 
                textShadow: [
                  "0 0 20px rgba(0, 212, 255, 0.5)",
                  "0 0 30px rgba(139, 92, 246, 0.8)",
                  "0 0 20px rgba(0, 212, 255, 0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              LOPO FINANCE
            </motion.h1>
            <p className="text-muted-foreground mt-2">Sistema de Controle Financeiro Empresarial e Pessoal</p>
          </div>
        </motion.header>
      </StarsBackground>
    </div>
  );
};
