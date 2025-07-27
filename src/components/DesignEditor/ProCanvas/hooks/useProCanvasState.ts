import { useState, useCallback } from 'react';

export const useProCanvasState = (elements: any[], onElementsChange: (elements: any[]) => void) => {
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [clipboardData, setClipboardData] = useState<any[]>([]);
  const [selectionBox, setSelectionBox] = useState<any>(null);
  const [snapGuides, setSnapGuides] = useState<any[]>([]);
  const [history, setHistory] = useState<any[][]>([elements]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const addToHistory = useCallback((newElements: any[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onElementsChange(history[newIndex]);
    }
  }, [historyIndex, history, onElementsChange]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onElementsChange(history[newIndex]);
    }
  }, [historyIndex, history, onElementsChange]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    selectedElements,
    clipboardData,
    selectionBox,
    snapGuides,
    setSelectedElements,
    setClipboardData,
    setSelectionBox,
    setSnapGuides,
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo
  };
};