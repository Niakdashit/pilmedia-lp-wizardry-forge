import React from 'react';
import { useEditorStore } from '../../../stores/editorStore';
import SwiperConfigPanel from './SwiperConfigPanel';
import { CardItem } from '../../../types/game';

/**
 * GamePanel - Panel pour configurer le jeu Swiper
 */
const GamePanel: React.FC = () => {
  const { campaign, setCampaign } = useEditorStore();

  // Get cards from campaign or use default
  const cards: CardItem[] = (campaign?.gameConfig as any)?.swiper?.cards || [
    { id: "1", title: "Fantastic Charm", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1600&auto=format&fit=crop" },
    { id: "2", title: "Radiant Routine", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1600&auto=format&fit=crop" },
    { id: "3", title: "Calm & Clear", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1600&auto=format&fit=crop" },
    { id: "4", title: "Daily Glow", image: "https://images.unsplash.com/photo-1598515213691-84b2c46a1a1c?q=80&w=1600&auto=format&fit=crop" },
  ];

  console.log('🎮 [GamePanel] Rendered with cards:', cards);

  const handleCardsChange = (newCards: CardItem[]) => {
    console.log('💾 [GamePanel] Saving cards:', newCards);
    const updatedCampaign = {
      ...campaign,
      gameConfig: {
        ...campaign?.gameConfig,
        swiper: {
          ...(campaign?.gameConfig as any)?.swiper,
          cards: newCards
        }
      } as any
    };
    console.log('💾 [GamePanel] Updated campaign:', updatedCampaign);
    setCampaign(updatedCampaign);
  };

  return (
    <SwiperConfigPanel
      onBack={() => {}} // No back button needed as this is the main panel
      cards={cards}
      onCardsChange={handleCardsChange}
      selectedDevice={'desktop'}
    />
  );
};

export default GamePanel;
