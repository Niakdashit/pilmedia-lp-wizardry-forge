import React, { useState } from 'react';
import { Eye, EyeOff, Trash2, Lock, Unlock, Copy, Type, Image as ImageIcon, Settings } from 'lucide-react';
import type { EditorConfig, CustomText } from '../GameEditorLayout';
import TextElementEditor from '../TextElementEditor';

interface LayersTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

interface LayerElement {
  id: string;
  type: 'text' | 'image' | 'game';
  name: string;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  data?: any;
}

const LayersTab: React.FC<LayersTabProps> = ({
  config,
  onConfigUpdate
}) => {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  // Construire la liste des éléments/couches
  const buildLayersList = (): LayerElement[] => {
    const layers: LayerElement[] = [];

    // Ajouter les textes personnalisés
    config.customTexts?.forEach((text, index) => {
      layers.push({
        id: text.id,
        type: 'text',
        name: text.content.length > 20 ? text.content.substring(0, 20) + '...' : text.content,
        visible: true,
        locked: false,
        zIndex: 100 + index,
        data: text
      });
    });

    // Ajouter les images personnalisées
    config.design?.customImages?.forEach((image: any, index: number) => {
      layers.push({
        id: image.id,
        type: 'image',
        name: `Image ${index + 1}`,
        visible: true,
        locked: false,
        zIndex: 50 + index,
        data: image
      });
    });

    // Ajouter l'élément de jeu
    layers.push({
      id: 'game-element',
      type: 'game',
      name: `Jeu ${config.gameType}`,
      visible: true,
      locked: false,
      zIndex: 200,
      data: { gameType: config.gameType }
    });

    // Trier par zIndex décroissant (plus haut en premier)
    return layers.sort((a, b) => b.zIndex - a.zIndex);
  };

  const layers = buildLayersList();

  const updateElementProperty = (elementId: string, property: keyof LayerElement, value: any) => {
    const element = layers.find(l => l.id === elementId);
    if (!element) return;

    if (element.type === 'text') {
      const updatedTexts = config.customTexts?.map(text => {
        if (text.id === elementId) {
          if (property === 'visible') {
            // Ajouter une propriété visible aux textes personnalisés
            return { ...text, visible: value };
          }
        }
        return text;
      });
      onConfigUpdate({ customTexts: updatedTexts });
    } else if (element.type === 'image') {
      const updatedImages = config.design?.customImages?.map((image: any) => {
        if (image.id === elementId) {
          if (property === 'visible') {
            return { ...image, visible: value };
          }
        }
        return image;
      });
      onConfigUpdate({
        design: {
          ...config.design,
          customImages: updatedImages
        }
      });
    }
  };

  const duplicateElement = (elementId: string) => {
    const element = layers.find(l => l.id === elementId);
    if (!element) return;

    if (element.type === 'text') {
      const originalText = config.customTexts?.find(t => t.id === elementId);
      if (originalText) {
        const newText: CustomText = {
          ...originalText,
          id: Date.now().toString(),
          content: originalText.content + ' - Copie',
          x: originalText.x + 20,
          y: originalText.y + 20
        };
        onConfigUpdate({
          customTexts: [...(config.customTexts || []), newText]
        });
      }
    } else if (element.type === 'image') {
      const originalImage = config.design?.customImages?.find((img: any) => img.id === elementId);
      if (originalImage) {
        const newImage = {
          ...originalImage,
          id: Date.now().toString(),
          x: originalImage.x + 20,
          y: originalImage.y + 20
        };
        onConfigUpdate({
          design: {
            ...config.design,
            customImages: [...(config.design?.customImages || []), newImage]
          }
        });
      }
    }
  };

  const deleteElement = (elementId: string) => {
    const element = layers.find(l => l.id === elementId);
    if (!element) return;

    if (element.type === 'text') {
      onConfigUpdate({
        customTexts: config.customTexts?.filter(text => text.id !== elementId)
      });
    } else if (element.type === 'image') {
      onConfigUpdate({
        design: {
          ...config.design,
          customImages: config.design?.customImages?.filter((img: any) => img.id !== elementId)
        }
      });
    }
  };

  const addNewTextElement = () => {
    const newText: CustomText = {
      id: Date.now().toString(),
      content: 'NOUVEAU TEXTE',
      x: 50,
      y: 50,
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#000000',
      fontWeight: 'bold',
      fontStyle: 'normal',
      textDecoration: 'none',
      width: 200,
      height: 50
    };
    
    onConfigUpdate({
      customTexts: [...(config.customTexts || []), newText]
    });
  };

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'text': return Type;
      case 'image': return ImageIcon;
      case 'game': return Settings;
      default: return Settings;
    }
  };

  return (
    <div className="space-y-6 my-[30px]">
      <h3 className="section-title text-center">Gestion des éléments</h3>
      
      {/* Boutons d'ajout */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Ajouter des éléments</h4>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={addNewTextElement}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors text-sm font-medium"
          >
            <Type className="w-4 h-4" />
            Ajouter du texte
          </button>
          <button
            onClick={() => {
              // Trigger image upload
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const imageUrl = event.target?.result as string;
                    const newImage = {
                      id: Date.now().toString(),
                      src: imageUrl,
                      x: 50,
                      y: 50,
                      width: 150,
                      height: 150,
                      rotation: 0
                    };
                    onConfigUpdate({
                      design: {
                        ...config.design,
                        customImages: [...(config.design?.customImages || []), newImage]
                      }
                    });
                  };
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            <ImageIcon className="w-4 h-4" />
            Ajouter une image
          </button>
        </div>
      </div>

      {/* Liste des éléments/couches */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Éléments ({layers.length})</h4>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {layers.map((layer) => {
            const Icon = getElementIcon(layer.type);
            const isSelected = selectedElement === layer.id;
            
            return (
              <div
                key={layer.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer group ${
                  isSelected 
                    ? 'bg-brand-primary/10 border border-brand-primary/30' 
                    : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                }`}
                onClick={() => setSelectedElement(isSelected ? null : layer.id)}
              >
                {/* Icon et nom */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${
                    isSelected ? 'text-brand-primary' : 'text-gray-600'
                  }`} />
                  <span className={`text-sm font-medium truncate ${
                    isSelected ? 'text-brand-primary' : 'text-gray-900'
                  }`}>
                    {layer.name}
                  </span>
                </div>

                {/* Contrôles */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Visibilité */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateElementProperty(layer.id, 'visible', !layer.visible);
                    }}
                    className="p-1 hover:bg-white rounded transition-colors"
                    title={layer.visible ? 'Masquer' : 'Afficher'}
                  >
                    {layer.visible ? (
                      <Eye className="w-3 h-3 text-gray-600" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-gray-400" />
                    )}
                  </button>

                  {/* Verrouillage */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateElementProperty(layer.id, 'locked', !layer.locked);
                    }}
                    className="p-1 hover:bg-white rounded transition-colors"
                    title={layer.locked ? 'Déverrouiller' : 'Verrouiller'}
                  >
                    {layer.locked ? (
                      <Lock className="w-3 h-3 text-gray-600" />
                    ) : (
                      <Unlock className="w-3 h-3 text-gray-400" />
                    )}
                  </button>

                  {/* Dupliquer */}
                  {layer.type !== 'game' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateElement(layer.id);
                      }}
                      className="p-1 hover:bg-white rounded transition-colors"
                      title="Dupliquer"
                    >
                      <Copy className="w-3 h-3 text-gray-600" />
                    </button>
                  )}

                  {/* Supprimer */}
                  {layer.type !== 'game' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteElement(layer.id);
                      }}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {layers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Type className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Aucun élément ajouté</p>
            <p className="text-xs text-gray-400 mt-1">Utilisez les boutons ci-dessus pour ajouter des éléments</p>
          </div>
        )}
      </div>

      {/* Éditeur d'élément sélectionné */}
      {selectedElement && (
        <div className="mx-[30px]">
          {(() => {
            const element = layers.find(l => l.id === selectedElement);
            if (!element) return null;

            if (element.type === 'text') {
              const textData = element.data as CustomText;
              return (
                <TextElementEditor
                  text={textData}
                  onUpdate={(updates) => {
                    const updatedTexts = config.customTexts?.map(text => 
                      text.id === selectedElement 
                        ? { ...text, ...updates }
                        : text
                    );
                    onConfigUpdate({ customTexts: updatedTexts });
                  }}
                  onDelete={() => deleteElement(selectedElement)}
                  onDuplicate={() => duplicateElement(selectedElement)}
                />
              );
            }

            if (element.type === 'image') {
              const imageData = element.data;
              return (
                <div className="premium-card">
                  <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Propriétés de l'image</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-group-premium">
                        <label>Position X</label>
                        <input
                          type="number"
                          value={imageData.x}
                          onChange={(e) => {
                            const updatedImages = config.design?.customImages?.map((image: any) => 
                              image.id === selectedElement 
                                ? { ...image, x: parseInt(e.target.value) || 0 }
                                : image
                            );
                            onConfigUpdate({
                              design: {
                                ...config.design,
                                customImages: updatedImages
                              }
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        />
                      </div>
                      <div className="form-group-premium">
                        <label>Position Y</label>
                        <input
                          type="number"
                          value={imageData.y}
                          onChange={(e) => {
                            const updatedImages = config.design?.customImages?.map((image: any) => 
                              image.id === selectedElement 
                                ? { ...image, y: parseInt(e.target.value) || 0 }
                                : image
                            );
                            onConfigUpdate({
                              design: {
                                ...config.design,
                                customImages: updatedImages
                              }
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-group-premium">
                        <label>Largeur</label>
                        <input
                          type="number"
                          value={imageData.width}
                          onChange={(e) => {
                            const updatedImages = config.design?.customImages?.map((image: any) => 
                              image.id === selectedElement 
                                ? { ...image, width: parseInt(e.target.value) || 150 }
                                : image
                            );
                            onConfigUpdate({
                              design: {
                                ...config.design,
                                customImages: updatedImages
                              }
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                          min="10"
                        />
                      </div>
                      <div className="form-group-premium">
                        <label>Hauteur</label>
                        <input
                          type="number"
                          value={imageData.height}
                          onChange={(e) => {
                            const updatedImages = config.design?.customImages?.map((image: any) => 
                              image.id === selectedElement 
                                ? { ...image, height: parseInt(e.target.value) || 150 }
                                : image
                            );
                            onConfigUpdate({
                              design: {
                                ...config.design,
                                customImages: updatedImages
                              }
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                          min="10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return <p className="text-sm text-gray-500">Propriétés non disponibles pour ce type d'élément</p>;
          })()}
        </div>
      )}
    </div>
  );
};

export default LayersTab;