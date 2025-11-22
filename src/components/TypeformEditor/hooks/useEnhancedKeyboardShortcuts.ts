import { useEffect, useCallback } from 'react';
import { useEditorStore } from '../../../stores/editorStore';

interface EnhancedKeyboardShortcutsProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onAddText?: (position?: { x: number; y: number }) => void;
  onSave?: () => void;
  onPreview?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onDuplicate?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
  onZoomFit?: () => void;
  onToggleFullscreen?: () => void;
  onSelectAll?: () => void;
}

export const useEnhancedKeyboardShortcuts = ({
  canvasRef,
  onAddText,
  onSave,
  onPreview,
  onUndo,
  onRedo,
  onDuplicate,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onZoomFit,
  onToggleFullscreen,
  onSelectAll
}: EnhancedKeyboardShortcutsProps) => {
  const {
    selectedElementId,
    handleDeselectAll,
    setShowGridLines,
    showGridLines,
    setCampaign
  } = useEditorStore();

  // Removed unused variables lastClickTime and clickCount

  // Détection de plateforme améliorée
  const isMac = useCallback(() => {
    return typeof navigator !== 'undefined' && 
           (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || 
            navigator.userAgent.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  // Gestionnaire de raccourcis clavier amélioré
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { ctrlKey, metaKey, shiftKey, key, target, altKey, code } = event;
    
    // Détection intelligente du modificateur selon la plateforme
    const isModifierPressed = isMac() ? metaKey : ctrlKey;
    
    // Debug amélioré
      key: key,
      code,
      ctrlKey,
      metaKey,
      shiftKey,
      altKey,
      target: (target as Element)?.tagName,
      contentEditable: (target as HTMLElement)?.contentEditable,
      isModifierPressed,
      platform: isMac() ? 'Mac' : 'Windows/Linux'
    });
    
    // Ne pas intercepter si on tape dans un champ de saisie
    if ((target as Element)?.tagName === 'INPUT' || 
        (target as Element)?.tagName === 'TEXTAREA' ||
        (target as HTMLElement)?.contentEditable === 'true') {
      return;
    }

    // Alt+A (Option+A on Mac): select all canvas elements
    if (altKey && (key.toLowerCase() === 'a' || code === 'KeyA')) {
      event.preventDefault();
      onSelectAll?.();
      return;
    }

    // Raccourcis principaux
    switch (key.toLowerCase()) {
      // Sauvegarde rapide
      case 's':
        if (isModifierPressed) {
          event.preventDefault();
          onSave?.();
        }
        break;

      // Prévisualisation
      case 'p':
        if (isModifierPressed) {
          event.preventDefault();
          onPreview?.();
        }
        break;

      // Annuler/Rétablir
      case 'z':
        if (isModifierPressed) {
          event.preventDefault();
          if (shiftKey) {
            onRedo?.();
          } else {
            onUndo?.();
          }
        }
        break;

      case 'y':
        if (isModifierPressed) {
          event.preventDefault();
          onRedo?.();
        }
        break;

      // Ajouter du texte rapidement
      case 't':
        if (isModifierPressed) {
          event.preventDefault();
          // Position au centre du canvas visible
          const canvas = canvasRef.current;
          if (canvas && onAddText) {
            const rect = canvas.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            onAddText({ x: centerX, y: centerY });
          }
        }
        break;

      // Dupliquer l'élément sélectionné
      case 'd':
        if (isModifierPressed && selectedElementId) {
          event.preventDefault();
          onDuplicate?.();
        }
        break;

      // Sélectionner tout (Cmd/Ctrl+A) pour les éléments du canvas
      case 'a':
        if (isModifierPressed) {
          event.preventDefault();
          onSelectAll?.();
        }
        break;

      // Désélectionner tout
      case 'escape':
        event.preventDefault();
        handleDeselectAll();
        break;

      // Supprimer l'élément sélectionné
      case 'delete':
      case 'backspace':
        if (selectedElementId) {
          event.preventDefault();
          setCampaign((prev: any) => {
            const customTexts = { ...prev.design?.customTexts };
            const customImages = { ...prev.design?.customImages };
            
            if (customTexts[selectedElementId]) {
              delete customTexts[selectedElementId];
            }
            if (customImages[selectedElementId]) {
              delete customImages[selectedElementId];
            }
            
            return {
              ...prev,
              design: {
                ...prev.design,
                customTexts,
                customImages
              }
            };
          });
          handleDeselectAll();
        }
        break;

      // Basculer la grille
      case 'g':
        if (!isModifierPressed) {
          event.preventDefault();
          setShowGridLines(!showGridLines);
        }
        break;

      // Zoom
      case '=':
      case '+':
        if (isModifierPressed) {
          event.preventDefault();
          onZoomIn?.();
        }
        break;

      case '-':
        if (isModifierPressed) {
          event.preventDefault();
          onZoomOut?.();
        }
        break;

      case '0':
        if (isModifierPressed) {
          event.preventDefault();
          onZoomReset?.();
        }
        break;

      case '1':
        if (isModifierPressed) {
          event.preventDefault();
          onZoomFit?.();
        }
        break;

      // Mode plein écran
      case 'f11':
        event.preventDefault();
        onToggleFullscreen?.();
        break;

      // Aide
      case 'f1':
        event.preventDefault();
        // Déclencher l'aide des raccourcis clavier
        break;

      case '/':
        if (isModifierPressed && shiftKey) {
          event.preventDefault();
          // Déclencher l'aide des raccourcis clavier
        }
        break;
    }
  }, [
    selectedElementId,
    handleDeselectAll,
    setShowGridLines,
    showGridLines,
    setCampaign,
    canvasRef,
    onAddText,
    onSave,
    onPreview,
    onUndo,
    onRedo,
    onDuplicate,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    onZoomFit,
    onToggleFullscreen,
    onSelectAll,
    isMac
  ]);

  // Gestionnaire de double-clic pour ajouter du texte (inspiré du code HTML)
  const handleDoubleClick = useCallback((event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !onAddText) return;

    // Vérifier que le double-clic est sur le canvas lui-même, pas sur un élément
    if (event.target === canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Ajouter du texte à la position du clic
      onAddText({ x, y });
    }
  }, [canvasRef, onAddText]);

  // Gestionnaire de clic pour maintenir le focus (inspiré du code HTML)
  const handleCanvasClick = useCallback((event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Maintenir le focus sur le canvas pour les raccourcis clavier
    if (event.target === canvas) {
      canvas.focus();
    }
  }, [canvasRef]);

  // Configuration des écouteurs d'événements
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;


    // Écouteurs globaux
    document.addEventListener('keydown', handleKeyDown);
    
    // Écouteurs spécifiques au canvas
    canvas.addEventListener('dblclick', handleDoubleClick);
    canvas.addEventListener('click', handleCanvasClick);

    // S'assurer que le canvas peut recevoir le focus
    if (canvas.tabIndex < 0) {
      canvas.tabIndex = 0;
    }
    canvas.style.outline = 'none';

    // Focus initial
    const focusCanvas = () => {
      canvas.focus();
    };
    
    focusCanvas();
    const timer = setTimeout(focusCanvas, 100);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('dblclick', handleDoubleClick);
      canvas.removeEventListener('click', handleCanvasClick);
      clearTimeout(timer);
    };
  }, [handleKeyDown, handleDoubleClick, handleCanvasClick, canvasRef]);

  // Retourner les raccourcis disponibles pour la documentation
  const modifierKey = isMac() ? 'Cmd' : 'Ctrl';

  return {
    shortcuts: {
      [`${modifierKey}+S`]: 'Sauvegarder la campagne',
      [`${modifierKey}+P`]: 'Prévisualiser la campagne',
      [`${modifierKey}+Z`]: 'Annuler',
      [`${modifierKey}+Y / ${modifierKey}+Shift+Z`]: 'Rétablir',
      [`${modifierKey}+T`]: 'Ajouter du texte au centre',
      [`${modifierKey}+D`]: 'Dupliquer l\'élément sélectionné',
      [`${modifierKey}+A`]: 'Sélectionner tout (éléments du canvas)',
      ['Alt+A']: 'Sélectionner tout (éléments du canvas)',
      'Double-clic': 'Ajouter du texte à la position du clic',
      'Échap': 'Désélectionner tout',
      'Suppr': 'Supprimer l\'élément sélectionné',
      'G': 'Basculer la grille',
      [`${modifierKey}++`]: 'Zoomer',
      [`${modifierKey}+-`]: 'Dézoomer',
      [`${modifierKey}+0`]: 'Zoom 100%',
      [`${modifierKey}+1`]: 'Ajuster à l\'écran',
      'F11': 'Mode plein écran',
      'F1': 'Aide',
      [`${modifierKey}+?`]: 'Aide',
      [`${modifierKey}+G`]: 'Grouper des éléments',
      [`${modifierKey}+Shift+G`]: 'Dégrouper des éléments',
      ['Alt+Shift+L']: 'Verrouiller un élément',
      [`${modifierKey}+Shift+J`]: 'Justifier au niveau des éléments',
      [`${modifierKey}+]`]: 'Faire avancer les éléments d\'un niveau',
      [`${modifierKey}+[`]: 'Faire reculer les éléments d\'un niveau',
      [`Alt+${modifierKey}+]`]: 'Mettre les éléments au premier plan',
      [`Alt+${modifierKey}+[`]: 'Mettre les éléments à l\'arrière-plan',
      [`Shift+${modifierKey}+T`]: 'Ranger les éléments',
      ['Tab']: 'Sélectionner l\'élément suivant',
      ['Shift+Tab']: 'Sélectionner l\'élément précédent',
      ['←']: 'Aller à gauche (petit)',
      ['→']: 'Aller à droite (petit)',
      ['↑']: 'Déplacer vers le haut (petit)',
      ['↓']: 'Déplacer vers le bas (petit)',
      ['Shift+←']: 'Aller à gauche (grand)',
      ['Shift+→']: 'Déplacer vers la droite (grand)',
      ['Shift+↑']: 'Déplacer vers le haut (grand)',
      ['Shift+↓']: 'Déplacer vers le bas (grand)',
      [',']: 'Tourner à gauche (petit)',
      ['.']: 'Tourner à droite (petit)',
      ['Shift+,']: 'Tourner à gauche (grand)',
      ['Shift+.']: 'Tourner à droite (grand)',
      [`${modifierKey}+←`]: 'Redimensionner à gauche (petit)',
      [`${modifierKey}+→`]: 'Redimensionner à droite (petit)',
      [`${modifierKey}+↑`]: 'Redimensionner vers le haut (petit)',
      [`${modifierKey}+↓`]: 'Redimensionner vers le bas (petit)',
      [`Shift+${modifierKey}+←`]: 'Redimensionner à gauche (grand)',
      [`Shift+${modifierKey}+→`]: 'Redimensionner à droite (grand)',
      [`Shift+${modifierKey}+↑`]: 'Redimensionner vers le haut (grand)',
      [`Shift+${modifierKey}+↓`]: 'Redimensionner vers le bas (grand)',
      [`Shift+${modifierKey}+F`]: 'Ouvrir le menu des polices',
      [`${modifierKey}+F`]: 'Chercher et remplacer',
      [`${modifierKey}+B`]: 'Mettre le texte en gras',
      [`${modifierKey}+I`]: 'Mettre le texte en italique',
      [`${modifierKey}+U`]: 'Souligner',
      [`Shift+${modifierKey}+K`]: 'Majuscules',
      [`Shift+${modifierKey}+L`]: 'Aligner à gauche',
      [`Shift+${modifierKey}+C`]: 'Centrer',
      [`Shift+${modifierKey}+R`]: 'Aligner à droite',
      [`Shift+${modifierKey}+,`]: 'Diminuer la taille de police d\'un point',
      [`Shift+${modifierKey}+.`]: 'Augmenter la taille de police d\'un point',
      [`Alt+${modifierKey}+↓`]: 'Diminuer l\'interligne',
      [`Alt+${modifierKey}+↑`]: 'Augmenter l\'interligne',
      [`Alt+${modifierKey}+,`]: 'Diminuer l\'espacement des lettres',
      [`Alt+${modifierKey}+.`]: 'Augmenter l\'espacement des lettres',
      [`${modifierKey}+Shift+H`]: 'Ancrer le texte en haut',
      [`${modifierKey}+Shift+M`]: 'Ancrer le texte au milieu',
      [`${modifierKey}+Shift+B`]: 'Ancrer le texte en bas',
      [`${modifierKey}+Shift+7`]: 'Liste numérotée',
      [`${modifierKey}+Shift+8`]: 'Liste à puces',
      [`Alt+${modifierKey}+C`]: 'Copier le style de texte',
      [`Alt+${modifierKey}+V`]: 'Coller le style de texte'
    },
    isMac: isMac(),
    modifierKey
  };
};
