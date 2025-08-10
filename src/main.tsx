
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register Service Worker for PWA with proper error handling
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('SW registered:', registration);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New SW version available');
              // Optionally show update notification
              if (window.confirm('Nova versão disponível! Deseja atualizar?')) {
                window.location.reload();
              }
            }
          });
        }
      });
    } catch (error) {
      console.error('SW registration failed:', error);
    }
  }
};

// Handle PWA shortcuts
const handleShortcutUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');
  
  if (action) {
    console.log('PWA shortcut used:', action);
    
    // Dispatch custom events for shortcuts
    switch (action) {
      case 'new-revenue':
        document.dispatchEvent(new CustomEvent('pwa-shortcut-revenue'));
        break;
      case 'new-expense':
        document.dispatchEvent(new CustomEvent('pwa-shortcut-expense'));
        break;
    }
  }
};

// Initialize app
const initApp = async () => {
  // Register service worker
  await registerServiceWorker();
  
  // Handle shortcuts
  handleShortcutUrl();
  
  // Render app
  const root = createRoot(document.getElementById("root")!);
  root.render(<App />);
};

initApp();
