import React from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Layers } from 'lucide-react';
import PillButton from '../shared/PillButton';
import { getCampaignTypeIcon } from '../../utils/campaignTypes';
import { GameType } from './types';
const DashboardHeader: React.FC = () => {
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
  return <div className="relative w-full mt-3 pb-2 px-2 select-none md:px-[19px] z-10 overflow-hidden">
      {/* Fond glassmorphique pastel bleu, identique à PageHeader */}
      <div className="relative max-w-7xl mx-auto rounded-b-3xl overflow-hidden">
        <div className="
            relative
            bg-white/60
            bg-gradient-to-br
            from-[#fde7f2]/90
            via-[#f7e5ef]/80
            to-[#f2e8f5]/90
            backdrop-blur-xl
            rounded-b-3xl
            border-b border-white/25
          ">
          {/* Overlay coloré pour contraste subtil */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#b41b60]/10 via-transparent to-[#841b60]/6 pointer-events-none rounded-b-3xl" />
          {/* Décorations géométriques flottantes style PageHeader */}
          <div className="absolute top-4 right-8 w-20 h-20 bg-gradient-to-br from-fuchsia-400/20 to-rose-400/20 rounded-full blur-xl pointer-events-none"></div>
          <div className="absolute bottom-6 left-12 w-16 h-16 bg-gradient-to-br from-rose-400/15 to-pink-400/15 rounded-full blur-lg pointer-events-none"></div>
          {/* SVG décoratif éditorial, moins saturé/opacité */}
          <div className="absolute top-0 right-0 w-96 h-full opacity-30 pointer-events-none">
            <svg viewBox="0 0 400 200" className="w-full h-full">
              <defs>
                <linearGradient id="grad1-dh" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EC4899" stopOpacity="0.16" />
                  <stop offset="50%" stopColor="#DB2777" stopOpacity="0.13" />
                  <stop offset="100%" stopColor="#BE185D" stopOpacity="0.08" />
                </linearGradient>
              </defs>
              <path d="M300,20 Q350,60 320,100 T280,140 Q320,160 360,120 T400,80 L400,0 Z" fill="url(#grad1-dh)" />
              <circle cx="350" cy="40" r="15" fill="#EC4899" fillOpacity="0.08" />
              <circle cx="320" cy="80" r="8" fill="#DB2777" fillOpacity="0.11" />
              <path d="M280,120 Q300,100 320,120 T360,140" stroke="#BE185D" strokeWidth="2" strokeOpacity="0.12" fill="none" />
            </svg>
          </div>
          
          {/* Contenu principal */}
          <div className="relative z-10 flex flex-col items-center text-center pt-10 pb-10 px-6">
            
            
            {/* Section "Qu'allez-vous créer aujourd'hui ?" */}
            <div className="w-full">
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold mb-2 text-[#2e353e] drop-shadow-sm">Qu'allez-vous créer aujourd'hui ?</h2>
              </div>

              {/* Container pour desktop avec flex center */}
              <div className="hidden md:flex items-center justify-center space-x-6 max-w-5xl mx-auto mb-8">
                {gameTypes.map((game, index) => {
                const IconComponent = getCampaignTypeIcon(game.type);
                return <Link key={game.type} to={`/quick-campaign?type=${game.type}`} className="flex flex-col items-center group cursor-pointer opacity-0 animate-fade-in" style={{
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'forwards'
                }}>
                      <div className="w-14 h-14 bg-white/80 backdrop-blur-sm rounded-full shadow-xl shadow-purple-500/15 flex items-center justify-center group-hover:shadow-2xl group-hover:shadow-purple-500/25 transform group-hover:scale-110 transition-all duration-300 border border-white/50 group-hover:bg-white/90">
                        <IconComponent className="w-6 h-6 text-[#2e353e] group-hover:text-[#2e353e] transition-colors drop-shadow-sm" />
                      </div>
                      <span className="mt-2 text-xs font-medium text-gray-700 group-hover:text-[#2e353e] transition-colors text-center drop-shadow-sm">
                        {game.label}
                      </span>
                    </Link>;
              })}
              </div>

              {/* Container pour mobile avec scroll horizontal */}
              <div className="md:hidden w-full mb-8">
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
                        <div className="w-14 h-14 bg-white/80 backdrop-blur-sm rounded-full shadow-xl shadow-purple-500/15 flex items-center justify-center group-hover:shadow-2xl group-hover:shadow-purple-500/25 transform group-hover:scale-110 transition-all duration-300 border border-white/50 group-hover:bg-white/90">
                          <IconComponent className="w-6 h-6 text-[#2e353e] group-hover:text-[#2e353e] transition-colors drop-shadow-sm" />
                        </div>
                        <span className="mt-2 text-xs font-medium text-gray-700 group-hover:text-[#2e353e] transition-colors text-center drop-shadow-sm">
                          {game.label}
                        </span>
                      </Link>
                  })}
                </div>
              </div>

              {/* Boutons pills */}
              <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                <PillButton to="/campaigns" icon={<FolderOpen className="w-4 h-4" />}>
                  Mes campagnes
                </PillButton>

                <PillButton to="/templates-editor" icon={<Layers className="w-4 h-4" />}>
                  Modèles
                </PillButton>
              </div>
            </div>
          </div>

          {/* Gradient border en bas */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        </div>
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
export default DashboardHeader;