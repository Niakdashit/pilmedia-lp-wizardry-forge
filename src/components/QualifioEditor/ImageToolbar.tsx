
import React, { useState } from 'react';
import { Trash2, RotateCw, Copy, Layers, Eye, Scissors } from 'lucide-react';
import { removeBackground, loadImage } from '../utils/backgroundRemoval';

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
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);

  const handleRotate = () => {
    const newRotation = (image.rotation || 0) + 90;
    onUpdate({ rotation: newRotation >= 360 ? 0 : newRotation });
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    const newValue = Math.max(20, Math.min(800, value));
    onUpdate({ [dimension]: newValue });
  };

  const handleOpacityChange = (opacity: number) => {
    onUpdate({ opacity: opacity / 100 });
  };

  const handleDuplicate = () => {
    // Create a copy with offset position
    const newImage = {
      ...image,
      id: Date.now().toString(),
      x: image.x + 20,
      y: image.y + 20
    };
    
    // This would need to be handled at a higher level
    console.log('Duplicate image:', newImage);
  };

  const handleLayerUp = () => {
    onUpdate({ zIndex: (image.zIndex || 0) + 1 });
  };

  const handleLayerDown = () => {
    onUpdate({ zIndex: Math.max(0, (image.zIndex || 0) - 1) });
  };

  const handleRemoveBackground = async () => {
    if (!image.src || isRemovingBackground) return;
    
    setIsRemovingBackground(true);
    try {
      // Convert image URL to blob
      const response = await fetch(image.src);
      const blob = await response.blob();
      
      // Load as image element
      const imageElement = await loadImage(blob);
      
      // Remove background
      const resultBlob = await removeBackground(imageElement);
      
      // Convert to URL
      const newImageUrl = URL.createObjectURL(resultBlob);
      
      // Update image
      onUpdate({ src: newImageUrl });
    } catch (error) {
      console.error('Failed to remove background:', error);
      alert('Échec de la suppression de l\'arrière-plan. Veuillez réessayer.');
    } finally {
      setIsRemovingBackground(false);
    }
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
          left: Math.min(position.x, window.innerWidth - 450),
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
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 150;
                  handleSizeChange('width', value);
                }}
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
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 150;
                  handleSizeChange('height', value);
                }}
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
            {/* Background Removal */}
            <button
              onClick={handleRemoveBackground}
              disabled={isRemovingBackground}
              className="p-2 rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
              title="Supprimer l'arrière-plan"
            >
              {isRemovingBackground ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Scissors className="w-4 h-4" />
              )}
            </button>

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
