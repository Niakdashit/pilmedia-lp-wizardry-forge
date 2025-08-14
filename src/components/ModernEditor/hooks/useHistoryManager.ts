import { useState, useCallback, useRef } from 'react';

interface HistoryState {
  campaign: any;
  timestamp: number;
  action: string;
}

interface UseHistoryManagerProps {
  maxHistorySize?: number;
  onUndo?: (state: any) => void;
  onRedo?: (state: any) => void;
}

export const useHistoryManager = ({
  maxHistorySize = 50,
  onUndo,
  onRedo
}: UseHistoryManagerProps = {}) => {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const lastSavedRef = useRef<string>('');

  // Add state to history
  const addToHistory = useCallback((campaign: any, action: string = 'modify') => {
    const stateString = JSON.stringify(campaign);
    
    // Don't add if identical to last state
    if (stateString === lastSavedRef.current) return;
    
    const newState: HistoryState = {
      campaign: JSON.parse(stateString), // Deep clone
      timestamp: Date.now(),
      action
    };

    setHistory(prev => {
      // Remove any future states when adding new state
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(newState);
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
        setCurrentIndex(prev => Math.max(0, prev - 1));
      } else {
        setCurrentIndex(newHistory.length - 1);
      }
      
      return newHistory;
    });

    lastSavedRef.current = stateString;
  }, [currentIndex, maxHistorySize]);

  // Undo operation
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const previousState = history[newIndex];
      
      setCurrentIndex(newIndex);
      onUndo?.(previousState.campaign);
      
      return previousState.campaign;
    }
    return null;
  }, [currentIndex, history, onUndo]);

  // Redo operation
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      const nextState = history[newIndex];
      
      setCurrentIndex(newIndex);
      onRedo?.(nextState.campaign);
      
      return nextState.campaign;
    }
    return null;
  }, [currentIndex, history, onRedo]);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
    lastSavedRef.current = '';
  }, []);

  // Get current state info
  const getHistoryInfo = useCallback(() => {
    return {
      canUndo: currentIndex > 0,
      canRedo: currentIndex < history.length - 1,
      historySize: history.length,
      currentIndex,
      lastAction: history[currentIndex]?.action || 'none'
    };
  }, [currentIndex, history]);

  return {
    addToHistory,
    undo,
    redo,
    clearHistory,
    getHistoryInfo,
    history: history.map(h => ({ timestamp: h.timestamp, action: h.action })) // Don't expose full state
  };
};