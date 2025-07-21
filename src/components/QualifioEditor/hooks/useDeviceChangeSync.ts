
import { useEffect, useRef } from 'react';
import type { DeviceType, CustomText } from '../QualifioEditorLayout';

interface UseDeviceChangeSyncOptions {
  currentDevice: DeviceType;
  isAutoSyncEnabled: boolean;
  customTexts: CustomText[];
  onAutoSync: (baseDevice: DeviceType) => void;
}

export const useDeviceChangeSync = ({
  currentDevice,
  isAutoSyncEnabled,
  customTexts,
  onAutoSync
}: UseDeviceChangeSyncOptions) => {
  const previousDeviceRef = useRef<DeviceType>(currentDevice);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Skip the initial render
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      previousDeviceRef.current = currentDevice;
      return;
    }

    // Only trigger if auto-sync is enabled and device actually changed
    if (
      isAutoSyncEnabled && 
      previousDeviceRef.current !== currentDevice &&
      customTexts.length > 0
    ) {
      console.log(`📱 Device changed: ${previousDeviceRef.current} → ${currentDevice}`);
      
      // Always sync from desktop as the base when switching devices
      onAutoSync('desktop');
    }

    previousDeviceRef.current = currentDevice;
  }, [currentDevice, isAutoSyncEnabled, customTexts.length, onAutoSync]);
};
