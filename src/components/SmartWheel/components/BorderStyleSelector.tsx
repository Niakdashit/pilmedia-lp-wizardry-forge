import React from 'react';
import { BORDER_STYLES } from '../utils/borderStyles';
interface BorderStyleSelectorProps {
  currentStyle: string;
  onStyleChange: (style: string) => void;
  className?: string;
}
const BorderStyleSelector: React.FC<BorderStyleSelectorProps> = ({
  currentStyle,
  onStyleChange,
  className = ''
}) => {
  return <div className={`space-y-4 ${className}`}>
      
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Object.entries(BORDER_STYLES).map(([key, style]) => <button key={key} onClick={() => onStyleChange(key)} className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${currentStyle === key ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-md' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
            <div className="flex flex-col items-center space-y-2">
              {/* Aperçu visuel du style */}
              <div className="w-12 h-12 rounded-full border-4 flex items-center justify-center" style={{
            borderImage: style.type === 'gradient' ? `linear-gradient(45deg, ${style.colors.join(', ')}) 1` : undefined,
            borderColor: style.type !== 'gradient' ? style.colors[0] : undefined,
            background: style.type === 'metallic' || style.type === 'luxury' ? `linear-gradient(135deg, ${style.colors.join(', ')})` : style.type === 'neon' ? style.colors[0] : '#f9fafb',
            boxShadow: style.effects.glow ? `0 0 20px ${style.colors[0]}40` : style.effects.shadow ? '0 4px 8px rgba(0,0,0,0.1)' : undefined
          }}>
                {style.effects.metallic && <div className="w-2 h-2 bg-white/60 rounded-full" />}
              </div>
              
              {/* Nom du style */}
              <span className="text-xs font-medium text-center">{style.name}</span>
              
              {/* Indicateurs d'effets */}
              <div className="flex space-x-1">
                {style.effects.glow && <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" title="Effet de lueur" />}
                {style.effects.metallic && <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" title="Effet métallique" />}
                {style.effects.animated && <span className="w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse" title="Animé" />}
              </div>
            </div>
          </button>)}
      </div>
      
      {/* Description du style sélectionné */}
      {/* Description supprimée */}
    </div>;
};
export default BorderStyleSelector;