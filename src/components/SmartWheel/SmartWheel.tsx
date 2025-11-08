import React, { useState, useEffect, useMemo } from 'react';
import { SmartWheelProps } from './types';
import { getTheme } from './utils/wheelThemes';
import { useWheelAnimation } from './hooks/useWheelAnimation';
import { useSmartWheelRenderer } from './hooks/useSmartWheelRenderer';
import BorderStyleSelector from './components/BorderStyleSelector';
import ParticipationModal from './components/ParticipationModal';
type Mode2State = 'form' | 'wheel' | 'result';

const SmartWheel: React.FC<SmartWheelProps> = ({
  segments,
  theme = 'modern',
  size = 400,
  disabled = false,
  disablePointerAnimation,
  onSpin,
  onResult,
  onShowParticipationModal,
  brandColors,
  customButton,
  borderStyle = 'classic',
  customBorderColor,
  customBorderWidth,
  showBulbs,

  className = '',
  maxSize,
  buttonPosition,
  isMode1 = true,
  formFields,
  spinMode,
  winProbability,
  speed
}) => {
  // Forcer la mise à jour des couleurs des segments avec brandColors
  const updatedSegments = useMemo(() => {
    if (!segments || !Array.isArray(segments)) return segments;
    
    return segments.map((segment, index) => {
      // Si le segment a la couleur par défaut et qu'on a des brandColors, utiliser brandColors.primary
      if (segment.color === '#841b60' && brandColors?.primary) {
        console.log(`🔧 SmartWheel: Forcing segment ${segment.id} color from #841b60 to ${brandColors.primary}`);
        return { ...segment, color: brandColors.primary };
      }
      return segment;
    });
  }, [segments, brandColors?.primary]);
  const [currentBorderStyle, setCurrentBorderStyle] = useState(borderStyle);
  const [showBorderSelector, setShowBorderSelector] = useState(false);
  
  // États pour le mode 2
  const [mode2State, setMode2State] = useState<Mode2State>('form');
  const [showParticipationModal, setShowParticipationModal] = useState(false);

  // Synchroniser l'état local avec la prop borderStyle
  useEffect(() => {
    setCurrentBorderStyle(borderStyle);
  }, [borderStyle]);

  // Log segment details when they change
  useEffect(() => {
    if (!segments || !Array.isArray(segments)) {
      console.error('Invalid segments data:', segments);
      return;
    }
    console.log('🎯 SmartWheel - Segments received:', segments.map(s => ({
      id: s.id,
      label: s.label,
      color: s.color,
      probability: s.probability
    })));
    console.log('🎯 SmartWheel - Brand colors received:', brandColors);
    console.group('🎡 SmartWheel - Segments Update');
    console.log('Number of segments:', segments.length);
    console.log('Spin mode:', spinMode);
    
    const totalProbability = segments.reduce((sum, s) => {
      if (!s) return sum;
      return sum + (typeof s.probability === 'number' ? s.probability : 0);
    }, 0);
    
    console.log('Total probability:', totalProbability);
    
    console.log('Segment details:');
    segments.forEach((segment, index) => {
      if (!segment) {
        console.warn(`- [${index}] Segment is undefined or null`);
        return;
      }
      
      console.log(`- [${index}] ${segment.label || 'Unlabeled segment'}:`, {
        probability: segment.probability,
        isWinning: segment.isWinning,
        prizeId: segment.prizeId,
        type: typeof segment,
        keys: Object.keys(segment)
      });
    });
    console.groupEnd();
  }, [segments, spinMode]);

  // Résoudre le thème
  const resolvedTheme = getTheme(theme, brandColors);

  // Calculate actual size respecting maxSize constraint
  const actualSize = maxSize ? Math.min(size, maxSize) : size;

  // Fonctions de gestion
  const handleWheelResult = (result: any) => {
    if (!isMode1) {
      setMode2State('result');
    }
    if (onResult) {
      onResult(result);
    }
  };

  // Sanitize formFields and build a stable key to force remount of modal when fields change
  const safeModalFields = useMemo(() => {
    const allowedTypes = new Set(['text', 'email', 'tel', 'select', 'textarea', 'checkbox']);
    const src = Array.isArray(formFields) && formFields.length > 0
      ? formFields
      : [
          { id: 'firstName', label: 'Prénom', type: 'text', required: true },
          { id: 'email', label: 'Email', type: 'email', required: true }
        ];
    return src
      .filter((f: any) => f && typeof f === 'object' && typeof f.id === 'string' && typeof f.label === 'string')
      .map((f: any) => ({
        id: f.id,
        label: f.label,
        type: allowedTypes.has(f.type) ? f.type : 'text',
        required: !!f.required,
        options: Array.isArray(f.options) ? f.options.filter((o: any) => typeof o === 'string') : undefined,
        placeholder: typeof f.placeholder === 'string' ? f.placeholder : undefined
      }));
  }, [formFields]);

  const modalFieldsKey = useMemo(() => {
    try {
      return JSON.stringify(safeModalFields.map((f: any) => ({ id: f.id, type: f.type, required: !!f.required, label: f.label, options: f.options })));
    } catch {
      return String(safeModalFields.length);
    }
  }, [safeModalFields]);

  // Animation de la roue
  const {
    isSpinning = false,
    rotation = 0,
    targetRotation = 0,
    currentSegment = null,
    spin
  } = useWheelAnimation({
    segments,
    theme: resolvedTheme,
    onResult: handleWheelResult,
    disabled,
    spinMode,
    winProbability,
    speed: speed === 'medium' ? 'normal' : speed // Map 'medium' to 'normal' for compatibility
  }) || {};

  // Create a stable wheelState object
  const wheelState = useMemo(() => ({
    isSpinning,
    rotation,
    targetRotation,
    currentSegment
  }), [isSpinning, rotation, targetRotation, currentSegment]);

  // Rendu Canvas - Utiliser currentBorderStyle au lieu de borderStyle
  const { canvasRef, centerImgReady } = useSmartWheelRenderer({
    segments: updatedSegments,
    theme: resolvedTheme,
    wheelState,
    size: actualSize,
    borderStyle: currentBorderStyle,
    customBorderColor,
    customBorderWidth,
    showBulbs,
    disablePointerAnimation,
    brandColors
  });
  
  const handleSpin = () => {
    if (!isMode1) {
      // Mode 2: ouvrir la modale de participation
      if (mode2State === 'form') {
        // Utiliser le callback externe si fourni, sinon la logique interne
        if (onShowParticipationModal) {
          onShowParticipationModal();
        } else {
          setShowParticipationModal(true);
        }
        return;
      }
      // Si on est déjà dans l'état wheel, faire tourner
      if (mode2State === 'wheel') {
        if (onSpin) onSpin();
        spin();
        return;
      }
    }
    
    // Mode 1: comportement normal
    if (onSpin) {
      onSpin();
    }
    spin();
  };
  
  const handleParticipationSubmit = () => {
    setShowParticipationModal(false);
    setMode2State('wheel');
  };
  
  const handlePlayAgain = () => {
    setMode2State('form');
  };

  // Fonction pour déterminer la position optimale du bouton
  const getOptimalButtonPosition = () => {
    // Si buttonPosition est explicitement défini, l'utiliser
    if (buttonPosition) return buttonPosition;
    
    // Pour les roues, forcer toujours la position 'bottom' pour un centrage parfait
    return 'bottom';
  };

  const finalButtonPosition = getOptimalButtonPosition();

  // Styles de disposition selon la position du bouton
  const getLayoutClasses = () => {
    if (finalButtonPosition === 'center') {
      return 'relative flex items-center justify-center';
    }
    
    switch (finalButtonPosition) {
      case 'top':
        return 'flex flex-col-reverse items-center space-y-reverse space-y-6';
      case 'left':
        return 'flex flex-row items-center space-x-6';
      case 'right':
        return 'flex flex-row-reverse items-center space-x-reverse space-x-6';
      case 'bottom':
      default:
        return 'flex flex-col items-center space-y-6';
    }
  };

  // Déterminer le texte et la couleur du bouton selon le mode et l'état
  const getButtonConfig = () => {
    if (!isMode1) {
      // Mode 2
      switch (mode2State) {
        case 'form':
          return {
            text: customButton?.text || 'Remplir le formulaire',
            color: customButton?.color || resolvedTheme.colors.primary,
            textColor: customButton?.textColor || '#ffffff'
          };
        case 'wheel':
          return {
            text: wheelState.isSpinning ? 'Rotation...' : 'Faire tourner',
            color: customButton?.color || resolvedTheme.colors.primary,
            textColor: customButton?.textColor || '#ffffff'
          };
        case 'result':
          return {
            text: 'Rejouer',
            color: customButton?.color || resolvedTheme.colors.primary,
            textColor: customButton?.textColor || '#ffffff'
          };
      }
    }
    
    // Mode 1 - comportement par défaut
    return {
      text: wheelState.isSpinning ? 'Rotation...' : (customButton?.text || 'Faire tourner'),
      color: customButton?.color || resolvedTheme.colors.primary,
      textColor: customButton?.textColor || '#ffffff'
    };
  };

  const buttonConfig = getButtonConfig();

  // Déterminer si le bouton doit être disabled
  const isButtonDisabled = () => {
    if (!isMode1) {
      // Mode 2
      switch (mode2State) {
        case 'form':
          return disabled || segments.length === 0;
        case 'wheel':
          return disabled || wheelState.isSpinning || segments.length === 0;
        case 'result':
          return false;
      }
    }
    
    // Mode 1
    return disabled || wheelState.isSpinning || segments.length === 0;
  };

  const handleButtonClick = () => {
    if (!isMode1 && mode2State === 'result') {
      handlePlayAgain();
    } else {
      handleSpin();
    }
  };

  return (
    <>
      <div className={`${getLayoutClasses()} ${className}`}>
        {/* Container de la roue */}
        <div className="relative flex items-center justify-center" style={{
          width: actualSize,
          height: actualSize
        }}>
          <canvas
            ref={canvasRef}
            className={`rounded-full relative ${centerImgReady ? 'z-40 pointer-events-none' : 'z-0'}`}
            style={{
              filter: wheelState.isSpinning ? 'brightness(1.1) saturate(1.2)' : 'none',
              transition: 'filter 0.3s ease'
            }}
          />
          
          {/* Bouton central si position center */}
          {finalButtonPosition === 'center' && (
            <button
              onClick={handleButtonClick}
              disabled={isButtonDisabled()}
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 font-semibold rounded-full transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${centerImgReady ? 'z-0' : 'z-10'} flex items-center justify-center text-sm`}
              style={{
                backgroundColor: buttonConfig.color,
                color: buttonConfig.textColor,
                boxShadow: `0 4px 14px ${buttonConfig.color}40`
              }}
            >
              {wheelState.isSpinning ? '...' : 'GO'}
            </button>
          )}
          
          {/* Message si aucun segment */}
          {segments.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500 bg-white/80 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm">Aucun segment configuré</p>
              </div>
            </div>
          )}
        </div>

        {/* Sélecteur de style de bordure */}
        <div className="flex flex-col items-center space-y-3">
          {showBorderSelector && (
            <div className="p-4 bg-white rounded-xl shadow-lg border">
              <BorderStyleSelector
                currentStyle={currentBorderStyle}
                onStyleChange={(style: string) => {
                  setCurrentBorderStyle(style);
                  setShowBorderSelector(false);
                }}
              />
            </div>
          )}
        </div>

        {/* Bouton de rotation (seulement si pas en position center) */}
        {finalButtonPosition !== 'center' && (
          <button
            onClick={handleButtonClick}
            disabled={isButtonDisabled()}
            className="px-8 py-3 font-semibold rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              backgroundColor: buttonConfig.color,
              color: buttonConfig.textColor,
              boxShadow: `0 4px 14px ${buttonConfig.color}40`
            }}
          >
            {buttonConfig.text}
          </button>
        )}
        
        {/* Inline result messages intentionally removed to keep UI clean */}
      </div>

      {/* Modale de participation pour le mode 2 */}
      <ParticipationModal
        key={modalFieldsKey}
        isOpen={showParticipationModal}
        onClose={() => setShowParticipationModal(false)}
        onSubmit={handleParticipationSubmit}
        title="Formulaire de participation"
        submitLabel={buttonConfig.text || 'Valider et participer'}
        fields={safeModalFields}
      />
    </>
  );
};
export default SmartWheel;