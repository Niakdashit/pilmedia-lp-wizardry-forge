
import React from 'react';
import { CampaignType } from '../../../utils/campaignTypes';
import { Zap, Brain, DollarSign, Layers, Grid3X3, Puzzle, Dice6, FileText, RotateCcw } from 'lucide-react';

interface GameBubbleProps {
  gameType: CampaignType;
  name: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  delay?: number;
}

const iconComponents: Record<CampaignType, React.ReactElement> = {
  wheel: <RotateCcw className="w-8 h-8" />,
  quiz: <Brain className="w-8 h-8" />,
  jackpot: <DollarSign className="w-8 h-8" />,
  scratch: <Layers className="w-8 h-8" />,
  memory: <Grid3X3 className="w-8 h-8" />,
  puzzle: <Puzzle className="w-8 h-8" />,
  dice: <Dice6 className="w-8 h-8" />,
  form: <FileText className="w-8 h-8" />,
  swiper: <Zap className="w-8 h-8" />
};

const GameBubble: React.FC<GameBubbleProps> = ({
  gameType,
  name,
  description,
  isSelected,
  onClick,
  delay = 0
}) => {
  return (
    <div
      className={`
        relative group cursor-pointer transition-all duration-500 transform hover:scale-110
        ${isSelected ? 'scale-110' : ''}
      `}
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Main bubble */}
      <div className={`
        w-24 h-24 rounded-3xl flex items-center justify-center
        transition-all duration-300 group-hover:shadow-2xl
        ${isSelected 
          ? 'bg-gradient-to-br from-[#44444d] to-[#6d164f] shadow-2xl shadow-[#44444d]/50' 
          : 'bg-white/20 backdrop-blur-xl border border-white/30 group-hover:bg-white/30'
        }
      `}>
        <div className={`
          transition-colors duration-300
          ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}
        `}>
          {iconComponents[gameType]}
        </div>
      </div>

      {/* Selection ring (static) */}
      {isSelected && (
        <div className="absolute inset-0 rounded-3xl border-2 border-[#44444d]"></div>
      )}

      {/* Tooltip */}
      <div className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-black/80 backdrop-blur-sm rounded-2xl px-4 py-3 min-w-48 text-center">
          <div className="text-white font-semibold text-sm mb-1">{name}</div>
          <div className="text-gray-300 text-xs">{description}</div>
        </div>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-black/80"></div>
      </div>

      {/* Floating particles (removed animations) */}
      {isSelected && (
        <>
          <div className="absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-br from-[#44444d] to-[#44444d] rounded-full"></div>
          <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-violet-400 rounded-full"></div>
        </>
      )}
    </div>
  );
};

export default GameBubble;
