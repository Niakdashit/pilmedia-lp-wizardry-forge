import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface TabJackpotProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
}

const DEFAULT_EMOJI_SET = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '🔔', '7️⃣'];

const toDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const TabJackpot: React.FC<TabJackpotProps> = ({ campaign, setCampaign }) => {
  // Add null check to prevent runtime error
  if (!campaign) {
    return <div>Loading...</div>;
  }

  const config = campaign.gameConfig?.jackpot || {};
  const symbols: string[] = config.symbols || DEFAULT_EMOJI_SET;
  const buttonCfg = config.button || {};
  const buttonText: string = buttonCfg.text ?? 'SPIN';
  const buttonColors = buttonCfg.colors || {};
  const btnBg: string = buttonColors.background ?? '#ffd64d';
  const btnBorder: string = buttonColors.border ?? '#b8860b';
  const btnText: string = buttonColors.text ?? '#8b4513';

  const updateGameConfig = (key: string, value: any) => {
    setCampaign((prev: any) => ({
      ...prev,
      gameConfig: {
        ...prev.gameConfig,
        jackpot: {
          ...prev.gameConfig?.jackpot,
          [key]: value
        }
      },
      _lastUpdate: Date.now() // Force sync avec preview
    }));
  };

  // Removed generic handleChange as fields were simplified

  const updateSymbols = (next: string[]) => {
    updateGameConfig('symbols', next);
  };

  const updateButton = (updates: any) => {
    setCampaign((prev: any) => ({
      ...prev,
      gameConfig: {
        ...prev.gameConfig,
        jackpot: {
          ...prev.gameConfig?.jackpot,
          button: {
            ...(prev.gameConfig?.jackpot?.button || {}),
            ...updates,
            colors: {
              ...(prev.gameConfig?.jackpot?.button?.colors || {}),
              ...(updates?.colors || {})
            }
          }
        }
      },
      _lastUpdate: Date.now() // Force sync avec preview
    }));
  };


  const handleRemove = (index: number) => {
    const next = [...symbols];
    next.splice(index, 1);
    updateSymbols(next.length ? next : DEFAULT_EMOJI_SET);
  };

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const dataUrls = await Promise.all(Array.from(files).map((f) => toDataUrl(f)));
      const next = [...symbols, ...dataUrls];
      updateSymbols(next);
      // reset input
      e.target.value = '';
    } catch (err) {
      console.error('[TabJackpot] Upload failed', err);
    }
  };


  return (
    <div className="space-y-6">
      {/* Section symboles des rouleaux */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Symboles des rouleaux
        </label>
        
        {/* Liste des symboles actuels */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {symbols.map((s, idx) => (
            <div key={`${s}-${idx}`} className="relative bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-center h-20">
              {/* Détecter si c'est une image (data URL) ou un émoji */}
              {s.startsWith('data:image') || s.startsWith('http') ? (
                <img src={s} alt={`symbol-${idx}`} className="w-12 h-12 object-contain" />
              ) : (
                <span className="text-3xl leading-none">{s}</span>
              )}
              <button
                className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
                title="Supprimer"
                onClick={() => handleRemove(idx)}
              >
                ×
              </button>
            </div>
          ))}
          
          {/* Case d'ajout de nouveau symbole */}
          <div 
            className="relative bg-gray-50 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg p-4 flex items-center justify-center h-20 cursor-pointer transition-colors"
            onClick={() => fileInputRef.current?.click()}
            title="Ajouter un nouveau symbole"
          >
            <span className="text-3xl text-gray-400">+</span>
          </div>
        </div>

        {/* Input caché pour l'upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          multiple
          className="hidden"
          onChange={handleUpload}
        />


        {/* Astuce */}
        <div className="text-xs text-gray-500 flex items-center gap-2 mt-2">
          <ImageIcon className="w-3.5 h-3.5" />
          Les images importées sont intégrées en data URL dans la configuration de la campagne.
        </div>
      </div>

      
      {/* Bouton: texte et couleurs */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Texte du bouton</label>
          <input
            type="text"
            value={buttonText}
            onChange={(e) => updateButton({ text: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4dbe8]"
          />
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Couleur de la bordure</label>
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 rounded-md p-1 shadow-inner">
                <input
                  type="color"
                  value={btnBorder}
                  onChange={(e) => updateButton({ colors: { border: e.target.value } })}
                  className="w-8 h-8 cursor-pointer border border-gray-300 rounded-[2px] appearance-none"
                />
              </div>
              <input
                type="text"
                value={btnBorder}
                onChange={(e) => updateButton({ colors: { border: e.target.value } })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Couleur de fond</label>
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 rounded-md p-1 shadow-inner">
                <input
                  type="color"
                  value={btnBg}
                  onChange={(e) => updateButton({ colors: { background: e.target.value } })}
                  className="w-8 h-8 cursor-pointer border border-gray-300 rounded-[2px] appearance-none"
                />
              </div>
              <input
                type="text"
                value={btnBg}
                onChange={(e) => updateButton({ colors: { background: e.target.value } })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Couleur du texte</label>
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 rounded-md p-1 shadow-inner">
                <input
                  type="color"
                  value={btnText}
                  onChange={(e) => updateButton({ colors: { text: e.target.value } })}
                  className="w-8 h-8 cursor-pointer border border-gray-300 rounded-[2px] appearance-none"
                />
              </div>
              <input
                type="text"
                value={btnText}
                onChange={(e) => updateButton({ colors: { text: e.target.value } })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabJackpot;
