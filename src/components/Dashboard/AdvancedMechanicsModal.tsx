import React from 'react';
import { X } from 'lucide-react';
import { GameType } from './types';

interface AdvancedMechanicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: GameType['type']) => void;
}

const iconsByType: Record<string, string> = {
  wheel: '/gamification/shortcuts/wheel.svg',
  quiz: '/gamification/shortcuts/quiz.svg',
  scratch: '/gamification/shortcuts/scratch.svg',
  jackpot: '/gamification/shortcuts/jackpot.svg',
};

const items: Array<{ type: GameType['type']; label: string }>
  = [
    { type: 'wheel', label: 'Roue' },
    { type: 'quiz', label: 'Quiz' },
    { type: 'scratch', label: 'Carte à gratter' },
    { type: 'jackpot', label: 'Jackpot' },
  ];

const AdvancedMechanicsModal: React.FC<AdvancedMechanicsModalProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Choisir une mécanique</h3>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-5 grid grid-cols-2 gap-4">
          {items.map((item) => (
            <button
              key={item.type}
              onClick={() => onSelect(item.type)}
              className="group flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-[#E0004D]/50 hover:shadow transition-all"
            >
              <div className="w-20 h-20 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
                <img
                  src={iconsByType[item.type]}
                  alt={item.label}
                  className="w-14 h-14 object-contain"
                  loading="lazy"
                />
              </div>
              <span className="text-sm font-medium text-gray-800 group-hover:text-[#E0004D]">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="px-5 pb-5">
          <p className="text-xs text-gray-500">Sélectionnez une mécanique pour continuer la configuration.</p>
        </div>
      </div>
    </div>
  );
};

export default AdvancedMechanicsModal;
