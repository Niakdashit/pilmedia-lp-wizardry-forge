import { useCallback, useRef, useEffect } from 'react';
import { ScratchCardMessaging } from '../utils/scratchCardMessaging';
import type { ScratchCard } from '../types/ScratchCard';

interface UseScratchCardColorSystemProps {
  cards: ScratchCard[];
  updateCard: (cardId: string, updates: Partial<ScratchCard>) => void;
  previewIframeRef?: React.RefObject<HTMLIFrameElement>;
  previewOrigin?: string;
}

export const useScratchCardColorSystem = ({
  cards,
  updateCard,
  previewIframeRef,
  previewOrigin = '*'
}: UseScratchCardColorSystemProps) => {
  const messagingRef = useRef<ScratchCardMessaging | null>(null);

  // Initialize messaging system
  useEffect(() => {
    if (previewIframeRef?.current) {
      messagingRef.current = new ScratchCardMessaging(
        previewIframeRef.current,
        previewOrigin
      );
    }
  }, [previewIframeRef, previewOrigin]);

  // Sync state when cards change or iframe loads
  useEffect(() => {
    if (messagingRef.current && cards.length > 0) {
      messagingRef.current.syncStateToCanvas(cards);
    }
  }, [cards]);

  const handleColorChange = useCallback((cardId: string, color: string) => {
    // 1) Update store (immutability)
    updateCard(cardId, { color });

    // 2) Notify canvas
    messagingRef.current?.onColorChange(cardId, color);
  }, [updateCard]);

  const handleCoverSelected = useCallback(async (cardId: string, file: File) => {
    try {
      // Create thumbnail for panel
      const thumbDataUrl = await messagingRef.current?.toDataURL(file, 256);
      
      // Update store with cover info
      updateCard(cardId, {
        cover: {
          kind: 'blob',
          mime: file.type,
          value: URL.createObjectURL(file) // Temporary URL for display
        },
        thumbDataUrl
      });

      // Send to canvas
      await messagingRef.current?.onCoverSelected(cardId, file);
    } catch (error) {
      console.error('Error handling cover selection:', error);
    }
  }, [updateCard]);

  const handleCoverRemoved = useCallback((cardId: string) => {
    // Update store
    updateCard(cardId, {
      cover: undefined,
      thumbDataUrl: undefined
    });

    // Notify canvas to remove cover and show color
    const card = cards.find(c => c.id === cardId);
    if (card?.color) {
      messagingRef.current?.onColorChange(cardId, card.color);
    }
  }, [updateCard, cards]);

  return {
    handleColorChange,
    handleCoverSelected,
    handleCoverRemoved
  };
};
