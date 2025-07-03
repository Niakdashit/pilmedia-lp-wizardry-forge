import React, { useState, useEffect } from 'react';
import { SmartWheelProps } from './types';
import { getTheme } from './utils/wheelThemes';
import { useWheelAnimation } from './hooks/useWheelAnimation';
import { useSmartWheelRenderer } from './hooks/useSmartWheelRenderer';
import BorderStyleSelector from './components/BorderStyleSelector';
const SmartWheel: React.FC<SmartWheelProps> = ({
  segments,
  theme = 'modern',
  size = 400,
  disabled = false,
  onSpin,
  onResult,
  brandColors,
  customButton,
  borderStyle = 'classic',
  className = '',
  maxSize
}) => {
  const [currentBorderStyle, setCurrentBorderStyle] = useState(borderStyle);
  const [showBorderSelector, setShowBorderSelector] = useState(false);

  // Synchroniser l'état local avec la prop borderStyle
  useEffect(() => {
    setCurrentBorderStyle(borderStyle);
  }, [borderStyle]);

  // Résoudre le thème
  const resolvedTheme = getTheme(theme, brandColors);

  // Calculate actual size respecting maxSize constraint
  const actualSize = maxSize ? Math.min(size, maxSize) : size;

  // Animation de la roue
  const {
    wheelState,
    spin
  } = useWheelAnimation({
    segments,
    theme: resolvedTheme,
    onResult,
    disabled
  });

  // Rendu Canvas - Utiliser currentBorderStyle au lieu de borderStyle
  const {
    canvasRef
  } = useSmartWheelRenderer({
    segments,
    theme: resolvedTheme,
    wheelState,
    size: actualSize,
    borderStyle: currentBorderStyle
  });
  const handleSpin = () => {
    if (onSpin) {
      onSpin();
    }
    spin();
  };
  const buttonText = customButton?.text || 'Faire tourner';
  const buttonColor = customButton?.color || resolvedTheme.colors.primary;
  const buttonTextColor = customButton?.textColor || '#ffffff';
  return <div className={`flex flex-col items-center space-y-6 ${className}`}>
      {/* Container de la roue */}
      <div className="relative flex items-center justify-center" style={{
      width: actualSize,
      height: actualSize
    }}>
        <canvas ref={canvasRef} className="rounded-full" style={{
        filter: wheelState.isSpinning ? 'brightness(1.1) saturate(1.2)' : 'none',
        transition: 'filter 0.3s ease'
      }} />
        
        {/* Message si aucun segment */}
        {segments.length === 0 && <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500 bg-white/80 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm">Aucun segment configuré</p>
            </div>
          </div>}
      </div>

      {/* Sélecteur de style de bordure */}
      <div className="flex flex-col items-center space-y-3">
        

        {showBorderSelector && <div className="p-4 bg-white rounded-xl shadow-lg border">
            <BorderStyleSelector currentStyle={currentBorderStyle} onStyleChange={(style: string) => {
          setCurrentBorderStyle(style);
          setShowBorderSelector(false);
        }} />
          </div>}
      </div>

      {/* Bouton de rotation */}
      <button onClick={handleSpin} disabled={disabled || wheelState.isSpinning || segments.length === 0} className="px-8 py-3 font-semibold rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" style={{
      backgroundColor: buttonColor,
      color: buttonTextColor,
      boxShadow: `0 4px 14px ${buttonColor}40`
    }}>
        {wheelState.isSpinning ? 'Rotation...' : buttonText}
      </button>

      {/* Message de validation si segment sélectionné */}
      {wheelState.currentSegment && !wheelState.isSpinning && <div className="px-4 py-2 rounded-lg text-white font-medium animate-fade-in" style={{
      backgroundColor: resolvedTheme.colors.accent
    }}>
          🎉 {wheelState.currentSegment.label}
        </div>}
    </div>;
};
export default SmartWheel;