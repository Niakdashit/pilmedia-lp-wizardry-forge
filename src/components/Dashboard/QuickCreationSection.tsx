import React from 'react';
import { Link } from 'react-router-dom';
import { GameType } from './types';

const shortcutIconMap: Record<string, string> = {
  wheel: '/gamification/shortcuts/wheel.svg',
  quiz: '/gamification/shortcuts/quiz.svg',
  scratch: '/gamification/shortcuts/scratch.svg',
  dice: '/gamification/shortcuts/dice.svg',
  jackpot: '/gamification/shortcuts/jackpot.svg',
  memory: '/gamification/shortcuts/memory.svg',
  puzzle: '/gamification/shortcuts/puzzle.svg',
  form: '/gamification/shortcuts/form.svg',
  // alias for the new Advanced entry
  advanced: '/gamification/shortcuts/advanced_v2.svg',
};

const getShortcutIcon = (type: string) => shortcutIconMap[type] ?? shortcutIconMap.wheel;
const QuickCreationSection: React.FC = () => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);
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
  }, {
    type: 'advanced',
    label: 'Avancé'
  }];
  return <div className="w-full mt-8 py-0">
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-white/50 via-white/40 to-white/30 backdrop-blur-xl border border-white/40 shadow-1xl shadow-purple-500/10 bg-[#428cec]/25 my-0">
        
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#44444d]/8 via-transparent to-[#44444d]/5 pointer-events-none"></div>
        
        {/* Abstract Geometric Patterns */}
        <div className="absolute top-4 right-8 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-6 left-12 w-16 h-16 bg-gradient-to-br from-blue-400/15 to-indigo-400/15 rounded-full blur-lg"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 text-[#44444d] drop-shadow-sm">Qu'allez-vous créer aujourd'hui ?</h2>
          </div>

        {showAdvanced && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowAdvanced(false)} />
            <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Mécaniques avancées</h3>
                <button type="button" onClick={() => setShowAdvanced(false)} className="px-2 py-1 text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { type: 'wheel', label: 'Roue de la fortune', route: '/advanced-wheel' },
                  { type: 'quiz', label: 'Quiz', route: '/advanced-quiz' },
                  { type: 'scratch', label: 'Carte à gratter', route: '/advanced-scratch' },
                  { type: 'jackpot', label: 'Jackpot', route: '/advanced-jackpot' },
                ].map((m) => (
                  <Link
                    key={m.type}
                    to={m.route}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#44444d]/40 hover:bg-[#44444d]/5 transition"
                    onClick={() => setShowAdvanced(false)}
                  >
                    <img src={getShortcutIcon(m.type)} alt={m.label} className="w-8 h-8" />
                    <span className="text-sm font-medium text-gray-800">{m.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

          <div className="flex justify-center mb-8">
            {/* Container pour desktop avec flex center */}
            <div className="hidden md:flex items-center justify-center space-x-8 max-w-5xl">
              {gameTypes.map((game, index) => {
                const iconSrc = getShortcutIcon(game.type);
                const commonInner = (
                  <>
                    <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-full shadow-xl shadow-purple-500/15 flex items-center justify-center group-hover:shadow-2xl group-hover:shadow-purple-500/25 transform group-hover:scale-110 transition-all duration-300 border border-white/50 group-hover:bg-white/90">
                      <img src={iconSrc} alt={game.label} className="w-10 h-10 object-contain drop-shadow-sm" loading="lazy" />
                    </div>
                    <span className="mt-2 text-sm font-medium text-gray-700 group-hover:text-[#44444d] transition-colors text-center drop-shadow-sm">{game.label}</span>
                  </>
                );
                return game.type === 'advanced' ? (
                  <button
                    key={game.type}
                    type="button"
                    onClick={() => setShowAdvanced(true)}
                    className="flex flex-col items-center group cursor-pointer opacity-0 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                  >
                    {commonInner}
                  </button>
                ) : (
                  <Link
                    key={game.type}
                    to={`/quick-campaign?type=${game.type}`}
                    className="flex flex-col items-center group cursor-pointer opacity-0 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                  >
                    {commonInner}
                  </Link>
                );
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
                  const iconSrc = getShortcutIcon(game.type);
                  const commonInner = (
                    <>
                      <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-full shadow-xl shadow-purple-500/15 flex items-center justify-center group-hover:shadow-2xl group-hover:shadow-purple-500/25 transform group-hover:scale-110 transition-all duration-300 border border-white/50 group-hover:bg-white/90">
                        <img src={iconSrc} alt={game.label} className="w-10 h-10 object-contain drop-shadow-sm" loading="lazy" />
                      </div>
                      <span className="mt-2 text-sm font-medium text-gray-700 group-hover:text-[#44444d] transition-colors text-center drop-shadow-sm">{game.label}</span>
                    </>
                  );
                  return game.type === 'advanced' ? (
                    <button
                      key={game.type}
                      type="button"
                      onClick={() => setShowAdvanced(true)}
                      className="flex flex-col items-center group cursor-pointer opacity-0 animate-fade-in flex-shrink-0"
                      style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                    >
                      {commonInner}
                    </button>
                  ) : (
                    <Link
                      key={game.type}
                      to={`/quick-campaign?type=${game.type}`}
                      className="flex flex-col items-center group cursor-pointer opacity-0 animate-fade-in flex-shrink-0"
                      style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                    >
                      {commonInner}
                    </Link>
                  );
                })}
              </div>
            </div>
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