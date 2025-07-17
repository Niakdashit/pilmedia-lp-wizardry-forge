import React, { useState } from 'react';
import { Trash2, RotateCw, Copy, Layers, Eye } from 'lucide-react';

interface ImageToolbarProps {
  image: any;
  position: { x: number; y: number };
  onUpdate: (updates: any) => void;
  onDelete: () => void;
  onClose: () => void;
}

const ImageToolbar: React.FC<ImageToolbarProps> = ({
  image,
  position,
  onUpdate,
  onDelete,
  onClose
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleRotate = () => {
    const newRotation = (image.rotation || 0) + 90;
    onUpdate({ rotation: newRotation >= 360 ? 0 : newRotation });
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    onUpdate({ [dimension]: Math.max(20, value) });
  };

  const handleOpacityChange = (opacity: number) => {
    onUpdate({ opacity: opacity / 100 });
  };

  const handleDuplicate = () => {
    // Note: Cette fonction nécessiterait une implémentation au niveau parent
    console.log('Duplicate functionality would be implemented here');
  };

  const handleLayerUp = () => {
    onUpdate({ zIndex: (image.zIndex || 0) + 1 });
  };

  const handleLayerDown = () => {
    onUpdate({ zIndex: Math.max(0, (image.zIndex || 0) - 1) });
  };

  return (
    <>
      {/* Overlay to close toolbar on click outside */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Main Toolbar */}
      <div
        className="fixed z-50 bg-gray-900 text-white rounded-lg shadow-xl border border-gray-700"
        style={{
          left: Math.min(position.x, window.innerWidth - 400),
          top: Math.max(10, position.y),
        }}
      >
        <div className="flex items-center">
          {/* Size Controls */}
          <div className="flex items-center gap-2 px-3 py-2 border-r border-gray-700">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-300">L:</span>
              <input
                type="number"
                value={Math.round(image.width || 150)}
                onChange={(e) => handleSizeChange('width', parseInt(e.target.value) || 150)}
                className="bg-gray-800 text-white text-sm px-2 py-1 rounded border-none outline-none w-16"
                min="20"
                max="800"
              />
            </div>

            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-300">H:</span>
              <input
                type="number"
                value={Math.round(image.height || 150)}
                onChange={(e) => handleSizeChange('height', parseInt(e.target.value) || 150)}
                className="bg-gray-800 text-white text-sm px-2 py-1 rounded border-none outline-none w-16"
                min="20"
                max="800"
              />
            </div>
          </div>

          {/* Opacity */}
          <div className="flex items-center gap-2 px-3 py-2 border-r border-gray-700">
            <Eye className="w-4 h-4 text-gray-300" />
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round((image.opacity || 1) * 100)}
              onChange={(e) => handleOpacityChange(parseInt(e.target.value))}
              className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-xs text-gray-300 w-8">{Math.round((image.opacity || 1) * 100)}%</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center px-2">
            {/* Copy */}
            <button
              onClick={handleDuplicate}
              className="p-2 rounded hover:bg-gray-700 transition-colors"
              title="Dupliquer"
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* Rotate */}
            <button
              onClick={handleRotate}
              className="p-2 rounded hover:bg-gray-700 transition-colors"
              title="Faire pivoter"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Layers */}
            <div className="relative">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="p-2 rounded hover:bg-gray-700 transition-colors"
                title="Calques"
              >
                <Layers className="w-4 h-4" />
              </button>
              
              {showAdvanced && (
                <div className="absolute top-full right-0 mt-1 bg-gray-800 rounded-lg shadow-lg border border-gray-600 p-2 min-w-32">
                  <button
                    onClick={handleLayerUp}
                    className="w-full text-left px-2 py-1 text-sm hover:bg-gray-700 rounded"
                  >
                    Premier plan
                  </button>
                  <button
                    onClick={handleLayerDown}
                    className="w-full text-left px-2 py-1 text-sm hover:bg-gray-700 rounded"
                  >
                    Arrière-plan
                  </button>
                </div>
              )}
            </div>

            {/* Delete */}
            <button
              onClick={onDelete}
              className="p-2 rounded hover:bg-red-600 text-red-400 transition-colors ml-1"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Styles pour le slider */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 12px;
            width: 12px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
          }
          .slider::-moz-range-thumb {
            height: 12px;
            width: 12px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: none;
          }
        `
      }} />
    </>
  );
};

export default ImageToolbar;