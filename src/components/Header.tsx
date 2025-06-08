import { motion } from 'framer-motion';
import { StarsBackground } from '@/components/ui/stars';

export const Header = () => {
  return (
    <div className="relative w-full h-[650px] bg-black overflow-hidden">
      {/* Fundo de estrelas */}
      <StarsBackground className="absolute inset-0 z-0" />

      {/* Imagem do buraco negro (tamanho fixo e visível, mas controlado) */}
      <img
        src="/lovable-uploads/0f9579c4-e6ad-4aab-800e-e273a39c0b37.png"
        alt="Buraco Negro"
        className="mx-auto w-[600px] max-w-none absolute bottom-[-60px] left-1/2 -translate-x-1/2 pointer-events-none select-none opacity-80"
    draggable={false}
      />

      {/* Texto acima do buraco negro */}
      <div className="relative z-20 flex flex-col items-center mt-32">
        <div className="font-florence font-normal text-7xl text-[#444444] text-center">
          FINANCE CONTROL
        </div>
        <div className="font-montserrat italic text-lg text-[#444444] mt-4 tracking-wider text-center">
          MARLON LOPO
        </div>
      </div>
    </div>
  );
};
