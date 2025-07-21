
import React from 'react';
import { CheckCircle, Circle, ArrowRight, Settings } from 'lucide-react';
import { useQuickCampaignStore } from '../../../stores/quickCampaignStore';

const ProgressIndicator: React.FC = () => {
  const { 
    currentStep, 
    setCurrentStep, 
    selectedGameType, 
    customColors, 
    campaignName, 
    generatePreviewCampaign 
  } = useQuickCampaignStore();

  const steps = [
    { id: 1, title: 'Type de jeu', description: 'Choisir le jeu' },
    { id: 2, title: 'Configuration', description: 'Paramètres de base' },
    { id: 3, title: 'Style visuel', description: 'Personnalisation' },
    { id: 4, title: 'Finalisation', description: 'Publication' }
  ];

  const canNavigateToStep = (stepId: number) => {
    return stepId <= currentStep || stepId === currentStep + 1;
  };

  return (
    <div className="bg-card rounded-3xl shadow-lg border p-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground">Progression</h3>
        
        <div className="flex items-center space-x-6">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => canNavigateToStep(step.id) && setCurrentStep(step.id)}
                disabled={!canNavigateToStep(step.id)}
                className={`flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-200 ${
                  currentStep === step.id
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg'
                    : currentStep > step.id
                    ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                    : canNavigateToStep(step.id)
                    ? 'bg-muted text-foreground border hover:bg-muted/80'
                    : 'bg-muted text-muted-foreground border cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex-shrink-0">
                  {currentStep > step.id ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Circle className={`w-6 h-6 ${currentStep === step.id ? 'fill-current' : ''}`} />
                  )}
                </div>
                <div className="text-left">
                  <div className="font-semibold">{step.title}</div>
                  <div className={`text-sm ${
                    currentStep === step.id ? 'text-primary-foreground/80' : 
                    currentStep > step.id ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    {step.description}
                  </div>
                </div>
              </button>
              
              {index < steps.length - 1 && (
                <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              // Transfer data to campaign editor
              const campaignData = {
                selectedGameType,
                customColors,
                campaignName,
                mockCampaign: generatePreviewCampaign()
              };
              localStorage.setItem('quickCampaignTransfer', JSON.stringify(campaignData));
              window.location.href = '/campaign-editor';
            }}
            className="flex items-center space-x-2 px-6 py-3 border-2 border-primary text-primary rounded-2xl hover:bg-primary/10 transition-all duration-200 font-semibold"
          >
            <Settings className="w-5 h-5" />
            <span>Paramètres avancés</span>
          </button>
          
          <button
            onClick={() => setCurrentStep(4)}
            className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl hover:shadow-lg transition-all duration-200 font-semibold"
          >
            <span>Finaliser</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
