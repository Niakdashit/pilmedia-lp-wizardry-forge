
import React, { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import GameCanvasPreview from '../CampaignEditor/GameCanvasPreview';
import TextElement from './TextElement';
import ImageElement from './ImageElement';
import CanvasHeader from './components/CanvasHeader';
import CanvasFooter from './components/CanvasFooter';
import GridToggle from './components/GridToggle';
import { useCanvasElements } from './hooks/useCanvasElements';

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
  const [showGridLines, setShowGridLines] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

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

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedElement(null);
      setShowAddMenu(false);
    }
  };

  const handleAddText = () => {
    console.log('Ajout de texte déclenché');
    addTextElement();
    setShowAddMenu(false);
  };

  const handleAddImage = () => {
    console.log('Ajout d\'image déclenché');
    addImageElement();
    setShowAddMenu(false);
  };

  const toggleAddMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Toggle menu:', !showAddMenu);
    setShowAddMenu(!showAddMenu);
  };

  // Hauteur fixe, largeur responsive
  const FIXED_CANVAS_HEIGHT = 700;

  // Préparer la configuration complète du quiz avec les styles de design IDENTIQUES à la modal
  const enhancedCampaign = {
    ...campaign,
    gameSize,
    gamePosition,
    buttonConfig: {
      ...campaign.buttonConfig,
      text: campaign.buttonConfig?.text || campaign.gameConfig?.[campaign.type]?.buttonLabel || 'Jouer',
      color: campaign.design?.buttonColor || campaign.buttonConfig?.color || campaign.gameConfig?.[campaign.type]?.buttonColor || '#841b60'
    },
    design: {
      ...campaign.design,
      buttonColor: campaign.design?.buttonColor || campaign.buttonConfig?.color || '#841b60',
      titleColor: campaign.design?.titleColor || '#000000',
      background: campaign.design?.background || '#f8fafc',
      blockColor: campaign.design?.blockColor || '#ffffff',
      borderColor: campaign.design?.borderColor || '#e5e7eb',
      borderRadius: campaign.design?.borderRadius || '8px',
      buttonTextColor: campaign.design?.buttonTextColor || '#ffffff',
      // Styles spécifiques pour le quiz - alignés avec la modal
      containerBackgroundColor: campaign.design?.blockColor || '#ffffff',
      primaryColor: campaign.design?.buttonColor || '#841b60',
      secondaryColor: campaign.design?.secondaryColor || '#1e40af',
      textColor: campaign.design?.titleColor || '#1f2937',
      secondaryTextColor: campaign.design?.secondaryTextColor || '#6b7280',
      fontFamily: campaign.design?.fontFamily || 'Inter, sans-serif',
      questionFontSize: '1.5rem',
      questionFontWeight: '600',
      optionBackgroundColor: campaign.design?.blockColor || '#ffffff',
      optionBorderColor: campaign.design?.borderColor || '#e5e7eb',
      enableShadow: true,
      enableGradient: true,
      progressBackgroundColor: '#f3f4f6'
    },
    gameConfig: {
      ...campaign.gameConfig,
      [campaign.type]: {
        ...campaign.gameConfig?.[campaign.type],
        buttonLabel: campaign.buttonConfig?.text || campaign.gameConfig?.[campaign.type]?.buttonLabel || 'Jouer',
        buttonColor: campaign.design?.buttonColor || campaign.buttonConfig?.color || campaign.gameConfig?.[campaign.type]?.buttonColor || '#841b60',
        containerBackgroundColor: campaign.design?.blockColor || campaign.gameConfig?.[campaign.type]?.containerBackgroundColor || '#ffffff',
        backgroundColor: campaign.design?.blockColor || campaign.gameConfig?.[campaign.type]?.backgroundColor || '#ffffff',
        borderColor: campaign.design?.borderColor || campaign.gameConfig?.[campaign.type]?.borderColor || '#e5e7eb',
        borderRadius: campaign.design?.borderRadius || campaign.gameConfig?.[campaign.type]?.borderRadius || '8px',
        textColor: campaign.design?.titleColor || '#000000',
        questionBackgroundColor: campaign.design?.blockColor || '#ffffff',
        optionBackgroundColor: campaign.design?.blockColor || '#ffffff',
        optionBorderColor: campaign.design?.borderColor || '#e5e7eb',
        correctOptionColor: campaign.design?.buttonColor || '#841b60',
        incorrectOptionColor: '#ef4444'
      }
    }
  };

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
          onClick={handleCanvasClick}
          className="relative w-full h-full overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${campaign.design?.background || '#f8fafc'} 0%, ${campaign.design?.background || '#f8fafc'}88 100%)`,
            backgroundImage: showGridLines ? 
              'radial-gradient(circle, rgba(147, 197, 253, 0.2) 1px, transparent 1px)' : 'none',
            backgroundSize: showGridLines ? '20px 20px' : 'auto'
          }}
        >
          <CanvasHeader
            headerBanner={headerBanner}
            headerText={headerText}
            sizeMap={sizeMap}
          />

          <div className="flex-1 flex relative h-full">
            {/* Container spécial pour les quizzes pour assurer la cohérence avec la modal */}
            {campaign.type === 'quiz' ? (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{
                  padding: '40px 20px',
                  backgroundColor: campaign.design?.background || '#f8fafc'
                }}
              >
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    maxWidth: '800px',
                    margin: '0 auto'
                  }}
                >
                  <GameCanvasPreview
                    campaign={enhancedCampaign}
                    gameSize={gameSize}
                    className="w-full h-full"
                    key={`quiz-preview-${gameSize}-${gamePosition}-${campaign.design?.buttonColor}-${campaign.design?.blockColor}-${campaign.design?.borderColor}-${JSON.stringify(campaign.gameConfig?.[campaign.type])}`}
                    previewDevice={previewDevice}
                  />
                </div>
              </div>
            ) : (
              <GameCanvasPreview
                campaign={enhancedCampaign}
                gameSize={gameSize}
                className="w-full h-full"
                key={`preview-${gameSize}-${gamePosition}-${campaign.design?.buttonColor}-${campaign.design?.blockColor}-${campaign.design?.borderColor}-${JSON.stringify(campaign.gameConfig?.[campaign.type])}`}
                previewDevice={previewDevice}
              />
            )}
            
            {/* Custom Text Elements */}
            {customTexts.map((customText: any) => (
              customText?.enabled && (
                <TextElement
                  key={`text-${customText.id}-${previewDevice}`}
                  element={customText}
                  isSelected={selectedElement?.type === 'text' && selectedElement?.id === customText.id}
                  onSelect={() => setSelectedElement({ type: 'text', id: customText.id })}
                  onUpdate={(updates) => updateTextElement(customText.id, updates)}
                  onDelete={() => deleteTextElement(customText.id)}
                  containerRef={canvasRef}
                  sizeMap={sizeMap}
                  getElementDeviceConfig={getElementDeviceConfig}
                />
              )
            ))}

            {/* Custom Image Elements */}
            {customImages.map((customImage: any) => (
              <ImageElement
                key={`image-${customImage.id}-${previewDevice}`}
                element={customImage}
                isSelected={selectedElement?.type === 'image' && selectedElement?.id === customImage.id}
                onSelect={() => setSelectedElement({ type: 'image', id: customImage.id })}
                onUpdate={(updates) => updateImageElement(customImage.id, updates)}
                onDelete={() => deleteImageElement(customImage.id)}
                containerRef={canvasRef}
                getElementDeviceConfig={getElementDeviceConfig}
              />
            ))}
          </div>

          <CanvasFooter
            footerBanner={footerBanner}
            footerText={footerText}
            sizeMap={sizeMap}
          />
        </div>

        {/* Floating action button - Canva style */}
        <div className="absolute bottom-8 right-8" style={{ zIndex: 50 }}>
          <div className="relative">
            {/* Add menu */}
            {showAddMenu && (
              <div
                className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-2xl border border-gray-200/50 p-2 min-w-48"
                style={{ zIndex: 60 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleAddText}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">T</span>
                  </div>
                  <span className="font-medium text-gray-900">Ajouter du texte</span>
                </button>
                <button
                  onClick={handleAddImage}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">📷</span>
                  </div>
                  <span className="font-medium text-gray-900">Ajouter une image</span>
                </button>
              </div>
            )}

            {/* Main add button */}
            <button
              onClick={toggleAddMenu}
              className="w-14 h-14 bg-gradient-to-r from-[#841b60] to-[#6d164f] hover:from-[#6d164f] hover:to-[#841b60] text-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center transform hover:scale-105"
              type="button"
            >
              <Plus className={`w-6 h-6 transition-transform duration-300 ${showAddMenu ? 'rotate-45' : ''}`} />
            </button>
          </div>
        </div>

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
