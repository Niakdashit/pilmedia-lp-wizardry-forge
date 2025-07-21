
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
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousDevice.current = selectedDevice;
      return;
    }

    // Si l'auto-sync est désactivé, ne rien faire
    if (!isEnabled) {
      previousDevice.current = selectedDevice;
      return;
    }

    // Si le device a changé et qu'on a des textes
    if (previousDevice.current !== selectedDevice && customTexts && customTexts.length > 0) {
      console.log(`📱 Changement d'appareil détecté: ${previousDevice.current} → ${selectedDevice}`);
      
      try {
        // Add a small delay to avoid conflicts with other updates
        const timeoutId = setTimeout(() => {
          console.log(`🔄 Auto-sync depuis ${baseDevice} vers ${selectedDevice}`);
          const synchronizedTexts = applyResponsiveConsistency(customTexts, baseDevice);
          onConfigUpdate({ customTexts: synchronizedTexts });
        }, 100);

        // Cleanup function
        return () => clearTimeout(timeoutId);
      } catch (error) {
        console.error('Error during device change sync:', error);
      }
    }

    previousDevice.current = selectedDevice;
  }, [selectedDevice, customTexts, onConfigUpdate, isEnabled, baseDevice]);
};
