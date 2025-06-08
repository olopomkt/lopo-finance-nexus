
import { motion } from 'framer-motion';
import { StarsBackground } from '@/components/ui/stars';

export const Header = () => {
  return (
      {/* Background Stars com altura de 650px e conteúdo sobreposto */}
      <div className="relative">
        <StarsBackground className="flex w-full h-[650px] justify-center items-center">
          <div className="flex flex-col w-full h-full justify-center items-center" style={{ marginTop: '-50px' }}>
            <div className="font-florence font-normal text-7xl text-[#444444] text-center">
              FINANCE CONTROL
            </div>
            <div className="font-montserrat italic text-lg text-[#444444] mt-4 tracking-wider text-center">
              M A R L O N  L O P O
            </div>
          </div>
        </StarsBackground>
        
        {/* Imagem do buraco negro sobreposta - alinhada com o bottom do star background */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-10">
          <img 
            src="/lovable-uploads/0f9579c4-e6ad-4aab-800e-e273a39c0b37.png" 
            alt="Buraco Negro" 
            className="w-auto h-auto max-w-full scale-[2]"
          />
        </div>
      </div>
    </div>
  );
};
