import { useEffect, useCallback } from 'react';
import { useEditorStore } from '@/stores/editorStore';

interface UseKeyboardShortcutsProps {
  onSave?: () => void;
  onPreview?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const useKeyboardShortcuts = ({
  onSave,
  onPreview,
  onUndo,
  onRedo
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
    
    // Detect macOS and prioritize correct modifier key
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isModifierPressed = isMac ? metaKey : ctrlKey;
    
    // Don't trigger shortcuts when typing in inputs
    if ((target as Element)?.tagName === 'INPUT' || 
        (target as Element)?.tagName === 'TEXTAREA' ||
        (target as HTMLElement)?.contentEditable === 'true') {
      return;
    }

    switch (key.toLowerCase()) {
      // Save
      case 's':
        if (isModifierPressed) {
          event.preventDefault();
          onSave?.();
        }
        break;

      // Preview
      case 'p':
        if (isModifierPressed) {
          event.preventDefault();
          onPreview?.();
        }
        break;

      // Undo and Redo
      case 'z':
        if (isModifierPressed) {
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
    onRedo
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Détecter le système d'exploitation
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierKey = isMac ? 'Cmd' : 'Ctrl';

  return {
    // Return available shortcuts for documentation
    shortcuts: {
      [`${modifierKey}+S`]: 'Save campaign',
      [`${modifierKey}+P`]: 'Preview campaign', 
      [`${modifierKey}+Z`]: 'Undo',
      [`${modifierKey}+Y / ${modifierKey}+Shift+Z`]: 'Redo',
      'Escape': 'Deselect all',
      'Delete': 'Delete selected element',
      'G': 'Toggle grid',
      [`${modifierKey}+C`]: 'Copy selected element',
      [`${modifierKey}+V`]: 'Paste element',
      [`${modifierKey}+A`]: 'Select all (future)'
    }
  };
};