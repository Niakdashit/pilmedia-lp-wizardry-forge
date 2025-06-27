
import React, { useState } from 'react';
import { Settings, Rocket, Eye, Edit } from 'lucide-react';
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
      
      // Sauvegarder d'abord la campagne
      const savedCampaign = await saveCampaign(quickCampaign);
      
      console.log('Campaign saved, redirecting to modern editor');
      
      // Rediriger vers l'éditeur moderne avec l'ID de la campagne sauvegardée
      navigate(`/modern-campaign/${savedCampaign.id}`);
      
    } catch (error) {
      console.error('Erreur lors de la redirection vers les paramètres avancés:', error);
      
      // Fallback: utiliser l'ID de prévisualisation
      const quickCampaign = generatePreviewCampaign();
      localStorage.setItem('quickCampaignPreview', JSON.stringify(quickCampaign));
      navigate(`/modern-campaign/quick-preview`);
    }
  };

  const handleEditInModernEditor = async () => {
    try {
      // Générer et sauvegarder la campagne
      const quickCampaign = generatePreviewCampaign();
      const savedCampaign = await saveCampaign(quickCampaign);
      
      console.log('Redirecting to modern editor for editing:', savedCampaign.id);
      
      // Rediriger directement vers l'éditeur moderne
      navigate(`/modern-campaign/${savedCampaign.id}`);
      
    } catch (error) {
      console.error('Erreur lors de la redirection vers l\'éditeur:', error);
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                Prévisualiser votre campagne
              </p>
            </button>

            {/* Éditeur moderne */}
            <button
              onClick={handleEditInModernEditor}
              className="flex flex-col items-center p-6 border-2 border-indigo-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Edit className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Éditeur</h3>
              <p className="text-sm text-gray-600 text-center">
                Éditer avec drag & drop
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
              <h3 className="font-semibold text-gray-900 mb-2">Paramètres</h3>
              <p className="text-sm text-gray-600 text-center">
                Configuration avancée
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
                Publier immédiatement
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
