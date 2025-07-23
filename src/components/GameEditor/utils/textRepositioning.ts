import { CustomText } from '../GameEditorLayout';

export const repositionTextsForDisplayMode = (
  texts: CustomText[],
  newDisplayMode: string,
  oldDisplayMode?: string
): CustomText[] => {
  if (!texts || texts.length === 0) return texts;
  
  console.log('🔄 Repositioning texts for display mode change:', { oldDisplayMode, newDisplayMode });
  
  return texts.map(text => {
    let adjustedY = text.y;
    
    // Adjust positioning based on display mode
    if (newDisplayMode === 'mode2-background' && oldDisplayMode === 'mode1-banner-game') {
      // Moving from banner to background mode - adjust Y positions
      if (text.y < 200) {
        adjustedY = text.y + 100; // Move down if in banner area
      }
    } else if (newDisplayMode === 'mode1-banner-game' && oldDisplayMode === 'mode2-background') {
      // Moving from background to banner mode - adjust Y positions
      if (text.y > 100) {
        adjustedY = Math.max(50, text.y - 100); // Move up but keep minimum distance
      }
    }
    
    return {
      ...text,
      y: adjustedY
    };
  });
};