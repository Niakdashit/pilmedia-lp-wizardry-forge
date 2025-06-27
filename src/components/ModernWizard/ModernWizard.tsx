
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameSelectionStep from './steps/GameSelectionStep';
import BrandGeneratorStep from './steps/BrandGeneratorStep';
import BrandAssetsStep from './steps/BrandAssetsStep';
import AdvancedStep from './steps/AdvancedStep';
import GenerationStep from './steps/GenerationStep';
import PreviewStep from './steps/PreviewStep';
import PublishStep from './steps/PublishStep';

export interface WizardData {
  gameType?: string;
  brandGenerated?: boolean;
  generatedCampaignData?: any;
  logo?: string;
  desktopVisual?: string;
  mobileVisual?: string;
  websiteUrl?: string;
  productName?: string;
  manualContent?: string;
  extractedBrandTheme?: any;
  [key: string]: any;
}

const ModernWizard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>({});

  const steps = [
    'game-selection',
    'brand-generator', 
    'brand-assets',
    'advanced',
    'generation',
    'preview',
    'publish'
  ];

  const updateWizardData = (data: Partial<WizardData>) => {
    setWizardData(prev => ({ ...prev, ...data }));
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

  const skipStep = () => {
    nextStep();
  };

  const handleBrandGenerated = (campaignData: any) => {
    updateWizardData({ 
      brandGenerated: true,
      generatedCampaignData: campaignData,
      gameType: campaignData.type
    });
    // Skip to generation step since we have everything
    setCurrentStep(4);
  };

  const renderStep = () => {
    switch (steps[currentStep]) {
      case 'game-selection':
        return (
          <GameSelectionStep
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            nextStep={nextStep}
          />
        );

      case 'brand-generator':
        return (
          <BrandGeneratorStep
            onNext={handleBrandGenerated}
            onPrev={prevStep}
            onSkip={skipStep}
          />
        );

      case 'brand-assets':
        return (
          <BrandAssetsStep
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );

      case 'advanced':
        return (
          <AdvancedStep
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );

      case 'generation':
        return (
          <GenerationStep
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );

      case 'preview':
        return (
          <PreviewStep
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );

      case 'publish':
        return (
          <PublishStep
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onFinish={() => navigate('/gamification')}
            prevStep={prevStep}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]">
      {/* Progress Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold text-gray-900">Créateur de Campagne</h1>
            <span className="text-sm text-gray-500">
              Étape {currentStep + 1} sur {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#841b60] to-[#6d164f] h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {renderStep()}
      </div>
    </div>
  );
};

export default ModernWizard;
