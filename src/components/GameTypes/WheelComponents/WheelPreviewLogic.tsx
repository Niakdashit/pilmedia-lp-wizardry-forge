
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
  if (process.env.NODE_ENV !== 'production') {
    console.log('WheelPreviewLogic - Initialisation avec disableForm:', disableForm);
  }

  // State pour la gestion du formulaire
  const [formValidated, setFormValidated] = useState(disableForm);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showValidationMessage, setShowValidationMessage] = useState(false);

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
    if (process.env.NODE_ENV !== 'production') {
      console.log('WheelPreviewLogic - Recalcul des segments pour campaign:', campaign?._lastUpdate);
    }
    const result = getWheelSegments(campaign);
    if (process.env.NODE_ENV !== 'production') {
      console.log('WheelPreviewLogic - Segments calculés:', result);
    }
    return result;
  }, [campaign, campaign?._lastUpdate, campaign?.gameConfig?.wheel?.segments, campaign?.config?.roulette?.segments]);

  // Logique pour déterminer si la roue est désactivée
  const isWheelDisabled = disabled || (!disableForm && !formValidated);

  const { rotation, spinning, spinWheel } = useWheelSpin({
    segments,
    disabled: isWheelDisabled,
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
    if (process.env.NODE_ENV !== 'production') {
      console.log('WheelPreviewLogic - useEffect segments changé:', segments);
    }
  }, [segments]);

  // Synchronisation disableForm avec formValidated
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('WheelPreviewLogic - Sync disableForm:', disableForm, '➜ formValidated:', disableForm);
    }
    setFormValidated(disableForm);
  }, [disableForm]);

  const handleFormSubmit = async (formData: Record<string, string>) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('WheelPreviewLogic - handleFormSubmit appelé avec:', formData);
    }
    
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
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('WheelPreviewLogic - Formulaire soumis avec succès, formValidated:', true);
      }
      
      setTimeout(() => setShowValidationMessage(false), 1500);
    } catch (error) {
      console.error('WheelPreviewLogic - Erreur lors de la soumission:', error);
    }
  };

  const handleWheelClick = () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('WheelPreviewLogic - handleWheelClick appelé:', {
        spinning,
        disabled,
        segmentsLength: segments.length,
        disableForm,
        formValidated
      });
    }
    // Vérifications de base
    if (spinning || disabled || segments.length === 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('WheelPreviewLogic - Impossible de lancer (conditions de base)');
      }
      return;
    }

    // Si le formulaire est désactivé, lancer directement la roue
    if (disableForm) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('WheelPreviewLogic - Formulaire désactivé, lancement direct');
      }
      spinWheel();
      return;
    }

    // Si le formulaire n'est pas validé, afficher la modale
    if (!formValidated) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('WheelPreviewLogic - Formulaire requis, ouverture modale');
      }
      setShowFormModal(true);
      return;
    }
    
    // Si le formulaire est validé, lancer la roue
    if (process.env.NODE_ENV !== 'production') {
      console.log('WheelPreviewLogic - Formulaire validé, lancement roue');
    }
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
