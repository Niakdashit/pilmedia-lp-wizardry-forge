
import { useState, useEffect, useMemo } from 'react';
import { useParticipations } from '../../../hooks/useParticipations';
import { useGameSize } from '../../../hooks/useGameSize';
import { useWheelSpin } from '../../../hooks/useWheelSpin';
import { DEFAULT_FIELDS, getWheelSegments } from '../../../utils/wheelConfig';

interface InstantWinConfig {
  mode: "instant_winner";
  winProbability: number;
  maxWinners?: number;
  winnersCount?: number;
}

interface UseWheelPreviewLogicProps {
  campaign: any;
  config: InstantWinConfig;
  onFinish?: (result: 'win' | 'lose') => void;
  disabled?: boolean;
  onStart?: () => void;
  gameSize?: 'small' | 'medium' | 'large' | 'xlarge';
  gamePosition?: 'top' | 'center' | 'bottom' | 'left' | 'right';
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
  disableForm?: boolean;
}

const getWheelDimensions = (
  gameDimensions: { width: number; height: number },
  gamePosition: string,
  shouldCropWheel: boolean
) => {
  const baseSize = Math.min(gameDimensions.width, gameDimensions.height);
  const canvasSize = Math.max(200, Math.min(400, baseSize - 40));
  
  let containerWidth = canvasSize + 40;
  let containerHeight = canvasSize + 40;
  
  if (shouldCropWheel) {
    switch (gamePosition) {
      case 'left':
      case 'right':
        containerWidth = Math.floor(canvasSize * 0.7);
        break;
      case 'bottom':
        containerHeight = Math.floor(canvasSize * 0.7);
        break;
    }
  }
  
  const pointerSize = Math.max(12, Math.min(20, canvasSize / 20));
  
  return {
    canvasSize,
    containerWidth,
    containerHeight,
    pointerSize
  };
};

export const useWheelPreviewLogic = ({
  campaign,
  config,
  onFinish,
  disabled = false,
  onStart,
  gameSize = 'small',
  gamePosition = 'center',
  previewDevice = 'desktop',
  disableForm = false
}: UseWheelPreviewLogicProps) => {
  // État du formulaire - commencer à false pour forcer la validation
  const [formValidated, setFormValidated] = useState(disableForm);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showValidationMessage, setShowValidationMessage] = useState(false);

  console.log('WheelPreviewLogic - État initial formValidated:', formValidated, 'disableForm:', disableForm);

  const { getGameDimensions } = useGameSize(gameSize);
  const gameDimensions = getGameDimensions();
  
  const isMobile = previewDevice === 'mobile';
  const isCroppablePosition = ['left', 'right', 'bottom'].includes(gamePosition);
  const shouldCropWheel = isMobile && isCroppablePosition;
  
  const { canvasSize, containerWidth, containerHeight, pointerSize } = getWheelDimensions(
    gameDimensions,
    gamePosition,
    shouldCropWheel
  );

  // Utiliser useMemo pour optimiser le calcul des segments et forcer le re-render
  const segments = useMemo(() => {
    console.log('WheelPreviewLogic - Recalcul des segments pour campaign:', campaign?._lastUpdate);
    const result = getWheelSegments(campaign);
    console.log('WheelPreviewLogic - Segments calculés:', result);
    return result;
  }, [campaign, campaign?._lastUpdate, campaign?.gameConfig?.wheel?.segments, campaign?.config?.roulette?.segments]);

  const { rotation, spinning, spinWheel } = useWheelSpin({
    segments,
    disabled: disabled || !formValidated, // Désactiver si pas validé
    config,
    onStart,
    onFinish
  });

  const {
    createParticipation,
    loading: participationLoading
  } = useParticipations();

  const fields = Array.isArray(campaign.formFields) && campaign.formFields.length > 0
    ? campaign.formFields : DEFAULT_FIELDS;

  // Effect pour debug les changements de segments
  useEffect(() => {
    console.log('WheelPreviewLogic - useEffect segments changé:', segments);
  }, [segments]);

  // Effect pour synchroniser l'état quand disableForm change
  useEffect(() => {
    if (disableForm) {
      setFormValidated(true);
      console.log('WheelPreviewLogic - disableForm activé, formValidated set à true');
    } else {
      setFormValidated(false);
      console.log('WheelPreviewLogic - disableForm désactivé, formValidated set à false');
    }
  }, [disableForm]);

  const handleFormSubmit = async (formData: Record<string, string>) => {
    console.log('WheelPreviewLogic - handleFormSubmit appelé avec:', formData);
    
    try {
      if (campaign.id) {
        await createParticipation({
          campaign_id: campaign.id,
          form_data: formData,
          user_email: formData.email
        });
      }
      
      setShowFormModal(false);
      setFormValidated(true);
      setShowValidationMessage(true);
      
      console.log('WheelPreviewLogic - Formulaire soumis avec succès, formValidated:', true);
      
      setTimeout(() => setShowValidationMessage(false), 1500);
    } catch (error) {
      console.error('WheelPreviewLogic - Erreur lors de la soumission:', error);
    }
  };

  const handleWheelClick = () => {
    console.log('WheelPreviewLogic - handleWheelClick appelé, formValidated:', formValidated, 'spinning:', spinning);
    
    // Vérifier si on peut lancer la roue
    if (!formValidated || spinning || disabled || segments.length === 0) {
      console.log('WheelPreviewLogic - Impossible de lancer la roue:', {
        formValidated,
        spinning,
        disabled,
        segmentsLength: segments.length
      });
      return;
    }
    
    console.log('WheelPreviewLogic - Lancement de la roue');
    spinWheel();
  };

  return {
    formValidated,
    showFormModal,
    setShowFormModal,
    showValidationMessage,
    gameDimensions,
    shouldCropWheel,
    canvasSize,
    containerWidth,
    containerHeight,
    pointerSize,
    segments,
    rotation,
    spinning,
    fields,
    participationLoading,
    handleFormSubmit,
    handleWheelClick
  };
};
