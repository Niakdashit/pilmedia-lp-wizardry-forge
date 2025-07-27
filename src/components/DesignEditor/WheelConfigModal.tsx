import React from 'react';
import BorderStyleSelector from '../SmartWheel/components/BorderStyleSelector';

interface WheelConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  wheelBorderStyle: string;
  wheelBorderColor: string;
  wheelScale: number;
  wheelFullBorder: boolean;
  onBorderStyleChange: (style: string) => void;
  onBorderColorChange: (color: string) => void;
  onScaleChange: (scale: number) => void;
  onFullBorderChange: (fullBorder: boolean) => void;
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
}

const WheelConfigModal: React.FC<WheelConfigModalProps> = ({
  isOpen,
  onClose,
  wheelBorderStyle,
  wheelBorderColor,
  wheelScale,
  wheelFullBorder,
  onBorderStyleChange,
  onBorderColorChange,
  onScaleChange,
  onFullBorderChange,
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
      {/* Modal */}
      <div 
        className="bg-white rounded-lg shadow-xl z-50 border"
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
                onChange={(e) => onScaleChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
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
                  onChange={(e) => onBorderColorChange(e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={wheelBorderColor}
                  onChange={(e) => onBorderColorChange(e.target.value)}
                  placeholder="#841b60"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Option bordure pleine */}
              <div className="mt-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={wheelFullBorder}
                    onChange={(e) => onFullBorderChange(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Bordure pleine</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Bordure entièrement de la couleur choisie au lieu de blanc + couleur
                </p>
              </div>
            </div>

            {/* Styles de bordure */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Style de bordure
              </label>
              <BorderStyleSelector
                currentStyle={wheelBorderStyle}
                onStyleChange={onBorderStyleChange}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WheelConfigModal;