
import React from "react";
import confetti from "canvas-confetti";
import SlotMachine from "../../SlotJackpot/SlotMachine";
import { JackpotProps } from "./types";
import { useEditorStore } from "../../../stores/editorStore";

const Jackpot: React.FC<JackpotProps> = ({
  isPreview,
  onFinish,
  disabled = false,
  symbols: propSymbols,
  campaign: propCampaign,
}) => {
  const storeCampaign = useEditorStore((s: any) => s.campaign);
  const campaign = propCampaign || storeCampaign;

  const handleWin = (results: string[]) => {
    console.log('🎆 [Jackpot] handleWin called, launching confetti');
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.7 }
    });
    console.log('📤 [Jackpot] Calling onFinish with win');
    onFinish?.('win');
  };

  const handleLose = () => {
    console.log('📤 [Jackpot] Calling onFinish with lose');
    onFinish?.('lose');
  };

  if (!isPreview) {
    return <div><p>Pas de configuration pour le moment.</p></div>;
  }

  // 🎰 Priority: propSymbols > campaign symbols
  const symbols = propSymbols || campaign?.gameConfig?.jackpot?.symbols || campaign?.jackpotConfig?.symbols;
  
  console.log('🎰 [Jackpot] Using symbols:', {
    hasPropSymbols: !!propSymbols,
    propSymbols,
    hasCampaignSymbols: !!(campaign?.gameConfig?.jackpot?.symbols || campaign?.jackpotConfig?.symbols),
    finalSymbols: symbols
  });

  return (
    <div className="flex flex-col items-center justify-center">
      <SlotMachine
        disabled={disabled}
        onWin={handleWin}
        onLose={handleLose}
        symbols={symbols}
        campaign={campaign}
        templateOverride={campaign?.gameConfig?.jackpot?.template || campaign?.jackpotConfig?.template}
      />
    </div>
  );
};

export default Jackpot;
