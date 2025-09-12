import React from 'react';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';

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

  const config = campaign.gameConfig?.[campaign.type] || {};
  const symbols: string[] = config.symbols || DEFAULT_EMOJI_SET;

  const updateGameConfig = (key: string, value: any) => {
    setCampaign((prev: any) => ({
      ...prev,
      gameConfig: {
        ...prev.gameConfig,
        [campaign.type]: {
          ...prev.gameConfig?.[campaign.type],
          [key]: value
        }
      }
    }));
  };

  const handleChange = (field: string, value: any) => {
    updateGameConfig(field, value);
  };

  const updateSymbols = (next: string[]) => {
    updateGameConfig('symbols', next);
  };

  const handleAddEmoji = (emoji: string) => {
    const next = Array.from(new Set([...(symbols || []), emoji]));
    updateSymbols(next);
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
            <div key={`${s}-${idx}`} className="relative bg-gray-50 border border-gray-200 rounded-lg p-2 flex items-center justify-center">
              {/* Détecter si c'est une image (data URL) ou un émoji */}
              {s.startsWith('data:image') || s.startsWith('http') ? (
                <img src={s} alt={`symbol-${idx}`} className="w-12 h-12 object-contain" />
              ) : (
                <span className="text-3xl leading-none">{s}</span>
              )}
              <button
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                title="Supprimer"
                onClick={() => handleRemove(idx)}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Actions: Ajout d'emoji & Upload */}
        <div className="space-y-3">
          <div>
            <div className="text-xs text-gray-600 mb-2">Ajouter un symbole rapide (émoji)</div>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_EMOJI_SET.map((e) => (
                <button
                  key={e}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-lg"
                  onClick={() => handleAddEmoji(e)}
                  title={`Ajouter ${e}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-600 mb-2">Importer des symboles (PNG, JPG, SVG)</div>
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-2 px-3 py-2 bg-[#841b60] hover:bg-[#7a1856] text-white rounded text-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4" /> Importer
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                multiple
                className="hidden"
                onChange={handleUpload}
              />
            </div>
          </div>
        </div>

        {/* Astuce */}
        <div className="text-xs text-gray-500 flex items-center gap-2 mt-2">
          <ImageIcon className="w-3.5 h-3.5" />
          Les images importées sont intégrées en data URL dans la configuration de la campagne.
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre de rouleaux
        </label>
        <input
          type="number"
          value={config.reels || 3}
          onChange={(e) => handleChange('reels', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
          min="3"
          max="5"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message de victoire
        </label>
        <input
          type="text"
          value={config.winMessage || 'JACKPOT ! Vous avez gagné !'}
          onChange={(e) => handleChange('winMessage', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message de défaite
        </label>
        <input
          type="text"
          value={config.loseMessage || 'Dommage, pas de jackpot !'}
          onChange={(e) => handleChange('loseMessage', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
        />
      </div>
    </div>
  );
};

export default TabJackpot;
