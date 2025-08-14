
import { useCallback, useRef } from 'react';
import { applyResponsiveConsistency } from '../utils/responsiveUtils';
import type { CustomText } from '../GameEditorLayout';

interface UseAutoSyncProps {
  onConfigUpdate: (updates: any) => void;
  isEnabled: boolean;
  baseDevice?: 'desktop' | 'tablet' | 'mobile';
}

export const useAutoSync = ({ onConfigUpdate, isEnabled, baseDevice = 'desktop' }: UseAutoSyncProps) => {
  const debounceRef = useRef<NodeJS.Timeout>();
  const isProcessingRef = useRef(false);

  const triggerAutoSync = useCallback((customTexts: CustomText[]) => {
    // Éviter les boucles infinies
    if (!isEnabled || !customTexts || customTexts.length === 0 || isProcessingRef.current) {
      return;
    }

    // Debounce pour éviter trop d'appels en temps réel
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      try {
        isProcessingRef.current = true;
        console.log(`🔄 Auto-sync depuis ${baseDevice}`);
        
        const synchronizedTexts = applyResponsiveConsistency(customTexts, baseDevice);
        
        // Vérifier si les textes ont réellement changé avant de déclencher la mise à jour
        const hasChanges = JSON.stringify(synchronizedTexts) !== JSON.stringify(customTexts);
        
        if (hasChanges) {
          onConfigUpdate({ customTexts: synchronizedTexts });
        }
      } catch (error) {
        console.error('Erreur lors de l\'auto-sync:', error);
      } finally {
        isProcessingRef.current = false;
      }
    }, 300); // 300ms de debounce
  }, [isEnabled, baseDevice, onConfigUpdate]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    isProcessingRef.current = false;
  }, []);

  return { triggerAutoSync, cleanup };
};
