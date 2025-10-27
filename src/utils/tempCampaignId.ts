/**
 * Temporary Campaign ID Management
 * 
 * System to ensure that new campaigns created via header shortcuts
 * remain completely blank until they are explicitly saved to the database.
 */

const TEMP_ID_PREFIX = 'temp-' as const;

/**
 * Generate a unique temporary campaign ID
 */
export function generateTempCampaignId(campaignType: string): string {
  return `${TEMP_ID_PREFIX}${campaignType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if a campaign ID is temporary
 */
export function isTempCampaignId(campaignId: string | null | undefined): boolean {
  if (!campaignId) return false;
  return campaignId.startsWith(TEMP_ID_PREFIX);
}

/**
 * Check if a campaign ID is a valid UUID (persisted campaign)
 */
export function isPersistedCampaignId(campaignId: string | null | undefined): boolean {
  if (!campaignId) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(campaignId);
}

/**
 * Clear all localStorage data for temporary campaigns
 * This ensures temporary campaigns don't inherit any old data
 */
export function clearTempCampaignData(campaignId: string): void {
  if (!isTempCampaignId(campaignId)) return;
  
  console.log('🧹 [TempCampaign] Clearing all data for temporary campaign:', campaignId);
  
  // Clear all potential localStorage keys related to this temp campaign and legacy globals
  try {
    const prefixesToWipe = [
      // Namespaced to this campaign
      `campaign_${campaignId}:`,
      `campaign:draft:${campaignId}`,
      // Legacy/global prefixes that can leak between campaigns
      'design-bg-',
      'quiz-bg-',
      'quiz-bg-owner',
      'quiz-modules-',
      'quiz-layer-',
      'form-bg-',
      'editor-zoom-',
      // Scratch/Jackpot backgrounds + modern editor backgrounds
      'sc-bg-',
      'modern-bg-'
    ];

    // Iterate through all localStorage keys and remove matches
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (prefixesToWipe.some((p) => key.startsWith(p))) {
        try { localStorage.removeItem(key); } catch {}
      }
      // Also remove explicit known keys per campaign namespace
      if (key === `campaign_${campaignId}:canvasElements` ||
          key === `campaign_${campaignId}:modularPage` ||
          key === `campaign_${campaignId}:canvasZoom`) {
        try { localStorage.removeItem(key); } catch {}
      }
    }
  } catch (error) {
    console.error('Failed to clear temp campaign data:', error);
  }
}

/**
 * Replace temporary campaign ID with real persisted ID after save
 */
export function replaceTempWithPersistedId(
  tempId: string,
  persistedId: string,
  onIdChanged: (newId: string) => void
): void {
  if (!isTempCampaignId(tempId) || !isPersistedCampaignId(persistedId)) {
    console.warn('Invalid ID replacement attempt:', { tempId, persistedId });
    return;
  }
  
  console.log('🔄 [TempCampaign] Replacing temp ID with persisted ID:', { tempId, persistedId });
  
  // Clear temporary data
  clearTempCampaignData(tempId);
  
  // Notify that ID has changed
  onIdChanged(persistedId);
}
