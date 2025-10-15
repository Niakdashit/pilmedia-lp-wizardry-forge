import React from 'react';
import { Settings } from 'lucide-react';

interface WheelSettingsButtonProps {
  onClick: () => void;
}

const WheelSettingsButton: React.FC<WheelSettingsButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-gray-300 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow"
      title="Paramètres de la roue"
    >
      <Settings className="w-5 h-5 text-gray-600" />
    </button>
  );
};

export default WheelSettingsButton;
