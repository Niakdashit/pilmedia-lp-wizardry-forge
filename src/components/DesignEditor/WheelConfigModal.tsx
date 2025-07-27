import React, { useCallback } from 'react';
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
  // Optimized event handlers with useCallback
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleScaleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    console.log('Scale change:', value); // Debug log
    onScaleChange(value);
  }, [onScaleChange]);

  const handleBorderColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Border color change:', value); // Debug log
    onBorderColorChange(value);
  }, [onBorderColorChange]);

  const handleBorderStyleChange = useCallback((style: string) => {
    console.log('Border style change:', style); // Debug log
    onBorderStyleChange(style);
  }, [onBorderStyleChange]);

  if (!isOpen) return null;

  // Get modal position styles based on device
  const getModalClasses = () => {
    switch (selectedDevice) {
      case 'mobile':
        return 'fixed right-5 top-1/2 -translate-y-1/2 max-w-[300px] max-h-[80vh]';
      case 'tablet':
        return 'fixed right-5 top-1/2 -translate-y-1/2 max-w-[350px] max-h-[80vh]';
      case 'desktop':
      default:
        return 'fixed bottom-5 left-1/2 -translate-x-1/2 max-w-[600px] max-h-[400px]';
    }
  };

  const modalContent = (
    <>
      {/* Backdrop with high z-index */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998] pointer-events-auto"
        onClick={handleBackdropClick}
      />
      
      {/* Modal with highest z-index */}
      <div 
        className={`${getModalClasses()} bg-white rounded-lg shadow-xl z-[9999] border overflow-y-auto pointer-events-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Configuration de la roue</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors pointer-events-auto"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Wheel size */}
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
                onChange={handleScaleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer pointer-events-auto"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>50%</span>
                <span>200%</span>
              </div>
            </div>

            {/* Border color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur de la bordure
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={wheelBorderColor}
                  onChange={handleBorderColorChange}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer pointer-events-auto"
                />
                <input
                  type="text"
                  value={wheelBorderColor}
                  onChange={handleBorderColorChange}
                  placeholder="#841b60"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pointer-events-auto"
                />
              </div>
            </div>

            {/* Border styles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Style de bordure
              </label>
              <div className="pointer-events-auto">
                <BorderStyleSelector
                  currentStyle={wheelBorderStyle}
                  onStyleChange={handleBorderStyleChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Use portal to render modal at body level
  return createPortal(modalContent, document.body);
};

export default WheelConfigModal;