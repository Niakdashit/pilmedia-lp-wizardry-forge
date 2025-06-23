
import React from 'react';
import GameRenderer from './GameRenderer';
import { GameSize } from '../configurators/GameSizeSelector';
import { getCampaignBackgroundImage } from '../../utils/background';

interface GameCanvasPreviewProps {
  campaign: any;
  gameSize: GameSize;
  gameBackgroundImage?: string;
  className?: string;
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
}

const GameCanvasPreview: React.FC<GameCanvasPreviewProps> = ({
  campaign,
  gameSize,
  gameBackgroundImage,
  className = '',
  previewDevice = 'desktop'
}) => {
  // Résoudre l'image de fond à afficher (priorité à la prop, fallback sur config)
  const resolvedBackground =
    gameBackgroundImage || getCampaignBackgroundImage(campaign, previewDevice);

  return (
    <div className={`bg-white rounded-lg border-2 border-gray-200 overflow-hidden ${className}`}>
      <GameRenderer
        campaign={campaign}
        gameSize={gameSize}
        previewDevice={previewDevice}
        buttonLabel={campaign.buttonConfig?.text || campaign.gameConfig?.[campaign.type]?.buttonLabel}
        buttonColor={campaign.buttonConfig?.color || campaign.gameConfig?.[campaign.type]?.buttonColor || '#841b60'}
        gameBackgroundImage={resolvedBackground}
        className="w-full h-full"
      />
    </div>
  );
};

export default GameCanvasPreview;
