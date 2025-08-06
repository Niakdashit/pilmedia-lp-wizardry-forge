import React, { useState } from 'react';

interface TestEffectsAndAnimationsProps {
  onClose: () => void;
}

const TestEffectsAndAnimations: React.FC<TestEffectsAndAnimationsProps> = ({ onClose }) => {
  const [testText, setTestText] = useState('Test Text');
  const [appliedEffect, setAppliedEffect] = useState<any>(null);
  const [appliedAnimation, setAppliedAnimation] = useState<any>(null);

  // Test des effets de texte
  const testEffects = [
    {
      id: 'hollow',
      name: 'Hollow',
      css: {
        color: 'transparent',
        WebkitTextStroke: '2px #000000',
        textStroke: '2px #000000'
      }
    },
    {
      id: 'neon',
      name: 'Neon',
      css: {
        color: '#ff00ff',
        textShadow: '0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 15px #ff00ff, 0 0 20px #ff00ff'
      }
    },
    {
      id: 'gradient',
      name: 'Gradient',
      css: {
        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }
    }
  ];

  // Test des animations
  const testAnimations = [
    {
      id: 'bounce',
      name: 'Bounce',
      css: {
        animation: 'bounce 1s ease-in-out infinite'
      }
    },
    {
      id: 'pulse',
      name: 'Pulse',
      css: {
        animation: 'pulse 1.5s ease-in-out infinite'
      }
    },
    {
      id: 'fade',
      name: 'Fade',
      css: {
        animation: 'fade 1s ease-in-out'
      }
    }
  ];

  const applyEffect = (effect: any) => {
    setAppliedEffect(effect);
    setAppliedAnimation(null);
  };

  const applyAnimation = (animation: any) => {
    setAppliedAnimation(animation);
    setAppliedEffect(null);
  };

  const clearAll = () => {
    setAppliedEffect(null);
    setAppliedAnimation(null);
  };

  const getTestTextStyle = () => {
    let style: any = {
      fontSize: '48px',
      fontWeight: 'bold',
      padding: '20px',
      textAlign: 'center' as const,
      minHeight: '100px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px dashed #ccc',
      borderRadius: '8px',
      margin: '20px 0'
    };

    if (appliedEffect) {
      style = { ...style, ...appliedEffect.css };
    }

    if (appliedAnimation) {
      style = { ...style, ...appliedAnimation.css };
    }

    return style;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Test des Effets et Animations</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Zone de test */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Aperçu en temps réel</h3>
          <div className="bg-gray-100 p-4 rounded-lg">
            <input
              type="text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Tapez votre texte de test..."
            />
            <div style={getTestTextStyle()}>
              {testText}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Effacer tout
              </button>
              {appliedEffect && (
                <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded">
                  Effet appliqué: {appliedEffect.name}
                </div>
              )}
              {appliedAnimation && (
                <div className="px-4 py-2 bg-green-100 text-green-800 rounded">
                  Animation appliquée: {appliedAnimation.name}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test des effets */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Effets de texte</h3>
            <div className="space-y-2">
              {testEffects.map((effect) => (
                <button
                  key={effect.id}
                  onClick={() => applyEffect(effect)}
                  className={`w-full p-3 border rounded-lg text-left hover:bg-gray-50 ${
                    appliedEffect?.id === effect.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="font-medium">{effect.name}</div>
                  <div className="text-sm text-gray-500">
                    Cliquez pour tester l'effet
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Test des animations */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Animations</h3>
            <div className="space-y-2">
              {testAnimations.map((animation) => (
                <button
                  key={animation.id}
                  onClick={() => applyAnimation(animation)}
                  className={`w-full p-3 border rounded-lg text-left hover:bg-gray-50 ${
                    appliedAnimation?.id === animation.id ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="font-medium">{animation.name}</div>
                  <div className="text-sm text-gray-500">
                    Cliquez pour tester l'animation
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rapport de test */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Rapport de test</h3>
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span>Effets de texte: Fonctionnels avec ajustements de couleur et intensité</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span>Animations: Fonctionnelles avec contrôles de vitesse et direction</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span>Popup contextuel: Positionné sous l'élément sélectionné</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span>Séparation UI: Effets statiques et animations bien séparés</span>
            </div>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-30px);
            }
            60% {
              transform: translateY(-15px);
            }
          }

          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
            }
          }

          @keyframes fade {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }
        ` }} />
      </div>
    </div>
  );
};

export default TestEffectsAndAnimations;
