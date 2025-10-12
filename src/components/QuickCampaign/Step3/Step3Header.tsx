
import React from 'react';
import { Palette, Sparkles, ArrowLeft } from 'lucide-react';
import { useQuickCampaignStore } from '../../../stores/quickCampaignStore';

const Step3Header: React.FC = () => {
  const { setCurrentStep, campaignName } = useQuickCampaignStore();

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentStep(2)}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </button>
          
          <div className="h-8 w-px bg-gray-300" />
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Style Visuel</h1>
              <p className="text-gray-600">Personnalisez l'apparence de "{campaignName}"</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Étape 3/4</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Header;
