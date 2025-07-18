import React from 'react';
import type { EditorConfig } from './QualifioEditorLayout';
import GeneralTab from './SidebarTabs/GeneralTab';
import GameZoneTab from './SidebarTabs/GameZoneTab';
import GameMechanicsTab from './SidebarTabs/GameMechanicsTab';
import DesignTab from './SidebarTabs/DesignTab';
import FormTab from './SidebarTabs/FormTab';

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
      case 'game':
        return <GameZoneTab config={config} onConfigUpdate={onConfigUpdate} />;
      case 'layout':
        return <GameMechanicsTab config={config} onConfigUpdate={onConfigUpdate} />;
      case 'design':
        return <DesignTab config={config} onConfigUpdate={onConfigUpdate} />;
      case 'form':
        return <FormTab config={config} onConfigUpdate={onConfigUpdate} />;
      case 'mobile':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Configuration Mobile</h3>
            <p className="text-gray-500">Paramètres spécifiques à l'affichage mobile en cours de développement.</p>
          </div>
        );
      default:
        return (
          <div className="p-6 text-center text-gray-500">
            Sélectionnez un onglet pour commencer la configuration.
          </div>
        );
    }
  };

  return (
    <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto h-full">
      {renderTabContent()}
    </div>
  );
};

export default QualifioContentPanel;