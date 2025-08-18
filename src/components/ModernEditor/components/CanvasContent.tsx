
import React from 'react';
import GameCanvasPreview from './GameCanvasPreview';
import TextElement from '../TextElement';
import ImageElement from '../ImageElement';
import CanvasHeader from './CanvasHeader';
import CanvasFooter from './CanvasFooter';

interface CanvasContentProps {
  enhancedCampaign: any;
  gameSize: 'small' | 'medium' | 'large' | 'xlarge';
  gamePosition: 'top' | 'center' | 'bottom' | 'left' | 'right';
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  customTexts: any[];
  customImages: any[];
  selectedElement: any;
  setSelectedElement: (element: any) => void;
  updateTextElement: (id: number, updates: any) => void;
  updateImageElement: (id: number, updates: any) => void;
  deleteTextElement: (id: number) => void;
  deleteImageElement: (id: number) => void;
  getElementDeviceConfig: (element: any) => any;
  containerRef: React.RefObject<HTMLDivElement>;
  sizeMap: Record<string, string>;
  headerBanner: any;
  headerText: any;
  footerBanner: any;
  footerText: any;
}

const CanvasContent: React.FC<CanvasContentProps> = ({
  enhancedCampaign,
  gameSize,
  gamePosition,
  previewDevice,
  customTexts,
  customImages,
  selectedElement,
  setSelectedElement,
  updateTextElement,
  updateImageElement,
  deleteTextElement,
  deleteImageElement,
  getElementDeviceConfig,
  containerRef,
  sizeMap,
  headerBanner,
  headerText,
  footerBanner,
  footerText
}) => {
  return (
    <>
      <CanvasHeader
        headerBanner={headerBanner}
        headerText={headerText}
        sizeMap={sizeMap}
      />

      <div className="flex-1 flex relative h-full">
        <GameCanvasPreview
          campaign={enhancedCampaign}
          key={`preview-${gameSize}-${gamePosition}-${enhancedCampaign.type}-${JSON.stringify(enhancedCampaign.design)}-${JSON.stringify(enhancedCampaign.gameConfig)}-${previewDevice}`}
          previewDevice={previewDevice}
        />
        
        {/* Custom Text Elements - Rendus en temps réel */}
        {customTexts.map((customText: any) => (
          customText?.enabled && (
            <TextElement
              key={`text-${customText.id}-${previewDevice}`}
              element={customText}
              isSelected={selectedElement?.type === 'text' && selectedElement?.id === customText.id}
              onSelect={() => {
                setSelectedElement({ type: 'text', id: customText.id });
                console.log('Text element selected:', customText.id);
              }}
              onUpdate={(updates) => {
                console.log('Updating text element:', customText.id, updates);
                updateTextElement(customText.id, updates);
              }}
              onDelete={() => {
                console.log('Deleting text element:', customText.id);
                deleteTextElement(customText.id);
              }}
              containerRef={containerRef}
              sizeMap={sizeMap}
              getElementDeviceConfig={getElementDeviceConfig}
              previewDevice={previewDevice}
            />
          )
        ))}

        {/* Custom Image Elements - Rendus en temps réel */}
        {customImages.map((customImage: any) => (
          customImage?.src && (
            <ImageElement
              key={`image-${customImage.id}-${previewDevice}`}
              element={customImage}
              isSelected={selectedElement?.type === 'image' && selectedElement?.id === customImage.id}
              onSelect={() => {
                setSelectedElement({ type: 'image', id: customImage.id });
                console.log('Image element selected:', customImage.id);
              }}
              onUpdate={(updates) => {
                console.log('Updating image element:', customImage.id, updates);
                updateImageElement(customImage.id, updates);
              }}
              onDelete={() => {
                console.log('Deleting image element:', customImage.id);
                deleteImageElement(customImage.id);
              }}
              containerRef={containerRef}
              getElementDeviceConfig={getElementDeviceConfig}
              previewDevice={previewDevice}
            />
          )
        ))}
      </div>

      <CanvasFooter
        footerBanner={footerBanner}
        footerText={footerText}
        sizeMap={sizeMap}
      />
    </>
  );
};

export default CanvasContent;
