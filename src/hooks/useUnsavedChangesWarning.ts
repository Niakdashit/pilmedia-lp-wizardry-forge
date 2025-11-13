import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook pour avertir l'utilisateur avant de quitter avec des modifications non sauvegardées
 * 
 * @param hasUnsavedChanges - Indique si des modifications non sauvegardées existent
 * @param message - Message personnalisé (optionnel)
 * @returns Fonction handleClose pour gérer la fermeture avec confirmation
 */
export function useUnsavedChangesWarning(
  hasUnsavedChanges: boolean,
  message: string = 'Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?'
) {
  const navigate = useNavigate();

  // Bloquer la navigation du navigateur (refresh, fermeture onglet, etc.)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, message]);

  /**
   * Fonction pour gérer la fermeture de l'éditeur avec confirmation
   * @param targetPath - Chemin de destination (par défaut: /dashboard)
   */
  const handleClose = useCallback((targetPath: string = '/dashboard') => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(message);
      if (confirmed) {
        navigate(targetPath);
      }
    } else {
      navigate(targetPath);
    }
  }, [hasUnsavedChanges, message, navigate]);

  return { handleClose };
}
