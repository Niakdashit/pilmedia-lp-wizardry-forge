
import React from 'react';
import { ZoomIn, ZoomOut, Move, Hand, Grid } from 'lucide-react';

interface MobileToolbarProps {
  selectedDevice: 'mobile' | 'tablet';
  zoom: number;
  onZoomChange: (zoom: number) => void;
  selectedElementId: string | null;
  onDeselectAll: () => void;
}

const MobileToolbar: React.FC<MobileToolbarProps> = ({
  selectedDevice,
  zoom,
  onZoomChange,
  selectedElementId,
  onDeselectAll
}) => {
  const handleZoomIn = () => {
    onZoomChange(Math.min(2, zoom + 0.1));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(0.3, zoom - 0.1));
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm">
      {/* Left side - Device info */}
      <div className="flex items-center space-x-2">
        <div className="text-sm font-medium text-gray-700">
          {selectedDevice === 'mobile' ? '📱' : '📱'} {selectedDevice}
        </div>
        {selectedElementId && (
          <button
            onClick={onDeselectAll}
            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded touch-manipulation"
            style={{ touchAction: 'manipulation' }}
          >
            Désélectionner
          </button>
        )}
      </div>

      {/* Right side - Zoom controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-100 rounded touch-manipulation"
          style={{ touchAction: 'manipulation' }}
          disabled={zoom <= 0.3}
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        
        <div className="text-sm text-gray-600 min-w-12 text-center">
          {Math.round(zoom * 100)}%
        </div>
        
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-100 rounded touch-manipulation"
          style={{ touchAction: 'manipulation' }}
          disabled={zoom >= 2}
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MobileToolbar;
