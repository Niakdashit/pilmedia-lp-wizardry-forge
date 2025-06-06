
import React from 'react';
import FunnelUnlockedGame from '../../funnels/FunnelUnlockedGame';
import FunnelStandard from '../../funnels/FunnelStandard';

interface PreviewContentProps {
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  mockCampaign: any;
  selectedGameType: string;
  customColors: {
    primary: string;
    secondary: string;
    accent?: string;
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
  const unlockedTypes = ['wheel', 'scratch', 'jackpot', 'dice'];

  const getFunnelComponent = () => {
    if (unlockedTypes.includes(selectedGameType)) {
      return (
        <FunnelUnlockedGame
          campaign={mockCampaign}
          previewMode={selectedDevice}
          mobileConfig={mockCampaign.mobileConfig}
          modalContained={false}
        />
      );
    }
    return <FunnelStandard campaign={mockCampaign} />;
  };

  const renderPreview = () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 relative overflow-hidden p-4 md:p-8">
      {mockCampaign.design?.backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: `url(${mockCampaign.design.backgroundImage})` }}
        />
      )}
      <div className="relative z-10 max-w-2xl mx-auto w-full">
        {getFunnelComponent()}
      </div>
    </div>
  );

  return (
    <div className="flex-1 pt-20 overflow-auto">
      {renderPreview()}
    </div>
  );
};

export default PreviewContent;
