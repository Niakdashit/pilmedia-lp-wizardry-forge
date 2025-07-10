
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
    backgroundSize: 'contain', // Changed from 'cover' to 'contain'
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    border: '1px solid #e5e7eb',
    borderRadius: selectedDevice === 'mobile' ? '24px' : '12px',
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
          justifyContent: 'center'
        }}
      >
        {children}
      </div>
    </ConstrainedContainer>
  );
};

export default CampaignPreviewFrame;
