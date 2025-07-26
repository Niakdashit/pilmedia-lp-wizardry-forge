
import React from 'react';
import ConfigurationTab from './SidebarTabs/ConfigurationTab';
import DesignTab from './SidebarTabs/DesignTab';
import TextsTab from './SidebarTabs/TextsTab';
import LayersTab from './SidebarTabs/LayersTab';
import LayoutResponsiveTab from './SidebarTabs/LayoutResponsiveTab';

import FinalizationTab from './SidebarTabs/FinalizationTab';
import type { EditorConfig } from './GameEditorLayout';

interface GameContentPanelProps {
  activeTab: string;
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
  triggerAutoSync?: (customTexts: any[]) => void;
}

const GameContentPanel: React.FC<GameContentPanelProps> = ({
  activeTab,
  config,
  onConfigUpdate,
  triggerAutoSync
}) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'configuration':
        return (
          <ConfigurationTab
            config={config}
            onConfigUpdate={onConfigUpdate}
          />
        );
      case 'design':
        return (
          <DesignTab
            config={config}
            onConfigUpdate={onConfigUpdate}
          />
        );
      case 'texts':
        return (
          <TextsTab
            config={config}
            onConfigUpdate={onConfigUpdate}
          />
        );
      case 'layers':
        return (
          <LayersTab
            config={config}
            onConfigUpdate={onConfigUpdate}
          />
        );
      case 'layout':
        return (
          <LayoutResponsiveTab
            config={config}
            onConfigUpdate={onConfigUpdate}
            triggerAutoSync={triggerAutoSync}
          />
        );
      case 'finalization':
        return (
          <FinalizationTab
            config={config}
            onConfigUpdate={onConfigUpdate}
          />
        );
      default:
        return (
          <div className="p-6 text-center text-gray-500">
            <p>Sélectionnez un onglet pour commencer</p>
          </div>
        );
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto h-full">
      {renderTabContent()}
    </div>
  );
};

export default GameContentPanel;
