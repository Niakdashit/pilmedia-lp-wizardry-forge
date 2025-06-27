
import React from 'react';
import ModernGeneralTab from './ModernGeneralTab';
import ModernGameTab from './ModernGameTab';
import PlacementTab from './tabs/PlacementTab';
import AppearanceTab from './tabs/AppearanceTab';
import ModernFormTab from './ModernFormTab';
import ModernMobileTab from './ModernMobileTab';

interface ModernEditorPanelProps {
  activeStep: string;
  campaign: any;
  setCampaign: (updater: (prev: any) => any) => void;
}

const ModernEditorPanel: React.FC<ModernEditorPanelProps> = ({
  activeStep,
  campaign,
  setCampaign
}) => {
  // Ensure campaign has default structure to prevent undefined errors
  const safeSetCampaign = (updater: any) => {
    if (typeof updater === 'function') {
      setCampaign((prev: any) => {
        const currentCampaign = prev || {
          design: {},
          type: 'wheel',
          screens: {},
          buttonConfig: {},
          gameConfig: {}
        };
        return updater(currentCampaign);
      });
    } else {
      setCampaign(() => updater || {
        design: {},
        type: 'wheel',
        screens: {},
        buttonConfig: {},
        gameConfig: {}
      });
    }
  };

  const safeCampaign = campaign || {
    design: {},
    type: 'wheel',
    screens: {},
    buttonConfig: {},
    gameConfig: {}
  };

  const renderContent = () => {
    switch (activeStep) {
      case 'game':
        return <ModernGameTab campaign={safeCampaign} setCampaign={safeSetCampaign} />;
      case 'design':
        return <AppearanceTab campaign={safeCampaign} setCampaign={safeSetCampaign} />;
      case 'gameconfig':
        return <PlacementTab campaign={safeCampaign} setCampaign={safeSetCampaign} />;
      case 'form':
        return <ModernFormTab campaign={safeCampaign} setCampaign={safeSetCampaign} />;
      case 'mobile':
        return <ModernMobileTab campaign={safeCampaign} setCampaign={safeSetCampaign} />;
      case 'general':
        return <ModernGeneralTab campaign={safeCampaign} setCampaign={safeSetCampaign} />;
      default:
        return <div className="p-6 text-center text-gray-500">
            Sélectionnez un onglet pour commencer
          </div>;
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="min-h-full">
        {renderContent()}
      </div>
    </div>
  );
};

export default ModernEditorPanel;
