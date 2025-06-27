
import React from 'react';
import ModernGameTab from './ModernGameTab';
import ModernAppearanceTab from './ModernAppearanceTab';
import ModernContentTab from './ModernContentTab';
import ModernFormTab from './ModernFormTab';
import ModernMobileTab from './ModernMobileTab';
import ModernSettingsTab from './ModernSettingsTab';

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
      case 'appearance':
        return <ModernAppearanceTab campaign={safeCampaign} setCampaign={safeSetCampaign} />;
      case 'content':
        return <ModernContentTab campaign={safeCampaign} setCampaign={safeSetCampaign} />;
      case 'form':
        return <ModernFormTab campaign={safeCampaign} setCampaign={safeSetCampaign} />;
      case 'mobile':
        return <ModernMobileTab campaign={safeCampaign} setCampaign={safeSetCampaign} />;
      case 'settings':
        return <ModernSettingsTab campaign={safeCampaign} setCampaign={safeSetCampaign} />;
      default:
        return <div className="p-4 text-center text-gray-500">
            Sélectionnez un onglet pour commencer
          </div>;
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-2 px-[10px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default ModernEditorPanel;
