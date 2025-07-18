import React from 'react';
import type { EditorConfig } from './QualifioEditorLayout';
import GeneralTab from './SidebarTabs/GeneralTab';
import DesignTab from './SidebarTabs/DesignTab';
import GameZoneTab from './SidebarTabs/GameZoneTab';
import GameMechanicsTab from './SidebarTabs/GameMechanicsTab';
import TextsTab from './SidebarTabs/TextsTab';
import ButtonsTab from './SidebarTabs/ButtonsTab';
import FormTab from './SidebarTabs/FormTab';
import CodeTab from './SidebarTabs/CodeTab';
interface QualifioContentPanelProps {
  activeTab: string;
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}
const QualifioContentPanel: React.FC<QualifioContentPanelProps> = ({
  activeTab,
  config,
  onConfigUpdate
}) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralTab config={config} onConfigUpdate={onConfigUpdate} />;
      case 'design':
        return <DesignTab config={config} onConfigUpdate={onConfigUpdate} />;
      case 'gameZone':
        return <GameZoneTab config={config} onConfigUpdate={onConfigUpdate} />;
      case 'gameMechanics':
        return <GameMechanicsTab config={config} onConfigUpdate={onConfigUpdate} />;
      case 'texts':
        return <TextsTab config={config} onConfigUpdate={onConfigUpdate} />;
      case 'buttons':
        return <ButtonsTab config={config} onConfigUpdate={onConfigUpdate} />;
      case 'form':
        return <FormTab config={config} onConfigUpdate={onConfigUpdate} />;
      case 'code':
        return <CodeTab config={config} onConfigUpdate={onConfigUpdate} />;
      default:
        return <div className="p-6 text-center text-gray-500">
            Sélectionnez un onglet pour commencer la configuration.
          </div>;
    }
  };
  return <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto h-full py-0 my-[30px]">
      {renderTabContent()}
    </div>;
};
export default QualifioContentPanel;