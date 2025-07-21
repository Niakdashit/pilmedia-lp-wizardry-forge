
import React from 'react';
import GeneralTab from './SidebarTabs/GeneralTab';
import DesignTab from './SidebarTabs/DesignTab';
import ConfigurationTab from './SidebarTabs/ConfigurationTab';
import FormTab from './SidebarTabs/FormTab';
import LayoutResponsiveTab from './SidebarTabs/LayoutResponsiveTab';
import type { EditorConfig } from './QualifioEditorLayout';

interface QualifioContentPanelProps {
  activeTab: string;
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
  autoSyncSettings?: {
    isAutoSyncEnabled: boolean;
    setIsAutoSyncEnabled: (enabled: boolean) => void;
    isRealTimeSyncEnabled: boolean;
    setIsRealTimeSyncEnabled: (enabled: boolean) => void;
    onManualSync: (baseDevice?: 'desktop' | 'tablet' | 'mobile') => void;
  };
}

const QualifioContentPanel: React.FC<QualifioContentPanelProps> = ({ 
  activeTab, 
  config, 
  onConfigUpdate,
  autoSyncSettings
}) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralTab config={config} onConfigUpdate={onConfigUpdate} />;
      case 'design':
        return <DesignTab config={config} onConfigUpdate={onConfigUpdate} />;
      case 'configuration':
        return <ConfigurationTab config={config} onConfigUpdate={onConfigUpdate} />;
      case 'form':
        return <FormTab config={config} onConfigUpdate={onConfigUpdate} />;
      case 'layout':
        return (
          <LayoutResponsiveTab 
            config={config} 
            onConfigUpdate={onConfigUpdate}
            autoSyncSettings={autoSyncSettings}
          />
        );
      default:
        return <GeneralTab config={config} onConfigUpdate={onConfigUpdate} />;
    }
  };

  return (
    <div className="w-[360px] h-screen overflow-y-auto bg-white border-r border-gray-200">
      {renderTabContent()}
    </div>
  );
};

export default QualifioContentPanel;
