
import React from 'react';
import { useModernCampaignEditor } from '../hooks/useModernCampaignEditor';
// import { gameTypeLabels } from '../components/ModernEditor/constants/gameTypeLabels';
// import ModernEditorLayout from '../components/ModernEditor/ModernEditorLayout';
import ModernPreviewModal from '../components/ModernEditor/ModernPreviewModal';

const ModernCampaignEditor: React.FC = () => {
  const {
    campaign,
    // setCampaign,
    // activeTab,
    // setActiveTab,
    showPreviewModal,
    setShowPreviewModal,
    // previewDevice,
    // setPreviewDevice,
    // isLoading,
    // campaignType,
    // isNewCampaign,
    // handleSave,
    // previewKey,
    // isPreviewLoading
  } = useModernCampaignEditor();

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
      <>
        <div className="w-full h-screen overflow-hidden bg-gray-50 flex items-center justify-center">
          <div className="text-center text-gray-500">
            Éditeur moderne temporairement indisponible
          </div>
        </div>

        {/* Preview Modal */}
        {showPreviewModal && (
          <ModernPreviewModal
            isOpen={showPreviewModal}
            onClose={() => setShowPreviewModal(false)}
            campaign={campaign}
          />
        )}
      </>
    );
};

export default ModernCampaignEditor;
