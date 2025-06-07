
import { motion } from 'framer-motion';

export const Header = () => {
  return (
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
  );
};
