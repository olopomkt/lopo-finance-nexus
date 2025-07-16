import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { usePasswordAuth } from "@/hooks/usePasswordAuth";
import { PasswordScreen } from "@/components/PasswordScreen";
import { PWAStatus } from "@/components/PWAStatus";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";


const AppContent = () => {
  // 1. Obtenha a função 'login' AQUI e somente aqui.
  const { isAuthenticated, isLoading, login } = usePasswordAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-950 to-neutral-800 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // 2. Passe a função 'login' como uma prop chamada 'onLogin'
    return <PasswordScreen onLogin={login} />;
  }

  return (
    <BrowserRouter>
      <PWAStatus />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;