import React from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';

interface ZoomSliderProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  minZoom?: number;
  maxZoom?: number;
  step?: number;
}

const ZoomSlider: React.FC<ZoomSliderProps> = React.memo(({
  zoom,
  onZoomChange,
  minZoom = 0.25,
  maxZoom = 2,
  step = 0.05
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
    onZoomChange(1);
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white shadow-lg rounded-full px-4 py-2 flex items-center gap-3 border border-gray-200">
        {/* Zoom Out Button */}
        <button
          onClick={handleZoomOut}
          disabled={zoom <= minZoom}
          className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((zoom - minZoom) / (maxZoom - minZoom)) * 100}%, #e5e7eb ${((zoom - minZoom) / (maxZoom - minZoom)) * 100}%, #e5e7eb 100%)`
            }}
          />
          
          {/* Zoom Percentage */}
          <button
            onClick={handleResetZoom}
            className="min-w-[50px] text-sm font-medium text-gray-700 hover:bg-gray-100 rounded px-2 py-1 transition-colors"
            title="Reset zoom (100%)"
          >
            {zoomPercent}%
          </button>
        </div>

        {/* Zoom In Button */}
        <button
          onClick={handleZoomIn}
          disabled={zoom >= maxZoom}
          className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Zoom avant"
        >
          <Plus size={16} className="text-gray-600" />
        </button>

        {/* Reset Zoom Button */}
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button
          onClick={handleResetZoom}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Réinitialiser le zoom"
          title="Réinitialiser le zoom"
        >
          <RotateCcw size={16} className="text-gray-600" />
        </button>
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
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .zoom-slider::-moz-range-thumb {
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border: none;
          }
        `
      }} />
    </div>
  );
});

ZoomSlider.displayName = 'ZoomSlider';

export default ZoomSlider;