import React from 'react';
import { Upload, Plus } from 'lucide-react';

interface BrandPanelProps {
  onAddElement: (element: any) => void;
}

const BrandPanel: React.FC<BrandPanelProps> = ({ onAddElement }) => {
  const brandColors = [
    '#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F97316',
    '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#6B7280'
  ];

  const fonts = [
    { name: 'Montserrat', description: 'Titre principal' },
    { name: 'Open Sans', description: 'Corps de texte' },
  ];

  const addColorElement = (color: string) => {
    onAddElement({
      id: `color-${Date.now()}`,
      type: 'shape',
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      backgroundColor: color,
      zIndex: 10
    });
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <button className="w-full p-4 bg-[#44444d] text-white rounded-lg hover:bg-[#44444d] transition-colors flex items-center justify-center">
          <Plus className="w-5 h-5 mr-2" />
          Créer un kit de marque
        </button>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">COULEURS DE MARQUE</h3>
        <div className="grid grid-cols-5 gap-2">
          {brandColors.map((color, index) => (
            <button
              key={index}
              onClick={() => addColorElement(color)}
              className="w-10 h-10 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        <button className="mt-2 text-sm text-[hsl(var(--primary))] hover:text-[#5a5a63]">
          + Ajouter une couleur
        </button>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">POLICES DE MARQUE</h3>
        <div className="space-y-2">
          {fonts.map((font, index) => (
            <div key={index} className="p-3 border border-gray-200 rounded-lg">
              <div className="font-semibold text-sm" style={{ fontFamily: font.name }}>
                {font.name}
              </div>
              <div className="text-xs text-gray-500">{font.description}</div>
            </div>
          ))}
        </div>
        <button className="mt-2 text-sm text-[hsl(var(--primary))] hover:text-[#5a5a63]">
          + Ajouter une police
        </button>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">LOGOS</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <div className="text-sm text-gray-500 mb-2">Télécharger votre logo</div>
          <button className="text-xs text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]">
            Parcourir les fichiers
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">ASSETS DE MARQUE</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="aspect-square bg-gray-100 rounded-lg border border-gray-200"></div>
          <div className="aspect-square bg-gray-100 rounded-lg border border-gray-200"></div>
        </div>
        <button className="mt-2 text-sm text-[hsl(var(--primary))] hover:text-[#5a5a63]">
          + Ajouter des assets
        </button>
      </div>
    </div>
  );
};

export default BrandPanel;