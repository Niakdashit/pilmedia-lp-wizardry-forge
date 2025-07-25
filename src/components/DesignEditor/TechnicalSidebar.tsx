import React from 'react';
import { 
  Settings, 
  Gamepad2, 
  Shield, 
  Zap,
  Cog
} from 'lucide-react';
import CampaignConfigPanel from './panels/CampaignConfigPanel';
import GameLogicPanel from './panels/GameLogicPanel';
import SecurityPanel from './panels/SecurityPanel';
import AnimationPanel from './panels/AnimationPanel';

interface TechnicalSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  campaignConfig?: any;
  onCampaignConfigChange?: (config: any) => void;
}

const TechnicalSidebar: React.FC<TechnicalSidebarProps> = ({
  activeTab,
  onTabChange,
  campaignConfig,
  onCampaignConfigChange
}) => {
  const tabs = [
    { id: 'campaign', label: 'Campagne', icon: Settings, description: 'Configuration générale' },
    { id: 'gamelogic', label: 'Logique', icon: Gamepad2, description: 'Mécaniques de jeu' },
    { id: 'security', label: 'Sécurité', icon: Shield, description: 'Paramètres sécurité' },
    { id: 'animations', label: 'Animations', icon: Zap, description: 'Effets et transitions' },
    { id: 'advanced', label: 'Avancé', icon: Cog, description: 'Paramètres avancés' },
  ];

  const renderPanel = () => {
    switch (activeTab) {
      case 'campaign':
        return (
          <CampaignConfigPanel 
            config={campaignConfig} 
            onConfigChange={onCampaignConfigChange || (() => {})} 
          />
        );
      case 'gamelogic':
        return <GameLogicPanel />;
      case 'security':
        return <SecurityPanel />;
      case 'animations':
        return <AnimationPanel />;
      default:
        return <div className="p-4 text-gray-500">Configuration à venir...</div>;
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex">
      {/* Tab Navigation */}
      <div className="w-16 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              title={tab.description}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>

      {/* Panel Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">
            {tabs.find(tab => tab.id === activeTab)?.label}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {renderPanel()}
        </div>
      </div>
    </div>
  );
};

export default TechnicalSidebar;