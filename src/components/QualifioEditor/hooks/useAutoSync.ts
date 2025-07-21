
import { useEffect, useRef } from 'react';
import { applyResponsiveConsistency } from '../utils/responsiveUtils';
import type { CustomText, DeviceType } from '../QualifioEditorLayout';

interface UseAutoSyncOptions {
  isEnabled: boolean;
  customTexts: CustomText[];
  onUpdate: (texts: CustomText[]) => void;
  baseDevice?: DeviceType;
  debounceMs?: number;
}

export const useAutoSync = ({
  isEnabled,
  customTexts,
  onUpdate,
  baseDevice = 'desktop',
  debounceMs = 300
}: UseAutoSyncOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSyncRef = useRef<string>('');

  const performSync = () => {
    if (!isEnabled || !customTexts.length) return;

    // Create a signature of current text positions to avoid unnecessary syncs
    const currentSignature = customTexts
      .map(t => `${t.id}-${t.x}-${t.y}-${t.fontSize}`)
      .join('|');

    if (currentSignature === lastSyncRef.current) return;

    console.log(`🔄 Auto-sync triggered from ${baseDevice}`);
    
    const synchronizedTexts = applyResponsiveConsistency(customTexts, baseDevice);
    onUpdate(synchronizedTexts);
    
    lastSyncRef.current = currentSignature;
  };

  const triggerSync = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(performSync, debounceMs);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { triggerSync, performSync };
};
