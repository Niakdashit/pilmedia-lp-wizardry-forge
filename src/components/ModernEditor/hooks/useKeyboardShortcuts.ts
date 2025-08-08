import { useEffect, useCallback } from 'react';
import { useEditorStore } from '../../../stores/editorStore';

interface UseKeyboardShortcutsProps {
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
  selectedElement?: any;
  onElementDelete?: (id: string) => void;
  onElementCopy?: (element: any) => void;
  onElementCut?: () => void;
  onElementPaste?: () => void;
  onDeselectAll?: () => void;
  // Fonctions pour les groupes niveau Canva
  onGroup?: () => void;
  onUngroup?: () => void;
}

export const useKeyboardShortcuts = ({
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
  selectedElement,
  onElementDelete,
  onElementCopy,
  onElementCut,
  onElementPaste,
  onDeselectAll,
  // Fonctions pour les groupes niveau Canva
  onGroup,
  onUngroup
}: UseKeyboardShortcutsProps = {}) => {
  const {
    selectedElementId,
    handleDeselectAll,
    setShowGridLines,
    showGridLines,
    setCampaign
  } = useEditorStore();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { ctrlKey, metaKey, shiftKey, key, target } = event;
    
    // Debug: Log all keyboard events
    console.log('🎹 Keyboard event detected:', {
      key: key,
      ctrlKey,
      metaKey,
      shiftKey,
      target: (target as Element)?.tagName,
      contentEditable: (target as HTMLElement)?.contentEditable
    });
    
    // Detect macOS and prioritize correct modifier key
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isModifierPressed = isMac ? metaKey : ctrlKey;
    
    // Test spécifique pour la touche 'g'
    if (key.toLowerCase() === 'g') {
      console.log('🔥 TOUCHE G DÉTECTÉE!', { isModifierPressed, ctrlKey, metaKey });
    }
    
    console.log('🎹 Platform detection:', { isMac, isModifierPressed });
    
    // Special handling for Ctrl+A - allow in text inputs for select all text
    const isTextInput = (target as Element)?.tagName === 'INPUT' || 
                       (target as Element)?.tagName === 'TEXTAREA' ||
                       (target as HTMLElement)?.contentEditable === 'true';
    
    // For Ctrl+A, handle both text input selection and canvas element selection
    if (key.toLowerCase() === 'a' && isModifierPressed) {
      if (isTextInput) {
        // Let browser handle text selection in inputs
        console.log('🎹 Ctrl+A in text input - allowing browser default');
        return;
      } else {
        // Select all canvas elements
        console.log('🎹 Ctrl+A for canvas elements');
        event.preventDefault();
        onSelectAll?.();
        return;
      }
    }
    
    // Don't trigger other shortcuts when typing in inputs
    if (isTextInput) {
      console.log('🎹 Ignoring keyboard event - typing in input field');
      return;
    }

    switch (key.toLowerCase()) {
      // Save
      case 's':
        if (isModifierPressed) {
          console.log('🎹 Save shortcut triggered!');
          event.preventDefault();
          onSave?.();
        }
        break;

      // Preview
      case 'p':
        if (isModifierPressed) {
          console.log('🎹 Preview shortcut triggered!');
          event.preventDefault();
          onPreview?.();
        }
        break;

      // Undo and Redo
      case 'z':
        if (isModifierPressed) {
          console.log('🎹 Undo/Redo shortcut triggered!', { shiftKey });
          event.preventDefault();
          if (shiftKey) {
            onRedo?.(); // Ctrl+Shift+Z for redo
          } else {
            onUndo?.(); // Ctrl+Z for undo
          }
        }
        break;

      // Redo
      case 'y':
        if (isModifierPressed) {
          event.preventDefault();
          onRedo?.();
        }
        break;

      // Escape - Deselect all
      case 'escape':
        console.log('🎹 Escape shortcut triggered!');
        event.preventDefault();
        onDeselectAll?.() || handleDeselectAll();
        break;

      // Delete selected element
      case 'delete':
      case 'backspace':
        if (selectedElement?.id) {
          console.log('🎹 Delete shortcut triggered for element:', selectedElement.id);
          event.preventDefault();
          onElementDelete?.(selectedElement.id);
        } else if (selectedElementId) {
          // Fallback to old system
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

      // Toggle grid with G (sans modificateur) OU Groupage (avec modificateur)
      case 'g':
        console.log('🎯 G key detected!', { isModifierPressed, shiftKey, onGroup: !!onGroup, onUngroup: !!onUngroup });
        if (isModifierPressed) {
          // Raccourcis pour les groupes niveau Canva
          event.preventDefault();
          if (shiftKey) {
            // Ctrl+Shift+G : Dissocier le groupe
            console.log('🎯 Ungroup shortcut triggered (Ctrl+Shift+G)');
            onUngroup?.();
          } else {
            // Ctrl+G : Grouper les éléments sélectionnés
            console.log('🎯 Group shortcut triggered (Ctrl+G)');
            onGroup?.();
          }
        } else {
          // G seul : basculer la grille
          console.log('🎯 G key pressed - toggling grid');
          event.preventDefault();
          setShowGridLines(!showGridLines);
        }
        break;

      // Copy with Ctrl+C
      case 'c':
        if (isModifierPressed && selectedElement?.id) {
          console.log('🎹 Copy shortcut triggered for element:', selectedElement.id);
          event.preventDefault();
          onElementCopy?.(selectedElement);
        } else if (isModifierPressed && selectedElementId) {
          // Fallback to old system
          event.preventDefault();
          setCampaign((prev: any) => {
            const element = prev.design?.customTexts?.[selectedElementId] || 
                          prev.design?.customImages?.[selectedElementId];
            if (element) {
              localStorage.setItem('clipboard-element', JSON.stringify({
                type: prev.design?.customTexts?.[selectedElementId] ? 'text' : 'image',
                data: element
              }));
            }
            return prev;
          });
        }
        break;

      // Cut with Ctrl+X
      case 'x':
        if (isModifierPressed && selectedElement?.id) {
          console.log('🎹 Cut shortcut triggered for element:', selectedElement.id);
          event.preventDefault();
          onElementCut?.();
        } else if (isModifierPressed && selectedElementId) {
          // Fallback to old system
          event.preventDefault();
          setCampaign((prev: any) => {
            const customTexts = { ...prev.design?.customTexts };
            const customImages = { ...prev.design?.customImages };
            
            // Copy to clipboard first
            const element = customTexts[selectedElementId] || customImages[selectedElementId];
            if (element) {
              localStorage.setItem('clipboard-element', JSON.stringify({
                type: customTexts[selectedElementId] ? 'text' : 'image',
                data: element
              }));
              
              // Then delete
              if (customTexts[selectedElementId]) {
                delete customTexts[selectedElementId];
              }
              if (customImages[selectedElementId]) {
                delete customImages[selectedElementId];
              }
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
        }
        break;

      // Paste with Ctrl+V
      case 'v':
        if (isModifierPressed) {
          console.log('🎹 Paste shortcut triggered');
          event.preventDefault();
          onElementPaste?.();
        }
        break;
        
      // Duplicate with Ctrl+D
      case 'd':
        if (isModifierPressed && selectedElement?.id) {
          console.log('🎹 Duplicate shortcut triggered for element:', selectedElement.id);
          event.preventDefault();
          onDuplicate?.();
        }
        break;

      // Select all with Ctrl+A
      case 'a':
        if (isModifierPressed) {
          // Vérifier si on est en train d'éditer du texte
          const activeElement = document.activeElement;
          const isEditingText = activeElement && (
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA' || 
            (activeElement as HTMLElement).contentEditable === 'true'
          );
          
          if (isEditingText) {
            // Laisser le comportement par défaut (sélectionner tout le texte)
            console.log('🎹 Ctrl+A: Selecting all text in input');
          } else {
            // Sélectionner tous les éléments du canvas
            console.log('🎹 Ctrl+A: Selecting all canvas elements');
            event.preventDefault();
            onSelectAll?.();
          }
        }
        break;

      // Duplicate case removed - handled by the first case 'd' above

      // Zoom controls
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
        break;

      // Toggle fullscreen with F11
      case 'f11':
        event.preventDefault();
        onToggleFullscreen?.();
        break;

      // Help with F1 or Ctrl+?
      case 'f1':
        event.preventDefault();
        // Could trigger help modal
        break;

      case '/':
        if (isModifierPressed && shiftKey) {
          event.preventDefault();
          // Could trigger help modal
        }
        break;

    }
  }, [
    selectedElementId,
    handleDeselectAll,
    setShowGridLines,
    showGridLines,
    setCampaign,
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
    // Ajouter les fonctions de groupe dans les dépendances
    onGroup,
    onUngroup
  ]);

  useEffect(() => {
    console.log('🎹 Setting up keyboard shortcuts listener');
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      console.log('🎹 Removing keyboard shortcuts listener');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Détecter le système d'exploitation
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierKey = isMac ? 'Cmd' : 'Ctrl';

  return {
    // Return available shortcuts for documentation
    shortcuts: {
      [`${modifierKey}+S`]: 'Sauvegarder la campagne',
      [`${modifierKey}+P`]: 'Prévisualiser la campagne',
      [`${modifierKey}+Z`]: 'Annuler',
      [`${modifierKey}+Y / ${modifierKey}+Shift+Z`]: 'Rétablir',
      'Échap': 'Désélectionner tout',
      'Suppr': 'Supprimer l\'élément sélectionné',
      'G': 'Basculer la grille',
      [`${modifierKey}+C`]: 'Copier l\'élément sélectionné',
      [`${modifierKey}+V`]: 'Coller l\'élément',
      [`${modifierKey}+A`]: 'Sélectionner tout (futur)',
      [`${modifierKey}+D`]: 'Dupliquer l\'élément',
      [`${modifierKey}++`]: 'Zoomer',
      [`${modifierKey}+-`]: 'Dézoomer',
      [`${modifierKey}+0`]: 'Zoom 100%',
      [`${modifierKey}+1`]: 'Ajuster à l\'écran',
      'F11': 'Mode plein écran',
      'F1': 'Aide',
      [`${modifierKey}+?`]: 'Aide'
    },
    isMac,
    modifierKey
  };
};