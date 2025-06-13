import React, { useState } from 'react';
import Color from 'color';
import DynamicContactForm from '../forms/DynamicContactForm';
import { QuizGame, Memory, Puzzle } from '../GameTypes';
import { useParticipations } from '../../hooks/useParticipations';

const DEFAULT_FIELDS = [
  { id: "civilite", label: "Civilité", type: "select", options: ["M.", "Mme"], required: false },
  { id: "prenom", label: "Prénom", required: true },
  { id: "nom", label: "Nom", required: true },
  { id: "email", label: "Email", type: "email", required: true }
];

interface GameFunnelProps {
  campaign: any;
}

const FunnelStandard: React.FC<GameFunnelProps> = ({ campaign }) => {
  const [step, setStep] = useState<'start' | 'form' | 'game' | 'end'>('start');
  const { createParticipation, loading: participationLoading } = useParticipations();

  const fields = Array.isArray(campaign.formFields) && campaign.formFields.length > 0 
    ? campaign.formFields 
    : DEFAULT_FIELDS;

  const getContrastColor = (bgColor: string) => {
    try {
      const color = Color(bgColor);
      return color.isLight() ? '#000000' : '#FFFFFF';
    } catch {
      return '#000000';
    }
  };

  const handleStart = () => setStep('form');
  
  const handleFormSubmit = async (formData: Record<string, string>) => {
    
    if (campaign.id) {
      const participation = await createParticipation({
        campaign_id: campaign.id,
        form_data: formData,
        user_email: formData.email
      });
      
      if (participation) {
      }
    }
    
    if (campaign.type === 'form') {
      setStep('end');
      return;
    }

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
            className="px-8 py-3 font-medium transition-colors duration-200 hover:opacity-90"
            style={{
              backgroundColor: campaign.design.buttonColor,
              borderRadius: campaign.design.borderRadius,
              ...campaign.design.textStyles?.button,
              color: campaign.design.textStyles?.button?.color || getContrastColor(campaign.design.buttonColor)
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
          <DynamicContactForm
            fields={fields}
            submitLabel={participationLoading ? "Chargement..." : (campaign.screens[1]?.buttonText || "Continuer")}
            onSubmit={handleFormSubmit}
            textStyles={{
              label: campaign.design.textStyles?.label,
              button: campaign.design.textStyles?.button
            }}
          />
        </div>
      )}

      {step === 'game' && (
        <div className="w-full p-6">
          {getGameComponent()}
          <div className="mt-6 text-center">
          <button
            onClick={handleEnd}
            className="px-6 py-3 transition-colors duration-200 hover:opacity-90"
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
              ...campaign.design.textStyles?.title
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
