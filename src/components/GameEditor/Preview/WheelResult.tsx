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
        <div 
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: result.color }}
        >
          <span className="text-white font-bold text-lg">🎉</span>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Félicitations !
        </h3>
        
        <p className="text-lg text-gray-600 mb-4">
          Vous avez gagné :
        </p>
        
        <div 
          className="text-xl font-bold px-4 py-2 rounded-lg text-white inline-block"
          style={{ backgroundColor: result.color }}
        >
          {result.label}
        </div>
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
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-md hover:from-purple-700 hover:to-pink-700 transition-colors"
        >
          Rejouer
        </button>
      </div>
    </div>
  );
};

export default WheelResult;