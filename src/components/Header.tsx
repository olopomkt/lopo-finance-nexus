
import { motion } from 'framer-motion';
import { StarsBackground } from '@/components/ui/stars';

export const Header = () => {
  return (
    <div className="relative">
      {/* Espaço de 300px com fundo preto */}
      <div className="bg-black h-[300px] relative flex items-center justify-center">
        <img 
          src="/lovable-uploads/e98ea35f-8b93-4e6b-8564-21b6de4a5dfb.png" 
          alt="Logo" 
          className="max-h-[200px] w-auto z-10 relative"
        />
      </div>

      {/* Background Stars com altura de 650px e conteúdo sobreposto */}
      <div className="relative">
        <StarsBackground className="flex w-full h-[650px] justify-center items-center">
          <div className="flex flex-col w-full h-full justify-center items-center">
            <div className="font-sans font-bold text-7xl text-[#444444] text-center">
              FINANCE CONTROL
            </div>
            <div className="font-montserrat italic text-lg text-[#444444] mt-4 tracking-wider text-center">
              MARLON LOPO
            </div>
          </div>
        </StarsBackground>
        
        {/* Imagem do buraco negro sobreposta */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-10">
          <img 
            src="/lovable-uploads/0f9579c4-e6ad-4aab-800e-e273a39c0b37.png" 
            alt="Buraco Negro" 
            className="w-auto h-auto max-w-full"
          />
        </div>
      </div>
    </div>
  );
};
