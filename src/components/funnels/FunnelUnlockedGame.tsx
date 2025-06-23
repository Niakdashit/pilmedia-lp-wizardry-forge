
import React, { useState } from 'react';
import { useParticipations } from '../../hooks/useParticipations';
import { toast } from 'react-toastify';
import GameRenderer from './components/GameRenderer';
import ResultScreen from './components/ResultScreen';
import FormHandler from './components/FormHandler';
import { UNLOCKED_GAME_TYPES } from '../../utils/funnelMatcher';

interface FunnelUnlockedGameProps {
  campaign: any;
  previewMode?: 'mobile' | 'tablet' | 'desktop';
  mobileConfig?: any;
  modalContained?: boolean;
}

export interface FieldConfig {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio';
  required?: boolean;
  options?: string[];
}

const FunnelUnlockedGame: React.FC<FunnelUnlockedGameProps> = ({
  campaign,
  previewMode = 'desktop',
  mobileConfig,
  modalContained = true
}) => {
  // Vérifier que le type de jeu est compatible avec ce funnel
  if (!UNLOCKED_GAME_TYPES.includes(campaign.type)) {
    console.warn(`Type de jeu "${campaign.type}" utilise FunnelUnlockedGame mais devrait utiliser FunnelStandard`);
  }

  // L'état de validation du formulaire démarre toujours à false pour
  // obliger l'utilisateur à renseigner le formulaire avant de jouer,
  // quel que soit le type de jeu.
  const [formValidated, setFormValidated] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  const [participationLoading, setParticipationLoading] = useState(false);
  
  const {
    createParticipation
  } = useParticipations();

  const fields: FieldConfig[] = campaign.formFields || [{
    id: 'prenom',
    label: 'Prénom',
    type: 'text',
    required: true
  }, {
    id: 'nom',
    label: 'Nom',
    type: 'text',
    required: true
  }, {
    id: 'email',
    label: 'Email',
    type: 'email',
    required: true
  }];

  const handleGameButtonClick = () => {
    if (!formValidated) {
      setShowFormModal(true);
    }
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

  const handleReset = () => {
    setFormValidated(false);
    setGameResult(null);
    setShowFormModal(false);
    setShowValidationMessage(false);
  };

  // Si on a un résultat de jeu, afficher l'écran de résultat
  if (gameResult) {
    return <ResultScreen 
      gameResult={gameResult} 
      campaign={campaign} 
      mobileConfig={mobileConfig} 
      onReset={handleReset} 
    />;
  }

  // Style du conteneur principal pour assurer un bon centrage
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minHeight: '500px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box',
    overflow: 'visible'
  };

  return (
    <div style={containerStyle}>
      {/* Jeu */}
      <div className="w-full h-full flex items-center justify-center">
        <GameRenderer 
          campaign={campaign} 
          formValidated={formValidated} 
          showValidationMessage={showValidationMessage} 
          previewMode={previewMode} 
          mobileConfig={mobileConfig} 
          onGameFinish={handleGameFinish} 
          onGameStart={handleGameStart} 
          onGameButtonClick={handleGameButtonClick} 
        />
      </div>

      {/* Modal de formulaire - UNIQUEMENT pour les types qui ne sont pas des roues */}
      {campaign.type !== 'wheel' && (
        <FormHandler
          showFormModal={showFormModal}
          campaign={campaign}
          fields={fields}
          participationLoading={participationLoading}
          modalContained={modalContained}
          onClose={() => {
            setShowFormModal(false);
          }}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default FunnelUnlockedGame;
