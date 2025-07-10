
import React from 'react';
import { useQuickCampaignStore } from '../../../stores/quickCampaignStore';
import ConstrainedContainer from './components/ConstrainedContainer';
import { DEVICE_CONSTRAINTS } from './utils/previewConstraints';

interface CampaignPreviewFrameProps {
  children: React.ReactNode;
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
}

const CampaignPreviewFrame: React.FC<CampaignPreviewFrameProps> = ({
  children,
  selectedDevice
}) => {
  const { backgroundImageUrl } = useQuickCampaignStore();
  const constraints = DEVICE_CONSTRAINTS[selectedDevice];

  const containerStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
    backgroundSize: '100% auto !important', // Force image to take full width
    backgroundPosition: 'center top !important',
    backgroundRepeat: 'no-repeat !important',
    border: '1px solid #e5e7eb',
    borderRadius: selectedDevice === 'mobile' ? '24px' : '12px',
    minHeight: '100vh',
    height: '100vh',
    width: '100%',
  };

  return (
    <ConstrainedContainer
      maxWidth={constraints.maxWidth}
      maxHeight={constraints.maxHeight}
      style={containerStyle}
    >
      <div 
        className="w-full h-full p-4 overflow-hidden box-border"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100%'
        }}
      >
        {children}
      </div>
    </ConstrainedContainer>
  );
};

export default CampaignPreviewFrame;
