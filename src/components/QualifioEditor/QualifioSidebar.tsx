
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
      {/* Header élégant avec espacement amélioré */}
      <div className="px-8 py-8 border-b border-sidebar-border/30">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-sidebar-active/10 flex items-center justify-center border border-sidebar-active/20">
            <Settings className="w-5 h-5 text-sidebar-active" />
          </div>
          <div>
            <h2 className="text-sidebar-text-primary font-semibold text-xl tracking-tight">Éditeur</h2>
            <p className="text-sidebar-text-muted text-sm mt-1">Configuration avancée</p>
          </div>
        </div>
      </div>

      {/* Navigation des onglets avec espacement optimisé */}
      <div className="py-6 border-b border-sidebar-border/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`sidebar-tab w-full flex items-center justify-between text-left group ${
              activeTab === tab.id ? 'active' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <tab.icon className={`w-5 h-5 transition-colors ${
                activeTab === tab.id 
                  ? 'text-sidebar-active' 
                  : 'text-sidebar-icon group-hover:text-sidebar-text-primary'
              }`} />
              <span className="font-medium text-base">{tab.label}</span>
            </div>
            <ChevronRight className={`w-4 h-4 transition-all duration-300 ${
              activeTab === tab.id 
                ? 'rotate-90 text-sidebar-active' 
                : 'text-sidebar-icon group-hover:text-sidebar-text-primary group-hover:translate-x-1'
            }`} />
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      <div className="flex-1 overflow-y-auto sidebar-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default QualifioSidebar;
