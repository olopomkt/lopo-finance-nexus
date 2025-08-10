
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { usePasswordAuth } from "@/hooks/usePasswordAuth";
import { PasswordScreen } from "@/components/PasswordScreen";
import { PWAInstaller } from "@/components/PWAInstaller";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAuthenticated, isLoading, login } = usePasswordAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-950 to-neutral-800 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PasswordScreen onLogin={login} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <PWAInstaller />
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
