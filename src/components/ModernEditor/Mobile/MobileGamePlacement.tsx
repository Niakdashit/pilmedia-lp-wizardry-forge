import React from 'react';
import { Gamepad2, Maximize, Move } from 'lucide-react';
import ImageUpload from '../../common/ImageUpload';
import MobileTabRoulette from '../../configurators/MobileTabRoulette';
interface MobileGamePlacementProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
}
const MobileGamePlacement: React.FC<MobileGamePlacementProps> = ({
  campaign,
  setCampaign
}) => {
  const mobileConfig = campaign.mobileConfig || {};
  const updateMobileConfig = (key: string, value: any) => {
    setCampaign((prev: any) => ({
      ...prev,
      mobileConfig: {
        ...prev.mobileConfig,
        [key]: value
      }
    }));
  };
  return <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Gamepad2 className="w-5 h-5 text-[#841b60]" />
        <h3 className="text-lg font-medium text-gray-900">Game Placement</h3>
      </div>

      {/* Configuration spécifique pour la roue mobile */}
      {campaign.type === 'wheel' && <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 py-[16px] my-0">
          
          <MobileTabRoulette campaign={campaign} setCampaign={setCampaign} />
        </div>}

      {/* Alignement vertical du jeu */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Alignement vertical du jeu
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[{
          value: 'flex-start',
          label: 'Haut',
          desc: 'Aligné en haut'
        }, {
          value: 'center',
          label: 'Centre',
          desc: 'Centré verticalement'
        }, {
          value: 'flex-end',
          label: 'Bas',
          desc: 'Aligné en bas'
        }].map(align => <button key={align.value} onClick={() => updateMobileConfig('gameVerticalAlign', align.value)} className={`p-4 border-2 rounded-lg text-center transition-colors ${mobileConfig.gameVerticalAlign === align.value ? 'border-[#841b60] bg-[#f9f0f5] text-[#841b60]' : 'border-gray-200 hover:border-gray-300'}`}>
              <Move className="w-5 h-5 mx-auto mb-2" />
              <div className="text-sm font-medium">{align.label}</div>
              <div className="text-xs text-gray-500 mt-1">{align.desc}</div>
            </button>)}
        </div>
      </div>

      {/* Dimensionnement du jeu */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Dimensionnement du jeu
        </label>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <input type="checkbox" id="fullscreen-game" checked={mobileConfig.fullscreenGame || false} onChange={e => updateMobileConfig('fullscreenGame', e.target.checked)} className="w-4 h-4 text-[#841b60] border-gray-300 rounded focus:ring-[#841b60]" />
            <label htmlFor="fullscreen-game" className="flex items-center space-x-2">
              <Maximize className="w-4 h-4" />
              <span className="text-sm font-medium">Jeu plein écran mobile</span>
            </label>
          </div>

          {!mobileConfig.fullscreenGame && <div className="grid grid-cols-2 gap-4 pl-7">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Largeur max (%)</label>
                <input type="range" min="50" max="100" value={mobileConfig.gameMaxWidth || 90} onChange={e => updateMobileConfig('gameMaxWidth', Number(e.target.value))} className="w-full" />
                <div className="text-xs text-gray-500 mt-1">{mobileConfig.gameMaxWidth || 90}%</div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Hauteur max (vh)</label>
                <input type="range" min="30" max="80" value={mobileConfig.gameMaxHeight || 60} onChange={e => updateMobileConfig('gameMaxHeight', Number(e.target.value))} className="w-full" />
                <div className="text-xs text-gray-500 mt-1">{mobileConfig.gameMaxHeight || 60}vh</div>
              </div>
            </div>}
        </div>
      </div>

      {/* Padding interne */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Padding interne du jeu
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Padding horizontal</label>
            <input type="range" min="0" max="32" value={mobileConfig.gamePaddingX || 16} onChange={e => updateMobileConfig('gamePaddingX', Number(e.target.value))} className="w-full" />
            <div className="text-xs text-gray-500 mt-1">{mobileConfig.gamePaddingX || 16}px</div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Padding vertical</label>
            <input type="range" min="0" max="32" value={mobileConfig.gamePaddingY || 16} onChange={e => updateMobileConfig('gamePaddingY', Number(e.target.value))} className="w-full" />
            <div className="text-xs text-gray-500 mt-1">{mobileConfig.gamePaddingY || 16}px</div>
          </div>
        </div>
      </div>

      {/* Template personnalisé mobile */}
      <div>
        <ImageUpload label="Template mobile personnalisé (optionnel)" value={mobileConfig.customTemplate} onChange={value => updateMobileConfig('customTemplate', value)} />
        <p className="text-xs text-gray-500 mt-2">
          Template spécifique pour mobile, superposé au jeu (comme pour le jackpot).
        </p>
      </div>

      {/* Redimensionnement automatique */}
      <div>
        <div className="flex items-center space-x-3">
          <input type="checkbox" id="auto-resize" checked={mobileConfig.autoResize !== false} onChange={e => updateMobileConfig('autoResize', e.target.checked)} className="w-4 h-4 text-[#841b60] border-gray-300 rounded focus:ring-[#841b60]" />
          <label htmlFor="auto-resize" className="text-sm font-medium">
            Redimensionnement automatique pour mobile
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-1 pl-7">
          Ajuste automatiquement la taille du jeu selon la taille de l'écran.
        </p>
      </div>
    </div>;
};
export default MobileGamePlacement;
