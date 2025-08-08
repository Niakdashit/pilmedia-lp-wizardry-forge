import React, { useCallback, useState, useRef } from 'react';
import { Move } from 'lucide-react';

interface GroupBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface GroupSelectionFrameProps {
  groupId: string;
  bounds: GroupBounds;
  zoom: number;
  onMove?: (deltaX: number, deltaY: number) => void;
  onResize?: (newBounds: GroupBounds) => void;
  onDoubleClick?: () => void;
  isVisible?: boolean;
}

const GroupSelectionFrame: React.FC<GroupSelectionFrameProps> = ({
  groupId,
  bounds,
  zoom,
  onMove,
  onResize,
  onDoubleClick,
  isVisible = true
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const frameRef = useRef<HTMLDivElement>(null);

  // Calculer la position et taille avec le zoom
  const scaledBounds = {
    x: bounds.x * zoom,
    y: bounds.y * zoom,
    width: bounds.width * zoom,
    height: bounds.height * zoom
  };

  // Gérer le début du drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.detail === 2) {
      // Double-clic : éditer le groupe
      onDoubleClick?.();
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - scaledBounds.x,
      y: e.clientY - scaledBounds.y
    });

    console.log('🎯 Group drag started:', groupId);
  }, [groupId, scaledBounds, onDoubleClick]);

  // Gérer le début du resize
  const handleResizeStart = useCallback((e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });

    console.log('🎯 Group resize started:', { groupId, handle });
  }, [groupId]);

  // Gérer le déplacement
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && onMove) {
      const deltaX = (e.clientX - dragStart.x - scaledBounds.x) / zoom;
      const deltaY = (e.clientY - dragStart.y - scaledBounds.y) / zoom;
      
      onMove(deltaX, deltaY);
    } else if (isResizing && onResize && resizeHandle) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      let newBounds = { ...bounds };
      
      switch (resizeHandle) {
        case 'nw':
          newBounds.x += deltaX / zoom;
          newBounds.y += deltaY / zoom;
          newBounds.width -= deltaX / zoom;
          newBounds.height -= deltaY / zoom;
          break;
        case 'ne':
          newBounds.y += deltaY / zoom;
          newBounds.width += deltaX / zoom;
          newBounds.height -= deltaY / zoom;
          break;
        case 'sw':
          newBounds.x += deltaX / zoom;
          newBounds.width -= deltaX / zoom;
          newBounds.height += deltaY / zoom;
          break;
        case 'se':
          newBounds.width += deltaX / zoom;
          newBounds.height += deltaY / zoom;
          break;
        case 'n':
          newBounds.y += deltaY / zoom;
          newBounds.height -= deltaY / zoom;
          break;
        case 's':
          newBounds.height += deltaY / zoom;
          break;
        case 'w':
          newBounds.x += deltaX / zoom;
          newBounds.width -= deltaX / zoom;
          break;
        case 'e':
          newBounds.width += deltaX / zoom;
          break;
      }
      
      // Empêcher les tailles négatives
      if (newBounds.width > 10 && newBounds.height > 10) {
        onResize(newBounds);
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    }
  }, [isDragging, isResizing, dragStart, scaledBounds, zoom, bounds, onMove, onResize, resizeHandle]);

  // Gérer la fin du drag/resize
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      console.log('🎯 Group drag ended:', groupId);
    }
    if (isResizing) {
      console.log('🎯 Group resize ended:', groupId);
    }
    
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, [isDragging, isResizing, groupId]);

  // Ajouter les event listeners globaux
  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  if (!isVisible) return null;

  return (
    <div
      ref={frameRef}
      className="absolute pointer-events-auto"
      style={{
        left: scaledBounds.x,
        top: scaledBounds.y,
        width: scaledBounds.width,
        height: scaledBounds.height,
        zIndex: 1000
      }}
    >
      {/* Cadre principal du groupe */}
      <div
        className="absolute inset-0 border-2 border-blue-500 bg-blue-50 bg-opacity-10 cursor-move"
        onMouseDown={handleMouseDown}
        style={{
          borderStyle: 'dashed',
          borderRadius: '4px'
        }}
      >
        {/* Label du groupe */}
        <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded text-nowrap">
          Groupe
        </div>
        
        {/* Icône de déplacement */}
        <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded opacity-75">
          <Move className="w-3 h-3" />
        </div>
      </div>

      {/* Poignées de redimensionnement */}
      {[
        { handle: 'nw', className: 'top-0 left-0 cursor-nw-resize' },
        { handle: 'n', className: 'top-0 left-1/2 -translate-x-1/2 cursor-n-resize' },
        { handle: 'ne', className: 'top-0 right-0 cursor-ne-resize' },
        { handle: 'e', className: 'top-1/2 right-0 -translate-y-1/2 cursor-e-resize' },
        { handle: 'se', className: 'bottom-0 right-0 cursor-se-resize' },
        { handle: 's', className: 'bottom-0 left-1/2 -translate-x-1/2 cursor-s-resize' },
        { handle: 'sw', className: 'bottom-0 left-0 cursor-sw-resize' },
        { handle: 'w', className: 'top-1/2 left-0 -translate-y-1/2 cursor-w-resize' }
      ].map(({ handle, className }) => (
        <div
          key={handle}
          className={`absolute w-3 h-3 bg-blue-500 border border-white rounded-sm ${className}`}
          onMouseDown={(e) => handleResizeStart(e, handle)}
          style={{ marginTop: '-6px', marginLeft: '-6px' }}
        />
      ))}
    </div>
  );
};

export default GroupSelectionFrame;
