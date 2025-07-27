import React, { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  }, [onClose]);

  const handleModalClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleCloseClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  }, [onClose]);

  const handleScaleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const value = parseFloat(e.target.value);
    onScaleChange(value);
  }, [onScaleChange]);

  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onBorderColorChange(e.target.value);
  }, [onBorderColorChange]);

  const handleTextColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onBorderColorChange(e.target.value);
  }, [onBorderColorChange]);

  const handleBorderStyleChange = useCallback((style: string) => {
    onBorderStyleChange(style);
  }, [onBorderStyleChange]);

  if (!isOpen) return null;

  const getModalPosition = () => {
    switch (selectedDevice) {
      case 'mobile':
        return 'fixed right-5 top-1/2 -translate-y-1/2 w-80 max-h-[80vh]';
      case 'tablet':
        return 'fixed right-5 top-1/2 -translate-y-1/2 w-96 max-h-[80vh]';
      case 'desktop':
      default:
        return 'fixed bottom-5 left-1/2 -translate-x-1/2 w-[600px] max-h-96';
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 pointer-events-auto"
      style={{ 
        zIndex: 99999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 pointer-events-auto cursor-pointer"
        onClick={handleBackdropClick}
        style={{ zIndex: 99999 }}
      />
      
      {/* Modal */}
      <div 
        className={`${getModalPosition()} bg-white rounded-xl shadow-2xl border overflow-auto pointer-events-auto`}
        onClick={handleModalClick}
        style={{ zIndex: 100000 }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Configuration de la roue
            </h3>
            <button
              onClick={handleCloseClick}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full pointer-events-auto"
              style={{ pointerEvents: 'auto' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Wheel Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Taille de la roue: {Math.round(wheelScale * 100)}%
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={wheelScale}
                onChange={handleScaleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider pointer-events-auto"
                style={{ pointerEvents: 'auto' }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>50%</span>
                <span>200%</span>
              </div>
            </div>

            {/* Border Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Couleur de la bordure
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={wheelBorderColor}
                  onChange={handleColorChange}
                  className="w-12 h-12 rounded border-2 border-gray-300 cursor-pointer pointer-events-auto"
                  style={{ pointerEvents: 'auto' }}
                />
                <input
                  type="text"
                  value={wheelBorderColor}
                  onChange={handleTextColorChange}
                  placeholder="#841b60"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pointer-events-auto"
                  style={{ pointerEvents: 'auto' }}
                />
              </div>
            </div>

            {/* Border Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Style de bordure
              </label>
              <div className="pointer-events-auto" style={{ pointerEvents: 'auto' }}>
                <BorderStyleSelector
                  currentStyle={wheelBorderStyle}
                  onStyleChange={handleBorderStyleChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Create portal with specific container
  return createPortal(modalContent, document.body);
};

export default WheelConfigModal;