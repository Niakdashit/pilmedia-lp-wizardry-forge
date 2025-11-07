import React, { memo, useMemo, useRef } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { useOptimizedDragDrop } from '../hooks/useOptimizedDragDrop';
import { useSmartSnapping } from '../hooks/useSmartSnapping';
import InteractiveDragDropOverlay from './InteractiveDragDropOverlay';
import GameCanvasPreview from './GameCanvasPreview';

interface OptimizedGameCanvasPreviewProps {
  campaign: any;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  isLoading?: boolean;
  setCampaign: (updater: any) => void;
  previewKey?: string;
}

const OptimizedGameCanvasPreview: React.FC<OptimizedGameCanvasPreviewProps> = memo(({
  campaign,
  previewDevice,
  isLoading = false,
  setCampaign,
  previewKey
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { showGridLines } = useEditorStore();
  
  // Optimized drag and drop with performance enhancements
  const dragDropProps = useOptimizedDragDrop({
    containerRef,
    previewDevice
  });
  
  // Smart snapping system
  useSmartSnapping({
    containerRef,
    gridSize: 10,
    snapTolerance: 5
  });

  // Memoized device dimensions for consistent rendering
  const deviceDimensions = useMemo(() => {
    switch (previewDevice) {
      case 'mobile':
        return { width: 430, height: 932 }; // Dimensions standard (iPhone 14 Pro Max)
      case 'tablet':
        return { width: 820, height: 1180 };
      default:
        return { width: 1700, height: 850 };
    }
  }, [previewDevice]);

  // Grid overlay for precision alignment
  const GridOverlay = memo(() => {
    if (!showGridLines) return null;
    
    const gridSize = 10;
    const lines = [];
    
    // Vertical lines
    for (let x = 0; x <= deviceDimensions.width; x += gridSize) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={deviceDimensions.height}
          stroke="rgba(99, 102, 241, 0.1)"
          strokeWidth="1"
        />
      );
    }
    
    // Horizontal lines
    for (let y = 0; y <= deviceDimensions.height; y += gridSize) {
      lines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={deviceDimensions.width}
          y2={y}
          stroke="rgba(99, 102, 241, 0.1)"
          strokeWidth="1"
        />
      );
    }
    
    return (
      <svg
        className="absolute inset-0 pointer-events-none z-10"
        width={deviceDimensions.width}
        height={deviceDimensions.height}
      >
        {lines}
      </svg>
    );
  });

  // Snap guides overlay
  const SnapGuidesOverlay = memo(() => {
    const { dragState } = useEditorStore();
    
    if (!dragState.isDragging) return null;
    
    // This would show alignment guides during drag
    return (
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Snap guides would be rendered here */}
      </div>
    );
  });

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ 
        maxWidth: deviceDimensions.width,
        maxHeight: deviceDimensions.height 
      }}
    >
      {/* Performance indicator for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 z-50 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {previewDevice} | Key: {previewKey?.slice(-8)}
        </div>
      )}
      
      {/* Grid overlay */}
      <GridOverlay />
      
      {/* Main canvas */}
      <GameCanvasPreview
        campaign={campaign}
        previewDevice={previewDevice}
        isLoading={isLoading}
        setCampaign={setCampaign}
        key={previewKey}
      />
      
      {/* Interactive overlay for drag and drop */}
      <InteractiveDragDropOverlay
        campaign={campaign}
        setCampaign={setCampaign}
        previewDevice={previewDevice}
        isEnabled={!isLoading}
        {...dragDropProps}
      />
      
      {/* Snap guides overlay */}
      <SnapGuidesOverlay />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>
            <span className="text-sm text-gray-600">Optimisation...</span>
          </div>
        </div>
      )}
    </div>
  );
});

OptimizedGameCanvasPreview.displayName = 'OptimizedGameCanvasPreview';

export default OptimizedGameCanvasPreview;