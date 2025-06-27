
import React from 'react';
import CampaignMobile from '../CampaignEditor/CampaignMobile';

interface ModernMobileTabProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
}

const ModernMobileTab: React.FC<ModernMobileTabProps> = ({ campaign, setCampaign }) => {
  return (
    <div className="w-full max-w-full overflow-hidden">
      <CampaignMobile
        campaign={campaign}
        setCampaign={setCampaign}
        hidePreview={true}
      />
    </div>
  );
};

export default ModernMobileTab;
