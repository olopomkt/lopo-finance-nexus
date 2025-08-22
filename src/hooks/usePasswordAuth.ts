
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SESSION_KEY = 'lopofinance_session';

export function usePasswordAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        const { timestamp } = JSON.parse(session);
        const isSessionValid = (new Date().getTime() - timestamp) < (24 * 60 * 60 * 1000); // 24 horas
        setIsAuthenticated(isSessionValid);
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.error('Error checking session:', e);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Attempting to verify password...');
      
      const { data, error: funcError } = await supabase.functions.invoke('verify-password', {
        body: { password },
      });

      console.log('Function response:', { data, funcError });

      if (funcError) {
        console.error('Function error:', funcError);
        throw new Error(funcError.message || 'Erro na comunicação com o servidor');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.authenticated) {
        const session = { timestamp: new Date().getTime() };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        setIsAuthenticated(true);
        console.log('Login successful');
        return true;
      } else {
        throw new Error('Senha incorreta');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Falha na autenticação');
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    console.log('User logged out');
  }, []);

  return { isAuthenticated, isLoading, error, login, logout };
}
