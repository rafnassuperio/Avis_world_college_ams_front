import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import '@/styles/globals.css';
import { initSecurityAndErrorHandlers } from '@/lib/errorHandler';
import { initNetworkMonitoring } from '@/lib/network';
import { registerPWA } from '@/lib/pwa';

// Initialize global security protections, error telemetry, network monitoring, and PWA
initSecurityAndErrorHandlers();
initNetworkMonitoring();
registerPWA();

// Enforce theme consistency and purge deprecated local theme keys
try {
  localStorage.removeItem('ams-theme');
  document.documentElement.classList.remove('dark');
} catch {
  // Ignore storage access restrictions
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
