
import React, { useState } from 'react';
import { Trash2, RotateCw, Copy, Layers, Eye, Scissors, Loader2 } from 'lucide-react';
import { removeBackground, loadImage } from './utils/backgroundRemoval';

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
  const [backgroundRemovalProgress, setBackgroundRemovalProgress] = useState('');

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
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

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const newImage = {
      ...image,
      id: Date.now().toString(),
      x: image.x + 20,
      y: image.y + 20
    };
    console.log('Duplicate image:', newImage);
  };

  const handleLayerUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onUpdate({ zIndex: (image.zIndex || 0) + 1 });
  };

  const handleLayerDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onUpdate({ zIndex: Math.max(0, (image.zIndex || 0) - 1) });
  };

  const handleRemoveBackground = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!image.src || isRemovingBackground) return;
    
    setIsRemovingBackground(true);
    setBackgroundRemovalProgress('Préparation...');
    
    try {
      setBackgroundRemovalProgress('Chargement de l\'image...');
      const response = await fetch(image.src);
      const blob = await response.blob();
      
      setBackgroundRemovalProgress('Analyse de l\'image...');
      const imageElement = await loadImage(blob);
      
      setBackgroundRemovalProgress('Suppression de l\'arrière-plan...');
      const resultBlob = await removeBackground(imageElement);
      
      setBackgroundRemovalProgress('Finalisation...');
      const newImageUrl = URL.createObjectURL(resultBlob);
      
      onUpdate({ src: newImageUrl });
      setBackgroundRemovalProgress('Terminé !');
      
      setTimeout(() => {
        setBackgroundRemovalProgress('');
      }, 1000);
      
    } catch (error) {
      console.error('Failed to remove background:', error);
      setBackgroundRemovalProgress('');
      
      const errorMessage = error instanceof Error 
        ? `Erreur: ${error.message}` 
        : 'Échec de la suppression de l\'arrière-plan. Vérifiez que l\'image est valide et réessayez.';
      
      alert(errorMessage);
    } finally {
      setIsRemovingBackground(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Delete button clicked');
    onDelete();
  };

  const handleToolbarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <>
      {/* Overlay to close toolbar on click outside */}
      <div 
        className="fixed inset-0"
        style={{ zIndex: 998 }}
        onClick={onClose}
      />
      
      {/* Main Toolbar */}
      <div
        className="fixed bg-gray-900 text-white rounded-lg shadow-xl border border-gray-700"
        style={{
          left: Math.min(position.x, window.innerWidth - 480),
          top: Math.max(10, position.y),
          zIndex: 999
        }}
        onClick={handleToolbarClick}
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
                onClick={(e) => e.stopPropagation()}
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
                onClick={(e) => e.stopPropagation()}
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
              onClick={(e) => e.stopPropagation()}
              className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-xs text-gray-300 w-8">{Math.round((image.opacity || 1) * 100)}%</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center px-2">
            {/* Background Removal avec indicateur de progression */}
            <div className="relative">
              <button
                onClick={handleRemoveBackground}
                disabled={isRemovingBackground}
                className="p-2 rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Supprimer l'arrière-plan (IA)"
              >
                {isRemovingBackground ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Scissors className="w-4 h-4" />
                )}
              </button>
              
              {backgroundRemovalProgress && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  {backgroundRemovalProgress}
                </div>
              )}
            </div>

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
              title="Faire pivoter (90°)"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Layers */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAdvanced(!showAdvanced);
                }}
                className="p-2 rounded hover:bg-gray-700 transition-colors"
                title="Gestion des calques"
              >
                <Layers className="w-4 h-4" />
              </button>
              
              {showAdvanced && (
                <div 
                  className="absolute top-full right-0 mt-1 bg-gray-800 rounded-lg shadow-lg border border-gray-600 p-2 min-w-32"
                  style={{ zIndex: 1000 }}
                  onClick={(e) => e.stopPropagation()}
                >
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
              onClick={handleDelete}
              className="p-2 rounded hover:bg-red-600 text-red-400 transition-colors ml-1"
              title="Supprimer l'image"
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
