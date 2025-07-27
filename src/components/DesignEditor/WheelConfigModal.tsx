import React from 'react';
import BorderStyleSelector from '../SmartWheel/components/BorderStyleSelector';

interface WheelConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  wheelBorderStyle: string;
  wheelBorderColor: string;
  wheelScale: number;
  onBorderStyleChange: (style: string) => void;
  onBorderColorChange: (color: string) => void;
  onScaleChange: (scale: number) => void;
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
}

const WheelConfigModal: React.FC<WheelConfigModalProps> = ({
  isOpen,
  onClose,
  wheelBorderStyle,
  wheelBorderColor,
  wheelScale,
  onBorderStyleChange,
  onBorderColorChange,
  onScaleChange,
  selectedDevice
}) => {
  if (!isOpen) return null;

  // Calculer la position de la modale selon l'appareil
  const getModalPosition = () => {
    switch (selectedDevice) {
      case 'mobile':
        return {
          position: 'fixed' as const,
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          maxWidth: '300px',
          maxHeight: '80vh',
          overflowY: 'auto' as const
        };
      case 'tablet':
        return {
          position: 'fixed' as const,
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          maxWidth: '350px',
          maxHeight: '80vh',
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
          maxHeight: '400px',
          overflowY: 'auto' as const
        };
    }
  };

  const modalStyle = getModalPosition();

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[100] pointer-events-auto"
        onClick={() => {
          console.log('Backdrop clicked');
          onClose();
        }}
      />
      
      {/* Modal */}
      <div 
        className="bg-white rounded-lg shadow-xl z-[110] border pointer-events-auto"
        style={modalStyle}
        onClick={(e) => {
          console.log('Modal clicked');
          e.stopPropagation();
        }}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Configuration de la roue</h3>
            <button
              onClick={() => {
                console.log('Close button clicked');
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors pointer-events-auto"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contrôles */}
          <div className="space-y-6">
            {/* Taille de la roue */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taille de la roue: {Math.round(wheelScale * 100)}%
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={wheelScale}
                onChange={(e) => {
                  console.log('Scale changed:', e.target.value);
                  onScaleChange(parseFloat(e.target.value));
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer pointer-events-auto"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>50%</span>
                <span>200%</span>
              </div>
            </div>

            {/* Couleur de la bordure */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur de la bordure
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={wheelBorderColor}
                  onChange={(e) => {
                    console.log('Color picker changed:', e.target.value);
                    onBorderColorChange(e.target.value);
                  }}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer pointer-events-auto"
                />
                <input
                  type="text"
                  value={wheelBorderColor}
                  onChange={(e) => {
                    console.log('Color text changed:', e.target.value);
                    onBorderColorChange(e.target.value);
                  }}
                  placeholder="#841b60"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pointer-events-auto"
                />
              </div>
            </div>

            {/* Styles de bordure */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Style de bordure
              </label>
              <BorderStyleSelector
                currentStyle={wheelBorderStyle}
                onStyleChange={(style) => {
                  console.log('Border style changed:', style);
                  onBorderStyleChange(style);
                }}
                className="pointer-events-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WheelConfigModal;