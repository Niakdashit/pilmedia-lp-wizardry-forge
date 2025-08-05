import React from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Layers } from 'lucide-react';
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
            from-[#e9f1fd]/90
            via-[#f3e8fa]/80
            to-[#c4e0f9]/90
            backdrop-blur-xl
            rounded-b-3xl
            border-b border-white/25
          ">
          {/* Overlay coloré pour contraste subtil */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#841b60]/8 via-transparent to-[#841b60]/5 pointer-events-none rounded-b-3xl" />
          {/* Décorations géométriques flottantes style PageHeader */}
          <div className="absolute top-4 right-8 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-xl pointer-events-none"></div>
          <div className="absolute bottom-6 left-12 w-16 h-16 bg-gradient-to-br from-blue-400/15 to-indigo-400/15 rounded-full blur-lg pointer-events-none"></div>
          {/* SVG décoratif éditorial, moins saturé/opacité */}
          <div className="absolute top-0 right-0 w-96 h-full opacity-30 pointer-events-none">
            <svg viewBox="0 0 400 200" className="w-full h-full">
              <defs>
                <linearGradient id="grad1-dh" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.16" />
                  <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.13" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.08" />
                </linearGradient>
              </defs>
              <path d="M300,20 Q350,60 320,100 T280,140 Q320,160 360,120 T400,80 L400,0 Z" fill="url(#grad1-dh)" />
              <circle cx="350" cy="40" r="15" fill="#8B5CF6" fillOpacity="0.08" />
              <circle cx="320" cy="80" r="8" fill="#3B82F6" fillOpacity="0.11" />
              <path d="M280,120 Q300,100 320,120 T360,140" stroke="#6366F1" strokeWidth="2" strokeOpacity="0.12" fill="none" />
            </svg>
          </div>
          
          {/* Contenu principal */}
          <div className="relative z-10 flex flex-col items-center text-center pt-10 pb-10 px-6">
            
            
            {/* Section "Qu'allez-vous créer aujourd'hui ?" */}
            <div className="w-full">
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold mb-2 text-[#841b60] drop-shadow-sm">Qu'allez-vous créer aujourd'hui ?</h2>
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
                        <IconComponent className="w-6 h-6 text-[#841b60] group-hover:text-[#6d164f] transition-colors drop-shadow-sm" />
                      </div>
                      <span className="mt-2 text-xs font-medium text-gray-700 group-hover:text-[#841b60] transition-colors text-center drop-shadow-sm">
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
                          <IconComponent className="w-6 h-6 text-[#841b60] group-hover:text-[#6d164f] transition-colors drop-shadow-sm" />
                        </div>
                        <span className="mt-2 text-xs font-medium text-gray-700 group-hover:text-[#841b60] transition-colors text-center drop-shadow-sm">
                          {game.label}
                        </span>
                      </Link>;
                })}
                </div>
              </div>

              {/* Boutons pills */}
              <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                <Link to="/campaigns" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#841b60]/90 to-[#6d164f]/90 backdrop-blur-sm text-white font-medium rounded-xl hover:from-[#841b60] hover:to-[#6d164f] transition-all duration-300 shadow-lg shadow-[#841b60]/20 hover:shadow-xl hover:shadow-[#841b60]/30 transform hover:-translate-y-0.5 border border-white/20 text-sm">
                  <FolderOpen className="w-4 h-4 mr-2 drop-shadow-sm" />
                  <span className="drop-shadow-sm">Mes campagnes</span>
                </Link>
                
                <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#841b60]/90 to-[#6d164f]/90 backdrop-blur-sm text-white font-medium rounded-xl hover:from-[#841b60] hover:to-[#6d164f] transition-all duration-300 shadow-lg shadow-[#841b60]/20 hover:shadow-xl hover:shadow-[#841b60]/30 transform hover:-translate-y-0.5 border border-white/20 text-sm">
                  <Layers className="w-4 h-4 mr-2 drop-shadow-sm" />
                  <span className="drop-shadow-sm">Modèles</span>
                </button>
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