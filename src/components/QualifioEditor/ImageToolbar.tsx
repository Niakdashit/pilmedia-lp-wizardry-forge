import React from 'react';
import { Trash2, RotateCw } from 'lucide-react';

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
  const handleRotate = () => {
    const newRotation = (image.rotation || 0) + 90;
    onUpdate({ rotation: newRotation >= 360 ? 0 : newRotation });
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    onUpdate({ [dimension]: Math.max(20, value) });
  };

  return (
    <>
      {/* Overlay to close toolbar on click outside */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Toolbar */}
      <div
        className="fixed z-50 bg-gray-900 text-white rounded-lg shadow-lg p-2 flex items-center gap-1"
        style={{
          left: Math.min(position.x, window.innerWidth - 300),
          top: Math.max(10, position.y - 60),
        }}
      >
        {/* Width */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-300">L:</span>
          <input
            type="number"
            value={image.width || 100}
            onChange={(e) => handleSizeChange('width', parseInt(e.target.value) || 100)}
            className="bg-gray-800 text-white text-sm px-2 py-1 rounded border-none outline-none w-16"
            min="20"
            max="500"
          />
        </div>

        {/* Height */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-300">H:</span>
          <input
            type="number"
            value={image.height || 100}
            onChange={(e) => handleSizeChange('height', parseInt(e.target.value) || 100)}
            className="bg-gray-800 text-white text-sm px-2 py-1 rounded border-none outline-none w-16"
            min="20"
            max="500"
          />
        </div>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Rotate */}
        <button
          onClick={handleRotate}
          className="p-1 rounded hover:bg-gray-700"
          title="Faire pivoter"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Delete */}
        <button
          onClick={onDelete}
          className="p-1 rounded hover:bg-red-600 text-red-400"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </>
  );
};

export default ImageToolbar;