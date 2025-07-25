import React from 'react';
import { useModernCampaignEditor } from '../hooks/useModernCampaignEditor';
import { gameTypeLabels } from '../components/ModernEditor/constants/gameTypeLabels';
import ModernEditorLayout from '../components/ModernEditor/ModernEditorLayout';
import ModernPreviewModal from '../components/ModernEditor/ModernPreviewModal';

const DesignEditor: React.FC = () => {
  try {
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
      optimizedPreviewConfig,
      isPreviewLoading
    } = useModernCampaignEditor();

    if (isLoading) {
      return (
        <div className="w-full h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement de l'éditeur de design...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-screen overflow-hidden bg-gray-50">
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
          isPreviewLoading={isPreviewLoading}
        />
        
        <ModernPreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          campaign={optimizedPreviewConfig}
        />
      </div>
    );
  } catch (error) {
    console.error('Error in DesignEditor:', error);
    
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur dans l'éditeur</h1>
          <p className="text-gray-600 mb-6">Une erreur s'est produite lors du chargement de l'éditeur de design.</p>
          <button 
            onClick={() => window.location.href = '/campaigns'}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md"
          >
            Retour aux campagnes
          </button>
        </div>
      </div>
    );
  }
};

export default DesignEditor;