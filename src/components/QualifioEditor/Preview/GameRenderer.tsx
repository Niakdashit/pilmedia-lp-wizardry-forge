import React from 'react';
import type { DeviceType, EditorConfig } from '../QualifioEditorLayout';
import WheelContainer from './WheelContainer';

// Composants de jeu temporaires (à remplacer par les vrais composants)
const QuizGame: React.FC<{ config: EditorConfig; device: DeviceType; onResult?: (result: any) => void }> = ({ config }) => (
  <div className="text-center p-8 bg-blue-50 rounded-lg">
    <h3 className="text-xl font-bold mb-4">Quiz Game</h3>
    <p className="text-gray-600 mb-4">Questions : {config.quizQuestions?.length || 1}</p>
    <p className="text-gray-600">Score minimum : {config.quizPassingScore || 70}%</p>
    <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg">
      Commencer le Quiz
    </button>
  </div>
);

const ScratchGame: React.FC<{ config: EditorConfig; device: DeviceType; onResult?: (result: any) => void }> = ({ config }) => (
  <div className="text-center p-8 bg-yellow-50 rounded-lg">
    <h3 className="text-xl font-bold mb-4">Carte à Gratter</h3>
    <div 
      className="w-48 h-32 mx-auto rounded-lg flex items-center justify-center text-white font-bold"
      style={{ backgroundColor: config.scratchSurfaceColor || '#C0C0C0' }}
    >
      Grattez ici !
    </div>
    <p className="text-gray-600 mt-4">
      Grattez {config.scratchPercentage || 30}% de la surface
    </p>
  </div>
);

const JackpotGame: React.FC<{ config: EditorConfig; device: DeviceType; onResult?: (result: any) => void }> = ({ config }) => (
  <div className="text-center p-8 bg-purple-50 rounded-lg">
    <h3 className="text-xl font-bold mb-4">Machine à Sous</h3>
    <div className="flex justify-center gap-2 mb-4">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl border-2"
          style={{ 
            backgroundColor: config.jackpotBackgroundColor || '#1a1a2e',
            borderColor: config.jackpotBorderColor || '#ffd700',
            color: 'white'
          }}
        >
          {config.jackpotSymbols?.[0] || '🍒'}
        </div>
      ))}
    </div>
    <button className="px-6 py-2 bg-purple-500 text-white rounded-lg">
      Jouer
    </button>
  </div>
);

const DiceGame: React.FC<{ config: EditorConfig; device: DeviceType; onResult?: (result: any) => void }> = ({ config }) => (
  <div className="text-center p-8 bg-green-50 rounded-lg">
    <h3 className="text-xl font-bold mb-4">Jeu de Dés</h3>
    <div 
      className="w-16 h-16 mx-auto rounded-lg flex items-center justify-center text-2xl font-bold border-2"
      style={{ 
        backgroundColor: config.diceColor || '#ffffff',
        color: config.diceDotColor || '#000000',
        borderColor: '#ccc'
      }}
    >
      ⚀
    </div>
    <p className="text-gray-600 mt-4">
      Dé à {config.diceSides || 6} faces
    </p>
    <p className="text-sm text-gray-500">
      Numéros gagnants : {config.diceWinningNumbers?.join(', ') || '6'}
    </p>
    <button className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg">
      Lancer le Dé
    </button>
  </div>
);

const MemoryGame: React.FC<{ config: EditorConfig; device: DeviceType; onResult?: (result: any) => void }> = ({ config }) => (
  <div className="text-center p-8 bg-pink-50 rounded-lg">
    <h3 className="text-xl font-bold mb-4">Memory</h3>
    <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto mb-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="w-12 h-12 rounded flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: config.memoryCardBackColor || '#3b82f6' }}
        >
          ?
        </div>
      ))}
    </div>
    <p className="text-gray-600">
      Grille : {config.memoryGridSize || '4x3'}
    </p>
    <p className="text-gray-600">
      Temps : {config.memoryTimeLimit || 60}s
    </p>
    <button className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-lg">
      Commencer
    </button>
  </div>
);

const PuzzleGame: React.FC<{ config: EditorConfig; device: DeviceType; onResult?: (result: any) => void }> = ({ config }) => (
  <div className="text-center p-8 bg-orange-50 rounded-lg">
    <h3 className="text-xl font-bold mb-4">Puzzle</h3>
    {config.puzzleImage ? (
      <div className="w-48 h-32 mx-auto mb-4 rounded-lg overflow-hidden">
        <img 
          src={config.puzzleImage} 
          alt="Puzzle" 
          className="w-full h-full object-cover"
        />
      </div>
    ) : (
      <div className="w-48 h-32 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Image du puzzle</span>
      </div>
    )}
    <p className="text-gray-600">
      {config.puzzlePieces || 9} pièces
    </p>
    <p className="text-gray-600">
      Temps : {config.puzzleTimeLimit || 120}s
    </p>
    <button className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg">
      Commencer le Puzzle
    </button>
  </div>
);

const FormGame: React.FC<{ config: EditorConfig; device: DeviceType; onResult?: (result: any) => void }> = ({ config }) => (
  <div className="text-center p-8 bg-gray-50 rounded-lg">
    <h3 className="text-xl font-bold mb-4">{config.formTitle || 'Formulaire de participation'}</h3>
    <div className="space-y-3 max-w-sm mx-auto">
      {(config.formFields || []).slice(0, 3).map((field, index) => (
        <div key={index} className="text-left">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && '*'}
          </label>
          {field.type === 'textarea' ? (
            <textarea 
              placeholder={field.placeholder}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              rows={2}
            />
          ) : field.type === 'select' ? (
            <select className="w-full p-2 border border-gray-300 rounded text-sm">
              <option value="">Sélectionnez...</option>
              {field.options?.map((option, i) => (
                <option key={i} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            <input 
              type={field.type}
              placeholder={field.placeholder}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            />
          )}
        </div>
      ))}
      {(config.formFields?.length || 0) > 3 && (
        <p className="text-xs text-gray-500">
          ... et {(config.formFields?.length || 0) - 3} autres champs
        </p>
      )}
    </div>
    <button className="mt-4 px-6 py-2 bg-gray-700 text-white rounded-lg">
      Valider
    </button>
  </div>
);

interface GameRendererProps {
  gameType: EditorConfig['gameType'];
  config: EditorConfig;
  device: DeviceType;
  onResult?: (result: any) => void;
}

const GameRenderer: React.FC<GameRendererProps> = ({ gameType, config, device, onResult }) => {
  switch (gameType) {
    case 'wheel':
      return (
        <WheelContainer 
          device={device} 
          config={config} 
          isMode1={true} 
          isVisible={true} 
          onResult={onResult} 
        />
      );
    case 'quiz':
      return <QuizGame config={config} device={device} onResult={onResult} />;
    case 'scratch':
      return <ScratchGame config={config} device={device} onResult={onResult} />;
    case 'jackpot':
      return <JackpotGame config={config} device={device} onResult={onResult} />;
    case 'dice':
      return <DiceGame config={config} device={device} onResult={onResult} />;
    case 'memory':
      return <MemoryGame config={config} device={device} onResult={onResult} />;
    case 'puzzle':
      return <PuzzleGame config={config} device={device} onResult={onResult} />;
    case 'form':
      return <FormGame config={config} device={device} onResult={onResult} />;
    default:
      return <div className="text-center p-8 text-gray-500">Mécanique non prise en charge</div>;
  }
};

export default GameRenderer;