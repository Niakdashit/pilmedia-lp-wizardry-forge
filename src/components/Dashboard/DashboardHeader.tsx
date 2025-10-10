import React from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Layers } from 'lucide-react';
import PillButton from '../shared/PillButton';
 
import { GameType } from './types';
const DashboardHeader: React.FC = () => {
  const gameTypes: GameType[] = [{
    type: 'wheel',
    label: 'Roue'
  }, {
    type: 'quiz',
    label: 'Quiz'
  }, {
    type: 'scratch',
    label: 'Grattage'
  }, {
    type: 'jackpot',
    label: 'Jackpot'
  }, {
    type: 'form',
    label: 'Formulaire'
  }];
  return <div className="relative w-full mt-2 pb-4 px-6 select-text sm:px-8 lg:px-10 z-10 overflow-hidden">
      {/* Fond glassmorphique pastel bleu, identique à PageHeader */}
      <div className="relative max-w-7xl mx-auto rounded-b-3xl overflow-hidden">
        <div className="
            relative
            bg-white/60
            bg-gradient-to-br
            from-[#ede9fe]/85
            via-[#e0f2fe]/80
            to-[#eef2ff]/85
            backdrop-blur-xl
            rounded-b-3xl
            border-b border-white/25
          ">
          {/* Overlay coloré pour contraste subtil */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed]/16 via-transparent to-[#2563eb]/12 pointer-events-none rounded-b-3xl" />
          {/* Décorations géométriques flottantes style PageHeader */}
          <div className="absolute top-6 right-10 w-24 h-24 bg-gradient-to-br from-violet-300/25 to-blue-300/25 rounded-full blur-xl pointer-events-none"></div>
          <div className="absolute bottom-8 left-14 w-20 h-20 bg-gradient-to-br from-indigo-300/25 to-sky-300/25 rounded-full blur-lg pointer-events-none"></div>
          {/* SVG décoratif éditorial, moins saturé/opacité */}
          <div className="absolute top-0 right-0 w-96 h-full opacity-30 pointer-events-none">
            <svg viewBox="0 0 400 200" className="w-full h-full">
              <defs>
                <linearGradient id="grad1-dh" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.16" />
                  <stop offset="50%" stopColor="#6366f1" stopOpacity="0.13" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.10" />
                </linearGradient>
              </defs>
              <path d="M300,20 Q350,60 320,100 T280,140 Q320,160 360,120 T400,80 L400,0 Z" fill="url(#grad1-dh)" />
              <circle cx="350" cy="40" r="15" fill="#7c3aed" fillOpacity="0.10" />
              <circle cx="320" cy="80" r="8" fill="#6366f1" fillOpacity="0.12" />
              <path d="M280,120 Q300,100 320,120 T360,140" stroke="#2563eb" strokeWidth="2" strokeOpacity="0.14" fill="none" />
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
                const iconByType: Record<string, string> = {
                  wheel: '/gamification/shortcuts/wheel.svg',
                  quiz: '/gamification/shortcuts/quiz.svg',
                  scratch: '/gamification/shortcuts/scratch.svg',
                  jackpot: '/gamification/shortcuts/jackpot.svg',
                  form: '/gamification/shortcuts/form.svg'
                };
                const getRoute = (type: string) => {
                  if (type === 'quiz') return '/quiz-editor';
                  if (type === 'wheel') return '/design-editor';
                  if (type === 'scratch') return '/scratch-editor';
                  if (type === 'jackpot') return '/jackpot-editor';
                  if (type === 'form') return '/form-editor';
                  return `/quick-campaign?type=${type}`;
                };
                return <Link key={game.type} to={getRoute(game.type)} className="flex flex-col items-center group cursor-pointer opacity-0 animate-fade-in" style={{
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'forwards'
                }}>
                      <div className="w-[3.5625rem] h-[3.5625rem] bg-transparent rounded-full overflow-hidden shadow-xl shadow-purple-500/15 flex items-center justify-center group-hover:shadow-2xl group-hover:shadow-purple-500/25 transform group-hover:scale-110 transition-all duration-300">
                        <img
                          src={iconByType[game.type]}
                          alt={game.label}
                          loading="lazy"
                          decoding="async"
                          className="w-[3.375rem] h-[3.375rem] rounded-full"
                        />
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
                  const iconByType: Record<string, string> = {
                    wheel: '/gamification/shortcuts/wheel.svg',
                    quiz: '/gamification/shortcuts/quiz.svg',
                    scratch: '/gamification/shortcuts/scratch.svg',
                    jackpot: '/gamification/shortcuts/jackpot.svg',
                    form: '/gamification/shortcuts/form.svg'
                  };
                  const getRoute = (type: string) => {
                    console.log('🎯 [DashboardHeader] Game type:', type);
                    if (type === 'quiz') return '/quiz-editor';
                    if (type === 'wheel') return '/design-editor';
                    if (type === 'scratch') return '/scratch-editor';
                    if (type === 'jackpot') return '/jackpot-editor';
                    if (type === 'form') return '/form-editor';
                    return `/quick-campaign?type=${type}`;
                  };
                  
                  return <Link key={game.type} to={getRoute(game.type)} className="flex flex-col items-center group cursor-pointer opacity-0 animate-fade-in flex-shrink-0" style={{
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: 'forwards'
                  }}>
                        <div className="w-[3.5625rem] h-[3.5625rem] bg-transparent rounded-full overflow-hidden shadow-xl shadow-purple-500/15 flex items-center justify-center group-hover:shadow-2xl group-hover:shadow-purple-500/25 transform group-hover:scale-110 transition-all duration-300">
                          <img
                            src={iconByType[game.type]}
                            alt={game.label}
                            loading="lazy"
                            decoding="async"
                            className="w-[3.375rem] h-[3.375rem] rounded-full"
                          />
                        </div>
                        <span className="mt-2 text-xs font-medium text-gray-700 group-hover:text-[#841b60] transition-colors text-center drop-shadow-sm">
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
