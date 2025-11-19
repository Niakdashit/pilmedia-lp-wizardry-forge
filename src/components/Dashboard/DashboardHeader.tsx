import React, { useState } from 'react';
import EditorModeModal from './EditorModeModal';
 
import { GameType } from './types';
const DashboardHeader: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedEditorType, setSelectedEditorType] = useState<GameType['type'] | null>(null);

  const gameTypes: GameType[] = [{
    type: 'wheel',
    label: 'Roue'
  }, {
    type: 'quiz',
    label: 'Quiz'
  }, {
    type: 'scratch',
    label: 'Carte à gratter'
  }, {
    type: 'jackpot',
    label: 'Jackpot'
  }, {
    type: 'form',
    label: 'Formulaire'
  }, {
    // New advanced shortcut (opens modal)
    type: 'advanced' as any,
    label: 'Avancé'
  }];

  const handleGameTypeClick = (type: GameType['type']) => {
    setSelectedEditorType(type);
    setIsModalOpen(true);
  };
  return (
    <>
      <div className="relative w-full mt-2 pb-4 px-6 select-text sm:px-8 lg:px-10 z-10">
        <div className="max-w-7xl mx-auto">
          {/* Contenu principal */}
          <div className="flex flex-col items-center text-center pt-10 pb-10 px-6">
            
            
            {/* Section "Qu'allez-vous créer aujourd'hui ?" */}
            <div className="w-full">
              <div className="text-center mb-8">
                <h2 className="title-canva-sm text-[#44444d] mb-2 drop-shadow-sm">Qu'allez-vous créer aujourd'hui ?</h2>
              </div>

              {/* Container pour desktop avec flex center */}
              <div className="hidden md:flex items-center justify-center space-x-6 max-w-5xl mx-auto mb-8">
                {gameTypes.map((game, index) => {
                const iconByType: Record<string, string> = {
                  wheel: '/gamification/shortcuts/wheel.svg',
                  quiz: '/gamification/shortcuts/quiz.svg',
                  scratch: '/gamification/shortcuts/scratch.svg',
                  jackpot: '/gamification/shortcuts/jackpot.svg',
                  form: '/gamification/shortcuts/form.svg',
                  advanced: '/gamification/shortcuts/advanced_v2.svg'
                };
                const onClick = () => {
                  if (game.type === ('advanced' as any)) { setShowAdvanced(true); return; }
                  handleGameTypeClick(game.type);
                };
                return <button 
                  key={game.type} 
                  onClick={onClick}
                  className="flex flex-col items-center group cursor-pointer opacity-0 animate-fade-in" 
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: 'forwards'
                  }}
                >
                      <div className="w-[6.25rem] h-[6.25rem] bg-transparent rounded-lg overflow-hidden flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                        <img
                          src={iconByType[game.type]}
                          alt={game.label}
                          loading="lazy"
                          decoding="async"
                          className="w-[6rem] h-[6rem] rounded-lg"
                        />
                      </div>
                      <span className="mt-2 text-xs font-medium text-gray-700 group-hover:text-[#44444d] transition-colors text-center drop-shadow-sm">
                        {game.label}
                      </span>
                    </button>;
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
                    form: '/gamification/shortcuts/form.svg',
                    advanced: '/gamification/shortcuts/advanced_v2.svg'
                  };
                  const onClick = () => {
                    if (game.type === ('advanced' as any)) { setShowAdvanced(true); return; }
                    handleGameTypeClick(game.type);
                  };
                  return <button 
                    key={game.type} 
                    onClick={onClick}
                    className="flex flex-col items-center group cursor-pointer opacity-0 animate-fade-in flex-shrink-0" 
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animationFillMode: 'forwards'
                    }}
                  >
                        <div className="w-[6.25rem] h-[6.25rem] bg-transparent rounded-lg overflow-hidden flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                          <img
                            src={iconByType[game.type]}
                            alt={game.label}
                            loading="lazy"
                            decoding="async"
                            className="w-[6rem] h-[6rem] rounded-lg"
                          />
                        </div>
                        <span className="mt-2 text-xs font-medium text-gray-700 group-hover:text-[#44444d] transition-colors text-center drop-shadow-sm">
                          {game.label}
                        </span>
                      </button>
                  })}
                </div>
              </div>

              {/* Anciennes actions supprimées: Mes campagnes / Modèles */}
            </div>
          </div>

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

      {/* Modale de choix de mode */}
      {selectedEditorType && (
        <EditorModeModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEditorType(null);
          }}
          editorType={selectedEditorType as 'wheel' | 'quiz' | 'scratch' | 'jackpot' | 'form' | 'dice' | 'memory' | 'puzzle'}
        />
      )}

      {/* Modale Avancé: liste des mécaniques */}
      {showAdvanced && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
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
                <button
                  key={m.type}
                  onClick={() => { setShowAdvanced(false); window.location.href = m.route; }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#44444d]/40 hover:bg-[#44444d]/5 transition"
                >
                  <img src={`/gamification/shortcuts/${m.type}.svg`} alt={m.label} className="w-8 h-8" />
                  <span className="text-sm font-medium text-gray-800">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default DashboardHeader;
