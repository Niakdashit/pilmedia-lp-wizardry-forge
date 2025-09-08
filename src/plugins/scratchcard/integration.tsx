// ScratchCard Game Plugin Integration
import { isFeatureEnabled } from '@/config/features';
import { ScratchCardCanvas } from './components/ScratchCardCanvas';
import { ScratchGamePanel } from './components/ScratchGamePanel';
import { createDefaultState } from './store';
import { ScratchCardState } from './types';

/**
 * Renders the appropriate scratch card system based on feature flag
 */
export const renderScratchCardSystem = (props: {
  campaign?: any;
  previewDevice?: string;
  canvasZoom?: number;
  mode?: 'edit' | 'preview';
  onStateChange?: (state: ScratchCardState) => void;
}) => {
  const { campaign, previewDevice, mode = 'preview', onStateChange } = props;
  
  // Check feature flag
  if (!isFeatureEnabled('scratchcardGame')) {
    console.log('[ScratchCardIntegration] Feature disabled, returning null');
    return null; // Return null to use fallback system
  }

  // Get scratch card state from campaign store
  const scratchCardState = campaign?.plugins?.scratchcardGame || createDefaultState();
  
  console.log('[ScratchCardIntegration] Rendering with state:', scratchCardState);
  console.log('[ScratchCardIntegration] Campaign has plugin data:', !!campaign?.plugins?.scratchcardGame);

  return (
    <ScratchCardCanvas
      mode={mode}
      state={scratchCardState}
      device={(previewDevice as 'desktop' | 'tablet' | 'mobile') || 'desktop'}
      onStateChange={(newState) => {
        console.log('[ScratchCardIntegration] State changed:', newState);
        if (onStateChange) {
          onStateChange(newState);
        }
      }}
      onCardProgress={(cardId: string, progress: number) => {
        console.log(`[ScratchCard] Card ${cardId} progress: ${Math.round(progress * 100)}%`);
      }}
      onCardRevealed={(cardId: string) => {
        console.log(`[ScratchCard] Card ${cardId} revealed!`);
      }}
      onReset={() => {
        console.log('[ScratchCard] All cards reset');
      }}
    />
  );
};

/**
 * Renders the scratch card configuration panel for sidebar
 */
export const renderScratchGamePanel = (props: {
  campaign?: any;
  onCampaignChange?: (campaign: any) => void;
  mode?: 'edit' | 'preview';
  onModeChange?: (mode: 'edit' | 'preview') => void;
}) => {
  const { campaign, onCampaignChange, mode = 'edit', onModeChange } = props;

  // Check feature flag
  if (!isFeatureEnabled('scratchcardGame')) {
    return null;
  }

  const scratchCardState = campaign?.plugins?.scratchcardGame || createDefaultState();

  const handleStateChange = (newState: ScratchCardState) => {
    if (onCampaignChange) {
      const updatedCampaign = {
        ...campaign,
        plugins: {
          ...campaign?.plugins,
          scratchcardGame: newState
        }
      };
      onCampaignChange(updatedCampaign);
    }
  };

  return (
    <ScratchGamePanel
      state={scratchCardState}
      onStateChange={handleStateChange}
      mode={mode}
      onModeChange={onModeChange || (() => {})}
    />
  );
};