
import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import BrandGameGenerator from '../components/BrandGameGenerator/BrandGameGenerator';
import { GeneratedGameConcept } from '../services/openAIGameGeneratorService';
import { transformBrandGameToCampaign } from '../utils/brandGameTransformer';
import { useQuickCampaignStore } from '../stores/quickCampaignStore';
import QuickCampaignStudio from '../components/QuickCampaign/NewInterface/QuickCampaignStudio';

const QuickCampaign: React.FC = () => {
  const [showBrandGenerator, setShowBrandGenerator] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const store = useQuickCampaignStore();

  // Check for saved draft
  useEffect(() => {
    const savedDraft = localStorage.getItem('quickCampaignDraft');
    if (savedDraft) {
      try {
        const { data, timestamp } = JSON.parse(savedDraft);
        // If draft is less than 24 hours old, ask user if they want to restore
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          const restore = window.confirm('Souhaitez-vous reprendre votre campagne en cours ?');
          if (restore) {
            store.setCampaignName(data.campaignName);
            store.setSelectedGameType(data.selectedGameType);
            store.setCustomColors(data.customColors);
            if (data.logoUrl) store.setLogo(null, data.logoUrl);
            if (data.backgroundImageUrl) store.setBackgroundImageUrl(data.backgroundImageUrl);
            setShowWelcome(false);
          }
        }
      } catch (error) {
        console.error('Error restoring draft:', error);
      }
    }
  }, []);

  const handleBrandGenerated = (concept: GeneratedGameConcept) => {
    const campaignData = transformBrandGameToCampaign(concept);
    
    // Update the store with generated data
    store.setSelectedGameType(campaignData.type);
    store.setCustomColors({
      primary: campaignData.design.customColors.primary,
      secondary: campaignData.design.customColors.secondary,
      accent: campaignData.design.customColors.accent,
      textColor: campaignData.design.customColors.primary
    });
    store.setCampaignName(campaignData.name);

    setShowBrandGenerator(false);
    setShowWelcome(false);
  };

  const handleManualCreation = () => {
    setShowWelcome(false);
  };

  if (showBrandGenerator) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <BrandGameGenerator
          onGameGenerated={handleBrandGenerated}
          onCancel={() => setShowBrandGenerator(false)}
        />
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Créer une Campagne
            </h1>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              Choisissez comment vous souhaitez créer votre campagne marketing. 
              Générez automatiquement depuis un site web ou créez manuellement.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => setShowBrandGenerator(true)}
                className="w-full px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:shadow-lg transition-all duration-300 font-medium flex items-center justify-center gap-3"
              >
                <Sparkles className="w-5 h-5" />
                Générer depuis une URL
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                  Nouveau
                </span>
              </button>

              <button
                onClick={handleManualCreation}
                className="w-full px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
              >
                Création manuelle
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>💡 Astuce :</strong> La génération automatique analyse un site web 
                pour extraire les couleurs, logos et créer une campagne parfaitement adaptée à la marque.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <QuickCampaignStudio />;
};

export default QuickCampaign;
