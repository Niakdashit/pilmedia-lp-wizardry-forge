import React from 'react';
import { Video, AlignLeft, AlignCenter, AlignRight, Square } from 'lucide-react';
import type { BlocVideo } from '@/types/modularEditor';

interface VideoModulePanelProps {
  module: BlocVideo;
  onUpdate: (patch: Partial<BlocVideo>) => void;
  onBack?: () => void;
}

const alignmentOptions: Array<{ id: BlocVideo['align']; label: string; icon: React.ComponentType<any> }> = [
  { id: 'left', label: 'Gauche', icon: AlignLeft },
  { id: 'center', label: 'Centre', icon: AlignCenter },
  { id: 'right', label: 'Droite', icon: AlignRight }
];

// Fonction pour convertir les URLs YouTube normales en URLs embed
const convertToEmbedUrl = (url: string): string => {
  if (!url) return url;
  
  // YouTube: https://www.youtube.com/watch?v=VIDEO_ID -> https://www.youtube.com/embed/VIDEO_ID
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  
  // Vimeo: https://vimeo.com/VIDEO_ID -> https://player.vimeo.com/video/VIDEO_ID
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  
  // Si c'est déjà une URL embed, la retourner telle quelle
  return url;
};

const VideoModulePanel: React.FC<VideoModulePanelProps> = ({ module, onUpdate, onBack }) => {
  const currentRadius = typeof module.borderRadius === 'number' ? module.borderRadius : 0;
  const currentAlign = module.align || 'center';
  const currentFit = module.objectFit || 'cover';
  const currentWidth = module.layoutWidth || 'full';
  const currentBorderWidth = (module as any).borderWidth ?? 0;
  const currentBorderColor = (module as any).borderColor ?? '#000000';
  
  // Gérer le changement d'URL avec conversion automatique
  const handleUrlChange = (url: string) => {
    const embedUrl = convertToEmbedUrl(url);
    onUpdate({ src: embedUrl });
  };

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
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Largeur</h4>
            <div className="grid grid-cols-4 gap-2">
              {[{ id: 'full', label: '1/1' }, { id: 'half', label: '1/2' }, { id: 'twoThirds', label: '2/3' }, { id: 'third', label: '1/3' }].map(({ id, label }) => {
                const isActive = currentWidth === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onUpdate({ layoutWidth: id as BlocVideo['layoutWidth'] })}
                    className={`flex items-center justify-center rounded-lg border px-3 py-2 text-[11px] font-semibold transition ${
                      isActive
                        ? 'border-[#44444d] bg-[#44444d]/10 text-[#44444d] shadow-sm shadow-[#44444d]/30'
                        : 'border-gray-200 text-gray-600 hover:border-[#44444d]/40 hover:text-[#44444d]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Source</h4>
            <label className="block">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">URL de la vidéo</span>
              <input
                type="text"
                value={module.src || ''}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... ou https://vimeo.com/..."
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#44444d] focus:ring-[#44444d]"
              />
              <p className="mt-1 text-xs text-gray-500">
                Collez n'importe quelle URL YouTube ou Vimeo, elle sera automatiquement convertie
              </p>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Titre (optionnel)</span>
              <input
                type="text"
                value={module.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Titre de la vidéo"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#44444d] focus:ring-[#44444d]"
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
                    ? 'border-[#44444d] bg-[#44444d]/10 text-[#44444d]'
                    : 'border-gray-200 text-gray-600 hover:border-[#44444d]/50 hover:text-[#44444d]'
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
                    ? 'border-[#44444d] bg-[#44444d]/10 text-[#44444d]'
                    : 'border-gray-200 text-gray-600 hover:border-[#44444d]/50 hover:text-[#44444d]'
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
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:border-[#44444d] hover:text-[#44444d] transition"
              >
                Réinitialiser
              </button>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bordure</h4>
              <span className="text-xs font-semibold text-gray-600">{currentBorderWidth}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              value={currentBorderWidth}
              onChange={(e) => onUpdate({ borderWidth: Number(e.target.value) } as any)}
              className="w-full"
            />
            {currentBorderWidth > 0 && (
              <div className="space-y-2">
                <label className="block">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Couleur de bordure</span>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      value={currentBorderColor}
                      onChange={(e) => onUpdate({ borderColor: e.target.value } as any)}
                      className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={currentBorderColor}
                      onChange={(e) => onUpdate({ borderColor: e.target.value } as any)}
                      placeholder="#000000"
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#44444d] focus:ring-[#44444d]"
                    />
                  </div>
                </label>
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onUpdate({ borderWidth: 0 } as any)}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:border-[#44444d] hover:text-[#44444d] transition"
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
                        ? 'border-[#44444d] bg-[#44444d]/10 text-[#44444d]'
                        : 'border-gray-200 text-gray-600 hover:border-[#44444d]/50 hover:text-[#44444d]'
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
