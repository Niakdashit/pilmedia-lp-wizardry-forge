import React, { useState } from 'react';
import EditorModeModal from './EditorModeModal';
 
import { GameType } from './types';
const DashboardHeader: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
                return <button 
                  key={game.type} 
                  onClick={() => handleGameTypeClick(game.type)}
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
                      <span className="mt-2 text-xs font-medium text-gray-700 group-hover:text-[#841b60] transition-colors text-center drop-shadow-sm">
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
                    form: '/gamification/shortcuts/form.svg'
                  };
                  
                  return <button 
                    key={game.type} 
                    onClick={() => handleGameTypeClick(game.type)}
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
                        <span className="mt-2 text-xs font-medium text-gray-700 group-hover:text-[#841b60] transition-colors text-center drop-shadow-sm">
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
    </>
  );
};
export default DashboardHeader;
