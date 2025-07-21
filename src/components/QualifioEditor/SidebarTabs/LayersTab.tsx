
import React from 'react';
import { Eye, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import type { EditorConfig } from '../QualifioEditorLayout';

interface LayersTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const LayersTab: React.FC<LayersTabProps> = ({
  config,
  onConfigUpdate
}) => {
  const moveTextLayer = (textId: string, direction: 'up' | 'down') => {
    if (!config.customTexts) return;
    
    const currentIndex = config.customTexts.findIndex(t => t.id === textId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= config.customTexts.length) return;
    
    const updatedTexts = [...config.customTexts];
    [updatedTexts[currentIndex], updatedTexts[newIndex]] = [updatedTexts[newIndex], updatedTexts[currentIndex]];
    
    onConfigUpdate({ customTexts: updatedTexts });
  };

  const moveImageLayer = (imageId: string, direction: 'up' | 'down') => {
    if (!config.design?.customImages) return;
    
    const currentIndex = config.design.customImages.findIndex(img => img.id === imageId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= config.design.customImages.length) return;
    
    const updatedImages = [...config.design.customImages];
    [updatedImages[currentIndex], updatedImages[newIndex]] = [updatedImages[newIndex], updatedImages[currentIndex]];
    
    onConfigUpdate({ 
      design: { 
        ...config.design, 
        customImages: updatedImages 
      } 
    });
  };

  const deleteText = (textId: string) => {
    const updatedTexts = config.customTexts?.filter(t => t.id !== textId) || [];
    onConfigUpdate({ customTexts: updatedTexts });
  };

  const deleteImage = (imageId: string) => {
    const updatedImages = config.design?.customImages?.filter(img => img.id !== imageId) || [];
    onConfigUpdate({ 
      design: { 
        ...config.design, 
        customImages: updatedImages 
      } 
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Gestion des calques</h3>
      
      {/* Background Layer */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Calques de base</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
            <span className="text-sm">Arrière-plan</span>
            <Eye className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
            <span className="text-sm">Zone de jeu</span>
            <Eye className="w-4 h-4 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Custom Images */}
      {config.design?.customImages && config.design.customImages.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Images personnalisées</h4>
          <div className="space-y-2">
            {config.design.customImages.map((image, index) => (
              <div key={image.id} className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
                <span className="text-sm truncate flex-1">Image {index + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveImageLayer(image.id, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveImageLayer(image.id, 'down')}
                    disabled={index === (config.design?.customImages?.length || 0) - 1}
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => deleteImage(image.id)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <Eye className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Texts */}
      {config.customTexts && config.customTexts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Textes personnalisés</h4>
          <div className="space-y-2">
            {config.customTexts.map((text, index) => (
              <div key={text.id} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                <span className="text-sm truncate flex-1">{text.content}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveTextLayer(text.id, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveTextLayer(text.id, 'down')}
                    disabled={index === (config.customTexts?.length || 0) - 1}
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => deleteText(text.id)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <Eye className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!config.customTexts || config.customTexts.length === 0) && 
       (!config.design?.customImages || config.design.customImages.length === 0) && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">Aucun élément personnalisé ajouté</p>
          <p className="text-sm text-gray-400 mt-1">Utilisez l'onglet Design pour ajouter des éléments</p>
        </div>
      )}
    </div>
  );
};

export default LayersTab;
