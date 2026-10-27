import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

// Clean up legacy 5gvci ad worker if cached in browser
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      if (registration.active?.scriptURL.includes('5gvci.com') || registration.scope.includes('sw.js')) {
        registration.unregister().catch(() => {});
      }
    }
  });
}
