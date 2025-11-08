
import React, { useState } from 'react';
import { Type, MessageSquare, Edit3 } from 'lucide-react';

interface WordingStepProps {
  campaign: any;
  setCampaign: (updater: (prev: any) => any) => void;
  onNext?: () => void;
  onPrev?: () => void;
}

const WordingStep: React.FC<WordingStepProps> = ({
  campaign,
  setCampaign,
  onNext,
  onPrev
}) => {
  const [activeScreen, setActiveScreen] = useState<'welcome' | 'game' | 'result'>('welcome');

  const updateScreen = (screenId: string, field: string, value: any) => {
    setCampaign((prev: any) => ({
      ...prev,
      screens: {
        ...prev.screens,
        [screenId]: {
          ...prev.screens?.[screenId],
          [field]: value
        }
      }
    }));
  };

  const screens = {
    welcome: { id: '1', name: 'Écran d\'accueil', icon: MessageSquare },
    game: { id: '2', name: 'Pendant le jeu', icon: Edit3 },
    result: { id: '3', name: 'Écran de résultat', icon: Type }
  };

  const currentScreen = campaign.screens?.[screens[activeScreen].id] || {};

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
            <Type className="w-6 h-6 mr-2 text-[#E0004D]" />
            Textes et messages
          </h2>
          <p className="text-gray-600">Personnalisez les textes de votre campagne pour chaque étape</p>
        </div>

        {/* Sélection d'écran */}
        <div className="flex space-x-2 p-1 bg-gray-100 rounded-xl">
          {Object.entries(screens).map(([key, screen]) => {
            const Icon = screen.icon;
            return (
              <button
                key={key}
                onClick={() => setActiveScreen(key as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                  activeScreen === key
                    ? 'bg-white shadow-sm text-[#E0004D] font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{screen.name}</span>
              </button>
            );
          })}
        </div>

        {/* Configuration de l'écran actuel */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Titre principal</label>
                <input
                  type="text"
                  value={currentScreen.title || ''}
                  onChange={(e) => updateScreen(screens[activeScreen].id, 'title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E0004D] focus:border-transparent"
                  placeholder="Entrez le titre..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={currentScreen.description || ''}
                  onChange={(e) => updateScreen(screens[activeScreen].id, 'description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E0004D] focus:border-transparent resize-none"
                  placeholder="Entrez la description..."
                />
              </div>

              {activeScreen !== 'game' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Texte du bouton</label>
                  <input
                    type="text"
                    value={currentScreen.buttonText || ''}
                    onChange={(e) => updateScreen(screens[activeScreen].id, 'buttonText', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E0004D] focus:border-transparent"
                    placeholder="Texte du bouton..."
                  />
                </div>
              )}
            </div>

            {/* Aperçu */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Aperçu</h4>
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 space-y-4">
                {currentScreen.showTitle !== false && (
                  <h3 className="text-xl font-bold text-gray-900">
                    {currentScreen.title || 'Titre par défaut'}
                  </h3>
                )}
                {currentScreen.showDescription !== false && (
                  <p className="text-gray-600">
                    {currentScreen.description || 'Description par défaut...'}
                  </p>
                )}
                {activeScreen !== 'game' && (
                  <button className="px-6 py-2 bg-gradient-to-br from-[#E0004D] to-[#6B2AA0] text-white rounded-lg font-medium">
                    {currentScreen.buttonText || 'Bouton'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Options d'affichage */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Options d'affichage</h4>
            <div className="flex space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={currentScreen.showTitle !== false}
                  onChange={(e) => updateScreen(screens[activeScreen].id, 'showTitle', e.target.checked)}
                  className="rounded border-gray-300 text-[#E0004D] focus:ring-[#E0004D]"
                />
                <span className="text-sm text-gray-700">Afficher le titre</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={currentScreen.showDescription !== false}
                  onChange={(e) => updateScreen(screens[activeScreen].id, 'showDescription', e.target.checked)}
                  className="rounded border-gray-300 text-[#E0004D] focus:ring-[#E0004D]"
                />
                <span className="text-sm text-gray-700">Afficher la description</span>
              </label>
            </div>
          </div>
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
            className="px-8 py-3 bg-gradient-to-r from-[#E0004D] to-[#4D2388] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
};

export default WordingStep;
