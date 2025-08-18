import React from 'react';
import BorderStyleSelector from '../SmartWheel/components/BorderStyleSelector';

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
          <div className="space-y-6">
            {/* Taille de la roue */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taille de la roue: {Math.round((wheelScale / 3) * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={wheelScale}
                onChange={(e) => onScaleChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>100%</span>
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
                />
              </div>
            </div>

            {/* Largeur de la bordure */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Largeur de la bordure: {wheelBorderWidth}px
              </label>
              <input
                type="range"
                min="4"
                max="32"
                step="2"
                value={wheelBorderWidth}
                onChange={(e) => onBorderWidthChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>4px</span>
                <span>32px</span>
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

            {/* Position de la roue - uniquement sur Desktop */}
          {selectedDevice === 'desktop' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Position de la roue
              </label>
              <div className="inline-flex rounded-md shadow-sm overflow-hidden border">
                <button
                  type="button"
                  onClick={() => onPositionChange?.('left')}
                  className={`px-3 py-2 text-sm ${wheelPosition === 'left' ? 'bg-[hsl(var(--primary))] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border-r`}
                >
                  Gauche
                </button>
                <button
                  type="button"
                  onClick={() => onPositionChange?.('center')}
                  className={`px-3 py-2 text-sm ${wheelPosition === 'center' ? 'bg-[hsl(var(--primary))] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border-r`}
                >
                  Centre
                </button>
                <button
                  type="button"
                  onClick={() => onPositionChange?.('right')}
                  className={`px-3 py-2 text-sm ${wheelPosition === 'right' ? 'bg-[hsl(var(--primary))] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Droite
                </button>
              </div>
            </div>
          )}

            {/* Ampoules blanches sur la bordure */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Afficher les ampoules blanches (x15)
              </label>
              <button
                type="button"
                onClick={() => onShowBulbsChange?.(!wheelShowBulbs)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${wheelShowBulbs ? 'bg-[hsl(var(--primary))]' : 'bg-gray-300'}`}
                aria-pressed={wheelShowBulbs}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${wheelShowBulbs ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
});

WheelConfigModal.displayName = 'WheelConfigModal';

export default WheelConfigModal;