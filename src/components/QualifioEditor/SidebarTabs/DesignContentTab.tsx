
import React from 'react';
import { Upload, Type, Image } from 'lucide-react';
import type { EditorConfig, CustomText } from '../QualifioEditorLayout';

interface DesignContentTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const DesignContentTab: React.FC<DesignContentTabProps> = ({
  config,
  onConfigUpdate
}) => {
  const addCustomText = () => {
    const newText: CustomText = {
      id: `text-${Date.now()}`,
      content: 'Nouveau texte',
      x: 100,
      y: 100,
      fontSize: 18,
      fontFamily: 'Arial, sans-serif',
      color: '#000000',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'left',
      listType: 'none',
      hasEffect: false,
      isAnimated: false,
      backgroundColor: 'transparent',
      width: 200,
      height: 50
    };

    const updatedTexts = [...(config.customTexts || []), newText];
    onConfigUpdate({ customTexts: updatedTexts });
  };

  const addCustomImage = () => {
    const newImage = {
      id: `image-${Date.now()}`,
      src: '/placeholder-image.jpg',
      x: 150,
      y: 150,
      width: 200,
      height: 150,
      alt: 'Image personnalisée'
    };

    const updatedImages = [...(config.design?.customImages || []), newImage];
    onConfigUpdate({ 
      design: { 
        ...config.design, 
        customImages: updatedImages 
      } 
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Design & Contenu</h3>
      
      {/* Background */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Arrière-plan</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Couleur de fond</label>
            <input
              type="color"
              value={config.backgroundColor || '#ffffff'}
              onChange={(e) => onConfigUpdate({ backgroundColor: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Image de fond</label>
            <button className="w-full p-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-brand-primary hover:text-brand-primary transition-colors">
              <Upload className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Télécharger une image</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Elements */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Ajouter des éléments</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={addCustomText}
            className="flex items-center gap-2 p-3 border border-gray-300 rounded-md hover:bg-gray-50 hover:border-brand-primary transition-colors"
          >
            <Type className="w-4 h-4" />
            <span className="text-sm">Texte</span>
          </button>
          <button
            onClick={addCustomImage}
            className="flex items-center gap-2 p-3 border border-gray-300 rounded-md hover:bg-gray-50 hover:border-brand-primary transition-colors"
          >
            <Image className="w-4 h-4" />
            <span className="text-sm">Image</span>
          </button>
        </div>
      </div>

      {/* Custom Texts List */}
      {config.customTexts && config.customTexts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Textes personnalisés</h4>
          <div className="space-y-2">
            {config.customTexts.map((text) => (
              <div key={text.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm truncate flex-1">{text.content}</span>
                <button
                  onClick={() => {
                    const updatedTexts = config.customTexts?.filter(t => t.id !== text.id) || [];
                    onConfigUpdate({ customTexts: updatedTexts });
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Colors */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Couleurs</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Bouton participer</label>
            <input
              type="color"
              value={config.participateButtonColor || '#ff6b35'}
              onChange={(e) => onConfigUpdate({ participateButtonColor: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Texte du bouton</label>
            <input
              type="color"
              value={config.participateButtonTextColor || '#ffffff'}
              onChange={(e) => onConfigUpdate({ participateButtonTextColor: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignContentTab;
