import React, { useState, useMemo, useEffect } from 'react';
import Color from 'color';
import DynamicContactForm from '../forms/DynamicContactForm';
import { QuizGame, Memory, Puzzle } from '../GameTypes';
import { useParticipations } from '../../hooks/useParticipations';
import { STANDARD_GAME_TYPES } from '../../utils/funnelMatcher';
import { useEditorPreviewSync } from '../../hooks/useEditorPreviewSync';
import { useEditorStore } from '../../stores/editorStore';

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
  const [forceUpdate, setForceUpdate] = useState(0);
  const { createParticipation, loading: participationLoading } = useParticipations();
  const storeCampaign = useEditorStore((state) => state.campaign);
  const { getCanonicalPreviewData } = useEditorPreviewSync();

  // Vérifier que le type de jeu est compatible avec ce funnel
  if (!STANDARD_GAME_TYPES.includes(campaign.type)) {
    console.warn(`Type de jeu "${campaign.type}" utilise FunnelStandard mais devrait utiliser FunnelUnlockedGame`);
  }

  // Écouter les changements de formFields en temps réel
  useEffect(() => {
    const handleFormFieldsSync = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      console.log('📋 [FunnelStandard] FormFields sync event received:', {
        fieldsCount: detail?.formFields?.length,
        timestamp: detail?.timestamp
      });
      setForceUpdate(prev => prev + 1);
    };
    
    window.addEventListener('editor-formfields-sync', handleFormFieldsSync);
    window.addEventListener('editor-force-sync', handleFormFieldsSync);
    
    return () => {
      window.removeEventListener('editor-formfields-sync', handleFormFieldsSync);
      window.removeEventListener('editor-force-sync', handleFormFieldsSync);
    };
  }, []);

  // Utiliser les données canoniques pour les champs de formulaire
  const fields = useMemo(() => {
    // Priorité 1: Données canoniques du hook de synchronisation
    const canonicalData = getCanonicalPreviewData();
    if (canonicalData.formFields && Array.isArray(canonicalData.formFields) && canonicalData.formFields.length > 0) {
      console.log('📋 [FunnelStandard] Using canonical formFields:', {
        count: canonicalData.formFields.length,
        fields: canonicalData.formFields.map((f: any) => ({ id: f.id, label: f.label, type: f.type })),
        timestamp: canonicalData.timestamp
      });
      return canonicalData.formFields;
    }
    
    // Priorité 2: Store campaign
    if (storeCampaign?.formFields && Array.isArray(storeCampaign.formFields) && storeCampaign.formFields.length > 0) {
      console.log('📋 [FunnelStandard] Using storeCampaign formFields:', storeCampaign.formFields.length);
      return storeCampaign.formFields;
    }
    
    // Priorité 3: Campaign props
    if (campaign?.formFields && Array.isArray(campaign.formFields) && campaign.formFields.length > 0) {
      console.log('📋 [FunnelStandard] Using campaign formFields:', campaign.formFields.length);
      return campaign.formFields;
    }
    
    // Fallback: Champs par défaut
    console.log('📋 [FunnelStandard] Using default formFields');
    return DEFAULT_FIELDS;
  }, [getCanonicalPreviewData, storeCampaign?.formFields, storeCampaign?._lastUpdate, campaign?.formFields, campaign?._lastUpdate, forceUpdate]);

  // Récupérer les couleurs de design de la campagne
  const design = campaign.design || {};
  const customColors = design.customColors || {};
  const buttonColor = customColors.primary || design.buttonColor || "#E0004D";
  const borderColor = customColors.primary || design.borderColor || "#E5E7EB";
  const focusColor = buttonColor;

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
        // Récupérer les questions depuis plusieurs sources possibles
        const quizConfig = campaign.gameConfig?.quiz || campaign.quizConfig || {};
        const questions = quizConfig.questions || campaign.questions || [];
        
        console.log('🎯 [FunnelStandard] Quiz config:', {
          hasGameConfig: !!campaign.gameConfig,
          hasQuizConfig: !!campaign.quizConfig,
          questionsCount: questions.length,
          config: quizConfig
        });
        
        return (
          <QuizGame
            config={{ ...quizConfig, questions }}
            design={campaign.design}
          />
        );
      case 'memory':
        return <Memory config={campaign.gameConfig?.memory || {}} onConfigChange={() => {}} />;
      case 'puzzle':
        return <Puzzle config={campaign.gameConfig?.puzzle || {}} onConfigChange={() => {}} />;
      case 'form':
        return <div className="text-center text-gray-500">Formulaire dynamique</div>;
      default:
        return (
          <div className="text-center text-red-500 bg-red-50 p-4 rounded border border-red-200">
            <p className="font-medium">Type de jeu incompatible</p>
            <p className="text-sm">"{campaign.type}" ne devrait pas utiliser le FunnelStandard</p>
          </div>
        );
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
              backgroundColor: buttonColor,
              borderRadius: campaign.design.borderRadius,
              ...campaign.design.textStyles?.button,
              color: campaign.design.textStyles?.button?.color || getContrastColor(buttonColor)
            }}
          >
            {campaign.screens[0]?.buttonText || 'Participate'}
          </button>
        </div>
      )}

      {step === 'form' && (
        <div className="w-full max-w-md p-6">
          {/* Cadre blanc spécial pour les quiz */}
          {campaign.type === 'quiz' ? (
            <div 
              className="p-8 rounded-2xl shadow-xl border-2"
              style={{
                backgroundColor: '#ffffff',
                borderColor: borderColor
              }}
            >
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
                  label: {
                    color: design.textStyles?.label?.color || '#374151',
                    fontFamily: design.fontFamily || 'inherit',
                    ...design.textStyles?.label
                  },
                  button: {
                    backgroundColor: buttonColor,
                    color: '#ffffff',
                    borderRadius: design.borderRadius || '8px',
                    fontFamily: design.fontFamily || 'inherit',
                    fontWeight: '600',
                    ...design.textStyles?.button
                  }
                }}
                inputBorderColor={borderColor}
                inputFocusColor={focusColor}
              />
            </div>
          ) : (
            <div>
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
                  label: {
                    color: design.textStyles?.label?.color || '#374151',
                    fontFamily: design.fontFamily || 'inherit',
                    ...design.textStyles?.label
                  },
                  button: {
                    backgroundColor: buttonColor,
                    color: '#ffffff',
                    borderRadius: design.borderRadius || '8px',
                    fontFamily: design.fontFamily || 'inherit',
                    fontWeight: '600',
                    ...design.textStyles?.button
                  }
                }}
                inputBorderColor={borderColor}
                inputFocusColor={focusColor}
              />
            </div>
          )}
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
              backgroundColor: buttonColor,
              color: campaign.design.textStyles?.button?.color || getContrastColor(buttonColor),
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
              backgroundColor: buttonColor,
              color: campaign.design.textStyles?.button?.color || getContrastColor(buttonColor),
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
