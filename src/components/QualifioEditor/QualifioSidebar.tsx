
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
      {/* Header élégant blanc avec accents violets */}
      <div className="px-8 py-8 border-b" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
        <div className="flex items-center gap-4">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center border"
            style={{ 
              backgroundColor: 'hsl(var(--sidebar-active) / 0.1)',
              borderColor: 'hsl(var(--sidebar-active) / 0.2)'
            }}
          >
            <Settings className="w-5 h-5" style={{ color: 'hsl(var(--sidebar-active))' }} />
          </div>
          <div>
            <h2 
              className="font-semibold text-xl tracking-tight"
              style={{ color: 'hsl(var(--sidebar-text-primary))' }}
            >
              Éditeur
            </h2>
            <p 
              className="text-sm mt-1"
              style={{ color: 'hsl(var(--sidebar-text-muted))' }}
            >
              Configuration avancée
            </p>
          </div>
        </div>
      </div>

      {/* Navigation des onglets */}
      <div className="py-6 border-b" style={{ borderColor: 'hsl(var(--sidebar-border) / 0.5)' }}>
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
