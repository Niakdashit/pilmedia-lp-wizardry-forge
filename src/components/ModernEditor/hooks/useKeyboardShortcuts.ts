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
  elements?: any[];
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
  elements
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
        handleDeselectAll();
        break;

      // Delete selected element
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

      // Toggle grid with G
      case 'g':
        if (!isModifierPressed) {
          event.preventDefault();
          setShowGridLines(!showGridLines);
        }
        break;

      // Copy with Ctrl+C
      case 'c':
        if (isModifierPressed && selectedElementId) {
          event.preventDefault();
          // Store in localStorage for now
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

      // Paste with Ctrl+V
      case 'v':
        if (isModifierPressed) {
          event.preventDefault();
          try {
            const clipboardData = localStorage.getItem('clipboard-element');
            if (clipboardData) {
              const { type, data } = JSON.parse(clipboardData);
              const newId = `element-${Date.now()}`;
              
              setCampaign((prev: any) => {
                const updatedData = {
                  ...data,
                  desktop: {
                    ...data.desktop,
                    x: (data.desktop?.x || 0) + 20,
                    y: (data.desktop?.y || 0) + 20
                  }
                };

                if (type === 'text') {
                  return {
                    ...prev,
                    design: {
                      ...prev.design,
                      customTexts: {
                        ...prev.design?.customTexts,
                        [newId]: updatedData
                      }
                    }
                  };
                } else {
                  return {
                    ...prev,
                    design: {
                      ...prev.design,
                      customImages: {
                        ...prev.design?.customImages,
                        [newId]: updatedData
                      }
                    }
                  };
                }
              });
            }
          } catch (error) {
            console.error('Error pasting element:', error);
          }
        }
        break;

      // Select all with Ctrl+A
      case 'a':
        if (isModifierPressed) {
          event.preventDefault();
          // Could implement multi-selection here
        }
        break;

      // Duplicate with Ctrl+D
      case 'd':
        if (isModifierPressed && selectedElementId) {
          event.preventDefault();
          onDuplicate?.();
        }
        break;

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
    onToggleFullscreen
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