
import React from 'react';
import { Settings } from 'lucide-react';
import ModernGeneralTab from '../ModernGeneralTab';

interface SetupStepProps {
  campaign: any;
  setCampaign: (updater: (prev: any) => any) => void;
  onNext?: () => void;
}

const SetupStep: React.FC<SetupStepProps> = ({
  campaign,
  setCampaign,
  onNext
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
            <Settings className="w-6 h-6 mr-2 text-[#841b60]" />
            Configuration générale
          </h2>
          <p className="text-gray-600">Définissez les paramètres de base de votre campagne</p>
        </div>

        {/* Configuration générale */}
        <div className="space-y-6">
          <ModernGeneralTab
            campaign={campaign}
            setCampaign={setCampaign}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            onClick={onNext}
            className="px-8 py-3 bg-gradient-to-r from-[#841b60] to-[#6d164f] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupStep;
