import React from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { isRealMobile } from '@/utils/isRealMobile';

interface ZoomSliderProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  minZoom?: number;
  maxZoom?: number;
  step?: number;
  defaultZoom?: number;
  onNavigateToScreen2?: () => void;
  currentScreen?: 'screen1' | 'screen2' | 'screen3';
}

const ZoomSlider: React.FC<ZoomSliderProps> = React.memo(({ 
  zoom,
  onZoomChange,
  minZoom = 0.1,
  maxZoom = 1,
  step = 0.05,
  defaultZoom = 1,
  onNavigateToScreen2,
  currentScreen = 'screen1'
}) => {
  if (isRealMobile()) {
    return null;
  }
  const zoomPercent = Math.round(zoom * 100);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    onZoomChange(value);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(maxZoom, zoom + step);
    onZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(minZoom, zoom - step);
    onZoomChange(newZoom);
  };

  const handleResetZoom = () => {
    onZoomChange(defaultZoom);
  };

  // Position et offset identiques à QuizEditor
  const [sidebarOffsetRem, setSidebarOffsetRem] = React.useState<number>(25);
  React.useEffect(() => {
    if (isRealMobile()) return;
    const compute = () => {
      const expanded = document.querySelector('[data-hybrid-sidebar="expanded"]');
      const collapsed = document.querySelector('[data-hybrid-sidebar="collapsed"]');
      if (expanded) return 25;
      if (collapsed) return 5;
      return 5;
    };
    setSidebarOffsetRem(compute());
    const observer = new MutationObserver(() => setSidebarOffsetRem(compute()));
    observer.observe(document.body, { subtree: true, childList: true, attributes: false });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="fixed bottom-4 z-50" style={{ left: isRealMobile() ? 16 : `calc(${sidebarOffsetRem}rem + 1rem)` }}>
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm flex items-center gap-2 h-10">
        {/* Zoom Out Button */}
        <button
          onClick={handleZoomOut}
          disabled={zoom <= minZoom}
          className="p-1 hover:bg-[hsl(var(--sidebar-hover))] rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="Zoom arrière"
        >
          <Minus size={16} aria-hidden className="hidden text-[hsl(var(--sidebar-icon))] hover:text-[hsl(var(--sidebar-icon-active))]" />
        </button>

        {/* Zoom Slider */}
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={minZoom}
            max={maxZoom}
            step={step}
            value={zoom}
            onChange={handleSliderChange}
            className="w-40 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer zoom-slider"
            style={{
              background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((zoom - minZoom) / (maxZoom - minZoom)) * 100}%, hsl(var(--border)) ${((zoom - minZoom) / (maxZoom - minZoom)) * 100}%, hsl(var(--border)) 100%)`
            }}
          />
          {/* Évite l'affichage du pourcentage pour coller à QuizEditor */}
          <span className="hidden">{zoomPercent}%</span>
        </div>

        {/* Zoom In Button */}
        <button
          onClick={handleZoomIn}
          disabled={zoom >= maxZoom}
          className="p-1 hover:bg-[hsl(var(--sidebar-hover))] rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="Zoom avant"
        >
          <Plus size={16} aria-hidden className="hidden text-[hsl(var(--sidebar-icon))] hover:text-[hsl(var(--sidebar-icon-active))]" />
        </button>

        {/* Screen navigation button (QuizEditor parity) */}
        {onNavigateToScreen2 && (
          <>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <button
              onClick={onNavigateToScreen2}
              className="flex items-center gap-1 px-3 py-2 text-xs sm:text-sm border border-gray-300 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-sm h-8"
              aria-label={
                currentScreen === 'screen1' ? "Aller à l'écran 2" : 
                currentScreen === 'screen2' ? "Aller à l'écran 3" : 
                "Retour à l'écran 1"
              }
              title={
                currentScreen === 'screen1' ? "Aller à l'écran 2" : 
                currentScreen === 'screen2' ? "Aller à l'écran 3" : 
                "Retour à l'écran 1"
              }
            >
              <span className="text-xs font-medium text-gray-700">
                {currentScreen === 'screen1' ? 'Écran 2' : 
                 currentScreen === 'screen2' ? 'Écran 3' : 
                 'Écran 1'}
              </span>
              {/* simple caret using css since lucide may not be imported here */}
              <span className="text-gray-600">{currentScreen === 'screen1' || currentScreen === 'screen2' ? '▾' : '▴'}</span>
            </button>
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .zoom-slider::-webkit-slider-thumb {
            appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #841b60;
            cursor: pointer;
            border: 2px solid #ffffff;
          }

          .zoom-slider::-moz-range-thumb {
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #841b60;
            cursor: pointer;
            border: 2px solid #ffffff;
            border: none;
          }
        `
      }} />
    </div>
  );
});

ZoomSlider.displayName = 'ZoomSlider';

export default ZoomSlider;