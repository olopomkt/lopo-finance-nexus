
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { usePasswordAuth } from '@/hooks/usePasswordAuth';

export const PasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [keepLogged, setKeepLogged] = useState(false);
  const [error, setError] = useState('');
  const { login } = usePasswordAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (login(password, keepLogged)) {
      setError('');
    } else {
      setError('Senha incorreta');
      setPassword('');
    }
  };

  return (
    <div 
      className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url('/lovable-uploads/7c6b2c3e-61f4-4ddd-b3f5-5a36bdd6224f.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay para aplicar opacidade à imagem de fundo */}
      <div className="absolute inset-0 bg-neutral-950 bg-opacity-50"></div>
      
      <div className="relative z-10 bg-white bg-opacity-10 backdrop-blur-md rounded-lg border border-white border-opacity-20 p-6 w-full max-w-xs hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-300">
        <h1 className="text-left font-bold text-base mb-4 text-white">
          Sua Senha
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              className="w-full h-8 text-sm bg-white bg-opacity-20 border-white border-opacity-30 text-white placeholder:text-white placeholder:text-opacity-70 focus:bg-opacity-30"
              required
              maxLength={6}
            />
          </div>
          
          {error && (
            <p className="text-red-400 text-xs text-left">{error}</p>
          )}
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="keepLogged"
              checked={keepLogged}
              onCheckedChange={(checked) => setKeepLogged(!!checked)}
              className="border-white border-opacity-50 data-[state=checked]:bg-white data-[state=checked]:text-neutral-950"
            />
            <label
              htmlFor="keepLogged"
              className="text-xs text-white text-opacity-80 cursor-pointer"
            >
              Manter Logado
            </label>
          </div>
          
          <Button
            type="submit"
            className="w-full h-8 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm"
          >
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
};
