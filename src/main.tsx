
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ErrorBoundary from './components/common/ErrorBoundary';
import App from './App.tsx';
import './index.css';

// Vite doesn't provide process.env by default in the browser.
// Some modules use process.env.NODE_ENV checks; provide a safe shim.
// This prevents ReferenceError: process is not defined -> blank screen.
declare global {
  interface Window { process?: any; }
}

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Initialize process.env for browser
if (typeof window !== 'undefined') {
  (window as any).process = (window as any).process || { env: {} };
  const env = (window as any).process.env;
  // Map Vite envs into process.env for compatibility
  Object.assign(env, import.meta.env);
  env.NODE_ENV = import.meta.env.MODE || (env.NODE_ENV ?? 'development');
}

// Locate the application mount point
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
