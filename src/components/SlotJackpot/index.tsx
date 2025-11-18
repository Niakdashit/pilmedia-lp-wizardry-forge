import React, { memo } from 'react';
import SlotMachine from './SlotMachine';

interface SlotJackpotProps {
  onWin?: (result: string[]) => void;
  onLose?: () => void;
  onOpenConfig?: () => void;
  disabled?: boolean;
  // Permet au mode preview de forcer un template précis sans attendre la mise à jour du store
  templateOverride?: string;
  // Permet d'injecter les symboles depuis la campagne
  symbols?: string[];
  // Props nécessaires au portail fullscreen et à la dotation (transmises à SlotMachine)
  campaign?: any;
  participantEmail?: string;
  participantId?: string;
  useDotationSystem?: boolean;
}

const SlotJackpot: React.FC<SlotJackpotProps> = memo((props) => {
  return <SlotMachine {...props} />;
});

SlotJackpot.displayName = 'SlotJackpot';

export default SlotJackpot;
