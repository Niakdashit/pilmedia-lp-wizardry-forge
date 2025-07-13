
import React, { useState } from 'react';
import { ChevronRight, Settings, Image, Type, MousePointer, Code, FileText } from 'lucide-react';
import type { EditorConfig } from './QualifioEditorLayout';
import GeneralTab from './SidebarTabs/GeneralTab';
import GameZoneTab from './SidebarTabs/GameZoneTab';
import TextsTab from './SidebarTabs/TextsTab';
import ButtonsTab from './SidebarTabs/ButtonsTab';
import FooterTab from './SidebarTabs/FooterTab';
import CodeTab from './SidebarTabs/CodeTab';

interface QualifioSidebarProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

type TabType = 'general' | 'gameZone' | 'texts' | 'buttons' | 'footer' | 'code';

const QualifioSidebar: React.FC<QualifioSidebarProps> = ({
  config,
  onConfigUpdate
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');

  const tabs = [
    { id: 'general' as TabType, label: 'Général', icon: Settings },
    { id: 'gameZone' as TabType, label: 'Zone de jeu', icon: Image },
    { id: 'texts' as TabType, label: 'Textes', icon: Type },
    { id: 'buttons' as TabType, label: 'Boutons', icon: MousePointer },
    { id: 'footer' as TabType, label: 'Footer', icon: FileText },
    { id: 'code' as TabType, label: 'Code personnalisé et tags', icon: Code }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralTab config={config} onConfigUpdate={onConfigUpdate} />;
      case 'gameZone':
        return <GameZoneTab config={config} onConfigUpdate={onConfigUpdate} />;
      case 'texts':
        return <TextsTab config={config} onConfigUpdate={onConfigUpdate} />;
      case 'buttons':
        return <ButtonsTab config={config} onConfigUpdate={onConfigUpdate} />;
      case 'footer':
        return <FooterTab config={config} onConfigUpdate={onConfigUpdate} />;
      case 'code':
        return <CodeTab config={config} onConfigUpdate={onConfigUpdate} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-96 sidebar-premium flex flex-col h-screen">
      {/* Premium Header avec couleurs de marque */}
      <div className="px-6 py-6 border-b border-sidebar-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center">
            <Settings className="w-4 h-4 text-brand-primary" />
          </div>
          <div>
            <h2 className="text-sidebar-text-primary font-semibold text-lg">Éditeur</h2>
            <p className="text-sidebar-text text-xs">Configuration avancée</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="py-4 border-b border-sidebar-border/30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`sidebar-tab w-full flex items-center justify-between text-left group ${
              activeTab === tab.id ? 'active' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <tab.icon className={`w-4 h-4 transition-colors ${
                activeTab === tab.id 
                  ? 'text-brand-primary' 
                  : 'text-sidebar-icon group-hover:text-sidebar-text-primary'
              }`} />
              <span className="font-medium text-sm">{tab.label}</span>
            </div>
            <ChevronRight className={`w-3 h-3 transition-all duration-300 ${
              activeTab === tab.id 
                ? 'rotate-90 text-brand-primary' 
                : 'text-sidebar-icon group-hover:text-sidebar-text-primary group-hover:translate-x-1'
            }`} />
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto sidebar-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default QualifioSidebar;
