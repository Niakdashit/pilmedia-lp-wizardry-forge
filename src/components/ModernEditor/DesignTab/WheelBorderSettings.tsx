
import React from 'react';

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

  const borderStyles = [
    { value: 'classic', label: 'Classique' },
    { value: 'neon', label: 'Néon' },
    { value: 'metallic', label: 'Métallique' },
    { value: 'luxury', label: 'Luxe' },
    { value: 'gradient', label: 'Dégradé' },
    { value: 'shadow', label: 'Ombre' },
    { value: 'glow', label: 'Lueur' },
    { value: 'minimal', label: 'Minimal' }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Style de bordure</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Style de la bordure de la roue
        </label>
        <select
          value={currentStyle}
          onChange={(e) => handleStyleChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {borderStyles.map((style) => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default WheelBorderSettings;
