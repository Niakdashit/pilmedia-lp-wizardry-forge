import React, { useMemo, useState, useEffect } from 'react';
import { useParticipations } from '../../hooks/useParticipations';
import { toast } from 'react-toastify';
import CanvasGameRenderer from './components/CanvasGameRenderer';
import ResultScreen from './components/ResultScreen';
import FormHandler from './components/FormHandler';
import DynamicContactForm from '../forms/DynamicContactForm';
import { UNLOCKED_GAME_TYPES } from '../../utils/funnelMatcher';
import { FieldConfig } from '../forms/DynamicContactForm';
import { useEditorStore } from '../../stores/editorStore';
import CanvasElement from '../ModelEditor/CanvasElement';
import { useUniversalResponsive } from '../../hooks/useUniversalResponsive';

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
  
  // Synchronisation en temps réel avec le store pour les campagnes de type "form"
  const storeCampaign = useEditorStore((state) => state.campaign);
  const [liveCampaign, setLiveCampaign] = useState(campaign);
  
  // Mettre à jour la campagne en temps réel quand le store change
  useEffect(() => {
    if ((campaign.type === 'form' || campaign.type === 'jackpot') && storeCampaign) {
      setLiveCampaign(storeCampaign);
    }
  }, [storeCampaign, campaign.type]);
  
  const {
    createParticipation
  } = useParticipations();

  const fields: FieldConfig[] = useMemo(() => {
    // Utilisation prioritaire des champs depuis liveCampaign.formFields (synchronisé en temps réel)
    if (liveCampaign?.formFields && Array.isArray(liveCampaign.formFields) && liveCampaign.formFields.length > 0) {
      return liveCampaign.formFields;
    }
    // Fallback vers campaign.formFields si liveCampaign n'est pas encore synchronisé
    if (campaign?.formFields && Array.isArray(campaign.formFields) && campaign.formFields.length > 0) {
      return campaign.formFields;
    }
    // Fallback vers les champs par défaut
    return [
      { id: 'prenom', label: 'Prénom', type: 'text', required: true },
      { id: 'nom', label: 'Nom', type: 'text', required: true },
      { id: 'email', label: 'Email', type: 'email', required: true }
    ];
  }, [liveCampaign?.formFields, liveCampaign?._lastUpdate, campaign?.formFields, campaign?._lastUpdate]);

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

  // Pour les campagnes de type "form", afficher directement le formulaire en plein écran
  if (liveCampaign.type === 'form') {
    // Récupérer l'image de fond depuis canvasConfig.background (synchronisé avec le canvas)
    const canvasBackground = liveCampaign.canvasConfig?.background || liveCampaign.design?.background;
    const backgroundStyle: React.CSSProperties = {
      background: canvasBackground?.type === 'image'
        ? `url(${canvasBackground.value}) center/cover no-repeat`
        : canvasBackground?.value || liveCampaign.design?.background?.value || 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
    };

    // Récupérer les styles de design comme dans l'édition
    const campaignDesign = liveCampaign.design || {};
    // Largeur du panneau configurée par l'utilisateur - fixe pour éviter les changements responsive
    const formWidth = campaignDesign.formWidth || campaignDesign.formConfig?.widthPx ? `${campaignDesign.formConfig.widthPx}px` : '360px';
    const buttonColor = campaignDesign.buttonColor || '#841b60';
    const buttonTextColor = campaignDesign.buttonTextColor || '#ffffff';
    const borderColor = campaignDesign.borderColor || '#E5E7EB';
    const focusColor = buttonColor;
    const borderRadius = typeof campaignDesign.borderRadius === 'number' ? `${campaignDesign.borderRadius}px` : (campaignDesign.borderRadius || '12px');
    const inputBorderRadius = typeof campaignDesign.inputBorderRadius === 'number' ? campaignDesign.inputBorderRadius : (typeof campaignDesign.borderRadius === 'number' ? campaignDesign.borderRadius : 2);
    const panelBg = campaignDesign.blockColor || '#ffffff';
    const textColor = campaignDesign?.textStyles?.label?.color || '#111827';
    const formPosition = (campaignDesign.formPosition as 'left' | 'right') || 'right';

    // Récupérer les éléments du canvas pour les afficher
    const canvasElements = liveCampaign.canvasElements || liveCampaign.elements || [];
    // Utiliser 'desktop' pour éviter les changements de largeur responsive
    const { getPropertiesForDevice } = useUniversalResponsive('desktop');

    return (
      <div className="w-full h-[100dvh] min-h-[100dvh]">
        <div className="relative w-full h-full">
          <div className="absolute inset-0" style={backgroundStyle} />
          
          {/* Rendu des éléments du canvas */}
          {canvasElements.map((element: any) => {
            const elementWithProps = {
              ...element,
              ...getPropertiesForDevice(element, previewMode)
            };
            
            // Pour les éléments de texte, s'assurer que les dimensions sont cohérentes
            if (element.type === 'text') {
              // Utiliser les dimensions originales de l'élément pour éviter les retours à la ligne
              elementWithProps.width = element.width || 200;
              elementWithProps.height = element.height || 40;
              // S'assurer que le texte ne se wrappe pas en forçant une largeur suffisante
              if (elementWithProps.width < 150) {
                elementWithProps.width = 150;
              }
            }
            
            // S'assurer que x, y, width, height sont des nombres
            elementWithProps.x = Number(elementWithProps.x) || 0;
            elementWithProps.y = Number(elementWithProps.y) || 0;
            elementWithProps.width = Number(elementWithProps.width) || 100;
            elementWithProps.height = Number(elementWithProps.height) || 100;

            return (
              <CanvasElement 
                key={element.id} 
                element={elementWithProps} 
                selectedDevice={previewMode}
                isSelected={false}
                onSelect={() => {}} 
                onUpdate={() => {}} 
                onDelete={() => {}}
                containerRef={null}
                readOnly={true}
                onMeasureBounds={() => {}}
                onAddElement={() => {}}
                elements={canvasElements}
                isMultiSelecting={false}
                isGroupSelecting={false}
                activeGroupId={null}
                campaign={liveCampaign}
                extractedColors={[]}
                alignmentSystem={null}
              />
            );
          })}
          
          <div className="relative z-10 h-full flex">
            {/* Reproduire exactement le même positionnement que dans l'édition */}
            <div
              className="flex items-center justify-center"
              style={{
                // Centrage vertical et ancrage horizontal selon la position choisie
                top: '50%',
                transform: 'translateY(-50%)',
                ...(formPosition === 'left' ? { left: '4%' } : { right: '4%' }),
                // Largeur configurée par l'utilisateur
                width: formWidth,
                height: 'auto',
                maxHeight: 'calc(100% - 32px)',
                position: 'absolute'
              }}
            >
              <div
                className="w-full shadow-2xl rounded-xl p-6 overflow-y-auto"
                style={{ 
                  backgroundColor: panelBg, 
                  maxHeight: 'calc(100% - 0px)',
                  borderRadius: borderRadius
                }}
              >
                <div className="flex flex-col" style={{ color: textColor, fontFamily: campaignDesign.fontFamily }}>
                  <div className="mb-4">
                    <h3 className="text-base font-semibold" style={{ color: textColor }}>
                      {liveCampaign.screens?.[1]?.title || 'Vos informations'}
                    </h3>
                    <p className="text-xs opacity-80" style={{ color: textColor }}>
                      {liveCampaign.screens?.[1]?.description || 'Remplissez le formulaire pour participer'}
                    </p>
                  </div>
                  <div
                    className="rounded-md border"
                    style={{ borderColor, borderWidth: 2, borderRadius, backgroundColor: panelBg }}
                  >
                    <div className="p-3">
                      <DynamicContactForm
                        fields={fields}
                        submitLabel={participationLoading ? 'Chargement...' : liveCampaign.screens?.[1]?.buttonText || "Participer"}
                        onSubmit={handleFormSubmit}
                        textStyles={{
                          label: { 
                            ...(campaignDesign.textStyles?.label || {}), 
                            color: textColor, 
                            fontFamily: campaignDesign.fontFamily 
                          },
                          button: {
                            backgroundColor: buttonColor,
                            color: buttonTextColor,
                            borderRadius,
                            fontFamily: campaignDesign.fontFamily,
                            fontWeight: campaignDesign.textStyles?.button?.fontWeight,
                            fontSize: campaignDesign.textStyles?.button?.fontSize,
                          },
                        }}
                        inputBorderColor={borderColor}
                        inputFocusColor={focusColor}
                        inputBorderRadius={inputBorderRadius}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <CanvasGameRenderer 
        campaign={liveCampaign} 
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
