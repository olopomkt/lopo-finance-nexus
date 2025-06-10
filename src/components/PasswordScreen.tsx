
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
    <div className="min-h-screen bg-gradient-to-b from-neutral-300 to-neutral-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-neutral-950 border-opacity-75 p-8 w-full max-w-sm">
        <h1 className="text-center font-bold text-lg mb-6 text-neutral-900">
          Sua Senha
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              className="w-full"
              required
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="keepLogged"
              checked={keepLogged}
              onCheckedChange={(checked) => setKeepLogged(!!checked)}
            />
            <label
              htmlFor="keepLogged"
              className="text-sm text-neutral-700 cursor-pointer"
            >
              Manter Logado
            </label>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold"
          >
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
};
