
import React, { useCallback } from 'react';
import type { DeviceType, EditorConfig, CustomText } from './QualifioEditorLayout';
import Mode1Preview from './Preview/Mode1Preview';

interface QualifioPreviewProps {
  device: DeviceType;
  config: EditorConfig;
  onConfigUpdate?: (updates: Partial<EditorConfig>) => void;
  isRealTimeSyncEnabled?: boolean;
  isLivePreview?: boolean;
}

const QualifioPreview: React.FC<QualifioPreviewProps> = ({ 
  device, 
  config, 
  onConfigUpdate,
  isRealTimeSyncEnabled = false 
}) => {

  const handleTextUpdate = useCallback((updatedText: CustomText) => {
    if (!onConfigUpdate) return;
    
    const updatedTexts = config.customTexts?.map(text => 
      text.id === updatedText.id ? updatedText : text
    ) || [];
    
    onConfigUpdate({ customTexts: updatedTexts });
  }, [config.customTexts, onConfigUpdate]);

  const handleTextDelete = useCallback((textId: string) => {
    if (!onConfigUpdate) return;
    
    const updatedTexts = config.customTexts?.filter(text => text.id !== textId) || [];
    onConfigUpdate({ customTexts: updatedTexts });
  }, [config.customTexts, onConfigUpdate]);

  const handleImageUpdate = useCallback((updatedImage: any) => {
    if (!onConfigUpdate) return;
    
    const updatedImages = config.design?.customImages?.map((image: any) => 
      image.id === updatedImage.id ? updatedImage : image
    ) || [];
    
    onConfigUpdate({ 
      design: { 
        ...config.design, 
        customImages: updatedImages 
      } 
    });
  }, [config.design, onConfigUpdate]);

  const handleImageDelete = useCallback((imageId: string) => {
    if (!onConfigUpdate) return;
    
    const updatedImages = config.design?.customImages?.filter((image: any) => image.id !== imageId) || [];
    onConfigUpdate({ 
      design: { 
        ...config.design, 
        customImages: updatedImages 
      } 
    });
  }, [config.design, onConfigUpdate]);

  const handleContainerClick = useCallback(() => {
    // Empty callback for container clicks
  }, []);

  // Device-specific container styles
  const getContainerStyles = () => {
    switch (device) {
      case 'mobile':
        return {
          width: '375px',
          height: '812px',
          maxWidth: '375px'
        };
      case 'tablet':
        return {
          width: '768px',
          height: '1024px',
          maxWidth: '768px'
        };
      case 'desktop':
      default:
        return {
          width: '1200px',
          height: '675px',
          maxWidth: '1200px'
        };
    }
  };

  const containerStyles = getContainerStyles();

  return (
    <div className="flex justify-center items-start h-full py-8">
      <div 
        className="relative bg-white shadow-2xl rounded-lg overflow-hidden border-2 border-gray-200"
        style={containerStyles}
      >
        {/* Real-time sync indicator */}
        {isRealTimeSyncEnabled && (
          <div className="absolute top-2 right-2 z-50">
            <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
              Sync temps réel
            </div>
          </div>
        )}
        
        {/* Preview content */}
        <Mode1Preview
          device={device}
          config={config}
          onTextUpdate={handleTextUpdate}
          onTextDelete={handleTextDelete}
          onImageUpdate={handleImageUpdate}
          onImageDelete={handleImageDelete}
          onContainerClick={handleContainerClick}
        />
      </div>
    </div>
  );
};

export default QualifioPreview;
