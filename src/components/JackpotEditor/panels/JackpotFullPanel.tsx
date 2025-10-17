import React, { useState, useRef } from 'react';
import { X, Plus, Image as ImageIcon } from 'lucide-react';

interface JackpotFullPanelProps {
  campaign?: any;
  setCampaign?: (campaign: any) => void;
}

const JackpotFullPanel: React.FC<JackpotFullPanelProps> = ({
  campaign,
  setCampaign
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  // Configuration du jackpot depuis campaign.gameConfig.jackpot
  const jackpotConfig = (campaign?.gameConfig?.jackpot as any) || {};
  const symbols = jackpotConfig.symbols || ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '🔔', '7️⃣'];
  const buttonText = jackpotConfig.button?.text || 'SPIN';
  const borderColor = jackpotConfig.borderColor || jackpotConfig.button?.colors?.border || '#b8860b';
  const backgroundColor = jackpotConfig.backgroundColor || jackpotConfig.button?.colors?.background || '#841b60';
  const textColor = jackpotConfig.textColor || jackpotConfig.button?.colors?.text || '#8b4513';

  // Mise à jour des symboles
  const updateSymbol = (index: number, value: string) => {
    if (!setCampaign) return;
    
    const newSymbols = [...symbols];
    newSymbols[index] = value;
    
    setCampaign((prev: any) => ({
      ...prev,
      name: prev?.name || 'Campaign',
      gameConfig: {
        ...prev?.gameConfig,
        jackpot: {
          ...prev?.gameConfig?.jackpot,
          symbols: newSymbols
        }
      }
    }));
  };

  // Supprimer un symbole
  const removeSymbol = (index: number) => {
    if (!setCampaign) return;
    
    const newSymbols = symbols.filter((_: any, i: number) => i !== index);
    
    setCampaign((prev: any) => ({
      ...prev,
      name: prev?.name || 'Campaign',
      gameConfig: {
        ...prev?.gameConfig,
        jackpot: {
          ...prev?.gameConfig?.jackpot,
          symbols: newSymbols
        }
      }
    }));
  };

  // Ajouter un symbole
  const addSymbol = () => {
    if (!setCampaign) return;
    
    const newSymbols = [...symbols, '❓'];
    
    setCampaign((prev: any) => ({
      ...prev,
      name: prev?.name || 'Campaign',
      gameConfig: {
        ...prev?.gameConfig,
        jackpot: {
          ...prev?.gameConfig?.jackpot,
          symbols: newSymbols
        }
      }
    }));
  };

  // Upload d'image pour un symbole
  const handleImageUpload = (index: number) => {
    setUploadingIndex(index);
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadingIndex === null) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updateSymbol(uploadingIndex, dataUrl);
      setUploadingIndex(null);
    };
    reader.readAsDataURL(file);
    
    // Reset input
    e.target.value = '';
  };

  // Mise à jour du texte du bouton
  const updateButtonText = (text: string) => {
    if (!setCampaign) return;
    
    setCampaign((prev: any) => ({
      ...prev,
      name: prev?.name || 'Campaign',
      gameConfig: {
        ...prev?.gameConfig,
        jackpot: {
          ...prev?.gameConfig?.jackpot,
          button: {
            ...prev?.gameConfig?.jackpot?.button,
            text
          }
        }
      }
    }));
  };

  // Mise à jour des couleurs
  const updateBorderColor = (color: string) => {
    if (!setCampaign) return;
    
    setCampaign((prev: any) => ({
      ...prev,
      name: prev?.name || 'Campaign',
      gameConfig: {
        ...prev?.gameConfig,
        jackpot: {
          ...prev?.gameConfig?.jackpot,
          borderColor: color,
          button: {
            ...prev?.gameConfig?.jackpot?.button,
            colors: {
              ...prev?.gameConfig?.jackpot?.button?.colors,
              border: color
            }
          }
        }
      }
    }));
  };

  const updateBackgroundColor = (color: string) => {
    if (!setCampaign) return;
    
    setCampaign((prev: any) => ({
      ...prev,
      name: prev?.name || 'Campaign',
      gameConfig: {
        ...prev?.gameConfig,
        jackpot: {
          ...prev?.gameConfig?.jackpot,
          backgroundColor: color,
          button: {
            ...prev?.gameConfig?.jackpot?.button,
            colors: {
              ...prev?.gameConfig?.jackpot?.button?.colors,
              background: color
            }
          }
        }
      }
    }));
  };

  const updateTextColor = (color: string) => {
    if (!setCampaign) return;
    
    setCampaign((prev: any) => ({
      ...prev,
      name: prev?.name || 'Campaign',
      gameConfig: {
        ...prev?.gameConfig,
        jackpot: {
          ...prev?.gameConfig?.jackpot,
          textColor: color,
          button: {
            ...prev?.gameConfig?.jackpot?.button,
            colors: {
              ...prev?.gameConfig?.jackpot?.button?.colors,
              text: color
            }
          }
        }
      }
    }));
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Jackpot</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Symboles des rouleaux */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Symboles des rouleaux</h3>
          
          {/* Grille de symboles */}
          <div className="grid grid-cols-4 gap-3 mb-3">
            {symbols.map((symbol: string, index: number) => (
              <div
                key={index}
                className="relative aspect-square bg-gray-50 border-2 border-gray-200 rounded-lg flex items-center justify-center group hover:border-gray-300 transition-colors"
              >
                {/* Bouton supprimer */}
                <button
                  onClick={() => removeSymbol(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Symbole ou image */}
                {symbol.startsWith('data:') ? (
                  <img
                    src={symbol}
                    alt={`Symbol ${index + 1}`}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <span className="text-3xl">{symbol}</span>
                )}

                {/* Overlay pour changer le symbole */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => handleImageUpload(index)}
                    className="bg-white text-gray-700 px-2 py-1 rounded text-xs font-medium hover:bg-gray-100"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Bouton ajouter */}
            <button
              onClick={addSymbol}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <ImageIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>Les images importées sont intégrées en data URL dans la configuration de la campagne.</p>
          </div>
        </div>

        {/* Texte du bouton */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Texte du bouton
          </label>
          <input
            type="text"
            value={buttonText}
            onChange={(e) => updateButtonText(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            placeholder="SPIN"
          />
        </div>

        {/* Couleur de la bordure */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Couleur de la bordure
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={borderColor}
              onChange={(e) => updateBorderColor(e.target.value)}
              className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={borderColor}
              onChange={(e) => updateBorderColor(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            />
          </div>
        </div>

        {/* Couleur de fond */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Couleur de fond
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => updateBackgroundColor(e.target.value)}
              className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => updateBackgroundColor(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            />
          </div>
        </div>

        {/* Couleur du texte */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Couleur du texte
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={textColor}
              onChange={(e) => updateTextColor(e.target.value)}
              className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={textColor}
              onChange={(e) => updateTextColor(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelected}
      />
    </div>
  );
};

export default JackpotFullPanel;
