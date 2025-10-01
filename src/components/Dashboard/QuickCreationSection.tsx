import React from 'react';
import { Link } from 'react-router-dom';
import PillButton from '../shared/PillButton';
import { FolderOpen, Layers } from 'lucide-react';
import { getCampaignTypeIcon } from '../../utils/campaignTypes';
import { GameType } from './types';
const QuickCreationSection: React.FC = () => {
  const gameTypes: GameType[] = [{
    type: 'wheel',
    label: 'Roue de la fortune'
  }, {
    type: 'quiz',
    label: 'Quiz'
  }, {
    type: 'scratch',
    label: 'Grattage'
  }, {
    type: 'dice',
    label: 'Dés'
  }, {
    type: 'jackpot',
    label: 'Jackpot'
  }, {
    type: 'memory',
    label: 'Memory'
  }, {
    type: 'puzzle',
    label: 'Puzzle'
  }, {
    type: 'form',
    label: 'Formulaire'
  }];
  return <div className="w-full mt-8 py-0">
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-white/50 via-white/40 to-white/30 backdrop-blur-xl border border-white/40 shadow-1xl shadow-purple-500/10 bg-[#428cec]/25 my-0">
        
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#d4dbe8]/8 via-transparent to-[#d4dbe8]/5 pointer-events-none"></div>
        
        {/* Abstract Geometric Patterns */}
        <div className="absolute top-4 right-8 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-6 left-12 w-16 h-16 bg-gradient-to-br from-blue-400/15 to-indigo-400/15 rounded-full blur-lg"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 text-[#d4dbe8] drop-shadow-sm">Qu'allez-vous créer aujourd'hui ?</h2>
          </div>

          <div className="flex justify-center mb-8">
            {/* Container pour desktop avec flex center */}
            <div className="hidden md:flex items-center justify-center space-x-8 max-w-5xl">
              {gameTypes.map((game, index) => {
              const IconComponent = getCampaignTypeIcon(game.type);
              return <Link key={game.type} to={`/quick-campaign?type=${game.type}`} className="flex flex-col items-center group cursor-pointer opacity-0 animate-fade-in" style={{
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'forwards'
              }}>
                    <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-full shadow-xl shadow-purple-500/15 flex items-center justify-center group-hover:shadow-2xl group-hover:shadow-purple-500/25 transform group-hover:scale-110 transition-all duration-300 border border-white/50 group-hover:bg-white/90">
                      <IconComponent className="w-8 h-8 text-[#d4dbe8] group-hover:text-[#6d164f] transition-colors drop-shadow-sm" />
                    </div>
                    <span className="mt-2 text-sm font-medium text-gray-700 group-hover:text-[#d4dbe8] transition-colors text-center drop-shadow-sm">
                      {game.label}
                    </span>
                  </Link>;
            })}
            </div>

            {/* Container pour mobile avec scroll horizontal */}
            <div className="md:hidden w-full">
              {/* Ajout de negative margins pour affleurer le bord */}
              <div className="flex space-x-4 overflow-x-auto pb-4 px-6 -mx-4 scrollbar-hide" style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}>
                {gameTypes.map((game, index) => {
                const IconComponent = getCampaignTypeIcon(game.type);
                return <Link key={game.type} to={`/quick-campaign?type=${game.type}`} className="flex flex-col items-center group cursor-pointer opacity-0 animate-fade-in flex-shrink-0" style={{
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'forwards'
                }}>
                        <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-full shadow-xl shadow-purple-500/15 flex items-center justify-center group-hover:shadow-2xl group-hover:shadow-purple-500/25 transform group-hover:scale-110 transition-all duration-300 border border-white/50 group-hover:bg-white/90">
                          <IconComponent className="w-8 h-8 text-[#d4dbe8] group-hover:text-[#6d164f] transition-colors drop-shadow-sm" />
                        </div>
                        <span className="mt-2 text-sm font-medium text-gray-700 group-hover:text-[#d4dbe8] transition-colors text-center drop-shadow-sm">
                          {game.label}
                        </span>
                      </Link>;
              })}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <PillButton to="/campaigns" icon={<FolderOpen className="w-4 h-4" />}>Mes campagnes</PillButton>
            <PillButton to="/templates-editor" icon={<Layers className="w-4 h-4" />}>Modèles</PillButton>
          </div>
        </div>

        {/* Enhanced Bottom Gradient Border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .scrollbar-hide {
          -webkit-overflow-scrolling: touch;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>;
};
export default QuickCreationSection;