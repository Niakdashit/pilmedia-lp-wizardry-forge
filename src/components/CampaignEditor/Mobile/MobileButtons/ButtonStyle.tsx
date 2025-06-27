
import React from 'react';

interface ButtonStyleProps {
  buttonColor: string;
  buttonTextColor: string;
  buttonShape: string;
  buttonSize: string;
  buttonShadow: string;
  onButtonColorChange: (color: string) => void;
  onButtonTextColorChange: (color: string) => void;
  onButtonShapeChange: (shape: string) => void;
  onButtonSizeChange: (size: string) => void;
  onButtonShadowChange: (shadow: string) => void;
}

const ButtonStyle: React.FC<ButtonStyleProps> = ({
  buttonColor,
  buttonTextColor,
  buttonShape,
  buttonSize,
  buttonShadow,
  onButtonColorChange,
  onButtonTextColorChange,
  onButtonShapeChange,
  onButtonSizeChange,
  onButtonShadowChange
}) => {
  const shapes = [
    { value: 'rounded-md', label: 'Arrondi léger' },
    { value: 'rounded-lg', label: 'Arrondi moyen' },
    { value: 'rounded-full', label: 'Arrondi complet' }
  ];

  const sizes = [
    { value: 'small', label: 'Petit', classes: 'px-4 py-2 text-sm' },
    { value: 'medium', label: 'Moyen', classes: 'px-6 py-3 text-base' },
    { value: 'large', label: 'Grand', classes: 'px-8 py-4 text-lg' }
  ];

  const shadows = [
    { value: 'none', label: 'Aucune' },
    { value: 'shadow-md', label: 'Légère' },
    { value: 'shadow-lg', label: 'Forte' }
  ];

  return (
    <div className="space-y-6">
      {/* Colors */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Style du bouton
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Couleur</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={buttonColor || '#841b60'}
                onChange={(e) => onButtonColorChange(e.target.value)}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={buttonColor || '#841b60'}
                onChange={(e) => onButtonColorChange(e.target.value)}
                className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#841b60]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Couleur du texte</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={buttonTextColor || '#ffffff'}
                onChange={(e) => onButtonTextColorChange(e.target.value)}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={buttonTextColor || '#ffffff'}
                onChange={(e) => onButtonTextColorChange(e.target.value)}
                className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#841b60]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Shape */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Forme du bouton
        </label>
        <div className="grid grid-cols-3 gap-3">
          {shapes.map((shape) => (
            <button
              key={shape.value}
              onClick={() => onButtonShapeChange(shape.value)}
              className={`p-3 border-2 rounded-lg text-center transition-colors ${
                buttonShape === shape.value
                  ? 'border-[#841b60] bg-[#f9f0f5] text-[#841b60]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">{shape.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Taille du bouton
        </label>
        <div className="grid grid-cols-3 gap-3">
          {sizes.map((size) => (
            <button
              key={size.value}
              onClick={() => onButtonSizeChange(size.value)}
              className={`p-3 border-2 rounded-lg text-center transition-colors ${
                buttonSize === size.value
                  ? 'border-[#841b60] bg-[#f9f0f5] text-[#841b60]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">{size.label}</div>
              <div className="text-xs text-gray-500 mt-1">{size.classes}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Shadow */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Ombre du bouton
        </label>
        <div className="grid grid-cols-3 gap-3">
          {shadows.map((shadow) => (
            <button
              key={shadow.value}
              onClick={() => onButtonShadowChange(shadow.value)}
              className={`p-3 border-2 rounded-lg text-center transition-colors ${
                buttonShadow === shadow.value
                  ? 'border-[#841b60] bg-[#f9f0f5] text-[#841b60]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">{shadow.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ButtonStyle;
