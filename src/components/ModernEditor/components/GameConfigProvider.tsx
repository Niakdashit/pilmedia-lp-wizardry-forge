import { useMemo } from 'react';

interface GameConfigProviderProps {
  campaign: any;
  children: (config: {
    mode: "instant_winner";
    winProbability: number;
    maxWinners: number;
    winnersCount: number;
  }) => React.ReactNode;
}

const GameConfigProvider: React.FC<GameConfigProviderProps> = ({
  campaign,
  children
}) => {
  // Configuration unifiée du jeu
  const gameConfig = useMemo(() => {
    if (!campaign) {
      return {
        mode: "instant_winner" as const,
        winProbability: 0.1,
        maxWinners: 10,
        winnersCount: 0
      };
    }
    
    const config = {
      mode: "instant_winner" as const,
      winProbability: campaign.gameConfig?.winProbability || 0.1,
      maxWinners: campaign.gameConfig?.maxWinners || 10,
      winnersCount: campaign.gameConfig?.winnersCount || 0
    };
    
    return config;
  }, [campaign?.gameConfig]);

  return <>{children(gameConfig)}</>;
};

export default GameConfigProvider;