
import { useState, useEffect } from 'react';

const CORRECT_PASSWORD = '012569';
const AUTH_KEY = 'finance_app_auth';
const LAST_ACCESS_KEY = 'finance_app_last_access';
const KEEP_LOGGED_KEY = 'finance_app_keep_logged';
const SESSION_DURATION = 120 * 60 * 60 * 1000; // 120 horas em millisegundos

export const usePasswordAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    const authStatus = localStorage.getItem(AUTH_KEY);
    const lastAccess = localStorage.getItem(LAST_ACCESS_KEY);
    const keepLogged = localStorage.getItem(KEEP_LOGGED_KEY) === 'true';
    
    if (authStatus === 'true' && lastAccess) {
      const lastAccessTime = parseInt(lastAccess);
      const currentTime = Date.now();
      const timeDifference = currentTime - lastAccessTime;
      
      // Se passou do tempo limite e não está marcado para manter logado
      if (timeDifference > SESSION_DURATION && !keepLogged) {
        logout();
      } else {
        // Atualiza o último acesso
        updateLastAccess();
        setIsAuthenticated(true);
      }
    }
    
    setIsLoading(false);
  };

  const login = (password: string, keepLogged: boolean = false) => {
    if (password === CORRECT_PASSWORD) {
      localStorage.setItem(AUTH_KEY, 'true');
      localStorage.setItem(KEEP_LOGGED_KEY, keepLogged.toString());
      updateLastAccess();
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(LAST_ACCESS_KEY);
    localStorage.removeItem(KEEP_LOGGED_KEY);
    setIsAuthenticated(false);
  };

  const updateLastAccess = () => {
    localStorage.setItem(LAST_ACCESS_KEY, Date.now().toString());
  };

  // Atualiza o último acesso sempre que a página é visualizada
  useEffect(() => {
    if (isAuthenticated) {
      updateLastAccess();
      
      // Listener para atualizar último acesso quando a página ganha foco
      const handleFocus = () => updateLastAccess();
      window.addEventListener('focus', handleFocus);
      
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [isAuthenticated]);

  return {
    isAuthenticated,
    isLoading,
    login,
    logout
  };
};
