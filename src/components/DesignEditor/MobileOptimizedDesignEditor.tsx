
import React, { useRef, useEffect, useState } from 'react';
import { useDesignEditor } from './hooks/useDesignEditor';
import DesignCanvas from './DesignCanvas';
import MobileToolbar from './components/MobileToolbar';
import MobileStableEditor from './components/MobileStableEditor';
import { useMobileOptimization } from './hooks/useMobileOptimization';
import { useTouchOptimization } from './hooks/useTouchOptimization';

interface MobileOptimizedDesignEditorProps {
  selectedDevice: 'mobile' | 'tablet';
}

const MobileOptimizedDesignEditor: React.FC<MobileOptimizedDesignEditorProps> = ({
  selectedDevice
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const {
    campaign,
    setCampaign,
    selectedElementId,
    setSelectedElementId,
    zoom,
    setZoom
  } = useDesignEditor();

  // Mobile optimization hooks
  const { isMobile, isTablet, deviceType } = useMobileOptimization(containerRef, {
    preventScrollBounce: true,
    stabilizeViewport: true,
    optimizeTouchEvents: true,
    preventZoomGestures: true
  });

  const {
    convertToCanvasCoordinates,
    isTouchInteraction,
    touchCalibration
  } = useTouchOptimization({
    selectedDevice,
    containerRef: canvasRef,
    zoom
  });

  // Initialize mobile interface
  useEffect(() => {
    if (!isInitialized && containerRef.current) {
      // Force mobile viewport
      const viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
      if (viewport) {
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
      }

      // Optimize mobile performance
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.body.style.userSelect = 'none';
      
      setIsInitialized(true);
      
      console.log('📱 Mobile Design Editor initialized for:', selectedDevice);
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.body.style.userSelect = '';
    };
  }, [isInitialized, selectedDevice]);

  // Handle mobile zoom
  const handleZoomChange = (newZoom: number) => {
    setZoom(Math.max(0.3, Math.min(2, newZoom)));
  };

  // Handle pinch to zoom
  useEffect(() => {
    if (!canvasRef.current) return;

    let initialDistance = 0;
    let initialZoom = zoom;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        initialZoom = zoom;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        
        if (initialDistance > 0) {
          const scale = currentDistance / initialDistance;
          const newZoom = initialZoom * scale;
          handleZoomChange(newZoom);
        }
      }
    };

    const canvas = canvasRef.current;
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [zoom, handleZoomChange]);

  return (
    <MobileStableEditor className="mobile-design-editor">
      <div 
        ref={containerRef}
        className="flex flex-col h-full bg-gray-50 relative overflow-hidden"
        data-device={selectedDevice}
      >
        {/* Mobile Toolbar */}
        <MobileToolbar
          selectedDevice={selectedDevice}
          zoom={zoom}
          onZoomChange={handleZoomChange}
          selectedElementId={selectedElementId}
          onDeselectAll={() => setSelectedElementId(null)}
        />

        {/* Canvas Container */}
        <div className="flex-1 relative overflow-hidden">
          <div 
            ref={canvasRef}
            className="w-full h-full relative"
            style={{
              touchAction: 'manipulation',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none'
            }}
          >
            <DesignCanvas
              selectedDevice={selectedDevice}
              campaign={campaign}
              setCampaign={setCampaign}
              zoom={zoom}
              setZoom={setZoom}
              selectedElementId={selectedElementId}
              setSelectedElementId={setSelectedElementId}
              isMobileOptimized={true}
            />
          </div>
        </div>

        {/* Mobile floating add button */}
        <button
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center z-50 touch-manipulation"
          style={{ touchAction: 'manipulation' }}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <span className="text-2xl">+</span>
        </button>

        {/* Mobile debug info (dev only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed top-16 left-2 bg-black/80 text-white text-xs p-2 rounded z-50">
            <div>Device: {selectedDevice}</div>
            <div>Zoom: {zoom.toFixed(2)}</div>
            <div>Selected: {selectedElementId || 'none'}</div>
            <div>Touch: {touchCalibration.offsetY}px offset</div>
          </div>
        )}

        {/* Mobile specific styles */}
        <style>{`
          .mobile-design-editor {
            height: 100vh;
            height: 100dvh;
            overflow: hidden;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
          }

          .mobile-design-editor * {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
          }

          .mobile-design-editor .canvas-element {
            touch-action: manipulation;
            cursor: grab;
            min-height: 32px;
            min-width: 32px;
          }

          .mobile-design-editor .canvas-element:active,
          .mobile-design-editor .canvas-element.selected {
            cursor: grabbing;
            z-index: 1000;
          }

          /* Prevent iOS bounce */
          .mobile-design-editor,
          .mobile-design-editor * {
            overscroll-behavior: none;
            -webkit-overflow-scrolling: touch;
          }

          /* Optimize touch performance */
          .mobile-design-editor .touchable {
            will-change: transform;
            transform: translateZ(0);
            backface-visibility: hidden;
          }
        `}</style>
      </div>
    </MobileStableEditor>
  );
};

export default MobileOptimizedDesignEditor;
