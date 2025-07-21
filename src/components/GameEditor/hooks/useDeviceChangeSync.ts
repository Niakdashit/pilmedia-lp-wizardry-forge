
import { useEffect, useRef } from 'react';
import { applyResponsiveConsistency } from '../utils/responsiveUtils';
import type { CustomText, DeviceType } from '../QualifioEditorLayout';

interface UseDeviceChangeSyncProps {
  selectedDevice: DeviceType;
  customTexts?: CustomText[];
  onConfigUpdate: (updates: any) => void;
  isEnabled: boolean;
  baseDevice?: 'desktop' | 'tablet' | 'mobile';
}

export const useDeviceChangeSync = ({ 
  selectedDevice, 
  customTexts, 
  onConfigUpdate, 
  isEnabled,
  baseDevice = 'desktop'
}: UseDeviceChangeSyncProps) => {
  const previousDevice = useRef<DeviceType>(selectedDevice);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    // Si l'auto-sync est désactivé ou en cours de traitement, ne rien faire
    if (!isEnabled || isProcessingRef.current) {
      previousDevice.current = selectedDevice;
      return;
    }

    // Si le device a changé et qu'on a des textes
    if (previousDevice.current !== selectedDevice && customTexts && customTexts.length > 0) {
      try {
        isProcessingRef.current = true;
        console.log(`📱 Changement d'appareil détecté: ${previousDevice.current} → ${selectedDevice}`);
        console.log(`🔄 Auto-sync depuis ${baseDevice} vers ${selectedDevice}`);
        
        const synchronizedTexts = applyResponsiveConsistency(customTexts, baseDevice);
        
        // Vérifier si les textes ont réellement changé
        const hasChanges = JSON.stringify(synchronizedTexts) !== JSON.stringify(customTexts);
        
        if (hasChanges) {
          onConfigUpdate({ customTexts: synchronizedTexts });
        }
      } catch (error) {
        console.error('Erreur lors de la synchronisation device change:', error);
      } finally {
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 100);
      }
    }

    previousDevice.current = selectedDevice;
  }, [selectedDevice, customTexts, onConfigUpdate, isEnabled, baseDevice]);

  // Cleanup function
  useEffect(() => {
    return () => {
      isProcessingRef.current = false;
    };
  }, []);
};
