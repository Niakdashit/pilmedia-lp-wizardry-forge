
import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface ButtonPlacementProps {
  placement: string;
  onPlacementChange: (placement: string) => void;
}

const ButtonPlacement: React.FC<ButtonPlacementProps> = ({ placement, onPlacementChange }) => {
  const positions = [
    { value: 'top', label: 'En haut', icon: ArrowUp },
    { value: 'center', label: 'Centré', icon: Minus },
    { value: 'bottom', label: 'En bas', icon: ArrowDown }
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Placement du bouton principal
      </label>
      <div className="grid grid-cols-3 gap-3">
        {positions.map((position) => (
          <button
            key={position.value}
            onClick={() => onPlacementChange(position.value)}
            className={`p-4 border-2 rounded-lg text-center transition-colors ${
              placement === position.value
                ? 'border-[#44444d] bg-[#f5f5f7] text-[#44444d]'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <position.icon className="w-5 h-5 mx-auto mb-2" />
            <div className="text-sm font-medium">{position.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ButtonPlacement;
