import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Dice1, Gamepad2, Puzzle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuickCampaignStore } from '../../stores/quickCampaignStore';
const gameTypes = [{
  id: 'wheel',
  name: 'Roue de la fortune',
  description: 'Jeu classique de roue interactive',
  icon: Target,
  color: 'from-blue-500 to-purple-600',
  popular: true
}, {
  id: 'jackpot',
  name: 'Machine à sous',
  description: 'Jackpot avec symboles alignés',
  icon: Zap,
  color: 'from-yellow-400 to-orange-500',
  popular: true
}, {
  id: 'scratch',
  name: 'Carte à gratter',
  description: 'Grattage virtuel interactif',
  icon: Gamepad2,
  color: 'from-green-400 to-blue-500'
}, {
  id: 'dice',
  name: 'Lancé de dés',
  description: 'Jeu de dés simple et amusant',
  icon: Dice1,
  color: 'from-red-400 to-pink-500'
}, {
  id: 'quiz',
  name: 'Quiz interactif',
  description: 'Questions-réponses engageantes',
  icon: Puzzle,
  color: 'from-indigo-400 to-purple-500'
}];
const Step1GameSelection: React.FC = () => {
  const navigate = useNavigate();
  const {
    selectedGameType,
    setSelectedGameType,
    setCurrentStep
  } = useQuickCampaignStore();
  const handleGameSelect = (gameId: string) => {
    setSelectedGameType(gameId);
    // Navigation automatique : passer directement à l'étape suivante
    setTimeout(() => {
      setCurrentStep(2);
    }, 300); // Petit délai pour l'animation de sélection
  };
  const handleNext = () => {
    if (selectedGameType) {
      setCurrentStep(2);
    }
  };
  const handleBack = () => {
    navigate('/campaigns');
  };
  return <div className="min-h-screen bg-[#ebf4f7] py-12 px-0">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.h1 initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} className="mb-4 text-[#841b60] text-4xl font-semibold">
              Créer une campagne
            </motion.h1>
            <motion.p initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.1
          }} className="text-xl font-light text-[#aa5e91]">
              Choisissez le type d'expérience que vous souhaitez créer
            </motion.p>
          </div>

          {/* Game Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {gameTypes.map((game, index) => {
            const IconComponent = game.icon;
            const isSelected = selectedGameType === game.id;
            return <motion.div key={game.id} initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: index * 0.1
            }} onClick={() => handleGameSelect(game.id)} className={`
                    relative p-8 rounded-xl border-2 cursor-pointer transition-all duration-300
                    ${isSelected ? 'border-[#841b60] bg-[#841b60]/5 shadow-xl' : 'border-gray-200 bg-gray-50 hover:border-[#841b60]/50 hover:shadow-lg'}
                  `}>
                  {game.popular && <div className="absolute -top-3 -right-3 bg-[#841b60] text-white text-xs px-3 py-1 rounded-full font-medium">
                      Populaire
                    </div>}
                  
                  <div className="text-center">
                    <div className={`
                      w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center
                      ${isSelected ? 'bg-[#841b60]' : 'bg-gray-100'}
                    `}>
                      <IconComponent className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {game.name}
                    </h3>
                    
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {game.description}
                    </p>
                  </div>
                </motion.div>;
          })}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button onClick={handleBack} className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors font-medium">
              Retour
            </button>

            <button onClick={handleNext} disabled={!selectedGameType} className={`
                flex items-center space-x-2 px-8 py-4 rounded-2xl font-medium transition-all
                ${selectedGameType ? 'bg-[#841b60] text-white hover:bg-[#841b60]/90 shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
              `}>
              <span>Continuer</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="text-center mt-16">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-1 bg-[#841b60] rounded-full"></div>
              <div className="w-8 h-1 bg-gray-200 rounded-full"></div>
              <div className="w-8 h-1 bg-gray-200 rounded-full"></div>
            </div>
            <p className="text-gray-500 font-light">Étape 1 sur 3</p>
          </div>
        </div>
      </div>
    </div>;
};
export default Step1GameSelection;