import { useState, useCallback } from 'react';

interface HistoryState {
  elements: any[];
  timestamp: number;
}

export const useEditorHistory = (initialElements: any[], onElementsChange: (elements: any[]) => void) => {
  const [history, setHistory] = useState<HistoryState[]>([{ elements: [], timestamp: Date.now() }]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const saveState = useCallback((newElements: any[]) => {
    const newState: HistoryState = {
      elements: JSON.parse(JSON.stringify(newElements)),
      timestamp: Date.now()
    };

    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(newState);
      
      // Limit history to 50 states
      if (newHistory.length > 50) {
        newHistory.shift();
        return newHistory;
      }
      
      return newHistory;
    });
    
    setCurrentIndex(prev => Math.min(prev + 1, 49));
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onElementsChange(history[newIndex].elements);
    }
  }, [currentIndex, history, onElementsChange]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onElementsChange(history[newIndex].elements);
    }
  }, [currentIndex, history, onElementsChange]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    saveState,
    undo,
    redo,
    canUndo,
    canRedo
  };
};