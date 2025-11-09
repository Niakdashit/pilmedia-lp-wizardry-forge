
import React from 'react';
import { WizardData } from '../ModernWizard';
import { CampaignType } from '../../../utils/campaignTypes';
import { RotateCcw, Brain, DollarSign, Layers, Grid3X3, Puzzle, Dice6, FileText } from 'lucide-react';

interface GameSelectionStepProps {
  wizardData: WizardData;
  updateWizardData: (data: Partial<WizardData>) => void;
  nextStep: () => void;
}

const iconComponents: Record<CampaignType, React.ReactElement> = {
  wheel: <RotateCcw className="w-5 h-5" />,
  quiz: <Brain className="w-5 h-5" />,
  jackpot: <DollarSign className="w-5 h-5" />,
  scratch: <Layers className="w-5 h-5" />,
  memory: <Grid3X3 className="w-5 h-5" />,
  puzzle: <Puzzle className="w-5 h-5" />,
  dice: <Dice6 className="w-5 h-5" />,
  form: <FileText className="w-5 h-5" />,
  swiper: <RotateCcw className="w-5 h-5" />
};

const gameTypes: { type: CampaignType; name: string; description: string }[] = [
  { type: 'wheel', name: 'Roue de la Fortune', description: 'Faites tourner la roue pour gagner' },
  { type: 'quiz', name: 'Quiz Interactif', description: 'Testez vos connaissances' },
  { type: 'jackpot', name: 'Jackpot', description: 'Tentez de décrocher le jackpot' },
  { type: 'scratch', name: 'Carte à Gratter', description: 'Découvrez ce qui se cache dessous' },
  { type: 'memory', name: 'Jeu de Mémoire', description: 'Trouvez les paires correspondantes' },
  { type: 'puzzle', name: 'Puzzle', description: 'Reconstituez l\'image' },
  { type: 'dice', name: 'Dés Chanceux', description: 'Lancez les dés et tentez votre chance' },
  { type: 'form', name: 'Formulaire Dynamique', description: 'Créez des formulaires interactifs' }
];

const GameSelectionStep: React.FC<GameSelectionStepProps> = ({
  wizardData,
  updateWizardData,
  nextStep
}) => {
  const handleGameSelect = (gameType: CampaignType) => {
    updateWizardData({ selectedGame: gameType });
    setTimeout(() => {
      nextStep();
    }, 200);
  };

  return (
    <div className="space-y-8">
      {/* Section Content */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-100/50">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#141e29] mb-3">
            Choisissez votre mécanique de jeu
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-2xl">
            Sélectionnez le type d'interaction qui correspond le mieux à vos objectifs. 
            Chaque mécanique peut être personnalisée selon vos besoins.
          </p>
        </div>

        {/* Game Selection Grid - Compact pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {gameTypes.map((game) => (
            <button
              key={game.type}
              onClick={() => handleGameSelect(game.type)}
              className={`
                group p-4 rounded-xl border transition-all duration-200 text-left
                hover:shadow-md hover:-translate-y-0.5
                ${wizardData.selectedGame === game.type
                  ? 'border-[#951b6d] bg-[#5a5a63]/5 shadow-md' 
                  : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-[#5a5a63]/30'
                }
              `}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                  ${wizardData.selectedGame === game.type
                    ? 'bg-[#5a5a63] text-white' 
                    : 'bg-gray-100 text-gray-600 group-hover:bg-[#5a5a63]/10 group-hover:text-[#951b6d]'
                  }
                `}>
                  {iconComponents[game.type]}
                </div>
                
                {wizardData.selectedGame === game.type && (
                  <div className="w-2 h-2 bg-[#5a5a63] rounded-full"></div>
                )}
              </div>
              
              <h3 className="font-semibold text-[#141e29] mb-1 text-sm group-hover:text-[#951b6d] transition-colors">
                {game.name}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {game.description}
              </p>
            </button>
          ))}
        </div>

        {/* Continue Button */}
        {wizardData.selectedGame && (
          <div className="flex justify-end">
            <button
              onClick={nextStep}
              className="px-8 py-3 bg-[#5a5a63] text-white font-semibold rounded-xl hover:bg-[#7d1659] transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Continuer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameSelectionStep;
