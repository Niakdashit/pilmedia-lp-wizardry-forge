
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
  const lastSyncRef = useRef<string>('');

  const triggerAutoSync = useCallback((customTexts: CustomText[]) => {
    if (!isEnabled || !customTexts || customTexts.length === 0) return;

    // Create a hash of current texts to avoid unnecessary syncs
    const textsHash = JSON.stringify(customTexts.map(t => ({ id: t.id, x: t.x, y: t.y, fontSize: t.fontSize })));
    if (textsHash === lastSyncRef.current) return;

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      try {
        console.log(`🔄 Auto-sync depuis ${baseDevice}`);
        const synchronizedTexts = applyResponsiveConsistency(customTexts, baseDevice);
        
        // Only update if there are actual changes
        if (JSON.stringify(synchronizedTexts) !== JSON.stringify(customTexts)) {
          onConfigUpdate({ customTexts: synchronizedTexts });
          lastSyncRef.current = textsHash;
        }
      } catch (error) {
        console.error('Error during auto-sync:', error);
      }
    }, 500); // Increased debounce to reduce frequency
  }, [isEnabled, baseDevice, onConfigUpdate]);

  return { triggerAutoSync };
};
