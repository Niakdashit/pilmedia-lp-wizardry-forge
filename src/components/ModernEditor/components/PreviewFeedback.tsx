import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader2, Monitor, Smartphone, Tablet } from 'lucide-react';

interface PreviewFeedbackProps {
  device: 'desktop' | 'tablet' | 'mobile';
  isLoading?: boolean;
  error?: string | null;
  showRealSizeIndicator?: boolean;
  onClose?: () => void;
}

const PreviewFeedback: React.FC<PreviewFeedbackProps> = ({
  device,
  isLoading = false,
  error = null,
  showRealSizeIndicator = true,
  onClose
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRealSize, setShowRealSize] = useState(showRealSizeIndicator && device !== 'desktop');

  useEffect(() => {
    if (!isLoading && !error) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, error]);

  const getDeviceIcon = () => {
    switch (device) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getRealSizeText = () => {
    switch (device) {
      case 'mobile': return 'Taille réelle mobile (520×1100)';
      case 'tablet': return 'Taille réelle tablette (850×1200)';
      default: return '';
    }
  };

  return (
    <div className="absolute top-4 right-4 z-30 space-y-2">
      {/* Loading State */}
      {isLoading && (
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 px-3 py-2 animate-fade-in">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Chargement du preview...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50/95 backdrop-blur-sm rounded-lg shadow-lg border border-red-200 px-3 py-2 animate-fade-in">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span>Erreur de preview</span>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-red-400 hover:text-red-600 text-xs"
              >
                ×
              </button>
            )}
          </div>
          <p className="text-xs text-red-600 mt-1 max-w-xs">{error}</p>
        </div>
      )}

      {/* Success State */}
      {showSuccess && !isLoading && !error && (
        <div className="bg-green-50/95 backdrop-blur-sm rounded-lg shadow-lg border border-green-200 px-3 py-2 animate-fade-in">
          <div className="flex items-center space-x-2 text-sm text-green-700">
            <CheckCircle className="w-4 h-4" />
            <span>Preview chargé</span>
          </div>
        </div>
      )}

      {/* Real Size Indicator */}
      {showRealSize && !isLoading && !error && (
        <div className="bg-blue-50/95 backdrop-blur-sm rounded-lg shadow-lg border border-blue-200 px-3 py-2 animate-fade-in">
          <div className="flex items-center space-x-2 text-sm text-blue-700">
            {getDeviceIcon()}
            <span>{getRealSizeText()}</span>
            <button
              onClick={() => setShowRealSize(false)}
              className="text-blue-400 hover:text-blue-600 text-xs ml-2"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewFeedback;