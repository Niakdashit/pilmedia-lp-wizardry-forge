import React from 'react';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { useEditorStore } from '../../../stores/editorStore';

/**
 * SlotSymbolsPanel
 * - Permet d'éditer les symboles des slots (émojis ou images)
 * - Permet d'importer de nouveaux symboles (PNG/JPG/SVG) – encodés en data URL pour persister dans l'état de campagne
 * - Stockage: campaign.gameConfig.slot.symbols: string[] (chaque entrée est un émoji ou un data URL)
 */
const DEFAULT_EMOJI_SET = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '🔔', '7️⃣'];

const toDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const SlotSymbolsPanel: React.FC = () => {
  const campaign = useEditorStore((s) => s.campaign as any);
  const setCampaign = useEditorStore((s) => s.setCampaign as any);

  const symbols: string[] = campaign?.gameConfig?.slot?.symbols || DEFAULT_EMOJI_SET;

  const updateSymbols = (next: string[]) => {
    setCampaign((prev: any) => {
      const base = prev || {};
      return {
        ...base,
        gameConfig: {
          ...(base.gameConfig || {}),
          slot: {
            ...(base.gameConfig?.slot || {}),
            symbols: next
          }
        }
      };
    });
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
      console.error('[SlotSymbolsPanel] Upload failed', err);
    }
  };

  return (
    <div className="space-y-4 p-4">
      {/* Debug banner */}
      <div className="bg-red-500 text-white p-2 rounded text-xs font-bold">
        🔧 DEBUG: SlotSymbolsPanel rendu - {symbols.length} symboles
      </div>
      <h3 className="text-sm font-semibold text-white">Symboles des rouleaux</h3>

      {/* Liste des symboles actuels */}
      <div className="grid grid-cols-4 gap-3">
        {symbols.map((s, idx) => (
          <div key={`${s}-${idx}`} className="relative bg-white/5 border border-white/10 rounded-lg p-2 flex items-center justify-center">
            {/* Détecter si c'est une image (data URL) ou un émoji */}
            {s.startsWith('data:image') || s.startsWith('http') ? (
              <img src={s} alt={`symbol-${idx}`} className="w-12 h-12 object-contain" />
            ) : (
              <span className="text-3xl leading-none">{s}</span>
            )}
            <button
              className="absolute -top-2 -right-2 bg-white/10 hover:bg-white/20 text-white rounded-full p-1"
              title="Supprimer"
              onClick={() => handleRemove(idx)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Actions: Ajout d'emoji & Upload */}
      <div className="space-y-3">
        <div>
          <div className="text-xs text-white/70 mb-2">Ajouter un symbole rapide (émoji)</div>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_EMOJI_SET.map((e) => (
              <button
                key={e}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-lg"
                onClick={() => handleAddEmoji(e)}
                title={`Ajouter ${e}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs text-white/70 mb-2">Importer des symboles (PNG, JPG, SVG)</div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-white text-sm"
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
      <div className="text-[11px] text-white/60 flex items-center gap-2">
        <ImageIcon className="w-3.5 h-3.5" />
        Les images importées sont intégrées en data URL dans la configuration de la campagne.
      </div>
    </div>
  );
};

export default SlotSymbolsPanel;
