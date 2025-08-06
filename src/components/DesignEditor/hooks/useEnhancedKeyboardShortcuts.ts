import { useEffect, useCallback } from 'react';
import { useEditorStore } from '../../../stores/editorStore';

interface EnhancedKeyboardShortcutsProps {
  canvasRef: React.RefObject<HTMLDivElement>;
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
  onToggleFullscreen
}: EnhancedKeyboardShortcutsProps) => {
  const {
    selectedElementId,
    handleDeselectAll,
    setShowGridLines,
    showGridLines,
    setCampaign
  } = useEditorStore();

  // Détection de plateforme améliorée
  const isMac = useCallback(() => {
    return typeof navigator !== 'undefined' && 
           (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || 
            navigator.userAgent.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  // Gestionnaire de raccourcis clavier amélioré
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { ctrlKey, metaKey, shiftKey, key, target, altKey } = event;
    
    // Détection intelligente du modificateur selon la plateforme
    const isModifierPressed = isMac() ? metaKey : ctrlKey;
    
    // Debug amélioré
    console.log('🎹 Enhanced keyboard event:', {
      key: key,
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
      console.log('🎹 Ignoring - typing in input field');
      return;
    }

    // Raccourcis principaux
    switch (key.toLowerCase()) {
      // Sauvegarde rapide
      case 's':
        if (isModifierPressed) {
          console.log('🎹 Save shortcut triggered!');
          event.preventDefault();
          onSave?.();
        }
        break;

      // Prévisualisation
      case 'p':
        if (isModifierPressed) {
          console.log('🎹 Preview shortcut triggered!');
          event.preventDefault();
          onPreview?.();
        }
        break;

      // Annuler/Rétablir
      case 'z':
        if (isModifierPressed) {
          console.log('🎹 Undo/Redo shortcut triggered!', { shiftKey });
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
          console.log('🎹 Redo shortcut triggered!');
          event.preventDefault();
          onRedo?.();
        }
        break;

      // Ajouter du texte rapidement
      case 't':
        if (isModifierPressed) {
          console.log('🎹 Add text shortcut triggered!');
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
          console.log('🎹 Duplicate shortcut triggered!');
          event.preventDefault();
          onDuplicate?.();
        }
        break;

      // Désélectionner tout
      case 'escape':
        console.log('🎹 Escape shortcut triggered!');
        event.preventDefault();
        handleDeselectAll();
        break;

      // Supprimer l'élément sélectionné
      case 'delete':
      case 'backspace':
        if (selectedElementId) {
          console.log('🎹 Delete shortcut triggered!');
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
          console.log('🎹 Toggle grid shortcut triggered!');
          event.preventDefault();
          setShowGridLines(!showGridLines);
        }
        break;

      // Zoom
      case '=':
      case '+':
        if (isModifierPressed) {
          console.log('🎹 Zoom in shortcut triggered!');
          event.preventDefault();
          onZoomIn?.();
        }
        break;

      case '-':
        if (isModifierPressed) {
          console.log('🎹 Zoom out shortcut triggered!');
          event.preventDefault();
          onZoomOut?.();
        }
        break;

      case '0':
        if (isModifierPressed) {
          console.log('🎹 Zoom reset shortcut triggered!');
          event.preventDefault();
          onZoomReset?.();
        }
        break;

      case '1':
        if (isModifierPressed) {
          console.log('🎹 Zoom fit shortcut triggered!');
          event.preventDefault();
          onZoomFit?.();
        }
        break;

      // Mode plein écran
      case 'f11':
        console.log('🎹 Fullscreen shortcut triggered!');
        event.preventDefault();
        onToggleFullscreen?.();
        break;

      // Aide
      case 'f1':
        console.log('🎹 Help shortcut triggered!');
        event.preventDefault();
        // Déclencher l'aide des raccourcis clavier
        break;

      case '/':
        if (isModifierPressed && shiftKey) {
          console.log('🎹 Help shortcut triggered! (Ctrl+?)');
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
    isMac
  ]);

  // Gestionnaire de double-clic pour ajouter du texte (inspiré du code HTML)
  const handleDoubleClick = useCallback((event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !onAddText) return;

    // Vérifier que le double-clic est sur le canvas lui-même, pas sur un élément
    if (event.target === canvas) {
      console.log('🎹 Double-click add text triggered!');
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
      console.log('🎹 Canvas focused for keyboard shortcuts');
    }
  }, [canvasRef]);

  // Configuration des écouteurs d'événements
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    console.log('🎹 Setting up enhanced keyboard shortcuts');

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
      console.log('🎹 Canvas auto-focused for shortcuts');
    };
    
    focusCanvas();
    const timer = setTimeout(focusCanvas, 100);

    return () => {
      console.log('🎹 Cleaning up enhanced keyboard shortcuts');
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
      [`${modifierKey}+?`]: 'Aide'
    },
    isMac: isMac(),
    modifierKey
  };
};
