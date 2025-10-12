
import React from 'react';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { useQuickCampaignStore } from '../../../stores/quickCampaignStore';

const ProgressIndicator: React.FC = () => {
  const { currentStep, setCurrentStep } = useQuickCampaignStore();

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
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Progression</h3>
        
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => canNavigateToStep(step.id) && setCurrentStep(step.id)}
                disabled={!canNavigateToStep(step.id)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  currentStep === step.id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : currentStep > step.id
                    ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                    : canNavigateToStep(step.id)
                    ? 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                    : 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex-shrink-0">
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Circle className={`w-5 h-5 ${currentStep === step.id ? 'fill-current' : ''}`} />
                  )}
                </div>
                <div className="text-left">
                  <div className="font-medium">{step.title}</div>
                  <div className={`text-xs ${
                    currentStep === step.id ? 'text-blue-100' : 
                    currentStep > step.id ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.description}
                  </div>
                </div>
              </button>
              
              {index < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={() => setCurrentStep(4)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <span className="font-medium">Finaliser</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ProgressIndicator;
