import React from 'react';
import WheelConfigSettings from './panels/WheelConfigSettings';

interface WheelConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  wheelBorderStyle: string;
  wheelBorderColor: string;
  wheelBorderWidth: number;
  wheelScale: number;
  wheelShowBulbs?: boolean;
  wheelPosition?: 'left' | 'right' | 'center';

  onBorderStyleChange: (style: string) => void;
  onBorderColorChange: (color: string) => void;
  onBorderWidthChange: (width: number) => void;
  onScaleChange: (scale: number) => void;
  onShowBulbsChange?: (show: boolean) => void;
  onPositionChange?: (position: 'left' | 'right' | 'center') => void;

  selectedDevice: 'desktop' | 'tablet' | 'mobile';
}

const WheelConfigModal: React.FC<WheelConfigModalProps> = React.memo(({
  isOpen,
  onClose,
  wheelBorderStyle,
  wheelBorderColor,
  wheelBorderWidth,
  wheelScale,
  wheelShowBulbs = false,
  wheelPosition = 'center',

  onBorderStyleChange,
  onBorderColorChange,
  onBorderWidthChange,
  onScaleChange,
  onShowBulbsChange,
  onPositionChange,

  selectedDevice
}) => {
  if (!isOpen) return null;

  // Calculer la position de la modale selon l'appareil
  const getModalPosition = () => {
    switch (selectedDevice) {
      case 'mobile':
      case 'tablet':
        return {
          position: 'fixed' as const,
          top: '10px',
          bottom: '10px',
          left: '10px',
          right: '10px',
          overflowY: 'auto' as const
        };
      case 'desktop':
      default:
        return {
          position: 'fixed' as const,
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflowY: 'auto' as const
        };
    }
  };

  const modalStyle = getModalPosition();

  return (
    <>
      {/* Modal */}
      <div 
        className="bg-white rounded-[2px] shadow-xl z-50 border"
        style={modalStyle}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Configuration de la roue</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contrôles */}
          <WheelConfigSettings
            wheelBorderStyle={wheelBorderStyle}
            wheelBorderColor={wheelBorderColor}
            wheelBorderWidth={wheelBorderWidth}
            wheelScale={wheelScale}
            wheelShowBulbs={wheelShowBulbs}
            wheelPosition={wheelPosition}
            onBorderStyleChange={onBorderStyleChange}
            onBorderColorChange={onBorderColorChange}
            onBorderWidthChange={onBorderWidthChange}
            onScaleChange={onScaleChange}
            onShowBulbsChange={onShowBulbsChange}
            onPositionChange={onPositionChange}
            selectedDevice={selectedDevice}
          />
        </div>
      </div>
    </>
  );
});

WheelConfigModal.displayName = 'WheelConfigModal';

export default WheelConfigModal;
