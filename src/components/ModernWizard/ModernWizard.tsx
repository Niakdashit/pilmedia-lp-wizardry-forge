import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CampaignType } from '../../utils/campaignTypes';
import GameSelectionStep from './steps/GameSelectionStep';
import BrandAssetsStep from './steps/BrandAssetsStep';
import GenerationStep from './steps/GenerationStep';
import PreviewStep from './steps/PreviewStep';
import PublishStep from './steps/PublishStep';
import { Settings, Upload, Wand2, Eye, Sparkles } from 'lucide-react';
export interface WizardData {
  selectedGame?: CampaignType;
  logo?: string;
  desktopVisual?: string;
  mobileVisual?: string;
  productName?: string;
  generatedCampaign?: any;
  customizations?: any;
}
const ModernWizard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>({
    selectedGame: searchParams.get('type') as CampaignType || undefined
  });
  const steps = [{
    id: 'mechanic',
    label: 'Mécanique',
    icon: Settings
  }, {
    id: 'content',
    label: 'Contenus',
    icon: Upload
  }, {
    id: 'generation',
    label: 'Génération',
    icon: Wand2
  }, {
    id: 'preview',
    label: 'Aperçu',
    icon: Eye
  }, {
    id: 'publish',
    label: 'Publication',
    icon: Sparkles
  }];
  const updateWizardData = (data: Partial<WizardData>) => {
    setWizardData(prev => ({
      ...prev,
      ...data
    }));
  };
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };
  const renderCurrentStep = () => {
    const commonProps = {
      wizardData,
      updateWizardData,
      nextStep,
      prevStep,
      goToStep,
      currentStep,
      totalSteps: steps.length
    };
    switch (steps[currentStep].id) {
      case 'mechanic':
        return <GameSelectionStep {...commonProps} />;
      case 'content':
        return <BrandAssetsStep {...commonProps} />;
      case 'generation':
        return <GenerationStep {...commonProps} />;
      case 'preview':
        return <PreviewStep {...commonProps} />;
      case 'publish':
        return <PublishStep {...commonProps} />;
      default:
        return <GameSelectionStep {...commonProps} />;
    }
  };
  return <div className="min-h-screen">
      <div className="max-w-7xl mx-auto py-8 px-0">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#141e29] mb-3">Créer une nouvelle campagne</h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Configurez votre expérience interactive en quelques étapes simples
          </p>
        </div>
        
        {/* Stepper */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100/50 mb-8">
          <div className="flex items-center justify-between max-w-4xl">
            {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === index;
            const isCompleted = currentStep > index;
            const isAccessible = index <= currentStep + 1;
            return <React.Fragment key={step.id}>
                  <button onClick={() => isAccessible && goToStep(index)} disabled={!isAccessible} className={`flex flex-col items-center space-y-2 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-[#951b6d] text-white shadow-md' : isCompleted ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : isAccessible ? 'bg-gray-50 text-gray-600 hover:bg-gray-100' : 'bg-gray-25 text-gray-400 cursor-not-allowed'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-white/20' : isCompleted ? 'bg-emerald-100' : 'bg-white'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium">{step.label}</span>
                  </button>
                  
                  {index < steps.length - 1 && <div className={`w-12 h-px ${currentStep > index ? 'bg-emerald-300' : 'bg-gray-200'}`} />}
                </React.Fragment>;
          })}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {renderCurrentStep()}
        </div>
      </div>
    </div>;
};
export default ModernWizard;