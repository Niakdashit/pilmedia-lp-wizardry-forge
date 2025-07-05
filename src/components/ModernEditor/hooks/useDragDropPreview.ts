import { useState, useCallback } from 'react';

export const useDragDropPreview = () => {
  const [isDragDropMode, setIsDragDropMode] = useState(false);
  const [previewInteractionEnabled, setPreviewInteractionEnabled] = useState(false);

  const toggleDragDropMode = useCallback(() => {
    setIsDragDropMode(!isDragDropMode);
    setPreviewInteractionEnabled(!isDragDropMode);
  }, [isDragDropMode]);

  const enablePreviewInteraction = useCallback(() => {
    setPreviewInteractionEnabled(true);
    setIsDragDropMode(true);
  }, []);

  const disablePreviewInteraction = useCallback(() => {
    setPreviewInteractionEnabled(false);
    setIsDragDropMode(false);
  }, []);

  return {
    isDragDropMode,
    previewInteractionEnabled,
    toggleDragDropMode,
    enablePreviewInteraction,
    disablePreviewInteraction
  };
};