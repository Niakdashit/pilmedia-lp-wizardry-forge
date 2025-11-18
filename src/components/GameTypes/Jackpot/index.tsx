
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

  // 🎰 Priority: propSymbols > jackpot.slotMachineSymbols > jackpot.symbols
  const symbols =
    propSymbols ||
    campaign?.gameConfig?.jackpot?.slotMachineSymbols ||
    campaign?.gameConfig?.jackpot?.symbols ||
    campaign?.jackpotConfig?.slotMachineSymbols ||
    campaign?.jackpotConfig?.symbols;
  
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

export default React.memo(Jackpot, (prev, next) => {
  // Stable if campaign id and template stay the same, and symbols content identical
  const prevId = prev.campaign?.id || (useEditorStore.getState?.()?.campaign?.id);
  const nextId = next.campaign?.id || (useEditorStore.getState?.()?.campaign?.id);
  const prevTpl = prev.campaign?.gameConfig?.jackpot?.template || prev.campaign?.jackpotConfig?.template;
  const nextTpl = next.campaign?.gameConfig?.jackpot?.template || next.campaign?.jackpotConfig?.template;
  const a = prev.symbols || prev.campaign?.gameConfig?.jackpot?.slotMachineSymbols || prev.campaign?.gameConfig?.jackpot?.symbols;
  const b = next.symbols || next.campaign?.gameConfig?.jackpot?.slotMachineSymbols || next.campaign?.gameConfig?.jackpot?.symbols;
  const symEqual = Array.isArray(a) && Array.isArray(b)
    ? a.length === b.length && a.every((v, i) => v === b[i])
    : a === b;
  return prev.isPreview === next.isPreview
    && prev.disabled === next.disabled
    && prevId === nextId
    && prevTpl === nextTpl
    && symEqual;
});
