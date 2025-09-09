import React from 'react';

interface InteractiveDragDropOverlayProps {
  campaign?: any;
  setCampaign?: (updater: (prev: any) => any) => void;
  previewDevice?: "desktop" | "tablet" | "mobile";
  isEnabled?: boolean;
  dragState?: any;
  selectedElementId?: string | null;
  handleDragStart?: (elementId: string, elementType: string, clientX: number, clientY: number) => void;
  handleDragMove?: (clientX: number, clientY: number) => void;
  handleDragEnd?: () => void;
  draggedElement?: any;
  dropZones?: any[];
  onElementDrop?: (elementId: string, dropZone: any) => void;
  children?: React.ReactNode;
}

export const InteractiveDragDropOverlay: React.FC<InteractiveDragDropOverlayProps> = ({ 
  children, 
  campaign,
  setCampaign,
  previewDevice,
  isEnabled,
  dragState,
  selectedElementId,
  handleDragStart,
  handleDragMove,
  handleDragEnd,
  draggedElement,
  dropZones,
  onElementDrop
}) => {
  return (
    <div 
      style={{ 
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1000
      }}
    >
      {children}
      {/* Simplified overlay - alignment guides removed for now */}
      <div style={{ position: 'absolute', inset: 0 }} />
    </div>
  );
};

export default InteractiveDragDropOverlay;