
import React from 'react';
import { Gamepad2 } from 'lucide-react';
import ModernGameTab from '../ModernGameTab';

interface GameStepProps {
  campaign: any;
  setCampaign: (updater: (prev: any) => any) => void;
  onNext?: () => void;
  onPrev?: () => void;
}

const GameStep: React.FC<GameStepProps> = ({
  campaign,
  setCampaign,
  onNext,
  onPrev
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
            <Gamepad2 className="w-6 h-6 mr-2 text-[#44444d]" />
            Configuration du jeu
          </h2>
          <p className="text-gray-600">Configurez les paramètres et l'apparence de votre jeu</p>
        </div>

        {/* Configuration du jeu */}
        <div className="space-y-6">
          <ModernGameTab
            campaign={campaign}
            setCampaign={setCampaign}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            onClick={onPrev}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Précédent
          </button>
          <button
            onClick={onNext}
            className="px-8 py-3 bg-gradient-to-r from-[#44444d] to-[#6d164f] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameStep;
