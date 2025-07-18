
import React from 'react';
import { Settings, Palette, FileText, Code, MousePointer } from 'lucide-react';
import type { EditorConfig, DeviceType } from '../QualifioEditorLayout';
import DesignTab from '../SidebarTabs/DesignTab';
import ButtonsTab from '../SidebarTabs/ButtonsTab';
import ContentTab from '../SidebarTabs/ContentTab';
import CodeTab from '../SidebarTabs/CodeTab';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
  currentDevice: DeviceType;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  config,
  onConfigUpdate,
  currentDevice
}) => {
  const tabs = [
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'buttons', label: 'Boutons', icon: MousePointer },
    { id: 'content', label: 'Contenu', icon: FileText },
    { id: 'code', label: 'Code', icon: Code },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'design':
        return <DesignTab config={config} onConfigUpdate={onConfigUpdate} currentDevice={currentDevice} />;
      case 'buttons':
        return <ButtonsTab config={config} onConfigUpdate={onConfigUpdate} />;
      case 'content':
        return <ContentTab config={config} onConfigUpdate={onConfigUpdate} />;
      case 'code':
        return <CodeTab config={config} onConfigUpdate={onConfigUpdate} />;
      default:
        return <div className="p-4 text-gray-500">Onglet en construction...</div>;
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex flex-wrap">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors
                ${activeTab === id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  );
};
