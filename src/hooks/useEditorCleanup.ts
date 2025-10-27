import { useCallback } from 'react';
import { useEditorStore } from '../stores/editorStore';
import { clearTempCampaignData } from '../utils/tempCampaignId';

/**
 * Phase 3: Hook pour nettoyer proprement tous les états de l'éditeur
 * Reset états locaux + store + stores spécifiques (scratch, quiz, etc.)
 */
interface EditorCleanupOptions {
  editorType: 'design' | 'quiz' | 'form' | 'scratch' | 'jackpot';
  resetLocalStates?: () => void;
  resetSpecificStore?: () => void; // Pour les stores spécifiques (scratch, etc.)
}

export const useEditorCleanup = ({ 
  editorType, 
  resetLocalStates,
  resetSpecificStore 
}: EditorCleanupOptions) => {
  const { resetCampaign } = useEditorStore();

  /**
   * Reset complet de l'éditeur
   */
  const resetEditor = useCallback(() => {
    console.log(`🧹 [${editorType}Editor] Full cleanup initiated`);

    try {
      // 1. Reset états locaux de l'éditeur
      resetLocalStates?.();

      // 2. Reset stores spécifiques (scratch, quiz, etc.)
      resetSpecificStore?.();

      // 3. Reset store global
      resetCampaign();

      console.log(`✅ [${editorType}Editor] Cleanup completed`);
    } catch (error) {
      console.error(`❌ [${editorType}Editor] Cleanup failed:`, error);
    }
  }, [editorType, resetLocalStates, resetSpecificStore, resetCampaign]);

  /**
   * Nettoyage spécifique pour les campagnes temporaires
   */
  const cleanupTempCampaign = useCallback((campaignId: string) => {
    console.log(`🧹 [${editorType}Editor] Cleaning temp campaign:`, campaignId);
    
    try {
      // Clear localStorage namespaced data
      clearTempCampaignData(campaignId);

      // Reset editor states
      resetEditor();

      console.log(`✅ [${editorType}Editor] Temp campaign cleaned`);
    } catch (error) {
      console.error(`❌ [${editorType}Editor] Temp cleanup failed:`, error);
    }
  }, [editorType, resetEditor]);

  /**
   * Nettoyage avant changement de campagne
   */
  const cleanupBeforeSwitch = useCallback(() => {
    console.log(`🔄 [${editorType}Editor] Cleaning up before campaign switch`);
    resetEditor();
  }, [editorType, resetEditor]);

  return {
    resetEditor,
    cleanupTempCampaign,
    cleanupBeforeSwitch
  };
};
