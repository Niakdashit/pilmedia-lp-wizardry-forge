
import React from 'react';
import { AlertCircle, Monitor, Tablet, Smartphone } from 'lucide-react';
import Spinner from '../../shared/Spinner';

interface PreviewFeedbackProps {
  device: 'desktop' | 'tablet' | 'mobile';
  isLoading?: boolean;
  error?: string | null;
  onClose?: () => void;
  showRealSizeIndicator?: boolean;
}

const PreviewFeedback: React.FC<PreviewFeedbackProps> = ({
  device,
  isLoading = false,
  error = null,
  onClose,
  showRealSizeIndicator = false
}) => {
  const getDeviceIcon = () => {
    switch (device) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getDeviceLabel = () => {
    switch (device) {
      case 'mobile':
        return 'Mobile';
      case 'tablet':
        return 'Tablette';
      default:
        return 'Desktop';
    }
  };

  return (
    <>
      {/* Loading indicator - SANS BACKDROP */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="flex items-center space-x-2 bg-white/95 rounded-lg shadow-lg px-4 py-2 border backdrop-blur-sm">
            <Spinner size="sm" />
            <span className="text-sm font-medium text-gray-700">
              Chargement de l'aperçu...
            </span>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-4 left-4 right-4 z-50">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800">
                  Erreur d'aperçu
                </h4>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-red-400 hover:text-red-600 transition-colors"
                  aria-label="Fermer"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Device indicator */}
      {showRealSizeIndicator && (
        <div className="absolute bottom-4 left-4 z-40">
          <div className="bg-gray-900/90 text-white rounded-lg px-3 py-2 text-xs font-medium flex items-center space-x-2 shadow-lg">
            {getDeviceIcon()}
            <span>{getDeviceLabel()}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default PreviewFeedback;
