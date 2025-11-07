import React, { memo, useMemo } from 'react';
import { usePreloadCampaignImages } from '@/hooks/useFastCampaignLoader';

interface OptimizedPreviewWrapperProps {
  campaign: any;
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper optimisé qui précharge les images et gère l'affichage instantané
 */
const OptimizedPreviewWrapper: React.FC<OptimizedPreviewWrapperProps> = memo(({
  campaign,
  isLoading = false,
  children,
  className = ''
}) => {
  // Précharge les images dès que la campagne est disponible
  usePreloadCampaignImages(campaign);

  // Affichage optimisé avec transition
  const wrapperStyle = useMemo(() => ({
    opacity: campaign && !isLoading ? 1 : 0,
    transition: 'opacity 0.15s ease-in',
    width: '100%',
    height: '100%'
  }), [campaign, isLoading]);

  return (
    <div className={className} style={wrapperStyle}>
      {children}
    </div>
  );
});

OptimizedPreviewWrapper.displayName = 'OptimizedPreviewWrapper';

export default OptimizedPreviewWrapper;
