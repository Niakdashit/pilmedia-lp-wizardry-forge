import React from 'react';
import SlotMachine from './SlotMachine';

interface SlotJackpotProps {
  onWin?: (result: string[]) => void;
  onLose?: () => void;
  onOpenConfig?: () => void;
  disabled?: boolean;
}

const SlotJackpot: React.FC<SlotJackpotProps> = (props) => {
  return <SlotMachine {...props} />;
};

export default SlotJackpot;
