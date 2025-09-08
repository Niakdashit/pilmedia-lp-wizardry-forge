
import React, { useState, useEffect, useCallback } from 'react';
import ColorPaletteSelector from './ColorPaletteSelector';
import ScratchSurfaceConfig from './ScratchConfig/ScratchSurfaceConfig';
import ScratchRevealConfig from './ScratchConfig/ScratchRevealConfig';
import ScratchCardsManager from './ScratchConfig/ScratchCardsManager';
import ScratchHelpSection from './ScratchConfig/ScratchHelpSection';
import type { ScratchCard } from '../../../types/ScratchCard';

interface ScratchGameConfigProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
}

const ScratchGameConfig: React.FC<ScratchGameConfigProps> = ({
  campaign,
  setCampaign
}) => {
  const [selectedPalette, setSelectedPalette] = useState<any>(campaign.gameConfig?.scratch?.palette);
  const MAX_CARDS = 6;

  const handleScratchChange = (field: string, value: any) => {
    console.log('[ScratchGameConfig] Updating field:', field, 'with value:', value);
    setCampaign((prev: any) => {
      const updated = {
        ...prev,
        gameConfig: {
          ...prev.gameConfig,
          scratch: {
            ...prev.gameConfig?.scratch,
            [field]: value
          }
        }
      };
      console.log('[ScratchGameConfig] Updated campaign:', updated);
      return updated;
    });
  };

  // Ensure cards are properly typed as ScratchCard[]
  const cards: ScratchCard[] = campaign.gameConfig?.scratch?.cards && campaign.gameConfig.scratch.cards.length > 0
    ? campaign.gameConfig.scratch.cards.map((card: any, index: number) => ({
        id: card.id || `card-${index + 1}`,
        color: card.color || '#E3C0B7',
        cover: card.cover,
        revealMessage: card.revealMessage || 'Félicitations !',
        revealImage: card.revealImage || '',
        scratchColor: card.scratchColor || '#C0C0C0'
      }))
    : [{ 
        id: 'card-1', 
        revealImage: '', 
        revealMessage: 'Félicitations !', 
        scratchColor: '#C0C0C0',
        color: '#E3C0B7' // Default card color
      }];

  // Update card function that works with ScratchCard type
  const updateCardById = (cardId: string, updates: Partial<ScratchCard>) => {
    const updatedCards = cards.map(card => 
      card.id === cardId ? { ...card, ...updates } : card
    );
    handleScratchChange('cards', updatedCards);
  };

  // Debug logging for color changes
  useEffect(() => {
    console.log('[ScratchGameConfig] Cards state:', cards);
    console.log('[ScratchGameConfig] Full campaign state:', campaign);
  }, [cards, campaign]);

  // Simplified direct color application
  const handleColorChangeDirect = useCallback((cardId: string, color: string) => {
    console.log('[ScratchGameConfig] Direct color change:', { cardId, color });
    console.log('[ScratchGameConfig] Campaign before update:', campaign);
    updateCardById(cardId, { color });

    // Force re-render après mise à jour de la couleur
    setTimeout(() => {
      console.log('[ScratchGameConfig] Campaign after color update:', campaign);
    }, 100);
  }, [updateCardById, campaign]);

  const handleCoverSelectedDirect = useCallback(async (cardId: string, file: File) => {
    try {
      // Update store with cover info
      updateCardById(cardId, {
        cover: {
          kind: 'blob',
          mime: file.type,
          value: URL.createObjectURL(file) // Temporary URL for display
        }
      });
    } catch (error) {
      console.error('Error handling cover selection:', error);
    }
  }, [updateCardById]);

  const handleCoverRemovedDirect = useCallback((cardId: string) => {
    console.log('[ScratchGameConfig] Cover removed for card:', cardId);
    updateCardById(cardId, {
      cover: undefined,
      thumbDataUrl: undefined
    });
  }, [updateCardById]);

  // Au montage / changement de mode : re-synchroniser (selon le patch)
  useEffect(() => {
    console.log('[ScratchGameConfig] Sync state to canvas:', cards);
    // Dans notre cas, la synchronisation se fait via les props React directes
    // plutôt que via postMessage à un iframe
  }, [cards]);

  const addCard = () => {
    if (cards.length >= MAX_CARDS) return;
    
    const newCard: ScratchCard = { 
      id: `card-${Date.now()}`, 
      revealImage: '', 
      revealMessage: 'Félicitations !',
      scratchColor: campaign.gameConfig?.scratch?.scratchColor || '#C0C0C0',
      color: '#E3C0B7' // Default card color
    };
    handleScratchChange('cards', [...cards, newCard]);
  };

  const removeCard = (index: number) => {
    const updatedCards = [...cards];
    if (updatedCards.length <= 1) return;
    updatedCards.splice(index, 1);
    handleScratchChange('cards', updatedCards);
  };

  const updateCard = (index: number, field: string, value: string) => {
    const updatedCards = [...cards];
    updatedCards[index] = { ...updatedCards[index], [field]: value };
    handleScratchChange('cards', updatedCards);
  };

  const handlePaletteSelect = (palette: any) => {
    setSelectedPalette(palette);
    
    setCampaign((prev: any) => ({
      ...prev,
      gameConfig: {
        ...prev.gameConfig,
        scratch: {
          ...prev.gameConfig?.scratch,
          scratchColor: palette.colors.background || palette.colors.primary,
          palette: palette
        }
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Palette de couleurs */}
      <ColorPaletteSelector
        selectedPalette={selectedPalette}
        onPaletteSelect={handlePaletteSelect}
        gameType="scratch"
      />

      {/* Configuration de la surface */}
      <ScratchSurfaceConfig
        scratchColor={campaign.gameConfig?.scratch?.scratchColor || '#C0C0C0'}
        scratchSurface={campaign.gameConfig?.scratch?.scratchSurface}
        onScratchColorChange={(color) => handleScratchChange('scratchColor', color)}
        onScratchSurfaceChange={(surface) => handleScratchChange('scratchSurface', surface)}
      />

      {/* Configuration de révélation */}
      <ScratchRevealConfig
        scratchArea={campaign.gameConfig?.scratch?.scratchArea || 70}
        revealMessage={campaign.gameConfig?.scratch?.revealMessage || 'Félicitations !'}
        revealImage={campaign.gameConfig?.scratch?.revealImage}
        onScratchAreaChange={(area) => handleScratchChange('scratchArea', area)}
        onRevealMessageChange={(message) => handleScratchChange('revealMessage', message)}
        onRevealImageChange={(image) => handleScratchChange('revealImage', image)}
      />

      {/* Gestion des cartes */}
      <ScratchCardsManager
        cards={cards}
        onAddCard={addCard}
        onRemoveCard={removeCard}
        onUpdateCard={updateCard}
        onColorChange={handleColorChangeDirect}
        onCoverSelected={handleCoverSelectedDirect}
        onCoverRemoved={handleCoverRemovedDirect}
        maxCards={MAX_CARDS}
      />

      {/* Section d'aide */}
      <ScratchHelpSection
        maxCards={MAX_CARDS}
        scratchArea={campaign.gameConfig?.scratch?.scratchArea || 70}
      />
    </div>
  );
};

export default ScratchGameConfig;
