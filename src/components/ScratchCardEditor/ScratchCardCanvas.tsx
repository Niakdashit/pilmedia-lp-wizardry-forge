import React, { forwardRef, useRef, useEffect, useState, useCallback } from 'react';
import { useScratchCanvas } from '../ScratchCard/hooks/useScratchCanvas';
import { getDeviceDimensions } from '@/utils/deviceDimensions';

interface ScratchCardCanvasProps {
  elements: any[];
  onElementsChange: (elements: any[]) => void;
  selectedElement: any;
  onSelectedElementChange: (element: any) => void;
  selectedElements: any[];
  onSelectedElementsChange: (elements: any[]) => void;
  background: { type: 'color' | 'image'; value: string };
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  zoom?: number;
  scratchConfig: any;
  onScratchConfigChange: (config: any) => void;
}

const ScratchCardCanvas = forwardRef<HTMLDivElement, ScratchCardCanvasProps>(({
  elements,
  onElementsChange,
  selectedElement,
  onSelectedElementChange,
  selectedElements,
  onSelectedElementsChange,
  background,
  selectedDevice,
  zoom = 1,
  scratchConfig,
  onScratchConfigChange
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);

  // Device dimensions - unified across app
  const currentDimensions = getDeviceDimensions(selectedDevice as any);

  // Initialize scratch canvas
  const {
    initCanvas,
    startScratching,
    scratch,
    stopScratching,
    resetScratch,
    getProgress
  } = useScratchCanvas({
    onProgressChange: setScratchProgress,
    scratchRadius: scratchConfig.scratchThickness || 20
  });

  useEffect(() => {
    if (canvasRef.current) {
      initCanvas(canvasRef.current, {
        width: currentDimensions.width,
        height: currentDimensions.height,
        scratchTexture: scratchConfig.scratchTexture || 'silver',
        opacity: scratchConfig.scratchOpacity || 0.8
      });
    }
  }, [initCanvas, currentDimensions, scratchConfig]);

  // Handle mouse events for scratching
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsScratching(true);
    startScratching(x, y);
  }, [startScratching]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isScratching || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    scratch(x, y);
  }, [isScratching, scratch]);

  const handleMouseUp = useCallback(() => {
    setIsScratching(false);
    stopScratching();
  }, [stopScratching]);

  // Handle touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    setIsScratching(true);
    startScratching(x, y);
  }, [startScratching]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!isScratching || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    scratch(x, y);
  }, [isScratching, scratch]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsScratching(false);
    stopScratching();
  }, [stopScratching]);

  // Handle element selection
  const handleElementClick = useCallback((element: any, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectedElementChange(element);
  }, [onSelectedElementChange]);

  // Handle canvas click (deselect)
  const handleCanvasClick = useCallback(() => {
    onSelectedElementChange(null);
    onSelectedElementsChange([]);
  }, [onSelectedElementChange, onSelectedElementsChange]);

  // Reset scratch area
  const handleResetScratch = useCallback(() => {
    resetScratch();
    setScratchProgress(0);
  }, [resetScratch]);

  return (
    <div 
      ref={ref}
      className="flex-1 flex items-center justify-center p-8 bg-gray-100 overflow-auto"
      onClick={handleCanvasClick}
    >
      {/* Zoom wrapper to mirror other editors */}
      <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
      <div 
        ref={containerRef}
        className="relative bg-white rounded-lg shadow-lg overflow-hidden"
        style={{
          width: currentDimensions.width,
          height: currentDimensions.height,
          minWidth: currentDimensions.width,
          minHeight: currentDimensions.height
        }}
      >
        {/* Background */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundColor: background.type === 'color' ? background.value : undefined,
            backgroundImage: background.type === 'image' ? `url(${background.value})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        {/* Elements Layer */}
        <div className="absolute inset-0">
          {elements.map((element) => (
            <div
              key={element.id}
              className={`absolute cursor-pointer transition-all duration-200 ${
                selectedElement?.id === element.id ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                transform: `rotate(${element.rotation || 0}deg)`,
                zIndex: element.zIndex || 1
              }}
              onClick={(e) => handleElementClick(element, e)}
            >
              {element.type === 'text' && (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    fontSize: element.fontSize || 16,
                    fontFamily: element.fontFamily || 'Arial',
                    color: element.color || '#000000',
                    fontWeight: element.fontWeight || 'normal',
                    textAlign: element.textAlign || 'center'
                  }}
                >
                  {element.text || 'Texte'}
                </div>
              )}
              
              {element.type === 'image' && (
                <img
                  src={element.src}
                  alt=""
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              )}
              
              {element.type === 'shape' && (
                <div
                  className="w-full h-full"
                  style={{
                    backgroundColor: element.backgroundColor || '#000000',
                    borderRadius: element.shapeType === 'circle' ? '50%' : element.borderRadius || 0
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Revealed Content (behind scratch layer) */}
        <div 
          className="absolute flex items-center justify-center text-center"
          style={{
            left: scratchConfig.scratchArea?.x || 50,
            top: scratchConfig.scratchArea?.y || 50,
            width: scratchConfig.scratchArea?.width || 300,
            height: scratchConfig.scratchArea?.height || 200,
            zIndex: 5
          }}
        >
          {scratchConfig.revealedContent?.type === 'text' ? (
            <div className="text-2xl font-bold text-yellow-600">
              {scratchConfig.revealedContent?.value || 'Félicitations!'}
            </div>
          ) : (
            <img 
              src={scratchConfig.revealedContent?.value} 
              alt="Prize" 
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>

        {/* Scratch Canvas Layer */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair"
          style={{ zIndex: 10 }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />

        {/* Scratch Progress Indicator */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
          Gratté: {Math.round(scratchProgress * 100)}%
        </div>

        {/* Reset Button */}
        <button
          onClick={handleResetScratch}
          className="absolute top-4 left-4 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          Reset
        </button>

        {/* Scratch Area Outline (in edit mode) */}
        <div 
          className="absolute border-2 border-dashed border-red-500 pointer-events-none"
          style={{
            left: scratchConfig.scratchArea?.x || 50,
            top: scratchConfig.scratchArea?.y || 50,
            width: scratchConfig.scratchArea?.width || 300,
            height: scratchConfig.scratchArea?.height || 200,
            zIndex: 15
          }}
        />
      </div>
      </div>
    </div>
  );
});

ScratchCardCanvas.displayName = 'ScratchCardCanvas';

export default ScratchCardCanvas;
