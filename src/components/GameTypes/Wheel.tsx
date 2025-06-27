
import React from 'react';
import { SmartWheel } from '../SmartWheel';
import { useGameSize } from '../../hooks/useGameSize';

interface WheelProps {
  config: any;
  isPreview?: boolean;
  onComplete?: (prize: string) => void;
  onFinish?: (result: 'win' | 'lose') => void;
  onStart?: () => void;
  currentWinners?: number;
  maxWinners?: number;
  winRate?: number;
  disabled?: boolean;
  gameSize?: 'small' | 'medium' | 'large' | 'xlarge';
  position?: 'gauche' | 'droite' | 'bas' | 'centre';
}

const Wheel: React.FC<WheelProps> = ({ 
  config, 
  isPreview = false, 
  onComplete, 
  onFinish,
  onStart,
  disabled = false,
  gameSize = 'small',
  position = 'centre'
}) => {
  const { getGameDimensions } = useGameSize(gameSize);
  const gameDimensions = getGameDimensions();
  
  // Configuration par défaut si aucune config fournie
  const defaultSegments = [
    { id: '1', label: 'Prix 1', color: '#ff6b6b' },
    { id: '2', label: 'Prix 2', color: '#4ecdc4' },
    { id: '3', label: 'Prix 3', color: '#45b7d1' },
    { id: '4', label: 'Prix 4', color: '#96ceb4' },
    { id: '5', label: 'Dommage', color: '#feca57' },
    { id: '6', label: 'Rejouer', color: '#ff9ff3' }
  ];

  const segments = config?.segments?.length > 0 ? 
    config.segments.map((segment: any, index: number) => ({
      id: segment.id || index.toString(),
      label: segment.label,
      color: segment.color,
      textColor: segment.textColor || '#ffffff'
    })) : defaultSegments;
  
  // Calculer la taille de la roue en fonction des dimensions du jeu
  const wheelSize = Math.min(gameDimensions.width, gameDimensions.height) - 40;

  const handleResult = (segment: any) => {
    // Appeler onComplete si fourni (pour la compatibilité)
    if (onComplete) {
      onComplete(segment.label);
    }
    
    // Appeler onFinish si fourni (pour la cohérence avec les autres jeux)
    if (onFinish) {
      // Simuler un résultat win/lose - si c'est "Dommage" ou "Rejouer" = lose, sinon win
      const result = segment.label.toLowerCase().includes('dommage') || 
                    segment.label.toLowerCase().includes('rejouer') ? 'lose' : 'win';
      onFinish(result);
    }
  };

  const handleSpin = () => {
    if (onStart) {
      onStart();
    }
  };

  // Couleurs de marque par défaut
  const brandColors = {
    primary: '#841b60',
    secondary: '#4ecdc4',
    accent: '#45b7d1'
  };

  if (!isPreview) {
    return (
      <div className="space-y-6">
        <p className="text-gray-500">Configuration de la roue disponible en mode aperçu</p>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col items-center space-y-6"
      style={{
        width: `${gameDimensions.width}px`,
        height: `${gameDimensions.height}px`,
        maxWidth: `${gameDimensions.width}px`,
        maxHeight: `${gameDimensions.height}px`
      }}
    >
      <SmartWheel
        segments={segments}
        theme="modern"
        size={wheelSize}
        brandColors={brandColors}
        onResult={handleResult}
        onSpin={handleSpin}
        disabled={disabled}
        customButton={{
          text: config?.buttonLabel || 'Faire tourner',
          color: brandColors.primary,
          textColor: '#ffffff'
        }}
      />
    </div>
  );
};

export default Wheel;
