import { useEffect } from 'react';
import { useDragState } from './useDragState';
import { useElementSelection } from './useElementSelection';
import { useDragHandlers } from './useDragHandlers';
import { UseInteractiveDragDropProps } from './types/dragDropTypes';

export const useInteractiveDragDrop = ({
  setCampaign,
  containerRef,
  previewDevice
}: UseInteractiveDragDropProps) => {
  const { dragState, dragStartRef, updateDragState, resetDragState } = useDragState();
  const { selectedElementId, handleElementSelect, handleDeselectAll } = useElementSelection();
  
  const { handleDragStart, handleDragMove, handleDragEnd } = useDragHandlers({
    dragState,
    dragStartRef,
    updateDragState,
    resetDragState,
    containerRef,
    setCampaign,
    previewDevice,
    setSelectedElementId: (id: string | null) => {
      if (id === null) {
        handleDeselectAll();
      } else {
        handleElementSelect(id);
      }
    }
  });

  // Handle text editing events
  useEffect(() => {
    const handleTextUpdate = (e: CustomEvent) => {
      const { id, text } = e.detail;
      setCampaign((prev: any) => {
        const design = prev.design || {};
        const customTexts = design.customTexts || [];
        
        const updatedTexts = customTexts.map((textElement: any) => {
          if (textElement.id === parseInt(id)) {
            if (previewDevice !== 'desktop') {
              return {
                ...textElement,
                [previewDevice]: {
                  ...textElement[previewDevice],
                  text: text
                }
              };
            } else {
              return {
                ...textElement,
                text: text
              };
            }
          }
          return textElement;
        });

        return {
          ...prev,
          design: {
            ...design,
            customTexts: updatedTexts
          },
          _lastUpdate: Date.now()
        };
      });
    };

    window.addEventListener('updateTextElement', handleTextUpdate as EventListener);
    return () => window.removeEventListener('updateTextElement', handleTextUpdate as EventListener);
  }, [setCampaign, previewDevice]);

  return {
    dragState,
    selectedElementId,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleElementSelect,
    handleDeselectAll
  };
};