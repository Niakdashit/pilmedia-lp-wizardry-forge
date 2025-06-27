
import React from 'react';
import { useModernCampaignEditor } from '../hooks/useModernCampaignEditor';
import { gameTypeLabels } from '../components/ModernEditor/constants/gameTypeLabels';
import ModernEditorLayout from '../components/ModernEditor/ModernEditorLayout';
import ModernPreviewModal from '../components/ModernEditor/ModernPreviewModal';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, ArrowLeft } from 'lucide-react';

const ModernCampaignEditor: React.FC = () => {
  console.log('ModernCampaignEditor rendering');
  const { id } = useParams();
  const navigate = useNavigate();
  const isQuickPreview = id === 'quick-preview';
  
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
      handleSave
    } = useModernCampaignEditor();

    console.log('Editor state:', { campaign, activeTab, isLoading, campaignType, isNewCampaign });

    if (!campaign) {
      console.log('No campaign loaded, showing loading state');
      return (
        <div className="w-full h-screen bg-[#ebf4f7] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de la campagne...</p>
          </div>
        </div>
      );
    }

    // Si c'est une prévisualisation quick-preview, afficher un message pour rediriger vers l'éditeur
    if (isQuickPreview) {
      return (
        <div className="w-full h-screen bg-[#ebf4f7] overflow-hidden">
          {/* Barre de notification pour l'éditeur */}
          <div className="bg-gradient-to-r from-[#841b60] to-[#6d164f] text-white p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Edit className="w-5 h-5" />
                <div>
                  <p className="font-medium">Mode Prévisualisation</p>
                  <p className="text-sm opacity-90">
                    Pour déplacer les éléments avec drag & drop, passez en mode éditeur complet
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/quick-campaign')}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Retour</span>
                </button>
                <button
                  onClick={async () => {
                    try {
                      const savedCampaign = await handleSave(true);
                      if (savedCampaign?.id) {
                        navigate(`/modern-campaign/${savedCampaign.id}`);
                      }
                    } catch (error) {
                      console.error('Erreur lors de la sauvegarde:', error);
                    }
                  }}
                  className="flex items-center space-x-2 px-6 py-2 bg-white text-[#841b60] rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Éditeur Complet</span>
                </button>
              </div>
            </div>
          </div>

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
    }

    return (
      <div className="w-full h-screen bg-[#ebf4f7] overflow-hidden">
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
            onClick={() => window.location.href = '/quick-campaign'}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retour à QuickCampaign
          </button>
        </div>
      </div>
    );
  }
};

export default ModernCampaignEditor;
