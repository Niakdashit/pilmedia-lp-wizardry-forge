import { shouldForceDesktopEditorUI } from './deviceOverrides';

export const isRealMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (shouldForceDesktopEditorUI()) return false;
  try {
    const hasTouch = 'ontouchstart' in window || (navigator as any).maxTouchPoints > 0;
    const coarsePointer = window.matchMedia ? window.matchMedia('(pointer: coarse)').matches : false;
    const smallViewport = window.innerWidth < 768;
    // Real mobile when touch + coarse pointer OR small viewport with touch
    return (hasTouch && coarsePointer) || (hasTouch && smallViewport);
  } catch {
    return false;
  }
};
