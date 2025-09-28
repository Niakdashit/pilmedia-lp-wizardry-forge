import React from 'react';
import { Video, AlignLeft, AlignCenter, AlignRight, Square } from 'lucide-react';
import type { BlocVideo } from '@/types/modularEditor';

interface VideoModulePanelProps {
  module: BlocVideo;
  onUpdate: (patch: Partial<BlocVideo>) => void;
}

const alignmentOptions: Array<{ id: BlocVideo['align']; label: string; icon: React.ComponentType<any> }> = [
  { id: 'left', label: 'Gauche', icon: AlignLeft },
  { id: 'center', label: 'Centre', icon: AlignCenter },
  { id: 'right', label: 'Droite', icon: AlignRight }
];

const VideoModulePanel: React.FC<VideoModulePanelProps> = ({ module, onUpdate }) => {
  const currentRadius = typeof module.borderRadius === 'number' ? module.borderRadius : 0;
  const currentAlign = module.align || 'center';
  const currentFit = module.objectFit || 'cover';

  return (
    <div className="h-full overflow-y-auto pb-12">
      <div className="px-4 py-5">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Vidéo</p>
            <p className="text-xs text-gray-500">Collez un lien d'intégration (YouTube, Vimeo)</p>
          </div>
        </div>

        <div className="space-y-8">
          <section className="space-y-3">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Source</h4>
            <label className="block">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">URL d'intégration</span>
              <input
                type="text"
                value={module.src || ''}
                onChange={(e) => onUpdate({ src: e.target.value })}
                placeholder="https://www.youtube.com/embed/…"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#841b60] focus:ring-[#841b60]"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Titre (optionnel)</span>
              <input
                type="text"
                value={module.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Titre de la vidéo"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#841b60] focus:ring-[#841b60]"
              />
            </label>
          </section>

          <section className="space-y-3">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Remplissage</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdate({ objectFit: 'cover' })}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition ${
                  currentFit === 'cover'
                    ? 'border-[#841b60] bg-[#841b60]/10 text-[#841b60]'
                    : 'border-gray-200 text-gray-600 hover:border-[#841b60]/50 hover:text-[#841b60]'
                }`}
              >
                <Square className="w-4 h-4" />
                Remplir
              </button>
              <button
                type="button"
                onClick={() => onUpdate({ objectFit: 'contain' })}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition ${
                  currentFit === 'contain'
                    ? 'border-[#841b60] bg-[#841b60]/10 text-[#841b60]'
                    : 'border-gray-200 text-gray-600 hover:border-[#841b60]/50 hover:text-[#841b60]'
                }`}
              >
                <Square className="w-4 h-4" />
                Ajuster
              </button>
            </div>
            <p className="text-xs text-gray-500">
              "Remplir" adapte l'aperçu pour occuper l'espace disponible. "Ajuster" maintient la vidéo dans son ratio avec des marges si nécessaire.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Arrondi</h4>
              <span className="text-xs font-semibold text-gray-600">{currentRadius}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={80}
              value={currentRadius}
              onChange={(e) => onUpdate({ borderRadius: Number(e.target.value) })}
              className="w-full"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onUpdate({ borderRadius: 0 })}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:border-[#841b60] hover:text-[#841b60] transition"
              >
                Réinitialiser
              </button>
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Alignement</h4>
            <div className="grid grid-cols-3 gap-2">
              {alignmentOptions.map(({ id, label, icon: Icon }) => {
                const isActive = currentAlign === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onUpdate({ align: id })}
                    className={`flex flex-col items-center rounded-lg border px-3 py-2 text-xs transition ${
                      isActive
                        ? 'border-[#841b60] bg-[#841b60]/10 text-[#841b60]'
                        : 'border-gray-200 text-gray-600 hover:border-[#841b60]/50 hover:text-[#841b60]'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    {label}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default VideoModulePanel;
