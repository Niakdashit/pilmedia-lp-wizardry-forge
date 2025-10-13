
export interface DragState {
  isDragging: boolean;
  draggedElementId: string | null;
  draggedElementType: 'text' | 'image' | null;
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number } | null;
  currentOffset: { x: number; y: number };
}

export interface DragStartMeta {
  x: number;            // cursor position relative to container at drag start
  y: number;
  offsetX: number;      // distance from cursor to element's left at grab time
  offsetY: number;      // distance from cursor to element's top at grab time
  elementWidth: number; // element size for bounds clamping
  elementHeight: number;
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
