import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker, handleShortcutUrl } from './utils/pwaUtils'

// Registrar Service Worker para PWA
registerServiceWorker();

// Lidar com shortcuts do PWA
handleShortcutUrl();

createRoot(document.getElementById("root")!).render(<App />);
