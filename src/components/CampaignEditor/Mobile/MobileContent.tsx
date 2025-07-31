import React from 'react';
import type { OptimizedCampaign, MobileConfig } from '../../ModernEditor/types/CampaignTypes';
import ContrastBackground from '../../common/ContrastBackground';
import { getTextBlockStyle } from './styles';

interface MobileContentProps {
  mobileConfig: MobileConfig;
  campaign: OptimizedCampaign;
  previewMode: string;
}

const MobileContent: React.FC<MobileContentProps> = ({
  mobileConfig
}) => {
  const renderContent = () => {
    const contrastBg = mobileConfig.contrastBackground || {};
    const textBlock = mobileConfig.showTitle !== false || mobileConfig.showDescription !== false ? <div style={getTextBlockStyle()}>
        <ContrastBackground enabled={contrastBg.enabled} config={contrastBg} className="w-full">
          {mobileConfig.showTitle !== false}
          {mobileConfig.showDescription !== false}
        </ContrastBackground>
      </div> : null;
    return [textBlock];
  };
  return <>
      {renderContent().map((element, idx) => element ? <React.Fragment key={idx}>{element}</React.Fragment> : null)}
    </>;
};

export default MobileContent;
