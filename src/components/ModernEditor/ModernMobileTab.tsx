
import React from 'react';
import CampaignMobile from '../CampaignEditor/CampaignMobile';

interface ModernMobileTabProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
}

const ModernMobileTab: React.FC<ModernMobileTabProps> = ({ campaign, setCampaign }) => {
  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Configuration mobile</h2>
        <p className="text-gray-600 text-sm">Adaptez votre campagne pour les appareils mobiles</p>
      </div>
      
      <CampaignMobile
        campaign={campaign}
        setCampaign={setCampaign}
        hidePreview={true}
      />
    </div>
  );
};

export default ModernMobileTab;
