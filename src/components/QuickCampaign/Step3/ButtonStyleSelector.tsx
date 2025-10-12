
import React from 'react';
import { useQuickCampaignStore } from '../../../stores/quickCampaignStore';

const ButtonStyleSelector: React.FC = () => {
  const { customColors, setCustomColors } = useQuickCampaignStore();

  const buttonStyles = [
    {
      id: 'primary',
      name: 'Bouton Principal',
      preview: 'Aperçu',
      style: {
        backgroundColor: customColors.primary,
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 24px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }
    },
    {
      id: 'secondary',
      name: 'Bouton Secondaire',
      preview: 'Aperçu',
      style: {
        backgroundColor: 'transparent',
        color: customColors.primary,
        border: `2px solid ${customColors.primary}`,
        borderRadius: '8px',
        padding: '10px 22px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }
    },
    {
      id: 'outline',
      name: 'Bouton Contour',
      preview: 'Aperçu',
      style: {
        backgroundColor: 'transparent',
        color: customColors.secondary,
        border: `2px solid ${customColors.secondary}`,
        borderRadius: '8px',
        padding: '10px 22px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }
    },
    {
      id: 'gradient',
      name: 'Bouton Dégradé',
      preview: 'Aperçu',
      style: {
        background: `linear-gradient(135deg, ${customColors.primary}, ${customColors.secondary})`,
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 24px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
      }
    }
  ];

  const handleStyleSelect = (styleId: string) => {
    setCustomColors({
      ...customColors,
      buttonStyle: styleId
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">🎨</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Style du bouton</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {buttonStyles.map((style) => (
          <div
            key={style.id}
            onClick={() => handleStyleSelect(style.id)}
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg ${
              customColors.buttonStyle === style.id
                ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex flex-col items-center space-y-3">
              <button
                style={style.style}
                className="min-w-[120px] hover:opacity-90 active:scale-95"
                onClick={(e) => e.preventDefault()}
              >
                {style.preview}
              </button>
              <span className="text-sm font-medium text-gray-700">
                {style.name}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
        <p className="text-sm text-gray-700">
          💡 Le style sélectionné sera appliqué à tous les boutons de votre campagne. 
          Les couleurs s'adaptent automatiquement à votre palette de marque.
        </p>
      </div>
    </div>
  );
};

export default ButtonStyleSelector;
