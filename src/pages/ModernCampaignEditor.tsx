
import React, { useState, useEffect } from 'react';
import { useModernCampaignEditor } from '../hooks/useModernCampaignEditor';
import { gameTypeLabels } from '../components/ModernEditor/constants/gameTypeLabels';
import ModernEditorLayout from '../components/ModernEditor/ModernEditorLayout';
import MobileCanvaEditor from '../components/ModernEditor/MobileCanvaEditor';
import ModernPreviewModal from '../components/ModernEditor/ModernPreviewModal';

const ModernCampaignEditor: React.FC = () => {
  const {
    campaign,
    setCampaign,
    activeTab,
    setActiveTab,
    showPreviewModal,
    setShowPreviewModal,
    previewDevice,
    setPreviewDevice,
    isLoading,
    campaignType,
    isNewCampaign,
    handleSave,
    previewKey,
    isPreviewLoading
  } = useModernCampaignEditor();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

    if (!campaign) {
      return (
        <div className="w-full h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement de la campagne...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-screen overflow-hidden bg-gray-50">
        {isMobile ? (
          <MobileCanvaEditor
            campaign={campaign}
            setCampaign={setCampaign}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            previewDevice={previewDevice}
            onDeviceChange={setPreviewDevice}
            onSave={() => handleSave(true)}
            onPreview={() => setShowPreviewModal(true)}
            isLoading={isLoading}
            previewKey={previewKey}
          />
        ) : (
          <ModernEditorLayout
            campaign={campaign}
            setCampaign={setCampaign}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            previewDevice={previewDevice}
            onDeviceChange={setPreviewDevice}
            onSave={() => handleSave(true)}
            onPreview={() => setShowPreviewModal(true)}
            isLoading={isLoading}
            campaignType={campaignType}
            isNewCampaign={isNewCampaign}
            gameTypeLabels={gameTypeLabels}
            previewKey={previewKey}
            isPreviewLoading={isPreviewLoading}
          />
        )}

        {/* Preview Modal */}
        {showPreviewModal && (
          <ModernPreviewModal
            isOpen={showPreviewModal}
            onClose={() => setShowPreviewModal(false)}
            campaign={campaign}
          />
        )}
      </div>
    );
};

export default ModernCampaignEditor;
