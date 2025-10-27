import { useCallback } from 'react';
import { useEditorStore } from '@/stores/editorStore';

interface LocalStateSetters {
  setCanvasElements: (elements: any[]) => void;
  setModularPage: (page: any) => void;
  setScreenBackgrounds: (backgrounds: any) => void;
  setExtractedColors: (colors: string[]) => void;
  setSelectedDevice?: (device: 'desktop' | 'tablet' | 'mobile') => void;
  setCanvasZoom?: (zoom: number) => void;
}

export const useEditorCleanup = (
  editorType: 'wheel' | 'quiz' | 'form' | 'scratch' | 'jackpot',
  localStateSetters: LocalStateSetters
) => {
  const { resetCampaign } = useEditorStore();

  const cleanupAll = useCallback(() => {
    console.log(`🧹 [${editorType}Editor] Full cleanup - resetting all states`);
    
    // 1. Reset local states
    localStateSetters.setCanvasElements([]);
    localStateSetters.setModularPage({ screens: { screen1: [], screen2: [], screen3: [] } });
    localStateSetters.setScreenBackgrounds({
      screen1: { type: 'color', value: '' },
      screen2: { type: 'color', value: '' },
      screen3: { type: 'color', value: '' }
    });
    localStateSetters.setExtractedColors([]);
    localStateSetters.setSelectedDevice?.('desktop');
    localStateSetters.setCanvasZoom?.(0.7);
    
    // 2. Reset global store
    resetCampaign();
    
    console.log(`✅ [${editorType}Editor] Cleanup complete`);
  }, [editorType, localStateSetters, resetCampaign]);

  return { cleanupAll };
};
