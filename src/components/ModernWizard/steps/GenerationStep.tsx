
import React, { useState, useEffect } from 'react';
import { WizardData } from '../ModernWizard';
import { Wand2, CheckCircle, Loader } from 'lucide-react';

interface GenerationStepProps {
  wizardData: WizardData;
  updateWizardData: (data: Partial<WizardData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const GenerationStep: React.FC<GenerationStepProps> = ({
  wizardData,
  updateWizardData,
  nextStep,
  prevStep
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Auto-start generation when step loads
    if (!isComplete && !isGenerating) {
      handleGenerate();
    }
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update wizard data with generated campaign
    const generatedCampaign = {
      id: Date.now().toString(),
      name: wizardData.productName || 'Ma Campagne',
      type: wizardData.selectedGame,
      status: 'draft',
      design: {
        primaryColor: '#951b6d',
        background: '#f8fafc'
      }
    };
    
    updateWizardData({ generatedCampaign });
    setIsGenerating(false);
    setIsComplete(true);
  };

  return (
    <div className="space-y-6">
      {/* Main Content Card */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-100/50">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#141e29] mb-3">
            Génération de votre campagne
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-2xl">
            Notre IA configure automatiquement votre campagne en fonction de vos choix et éléments de marque.
          </p>
        </div>

        {/* Generation Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center mb-8">
          {isGenerating ? (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-[#951b6d]/10 rounded-full flex items-center justify-center mx-auto">
                <Loader className="w-8 h-8 text-[#951b6d] animate-spin" />
              </div>
              <div>
                <h3 className="font-semibold text-[#141e29] mb-2">Génération en cours...</h3>
                <p className="text-gray-600">Configuration des paramètres et personnalisation</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#951b6d] h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          ) : isComplete ? (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-[#141e29] mb-2">Campagne générée avec succès !</h3>
                <p className="text-gray-600">Votre campagne est prête à être personnalisée</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-[#951b6d]/10 rounded-full flex items-center justify-center mx-auto">
                <Wand2 className="w-8 h-8 text-[#951b6d]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#141e29] mb-2">Prêt à générer</h3>
                <p className="text-gray-600">Cliquez pour lancer la génération automatique</p>
              </div>
              <button
                onClick={handleGenerate}
                className="px-8 py-3 bg-[#951b6d] text-white font-semibold rounded-xl hover:bg-[#7d1659] transition-colors shadow-sm hover:shadow-md"
              >
                Lancer la génération
              </button>
            </div>
          )}
        </div>

        {/* Generated Campaign Preview */}
        {isComplete && wizardData.generatedCampaign && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
            <h3 className="font-semibold text-[#141e29] mb-4">Aperçu de votre campagne</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type de jeu:</span>
                  <span className="font-medium text-[#141e29] capitalize">{wizardData.selectedGame}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nom:</span>
                  <span className="font-medium text-[#141e29]">{wizardData.productName || 'Ma Campagne'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut:</span>
                  <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                    Brouillon
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Couleur principale:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-[#951b6d] rounded"></div>
                    <span className="font-medium text-[#141e29]">#951b6d</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Éléments configurés:</span>
                  <span className="font-medium text-[#141e29]">
                    {[wizardData.logo, wizardData.desktopVisual, wizardData.mobileVisual].filter(Boolean).length}/3
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Retour
          </button>
          {isComplete && (
            <button
              onClick={nextStep}
              className="px-8 py-3 bg-[#951b6d] text-white font-semibold rounded-xl hover:bg-[#7d1659] transition-colors shadow-sm hover:shadow-md"
            >
              Continuer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerationStep;
