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
      const p = location.pathname;
      if (p === '/form-editor') return 'form-editor';
      if (p === '/jackpot-editor' || p === '/jackpotEditor') return 'jackpot-editor';
      if (p === '/quiz-editor') return 'quiz-editor';
      if (p === '/scratch-editor' || p === '/scratch-card-editor') return 'scratch-editor';
      return 'default';
    };

    const currentEditorType = getEditorType();

    // Helper: suppression ciblée des clés localStorage liées aux fonds/zoom
    const wipeLocalStorageForEditor = (editorType: string) => {
      try {
        const prefixes: string[] = [];
        // Fonds Design communs aux éditeurs modernes (Jackpot/Scratch/Quiz/Form)
        prefixes.push('design-bg-');
        prefixes.push('editor-zoom-');
        // Spécifiques Form/Quiz si nécessaire
        if (editorType === 'form-editor') prefixes.push('form-bg-');
        if (editorType === 'quiz-editor') prefixes.push('quiz-bg-', 'quiz-bg-owner', 'quiz-modules-', 'quiz-layer-');
        // Spécifiques Scratch/Jackpot (fonds de cartes et modern background)
        if (editorType === 'scratch-editor' || editorType === 'jackpot-editor') {
          prefixes.push('sc-bg-');
          prefixes.push('modern-bg-');
        }

        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (!key) continue;
          if (prefixes.some((pfx) => key.startsWith(pfx))) {
            try { localStorage.removeItem(key); } catch {}
          }
        }
      } catch {}
    };

    // Nettoyer les états des autres éditeurs pour éviter les conflits
    const allEditorTypes = ['form-editor', 'jackpot-editor', 'quiz-editor', 'scratch-editor', 'default'];
    const otherEditorTypes = allEditorTypes.filter(type => type !== currentEditorType);

    // Reset les états des autres éditeurs
    otherEditorTypes.forEach(editorType => {
      resetEditorState(editorType);
    });

    console.log(`🧹 [EditorStateCleanup] Nettoyage des états pour l'éditeur: ${currentEditorType}`);

    // Forcer le reset de l'éditeur courant à la fermeture/actualisation + purge des backgrounds/zoom
    const handleBeforeUnload = () => {
      try {
        wipeLocalStorageForEditor(currentEditorType);
        resetEditorState(currentEditorType);
      } catch {}
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // À la sortie de la page (changement de route / unmount), on reset aussi l'éditeur courant
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      try {
        wipeLocalStorageForEditor(currentEditorType);
        resetEditorState(currentEditorType);
      } catch {}
    };
  }, [location.pathname, resetEditorState]);
  
  return null; // Ce composant ne rend rien
};

export default EditorStateCleanup;
