
import React from 'react';
import { BORDER_STYLES } from '../../SmartWheel/utils/borderStyles';

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
  const currentBorderStyle = campaign.design?.wheelBorderStyle || 'classic';

  const handleWheelStyleChange = (style: string) => {
    setCampaign({
      ...campaign,
      design: {
        ...campaign.design,
        wheelStyle: style
      }
    });
  };

  const handleBorderStyleChange = (style: string) => {
    console.log('Changement de style de bordure:', style);
    setCampaign({
      ...campaign,
      design: {
        ...campaign.design,
        wheelBorderStyle: style
      }
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Style de bordure</h3>
      
      {/* Grille des styles de bordure */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-gray-900">Style de bordure</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(BORDER_STYLES).map(([key, style]) => (
            <button
              key={key}
              onClick={() => handleBorderStyleChange(key)}
              className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                currentBorderStyle === key
                  ? 'border-[#841b60] bg-purple-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                {/* Aperçu visuel du style */}
                <div
                  className="w-12 h-12 rounded-full border-4 flex items-center justify-center"
                  style={{
                    borderImage:
                      style.type === 'gradient'
                        ? `linear-gradient(45deg, ${style.colors.join(', ')}) 1`
                        : undefined,
                    borderColor: style.type !== 'gradient' ? style.colors[0] : undefined,
                    background:
                      style.type === 'metallic' || style.type === 'luxury'
                        ? `linear-gradient(135deg, ${style.colors.join(', ')})`
                        : style.type === 'neon'
                        ? style.colors[0]
                        : '#f9fafb',
                    boxShadow: style.effects.glow
                      ? `0 0 20px ${style.colors[0]}40`
                      : style.effects.shadow
                      ? '0 4px 8px rgba(0,0,0,0.1)'
                      : undefined,
                  }}
                >
                  {style.effects.metallic && (
                    <div className="w-2 h-2 bg-white/60 rounded-full" />
                  )}
                </div>

                {/* Nom du style */}
                <span className="text-xs font-medium text-center">{style.name}</span>

                {/* Indicateurs d'effets */}
                <div className="flex space-x-1">
                  {style.effects.glow && (
                    <span
                      className="w-1.5 h-1.5 bg-yellow-400 rounded-full"
                      title="Effet de lueur"
                    />
                  )}
                  {style.effects.metallic && (
                    <span
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                      title="Effet métallique"
                    />
                  )}
                  {style.effects.animated && (
                    <span
                      className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"
                      title="Animé"
                    />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Description du style sélectionné */}
        {BORDER_STYLES[currentBorderStyle] && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>{BORDER_STYLES[currentBorderStyle].name}</strong>
              {BORDER_STYLES[currentBorderStyle].effects.metallic && ' - Effet métallique'}
              {BORDER_STYLES[currentBorderStyle].effects.glow && ' - Effet de lueur'}
              {BORDER_STYLES[currentBorderStyle].effects.animated && ' - Animation'}
            </p>
          </div>
        )}
      </div>

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
