
import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Dice1, Gamepad2, Puzzle, Check } from 'lucide-react';
import { useQuickCampaignStore } from '../../../../stores/quickCampaignStore';

const gameTypes = [
  {
    id: 'wheel',
    name: 'Roue de la fortune',
    description: 'Jeu classique de roue interactive',
    icon: Target,
    color: 'from-blue-500 to-purple-600',
    popular: true
  },
  {
    id: 'jackpot',
    name: 'Machine à sous',
    description: 'Jackpot avec symboles alignés',
    icon: Zap,
    color: 'from-yellow-400 to-orange-500',
    popular: true
  },
  {
    id: 'scratch',
    name: 'Carte à gratter',
    description: 'Grattage virtuel interactif',
    icon: Gamepad2,
    color: 'from-green-400 to-blue-500'
  },
  {
    id: 'dice',
    name: 'Lancé de dés',
    description: 'Jeu de dés simple et amusant',
    icon: Dice1,
    color: 'from-red-400 to-pink-500'
  },
  {
    id: 'quiz',
    name: 'Quiz interactif',
    description: 'Questions-réponses engageantes',
    icon: Puzzle,
    color: 'from-indigo-400 to-purple-500'
  }
];

const GameTypePanel: React.FC = () => {
  const { selectedGameType, setSelectedGameType } = useQuickCampaignStore();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Type d'expérience
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Choisissez le type de jeu que vous souhaitez créer pour votre campagne.
        </p>
      </div>

      <div className="space-y-3">
        {gameTypes.map((game, index) => {
          const IconComponent = game.icon;
          const isSelected = selectedGameType === game.id;

          return (
            <motion.button
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedGameType(game.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-lg'
                  : 'border-border bg-card hover:border-primary/50 hover:shadow-md'
              }`}
            >
              {/* Background gradient (subtle) */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-5`}
              />
              
              {/* Popular badge */}
              {game.popular && (
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                  Populaire
                </div>
              )}

              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-primary-foreground" />
                </motion.div>
              )}

              <div className="relative flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  <IconComponent className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground mb-1">
                    {game.name}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {game.description}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {selectedGameType && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 border border-green-200 rounded-xl"
        >
          <div className="flex items-center space-x-2 text-green-700">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">
              Type de jeu sélectionné ! Configurez maintenant les assets de votre marque.
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GameTypePanel;
