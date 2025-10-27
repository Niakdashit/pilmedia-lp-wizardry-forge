import { useEffect, useRef } from 'react';
import { useCampaigns } from './useCampaigns';
import { saveCampaignToDB } from './useModernCampaignEditor/saveHandler';
import { toast } from 'sonner';

interface AutoSaveOptions {
  enabled?: boolean;
  interval?: number; // in milliseconds
  onSave?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for automatic saving to Supabase
 * Saves campaign data at regular intervals to ensure data persistence
 */
export const useAutoSaveToSupabase = (
  campaignData: {
    campaign: any;
    canvasElements?: any[];
    modularPage?: any;
    screenBackgrounds?: any;
    canvasZoom?: number;
  },
  options: AutoSaveOptions = {}
) => {
  const {
    enabled = true,
    interval = 30000, // 30 seconds by default
    onSave,
    onError
  } = options;

  const { saveCampaign } = useCampaigns();
  // Local cache disabled: we no longer persist to localStorage
  // const { saveToCampaignCache } = useEditorStore();
  
  const lastSavedRef = useRef<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  // Generate a hash of the campaign data to detect changes
  const getCampaignHash = (data: any): string => {
    try {
      return JSON.stringify({
        id: data.campaign?.id,
        name: data.campaign?.name,
        design: data.campaign?.design,
        config: data.campaign?.config,
        canvasElements: data.canvasElements?.length,
        modularPage: data.modularPage?.screens ? Object.keys(data.modularPage.screens).length : 0,
        screenBackgrounds: data.screenBackgrounds
      });
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (!enabled || !campaignData.campaign?.id) return;

    const campaignId = campaignData.campaign.id;
    const currentHash = getCampaignHash(campaignData);

    // Skip if no changes detected
    if (currentHash === lastSavedRef.current) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Schedule auto-save
    saveTimeoutRef.current = setTimeout(async () => {
      if (isSavingRef.current) {
        console.log('⏭️ [AutoSave] Save already in progress, skipping');
        return;
      }

      try {
        isSavingRef.current = true;
        console.log('💾 [AutoSave] Starting auto-save to Supabase for campaign:', campaignId);

        // Local cache disabled to avoid quota issues

        // Prepare campaign data with all editor states
        const campaignToSave = {
          ...campaignData.campaign,
          config: {
            ...(campaignData.campaign.config || {}),
            canvasConfig: {
              ...(campaignData.campaign.config?.canvasConfig || {}),
              elements: campaignData.canvasElements || [],
              screenBackgrounds: campaignData.screenBackgrounds || {},
              zoom: campaignData.canvasZoom || 0.7
            },
            elements: campaignData.canvasElements || []
          },
          design: {
            ...(campaignData.campaign.design || {}),
            quizModules: campaignData.modularPage || null,
            // Preserve background images from screenBackgrounds
            backgroundImage: campaignData.screenBackgrounds?.screen1?.value || campaignData.campaign.design?.backgroundImage,
            mobileBackgroundImage: campaignData.campaign.design?.mobileBackgroundImage
          }
        };

        // Save to Supabase
        await saveCampaignToDB(campaignToSave, saveCampaign);

        lastSavedRef.current = currentHash;
        console.log('✅ [AutoSave] Campaign saved successfully to Supabase');
        
        if (onSave) {
          onSave();
        }
      } catch (error) {
        console.error('❌ [AutoSave] Failed to save campaign:', error);
        
        if (onError) {
          onError(error as Error);
        } else {
          toast.error('Échec de la sauvegarde automatique');
        }
      } finally {
        isSavingRef.current = false;
      }
    }, interval);

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    enabled,
    interval,
    campaignData,
    saveCampaign,
    onSave,
    onError
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);
};
