
import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import QuickCampaignCreator from '../components/QuickCampaign/QuickCampaignCreator';
import BrandGameGenerator from '../components/BrandGameGenerator/BrandGameGenerator';
import { GeneratedGameConcept } from '../services/openAIGameGeneratorService';
import { BrandData } from '../services/scrapingBeeService';
import { transformBrandGameToCampaign } from '../utils/brandGameTransformer';
import { useQuickCampaignStore } from '../stores/quickCampaignStore';

const QuickCampaign: React.FC = () => {
  const [showBrandGenerator, setShowBrandGenerator] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const { updateWizardData } = useQuickCampaignStore();

  const handleBrandGenerated = (concept: GeneratedGameConcept) => {
    const campaignData = transformBrandGameToCampaign(concept);
    
    // Update the store with generated data
    updateWizardData({
      gameType: campaignData.type,
      generatedCampaignData: campaignData
    });

    setShowBrandGenerator(false);
    setShowWelcome(false);
  };

  const handleManualCreation = () => {
    setShowWelcome(false);
  };

  if (showBrandGenerator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <BrandGameGenerator
          onGameGenerated={handleBrandGenerated}
          onCancel={() => setShowBrandGenerator(false)}
        />
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
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
              Générez automatiquement depuis un site web ou créez manuellement.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => setShowBrandGenerator(true)}
                className="w-full px-8 py-4 bg-gradient-to-r from-[#841b60] to-[#6d164f] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium flex items-center justify-center gap-3"
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

  return <QuickCampaignCreator />;
};

export default QuickCampaign;
