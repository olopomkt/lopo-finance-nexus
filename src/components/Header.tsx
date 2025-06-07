
import { motion } from 'framer-motion';
import { StarsBackground } from '@/components/ui/stars';

export const Header = () => {
  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative h-[300px] overflow-hidden"
    >
      <StarsBackground className="absolute inset-0">
        <div className="relative h-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="z-10"
          >
            <img 
              src="/placeholder.svg" 
              alt="LOPO FINANCE" 
              className="h-32 w-auto"
            />
          </motion.div>
        </div>
      </StarsBackground>
    </motion.header>
  );
};
