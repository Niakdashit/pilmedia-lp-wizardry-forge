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
  Grid3X3
} from 'lucide-react';
import AssetsPanel from './panels/AssetsPanel';
import BackgroundPanel from './panels/BackgroundPanel';
import CampaignConfigPanel from './panels/CampaignConfigPanel';
import GameLogicPanel from './panels/GameLogicPanel';
import LayersPanel from './panels/LayersPanel';
import ExportPanel from './panels/ExportPanel';

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
  const [activeSection, setActiveSection] = useState('assets');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['assets']));

  const sections = [
    { 
      id: 'assets', 
      label: 'Éléments', 
      icon: Plus, 
      description: 'Textes, images, formes',
      color: 'text-blue-600'
    },
    { 
      id: 'background', 
      label: 'Arrière-plan', 
      icon: Palette, 
      description: 'Couleurs, images, dégradés',
      color: 'text-purple-600'
    },
    { 
      id: 'layers', 
      label: 'Calques', 
      icon: Layers, 
      description: 'Organisation des éléments',
      color: 'text-green-600'
    },
    { 
      id: 'campaign', 
      label: 'Campagne', 
      icon: Settings, 
      description: 'Configuration générale',
      color: 'text-orange-600'
    },
    { 
      id: 'gamelogic', 
      label: 'Jeu', 
      icon: Gamepad2, 
      description: 'Mécaniques et règles',
      color: 'text-red-600'
    },
    { 
      id: 'export', 
      label: 'Export', 
      icon: Share, 
      description: 'Publication et partage',
      color: 'text-indigo-600'
    }
  ];

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
    setActiveSection(sectionId);
  };

  const renderPanel = (sectionId: string) => {
    if (!expandedSections.has(sectionId)) return null;
    
    switch (sectionId) {
      case 'assets':
        return <AssetsPanel onAddElement={onAddElement} />;
      case 'background':
        return <BackgroundPanel onBackgroundChange={onBackgroundChange || (() => {})} />;
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
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => {
                  setIsCollapsed(false);
                  setActiveSection(section.id);
                  setExpandedSections(new Set([section.id]));
                }}
                className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={section.label}
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
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-800">Design & Paramètres</h2>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 hover:bg-gray-100 rounded"
          title="Réduire la sidebar"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Accordion Sections */}
      <div className="flex-1 overflow-y-auto">
        {sections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSections.has(section.id);
          
          return (
            <div key={section.id} className="border-b border-gray-100">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                  isExpanded ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${section.color}`} />
                  <div className="text-left">
                    <div className="font-medium text-gray-800">{section.label}</div>
                    <div className="text-xs text-gray-500">{section.description}</div>
                  </div>
                </div>
                <ChevronRight 
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`} 
                />
              </button>

              {/* Section Content */}
              {isExpanded && (
                <div className="border-t border-gray-100 animate-accordion-down">
                  {renderPanel(section.id)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Grid3X3 className="w-4 h-4" />
          <span>Mode Design Avancé</span>
        </div>
      </div>
    </div>
  );
};

export default HybridSidebar;