
import React from 'react';
import { Trash2, Target, RotateCw, Lock, Unlock } from 'lucide-react';

interface ImageElementControlsProps {
  aspectRatioLocked: boolean;
  onCenter: () => void;
  onToggleAspectRatio: () => void;
  onRotate: () => void;
  onDelete: () => void;
}

const ImageElementControls: React.FC<ImageElementControlsProps> = ({
  aspectRatioLocked,
  onCenter,
  onToggleAspectRatio,
  onRotate,
  onDelete
}) => {
  return (
    <div className="absolute -top-10 left-0 flex space-x-1 bg-white rounded shadow-lg px-2 py-1 border">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCenter();
        }}
        className="p-1 hover:bg-blue-100 text-blue-600 rounded"
        title="Centrer l'élément"
      >
        <Target className="w-3 h-3" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleAspectRatio();
        }}
        className={`p-1 rounded ${
          aspectRatioLocked 
            ? 'bg-green-100 text-green-600' 
            : 'hover:bg-gray-100 text-gray-600'
        }`}
        title={aspectRatioLocked ? 'Proportions verrouillées' : 'Proportions libres'}
      >
        {aspectRatioLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRotate();
        }}
        className="p-1 hover:bg-purple-100 text-purple-600 rounded"
        title="Faire tourner (+15°)"
      >
        <RotateCw className="w-3 h-3" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-1 hover:bg-red-100 text-red-600 rounded"
        title="Supprimer"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
};

export default ImageElementControls;
