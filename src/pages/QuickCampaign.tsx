import React, { useState } from 'react';
import { Sparkles, ArrowRight, Palette } from 'lucide-react';
import QuickCampaignCreator from '../components/QuickCampaign/QuickCampaignCreator';
import BrandGameGenerator from '../components/BrandGameGenerator/BrandGameGenerator';
import StudioCampaignCreator from '../components/QuickCampaign/Studio/StudioCampaignCreator';
import { GeneratedGameConcept } from '../services/openAIGameGeneratorService';
import { transformBrandGameToCampaign } from '../utils/brandGameTransformer';
import { useQuickCampaignStore } from '../stores/quickCampaignStore';

const QuickCampaign: React.FC = () => {
  const [showBrandGenerator, setShowBrandGenerator] = useState(false);
  const [showStudioCreator, setShowStudioCreator] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const store = useQuickCampaignStore();

  const handleBrandGenerated = (concept: GeneratedGameConcept) => {
    const campaignData = transformBrandGameToCampaign(concept);
    
    // Update the store with generated data - using the correct structure
    store.setSelectedGameType(campaignData.type);
    store.setCustomColors({
      primary: campaignData.design.customColors.primary,
      secondary: campaignData.design.customColors.secondary,
      accent: campaignData.design.customColors.accent,
      textColor: campaignData.design.customColors.primary // Use primary color as text color fallback
    });
    store.setCampaignName(campaignData.name);

    setShowBrandGenerator(false);
    setShowWelcome(false);
  };

  const handleManualCreation = () => {
    setShowWelcome(false);
  };

  const handleStudioCreation = () => {
    setShowStudioCreator(true);
    setShowWelcome(false);
  };

  if (showStudioCreator) {
    return <StudioCampaignCreator />;
  }

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
            <div className="w-20 h-20 bg-gradient-to-r from-[#841b60] to-[#6d164f] rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Créer une Campagne
            </h1>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              Choisissez comment vous souhaitez créer votre campagne marketing. 
              Utilisez le Studio pour un résultat professionnel ou créez manuellement.
            </p>

            <div className="space-y-4">
              <button
                onClick={handleStudioCreation}
                className="w-full px-8 py-4 bg-gradient-to-r from-[#841b60] to-[#6d164f] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium flex items-center justify-center gap-3"
              >
                <Palette className="w-5 h-5" />
                Studio de Création
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                  Niveau Pro
                </span>
              </button>

              <button
                onClick={() => setShowBrandGenerator(true)}
                className="w-full px-8 py-4 border-2 border-[#841b60] text-[#841b60] rounded-xl hover:bg-[#841b60]/5 transition-colors font-medium flex items-center justify-center gap-3"
              >
                <Sparkles className="w-5 h-5" />
                Générer depuis une URL
                <span className="bg-[#841b60]/10 px-2 py-1 rounded-full text-xs">
                  IA
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

            <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <p className="text-purple-800 text-sm">
                <strong>🎨 Studio :</strong> Interface professionnelle qui analyse votre site web, 
                extrait vos couleurs de marque et génère des campagnes de niveau Canva/Adobe avec IA avancée.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <QuickCampaignCreator />;
};

export default QuickCampaign;
