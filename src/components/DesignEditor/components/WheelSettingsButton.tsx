import React from 'react';
import { Settings } from 'lucide-react';

interface WheelSettingsButtonProps {
  onClick: () => void;
}

const WheelSettingsButton: React.FC<WheelSettingsButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-[#f0f5fd] rounded-lg p-2 shadow-sm hover:shadow-md hover:bg-[#eaf2ff] transition-colors"
      title="Paramètres de la roue"
    >
      <Settings className="w-5 h-5 text-[#646463]" />
    </button>
  );
};

export default WheelSettingsButton;
