import React from 'react';
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
}

const SlotJackpot: React.FC<SlotJackpotProps> = (props) => {
  return <SlotMachine {...props} />;
};

export default SlotJackpot;
