import { motion } from 'framer-motion';
import { StarsBackground } from '@/components/ui/stars';

export const Header = () => {
  return (
    <div className="relative">
      {/* StarsBackground é o cenário */}
      <div className="relative w-full h-[650px] flex justify-center items-center bg-black">
        {/* Fundo de estrelas */}
        <StarsBackground className="absolute inset-0 z-0" />

        {/* Imagem do buraco negro */}
        <img 
          src="/lovable-uploads/0f9579c4-e6ad-4aab-800e-e273a39c0b37.png" 
          alt="Buraco Negro" 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 scale-[2] z-10 pointer-events-none"
        />

        {/* Conteúdo centralizado acima do buraco negro */}
        <div className="relative z-20 flex flex-col items-center" style={{ marginTop: '-50px' }}>
          <div className="font-florence font-normal text-7xl text-[#444444] text-center">
            FINANCE CONTROL
          </div>
          <div className="font-montserrat italic text-lg text-[#444444] mt-4 tracking-wider text-center">
            MARLON LOPO
          </div>
        </div>
      </div>
    </div>
  );
};
