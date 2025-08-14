
import React, { useState } from 'react';
import ColorPaletteSelector from './ColorPaletteSelector';
import ScratchSurfaceConfig from './ScratchConfig/ScratchSurfaceConfig';
import ScratchRevealConfig from './ScratchConfig/ScratchRevealConfig';
import ScratchCardsManager from './ScratchConfig/ScratchCardsManager';
import ScratchHelpSection from './ScratchConfig/ScratchHelpSection';

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
    setCampaign((prev: any) => ({
      ...prev,
      gameConfig: {
        ...prev.gameConfig,
        scratch: {
          ...prev.gameConfig?.scratch,
          [field]: value
        }
      }
    }));
  };

  const addCard = () => {
    const cards = campaign.gameConfig?.scratch?.cards || [];
    if (cards.length >= MAX_CARDS) return;
    
    const newCard = { 
      id: Date.now(), 
      revealImage: '', 
      revealMessage: 'Félicitations !',
      scratchColor: campaign.gameConfig?.scratch?.scratchColor || '#C0C0C0'
    };
    handleScratchChange('cards', [...cards, newCard]);
  };

  const removeCard = (index: number) => {
    const cards = [...(campaign.gameConfig?.scratch?.cards || [])];
    if (cards.length <= 1) return;
    cards.splice(index, 1);
    handleScratchChange('cards', cards);
  };

  const updateCard = (index: number, field: string, value: string) => {
    const cards = [...(campaign.gameConfig?.scratch?.cards || [])];
    cards[index] = { ...cards[index], [field]: value };
    handleScratchChange('cards', cards);
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

  // S'assurer qu'il y a au moins une carte par défaut
  const cards = campaign.gameConfig?.scratch?.cards && campaign.gameConfig.scratch.cards.length > 0
    ? campaign.gameConfig.scratch.cards
    : [{ id: 1, revealImage: '', revealMessage: 'Félicitations !', scratchColor: '#C0C0C0' }];

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
