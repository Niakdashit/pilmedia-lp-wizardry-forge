import React, { useEffect } from 'react';
import type { BlocBouton } from '@/types/modularEditor';
import { useButtonStore } from '@/stores/buttonStore';

interface ButtonModulePanelProps {
  module: BlocBouton;
  onUpdate: (patch: Partial<BlocBouton>) => void;
  onBack?: () => void;
}

const ButtonModulePanel: React.FC<ButtonModulePanelProps> = ({ module, onUpdate, onBack }) => {
  const { updateButtonStyle } = useButtonStore();
  
  const radius = typeof module.borderRadius === 'number' ? module.borderRadius : 200;
  const label = module.label || 'Participer';
  const bg = module.background || '#ad0071';
  const txt = module.textColor || '#ffffff';
  const isUpper = !!module.uppercase;
  const isBold = !!module.bold;
  const width = module.layoutWidth || 'full';
  const isValidHexColor = (color: string) => {
    return typeof color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(color);
  };

  const borderWidth = typeof module.borderWidth === 'number' ? module.borderWidth : 0;
  const borderColor = module.borderColor || '#000000';
  const isLaunchButton = (label || '').trim().toLowerCase() === 'participer';

  // Synchroniser les modifications du bouton de lancement vers le store global
  useEffect(() => {
    if (isLaunchButton) {
      updateButtonStyle({
        bgColor: bg,
        textColor: txt,
        borderColor: borderColor,
        borderRadius: radius,
        borderWidth: borderWidth,
        width: width === 'full' ? '100%' : width === 'half' ? '50%' : width === 'twoThirds' ? '66.67%' : '33.33%'
      });
    }
  }, [isLaunchButton, bg, txt, borderColor, radius, borderWidth, width, updateButtonStyle]);

  return (
    <div className="h-full overflow-y-auto pb-12">
      {onBack && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-[#44444d] hover:underline"
            onClick={onBack}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux éléments
          </button>
        </div>
      )}
      <div className="px-4 py-5 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Bouton de lancement</h3>
          <button
            type="button"
            className="text-xs text-[#44444d] hover:underline"
            onClick={() => onUpdate({
              label: 'Participer',
              background: '#ad0071',
              textColor: '#ffffff',
              paddingVertical: 14,
              paddingHorizontal: 28,
              borderRadius: 200,
              borderWidth: 0,
              borderColor: '#000000',
              uppercase: false,
              bold: false,
              boxShadow: '0 12px 30px rgba(132,27,96,0.35)'
            })}
          >
            Réinitialiser
          </button>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Largeur</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'full', label: '1/1' },
              { id: 'half', label: '1/2' },
              { id: 'twoThirds', label: '2/3' },
              { id: 'third', label: '1/3' }
            ].map(({ id, label: widthLabel }) => {
              const isActive = width === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onUpdate({ layoutWidth: id as BlocBouton['layoutWidth'] })}
                  className={`flex items-center justify-center rounded-lg border px-3 py-2 text-[11px] font-semibold transition ${
                    isActive
                      ? 'border-[#44444d] bg-[#44444d]/10 text-[#44444d] shadow-sm shadow-[#44444d]/30'
                      : 'border-gray-200 text-gray-600 hover:border-[#44444d]/40 hover:text-[#44444d]'
                  }`}
                >
                  {widthLabel}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Libellé du bouton</label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#44444d] focus:ring-[#44444d]"
            value={label}
            onChange={(e) => onUpdate({ label: e.target.value })}
          />
        </div>

        {!isLaunchButton && (
          <div className="space-y-3">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Lien (URL)</label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#44444d] focus:ring-[#44444d]"
              value={module.href || ''}
              onChange={(e) => onUpdate({ href: e.target.value })}
              placeholder="https://…"
            />
            <p className="text-[11px] text-gray-500">Non disponible pour le bouton de lancement (Participer).</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Couleur de fond</label>
            <div className="mt-1 space-y-2">
              <input
                type="color"
                className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                value={isValidHexColor(bg) ? bg : '#ad0071'}
                onChange={(e) => onUpdate({ background: e.target.value })}
              />
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#44444d] focus:ring-[#44444d]"
                value={bg}
                onChange={(e) => onUpdate({ background: e.target.value })}
                placeholder="#ad0071"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Couleur du texte</label>
            <div className="mt-1 space-y-2">
              <input
                type="color"
                className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                value={isValidHexColor(txt) ? txt : '#ffffff'}
                onChange={(e) => onUpdate({ textColor: e.target.value })}
              />
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#44444d] focus:ring-[#44444d]"
                value={txt}
                onChange={(e) => onUpdate({ textColor: e.target.value })}
                placeholder="#ffffff"
              />
            </div>
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

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Épaisseur de bordure</label>
            <span className="text-[11px] text-gray-600">{borderWidth}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={20}
            value={borderWidth}
            onChange={(e) => onUpdate({ borderWidth: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Couleur de bordure</label>
          <div className="mt-1 space-y-2">
            <input
              type="color"
              className="w-full h-10 rounded border border-gray-300 cursor-pointer"
              value={isValidHexColor(borderColor) ? borderColor : '#000000'}
              onChange={(e) => onUpdate({ borderColor: e.target.value })}
            />
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#44444d] focus:ring-[#44444d]"
              value={borderColor}
              onChange={(e) => onUpdate({ borderColor: e.target.value })}
              placeholder="#000000"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
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
