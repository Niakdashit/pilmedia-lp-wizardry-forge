
import React from 'react';
import type { EditorConfig } from './QualifioEditorLayout';
import ConfigurationTab from './SidebarTabs/ConfigurationTab';
import ElementsLibraryTab from './SidebarTabs/ElementsLibraryTab';
import DesignContentTab from './SidebarTabs/DesignContentTab';
import LayersTab from './SidebarTabs/LayersTab';
import LayoutResponsiveTab from './SidebarTabs/LayoutResponsiveTab';
import FinalizationTab from './SidebarTabs/FinalizationTab';

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
      case 'configuration':
        return <ConfigurationTab config={config} onConfigUpdate={onConfigUpdate} />;
      case 'elements':
        return <ElementsLibraryTab config={config} onConfigUpdate={onConfigUpdate} />;
      case 'design':
        return <DesignContentTab config={config} onConfigUpdate={onConfigUpdate} />;
      case 'layers':
        return <LayersTab config={config} onConfigUpdate={onConfigUpdate} />;
      case 'layout':
        return <LayoutResponsiveTab config={config} onConfigUpdate={onConfigUpdate} />;
      case 'finalization':
        return <FinalizationTab config={config} onConfigUpdate={onConfigUpdate} />;
      default:
        return (
          <div className="p-6 text-center text-gray-500">
            Sélectionnez un onglet pour commencer la configuration.
          </div>
        );
    }
  };

  return (
    <div 
      className="w-96 bg-white border-r border-gray-200 overflow-y-auto" 
      style={{ height: 'calc(100vh - 88px)' }}
    >
      {renderTabContent()}
    </div>
  );
};

export default QualifioContentPanel;
