import { useEffect } from 'react';
import { CampaignStorage } from '@/utils/campaignStorage';

/**
 * Hook to automatically cleanup old campaign caches on app mount
 * Removes campaign data older than 7 days to free up localStorage space
 */
export const useCampaignCleanup = () => {
  useEffect(() => {
    console.log('🧹 [CampaignCleanup] Running cleanup check...');
    
    // Run cleanup on mount
    const cleaned = CampaignStorage.cleanupOldCaches();
    
    if (cleaned > 0) {
      console.log(`✅ [CampaignCleanup] Cleaned ${cleaned} old campaign caches`);
    } else {
      console.log('✅ [CampaignCleanup] No old caches to clean');
    }
  }, []);
};
