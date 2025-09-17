export type EditorDeviceOverride = 'desktop';

const STORAGE_KEY = 'allowMobileEditorUI';

/**
 * Centralises the logic controlling whether the editors should behave as if they were
 * running on a desktop device. By default we now force the desktop experience for all
 * devices so that phones/tablets simply use the responsive desktop UI instead of the
 * legacy mobile-only layouts. Setting localStorage["allowMobileEditorUI"] to "true"
 * opt-in to the previous behaviour for debugging purposes.
 */
export const getEditorDeviceOverride = (): EditorDeviceOverride | null => {
  if (typeof window === 'undefined') {
    return 'desktop';
  }

  try {
    const allowMobile = window.localStorage.getItem(STORAGE_KEY);
    if (allowMobile && allowMobile.toLowerCase() === 'true') {
      return null;
    }
  } catch {
    // Swallow storage access errors (private mode, disabled cookies, etc.) and
    // keep forcing the desktop UI.
  }

  return 'desktop';
};

export const shouldForceDesktopEditorUI = (): boolean => getEditorDeviceOverride() === 'desktop';
