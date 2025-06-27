
import React from 'react';

interface ColorControlsProps {
  borderColor: string;
  pointerColor: string;
  onBorderColorChange: (color: string) => void;
  onPointerColorChange: (color: string) => void;
}

const ColorControls: React.FC<ColorControlsProps> = ({
  borderColor,
  pointerColor,
  onBorderColorChange,
  onPointerColorChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Couleur de la bordure mobile
        </label>
        <input
          type="color"
          value={borderColor}
          onChange={e => onBorderColorChange(e.target.value)}
          className="w-full h-10 rounded border"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Couleur du curseur mobile
        </label>
        <input
          type="color"
          value={pointerColor}
          onChange={e => onPointerColorChange(e.target.value)}
          className="w-full h-10 rounded border"
        />
      </div>
    </div>
  );
};

export default ColorControls;
