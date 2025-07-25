
import React from 'react';
import FunnelUnlockedGame from '../../funnels/FunnelUnlockedGame';
import FunnelStandard from '../../funnels/FunnelStandard';
import DeviceFrame from './DeviceFrame';
import CampaignPreviewFrame from './CampaignPreviewFrame';
import { useQuickCampaignStore } from '../../../stores/quickCampaignStore';
import ConstrainedContainer from './components/ConstrainedContainer';
import { DEVICE_CONSTRAINTS } from './utils/previewConstraints';
import { shouldUseUnlockedFunnel, shouldUseStandardFunnel } from '../../../utils/funnelMatcher';
import CustomElementsRenderer from '../../ModernEditor/components/CustomElementsRenderer';

interface PreviewContentProps {
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  mockCampaign: any;
  selectedGameType: string;
  customColors: {
    primary: string;
    secondary: string;
    accent?: string;
    textColor?: string;
    buttonStyle?: string;
  };
  jackpotColors: {
    containerBackgroundColor: string;
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    slotBorderColor: string;
    slotBorderWidth: number;
    slotBackgroundColor: string;
  };
}

const PreviewContent: React.FC<PreviewContentProps> = ({
  selectedDevice,
  mockCampaign,
  selectedGameType,
  customColors,
  jackpotColors
}) => {
  const { backgroundImageUrl, gamePosition } = useQuickCampaignStore();
  const constraints = DEVICE_CONSTRAINTS[selectedDevice];

  // Size mapping for text elements
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

  // Configuration cohérente des couleurs
  const enhancedCampaign = React.useMemo(() => {
    return {
      ...mockCampaign,
      design: {
        ...mockCampaign.design,
        customColors: customColors,
        buttonColor: customColors.primary,
        titleColor: customColors.textColor || '#000000',
        background: mockCampaign.design?.background || '#f8fafc',
        backgroundImage: backgroundImageUrl || mockCampaign.design?.backgroundImage,
        mobileBackgroundImage: backgroundImageUrl || mockCampaign.design?.mobileBackgroundImage,
        containerBackgroundColor: '#ffffff',
        borderColor: customColors.primary,
        borderRadius: '16px'
      },
      buttonConfig: {
        ...mockCampaign.buttonConfig,
        color: customColors.primary,
        borderColor: customColors.primary,
        textColor: customColors.textColor || '#ffffff',
        size: 'medium',
        borderRadius: 8
      },
      gameConfig: {
        ...mockCampaign.gameConfig,
        jackpot: {
          ...mockCampaign.gameConfig?.jackpot,
          ...jackpotColors,
          buttonColor: customColors.primary
        },
        [selectedGameType]: {
          ...mockCampaign.gameConfig?.[selectedGameType],
          buttonColor: customColors.primary,
          buttonLabel: mockCampaign.gameConfig?.[selectedGameType]?.buttonLabel || 'Jouer'
        }
      },
      mobileConfig: {
        ...mockCampaign.mobileConfig,
        gamePosition: gamePosition,
        buttonColor: customColors.primary,
        buttonTextColor: customColors.textColor || '#ffffff'
      },
      config: {
        ...mockCampaign.config,
        roulette: {
          ...mockCampaign.config?.roulette,
          borderColor: customColors.primary,
          borderOutlineColor: customColors.accent || customColors.secondary,
          segmentColor1: customColors.primary,
          segmentColor2: customColors.secondary
        }
      }
    };
  }, [mockCampaign, selectedGameType, customColors, jackpotColors, backgroundImageUrl, gamePosition]);

  // Extract custom elements
  const customTexts = enhancedCampaign.design?.customTexts || [];
  const customImages = enhancedCampaign.design?.customImages || [];

  const getFunnelComponent = () => {
    console.log('Selecting funnel for game type:', selectedGameType);
    
    // Utiliser le système funnelMatcher pour déterminer le bon funnel
    const useUnlockedFunnel = shouldUseUnlockedFunnel(selectedGameType);
    const useStandardFunnel = shouldUseStandardFunnel(selectedGameType);
    
    console.log('Should use unlocked funnel:', useUnlockedFunnel);
    console.log('Should use standard funnel:', useStandardFunnel);
    
    if (useUnlockedFunnel) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <FunnelUnlockedGame
            campaign={enhancedCampaign}
            previewMode={selectedDevice === 'desktop' ? 'desktop' : selectedDevice}
            key={`unlocked-${JSON.stringify(customColors)}-${gamePosition}-${selectedDevice}`}
          />
          
          {/* Render custom elements on top */}
          <CustomElementsRenderer
            customTexts={customTexts}
            customImages={customImages}
            previewDevice={selectedDevice}
            sizeMap={sizeMap}
          />
        </div>
      );
    }
    
    if (useStandardFunnel) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <FunnelStandard
            campaign={enhancedCampaign}
            key={`standard-${JSON.stringify(customColors)}-${gamePosition}-${selectedDevice}`}
          />
          
          {/* Render custom elements on top */}
          <CustomElementsRenderer
            customTexts={customTexts}
            customImages={customImages}
            previewDevice={selectedDevice}
            sizeMap={sizeMap}
          />
        </div>
      );
    }

    // Fallback pour types non reconnus
    console.warn(`Type de jeu "${selectedGameType}" non reconnu par le système de funnels`);
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-center text-red-500 bg-red-50 p-6 rounded-lg border border-red-200">
          <h3 className="font-semibold mb-2">Type de jeu non supporté</h3>
          <p className="text-sm">Le type "{selectedGameType}" n'est pas configuré pour utiliser un funnel.</p>
          <p className="text-xs mt-2 text-gray-600">
            Types supportés: wheel, scratch, jackpot, dice (unlocked) | form, quiz, memory, puzzle (standard)
          </p>
        </div>
      </div>
    );
  };

  const previewContent = (
    <CampaignPreviewFrame selectedDevice={selectedDevice}>
      <div 
        className="w-full h-full flex items-center justify-center overflow-hidden"
        style={{
          maxWidth: `${constraints.maxWidth}px`,
          maxHeight: `${constraints.maxHeight}px`,
        }}
      >
        {getFunnelComponent()}
      </div>
    </CampaignPreviewFrame>
  );

  return (
    <div className="flex-1 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <ConstrainedContainer
        maxWidth={selectedDevice === 'desktop' ? 1400 : constraints.maxWidth + 100}
        maxHeight={selectedDevice === 'desktop' ? 900 : constraints.maxHeight + 100}
        className="p-2"
      >
        {selectedDevice === 'desktop' ? (
          previewContent
        ) : (
          <DeviceFrame device={selectedDevice}>
            {previewContent}
          </DeviceFrame>
        )}
      </ConstrainedContainer>
    </div>
  );
};

export default PreviewContent;
