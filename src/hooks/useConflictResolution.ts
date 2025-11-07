import { useState, useCallback } from 'react';
import { useCampaignVersion, VersionConflict } from './useCampaignVersion';

export const useConflictResolution = (campaignId: string) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingConflict, setPendingConflict] = useState<VersionConflict | null>(null);
  
  const {
    conflict,
    reloadFromServer,
    clearConflict,
  } = useCampaignVersion();

  // Show modal when conflict is detected
  const handleConflict = useCallback((conflictData: VersionConflict) => {
    setPendingConflict(conflictData);
    setIsModalOpen(true);
  }, []);

  // Reload from server
  const handleReload = useCallback(async () => {
    const result = await reloadFromServer(campaignId);
    if (result.success) {
      setIsModalOpen(false);
      setPendingConflict(null);
      clearConflict();
      // Reload the page or update state
      window.location.reload();
    }
  }, [campaignId, reloadFromServer, clearConflict]);

  // Overwrite with local changes
  const handleOverwrite = useCallback(async () => {
    // This requires the campaign data
    // Should be passed from parent component
    setIsModalOpen(false);
    setPendingConflict(null);
    // Parent component should handle the actual overwrite
  }, []);

  // Cancel
  const handleCancel = useCallback(() => {
    setIsModalOpen(false);
    setPendingConflict(null);
    clearConflict();
  }, [clearConflict]);

  return {
    isModalOpen,
    conflict: pendingConflict || conflict,
    handleConflict,
    handleReload,
    handleOverwrite,
    handleCancel,
  };
};
