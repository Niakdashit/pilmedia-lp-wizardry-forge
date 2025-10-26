/**
 * Campaign Storage Utility
 * Provides namespaced localStorage management for campaign isolation
 * Each campaign has its own localStorage namespace to prevent data mixing
 */

export interface CampaignData {
  campaign: any;
  canvasElements?: any[];
  modularPage?: any;
  screenBackgrounds?: any;
  extractedColors?: any[];
  canvasZoom?: number;
  lastAccessed: number;
}

export class CampaignStorage {
  /**
   * Get the storage namespace for a campaign
   */
  private static getNamespace(campaignId: string): string {
    return `campaign_${campaignId}`;
  }

  /**
   * Save data for a specific campaign with namespacing
   */
  static saveData(campaignId: string, key: string, value: any): void {
    if (!campaignId) {
      console.warn('[CampaignStorage] Cannot save without campaignId');
      return;
    }

    try {
      const namespace = this.getNamespace(campaignId);
      const storageKey = `${namespace}:${key}`;
      localStorage.setItem(storageKey, JSON.stringify(value));
      console.log(`💾 [CampaignStorage] Saved ${key} for campaign ${campaignId}`);
    } catch (error) {
      console.error(`[CampaignStorage] Failed to save ${key}:`, error);
    }
  }

  /**
   * Load data for a specific campaign
   */
  static loadData<T>(campaignId: string, key: string): T | null {
    if (!campaignId) {
      console.warn('[CampaignStorage] Cannot load without campaignId');
      return null;
    }

    try {
      const namespace = this.getNamespace(campaignId);
      const storageKey = `${namespace}:${key}`;
      const item = localStorage.getItem(storageKey);
      
      if (!item) return null;
      
      const data = JSON.parse(item);
      console.log(`📂 [CampaignStorage] Loaded ${key} for campaign ${campaignId}`);
      return data as T;
    } catch (error) {
      console.error(`[CampaignStorage] Failed to load ${key}:`, error);
      return null;
    }
  }

  /**
   * Clear all data for a specific campaign
   */
  static clearCampaign(campaignId: string): void {
    if (!campaignId) return;

    try {
      const namespace = this.getNamespace(campaignId);
      const keysToRemove: string[] = [];
      
      // Find all keys for this campaign
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(namespace)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all found keys
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`🗑️ [CampaignStorage] Cleared ${keysToRemove.length} keys for campaign ${campaignId}`);
    } catch (error) {
      console.error('[CampaignStorage] Failed to clear campaign:', error);
    }
  }

  /**
   * Clear all campaign data from localStorage
   */
  static clearAll(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('campaign_')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`🗑️ [CampaignStorage] Cleared all campaign data (${keysToRemove.length} keys)`);
    } catch (error) {
      console.error('[CampaignStorage] Failed to clear all:', error);
    }
  }

  /**
   * Save complete campaign state with metadata
   */
  static saveCampaignState(campaignId: string, data: Omit<CampaignData, 'lastAccessed'>): void {
    const stateWithTimestamp: CampaignData = {
      ...data,
      lastAccessed: Date.now()
    };
    this.saveData(campaignId, 'editorCache', stateWithTimestamp);
  }

  /**
   * Load complete campaign state
   */
  static loadCampaignState(campaignId: string): CampaignData | null {
    return this.loadData<CampaignData>(campaignId, 'editorCache');
  }

  /**
   * Clean up old campaign caches (older than 7 days)
   */
  static cleanupOldCaches(): number {
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    let cleaned = 0;

    try {
      const keysToCheck: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('campaign_') && key.endsWith(':editorCache')) {
          keysToCheck.push(key);
        }
      }

      keysToCheck.forEach(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.lastAccessed && (now - data.lastAccessed) > SEVEN_DAYS) {
            // Extract campaignId from key (format: campaign_<id>:editorCache)
            const campaignId = key.split(':')[0].replace('campaign_', '');
            this.clearCampaign(campaignId);
            cleaned++;
          }
        } catch {
          // Invalid data, remove it
          localStorage.removeItem(key);
          cleaned++;
        }
      });

      if (cleaned > 0) {
        console.log(`🧹 [CampaignStorage] Cleaned up ${cleaned} old campaign caches`);
      }
    } catch (error) {
      console.error('[CampaignStorage] Failed to cleanup old caches:', error);
    }

    return cleaned;
  }

  /**
   * Get list of all cached campaign IDs
   */
  static getCachedCampaigns(): string[] {
    const campaigns: string[] = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('campaign_') && key.includes(':')) {
          const campaignId = key.split(':')[0].replace('campaign_', '');
          if (!campaigns.includes(campaignId)) {
            campaigns.push(campaignId);
          }
        }
      }
    } catch (error) {
      console.error('[CampaignStorage] Failed to get cached campaigns:', error);
    }

    return campaigns;
  }
}
