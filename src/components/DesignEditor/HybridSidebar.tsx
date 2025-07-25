import React, { useState } from 'react';
import { 
  ChevronLeft,
  ChevronRight,
  Plus,
  Layers,
  Settings,
  Gamepad2,
  Share,
  Palette,
  Zap
} from 'lucide-react';
import AssetsPanel from './panels/AssetsPanel';
import BackgroundPanel from './panels/BackgroundPanel';
import CampaignConfigPanel from './panels/CampaignConfigPanel';
import GameLogicPanel from './panels/GameLogicPanel';
import LayersPanel from './panels/LayersPanel';
import ExportPanel from './panels/ExportPanel';
import AnimationEntrancePanel from './panels/AnimationEntrancePanel';

interface HybridSidebarProps {
  onAddElement: (element: any) => void;
  onBackgroundChange?: (background: { type: 'color' | 'image'; value: string }) => void;
  campaignConfig?: any;
  onCampaignConfigChange?: (config: any) => void;
  elements?: any[];
  onElementsChange?: (elements: any[]) => void;
}

const HybridSidebar: React.FC<HybridSidebarProps> = ({
  onAddElement,
  onBackgroundChange,
  campaignConfig,
  onCampaignConfigChange,
  elements = [],
  onElementsChange
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('assets');

  const tabs = [
    { 
      id: 'assets', 
      label: 'Elements', 
      icon: Plus
    },
    { 
      id: 'background', 
      label: 'Design', 
      icon: Palette
    },
    { 
      id: 'layers', 
      label: 'Layers', 
      icon: Layers
    },
    { 
      id: 'animations', 
      label: 'Animations', 
      icon: Zap
    },
    { 
      id: 'campaign', 
      label: 'Settings', 
      icon: Settings
    },
    { 
      id: 'gamelogic', 
      label: 'Game', 
      icon: Gamepad2
    },
    { 
      id: 'export', 
      label: 'Export', 
      icon: Share
    }
  ];

  const handleTabClick = (tabId: string) => {
    if (activeTab === tabId) {
      setActiveTab(null); // Close if clicking on active tab
    } else {
      setActiveTab(tabId);
    }
  };

  const renderPanel = (tabId: string) => {
    switch (tabId) {
      case 'assets':
        return <AssetsPanel onAddElement={onAddElement} />;
      case 'background':
        return <BackgroundPanel onBackgroundChange={onBackgroundChange || (() => {})} />;
      case 'layers':
        return <LayersPanel elements={elements} onElementsChange={onElementsChange || (() => {})} />;
      case 'animations':
        return <AnimationEntrancePanel onAnimationChange={(config) => console.log('Animation config:', config)} />;
      case 'campaign':
        return (
          <CampaignConfigPanel 
            config={campaignConfig} 
            onConfigChange={onCampaignConfigChange || (() => {})} 
          />
        );
      case 'gamelogic':
        return <GameLogicPanel />;
      case 'export':
        return <ExportPanel />;
      default:
        return null;
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col">
        {/* Collapse/Expand Button */}
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-4 hover:bg-gray-100 border-b border-gray-200"
          title="Développer la sidebar"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
        
        {/* Collapsed Icons */}
        <div className="flex flex-col space-y-2 p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setIsCollapsed(false);
                  setActiveTab(tab.id);
                }}
                className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={tab.label}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Vertical Tab Sidebar */}
      <div className="w-20 bg-gray-100 border-r border-gray-200 flex flex-col">
        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-3 hover:bg-gray-200 border-b border-gray-200"
          title="Réduire la sidebar"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        {/* Vertical Tabs */}
        <div className="flex flex-col flex-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`p-4 flex flex-col items-center justify-center border-b border-gray-200 transition-colors ${
                  isActive 
                    ? 'bg-white text-blue-600 border-r-2 border-r-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                title={tab.label}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel Content */}
      {activeTab && (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
          {/* Panel Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto">
            {renderPanel(activeTab)}
          </div>
        </div>
      )}
    </div>
  );
};

export default HybridSidebar;