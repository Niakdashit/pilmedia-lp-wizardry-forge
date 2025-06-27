
import React from 'react';
import BorderStyleSelector from '../../SmartWheel/components/BorderStyleSelector';

interface WheelBorderSettingsProps {
  campaign: any;
  setCampaign: (campaign: any) => void;
}

const WheelBorderSettings: React.FC<WheelBorderSettingsProps> = ({
  campaign,
  setCampaign
}) => {
  if (campaign.type !== 'wheel') {
    return null;
  }

  const handleStyleChange = (style: string) => {
    console.log('WheelBorderSettings - Changing wheel border style to:', style);
    
    setCampaign({
      ...campaign,
      design: {
        ...campaign.design,
        wheelBorderStyle: style
      }
    });
    
    // Force re-render pour s'assurer que la mise à jour est prise en compte
    setTimeout(() => {
      console.log('WheelBorderSettings - Updated campaign design:', {
        ...campaign,
        design: {
          ...campaign.design,
          wheelBorderStyle: style
        }
      }.design);
    }, 100);
  };

  const currentStyle = campaign.design?.wheelBorderStyle || 'classic';
  console.log('WheelBorderSettings - Current wheel border style:', currentStyle);
  console.log('WheelBorderSettings - Full campaign.design:', campaign.design);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Style de bordure</h3>
      <BorderStyleSelector
        currentStyle={currentStyle}
        onStyleChange={handleStyleChange}
      />
    </div>
  );
};

export default WheelBorderSettings;
