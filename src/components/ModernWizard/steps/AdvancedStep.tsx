
import React from 'react';
import { WizardData } from '../ModernWizard';
import { Palette, Type, Calendar, Target } from 'lucide-react';

interface AdvancedStepProps {
  wizardData: WizardData;
  updateWizardData: (data: Partial<WizardData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const AdvancedStep: React.FC<AdvancedStepProps> = ({
  wizardData,
  updateWizardData,
  nextStep,
  prevStep
}) => {
  return (
    <div className="space-y-6">
      {/* Main Content Card */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-100/50">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#141e29] mb-3">
            Personnalisation avancée
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-2xl">
            Ajustez chaque détail de votre campagne selon vos préférences.
          </p>
        </div>

        {/* Customization Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Visual Customization */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-[#951b6d]/10 rounded-lg flex items-center justify-center">
                <Palette className="w-4 h-4 text-[#951b6d]" />
              </div>
              <h3 className="font-semibold text-[#141e29]">Style visuel</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[#141e29] text-sm font-medium mb-3">Couleur principale</label>
                <div className="flex space-x-3">
                  {['#951b6d', '#2563eb', '#059669', '#dc2626', '#7c3aed'].map((color) => (
                    <button
                      key={color}
                      className="w-12 h-12 rounded-xl border-2 border-gray-200 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-[#141e29] text-sm font-medium mb-3">Style des bordures</label>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-sm hover:bg-[#841b60] hover:text-white">Arrondies</button>
                  <button className="px-4 py-2 bg-gray-50 border border-gray-200 rounded text-gray-700 text-sm hover:bg-[#841b60] hover:text-white">Droites</button>
                  <button className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 text-sm hover:bg-[#841b60] hover:text-white">Très arrondies</button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Customization */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-[#951b6d]/10 rounded-lg flex items-center justify-center">
                <Type className="w-4 h-4 text-[#951b6d]" />
              </div>
              <h3 className="font-semibold text-[#141e29]">Contenu</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[#141e29] text-sm font-medium mb-2">Titre principal</label>
                <input
                  type="text"
                  value={wizardData.generatedCampaign?.title || ''}
                  onChange={(e) => updateWizardData({
                    generatedCampaign: {
                      ...wizardData.generatedCampaign,
                      title: e.target.value
                    }
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[#141e29] focus:outline-none focus:border-[#951b6d] transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-[#141e29] text-sm font-medium mb-2">Description</label>
                <textarea
                  value={wizardData.generatedCampaign?.description || ''}
                  onChange={(e) => updateWizardData({
                    generatedCampaign: {
                      ...wizardData.generatedCampaign,
                      description: e.target.value
                    }
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[#141e29] focus:outline-none focus:border-[#951b6d] h-24 resize-none transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-[#141e29] text-sm font-medium mb-2">Bouton d'action</label>
                <input
                  type="text"
                  value={wizardData.generatedCampaign?.cta || ''}
                  onChange={(e) => updateWizardData({
                    generatedCampaign: {
                      ...wizardData.generatedCampaign,
                      cta: e.target.value
                    }
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[#141e29] focus:outline-none focus:border-[#951b6d] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Campaign Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-[#951b6d]/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-[#951b6d]" />
              </div>
              <h3 className="font-semibold text-[#141e29]">Planification</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#141e29] text-sm font-medium mb-2">Date de début</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[#141e29] focus:outline-none focus:border-[#951b6d] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#141e29] text-sm font-medium mb-2">Date de fin</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[#141e29] focus:outline-none focus:border-[#951b6d] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Game Configuration */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-[#951b6d]/10 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-[#951b6d]" />
              </div>
              <h3 className="font-semibold text-[#141e29]">Configuration du jeu</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[#141e29] text-sm font-medium mb-3">Nombre de participants max</label>
                <div className="flex space-x-3">
                  {['100', '500', '1000', '∞'].map((limit) => (
                    <button
                      key={limit}
                      className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-sm hover:bg-[#951b6d] hover:text-white transition-colors"
                    >
                      {limit}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-[#141e29] text-sm font-medium mb-3">Probabilités de gain</label>
                <input
                  type="range"
                  min="10"
                  max="90"
                  defaultValue="50"
                  className="w-full accent-[#951b6d]"
                />
                <div className="flex justify-between text-gray-500 text-xs mt-1">
                  <span>Rare</span>
                  <span>Fréquent</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-[#841b60] hover:text-white transition-colors"
          >
            Retour
          </button>
          <button
            onClick={nextStep}
            className="px-8 py-3 bg-[#951b6d] text-white font-semibold rounded-xl hover:bg-[#7d1659] transition-colors shadow-sm hover:shadow-md"
          >
            Publier ma campagne
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedStep;
