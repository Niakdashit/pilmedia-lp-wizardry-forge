// @ts-nocheck
import React, { useState, useEffect } from 'react';
import ScratchGameGrid from './ScratchGameGrid';
import { scratchDotationIntegration } from '@/services/ScratchDotationIntegration';

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
  // Dotation system props
  campaign?: any;
  participantEmail?: string;
  participantId?: string;
  useDotationSystem?: boolean;
}

const STORAGE_KEY = 'scratch_session_card';
const SCRATCH_STARTED_KEY = 'scratch_session_started';

const ScratchPreview: React.FC<ScratchPreviewProps> = ({
  config = {},
  onFinish,
  onStart,
  disabled = false,
  buttonLabel = 'Gratter',
  buttonColor = '#44444d',
  gameSize = 'medium',
  autoStart = false,
  isModal = false,
  campaign,
  participantEmail,
  participantId,
  useDotationSystem = true
}) => {
  // Utiliser scratchConfig de la campagne en priorité
  const scratchConfig = campaign?.scratchConfig || config;
  // ✅ LOGIQUE FUNNEL UNLOCKED : le jeu ne démarre que si disabled=false (formulaire validé)
  const [gameStarted, setGameStarted] = useState(false);
  const [finishedCards, setFinishedCards] = useState<Set<number>>(new Set());
  const [hasWon, setHasWon] = useState(false);
  const [showResult, setShowResult] = useState(false);
  // 🎯 Résultat du système de dotation
  const [dotationResult, setDotationResult] = useState<any>(null);
  const [dotationLoading, setDotationLoading] = useState(false);

  // Clear any previous session data on component mount to ensure fresh start
  useEffect(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SCRATCH_STARTED_KEY);
  }, []);

  // ✅ CORRECTION : Pas d'autostart si disabled=true (formulaire non validé)
  useEffect(() => {
    if (autoStart && !gameStarted && !disabled) {
      setGameStarted(true);
      if (onStart) onStart();
    }
  }, [autoStart, gameStarted, disabled, onStart]);

  const handleGameStart = async () => {
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
    
    // 🎯 Utiliser le système de dotation si activé
    if (useDotationSystem && campaign?.id && participantEmail) {
      setDotationLoading(true);
      try {
        console.log('🎴 [Scratch] Using dotation system');
        
        const totalCards = scratchConfig?.cards?.length || 3;
        const result = await scratchDotationIntegration.determineScratchResult(
          {
            campaignId: campaign.id,
            participantEmail,
            participantId,
            userAgent: navigator.userAgent
          },
          totalCards
        );
        
        setDotationResult(result);
        console.log('🎲 [Scratch] Dotation result:', result);
      } catch (error) {
        console.error('❌ [Scratch] Dotation error:', error);
        // En cas d'erreur, continuer sans dotation (mode aléatoire)
      } finally {
        setDotationLoading(false);
      }
    }
    
    setGameStarted(true);
    if (onStart) onStart();
  };

  const handleCardSelect = (index: number) => {
    // Mode multi-cartes grattables : pas de sélection nécessaire
    return;
  };

  const handleScratchStart = (index: number) => {
    // Mode multi-cartes grattables : toutes les cartes peuvent être grattées directement
    return;
  };

  const handleCardFinish = (result: 'win' | 'lose', cardIndex: number) => {
    const newFinishedCards = new Set([...finishedCards, cardIndex]);
    setFinishedCards(newFinishedCards);

    // 🎯 Si le système de dotation est actif, utiliser son résultat
    let actualResult = result;
    if (dotationResult) {
      const card = dotationResult.cards[cardIndex];
      actualResult = card?.isWinning ? 'win' : 'lose';
      console.log(`🎴 [Scratch] Card ${cardIndex} result from dotation:`, actualResult);
    }

    if (actualResult === 'win') {
      setHasWon(true);
    }

    const totalCards = scratchConfig?.cards?.length || 1;
    if (newFinishedCards.size >= totalCards) {
      setShowResult(true);
      setTimeout(() => {
        if (onFinish) {
          // Utiliser le résultat global de la dotation si disponible
          const finalResult = dotationResult ? (dotationResult.shouldWin ? 'win' : 'lose') : (hasWon || actualResult === 'win' ? 'win' : 'lose');
          console.log(`🎴 [Scratch] Final result:`, finalResult);
          onFinish(finalResult);
        }
      }, 1000);
    }
  };

  // Ensure we have at least one card with proper defaults
  const configuredCards = Array.isArray(scratchConfig?.cards) ? scratchConfig.cards : [];
  const maxCards = typeof scratchConfig?.maxCards === 'number' ? scratchConfig.maxCards : configuredCards.length;
  const cards = configuredCards.length > 0
    ? configuredCards.slice(0, Math.max(1, maxCards || configuredCards.length))
    : [{
        id: 1,
        revealImage: scratchConfig?.revealImage || '',
        revealMessage: scratchConfig?.revealMessage || 'Félicitations !',
        scratchColor: scratchConfig?.scratchColor || '#C0C0C0'
      }];

  // ✅ INTERFACE DE DÉMARRAGE : respecte le funnel unlocked
  const borderConfig = scratchConfig?.grid?.border;

  const getWrapperStyles = (base: React.CSSProperties) => {
    if (!borderConfig) return base;

    const { type, color, width } = borderConfig;

    if (type === 'external') {
      return {
        ...base,
        border: `${width}px solid ${color}`
      };
    }

    // Interne : cadre à l'intérieur
    return {
      ...base,
      boxShadow: `inset 0 0 0 ${width}px ${color}`
    };
  };

  if (!gameStarted) {
    return (
      <div
        className="w-full h-full flex flex-col"
        style={getWrapperStyles({
          background:
            scratchConfig?.globalCover?.type === 'color'
              ? scratchConfig.globalCover.value
              : 'linear-gradient(to bottom right, rgb(249, 250, 251), rgb(243, 244, 246))'
        })}
      >
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
            config={scratchConfig}
            isModal={isModal}
            gridConfig={scratchConfig?.grid}
            maxCards={maxCards}
            allCardsScratching={true}
          />
        </div>

        {/* ✅ BOUTON DE DÉMARRAGE : respecte disabled pour le funnel */}
        <div className="flex-shrink-0 text-center py-8 px-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-800">Cartes à gratter</h3>
              <p className="text-gray-600">
                {disabled
                  ? 'Remplissez le formulaire pour commencer à jouer'
                  : 'Cliquez sur le bouton pour commencer à jouer'}
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
    <div
      className="w-full h-full flex flex-col"
      style={getWrapperStyles({
        background:
          scratchConfig?.globalCover?.type === 'color'
            ? scratchConfig.globalCover.value
            : 'linear-gradient(to bottom right, rgb(249, 250, 251), rgb(243, 244, 246))'
      })}
    >
      {/* Zone de jeu - prend tout l'espace disponible */}
      <div className="flex-1 w-full h-full">
        <ScratchGameGrid
          cards={cards}
          gameSize={gameSize}
          gameStarted={gameStarted}
          onCardFinish={handleCardFinish}
          onCardSelect={handleCardSelect}
          onScratchStart={handleScratchStart}
          selectedCard={null}
          scratchStarted={true}
          config={scratchConfig}
          isModal={isModal}
          gridConfig={scratchConfig?.grid}
          maxCards={maxCards}
          allCardsScratching={true}
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
