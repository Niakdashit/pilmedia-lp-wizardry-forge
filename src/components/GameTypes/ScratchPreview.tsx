
import React, { useState, useEffect } from 'react';
import ScratchGameGrid from './ScratchGameGrid';
import type { Prize } from '../../types/PrizeSystem';
import { ScratchCardCanvasHandlers } from '../../utils/scratchCardCanvasHandlers';

interface ScratchPreviewProps {
  config?: any;
  onFinish?: (result: 'win' | 'lose') => void;
  onStart?: () => void;
  disabled?: boolean;
  buttonLabel?: string;
  buttonColor?: string;
  gameSize?: 'small' | 'medium' | 'large' | 'xlarge';
  gamePosition?: 'top' | 'center' | 'bottom' | 'left' | 'right';
  autoStart?: boolean;
  isModal?: boolean;
  prizes?: Prize[]; // Ajout des lots pour l'attribution
}

const STORAGE_KEY = 'scratch_session_card';
const SCRATCH_STARTED_KEY = 'scratch_session_started';

const ScratchPreview: React.FC<ScratchPreviewProps> = ({
  config = {},
  onFinish,
  onStart,
  disabled = false,
  buttonLabel = 'Gratter',
  buttonColor = '#841b60',
  gameSize = 'medium',
  autoStart = false,
  isModal = false,
  prizes = []
}) => {
  // ✅ LOGIQUE FUNNEL UNLOCKED : le jeu ne démarre que si disabled=false (formulaire validé)
  const [gameStarted, setGameStarted] = useState(false);
  const [finishedCards, setFinishedCards] = useState<Set<number>>(new Set());
  const [hasWon, setHasWon] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [scratchStarted, setScratchStarted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Initialize canvas handlers for color system
  useEffect(() => {
    const canvasHandlers = new ScratchCardCanvasHandlers();
    
    // Clear any previous session data on component mount to ensure fresh start
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SCRATCH_STARTED_KEY);
    
    return () => {
      canvasHandlers.cleanup();
    };
  }, []);

  // ✅ CORRECTION : Pas d'autostart si disabled=true (formulaire non validé)
  useEffect(() => {
    if (autoStart && !gameStarted && !disabled) {
      setGameStarted(true);
      if (onStart) onStart();
    }
  }, [autoStart, gameStarted, disabled, onStart]);

  const handleGameStart = () => {
    // ✅ VERIFICATION FUNNEL : Ne peut pas démarrer si disabled (formulaire non validé)
    if (disabled) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('🚫 Scratch: Jeu bloqué - formulaire non validé');
      }
      return;
    }
    if (process.env.NODE_ENV !== 'production') {
      console.log('🎮 Scratch: Démarrage du jeu autorisé');
    }
    setGameStarted(true);
    if (onStart) onStart();
  };

  const handleCardSelect = (index: number) => {
    // Only allow selection if no scratch has started and no card is selected
    if (!scratchStarted && selectedCard === null) {
      setSelectedCard(index);
    }
  };

  const handleScratchStart = (index: number) => {
    // Only allow scratch to start on the selected card and if no scratch has started yet
    if (selectedCard === index && !scratchStarted) {
      setScratchStarted(true);
      localStorage.setItem(STORAGE_KEY, index.toString());
      localStorage.setItem(SCRATCH_STARTED_KEY, 'true');
    }
  };

  const handleCardFinish = (result: 'win' | 'lose', cardIndex: number) => {
    const newFinishedCards = new Set([...finishedCards, cardIndex]);
    setFinishedCards(newFinishedCards);

    if (result === 'win') {
      setHasWon(true);
    }

    const totalCards = config?.cards?.length || 1;
    if (newFinishedCards.size >= totalCards) {
      setShowResult(true);
      setTimeout(() => {
        if (onFinish) {
          onFinish(hasWon || result === 'win' ? 'win' : 'lose');
        }
      }, 1000);
    }
  };

  // Ensure we have at least one card with proper defaults and IDs
  const cards = config?.cards && config.cards.length > 0
    ? config.cards.map((card: any, index: number) => ({
        id: card.id || `card-${index + 1}`,
        color: card.color || '#E3C0B7',
        cover: card.cover,
        revealMessage: card.revealMessage || 'Félicitations !',
        revealImage: card.revealImage || '',
        scratchColor: card.scratchColor || '#C0C0C0'
      }))
    : [{ 
        id: 'card-1', 
        revealImage: config?.revealImage || '', 
        revealMessage: config?.revealMessage || 'Félicitations !',
        scratchColor: config?.scratchColor || '#C0C0C0',
        color: '#E3C0B7' // Default card color
      }];

  // ✅ INTERFACE DE DÉMARRAGE : respecte le funnel unlocked
  if (!gameStarted) {
    return (
      <div className="w-full h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Zone d'aperçu des cartes - prend tout l'espace disponible */}
        <div className="flex-1 w-full h-full">
          <ScratchGameGrid
            cards={cards}
            gameSize={gameSize}
            gameStarted={false}
            onCardFinish={() => {}}
            onCardSelect={() => {}}
            onScratchStart={() => {}}
            selectedCard={null}
            scratchStarted={false}
            config={config}
            isModal={isModal}
            prizes={prizes}
          />
        </div>

        {/* ✅ BOUTON DE DÉMARRAGE : respecte disabled pour le funnel */}
        <div className="flex-shrink-0 text-center py-8 px-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-800">Cartes à gratter</h3>
              <p className="text-gray-600">
                {disabled 
                  ? "Remplissez le formulaire pour commencer à jouer" 
                  : "Cliquez sur le bouton pour commencer à jouer"
                }
              </p>
            </div>
            
            <button
              onClick={handleGameStart}
              disabled={disabled}
              className="px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-lg"
              style={{
                backgroundColor: disabled ? '#6b7280' : buttonColor
              }}
            >
              {disabled ? 'Remplissez le formulaire' : buttonLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Zone de jeu - prend tout l'espace disponible */}
      <div className="flex-1 w-full h-full">
        <ScratchGameGrid
          cards={cards}
          gameSize={gameSize}
          gameStarted={gameStarted}
          onCardFinish={handleCardFinish}
          onCardSelect={handleCardSelect}
          onScratchStart={handleScratchStart}
          selectedCard={selectedCard}
          scratchStarted={scratchStarted}
          config={config}
          isModal={isModal}
          prizes={prizes}
        />
      </div>

      {/* Messages et instructions - en bas si nécessaire */}
      {!showResult && !isModal && (
        <div className="flex-shrink-0 py-4">
          {/* Contenu d'instruction si nécessaire */}
        </div>
      )}
    </div>
  );
};

export default ScratchPreview;
