
import React from 'react';
import BorderStyleSelector from '../../SmartWheel/components/BorderStyleSelector';

interface WheelBorderSettingsProps {
  campaign: any;
  setCampaign: (campaign: any) => void;
}

const wheelStyles = [
  { label: '🎰 Casino', file: 'roulette_casino.svg' },
  { label: '✨ Luxe', file: 'roulette_luxury.svg' },
  { label: '🎃 Halloween', file: 'roulette_halloween.svg' },
  { label: '🎄 Noël', file: 'roulette_noel.svg' },
];

const WheelBorderSettings: React.FC<WheelBorderSettingsProps> = ({
  campaign,
  setCampaign
}) => {
  if (campaign.type !== 'wheel') {
    return null;
  }

  const currentWheelStyle = campaign.design?.wheelStyle || 'roulette_casino.svg';

  const handleWheelStyleChange = (style: string) => {
    setCampaign({
      ...campaign,
      design: {
        ...campaign.design,
        wheelStyle: style
      }
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Style de bordure</h3>
      <BorderStyleSelector
        currentStyle={campaign.design?.wheelBorderStyle || 'classic'}
        onStyleChange={(style) =>
          setCampaign({
            ...campaign,
            design: {
              ...campaign.design,
              wheelBorderStyle: style
            }
          })
        }
      />

      {/* Style de la roue */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Style de la roue</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {wheelStyles.map(({ label, file }) => (
            <div
              key={file}
              onClick={() => handleWheelStyleChange(file)}
              className={`border p-2 rounded-lg cursor-pointer hover:shadow-md transition ${
                currentWheelStyle === file 
                  ? 'border-[#841b60] ring-2 ring-[#841b60]' 
                  : 'border-gray-300'
              }`}
            >
              <img
                src={`/wheel-styles/${file}`}
                alt={label}
                className="w-full h-24 object-contain mb-2"
              />
              <p className="text-center text-sm">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WheelBorderSettings;
