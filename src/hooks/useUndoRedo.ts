import { useState, useCallback, useRef } from 'react';

/**
 * Interface pour un état dans l'historique
 */
interface HistoryState<T = any> {
  data: T;
  timestamp: number;
  action: string;
}

/**
 * Props pour le hook useUndoRedo
 */
interface UseUndoRedoProps<T = any> {
  /** Taille maximale de l'historique (défaut: 50) */
  maxHistorySize?: number;
  /** Callback appelé lors d'un undo */
  onUndo?: (state: T) => void;
  /** Callback appelé lors d'un redo */
  onRedo?: (state: T) => void;
  /** Callback appelé lors d'un changement d'état */
  onStateChange?: (state: T, action: string) => void;
}

/**
 * Hook générique pour gérer l'historique undo/redo
 * 
 * @example
 * ```tsx
 * const { addToHistory, undo, redo, canUndo, canRedo } = useUndoRedo({
 *   onUndo: (state) => setMyState(state),
 *   onRedo: (state) => setMyState(state),
 * });
 * 
 * // Ajouter un état à l'historique
 * addToHistory(myState, 'user_action');
 * 
 * // Annuler
 * undo();
 * 
 * // Rétablir
 * redo();
 * ```
 */
export const useUndoRedo = <T = any>({
  maxHistorySize = 50,
  onUndo,
  onRedo,
  onStateChange
}: UseUndoRedoProps<T> = {}) => {
  const [history, setHistory] = useState<HistoryState<T>[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const lastSavedRef = useRef<string>('');

  /**
   * Ajoute un état à l'historique
   */
  const addToHistory = useCallback((data: T, action: string = 'modify') => {
    const stateString = JSON.stringify(data);
    
    // Ne pas ajouter si identique au dernier état
    if (stateString === lastSavedRef.current) return;
    
    const newState: HistoryState<T> = {
      data: JSON.parse(stateString), // Deep clone
      timestamp: Date.now(),
      action
    };

    setHistory(prev => {
      // Supprimer les états futurs lors de l'ajout d'un nouvel état
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(newState);
      
      // Limiter la taille de l'historique
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
        setCurrentIndex(prev => Math.max(0, prev - 1));
      } else {
        setCurrentIndex(newHistory.length - 1);
      }
      
      return newHistory;
    });

    lastSavedRef.current = stateString;
    onStateChange?.(newState.data, action);
  }, [currentIndex, maxHistorySize, onStateChange]);

  /**
   * Annule la dernière action (undo)
   */
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const previousState = history[newIndex];
      
      setCurrentIndex(newIndex);
      onUndo?.(previousState.data);
      onStateChange?.(previousState.data, 'undo');
      
      return previousState.data;
    }
    return null;
  }, [currentIndex, history, onUndo, onStateChange]);

  /**
   * Rétablit l'action suivante (redo)
   */
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      const nextState = history[newIndex];
      
      setCurrentIndex(newIndex);
      onRedo?.(nextState.data);
      onStateChange?.(nextState.data, 'redo');
      
      return nextState.data;
    }
    return null;
  }, [currentIndex, history, onRedo, onStateChange]);

  /**
   * Vide l'historique
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
    lastSavedRef.current = '';
  }, []);

  /**
   * Obtient les informations sur l'état actuel de l'historique
   */
  const getHistoryInfo = useCallback(() => {
    return {
      canUndo: currentIndex > 0,
      canRedo: currentIndex < history.length - 1,
      historySize: history.length,
      currentIndex,
      lastAction: history[currentIndex]?.action || 'none',
      currentState: history[currentIndex]?.data || null
    };
  }, [currentIndex, history]);

  // États dérivés pour faciliter l'utilisation
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;
  const historySize = history.length;
  const lastAction = history[currentIndex]?.action || 'none';

  return {
    // Actions principales
    addToHistory,
    undo,
    redo,
    clearHistory,
    
    // Informations d'état
    canUndo,
    canRedo,
    historySize,
    lastAction,
    currentIndex,
    
    // Fonction utilitaire
    getHistoryInfo,
    
    // Historique simplifié (sans exposer les données complètes)
    history: history.map(h => ({ 
      timestamp: h.timestamp, 
      action: h.action 
    }))
  };
};

/**
 * Hook spécialisé pour les raccourcis clavier undo/redo
 */
export const useUndoRedoShortcuts = (
  undo: () => void,
  redo: () => void,
  options: {
    enabled?: boolean;
    preventDefault?: boolean;
  } = {}
) => {
  const { enabled = true, preventDefault = true } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

    if (ctrlKey && event.key === 'z') {
      if (preventDefault) {
        event.preventDefault();
      }
      
      if (event.shiftKey) {
        // Ctrl+Shift+Z ou Cmd+Shift+Z = Redo
        redo();
      } else {
        // Ctrl+Z ou Cmd+Z = Undo
        undo();
      }
    } else if (ctrlKey && event.key === 'y' && !isMac) {
      // Ctrl+Y = Redo (Windows uniquement)
      if (preventDefault) {
        event.preventDefault();
      }
      redo();
    }
  }, [enabled, preventDefault, undo, redo]);

  // Attacher/détacher les écouteurs d'événements
  useState(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  });

  return { handleKeyDown };
};
