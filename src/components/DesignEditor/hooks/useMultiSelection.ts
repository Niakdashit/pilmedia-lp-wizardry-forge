import { useState, useCallback } from 'react';

export const useMultiSelection = () => {
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  const selectElement = useCallback((elementId: string, isCtrlPressed: boolean = false) => {
    if (isCtrlPressed) {
      setSelectedElements(prev => {
        if (prev.includes(elementId)) {
          return prev.filter(id => id !== elementId);
        } else {
          return [...prev, elementId];
        }
      });
      setIsMultiSelectMode(true);
    } else {
      setSelectedElements([elementId]);
      setIsMultiSelectMode(false);
    }
  }, []);

  const selectMultiple = useCallback((elementIds: string[]) => {
    setSelectedElements(elementIds);
    setIsMultiSelectMode(elementIds.length > 1);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedElements([]);
    setIsMultiSelectMode(false);
  }, []);

  const isSelected = useCallback((elementId: string) => {
    return selectedElements.includes(elementId);
  }, [selectedElements]);

  return {
    selectedElements,
    isMultiSelectMode,
    selectElement,
    selectMultiple,
    clearSelection,
    isSelected
  };
};