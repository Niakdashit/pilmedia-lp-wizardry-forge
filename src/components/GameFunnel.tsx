import React, { useState } from 'react';
import Color from 'color';
import { QuizGame, Memory, Puzzle } from './GameTypes';

interface GameFunnelProps {
  campaign: any;
}

const FunnelStandard: React.FC<GameFunnelProps> = ({ campaign }) => {
  const [step, setStep] = useState<'start' | 'form' | 'game' | 'end'>('start');
  const [formData, setFormData] = useState({
    civilite: '',
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    codePostal: ''
  });

  const getContrastColor = (bgColor: string) => {
    try {
      const color = Color(bgColor);
      return color.isLight() ? '#000000' : '#FFFFFF';
    } catch {
      return '#000000';
    }
  };

  const handleStart = () => setStep('form');
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('game');
  };
  const handleEnd = () => setStep('end');

  const getGameComponent = () => {
    switch (campaign.type) {
      case 'quiz':
        return (
          <QuizGame campaignId={campaign.id} config={campaign.gameConfig.quiz} />
        );
      case 'memory':
        return <Memory config={campaign.gameConfig.memory} onConfigChange={() => {}} />;
      case 'puzzle':
        return <Puzzle config={campaign.gameConfig.puzzle} onConfigChange={() => {}} />;
      case 'form':
        return <div className="text-center text-gray-500">Formulaire dynamique</div>;
      default:
        return <div className="text-center text-gray-400">Non compatible avec ce funnel</div>;
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {step === 'start' && (
        <div className="text-center p-6">
          <h2
            className="text-2xl font-bold mb-4"
            style={{
              ...campaign.design.textStyles?.title
            }}
          >
            {campaign.screens[0]?.title || 'Ready to Play?'}
          </h2>
          <p
            className="mb-6"
            style={{
              ...campaign.design.textStyles?.description,
              color: campaign.design.textStyles?.description?.color || getContrastColor(campaign.design.blockColor)
            }}
          >
            {campaign.screens[0]?.description || 'Click below to participate'}
          </p>
          <button
            onClick={handleStart}
            className="px-8 py-3 font-medium transition-colors duration-200"
            style={{
              backgroundColor: campaign.design.buttonColor,
              color: campaign.design.textStyles?.button?.color || getContrastColor(campaign.design.buttonColor),
              borderRadius: campaign.design.borderRadius,
              ...campaign.design.textStyles?.button
            }}
          >
            {campaign.screens[0]?.buttonText || 'Participate'}
          </button>
        </div>
      )}

      {step === 'form' && (
        <div className="w-full max-w-md p-6">
          <h2
            className="text-2xl font-bold mb-4"
            style={{
              ...campaign.design.textStyles?.title
            }}
          >
            {campaign.screens[1]?.title || 'Your Information'}
          </h2>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Civilité</label>
                <select
                  value={formData.civilite}
                  onChange={(e) => setFormData({ ...formData, civilite: e.target.value })}
                  required={campaign.screens[1]?.requiredFields?.includes('civilite')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Sélectionner</option>
                  <option value="M.">M.</option>
                  <option value="Mme">Mme</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Prénom"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                required
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              type="submit"
              className="w-full px-6 py-3 font-medium transition-colors mt-4"
            style={{
              backgroundColor: campaign.design.buttonColor,
              color: campaign.design.textStyles?.button?.color || getContrastColor(campaign.design.buttonColor),
              borderRadius: campaign.design.borderRadius,
              ...campaign.design.textStyles?.button
            }}
          >
            {campaign.screens[1]?.buttonText || 'Continue'}
          </button>
          </form>
        </div>
      )}

      {step === 'game' && (
        <div className="w-full p-6">
          {getGameComponent()}
          <div className="mt-6 text-center">
            <button
              onClick={handleEnd}
              className="px-6 py-3"
              style={{
                backgroundColor: campaign.design.buttonColor,
                color: campaign.design.textStyles?.button?.color || getContrastColor(campaign.design.buttonColor),
                borderRadius: campaign.design.borderRadius,
                ...campaign.design.textStyles?.button
              }}
            >
              {campaign.screens[2]?.buttonText || 'Submit'}
            </button>
          </div>
        </div>
      )}

      {step === 'end' && (
        <div className="text-center p-6">
          <h2
            className="text-3xl font-bold mb-4"
            style={{
              color: campaign.design.titleColor,
              fontFamily: campaign.design.titleFont
            }}
          >
            {campaign.screens[3]?.confirmationTitle || 'Thank you!'}
          </h2>
          <p
            className="mb-6"
            style={{
              ...campaign.design.textStyles?.description,
              color: campaign.design.textStyles?.description?.color || getContrastColor(campaign.design.blockColor)
            }}
          >
            {campaign.screens[3]?.confirmationMessage || 'Your participation has been recorded.'}
          </p>
          <button
            onClick={() => setStep('start')}
            className="px-6 py-3 font-medium transition-colors duration-200 hover:opacity-90"
            style={{
              backgroundColor: campaign.design.buttonColor,
              color: campaign.design.textStyles?.button?.color || getContrastColor(campaign.design.buttonColor),
              borderRadius: campaign.design.borderRadius,
              ...campaign.design.textStyles?.button
            }}
          >
            {campaign.screens[3]?.replayButtonText || 'Play Again'}
          </button>
        </div>
      )}
    </div>
  );
};

export default FunnelStandard;
