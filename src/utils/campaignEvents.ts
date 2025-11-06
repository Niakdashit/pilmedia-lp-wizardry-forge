/**
 * Système d'événements pour synchroniser les différentes parties du système de campagnes
 */

export type CampaignEventType = 
  | 'campaign:saved'
  | 'campaign:loaded'
  | 'campaign:cache:invalidate'
  | 'campaign:autosave:start'
  | 'campaign:autosave:complete';

export interface CampaignEventDetail {
  campaignId: string;
  data?: any;
  source?: string;
}

/**
 * Émet un événement de campagne
 */
export const emitCampaignEvent = (
  type: CampaignEventType,
  detail: CampaignEventDetail
) => {
  if (typeof window === 'undefined') return;
  
  const event = new CustomEvent(type, { detail });
  window.dispatchEvent(event);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📡 [CampaignEvents] ${type}:`, detail);
  }
};

/**
 * Écoute un événement de campagne
 */
export const onCampaignEvent = (
  type: CampaignEventType,
  handler: (detail: CampaignEventDetail) => void
) => {
  if (typeof window === 'undefined') return () => {};
  
  const listener = ((event: CustomEvent<CampaignEventDetail>) => {
    handler(event.detail);
  }) as EventListener;
  
  window.addEventListener(type, listener);
  
  return () => {
    window.removeEventListener(type, listener);
  };
};
