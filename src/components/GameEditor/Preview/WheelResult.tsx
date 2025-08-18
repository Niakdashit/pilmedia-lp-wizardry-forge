import React from 'react';

interface WheelResultProps {
  result: {
    id: string;
    label: string;
    color: string;
  };
  onPlayAgain: () => void;
}

const WheelResult: React.FC<WheelResultProps> = ({ result, onPlayAgain }) => {
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Félicitations !
        </h3>
        <p className="text-lg text-gray-600 mb-4">
          Vous avez gagné : <span className="font-semibold text-gray-800">{result.label}</span>
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          Merci d'avoir participé à notre jeu ! 
          {result.label !== 'Dommage' && (
            <span className="block mt-2 font-medium">
              Vous recevrez un email de confirmation sous peu.
            </span>
          )}
        </p>
        
        <button
          onClick={onPlayAgain}
          className="w-full px-6 py-3 text-white font-semibold rounded-md transition-colors"
          style={{ backgroundColor: result.color }}
        >
          Rejouer
        </button>
      </div>
    </div>
  );
};

export default WheelResult;