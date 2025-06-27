
import React, { useState } from 'react';
import { Maximize2, Navigation, MousePointer, Eye, Smartphone, Tablet, Monitor } from 'lucide-react';
import GameSizeSelector, { GameSize } from '../../configurators/GameSizeSelector';
import GamePositionSelector, { GamePosition } from '../../configurators/GamePositionSelector';
import ButtonConfigTab from '../ButtonConfigTab';

interface PlacementTabProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
}

const PlacementTab: React.FC<PlacementTabProps> = ({
  campaign,
  setCampaign
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'size' | 'position' | 'buttons' | 'responsive'>('size');

  const subTabs = [
    { id: 'size', label: 'Taille', icon: Maximize2, description: 'Dimensions du jeu' },
    { id: 'position', label: 'Position', icon: Navigation, description: 'Placement sur la page' },
    { id: 'buttons', label: 'Boutons', icon: MousePointer, description: 'Style des boutons' },
    { id: 'responsive', label: 'Responsive', icon: Eye, description: 'Adaptation aux écrans' }
  ];

  const handleGameSizeChange = (size: GameSize) => {
    setCampaign((prev: any) => ({ ...prev, gameSize: size }));
  };

  const handleGamePositionChange = (position: GamePosition) => {
    setCampaign((prev: any) => ({ ...prev, gamePosition: position }));
  };

  const handleButtonConfigChange = (config: any) => {
    setCampaign((prev: any) => ({ ...prev, buttonConfig: config }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Titre et description */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Placement et responsive</h3>
        <p className="text-sm text-gray-600">
          Configurez la taille, la position et l'adaptation responsive de votre jeu
        </p>
      </div>

      {/* Sous-onglets avec design amélioré */}
      <div className="bg-gray-50 p-1 rounded-xl">
        <nav className="flex space-x-1">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeSubTab === tab.id
                    ? 'bg-white text-[#841b60] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des sous-onglets */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {activeSubTab === 'size' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <Maximize2 className="w-5 h-5 text-[#841b60]" />
              <h4 className="font-medium text-gray-900">Taille du jeu</h4>
            </div>
            <GameSizeSelector
              selectedSize={campaign.gameSize || 'medium'}
              onSizeChange={handleGameSizeChange}
            />
          </div>
        )}
        
        {activeSubTab === 'position' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <Navigation className="w-5 h-5 text-[#841b60]" />
              <h4 className="font-medium text-gray-900">Position du jeu</h4>
            </div>
            <GamePositionSelector
              selectedPosition={campaign.gamePosition || 'center'}
              onPositionChange={handleGamePositionChange}
            />
          </div>
        )}

        {activeSubTab === 'buttons' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <MousePointer className="w-5 h-5 text-[#841b60]" />
              <h4 className="font-medium text-gray-900">Configuration des boutons</h4>
            </div>
            <ButtonConfigTab
              buttonConfig={campaign.buttonConfig || {}}
              onButtonConfigChange={handleButtonConfigChange}
            />
          </div>
        )}

        {activeSubTab === 'responsive' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="w-5 h-5 text-[#841b60]" />
              <h4 className="font-medium text-gray-900">Adaptation responsive</h4>
            </div>

            {/* Preview des différentes tailles d'écran */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <Monitor className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                <h5 className="font-medium text-gray-900 mb-1">Desktop</h5>
                <p className="text-sm text-gray-500">≥ 1024px</p>
                <div className="mt-3 text-xs text-gray-600">
                  Taille: {campaign.gameSize || 'medium'}<br />
                  Position: {campaign.gamePosition || 'center'}
                </div>
              </div>

              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <Tablet className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                <h5 className="font-medium text-gray-900 mb-1">Tablette</h5>
                <p className="text-sm text-gray-500">768px - 1023px</p>
                <div className="mt-3 text-xs text-gray-600">
                  Auto-adapté<br />
                  Centré automatiquement
                </div>
              </div>

              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <Smartphone className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                <h5 className="font-medium text-gray-900 mb-1">Mobile</h5>
                <p className="text-sm text-gray-500">≤ 767px</p>
                <div className="mt-3 text-xs text-gray-600">
                  Optimisé mobile<br />
                  Pleine largeur
                </div>
              </div>
            </div>

            {/* Options responsive avancées */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Optimisations automatiques</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Adaptation automatique de la taille sur mobile</li>
                <li>• Centrage intelligent sur tablette</li>
                <li>• Maintien des proportions sur tous les écrans</li>
                <li>• Boutons tactiles optimisés</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Conseils et astuces */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
        <h5 className="font-medium text-purple-900 mb-2">💡 Conseils de placement</h5>
        <div className="text-sm text-purple-700 space-y-1">
          <p>• <strong>Taille moyenne</strong> : Idéale pour la plupart des cas</p>
          <p>• <strong>Position centrale</strong> : Attire l'attention optimale</p>
          <p>• <strong>Boutons contrastés</strong> : Améliore la conversion</p>
        </div>
      </div>
    </div>
  );
};

export default PlacementTab;
