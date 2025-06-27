import React from 'react';
import { Bold, Italic, Underline, Plus, Trash2, Image } from 'lucide-react';
import ImageUpload from '../common/ImageUpload';

interface ModernDesignTabProps {
  campaign: any;
  setCampaign: (campaign: any) => void;
}

const ModernDesignTab: React.FC<ModernDesignTabProps> = ({
  campaign,
  setCampaign
}) => {
  const design = campaign.design || {};
  const customTexts = design.customTexts || [];
  const customImages = design.customImages || [];

  const getRadiusValue = () => {
    const raw = design.borderRadius || '8px';
    if (typeof raw === 'number') return raw;
    if (raw.includes('rem')) {
      const rem = parseFloat(raw);
      return isNaN(rem) ? 8 : rem * 16;
    }
    const num = parseInt(raw, 10);
    return isNaN(num) ? 8 : num;
  };

  const handleBackgroundImageChange = (imageUrl: string) => {
    setCampaign({
      ...campaign,
      design: {
        ...design,
        backgroundImage: imageUrl
      }
    });
  };

  const getInitialPosition = (type: 'text' | 'image') => {
    const basePosition = {
      x: 100,
      y: 100
    };
    const offset = type === 'text' ? customTexts.length * 20 : customImages.length * 20;
    return {
      x: basePosition.x + offset,
      y: basePosition.y + offset
    };
  };

  const addCustomText = () => {
    const position = getInitialPosition('text');
    const newText = {
      id: Date.now(),
      enabled: true,
      text: `Texte personnalisé ${customTexts.length + 1}`,
      x: position.x,
      y: position.y,
      size: 'base',
      color: '#000000',
      fontFamily: 'Inter, sans-serif',
      bold: false,
      italic: false,
      underline: false,
      showFrame: false,
      frameColor: '#ffffff',
      frameBorderColor: '#e5e7eb'
    };
    setCampaign({
      ...campaign,
      design: {
        ...design,
        customTexts: [...customTexts, newText]
      }
    });
  };

  const addCustomImage = () => {
    const position = getInitialPosition('image');
    const newImage = {
      id: Date.now(),
      src: '',
      x: position.x,
      y: position.y,
      width: 100,
      height: 100,
      rotation: 0
    };
    setCampaign({
      ...campaign,
      design: {
        ...design,
        customImages: [...customImages, newImage]
      }
    });
  };

  const removeCustomText = (id: number) => {
    setCampaign({
      ...campaign,
      design: {
        ...design,
        customTexts: customTexts.filter((text: any) => text.id !== id)
      }
    });
  };

  const removeCustomImage = (id: number) => {
    setCampaign({
      ...campaign,
      design: {
        ...design,
        customImages: customImages.filter((img: any) => img.id !== id)
      }
    });
  };

  const handleCustomTextChange = (id: number, field: string, value: any) => {
    setCampaign({
      ...campaign,
      design: {
        ...design,
        customTexts: customTexts.map((text: any) => text.id === id ? {
          ...text,
          [field]: value
        } : text)
      }
    });
  };

  const handleCustomImageChange = (id: number, field: string, value: any) => {
    setCampaign({
      ...campaign,
      design: {
        ...design,
        customImages: customImages.map((img: any) => img.id === id ? {
          ...img,
          [field]: value
        } : img)
      }
    });
  };

  // Options pour les styles de roue
  const wheelStyles = [
    { value: 'default', label: 'Classique', image: null },
    { value: 'casino', label: '🎰 Casino', image: '/wheel-styles/roulette_casino.svg' },
    { value: 'luxury', label: '✨ Luxe', image: '/wheel-styles/roulette_luxury.svg' },
    { value: 'halloween', label: '🎃 Halloween', image: '/wheel-styles/roulette_halloween.svg' },
    { value: 'noel', label: '🎄 Noël', image: '/wheel-styles/roulette_noel.svg' },
    { value: 'promo', label: '🎯 Promo', image: '/wheel-styles/roulette_promo.svg' },
    { value: 'food', label: '🍕 Food', image: '/wheel-styles/roulette_food.svg' },
    { value: 'child', label: '🧸 Enfant', image: '/wheel-styles/roulette_child.svg' },
    { value: 'gaming', label: '🎮 Gaming', image: '/wheel-styles/roulette_gaming.svg' }
  ];

  const fontSizeOptions = [
    { value: 'xs', label: '10px' },
    { value: 'sm', label: '12px' },
    { value: 'base', label: '14px' },
    { value: 'lg', label: '16px' },
    { value: 'xl', label: '18px' },
    { value: '2xl', label: '20px' },
    { value: '3xl', label: '24px' },
    { value: '4xl', label: '28px' },
    { value: '5xl', label: '32px' },
    { value: '6xl', label: '36px' },
    { value: '7xl', label: '48px' },
    { value: '8xl', label: '60px' },
    { value: '9xl', label: '72px' }
  ];

  const fontFamilyOptions = [
    { value: 'Inter, sans-serif', label: 'Inter' },
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Courier New, monospace', label: 'Courier New' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS' },
    { value: 'Palatino, serif', label: 'Palatino' },
    { value: 'Impact, sans-serif', label: 'Impact' }
  ];

  return (
    <div className="space-y-8 px-[5px]">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Design</h2>
      </div>

      {/* Background Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Arrière-plan</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Couleur de fond
          </label>
          <input
            type="color"
            value={design.background || '#f8fafc'}
            onChange={e => setCampaign({
              ...campaign,
              design: {
                ...design,
                background: e.target.value
              }
            })}
            className="w-full h-10 rounded-lg border border-gray-300"
          />
        </div>

        <div>
          <ImageUpload
            value={design.backgroundImage || ''}
            onChange={handleBackgroundImageChange}
            label="Image de fond (Desktop/Tablette)"
          />
        </div>
      </div>

      {/* Wheel Style Selection - Only for wheel campaigns */}
      {campaign.type === 'wheel' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Style de la roue</h3>
          <div className="grid grid-cols-3 gap-3">
            {wheelStyles.map((style) => (
              <button
                key={style.value}
                onClick={() => setCampaign({
                  ...campaign,
                  gameConfig: {
                    ...campaign.gameConfig,
                    wheel: {
                      ...campaign.gameConfig?.wheel,
                      theme: style.value
                    }
                  }
                })}
                className={`p-3 border-2 rounded-lg text-center transition-all ${
                  campaign.gameConfig?.wheel?.theme === style.value
                    ? 'border-[#841b60] bg-[#841b60]/5 text-[#841b60]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {style.image && (
                  <img
                    src={style.image}
                    alt={style.label}
                    className="w-12 h-12 mx-auto mb-2 object-contain"
                  />
                )}
                <div className="text-xs font-medium">{style.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Game Style Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Style du jeu</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Couleur du cadre
          </label>
          <input
            type="color"
            value={design.blockColor || '#ffffff'}
            onChange={e => setCampaign({
              ...campaign,
              design: {
                ...design,
                blockColor: e.target.value
              }
            })}
            className="w-full h-10 rounded-lg border border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Couleur de bordure
          </label>
          <input
            type="color"
            value={design.borderColor || '#e5e7eb'}
            onChange={e => setCampaign({
              ...campaign,
              design: {
                ...design,
                borderColor: e.target.value
              }
            })}
            className="w-full h-10 rounded-lg border border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rayon de bordure
          </label>
          <input
            type="range"
            min="0"
            max="32"
            value={getRadiusValue()}
            onChange={e => setCampaign({
              ...campaign,
              design: {
                ...design,
                borderRadius: `${e.target.value}px`
              }
            })}
            className="w-full"
          />
          <div className="text-xs text-gray-500 text-center">
            {getRadiusValue()}px
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Couleur des boutons
          </label>
          <input
            type="color"
            value={design.buttonColor || design.primaryColor || '#841b60'}
            onChange={e => setCampaign({
              ...campaign,
              design: {
                ...design,
                buttonColor: e.target.value
              }
            })}
            className="w-full h-10 rounded-lg border border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Couleur du texte des boutons
          </label>
          <input
            type="color"
            value={design.buttonTextColor || '#ffffff'}
            onChange={e => setCampaign({
              ...campaign,
              design: {
                ...design,
                buttonTextColor: e.target.value
              }
            })}
            className="w-full h-10 rounded-lg border border-gray-300"
          />
        </div>
      </div>

      {/* Custom Texts Settings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Textes personnalisés</h3>
          <button
            onClick={addCustomText}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </div>

        {customTexts.length === 0 && (
          <p className="text-gray-500 text-sm">Aucun texte personnalisé. Cliquez sur "Ajouter" pour en créer un.</p>
        )}

        {customTexts.map((customText: any, index: number) => (
          <div key={customText.id} className="space-y-4 bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">
                  Texte #{index + 1}
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customText.enabled || false}
                    onChange={e => handleCustomTextChange(customText.id, 'enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <button
                onClick={() => removeCustomText(customText.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Supprimer ce texte"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {customText.enabled && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texte
                  </label>
                  <input
                    type="text"
                    value={customText.text || 'Texte personnalisé'}
                    onChange={e => handleCustomTextChange(customText.id, 'text', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Entrez votre texte"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Police
                  </label>
                  <select
                    value={customText.fontFamily || 'Inter, sans-serif'}
                    onChange={e => handleCustomTextChange(customText.id, 'fontFamily', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {fontFamilyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taille
                  </label>
                  <select
                    value={customText.size || 'base'}
                    onChange={e => handleCustomTextChange(customText.id, 'size', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {fontSizeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Style du texte
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleCustomTextChange(customText.id, 'bold', !customText.bold)}
                      className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-colors ${customText.bold ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'}`}
                      title="Gras"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleCustomTextChange(customText.id, 'italic', !customText.italic)}
                      className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-colors ${customText.italic ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'}`}
                      title="Italique"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleCustomTextChange(customText.id, 'underline', !customText.underline)}
                      className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-colors ${customText.underline ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'}`}
                      title="Souligné"
                    >
                      <Underline className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur du texte
                  </label>
                  <input
                    type="color"
                    value={customText.color || '#000000'}
                    onChange={e => handleCustomTextChange(customText.id, 'color', e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Cadre de fond
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customText.showFrame || false}
                        onChange={e => handleCustomTextChange(customText.id, 'showFrame', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {customText.showFrame && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Couleur du cadre
                        </label>
                        <input
                          type="color"
                          value={customText.frameColor || '#ffffff'}
                          onChange={e => handleCustomTextChange(customText.id, 'frameColor', e.target.value)}
                          className="w-full h-8 rounded border border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Couleur bordure
                        </label>
                        <input
                          type="color"
                          value={customText.frameBorderColor || '#e5e7eb'}
                          onChange={e => handleCustomTextChange(customText.id, 'frameBorderColor', e.target.value)}
                          className="w-full h-8 rounded border border-gray-300"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Custom Images Settings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Images personnalisées</h3>
          <button
            onClick={addCustomImage}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Image className="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </div>

        {customImages.length === 0 && (
          <p className="text-gray-500 text-sm">Aucune image personnalisée. Cliquez sur "Ajouter" pour en créer une.</p>
        )}

        {customImages.map((customImage: any, index: number) => (
          <div key={customImage.id} className="space-y-4 bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Image #{index + 1}
              </label>
              
              <button
                onClick={() => removeCustomImage(customImage.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Supprimer cette image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div>
              <ImageUpload
                value={customImage.src || ''}
                onChange={imageUrl => handleCustomImageChange(customImage.id, 'src', imageUrl)}
                label="Image"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModernDesignTab;
