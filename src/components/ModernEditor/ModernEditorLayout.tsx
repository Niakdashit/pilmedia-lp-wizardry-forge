
import React from 'react';
import ModernEditorSidebar from './ModernEditorSidebar';
import ModernEditorPanel from './ModernEditorPanel';
import OptimizedPreviewCanvas from './components/OptimizedPreviewCanvas';
import EditorHeader from './components/EditorHeader';
import PreviewDeviceButtons from './components/PreviewDeviceButtons';

interface ModernEditorLayoutProps {
  campaign: any;
  setCampaign: (updater: (prev: any) => any) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
  onSave: () => void;
  onPreview: () => void;
  isLoading: boolean;
  campaignType: string;
  isNewCampaign: boolean;
  gameTypeLabels: Record<string, string>;
}

const ModernEditorLayout: React.FC<ModernEditorLayoutProps> = ({
  campaign,
  setCampaign,
  activeTab,
  onTabChange,
  previewDevice,
  onDeviceChange,
  onSave,
  onPreview,
  isLoading,
  campaignType,
  isNewCampaign,
  gameTypeLabels
}) => {
  return (
    <div className="w-full h-screen bg-[#ebf4f7] flex flex-col overflow-hidden">
      {/* Header */}
      <EditorHeader
        campaign={campaign}
        onSave={onSave}
        onPreview={onPreview}
        isLoading={isLoading}
        campaignType={campaignType}
        isNewCampaign={isNewCampaign}
        gameTypeLabels={gameTypeLabels}
      />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Configuration Panel */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Sidebar Navigation */}
          <div className="w-20 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200">
            <ModernEditorSidebar
              activeTab={activeTab}
              onTabChange={onTabChange}
              campaignType={campaignType as any}
            />
          </div>
          
          {/* Configuration Panel */}
          <div className="flex-1 overflow-hidden">
            <ModernEditorPanel
              activeStep={activeTab}
              campaign={campaign}
              setCampaign={setCampaign}
            />
          </div>
        </div>

        {/* Preview Section */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Preview Header */}
          <div className="h-16 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Aperçu en temps réel</h3>
              <p className="text-sm text-gray-600">
                {campaign?.name || 'Campagne sans nom'} • {gameTypeLabels[campaignType] || campaignType}
              </p>
            </div>
            
            <PreviewDeviceButtons
              selectedDevice={previewDevice}
              onDeviceChange={onDeviceChange}
            />
          </div>

          {/* Preview Canvas */}
          <div className="flex-1 relative overflow-hidden">
            <OptimizedPreviewCanvas
              campaign={campaign}
              selectedDevice={previewDevice}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernEditorLayout;
