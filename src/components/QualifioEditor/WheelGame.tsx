import React, { useState } from 'react';
import { SmartWheel } from '../SmartWheel';
import { X } from 'lucide-react';

interface WheelGameProps {
  campaign: any;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
}

interface FormData {
  name: string;
  email: string;
  phone?: string;
}

const WheelGame: React.FC<WheelGameProps> = ({ campaign, previewDevice }) => {
  const gameMode = campaign.game?.mode || 'mode1';
  const [gameState, setGameState] = useState<'home' | 'form' | 'wheel' | 'result'>(gameMode === 'mode2' ? 'wheel' : 'home');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', phone: '' });
  const [wheelResult, setWheelResult] = useState<string>('');
  const [isSpinning, setIsSpinning] = useState(false);
  const segments = (campaign.game?.wheelSegments || [
    { id: '1', label: 'Prix 1', color: '#ff6b6b' },
    { id: '2', label: 'Prix 2', color: '#4ecdc4' },
    { id: '3', label: 'Prix 3', color: '#45b7d1' },
    { id: '4', label: 'Essayez encore', color: '#feca57' }
  ]).map((segment: any, index: number) => ({
    id: segment.id || index.toString(),
    label: segment.label,
    color: segment.color,
    textColor: '#ffffff'
  }));

  const getWheelSize = () => {
    if (gameMode === 'mode2') {
      // Tailles plus grandes pour mode 2 (dans la bannière)
      switch (previewDevice) {
        case 'mobile': return 200;
        case 'tablet': return 280;
        case 'desktop': return 350;
        default: return 280;
      }
    } else {
      // Tailles normales pour mode 1
      switch (previewDevice) {
        case 'mobile': return 180;
        case 'tablet': return 220;
        case 'desktop': return 280;
        default: return 220;
      }
    }
  };

  const getModalSize = () => {
    switch (previewDevice) {
      case 'mobile': return 'w-80 max-w-[90vw]';
      case 'tablet': return 'w-96';
      case 'desktop': return 'w-[500px]';
      default: return 'w-96';
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (gameMode === 'mode1') {
      setGameState('wheel');
    } else {
      setShowModal(false);
    }
  };

  const handleWheelResult = (segment: any) => {
    setWheelResult(segment.label);
    setIsSpinning(false);
    setTimeout(() => setGameState('result'), 1000);
  };

  const handleWheelSpin = () => {
    if (gameMode === 'mode2' && !formData.name) {
      setShowModal(true);
      return;
    }
    setIsSpinning(true);
  };

  const resetGame = () => {
    setGameState(gameMode === 'mode2' ? 'wheel' : 'home');
    setFormData({ name: '', email: '', phone: '' });
    setWheelResult('');
    setIsSpinning(false);
    setShowModal(false);
  };

  const ContactForm = ({ onClose }: { onClose?: () => void }) => (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nom complet *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Téléphone
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-2 px-4 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all transform hover:scale-105"
        >
          Valider
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );

  // Mode 1: Page d'accueil → Formulaire → Roue → Résultat
  if (gameMode === 'mode1') {
    if (gameState === 'home') {
      return (
        <div className="text-center space-y-6">
          <div className="text-gray-800 leading-relaxed mb-6" style={{ whiteSpace: 'pre-wrap' }}>
            {campaign.content?.text || 'Tentez votre chance à notre jeu de la roue de la fortune !'}
          </div>
          <button 
            onClick={() => setGameState('form')}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-red-700 transition-all shadow-lg transform hover:scale-105"
          >
            {campaign.prize?.buttonText || 'PARTICIPER !'}
          </button>
        </div>
      );
    }

    if (gameState === 'form') {
      return (
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
            Formulaire de participation
          </h3>
          <ContactForm />
        </div>
      );
    }

    if (gameState === 'wheel') {
      return (
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <SmartWheel
              segments={segments}
              size={getWheelSize()}
              onResult={handleWheelResult}
              onSpin={handleWheelSpin}
              disabled={isSpinning}
              customButton={{
                text: 'FAIRE TOURNER',
                color: 'linear-gradient(135deg, #f97316, #dc2626)',
                textColor: '#ffffff'
              }}
            />
          </div>
        </div>
      );
    }

    if (gameState === 'result') {
      return (
        <div className="text-center space-y-6">
          <div className="bg-green-100 border border-green-300 rounded-lg p-6">
            <h3 className="text-xl font-bold text-green-800 mb-2">
              Félicitations !
            </h3>
            <p className="text-green-700">
              Vous avez obtenu : <strong>{wheelResult}</strong>
            </p>
          </div>
          <button
            onClick={resetGame}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Rejouer
          </button>
        </div>
      );
    }
  }

  // Mode 2: Roue visible avec modal formulaire
  if (gameMode === 'mode2') {
    if (gameState === 'result') {
      return (
        <div className="space-y-6">
          <div className="flex justify-center">
            <SmartWheel
              segments={segments}
              size={getWheelSize()}
              disabled={true}
            />
          </div>
          <div className="text-center">
            <div className="bg-green-100 border border-green-300 rounded-lg p-6 mb-4">
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Félicitations !
              </h3>
              <p className="text-green-700">
                Vous avez obtenu : <strong>{wheelResult}</strong>
              </p>
            </div>
            <button
              onClick={resetGame}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Rejouer
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="text-center">
          <SmartWheel
            segments={segments}
            size={getWheelSize()}
            onResult={handleWheelResult}
            onSpin={handleWheelSpin}
            disabled={isSpinning}
            customButton={{
              text: 'Cliquez sur le bouton central pour faire tourner la roue !',
              color: 'linear-gradient(135deg, #f97316, #dc2626)',
              textColor: '#ffffff'
            }}
          />
        </div>

        {/* Modal formulaire */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`bg-white rounded-lg p-6 ${getModalSize()}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  Formulaire de participation
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <ContactForm onClose={() => setShowModal(false)} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default WheelGame;