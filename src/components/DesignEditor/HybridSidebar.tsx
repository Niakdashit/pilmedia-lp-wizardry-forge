import React, { useState } from 'react';
import { 
  ChevronLeft,
  ChevronRight,
  Plus,
  Layers,
  Settings,
  Gamepad2,
  Share,
  Palette
} from 'lucide-react';
import AssetsPanel from './panels/AssetsPanel';
import BackgroundPanel from './panels/BackgroundPanel';
import CampaignConfigPanel from './panels/CampaignConfigPanel';
import GameLogicPanel from './panels/GameLogicPanel';
import LayersPanel from './panels/LayersPanel';
import ExportPanel from './panels/ExportPanel';
import TextEffectsPanel from './panels/TextEffectsPanel';
import TextAnimationsPanel from './panels/TextAnimationsPanel';
import PositionPanel from './panels/PositionPanel';


interface HybridSidebarProps {
  onAddElement: (element: any) => void;
  onBackgroundChange?: (background: { type: 'color' | 'image'; value: string }) => void;
  onExtractedColorsChange?: (colors: string[]) => void;
  campaignConfig?: any;
  onCampaignConfigChange?: (config: any) => void;
  elements?: any[];
  onElementsChange?: (elements: any[]) => void;
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
  showEffectsPanel?: boolean;
  onEffectsPanelChange?: (show: boolean) => void;
  showAnimationsPanel?: boolean;
  onAnimationsPanelChange?: (show: boolean) => void;
  showPositionPanel?: boolean;
  onPositionPanelChange?: (show: boolean) => void;
  canvasRef?: React.RefObject<HTMLDivElement>;
}

const HybridSidebar: React.FC<HybridSidebarProps> = React.memo(({
  onAddElement,
  onBackgroundChange,
  onExtractedColorsChange,
  campaignConfig,
  onCampaignConfigChange,
  elements = [],
  onElementsChange,
  selectedElement,
  onElementUpdate,
  showEffectsPanel = false,
  onEffectsPanelChange,
  showAnimationsPanel = false,
  onAnimationsPanelChange,
  showPositionPanel = false,
  onPositionPanelChange,
  canvasRef
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('assets');
  
  // Gérer l'affichage des panneaux spéciaux
  React.useEffect(() => {
    if (showEffectsPanel) {
      setActiveTab('effects');
    } else if (showAnimationsPanel) {
      setActiveTab('animations');
    } else if (showPositionPanel) {
      setActiveTab('position');
    } else if (activeTab === 'effects' || activeTab === 'animations' || activeTab === 'position') {
      setActiveTab('assets'); // Retourner aux éléments quand on ferme les panneaux spéciaux
    }
  }, [showEffectsPanel, showAnimationsPanel, showPositionPanel, activeTab]);

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
    // Si on clique sur un onglet différent, fermer les panneaux spéciaux
    if (showEffectsPanel && tabId !== 'effects') {
      onEffectsPanelChange?.(false);
    }
    if (showAnimationsPanel && tabId !== 'animations') {
      onAnimationsPanelChange?.(false);
    }
    if (showPositionPanel && tabId !== 'position') {
      onPositionPanelChange?.(false);
    }
    
    if (activeTab === tabId) {
      setActiveTab(null); // Close if clicking on active tab
    } else {
      setActiveTab(tabId);
    }
  };

  const renderPanel = (tabId: string) => {
    switch (tabId) {
      case 'effects':
        return (
          <TextEffectsPanel 
            onBack={() => {
              onEffectsPanelChange?.(false);
              setActiveTab('assets');
            }}
            selectedElement={selectedElement}
            onElementUpdate={onElementUpdate}
          />
        );
      case 'animations':
        return (
          <TextAnimationsPanel 
            onBack={() => {
              onAnimationsPanelChange?.(false);
              setActiveTab('assets');
            }}
            selectedElement={selectedElement}
            onElementUpdate={onElementUpdate}
          />
        );
      case 'position':
        return (
          <PositionPanel 
            onBack={() => {
              onPositionPanelChange?.(false);
              setActiveTab('assets');
            }}
            selectedElement={selectedElement}
            onElementUpdate={onElementUpdate}
            canvasRef={canvasRef}
          />
        );
      case 'assets':
        return <AssetsPanel onAddElement={onAddElement} selectedElement={selectedElement} onElementUpdate={onElementUpdate} />;
      case 'background':
        return (
          <BackgroundPanel 
            onBackgroundChange={onBackgroundChange || (() => {})} 
            onExtractedColorsChange={onExtractedColorsChange}
          />
        );
      case 'layers':
        return <LayersPanel elements={elements} onElementsChange={onElementsChange || (() => {})} />;
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
                    ? 'bg-[hsl(var(--sidebar-active-bg))] text-[hsl(var(--sidebar-icon-active))]'
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
      <div className="w-20 bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] flex flex-col shadow-sm">
        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-3 hover:bg-[hsl(var(--sidebar-hover))] border-b border-[hsl(var(--sidebar-border))] transition-all duration-200"
          title="Réduire la sidebar"
        >
          <ChevronLeft className="w-5 h-5 text-[hsl(var(--sidebar-icon))] hover:text-[hsl(var(--sidebar-icon-active))]" />
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
                className={`p-4 flex flex-col items-center justify-center border-b border-[hsl(var(--sidebar-border))] transition-all duration-200 ${
                  isActive 
                    ? 'bg-[hsl(var(--sidebar-active-bg))] text-[hsl(var(--sidebar-icon-active))] border-r-2 border-r-[hsl(var(--sidebar-active))] shadow-sm' 
                    : 'text-[hsl(var(--sidebar-icon))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--sidebar-icon-active))]'
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
        <div className="w-80 bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] flex flex-col h-full shadow-sm">
          {/* Panel Header */}
          <div className="p-6 border-b border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-surface))]">
            <h2 className="font-semibold text-[hsl(var(--sidebar-text-primary))] font-inter">
              {activeTab === 'effects' ? 'Effets de texte' : 
               activeTab === 'animations' ? 'Animations de texte' : 
               activeTab === 'position' ? 'Position' : 
               tabs.find(tab => tab.id === activeTab)?.label}
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
});

HybridSidebar.displayName = 'HybridSidebar';

export default HybridSidebar;