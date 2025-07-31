import { PREVIEW_CONTAINER_SPECS, MOBILE_FORMAT_SPECS } from './constants';
import type { MobileConfig } from '../../ModernEditor/types/CampaignTypes';

export const getDeviceStyle = () => ({
  width: PREVIEW_CONTAINER_SPECS.mobile.width,
  height: PREVIEW_CONTAINER_SPECS.mobile.height,
  backgroundColor: '#1f2937',
  borderRadius: '24px',
  padding: '8px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  position: 'relative' as const,
  overflow: 'hidden'
});

export const getScreenStyle = (mobileConfig: MobileConfig) => ({
  width: '100%',
  height: '100%',
  backgroundColor: mobileConfig.backgroundColor || '#ebf4f7',
  backgroundImage: mobileConfig.backgroundImage ? `url(${mobileConfig.backgroundImage})` : undefined,
  backgroundSize: mobileConfig.backgroundMode === 'contain' ? 'contain' : 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  borderRadius: '16px',
  position: 'relative' as const,
  overflow: 'hidden',
  // Ensure proper aspect ratio for 1080×1920px content
  aspectRatio: `${MOBILE_FORMAT_SPECS.width} / ${MOBILE_FORMAT_SPECS.height}`
});

export const getContentLayoutStyle = (mobileConfig: MobileConfig) => {
  const position = mobileConfig.textPosition || 'top';
  const spacing = mobileConfig.verticalSpacing || 20;
  const padding = mobileConfig.horizontalPadding || 16;
  
  return {
    position: 'absolute' as const,
    left: padding,
    right: padding,
    zIndex: 5,
    ...(position === 'top' && { top: spacing }),
    ...(position === 'center' && { 
      top: '50%', 
      transform: 'translateY(-50%)' 
    }),
    ...(position === 'bottom' && { bottom: spacing }),
    pointerEvents: 'none' as const
  };
};

export const getTextBlockStyle = () => ({
  width: '100%'
});
