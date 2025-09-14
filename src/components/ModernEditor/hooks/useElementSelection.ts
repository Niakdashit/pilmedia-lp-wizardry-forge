
import { useState, useCallback } from 'react';
import { ElementSelection } from './types/dragDropTypes';

export const useElementSelection = (): ElementSelection => {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const handleElementSelect = useCallback((elementId: string) => {
    setSelectedElementId(selectedElementId === elementId ? null : elementId);
  }, [selectedElementId]);

  const handleDeselectAll = useCallback(() => {
    setSelectedElementId(null);
  }, []);

  return {
    selectedElementId,
    handleElementSelect,
    handleDeselectAll
  };
};
