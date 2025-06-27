
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
    setCampaign((prev: any) => {
      const newCampaign = { ...prev, gameSize: size };
      newCampaign._lastUpdate = Date.now();
      return newCampaign;
    });
  };

  const handleGamePositionChange = (position: GamePosition) => {
    setCampaign((prev: any) => {
      const newCampaign = { ...prev, gamePosition: position };
      newCampaign._lastUpdate = Date.now();
      return newCampaign;
    });
  };

  const handleButtonConfigChange = (config: any) => {
    setCampaign((prev: any) => {
      const newCampaign = { ...prev, buttonConfig: config };
      newCampaign._lastUpdate = Date.now();
      return newCampaign;
    });
  };

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      {/* Titre et description */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Placement et responsive</h3>
        <p className="text-xs text-gray-600">
          Configurez la taille, la position et l'adaptation responsive de votre jeu
        </p>
      </div>

      {/* Sous-onglets */}
      <div className="bg-gray-50 p-1 rounded-lg">
        <nav className="flex space-x-1">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-1 py-2 px-2 rounded-md font-medium text-xs transition-all duration-200 ${
                  activeSubTab === tab.id
                    ? 'bg-white text-[#841b60] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des sous-onglets */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex-1">
        {activeSubTab === 'size' && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-3">
              <Maximize2 className="w-4 h-4 text-[#841b60]" />
              <h4 className="font-medium text-gray-900 text-sm">Taille du jeu</h4>
            </div>
            <GameSizeSelector
              selectedSize={campaign.gameSize || 'medium'}
              onSizeChange={handleGameSizeChange}
            />
          </div>
        )}
        
        {activeSubTab === 'position' && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-3">
              <Navigation className="w-4 h-4 text-[#841b60]" />
              <h4 className="font-medium text-gray-900 text-sm">Position du jeu</h4>
            </div>
            <GamePositionSelector
              selectedPosition={campaign.gamePosition || 'center'}
              onPositionChange={handleGamePositionChange}
            />
          </div>
        )}

        {activeSubTab === 'buttons' && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-3">
              <MousePointer className="w-4 h-4 text-[#841b60]" />
              <h4 className="font-medium text-gray-900 text-sm">Configuration des boutons</h4>
            </div>
            <ButtonConfigTab
              buttonConfig={campaign.buttonConfig || {}}
              onButtonConfigChange={handleButtonConfigChange}
            />
          </div>
        )}

        {activeSubTab === 'responsive' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <Eye className="w-4 h-4 text-[#841b60]" />
              <h4 className="font-medium text-gray-900 text-sm">Adaptation responsive</h4>
            </div>

            {/* Preview des différentes tailles d'écran */}
            <div className="grid grid-cols-1 gap-3">
              <div className="text-center p-3 border border-gray-200 rounded-md">
                <Monitor className="w-6 h-6 mx-auto text-gray-600 mb-2" />
                <h5 className="font-medium text-gray-900 mb-1 text-sm">Desktop</h5>
                <p className="text-xs text-gray-500">≥ 1024px</p>
                <div className="mt-2 text-xs text-gray-600">
                  Taille: {campaign.gameSize || 'medium'}<br />
                  Position: {campaign.gamePosition || 'center'}
                </div>
              </div>

              <div className="text-center p-3 border border-gray-200 rounded-md">
                <Tablet className="w-6 h-6 mx-auto text-gray-600 mb-2" />
                <h5 className="font-medium text-gray-900 mb-1 text-sm">Tablette</h5>
                <p className="text-xs text-gray-500">768px - 1023px</p>
                <div className="mt-2 text-xs text-gray-600">
                  Auto-adapté<br />
                  Centré automatiquement
                </div>
              </div>

              <div className="text-center p-3 border border-gray-200 rounded-md">
                <Smartphone className="w-6 h-6 mx-auto text-gray-600 mb-2" />
                <h5 className="font-medium text-gray-900 mb-1 text-sm">Mobile</h5>
                <p className="text-xs text-gray-500">≤ 767px</p>
                <div className="mt-2 text-xs text-gray-600">
                  Optimisé mobile<br />
                  Pleine largeur
                </div>
              </div>
            </div>

            {/* Options responsive avancées */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <h5 className="font-medium text-blue-900 mb-2 text-sm">Optimisations automatiques</h5>
              <ul className="text-xs text-blue-700 space-y-1">
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
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-md p-3">
        <h5 className="font-medium text-purple-900 mb-2 text-sm">💡 Conseils de placement</h5>
        <div className="text-xs text-purple-700 space-y-1">
          <p>• <strong>Taille moyenne</strong> : Idéale pour la plupart des cas</p>
          <p>• <strong>Position centrale</strong> : Attire l'attention optimale</p>
          <p>• <strong>Boutons contrastés</strong> : Améliore la conversion</p>
        </div>
      </div>
    </div>
  );
};

export default PlacementTab;
