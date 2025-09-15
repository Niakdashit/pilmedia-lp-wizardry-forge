import React, { useMemo, useState } from 'react';
import { useParticipations } from '../../hooks/useParticipations';
import { toast } from 'react-toastify';
import CanvasGameRenderer from './components/CanvasGameRenderer';
import ResultScreen from './components/ResultScreen';
import FormHandler from './components/FormHandler';
import { UNLOCKED_GAME_TYPES } from '../../utils/funnelMatcher';
import { FieldConfig } from '../forms/DynamicContactForm';

interface FunnelUnlockedGameProps {
  campaign: any;
  previewMode: 'mobile' | 'tablet' | 'desktop';
  mobileConfig?: any;
  wheelModalConfig?: any; // Configuration en temps réel depuis le Design Editor
  onReset?: () => void;
}

const FunnelUnlockedGame: React.FC<FunnelUnlockedGameProps> = ({
  campaign,
  previewMode = 'desktop',
  mobileConfig,
  wheelModalConfig
}) => {
  // Vérifier que le type de jeu est compatible avec ce funnel
  if (!UNLOCKED_GAME_TYPES.includes(campaign.type)) {
    console.warn(`Type de jeu "${campaign.type}" utilise FunnelUnlockedGame mais devrait utiliser FunnelStandard`);
  }

  // LOGIQUE FUNNEL UNLOCKED : formulaire obligatoire pour démarrer le jeu
  const [formValidated, setFormValidated] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  const [participationLoading, setParticipationLoading] = useState(false);
  
  const {
    createParticipation
  } = useParticipations();

  const fields: FieldConfig[] = useMemo(() => (
    (campaign?.formFields && Array.isArray(campaign.formFields)) ? campaign.formFields : [
      { id: 'prenom', label: 'Prénom', type: 'text', required: true },
      { id: 'nom', label: 'Nom', type: 'text', required: true },
      { id: 'email', label: 'Email', type: 'email', required: true }
    ]
  ), [campaign?.formFields]);

  const handleGameButtonClick = () => {
    // Si le formulaire n'est pas validé, on affiche la modale
    if (!formValidated) {
      setShowFormModal(true);
    }
    // Si le formulaire est validé, le jeu peut démarrer (géré dans chaque composant de jeu)
  };

  const handleFormSubmit = async (formData: Record<string, string>) => {
    setParticipationLoading(true);
    try {
      if (campaign.id) {
        await createParticipation({
          campaign_id: campaign.id,
          form_data: formData,
          user_email: formData.email
        });
      }
      setFormValidated(true);
      setShowFormModal(false);
      setShowValidationMessage(true);
      setTimeout(() => setShowValidationMessage(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      toast.error('Erreur lors de la soumission du formulaire');
    } finally {
      setParticipationLoading(false);
    }
  };

  const handleGameStart = () => {
    // Game started logic if needed
  };

  const handleGameFinish = async (result: 'win' | 'lose') => {
    try {
      if (campaign.id) {
        await createParticipation({
          campaign_id: campaign.id,
          form_data: {
            game_result: result
          },
          user_email: ''
        });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du résultat:', error);
    }
    setGameResult(result);
  };

  // FONCTION DE RESET COMPLET pour le funnel unlocked
  const handleReset = () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔄 Reset complet du funnel unlocked game');
    }
    setFormValidated(false);  // ⚠️ IMPORTANT : remettre le formulaire à false
    setGameResult(null);
    setShowFormModal(false);
    setShowValidationMessage(false);
  };

  // Si on a un résultat de jeu, afficher l'écran de résultat avec le même fond que le canvas
  if (gameResult) {
    const backgroundStyle: React.CSSProperties = {
      background: campaign.design?.background?.type === 'image'
        ? `url(${campaign.design.background.value}) center/cover no-repeat`
        : campaign.design?.background?.value || '#ffffff'
    };
    return (
      <div className="w-full h-[100dvh] min-h-[100dvh]">
        <div className="relative w-full h-full">
          <div className="absolute inset-0" style={backgroundStyle} />
          <div className="relative z-10 h-full flex items-center justify-center">
            <ResultScreen 
              gameResult={gameResult} 
              campaign={campaign} 
              mobileConfig={mobileConfig} 
              onReset={handleReset} 
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <CanvasGameRenderer 
        campaign={campaign} 
        formValidated={formValidated} 
        showValidationMessage={showValidationMessage} 
        previewMode={previewMode} 
        mobileConfig={mobileConfig} 
        wheelModalConfig={wheelModalConfig}
        fullScreen={true}
        onGameFinish={handleGameFinish} 
        onGameStart={handleGameStart} 
        onGameButtonClick={handleGameButtonClick} 
      />

      {/* Modal de formulaire pour tous les jeux unlocked - avec styles appliqués */}
      <FormHandler
        showFormModal={showFormModal}
        campaign={campaign}
        fields={fields}
        participationLoading={participationLoading}
        onClose={() => {
          setShowFormModal(false);
        }}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default FunnelUnlockedGame;
