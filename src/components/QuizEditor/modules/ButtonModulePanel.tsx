import React from 'react';
import type { BlocBouton } from '@/types/modularEditor';

interface ButtonModulePanelProps {
  module: BlocBouton;
  onUpdate: (patch: Partial<BlocBouton>) => void;
}

const ButtonModulePanel: React.FC<ButtonModulePanelProps> = ({ module, onUpdate }) => {
  const vPad = typeof module.paddingVertical === 'number' ? module.paddingVertical : 14;
  const hPad = typeof module.paddingHorizontal === 'number' ? module.paddingHorizontal : 28;
  const radius = typeof module.borderRadius === 'number' ? module.borderRadius : 200;
  const label = module.label || 'Participer';
  const bg = module.background || '#ad0071';
  const txt = module.textColor || '#ffffff';
  const isUpper = !!module.uppercase;
  const isBold = !!module.bold;
  const isLaunchButton = (label || '').trim().toLowerCase() === 'participer';

  return (
    <div className="h-full overflow-y-auto pb-12">
      <div className="px-4 py-5 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Bouton de lancement</h3>
          <button
            type="button"
            className="text-xs text-[#841b60] hover:underline"
            onClick={() => onUpdate({
              label: 'Participer',
              background: '#ad0071',
              textColor: '#ffffff',
              paddingVertical: 14,
              paddingHorizontal: 28,
              borderRadius: 200,
              uppercase: false,
              bold: false,
              boxShadow: '0 12px 30px rgba(132,27,96,0.35)'
            })}
          >
            Réinitialiser
          </button>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Libellé du bouton</label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#841b60] focus:ring-[#841b60]"
            value={label}
            onChange={(e) => onUpdate({ label: e.target.value })}
          />
        </div>

        {!isLaunchButton && (
          <div className="space-y-3">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Lien (URL)</label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#841b60] focus:ring-[#841b60]"
              value={module.href || ''}
              onChange={(e) => onUpdate({ href: e.target.value })}
              placeholder="https://…"
            />
            <p className="text-[11px] text-gray-500">Non disponible pour le bouton de lancement (Participer).</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Couleur de fond / gradient</label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#841b60] focus:ring-[#841b60]"
              value={bg}
              onChange={(e) => onUpdate({ background: e.target.value })}
              placeholder="#ad0071 ou linear-gradient(...)"
            />
            <div className="mt-2 h-8 rounded" style={{ background: bg }} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Couleur du texte</label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#841b60] focus:ring-[#841b60]"
              value={txt}
              onChange={(e) => onUpdate({ textColor: e.target.value })}
              placeholder="#ffffff"
            />
            <div className="mt-2 h-8 rounded border" style={{ background: txt }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Padding vertical</label>
            <input
              type="range"
              min={0}
              max={48}
              value={vPad}
              onChange={(e) => onUpdate({ paddingVertical: Number(e.target.value) })}
              className="w-full"
            />
            <div className="text-[11px] text-gray-500">{vPad}px</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Padding horizontal</label>
            <input
              type="range"
              min={0}
              max={64}
              value={hPad}
              onChange={(e) => onUpdate({ paddingHorizontal: Number(e.target.value) })}
              className="w-full"
            />
            <div className="text-[11px] text-gray-500">{hPad}px</div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Arrondi des angles</label>
            <span className="text-[11px] text-gray-600">{radius}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={200}
            value={radius}
            onChange={(e) => onUpdate({ borderRadius: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUpdate({ uppercase: !isUpper })}
            className={`px-3 py-1.5 rounded text-xs ${isUpper ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Majuscules
          </button>
          <button
            type="button"
            onClick={() => onUpdate({ bold: !isBold })}
            className={`px-3 py-1.5 rounded text-xs ${isBold ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Gras
          </button>
          <button
            type="button"
            onClick={() => onUpdate({ boxShadow: module.boxShadow ? '' : '0 12px 30px rgba(132,27,96,0.35)' })}
            className={`px-3 py-1.5 rounded text-xs ${module.boxShadow ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-700'}`}
          >
            Ombre
          </button>
        </div>
      </div>
    </div>
  );
};

export default ButtonModulePanel;
