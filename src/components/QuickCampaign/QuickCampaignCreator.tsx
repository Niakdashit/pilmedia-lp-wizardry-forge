
import React from 'react';
import { useQuickCampaignStore } from '../../stores/quickCampaignStore';
import Step1GameSelection from './Step1GameSelection';
import Step2BasicSettings from './Step2BasicSettings';
import Step3VisualStyle from './Step3VisualStyle';
import Step4Finalization from './Step4Finalization';

const QuickCampaignCreator: React.FC = () => {
  const { currentStep } = useQuickCampaignStore();

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1GameSelection />;
      case 2:
        return <Step2BasicSettings />;
      case 3:
        return <Step3VisualStyle />;
      case 4:
        return <Step4Finalization />;
      default:
        return <Step1GameSelection />;
    }
  };

  return (
    <div className="w-full">
      {renderCurrentStep()}
    </div>
  );
};

export default QuickCampaignCreator;
