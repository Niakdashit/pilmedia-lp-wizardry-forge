
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
    console.log('Changing wheel border style to:', style);
    setCampaign({
      ...campaign,
      design: {
        ...campaign.design,
        wheelBorderStyle: style
      }
    });
  };

  const currentStyle = campaign.design?.wheelBorderStyle || 'classic';
  console.log('Current wheel border style:', currentStyle);

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
