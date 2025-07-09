
export interface DragState {
  isDragging: boolean;
  draggedElementId: string | null;
  draggedElementType: 'text' | 'image' | null;
  startPosition: { x: number; y: number };
  currentOffset: { x: number; y: number };
}

export interface UseInteractiveDragDropProps {
  campaign: any;
  setCampaign: (updater: (prev: any) => any) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
}

export interface DragHandlers {
  handleDragStart: (
    e: React.MouseEvent | React.TouchEvent,
    elementId: string,
    elementType: 'text' | 'image'
  ) => void;
  handleDragMove: (e: MouseEvent | TouchEvent) => void;
  handleDragEnd: () => void;
}

export interface ElementSelection {
  selectedElementId: string | null;
  handleElementSelect: (elementId: string) => void;
  handleDeselectAll: () => void;
}
