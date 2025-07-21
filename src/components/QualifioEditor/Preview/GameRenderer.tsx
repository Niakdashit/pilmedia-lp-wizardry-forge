import React from 'react';
import type { DeviceType, EditorConfig } from '../QualifioEditorLayout';
import WheelContainer from './WheelContainer';
import { Jackpot } from '../../GameTypes';
import ScratchPreview from '../../GameTypes/ScratchPreview';
import DicePreview from '../../GameTypes/DicePreview';
import QuizPreview from '../../GameTypes/QuizPreview';
import MemoryPreview from '../../GameTypes/MemoryPreview';
import PuzzlePreview from '../../GameTypes/PuzzlePreview';
import FormPreview from '../../GameTypes/FormPreview';

interface GameRendererProps {
  gameType: EditorConfig['gameType'];
  config: EditorConfig;
  device: DeviceType;
  onResult?: (result: any) => void;
  isMode1?: boolean;
}

const GameRenderer: React.FC<GameRendererProps> = ({
  gameType,
  config,
  device,
  onResult,
  isMode1 = false
}) => {
  // Récupérer les paramètres de position et d'échelle pour le device actuel
  const gamePosition = config.deviceConfig?.[device]?.gamePosition || {
    x: 0,
    y: 0,
    scale: 1.0
  };

  // Calculer les styles de transformation pour tous les devices
  const getGameContainerStyle = (): React.CSSProperties => {
    const getMinHeight = () => {
      switch (device) {
        case 'desktop': return '400px';
        default: return '400px';
      }
    };
    
    const getPadding = () => {
      switch (device) {
        case 'desktop': return '32px';
        default: return '24px';
      }
    };

    // Base style avec centrage parfait
    const baseStyle: React.CSSProperties = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      minHeight: getMinHeight(),
      padding: getPadding(),
      boxSizing: 'border-box',
      position: 'relative'
    };

    // Pour mobile et tablette en Mode 2, ajouter les transformations de position
    if ((device === 'mobile' || device === 'tablet') && !isMode1) {
      return {
        ...baseStyle,
        zIndex: 2,
        overflow: 'hidden'
      };
    }

    // Pour desktop ou Mode 1, utiliser la logique de positionnement existante
    return {
      ...baseStyle,
      transform: `translate(${gamePosition.x}%, ${gamePosition.y}%)`,
      transformOrigin: 'center center',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    };
  };

  // Style pour le contenu du jeu qui applique les transformations sur mobile/tablette
  const getGameContentStyle = (): React.CSSProperties => {
    // Sur mobile/tablette en Mode 2, appliquer les transformations au contenu
    if ((device === 'mobile' || device === 'tablet') && !isMode1) {
      return {
        transform: `translate(${gamePosition.x}%, ${gamePosition.y}%)`,
        transformOrigin: 'center center',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      };
    }
    // Sinon, pas de transformation supplémentaire
    return {};
  };

  const renderGameComponent = () => {
    // Récupérer les couleurs de la marque si disponibles
    const brandColors = config.brandAssets || {};
    const primaryColor = brandColors.primaryColor || config.participateButtonColor || '#841b60';
    const secondaryColor = brandColors.secondaryColor || '#ffffff';

    switch (gameType) {
      case 'wheel':
        return <WheelContainer device={device} config={config} isMode1={isMode1} isVisible={true} onResult={onResult} scale={gamePosition.scale} />;
      case 'jackpot':
        return <Jackpot 
          isPreview={true} 
          buttonLabel="Lancer le Jackpot" 
          buttonColor={primaryColor} 
          backgroundColor={config.jackpotBackgroundColor || '#f3f4f6'} 
          borderStyle={config.jackpotBorderStyle || 'classic'} 
          slotBorderColor={secondaryColor} 
          slotBorderWidth={2} 
          slotBackgroundColor={secondaryColor} 
          containerBackgroundColor="#1f2937" 
          onStart={() => console.log('Jackpot started')} 
          onFinish={result => {
            console.log('Jackpot finished:', result);
            onResult?.(result);
          }} 
          disabled={false} 
        />;
      case 'scratch':
        return <ScratchPreview config={{
          cards: config.scratchCards?.map((card, index) => ({
            id: index + 1,
            revealMessage: card.content || 'Félicitations !',
            revealImage: '',
            scratchColor: config.scratchSurfaceColor || '#C0C0C0',
            isWinning: card.isWinning || false
          })) || [{
            id: 1,
            revealMessage: 'Félicitations !',
            revealImage: '',
            scratchColor: config.scratchSurfaceColor || '#C0C0C0',
            isWinning: true
          }],
          scratchColor: config.scratchSurfaceColor || '#C0C0C0'
        }} onFinish={result => {
          console.log('Scratch finished:', result);
          onResult?.(result);
        }} onStart={() => console.log('Scratch started')} disabled={false} buttonLabel="Gratter" buttonColor={primaryColor} gameSize="medium" autoStart={false} isModal={false} />;
      case 'dice':
        return <DicePreview config={{
          diceCount: 2,
          winningConditions: config.diceWinningNumbers || [7, 11],
          winMessage: 'Vous avez gagné !',
          loseMessage: 'Dommage, réessayez !',
          diceColor: primaryColor
        }} />;
      case 'quiz':
        return <QuizPreview config={{
          questions: config.quizQuestions?.map((q, index) => ({
            id: index + 1,
            text: q.question,
            type: 'single',
            options: q.options?.map((option: string, optIndex: number) => ({
              id: optIndex + 1,
              text: option,
              isCorrect: optIndex === q.correctAnswer
            })) || []
          })) || [{
            id: 1,
            text: 'Question d\'exemple',
            type: 'single',
            options: [{
              id: 1,
              text: 'Option 1',
              isCorrect: true
            }, {
              id: 2,
              text: 'Option 2',
              isCorrect: false
            }]
          }],
          passingScore: config.quizPassingScore || 70
        }} design={{
          primaryColor: primaryColor,
          backgroundColor: secondaryColor,
          titleColor: '#1f2937',
          textColor: '#374151'
        }} />;
      case 'memory':
        return <MemoryPreview config={{
          pairs: config.memoryPairs?.map((pair: any) => ({
            id: pair.id,
            image: pair.image1 || '❓',
            pairId: pair.id
          })) || [{
            id: '1',
            image: '🎯',
            pairId: '1'
          }, {
            id: '2',
            image: '⭐',
            pairId: '2'
          }],
          gridSize: config.memoryGridSize || '4x3',
          timeLimit: config.memoryTimeLimit || 60,
          cardBackColor: primaryColor
        }} />;
      case 'puzzle':
        return <PuzzlePreview config={{
          image: config.puzzleImage,
          pieces: config.puzzlePieces || 9,
          timeLimit: config.puzzleTimeLimit || 120,
          showPreview: config.puzzleShowPreview !== false,
          difficulty: config.puzzleDifficulty || 'medium',
          backgroundColor: config.puzzleBackgroundColor || '#f0f0f0'
        }} />;
      case 'form':
        // En Mode 1, le formulaire est géré par ContentArea, donc on affiche un message
        if (isMode1) {
          return <div className="text-center p-8 bg-green-50 rounded-lg">
              <div className="text-green-600 mb-4">
                <div className="text-4xl mb-2">✅</div>
                <h3 className="text-lg font-medium">Formulaire prêt</h3>
                <p className="text-sm mt-2">
                  Le formulaire sera affiché après avoir cliqué sur "Participer"
                </p>
              </div>
            </div>;
        }
        return <FormPreview campaign={{
          formFields: config.formFields || [{
            id: '1',
            label: 'Nom',
            type: 'text',
            required: true
          }, {
            id: '2',
            label: 'Email',
            type: 'email',
            required: true
          }],
          design: {
            buttonColor: primaryColor,
            buttonTextColor: secondaryColor,
            borderColor: '#E5E7EB',
            blockColor: secondaryColor,
            borderRadius: '16px'
          }
        }} gameSize="medium" />;
      default:
        return <div className="text-center p-8 bg-gray-50 rounded-lg">
            <div className="text-gray-500 mb-4">
              <div className="text-4xl mb-2">🎮</div>
              <h3 className="text-lg font-medium">Mécanique non prise en charge</h3>
              <p className="text-sm mt-2">
                Le type de jeu "{gameType}" n'est pas encore disponible dans l'aperçu
              </p>
            </div>
          </div>;
    }
  };

  return (
    <div style={getGameContainerStyle()} className="game-container">
      <div style={getGameContentStyle()}>
        {renderGameComponent()}
      </div>
    </div>
  );
};

export default GameRenderer;
