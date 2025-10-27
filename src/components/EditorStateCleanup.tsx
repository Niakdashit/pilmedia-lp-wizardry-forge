import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useEditorStore } from '../stores/editorStore';

/**
 * Composant pour nettoyer les états lors du changement d'éditeur
 * Évite les conflits entre les différents éditeurs
 */
const EditorStateCleanup: React.FC = () => {
  const location = useLocation();
  const resetEditorState = useEditorStore((state) => state.resetEditorState);
  
  useEffect(() => {
    // Déterminer le type d'éditeur basé sur la route
    const getEditorType = () => {
      if (location.pathname === '/form-editor') return 'form-editor';
      if (location.pathname === '/jackpot-editor') return 'jackpot-editor';
      if (location.pathname === '/quiz-editor') return 'quiz-editor';
      if (location.pathname === '/scratch-card-editor') return 'scratch-card-editor';
      return 'default';
    };
    
    const currentEditorType = getEditorType();
    
    // Nettoyer les états des autres éditeurs pour éviter les conflits
    const allEditorTypes = ['form-editor', 'jackpot-editor', 'quiz-editor', 'scratch-card-editor', 'default'];
    const otherEditorTypes = allEditorTypes.filter(type => type !== currentEditorType);
    
    // Reset les états des autres éditeurs
    otherEditorTypes.forEach(editorType => {
      resetEditorState(editorType);
    });
    
    console.log(`🧹 [EditorStateCleanup] Nettoyage des états pour l'éditeur: ${currentEditorType}`);

    // Forcer le reset de l'éditeur courant à la fermeture/actualisation
    const handleBeforeUnload = () => {
      try {
        resetEditorState(currentEditorType);
      } catch {}
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // À la sortie de la page (changement de route / unmount), on reset aussi l'éditeur courant
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      try {
        resetEditorState(currentEditorType);
      } catch {}
    };
  }, [location.pathname, resetEditorState]);
  
  return null; // Ce composant ne rend rien
};

export default EditorStateCleanup;
