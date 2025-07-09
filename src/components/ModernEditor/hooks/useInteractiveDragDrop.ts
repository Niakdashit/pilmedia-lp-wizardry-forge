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