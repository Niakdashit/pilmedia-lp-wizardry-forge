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
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
              activeTab === tab.id
                ? 'bg-amber-100 text-amber-800 border-r-2 border-amber-500'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform ${
              activeTab === tab.id ? 'rotate-90' : ''
            }`} />
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default QualifioSidebar;