
import React, { useState } from 'react';
import { X, Monitor, Smartphone, Copy, Check } from 'lucide-react';
import GameCanvasPreview from './components/GameCanvasPreview';
import { createSynchronizedQuizCampaign } from '../../utils/quizConfigSync';
import PreviewLoadingState from './components/PreviewLoadingState';
import DeviceTransition from './components/DeviceTransition';
import PreviewErrorBoundary from './components/ErrorBoundary';
import { getPreviewUrl, copyPreviewUrl } from '../../utils/previewUrl';

interface ModernPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: any;
}

const ModernPreviewModal: React.FC<ModernPreviewModalProps> = ({
  isOpen,
  onClose,
  campaign
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingDevice, setIsChangingDevice] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const previewUrl = campaign?.id ? getPreviewUrl(campaign.id) : null;

  const handleCopyUrl = async () => {
    if (!campaign?.id) return;
    
    try {
      await copyPreviewUrl(campaign.id);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  if (!isOpen) return null;

  // Handle device change with loading state
  const handleDeviceChange = (newDevice: 'desktop' | 'tablet' | 'mobile') => {
    if (newDevice === device) return;
    
    setIsChangingDevice(true);
    setIsLoading(true);
    
    // Simulate loading for better UX
    setTimeout(() => {
      setDevice(newDevice);
      setIsLoading(false);
      setIsChangingDevice(false);
    }, 200);
  };

  const getDeviceStyles = () => {
    switch (device) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      default:
        return { width: '1200px', height: '800px' };
    }
  };

  const getContainerStyle = () => {
    const baseStyle = {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: campaign.design?.background || '#f9fafb',
      position: 'relative' as const,
      overflow: 'auto' as const,
      padding: (campaign.type === 'form' || campaign.type === 'quiz') ? '40px 20px' : '20px'
    } as React.CSSProperties;

    if (campaign.design?.backgroundImage) {
      return {
        ...baseStyle,
        backgroundImage: `url(${campaign.design.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    return baseStyle;
  };

  // Utiliser le système de synchronisation centralisé
  const enhancedCampaign = createSynchronizedQuizCampaign(campaign);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full h-full flex flex-col relative overflow-hidden rounded-[2px] shadow-2xl max-w-7xl max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold">Aperçu - {campaign.name}</h2>
              {previewUrl && (
                <div className="flex items-center gap-2 mt-1">
                  <a 
                    href={previewUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {previewUrl}
                  </a>
                  <button
                    onClick={handleCopyUrl}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copier l'URL"
                  >
                    {isCopied ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-600" />
                    )}
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleDeviceChange('desktop')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  device === 'desktop' ? 'bg-white shadow-sm scale-105' : 'hover:bg-gray-200'
                }`}
                disabled={isChangingDevice}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeviceChange('mobile')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  device === 'mobile' ? 'bg-white shadow-sm scale-105' : 'hover:bg-gray-200'
                }`}
                disabled={isChangingDevice}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden bg-gray-100">
          <div className="w-full h-full flex items-center justify-center p-8">
            <PreviewErrorBoundary>
              {isLoading ? (
                <PreviewLoadingState
                  device={device}
                  message={`Chargement preview ${device}...`}
                />
              ) : (
                <DeviceTransition device={device} isChanging={isChangingDevice}>
                  <div 
                    className="shadow-2xl rounded-2xl overflow-hidden border border-gray-200 transition-all duration-300"
                    style={getDeviceStyles()}
                  >
                    <div style={getContainerStyle()}>
                      {campaign.design?.backgroundImage && (
                        <div className="absolute inset-0 bg-black opacity-20" style={{ zIndex: 1 }} />
                      )}
                      <div
                        className="relative z-10 w-full h-full"
                        style={{ 
                          minHeight: device === 'desktop' ? '600px' : '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <GameCanvasPreview
                          campaign={enhancedCampaign}
                          previewDevice={device}
                          key={`canvas-preview-${device}-${enhancedCampaign.type}-${JSON.stringify(enhancedCampaign.gameConfig)}`}
                        />
                      </div>
                    </div>
                  </div>
                </DeviceTransition>
              )}
            </PreviewErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernPreviewModal;
