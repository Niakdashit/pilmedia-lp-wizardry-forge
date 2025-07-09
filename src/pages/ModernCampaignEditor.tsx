
import React from 'react';
import { useModernCampaignEditor } from '../hooks/useModernCampaignEditor';
import { gameTypeLabels } from '../components/ModernEditor/constants/gameTypeLabels';
import ModernEditorLayout from '../components/ModernEditor/ModernEditorLayout';
import ModernPreviewModal from '../components/ModernEditor/ModernPreviewModal';

const ModernCampaignEditor: React.FC = () => {
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
      previewKey,
      isPreviewLoading
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
          previewKey={previewKey}
          isPreviewLoading={isPreviewLoading}
        />

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
  } catch (error) {
    console.error('Error in ModernCampaignEditor:', error);
      return (
        <div className="w-full h-screen bg-red-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur de l'éditeur</h1>
            <p className="text-red-500 mb-4">L'éditeur moderne n'a pas pu se charger correctement.</p>
            <pre className="text-xs text-red-400 bg-red-100 p-2 rounded mb-4">
              {error instanceof Error ? error.message : 'Erreur inconnue'}
            </pre>
            <button 
              onClick={() => window.location.href = '/campaigns'}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retour aux campagnes
            </button>
          </div>
        </div>
      );
  }
};

export default ModernCampaignEditor;
