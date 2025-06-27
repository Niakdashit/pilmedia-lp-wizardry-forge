
import React from 'react';
import GridToggle from './components/GridToggle';
import FloatingActionButton from './components/FloatingActionButton';
import CanvasContent from './components/CanvasContent';
import { useCanvasElements } from './hooks/useCanvasElements';
import { useCanvasState } from './hooks/useCanvasState';
import { createSynchronizedQuizCampaign } from '../../utils/quizConfigSync';

interface ModernEditorCanvasProps {
  campaign: any;
  setCampaign: (updater: (prev: any) => any) => void;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  gameSize: 'small' | 'medium' | 'large' | 'xlarge';
  gamePosition: 'top' | 'center' | 'bottom' | 'left' | 'right';
}

const ModernEditorCanvas: React.FC<ModernEditorCanvasProps> = ({
  campaign,
  setCampaign,
  previewDevice,
  gameSize,
  gamePosition
}) => {
  const {
    showGridLines,
    setShowGridLines,
    showAddMenu,
    setShowAddMenu,
    canvasRef,
    handleCanvasClick,
    toggleAddMenu
  } = useCanvasState();

  const {
    selectedElement,
    setSelectedElement,
    customTexts,
    customImages,
    updateTextElement,
    updateImageElement,
    deleteTextElement,
    deleteImageElement,
    getElementDeviceConfig,
    addTextElement,
    addImageElement
  } = useCanvasElements(campaign, setCampaign, previewDevice);

  const headerBanner = campaign.design?.headerBanner;
  const footerBanner = campaign.design?.footerBanner;
  const headerText = campaign.design?.headerText;
  const footerText = campaign.design?.footerText;

  const sizeMap: Record<string, string> = {
    xs: '10px',
    sm: '12px',
    base: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '20px',
    '3xl': '24px',
    '4xl': '28px',
    '5xl': '32px',
    '6xl': '36px',
    '7xl': '48px',
    '8xl': '60px',
    '9xl': '72px'
  };

  const handleAddText = () => {
    addTextElement();
    setShowAddMenu(false);
  };

  const handleAddImage = () => {
    addImageElement();
    setShowAddMenu(false);
  };

  const handleCanvasClickWithDeselect = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedElement(null);
      setShowAddMenu(false);
    }
  };

  // Hauteur fixe, largeur responsive
  const FIXED_CANVAS_HEIGHT = 700;

  // Préparer la campagne avec toutes les configurations nécessaires
  const enhancedCampaign = React.useMemo(() => {
    const base = campaign.type === 'quiz' 
      ? createSynchronizedQuizCampaign(campaign)
      : campaign;

    return {
      ...base,
      gameSize,
      gamePosition,
      buttonConfig: {
        ...base.buttonConfig,
        text: base.buttonConfig?.text || base.gameConfig?.[base.type]?.buttonLabel || 'Jouer',
        color: base.design?.buttonColor || base.buttonConfig?.color || base.gameConfig?.[base.type]?.buttonColor || '#841b60'
      },
      design: {
        ...base.design,
        buttonColor: base.design?.buttonColor || base.buttonConfig?.color || '#841b60'
      }
    };
  }, [campaign, gameSize, gamePosition]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4 md:p-6 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      {/* Canvas container avec largeur responsive et hauteur fixe */}
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden relative w-full max-w-none"
        style={{
          height: `${FIXED_CANVAS_HEIGHT}px`,
          minHeight: `${FIXED_CANVAS_HEIGHT}px`,
          maxHeight: `${FIXED_CANVAS_HEIGHT}px`
        }}
      >
        {/* Canvas background */}
        <div
          ref={canvasRef}
          onClick={handleCanvasClickWithDeselect}
          className="relative w-full h-full overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${enhancedCampaign.design?.background || '#f8fafc'} 0%, ${enhancedCampaign.design?.background || '#f8fafc'}88 100%)`,
            backgroundImage: showGridLines ? 
              'radial-gradient(circle, rgba(147, 197, 253, 0.2) 1px, transparent 1px)' : 'none',
            backgroundSize: showGridLines ? '20px 20px' : 'auto'
          }}
        >
          <CanvasContent
            enhancedCampaign={enhancedCampaign}
            gameSize={gameSize}
            gamePosition={gamePosition}
            previewDevice={previewDevice}
            customTexts={customTexts}
            customImages={customImages}
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
            updateTextElement={updateTextElement}
            updateImageElement={updateImageElement}
            deleteTextElement={deleteTextElement}
            deleteImageElement={deleteImageElement}
            getElementDeviceConfig={getElementDeviceConfig}
            containerRef={canvasRef}
            sizeMap={sizeMap}
            headerBanner={headerBanner}
            headerText={headerText}
            footerBanner={footerBanner}
            footerText={footerText}
          />
        </div>

        {/* Floating action button - Canva style */}
        <FloatingActionButton
          showAddMenu={showAddMenu}
          onToggleMenu={toggleAddMenu}
          onAddText={handleAddText}
          onAddImage={handleAddImage}
        />

        {/* Grid toggle */}
        <div className="absolute top-6 right-6" style={{ zIndex: 20 }}>
          <GridToggle
            showGridLines={showGridLines}
            onToggle={() => setShowGridLines(!showGridLines)}
          />
        </div>
      </div>
    </div>
  );
};

export default ModernEditorCanvas;
