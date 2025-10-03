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
import { getDeviceDimensions } from '../../utils/deviceDimensions';
import ScratchCardCanvas from '../ScratchCardEditor/ScratchCardCanvas';
import { useScratchCardStore } from '../ScratchCardEditor/state/scratchcard.store';
import { QuizModuleRenderer } from '../ScratchCardEditor/QuizRenderer';

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
  const [currentScreen, setCurrentScreen] = useState<'screen1' | 'screen2' | 'screen3'>('screen1');
  const [formValidated, setFormValidated] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  const [participationLoading, setParticipationLoading] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Écouter les mises à jour de style pour forcer le re-render (comme FunnelQuizParticipate)
  React.useEffect(() => {
    const handleStyleUpdate = () => {
      console.log('🔄 [FunnelUnlockedGame] Style update received, forcing re-render');
      setForceUpdate(prev => prev + 1);
    };
    
    window.addEventListener('quizStyleUpdate', handleStyleUpdate);
    window.addEventListener('modularModuleSelected', handleStyleUpdate);
    
    return () => {
      window.removeEventListener('quizStyleUpdate', handleStyleUpdate);
      window.removeEventListener('modularModuleSelected', handleStyleUpdate);
    };
  }, []);
  
  const [formPreviewElements, setFormPreviewElements] = useState<any[]>([]);
  const [formPreviewBackground, setFormPreviewBackground] = useState<{ type: 'color' | 'image'; value: string }>({
    type: 'color',
    value: '#ffffff'
  });
  const [, setFormPreviewZoom] = useState(() => {
    const device: 'desktop' | 'tablet' | 'mobile' = previewMode;
    const stored = getStoredZoom(device);
    return stored ?? getDefaultPreviewZoom(device);
  });

  // Synchronisation en temps réel avec le store pour les campagnes de type "form"
  const scratchCards = useScratchCardStore((state: any) => state.config.cards);
  
  // Détecter quand une carte est révélée pour déterminer le résultat
  React.useEffect(() => {
    if (currentScreen !== 'screen2' || !formValidated || gameResult !== null) return;
    
    const revealedCard = scratchCards.find((card: any) => card.revealed);
    if (revealedCard) {
      // Déterminer si c'est gagnant ou perdant selon la logique
      // Pour l'instant, utiliser card.isWinner si défini, sinon perdant par défaut
      const result = revealedCard.isWinner ? 'win' : 'lose';
      console.log(` Carte ${revealedCard.id} révélée - Résultat: ${result}`);
      handleGameFinish(result);
    }
  }, [scratchCards, currentScreen, formValidated, gameResult]);
  
  const storeCampaign = useEditorStore((state) => state.campaign);
  const [liveCampaign, setLiveCampaign] = useState(campaign);
  const universalResponsive = useUniversalResponsive('desktop');
  const { getPropertiesForDevice } = universalResponsive;
  
  // Mettre à jour la campagne en temps réel quand le store change
  useEffect(() => {
    if ((campaign.type === 'form' || campaign.type === 'jackpot' || campaign.type === 'scratch') && storeCampaign) {
      const storeBackground =
        storeCampaign.canvasConfig?.background ?? storeCampaign.design?.background;
      const campaignBackground =
        campaign.canvasConfig?.background ?? campaign.design?.background;

      const mergedBackground = storeBackground ?? campaignBackground;
      const normalizedBackground =
        mergedBackground && typeof mergedBackground === 'object' && 'value' in mergedBackground
          ? mergedBackground
          : mergedBackground
            ? { type: 'color' as const, value: mergedBackground as string }
            : undefined;

      setLiveCampaign({
        ...storeCampaign,
        canvasConfig: {
          ...(campaign.canvasConfig || {}),
          ...(storeCampaign.canvasConfig || {}),
          background: normalizedBackground
        },
        design: {
          ...(campaign.design || {}),
          ...(storeCampaign.design || {}),
          background:
            normalizedBackground ??
            storeCampaign.design?.background ??
            campaign.design?.background
        }
      });
    } else {
      setLiveCampaign(campaign);
    }
  }, [storeCampaign, campaign]);

  const normalizeBackground = (bg: any): { type: 'color' | 'image'; value: string } => {
    if (!bg) {
      return { type: 'color', value: '#ffffff' };
    }
    if (typeof bg === 'string') {
      return { type: 'color', value: bg };
    }
    if (typeof bg === 'object') {
      if (bg.type === 'color' || bg.type === 'image') {
        if (typeof bg.value === 'string' && bg.value) {
          return { type: bg.type, value: bg.value };
        }
        if (bg.url) {
          return { type: 'image', value: bg.url };
        }
      }
    }
    return { type: 'color', value: '#ffffff' };
  };

  function getStoredZoom(device: 'desktop' | 'tablet' | 'mobile'): number | undefined {
    if (typeof window === 'undefined') {
      return undefined;
    }
    try {
      const raw = window.localStorage.getItem(`editor-zoom-${device}`);
      if (!raw) return undefined;
      const value = parseFloat(raw);
      if (!Number.isNaN(value) && value >= 0.1 && value <= 1) {
        return value;
      }
    } catch (error) {
      console.warn('⚠️ Unable to read stored zoom value:', error);
    }
    return undefined;
  }

  function getDefaultPreviewZoom(device: 'desktop' | 'tablet' | 'mobile'): number {
    if (device === 'mobile') {
      if (typeof window !== 'undefined') {
        try {
          const { width, height } = getDeviceDimensions('mobile');
          const scale = Math.min(window.innerWidth / width, window.innerHeight / height);
          if (!Number.isNaN(scale) && scale > 0) {
            return Math.min(Math.max(scale, 0.1), 1);
          }
        } catch (error) {
          console.warn('⚠️ Unable to compute responsive mobile zoom:', error);
        }
      }
      return 0.45;
    }
    if (device === 'tablet') {
      return 0.55;
    }
    return 0.7;
  }

  // Background style avec synchronisation en temps réel (comme FunnelQuizParticipate)
  const backgroundStyle: React.CSSProperties = useMemo(() => {
    const canvasBackground = liveCampaign?.canvasConfig?.background || liveCampaign?.design?.background || campaign?.design?.background;
    return {
      background: canvasBackground?.type === 'image'
        ? `url(${canvasBackground.value}) center/cover no-repeat`
        : canvasBackground?.value || campaign?.design?.background?.value || 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'
    };
  }, [liveCampaign?.canvasConfig?.background, liveCampaign?.design?.background, campaign?.design?.background, forceUpdate]);

  // Récupérer directement modularPage pour un rendu unifié (comme FunnelQuizParticipate)
  // Force update when modularPage changes
  const modularPage = useMemo(() => {
    return liveCampaign?.modularPage || campaign?.modularPage || { screens: { screen1: [], screen2: [], screen3: [] }, _updatedAt: Date.now() };
  }, [liveCampaign?.modularPage, campaign?.modularPage, forceUpdate]);
  
  const modules = modularPage.screens.screen1 || [];
  const modules2 = modularPage.screens.screen2 || [];
  const modules3 = modularPage.screens.screen3 || [];

  useEffect(() => {
    if (liveCampaign?.type !== 'form') {
      return;
    }

    const elements = Array.isArray(liveCampaign.canvasConfig?.elements)
      ? JSON.parse(JSON.stringify(liveCampaign.canvasConfig?.elements))
      : [];
    setFormPreviewElements(elements);

    const bgCandidate = liveCampaign.canvasConfig?.background ?? liveCampaign.design?.background;
    setFormPreviewBackground(normalizeBackground(bgCandidate));
    const device: 'desktop' | 'tablet' | 'mobile' = previewMode;
    const storedZoom = getStoredZoom(device);
    setFormPreviewZoom(storedZoom ?? getDefaultPreviewZoom(device));
  }, [liveCampaign, previewMode]);
  
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
    // Passer à l'écran 2 (cartes visibles mais bloquées)
    setCurrentScreen('screen2');
    // Ne pas ouvrir le formulaire immédiatement, attendre que l'utilisateur essaie de gratter
  };

  const handleCardClick = () => {
    // Si le formulaire n'est pas validé, ouvrir la modale
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
      // Les cartes deviennent jouables après validation du formulaire
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
    setCurrentScreen('screen1');
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

  if (liveCampaign.type === 'scratch') {
    return (
      <div className="w-full h-[100dvh] min-h-[100dvh]">
        <div className="relative w-full h-full">
          <div className="absolute inset-0" style={backgroundStyle} />

          {/* ÉCRAN 1 : Avant le jeu */}
          {currentScreen === 'screen1' && (
            <div className="relative z-10 h-full flex flex-col items-center justify-center gap-6 p-8">
              {modules.length > 0 && (
                <QuizModuleRenderer 
                  modules={modules}
                  previewMode={true}
                  device={previewMode}
                  onButtonClick={handleGameButtonClick}
                />
              )}
            </div>
          )}

          {/* ÉCRAN 2 : Cartes visibles (bloquées si formulaire non validé) */}
          {currentScreen === 'screen2' && gameResult === null && (
            <>
              {/* Modules screen2 - en arrière-plan */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 gap-6" style={{ pointerEvents: 'none' }}>
                {modules2.length > 0 && (
                  <QuizModuleRenderer 
                    modules={modules2}
                    previewMode={true}
                    device={previewMode}
                  />
                )}
              </div>

              {/* ScratchCardCanvas */}
              <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 50 }}>
                <div className={formValidated ? 'pointer-events-auto' : 'pointer-events-none'}>
                  <ScratchCardCanvas 
                    selectedDevice={previewMode}
                    previewMode={!formValidated}
                  />
                </div>
              </div>
              
              {/* Overlay invisible pour intercepter les clics si formulaire non validé */}
              {!formValidated && (
                <div 
                  className="absolute inset-0 cursor-pointer" 
                  style={{ zIndex: 999999, backgroundColor: 'transparent' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCardClick();
                  }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCardClick();
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCardClick();
                  }}
                />
              )}
            </>
          )}

          {/* ÉCRAN 3 : Après le jeu (gameResult='win' ou 'lose') */}
          {gameResult !== null && (
            <div className="relative z-10 h-full flex flex-col items-center justify-center gap-6 p-8">
              {/* Message de résultat */}
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">
                  {gameResult === 'win' ? '🎉 Félicitations !' : '😔 Dommage...'}
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  {gameResult === 'win' 
                    ? 'Vous avez gagné !' 
                    : 'Vous avez perdu. Réessayez votre chance !'}
                </p>
              </div>

              {/* Modules screen3 si présents */}
              {modules3.length > 0 && (
                <div className="w-full flex flex-col items-center justify-center gap-6">
                  <QuizModuleRenderer 
                    modules={modules3}
                    previewMode={true}
                    device={previewMode}
                    onButtonClick={handleReset}
                  />
                </div>
              )}

              {/* Bouton Rejouer par défaut */}
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
              >
                🔄 Rejouer
              </button>
            </div>
          )}
        </div>

        {/* Modal de formulaire */}
        <FormHandler
          showFormModal={showFormModal}
          campaign={campaign}
          fields={fields}
          participationLoading={participationLoading}
          onClose={() => setShowFormModal(false)}
          onSubmit={handleFormSubmit}
        />
      </div>
    );
  }

  // Pour les campagnes de type "form", afficher directement le formulaire en plein écran
  if (liveCampaign.type === 'form') {
    const backgroundStyle: React.CSSProperties = {
      background: formPreviewBackground?.type === 'image'
        ? `url(${formPreviewBackground.value}) center/cover no-repeat`
        : formPreviewBackground?.value || 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
    };

    return (
      <div className="relative w-full h-[100dvh] min-h-[100dvh]">
        <div className="absolute inset-0" style={backgroundStyle} />
        
        {/* Afficher les éléments du canvas en arrière-plan */}
        <div className="relative z-10 w-full h-full">
          {formPreviewElements.map((element: any) => {
            const elementWithProps = {
              ...element,
              ...getPropertiesForDevice(element, previewMode)
            };

            if (element.type === 'text') {
              elementWithProps.width = element.width || 200;
              elementWithProps.height = element.height || 40;
              if (elementWithProps.width < 150) {
                elementWithProps.width = 150;
              }
            }

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
                containerRef={undefined}
                readOnly={true}
                onMeasureBounds={() => {}}
                onAddElement={() => {}}
                elements={formPreviewElements}
                isMultiSelecting={false}
                isGroupSelecting={false}
                activeGroupId={null}
                campaign={liveCampaign}
                extractedColors={[]}
                alignmentSystem={undefined}
              />
            );
          })}
        </div>

        {/* Afficher le formulaire configuré exactement comme dans l'éditeur */}
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {(() => {
              // Reproduire exactement la logique de DesignCanvas pour le formulaire
              const campaignDesign = (liveCampaign as any)?.design || {};
              const formPosition = (campaignDesign.formPosition as 'left' | 'right') || 'right';
              const formWidth = campaignDesign.formWidth || campaignDesign.formConfig?.widthPx ? `${campaignDesign.formConfig.widthPx}px` : '360px';
              const buttonColor = campaignDesign.buttonColor || '#841b60';
              const buttonTextColor = campaignDesign.buttonTextColor || '#ffffff';
              const borderColor = campaignDesign.borderColor || '#E5E7EB';
              const focusColor = buttonColor;
              const borderRadius = typeof campaignDesign.borderRadius === 'number' ? `${campaignDesign.borderRadius}px` : (campaignDesign.borderRadius || '12px');
              const inputBorderRadius = typeof campaignDesign.inputBorderRadius === 'number' ? campaignDesign.inputBorderRadius : (typeof campaignDesign.borderRadius === 'number' ? campaignDesign.borderRadius : 2);
              const panelBg = campaignDesign.blockColor || '#ffffff';
              const textColor = campaignDesign?.textStyles?.label?.color || '#111827';
              const title = (liveCampaign as any)?.screens?.[1]?.title || 'Vos informations';
              const description = (liveCampaign as any)?.screens?.[1]?.description || 'Remplissez le formulaire pour participer';
              const submitLabel = (liveCampaign as any)?.screens?.[1]?.buttonText || 'SPIN';

              return (
                <div
                  className={`absolute z-[60] opacity-100 pointer-events-auto flex`}
                  style={{
                    // Centrage vertical et ancrage horizontal selon la position choisie
                    top: '50%',
                    transform: 'translateY(-50%)',
                    ...(formPosition === 'left' ? { left: '4%' } : { right: '4%' }),
                    // Largeur configurée par l'utilisateur
                    width: formWidth,
                    height: 'auto',
                    maxHeight: 'calc(100% - 32px)'
                  }}
                  data-canvas-ui
                >
                  <div
                    className={`w-full shadow-2xl rounded-xl p-6 overflow-y-auto`}
                    style={{ backgroundColor: panelBg, maxHeight: 'calc(100% - 0px)' }}
                  >
                    <div className="flex flex-col" style={{ color: textColor, fontFamily: campaignDesign.fontFamily }}>
                      <div className="mb-4">
                        <h3 className="text-base font-semibold" style={{ color: textColor }}>{title}</h3>
                        <p className="text-xs opacity-80" style={{ color: textColor }}>{description}</p>
                      </div>
                      <div
                        className="rounded-md border"
                        style={{ borderColor, borderWidth: 2, borderRadius, backgroundColor: panelBg }}
                      >
                        <div className="p-3">
                          <DynamicContactForm
                            fields={fields}
                            onSubmit={() => {}}
                            submitLabel={submitLabel}
                            textStyles={{
                              label: { ...(campaignDesign.textStyles?.label || {}), color: textColor, fontFamily: campaignDesign.fontFamily },
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
              );
            })()}
          </div>
        </div>

        <FormHandler
          showFormModal={showFormModal}
          campaign={campaign}
          fields={fields}
          participationLoading={participationLoading}
          onClose={() => setShowFormModal(false)}
          onSubmit={handleFormSubmit}
        />
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
        fullScreen={false}
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
