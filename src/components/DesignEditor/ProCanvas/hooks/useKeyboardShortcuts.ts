import { useEffect } from 'react';

interface UseKeyboardShortcutsProps {
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSelectAll: () => void;
}

export const useKeyboardShortcuts = ({
  onCopy,
  onPaste,
  onDelete,
  onUndo,
  onRedo,
  onSelectAll
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'c':
            e.preventDefault();
            onCopy();
            break;
          case 'v':
            e.preventDefault();
            onPaste();
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              onRedo();
            } else {
              onUndo();
            }
            break;
          case 'y':
            e.preventDefault();
            onRedo();
            break;
          case 'a':
            e.preventDefault();
            onSelectAll();
            break;
        }
      } else {
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            e.preventDefault();
            onDelete();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCopy, onPaste, onDelete, onUndo, onRedo, onSelectAll]);
};