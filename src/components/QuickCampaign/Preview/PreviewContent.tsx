
import React from 'react';
import GameCanvasPreview from '../../ModernEditor/components/GameCanvasPreview';
import DeviceFrame from './DeviceFrame';
import CampaignPreviewFrame from './CampaignPreviewFrame';
import { useQuickCampaignStore } from '../../../stores/quickCampaignStore';
import ConstrainedContainer from './components/ConstrainedContainer';
import { DEVICE_CONSTRAINTS } from './utils/previewConstraints';

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


  const getFunnelComponent = () => (
    <GameCanvasPreview
      campaign={enhancedCampaign}
      previewDevice={selectedDevice}
      key={`quick-preview-${selectedDevice}-${selectedGameType}`}
    />
  );

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
