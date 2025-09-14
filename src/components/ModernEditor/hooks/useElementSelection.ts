
import { useState, useCallback } from 'react';
import { ElementSelection } from './types/dragDropTypes';

export const useElementSelection = (): ElementSelection => {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const handleElementSelect = useCallback((elementId: string) => {
    // Always set selection to the provided elementId (idempotent).
    // This avoids accidental deselection when multiple handlers (pointerdown + click)
    // fire for the same element interaction.
    setSelectedElementId(elementId);
  }, []);

  const handleDeselectAll = useCallback(() => {
    setSelectedElementId(null);
  }, []);

  return {
    selectedElementId,
    handleElementSelect,
    handleDeselectAll
  };
};
