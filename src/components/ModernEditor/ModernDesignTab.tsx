
import React from 'react';
import BrandingSettings from './DesignTab/BrandingSettings';
import BackgroundSettings from './DesignTab/BackgroundSettings';
import WheelBorderSettings from './DesignTab/WheelBorderSettings';
import GameStyleSettings from './DesignTab/GameStyleSettings';
import CustomTextsManager from './DesignTab/CustomTextsManager';
import CustomImagesManager from './DesignTab/CustomImagesManager';

interface ModernDesignTabProps {
  campaign: any;
  setCampaign: (campaign: any) => void;
}

const ModernDesignTab: React.FC<ModernDesignTabProps> = ({
  campaign,
  setCampaign
}) => {
  const design = campaign.design || {};
  const customTexts = design.customTexts || [];
  const customImages = design.customImages || [];

  return (
    <div className="space-y-8 px-[5px]">
      {/* Section Branding IA */}
      <BrandingSettings
        campaign={campaign}
        setCampaign={setCampaign}
      />

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Design</h2>
      </div>

      {/* Background Settings */}
      <BackgroundSettings
        design={design}
        setCampaign={setCampaign}
        campaign={campaign}
      />

      {/* Wheel Border Style - Only for wheel campaigns */}
      <WheelBorderSettings
        campaign={campaign}
        setCampaign={setCampaign}
      />

      {/* Game Style Settings */}
      <GameStyleSettings
        design={design}
        setCampaign={setCampaign}
        campaign={campaign}
      />

      {/* Custom Texts Settings */}
      <CustomTextsManager
        customTexts={customTexts}
        setCampaign={setCampaign}
        campaign={campaign}
      />

      {/* Custom Images Settings */}
      <CustomImagesManager
        customImages={customImages}
        setCampaign={setCampaign}
        campaign={campaign}
      />
    </div>
  );
};

export default ModernDesignTab;
