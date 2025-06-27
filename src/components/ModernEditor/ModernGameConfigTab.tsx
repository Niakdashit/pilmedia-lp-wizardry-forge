
import React, { useState } from 'react';
import { Settings, Maximize2, Navigation, MousePointer } from 'lucide-react';
import GameSizeSelector, { GameSize } from '../configurators/GameSizeSelector';
import GamePositionSelector, { GamePosition } from '../configurators/GamePositionSelector';
import ButtonConfigTab from './ButtonConfigTab';

interface ModernGameConfigTabProps {
  gameSize: GameSize;
  gamePosition: GamePosition;
  onGameSizeChange: (size: GameSize) => void;
  onGamePositionChange: (position: GamePosition) => void;
  buttonConfig: any;
  onButtonConfigChange: (config: any) => void;
}

const ModernGameConfigTab: React.FC<ModernGameConfigTabProps> = ({
  gameSize,
  gamePosition,
  onGameSizeChange,
  onGamePositionChange,
  buttonConfig,
  onButtonConfigChange
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'size' | 'position' | 'buttons'>('size');

  const subTabs = [
    { id: 'size', label: 'Taille du jeu', icon: Maximize2 },
    { id: 'position', label: 'Position du jeu', icon: Navigation },
    { id: 'buttons', label: 'Configuration boutons', icon: MousePointer }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <Settings className="w-6 h-6 mr-2" />
          Configuration du jeu
        </h2>
        <p className="text-sm text-gray-600">
          Ajustez la taille, la position du jeu et les boutons
        </p>
      </div>

      {/* Sous-onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as 'size' | 'position' | 'buttons')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeSubTab === tab.id
                    ? 'border-[#841b60] text-[#841b60]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des sous-onglets */}
      <div className="mt-6">
        {activeSubTab === 'size' && (
          <GameSizeSelector
            selectedSize={gameSize}
            onSizeChange={onGameSizeChange}
          />
        )}
        
        {activeSubTab === 'position' && (
          <GamePositionSelector
            selectedPosition={gamePosition}
            onPositionChange={onGamePositionChange}
          />
        )}

        {activeSubTab === 'buttons' && (
          <ButtonConfigTab
            buttonConfig={buttonConfig}
            onButtonConfigChange={onButtonConfigChange}
          />
        )}
      </div>
    </div>
  );
};

export default ModernGameConfigTab;
