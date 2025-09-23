import React from 'react';
import { Minus, Plus, RotateCcw, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
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

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm flex items-center gap-2 h-10">
        {/* Zoom Out Button */}
        <button
          onClick={handleZoomOut}
          disabled={zoom <= minZoom}
          className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="Zoom arrière"
        >
          <Minus size={16} className="text-gray-600" />
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
            className="w-32 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer zoom-slider"
            style={{
              background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((zoom - minZoom) / (maxZoom - minZoom)) * 100}%, hsl(var(--border)) ${((zoom - minZoom) / (maxZoom - minZoom)) * 100}%, hsl(var(--border)) 100%)`
            }}
          />
          
          {/* Zoom Percentage */}
          <button
            onClick={handleResetZoom}
            className="min-w-[50px] h-8 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg px-2 transition-all duration-200 flex items-center justify-center"
            title="Reset zoom (100%)"
          >
            {zoomPercent}%
          </button>
        </div>

        {/* Zoom In Button */}
        <button
          onClick={handleZoomIn}
          disabled={zoom >= maxZoom}
          className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="Zoom avant"
        >
          <Plus size={16} className="text-gray-600" />
        </button>

        {/* Reset Zoom Button */}
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          onClick={handleResetZoom}
          className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-lg transition-all duration-200"
          aria-label="Réinitialiser le zoom"
          title="Réinitialiser le zoom"
        >
          <RotateCcw size={16} className="text-gray-600" />
        </button>

        {/* Navigate to Screen Button */}
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
              {currentScreen === 'screen1' || currentScreen === 'screen2' ? (
                <ChevronDown size={14} className="text-gray-600" />
              ) : (
                <ChevronUp size={14} className="text-gray-600" />
              )}
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
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid #ffffff;
          }

          .zoom-slider::-moz-range-thumb {
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #3b82f6;
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