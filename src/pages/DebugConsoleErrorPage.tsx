import { useEffect } from 'react';

export default function DebugConsoleErrorPage() {
  useEffect(() => {
    // Erreur volontaire pour déclencher le bouton "Send console errors"
    console.error(new Error('[MANUAL_DEBUG_ERROR_PAGE] Snapshot demandé depuis /debug-console-error'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
      <div className="max-w-md text-center space-y-3">
        <h1 className="text-lg font-semibold">Page de debug console</h1>
        <p className="text-sm text-gray-300">
          Une erreur volontaire a été envoyée dans la console du navigateur.
        </p>
        <p className="text-sm text-gray-400">
          Retourne dans le panneau Cascade et clique sur <span className="font-mono">Send console errors</span>
          {' '}pour m&apos;envoyer un snapshot complet.
        </p>
      </div>
    </div>
  );
}
