import React, { useState } from 'react';
import { Settings, Image, Type, MousePointer, Code, FileText } from 'lucide-react';
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
  const tabs = [{
    id: 'general' as TabType,
    label: 'Général',
    icon: Settings
  }, {
    id: 'gameZone' as TabType,
    label: 'Zone de jeu',
    icon: Image
  }, {
    id: 'texts' as TabType,
    label: 'Textes',
    icon: Type
  }, {
    id: 'buttons' as TabType,
    label: 'Boutons',
    icon: MousePointer
  }, {
    id: 'footer' as TabType,
    label: 'Footer',
    icon: FileText
  }, {
    id: 'code' as TabType,
    label: 'Code personnalisé et tags',
    icon: Code
  }];
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
  return <div className="w-96 sidebar-premium flex flex-col h-screen">
      {/* Header élégant blanc avec accents violets */}
      

      {/* Navigation des onglets - Layout horizontal avec scroll */}
      <div className="p-6 border-b" style={{
      borderColor: 'hsl(var(--sidebar-border) / 0.5)'
    }}>
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent">
          <div className="flex gap-2 min-w-max pb-2">
            {tabs.map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 flex-shrink-0 ${activeTab === tab.id ? 'text-white' : 'text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text-primary'}`} style={{
            backgroundColor: activeTab === tab.id ? 'hsl(var(--sidebar-active))' : 'hsl(var(--sidebar-surface))',
            border: activeTab === tab.id ? '1px solid hsl(var(--sidebar-active))' : '1px solid hsl(var(--sidebar-border))',
            minWidth: 'auto'
          }}>
                <tab.icon className="w-4 h-4" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>)}
          </div>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="flex-1 overflow-y-auto sidebar-content">
        {renderTabContent()}
      </div>
    </div>;
};
export default QualifioSidebar;