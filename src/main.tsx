
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/common/ErrorBoundary';
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

// Add loading state
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

// Initial render with loading state
root.render(
  <StrictMode>
    <div className="flex items-center justify-center w-full h-screen bg-gray-100">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full animate-spin border-t-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-700">Loading application...</p>
      </div>
    </div>
  </StrictMode>
);

// Load the app after a short delay to ensure styles are loaded
setTimeout(() => {
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}, 100);
