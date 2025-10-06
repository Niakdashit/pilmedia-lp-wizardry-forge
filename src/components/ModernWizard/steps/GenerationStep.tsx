import React, { useEffect } from 'react';
import { WizardData } from '../ModernWizard';
import GenerationStatus from './GenerationStep/GenerationStatus';
import ApiStatusCard from './GenerationStep/ApiStatusCard';
import { useQuizGeneration } from './GenerationStep/useQuizGeneration';

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
  // Custom hook centralise tout l'état & la logique d'appel API
  const {
    isGenerating,
    error,
    progress,
    debugInfo,
    quizEndpoint,
    handleGenerate
  } = useQuizGeneration({ wizardData, updateWizardData, nextStep });

  useEffect(() => {
    if (!isGenerating) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <GenerationStatus
          error={error}
          progress={progress}
          debugInfo={debugInfo}
        />

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-[#841b60] hover:text-white transition-colors"
          >
            Retour
          </button>
          <div className="px-8 py-3 bg-gray-100 text-gray-500 font-semibold rounded-xl cursor-not-allowed">
            {isGenerating ? 'Génération en cours...' : 'Génération terminée'}
          </div>
        </div>
      </div>

      {/* API Status */}
      <ApiStatusCard error={error} quizEndpoint={quizEndpoint} />
    </div>
  );
};

export default GenerationStep;
