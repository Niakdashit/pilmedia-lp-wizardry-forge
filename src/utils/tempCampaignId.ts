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
  
  // Clear all potential localStorage keys
  const screens: Array<'screen1' | 'screen2' | 'screen3'> = ['screen1', 'screen2', 'screen3'];
  const devices: Array<'desktop' | 'tablet' | 'mobile'> = ['desktop', 'tablet', 'mobile'];
  
  try {
    // Clear namespaced backgrounds
    screens.forEach((screen) => 
      devices.forEach((device) => {
        const key = `campaign_${campaignId}:bg-${device}-${screen}`;
        localStorage.removeItem(key);
      })
    );
    
    // Clear any other namespaced data
    localStorage.removeItem(`campaign_${campaignId}:canvasElements`);
    localStorage.removeItem(`campaign_${campaignId}:modularPage`);
    localStorage.removeItem(`campaign_${campaignId}:canvasZoom`);
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
