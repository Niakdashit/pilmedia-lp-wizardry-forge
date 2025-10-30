import { useState, useCallback, useMemo, useRef } from 'react';
import { debounce } from 'lodash-es';

interface CampaignStateOptions {
  autosaveDelay?: number;
  onSave?: (campaign: any) => Promise<void>;
  onError?: (error: Error) => void;
}

export const useOptimizedCampaignState = (
  initialCampaign: any,
  options: CampaignStateOptions = {}
) => {
  const { autosaveDelay = 3000, onSave, onError } = options;
  const [campaign, setCampaignState] = useState(initialCampaign);
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const lastSavedRef = useRef<string>('');
  const updateCounterRef = useRef(0);

  // Debounced auto-save
  const debouncedSave = useCallback(
    debounce(async (campaignToSave: any) => {
      if (!onSave) return;
      
      const currentHash = JSON.stringify(campaignToSave);
      if (currentHash === lastSavedRef.current) return;
      
      setIsSaving(true);
      try {
        await onSave(campaignToSave);
        lastSavedRef.current = currentHash;
        setIsModified(false);
      } catch (error) {
        onError?.(error as Error);
      } finally {
        setIsSaving(false);
      }
    }, autosaveDelay),
    [onSave, onError, autosaveDelay]
  );

  // Optimized campaign setter with change tracking
  const setCampaign = useCallback((updater: any) => {
    setCampaignState((prev: any) => {
      const newCampaign = typeof updater === 'function' ? updater(prev) : updater;
      const updateId = ++updateCounterRef.current;
      
      const optimizedCampaign = {
        ...newCampaign,
        _lastUpdate: Date.now(),
        _updateId: updateId,
        _version: (prev._version || 0) + 1
      };
      
      setIsModified(true);
      debouncedSave(optimizedCampaign);
      
      return optimizedCampaign;
    });
  }, [debouncedSave]);

  // Memoized preview key for optimal re-rendering
  const previewKey = useMemo(() => {
    return `preview-${campaign._updateId || 0}-${campaign._version || 0}`;
  }, [campaign._updateId, campaign._version]);

  // Force save without debounce
  const forceSave = useCallback(async () => {
    if (!onSave || isSaving) return;
    
    setIsSaving(true);
    try {
      await onSave(campaign);
      lastSavedRef.current = JSON.stringify(campaign);
      setIsModified(false);
    } catch (error) {
      onError?.(error as Error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [campaign, onSave, onError, isSaving]);

  return {
    campaign,
    setCampaign,
    isModified,
    isSaving,
    previewKey,
    forceSave
  };
};