
import React, { useMemo } from 'react';
import { useQuickCampaignStore } from '../../../stores/quickCampaignStore';

interface AdvancedWheelRendererProps {
  children: React.ReactNode;
}

const AdvancedWheelRenderer: React.FC<AdvancedWheelRendererProps> = ({
  children
}) => {
  const { wheelCustomization, customPointer, wheelCenter, advancedMode } = useQuickCampaignStore();

  const containerStyle = useMemo(() => {
    if (!advancedMode) return {};

    const styles: React.CSSProperties = {
      position: 'relative',
      borderRadius: `${wheelCustomization.borderRadius}%`,
    };

    // Effets d'ombre
    if (wheelCustomization.shadowIntensity > 0) {
      const shadowBlur = (wheelCustomization.shadowIntensity / 100) * 30;
      const shadowSpread = (wheelCustomization.shadowIntensity / 100) * 10;
      styles.boxShadow = `0 ${shadowBlur}px ${shadowBlur * 2}px ${shadowSpread}px ${wheelCustomization.shadowColor}`;
    }

    // Effet de lueur
    if (wheelCustomization.glowEffect) {
      const glowIntensity = 20;
      styles.filter = `drop-shadow(0 0 ${glowIntensity}px ${wheelCustomization.glowColor})`;
    }

    // Effets 3D
    if (wheelCustomization.depth3D && wheelCustomization.depth3D > 0) {
      styles.transform = `translateZ(${wheelCustomization.depth3D}px)`;
      styles.transformStyle = 'preserve-3d';
    }

    if (wheelCustomization.perspective && wheelCustomization.perspective > 0) {
      styles.perspective = `${wheelCustomization.perspective * 10}px`;
    }

    // Animations
    if (wheelCustomization.pulseAnimation) {
      styles.animation = 'pulse 2s infinite';
    }

    if (wheelCustomization.continuousRotation) {
      styles.animation = styles.animation ? 
        `${styles.animation}, spin 10s linear infinite` : 
        'spin 10s linear infinite';
    }

    return styles;
  }, [wheelCustomization, advancedMode]);

  const textureClass = useMemo(() => {
    if (!advancedMode || !wheelCustomization.texture) return '';

    switch (wheelCustomization.texture) {
      case 'metallic':
        return 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-600';
      case 'glass':
        return 'bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 backdrop-blur-md bg-opacity-70';
      case 'neon':
        return 'bg-gradient-to-br from-pink-400 via-purple-500 to-blue-600';
      case 'wood':
        return 'bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900';
      default:
        return '';
    }
  }, [wheelCustomization.texture, advancedMode]);

  if (!advancedMode) {
    return <div>{children}</div>;
  }

  return (
    <div className="relative">
      {/* Effet de particules */}
      {wheelCustomization.particleEffect && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Container principal avec effets */}
      <div
        className={`relative ${textureClass} ${wheelCustomization.bevelEffect ? 'shadow-inner' : ''}`}
        style={containerStyle}
      >
        {/* Centre personnalisé */}
        {wheelCenter.enabled && wheelCenter.url && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            style={{
              borderRadius: `${wheelCustomization.borderRadius}%`,
            }}
          >
            <div
              className="rounded-full overflow-hidden bg-white shadow-lg"
              style={{
                width: `${wheelCenter.size}px`,
                height: `${wheelCenter.size}px`,
              }}
            >
              {wheelCenter.type === 'animation' ? (
                <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-600 animate-pulse" />
              ) : (
                <img
                  src={wheelCenter.url}
                  alt="Centre de roue personnalisé"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        )}

        {/* Pointeur personnalisé */}
        {customPointer.enabled && customPointer.url && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20">
            <img
              src={customPointer.url}
              alt="Pointeur personnalisé"
              className="w-8 h-8 object-contain filter drop-shadow-lg"
            />
          </div>
        )}

        {children}
      </div>

      {/* Styles CSS personnalisés pour les animations */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}
      </style>
    </div>
  );
};

export default AdvancedWheelRenderer;
