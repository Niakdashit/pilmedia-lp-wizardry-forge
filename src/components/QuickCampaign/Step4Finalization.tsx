
import React, { useState } from 'react';
import { Settings, Rocket, Eye } from 'lucide-react';
import { useQuickCampaignStore } from '../../stores/quickCampaignStore';
import { useNavigate } from 'react-router-dom';
import { useCampaigns } from '../../hooks/useCampaigns';

const Step4Finalization: React.FC = () => {
  const [isPublishing, setIsPublishing] = useState(false);
  const { 
    campaignName, 
    selectedGameType, 
    generatePreviewCampaign,
    reset 
  } = useQuickCampaignStore();
  const navigate = useNavigate();
  const { saveCampaign } = useCampaigns();

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const campaign = generatePreviewCampaign();
      await saveCampaign(campaign);
      reset();
      navigate('/gamification');
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleAdvancedSettings = async () => {
    try {
      // Générer la campagne avec toutes les données de QuickCampaign
      const quickCampaign = generatePreviewCampaign();
      
      console.log('QuickCampaign data being transferred:', quickCampaign);
      
      // Transformer les données QuickCampaign vers le format EditorConfig
      const editorConfig = {
        width: 810,
        height: 1200,
        anchor: 'fixed',
        gameType: quickCampaign.type || 'wheel',
        gameMode: 'mode1-sequential',
        displayMode: 'mode1-banner-game',
        storyText: quickCampaign.general?.description || `Campagne ${quickCampaign.type} créée avec QuickCampaign`,
        publisherLink: quickCampaign.general?.brandSiteUrl || '',
        prizeText: `Participez et tentez de gagner !`,
        customTexts: [],
        centerText: false,
        centerForm: true,
        centerGameZone: true,
        backgroundColor: quickCampaign.design?.backgroundColor || '#ffffff',
        outlineColor: quickCampaign.design?.borderColor || '#ffffff',
        borderStyle: 'classic',
        jackpotBorderStyle: 'classic',
        participateButtonText: quickCampaign.buttonConfig?.text || 'PARTICIPER !',
        participateButtonColor: quickCampaign.design?.primaryColor || '#ff6b35',
        participateButtonTextColor: quickCampaign.design?.accentColor || '#ffffff',
        footerText: '',
        footerColor: '#f8f9fa',
        customCSS: '',
        customJS: '',
        trackingTags: '',
        deviceConfig: {
          mobile: {
            fontSize: 14,
            backgroundImage: quickCampaign.design?.backgroundImage || undefined,
            gamePosition: { x: 0, y: 0, scale: 1.7 }
          },
          tablet: {
            fontSize: 16,
            backgroundImage: quickCampaign.design?.backgroundImage || undefined,
            gamePosition: { x: 0, y: 0, scale: 1.7 }
          },
          desktop: {
            fontSize: 18,
            backgroundImage: quickCampaign.design?.backgroundImage || undefined,
            gamePosition: { x: 0, y: 0, scale: 1.7 }
          }
        },
        autoSyncOnDeviceChange: false,
        autoSyncRealTime: false,
        autoSyncBaseDevice: 'desktop',
        // Ajouter toutes les données spécifiques du jeu
        gameConfig: quickCampaign.gameConfig || {},
        wheelConfig: quickCampaign.config?.roulette || {},
        brandAnalysis: quickCampaign.brandAnalysis || null,
        centerLogo: quickCampaign.design?.centerLogo || null,
        designColors: quickCampaign.design?.customColors || {}
      };
      
      // Store both the original campaign data and the editor config
      localStorage.setItem('quickCampaignPreview', JSON.stringify(quickCampaign));
      localStorage.setItem('editorConfig', JSON.stringify(editorConfig));
      
      console.log('Editor config created:', editorConfig);
      
      // Navigate to campaign editor
      navigate('/campaign-editor');
    } catch (error) {
      console.error('Erreur lors du transfert vers l\'éditeur:', error);
    }
  };

  const handlePreview = () => {
    // Logique d'aperçu existante
    const campaign = generatePreviewCampaign();
    console.log('Preview campaign:', campaign);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Finalisation de votre campagne
          </h1>
          <p className="text-gray-600">
            Votre campagne "{campaignName}" est prête à être publiée
          </p>
        </div>

        {/* Résumé de la campagne */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Résumé de votre campagne</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Nom de la campagne</label>
                <p className="text-gray-900 font-medium">{campaignName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Type de jeu</label>
                <p className="text-gray-900 font-medium capitalize">{selectedGameType}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Statut</label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  Prêt à publier
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Actions disponibles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Aperçu */}
            <button
              onClick={handlePreview}
              className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Aperçu</h3>
              <p className="text-sm text-gray-600 text-center">
                Prévisualiser votre campagne avant publication
              </p>
            </button>

            {/* Paramètres avancés */}
            <button
              onClick={handleAdvancedSettings}
              className="flex flex-col items-center p-6 border-2 border-purple-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Paramètres avancés</h3>
              <p className="text-sm text-gray-600 text-center">
                Peaufiner votre campagne avec l'éditeur complet
              </p>
            </button>

            {/* Publication */}
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex flex-col items-center p-6 border-2 border-green-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {isPublishing ? 'Publication...' : 'Publier'}
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Publier votre campagne immédiatement
              </p>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => useQuickCampaignStore.getState().setCurrentStep(3)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Retour
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step4Finalization;
