
import React from 'react';
import { Bold, Italic, Underline, Plus, Trash2 } from 'lucide-react';

interface CustomTextsManagerProps {
  customTexts: any[];
  setCampaign: (campaign: any) => void;
  campaign: any;
}

const CustomTextsManager: React.FC<CustomTextsManagerProps> = ({
  customTexts,
  setCampaign,
  campaign
}) => {
  const design = campaign.design || {};

  const getInitialPosition = () => {
    const basePosition = { x: 100, y: 100 };
    const offset = customTexts.length * 20;
    return {
      x: basePosition.x + offset,
      y: basePosition.y + offset
    };
  };

  const addCustomText = () => {
    const position = getInitialPosition();
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

  const removeCustomText = (id: number) => {
    setCampaign({
      ...campaign,
      design: {
        ...design,
        customTexts: customTexts.filter((text: any) => text.id !== id)
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

  // Import font options from central config
  const fontFamilyOptions = [
    { value: 'Inter, sans-serif', label: 'Inter' },
    { value: 'Roboto, sans-serif', label: 'Roboto' },
    { value: 'Open Sans, sans-serif', label: 'Open Sans' },
    { value: 'Lato, sans-serif', label: 'Lato' },
    { value: 'Montserrat, sans-serif', label: 'Montserrat' },
    { value: 'Poppins, sans-serif', label: 'Poppins' },
    { value: 'Nunito, sans-serif', label: 'Nunito' },
    { value: 'Source Sans Pro, sans-serif', label: 'Source Sans Pro' },
    { value: 'Raleway, sans-serif', label: 'Raleway' },
    { value: 'Ubuntu, sans-serif', label: 'Ubuntu' },
    { value: 'Work Sans, sans-serif', label: 'Work Sans' },
    { value: 'Fira Sans, sans-serif', label: 'Fira Sans' },
    { value: 'Rubik, sans-serif', label: 'Rubik' },
    { value: 'Quicksand, sans-serif', label: 'Quicksand' },
    { value: 'Comfortaa, sans-serif', label: 'Comfortaa' },
    { value: 'Kanit, sans-serif', label: 'Kanit' },
    { value: 'Exo 2, sans-serif', label: 'Exo 2' },
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: 'Playfair Display, serif', label: 'Playfair Display' },
    { value: 'Merriweather, serif', label: 'Merriweather' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Palatino, serif', label: 'Palatino' },
    { value: 'Oswald, sans-serif', label: 'Oswald' },
    { value: 'Bebas Neue, sans-serif', label: 'Bebas Neue' },
    { value: 'Anton, sans-serif', label: 'Anton' },
    { value: 'Fjalla One, sans-serif', label: 'Fjalla One' },
    { value: 'Russo One, sans-serif', label: 'Russo One' },
    { value: 'Righteous, sans-serif', label: 'Righteous' },
    { value: 'Impact, sans-serif', label: 'Impact' },
    { value: 'Orbitron, sans-serif', label: 'Orbitron' },
    { value: 'Audiowide, sans-serif', label: 'Audiowide' },
    { value: 'Dancing Script, cursive', label: 'Dancing Script' },
    { value: 'Pacifico, cursive', label: 'Pacifico' },
    { value: 'Lobster, cursive', label: 'Lobster' },
    { value: 'Great Vibes, cursive', label: 'Great Vibes' },
    { value: 'Sacramento, cursive', label: 'Sacramento' },
    { value: 'Satisfy, cursive', label: 'Satisfy' },
    { value: 'Cookie, cursive', label: 'Cookie' },
    { value: 'Caveat, cursive', label: 'Caveat' },
    { value: 'Kalam, cursive', label: 'Kalam' },
    { value: 'Architects Daughter, cursive', label: 'Architects Daughter' },
    { value: 'Shadows Into Light, cursive', label: 'Shadows Into Light' },
    { value: 'Indie Flower, cursive', label: 'Indie Flower' },
    { value: 'Permanent Marker, cursive', label: 'Permanent Marker' },
    { value: 'Fredoka One, cursive', label: 'Fredoka One' },
    { value: 'Bungee, cursive', label: 'Bungee' },
    { value: 'Bangers, cursive', label: 'Bangers' },
    { value: 'Creepster, cursive', label: 'Creepster' },
    { value: 'Amatic SC, cursive', label: 'Amatic SC' },
    { value: 'Press Start 2P, cursive', label: 'Press Start 2P' },
    { value: 'Comic Sans MS, cursive', label: 'Comic Sans MS' },
    { value: 'Anonymous Pro, monospace', label: 'Anonymous Pro' },
    { value: 'Courier New, monospace', label: 'Courier New' },
    { value: 'JetBrains Mono, monospace', label: 'JetBrains Mono' },
    { value: 'Belleza, sans-serif', label: 'Belleza' },
    { value: 'Binate, sans-serif', label: 'Binate' },
    { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS' }
  ];

  return (
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
                  onChange={(e) =>
                    handleCustomTextChange(customText.id, 'enabled', e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div
                  className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                />
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
                  onChange={(e) =>
                    handleCustomTextChange(customText.id, 'text', e.target.value)
                  }
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
                  onChange={(e) =>
                    handleCustomTextChange(customText.id, 'fontFamily', e.target.value)
                  }
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
                  onChange={(e) =>
                    handleCustomTextChange(customText.id, 'size', e.target.value)
                  }
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
                    onClick={() =>
                      handleCustomTextChange(customText.id, 'bold', !customText.bold)
                    }
                    className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-colors ${customText.bold ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'}`}
                    title="Gras"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() =>
                      handleCustomTextChange(customText.id, 'italic', !customText.italic)
                    }
                    className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-colors ${customText.italic ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'}`}
                    title="Italique"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() =>
                      handleCustomTextChange(customText.id, 'underline', !customText.underline)
                    }
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
                  onChange={(e) =>
                    handleCustomTextChange(customText.id, 'color', e.target.value)
                  }
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
                      onChange={(e) =>
                        handleCustomTextChange(customText.id, 'showFrame', e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div
                      className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                    />
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
                        onChange={(e) =>
                          handleCustomTextChange(customText.id, 'frameColor', e.target.value)
                        }
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
                        onChange={(e) =>
                          handleCustomTextChange(customText.id, 'frameBorderColor', e.target.value)
                        }
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
  );
};

export default CustomTextsManager;
