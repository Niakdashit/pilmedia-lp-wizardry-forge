import React from 'react';
import { Palette, Square, RotateCw, Move, Trash2 } from 'lucide-react';

interface ShapePanelProps {
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
  onElementDelete?: () => void;
  selectedDevice?: 'desktop' | 'tablet' | 'mobile';
}

const ShapePanel: React.FC<ShapePanelProps> = ({ 
  selectedElement, 
  onElementUpdate, 
  onElementDelete,
  selectedDevice = 'desktop' 
}) => {
  if (!selectedElement || selectedElement.type !== 'shape') {
    return null;
  }

  const handleColorChange = (color: string) => {
    if (onElementUpdate) {
      onElementUpdate({
        backgroundColor: color,
        style: {
          ...selectedElement.style,
          backgroundColor: color
        }
      });
    }
  };

  const handleOpacityChange = (opacity: number) => {
    if (onElementUpdate) {
      onElementUpdate({
        opacity: opacity / 100,
        style: {
          ...selectedElement.style,
          opacity: opacity / 100
        }
      });
    }
  };

  const handleBorderChange = (borderWidth: number, borderColor: string) => {
    if (onElementUpdate) {
      onElementUpdate({
        borderWidth,
        borderColor,
        style: {
          ...selectedElement.style,
          border: `${borderWidth}px solid ${borderColor}`
        }
      });
    }
  };

  const predefinedColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D2B4DE',
    '#000000', '#FFFFFF', '#808080', '#FF0000', '#00FF00',
    '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'
  ];

  const currentOpacity = Math.round((selectedElement.opacity || 1) * 100);
  const currentBorderWidth = selectedElement.borderWidth || 0;
  const currentBorderColor = selectedElement.borderColor || '#000000';

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
        <Square className="w-4 h-4 text-gray-600" />
        <span className="font-medium text-gray-800">Propriétés de la forme</span>
      </div>

      {/* Couleur de remplissage */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Palette className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Couleur de remplissage</span>
        </div>
        
        <div className="grid grid-cols-5 gap-2">
          {predefinedColors.map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              className={`w-8 h-8 rounded border-2 transition-all ${
                (selectedElement.backgroundColor || selectedElement.style?.backgroundColor) === color
                  ? 'border-blue-500 scale-110'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Sélecteur de couleur personnalisé */}
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={selectedElement.backgroundColor || selectedElement.style?.backgroundColor || '#3B82F6'}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
          />
          <span className="text-xs text-gray-500">Couleur personnalisée</span>
        </div>
      </div>

      {/* Opacité */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Opacité</span>
          <span className="text-xs text-gray-500">{currentOpacity}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={currentOpacity}
          onChange={(e) => handleOpacityChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      {/* Bordure */}
      <div className="space-y-3">
        <span className="text-sm font-medium text-gray-700">Bordure</span>
        
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">Épaisseur</label>
            <input
              type="range"
              min="0"
              max="20"
              value={currentBorderWidth}
              onChange={(e) => handleBorderChange(Number(e.target.value), currentBorderColor)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-xs text-gray-500">{currentBorderWidth}px</span>
          </div>
          
          <div>
            <label className="text-xs text-gray-500 block mb-1">Couleur</label>
            <input
              type="color"
              value={currentBorderColor}
              onChange={(e) => handleBorderChange(currentBorderWidth, e.target.value)}
              className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <span className="text-sm font-medium text-gray-700">Actions</span>
        
        <div className="flex space-x-2">
          <button
            onClick={() => {
              if (onElementUpdate) {
                onElementUpdate({
                  rotation: (selectedElement.rotation || 0) + 90
                });
              }
            }}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
          >
            <RotateCw className="w-4 h-4" />
            <span>Rotation 90°</span>
          </button>
          
          <button
            onClick={() => {
              if (onElementUpdate) {
                onElementUpdate({
                  x: (selectedElement.x || 0) + 10,
                  y: (selectedElement.y || 0) + 10
                });
              }
            }}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
          >
            <Move className="w-4 h-4" />
            <span>Décaler</span>
          </button>
        </div>

        {onElementDelete && (
          <button
            onClick={onElementDelete}
            className="flex items-center space-x-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-colors w-full justify-center"
          >
            <Trash2 className="w-4 h-4" />
            <span>Supprimer la forme</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ShapePanel;
