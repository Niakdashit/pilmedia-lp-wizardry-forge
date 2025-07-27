import React, { useState, useCallback } from 'react';
import { Settings, Palette, Gamepad2, Layers } from 'lucide-react';
import WheelSegmentsConfig from './GameConfig/WheelSegmentsConfig';
import WheelStyleConfig from './GameConfig/WheelStyleConfig';
import WheelMechanicsConfig from './GameConfig/WheelMechanicsConfig';
import WheelAdvancedConfig from './GameConfig/WheelAdvancedConfig';

interface GameConfigPanelProps {
  campaign?: any;
  onCampaignChange?: (campaign: any) => void;
}

const GameConfigPanel: React.FC<GameConfigPanelProps> = ({
  campaign,
  onCampaignChange
}) => {
  const [activeSection, setActiveSection] = useState('segments');

  const handleCampaignUpdate = useCallback((updates: any) => {
    if (onCampaignChange && campaign) {
      onCampaignChange({
        ...campaign,
        design: {
          ...campaign.design,
          ...updates
        }
      });
    }
  }, [campaign, onCampaignChange]);

  const sections = [
    {
      id: 'segments',
      label: 'Segments',
      icon: Layers,
      description: 'Gérer les segments de la roue'
    },
    {
      id: 'style',
      label: 'Style',
      icon: Palette,
      description: 'Couleurs et bordures'
    },
    {
      id: 'mechanics',
      label: 'Mécanique',
      icon: Gamepad2,
      description: 'Comportement du jeu'
    },
    {
      id: 'advanced',
      label: 'Avancé',
      icon: Settings,
      description: 'Options avancées'
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'segments':
        return (
          <WheelSegmentsConfig
            campaign={campaign}
            onCampaignChange={onCampaignChange}
          />
        );
      case 'style':
        return (
          <WheelStyleConfig
            campaign={campaign}
            onCampaignUpdate={handleCampaignUpdate}
          />
        );
      case 'mechanics':
        return (
          <WheelMechanicsConfig
            campaign={campaign}
            onCampaignUpdate={handleCampaignUpdate}
          />
        );
      case 'advanced':
        return (
          <WheelAdvancedConfig
            campaign={campaign}
            onCampaignUpdate={handleCampaignUpdate}
          />
        );
      default:
        return null;
    }
  };

  if (!campaign || campaign.type !== 'wheel') {
    return (
      <div className="p-4 text-center text-gray-500">
        <Gamepad2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">Configuration de jeu</h3>
        <p className="text-sm">
          Sélectionnez une campagne de type "roue de la fortune" pour configurer la mécanique de jeu.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Configuration du jeu</h2>
        <p className="text-sm text-gray-600">Personnalisez votre roue de la fortune</p>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-1 p-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${activeSection === section.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
                title={section.description}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{section.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default GameConfigPanel;