import { useCallback, useRef } from 'react';
import { applyResponsiveConsistency } from '../utils/responsiveUtils';
import type { CustomText } from '../QualifioEditorLayout';

interface UseAutoSyncProps {
  onConfigUpdate: (updates: any) => void;
  isEnabled: boolean;
  baseDevice?: 'desktop' | 'tablet' | 'mobile';
}

export const useAutoSync = ({ onConfigUpdate, isEnabled, baseDevice = 'desktop' }: UseAutoSyncProps) => {
  const debounceRef = useRef<NodeJS.Timeout>();

  const triggerAutoSync = useCallback((customTexts: CustomText[]) => {
    if (!isEnabled || !customTexts || customTexts.length === 0) return;

    // Debounce pour éviter trop d'appels en temps réel
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      console.log(`🔄 Auto-sync depuis ${baseDevice}`);
      const synchronizedTexts = applyResponsiveConsistency(customTexts, baseDevice);
      onConfigUpdate({ customTexts: synchronizedTexts });
    }, 300); // 300ms de debounce
  }, [isEnabled, baseDevice, onConfigUpdate]);

  return { triggerAutoSync };
};