
import React from 'react';
import { Palette } from 'lucide-react';
import ModernDesignTab from '../ModernDesignTab';

interface ContentStepProps {
  campaign: any;
  setCampaign: (updater: (prev: any) => any) => void;
  onNext?: () => void;
  onPrev?: () => void;
}

const ContentStep: React.FC<ContentStepProps> = ({
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
            <Palette className="w-6 h-6 mr-2 text-[#44444d]" />
            Design et contenu
          </h2>
          <p className="text-gray-600">Personnalisez l'apparence et le contenu de votre campagne</p>
        </div>

        {/* Contenu principal */}
        <div className="space-y-6">
          <ModernDesignTab
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

export default ContentStep;
