import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import TemplatedQuiz from '../shared/TemplatedQuiz';
import FormHandler from './components/FormHandler';
import DynamicContactForm from '../forms/DynamicContactForm';
import type { Tables } from '@/integrations/supabase/types';
import { QuizModuleRenderer } from '../QuizEditor/QuizRenderer';
import { useParticipations } from '../../hooks/useParticipations';
import type { Module } from '@/types/modularEditor';
import { useEditorPreviewSync } from '@/hooks/useEditorPreviewSync';
import { useEditorStore } from '@/stores/editorStore';

const SAFE_ZONE_PADDING: Record<'desktop' | 'tablet' | 'mobile', number> = {
  desktop: 56,
  tablet: 40,
  mobile: 28
};

const SAFE_ZONE_RADIUS: Record<'desktop' | 'tablet' | 'mobile', number> = {
  desktop: 40,
  tablet: 32,
  mobile: 24
};

interface FunnelQuizParticipateProps {
  campaign: Tables<'campaigns'>;
  previewMode: 'mobile' | 'tablet' | 'desktop';
}

// Flow: Participate button -> Quiz -> Form -> Thank you (+optional score) -> Replay
const FunnelQuizParticipate: React.FC<FunnelQuizParticipateProps> = ({ campaign, previewMode }) => {
  const [phase, setPhase] = useState<'participate' | 'quiz' | 'form' | 'thankyou'>('participate');
  const [score, setScore] = useState<number>(0);
  
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [participationLoading, setParticipationLoading] = useState<boolean>(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  const showScore = !!(campaign?.game_config as any)?.quiz?.showScore;
  const storeCampaign = useEditorStore((state) => state.campaign);
  const { getCanonicalPreviewData } = useEditorPreviewSync();
  
  // Écouter les mises à jour de style pour forcer le re-render
  useEffect(() => {
    const handleStyleUpdate = () => {
      console.log('🔄 [FunnelQuizParticipate] Style update received, forcing re-render');
      setForceUpdate(prev => prev + 1);
    };
    
    const handleFormFieldsSync = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      console.log('📋 [FunnelQuizParticipate] FormFields sync event received:', {
        fieldsCount: detail?.formFields?.length,
        timestamp: detail?.timestamp
      });
      setForceUpdate(prev => prev + 1);
    };
    
    window.addEventListener('quizStyleUpdate', handleStyleUpdate);
    window.addEventListener('quizStyleUpdateFallback', handleStyleUpdate);
    window.addEventListener('modularModuleSelected', handleStyleUpdate);
    window.addEventListener('editor-formfields-sync', handleFormFieldsSync);
    window.addEventListener('editor-force-sync', handleFormFieldsSync);
    
    return () => {
      window.removeEventListener('quizStyleUpdate', handleStyleUpdate);
      window.removeEventListener('quizStyleUpdateFallback', handleStyleUpdate);
      window.removeEventListener('modularModuleSelected', handleStyleUpdate);
      window.removeEventListener('editor-formfields-sync', handleFormFieldsSync);
      window.removeEventListener('editor-force-sync', handleFormFieldsSync);
    };
  }, []);

  // Écouter les MAJ d'image de fond (DesignCanvas) pour forcer le re-render du preview
  React.useEffect(() => {
    const handleBgSync = (e: Event) => {
      const detail = (e as CustomEvent<any>)?.detail;
      console.log('🔄 [FunnelQuizParticipate] Background sync event:', detail);
      setForceUpdate(prev => prev + 1);
    };
    window.addEventListener('sc-bg-sync', handleBgSync);
    window.addEventListener('applyBackgroundAllScreens', handleBgSync);
    window.addEventListener('applyBackgroundCurrentScreen', handleBgSync);
    return () => {
      window.removeEventListener('sc-bg-sync', handleBgSync);
      window.removeEventListener('applyBackgroundAllScreens', handleBgSync);
      window.removeEventListener('applyBackgroundCurrentScreen', handleBgSync);
    };
  }, []);

  // Synchronize with localStorage changes (cross-frame) for background overrides
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key.startsWith('sc-bg-')) {
        console.log('🔄 [FunnelQuizParticipate] storage change:', e.key);
        setForceUpdate(prev => prev + 1);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const rawReplayButton = (campaign as any)?.screens?.[3]?.replayButtonText;
  const shouldRenderReplayButton = rawReplayButton !== '';
  const replayButtonLabel = (() => {
    if (!shouldRenderReplayButton) return '';
    if (typeof rawReplayButton === 'string') {
      const trimmed = rawReplayButton.trim();
      if (trimmed.length > 0) return rawReplayButton;
    } else if (rawReplayButton) {
      return String(rawReplayButton);
    }
    return 'Rejouer';
  })();

  const { createParticipation } = useParticipations();

  const safeZonePadding = SAFE_ZONE_PADDING[previewMode] ?? SAFE_ZONE_PADDING.desktop;
  const safeZoneRadius = SAFE_ZONE_RADIUS[previewMode] ?? SAFE_ZONE_RADIUS.desktop;

  const fields = useMemo(() => {
    // Priorité 1: Données canoniques du hook de synchronisation
    const canonicalData = getCanonicalPreviewData();
    if (canonicalData.formFields && Array.isArray(canonicalData.formFields) && canonicalData.formFields.length > 0) {
      console.log('📋 [FunnelQuizParticipate] ✅ Using canonical formFields:', {
        count: canonicalData.formFields.length,
        fields: canonicalData.formFields.map((f: any) => ({ id: f.id, label: f.label, type: f.type })),
        timestamp: canonicalData.timestamp
      });
      return canonicalData.formFields;
    }
    
    // Priorité 2: Store campaign
    if (storeCampaign?.formFields && Array.isArray(storeCampaign.formFields) && storeCampaign.formFields.length > 0) {
      console.log('📋 [FunnelQuizParticipate] ⚠️ Using storeCampaign formFields:', {
        count: storeCampaign.formFields.length,
        fields: storeCampaign.formFields.map((f: any) => ({ id: f.id, label: f.label, type: f.type }))
      });
      return storeCampaign.formFields;
    }
    
    // Priorité 3: Campaign props (form_fields avec underscore OU formFields camelCase)
    const campaignFields = (campaign as any)?.formFields || campaign?.form_fields;
    if (campaignFields && Array.isArray(campaignFields) && campaignFields.length > 0) {
      console.log('📋 [FunnelQuizParticipate] ⚠️ Using campaign formFields (default from generator):', {
        count: campaignFields.length,
        fields: campaignFields.map((f: any) => ({ id: f.id, label: f.label, type: f.type }))
      });
      return campaignFields;
    }
    
    // Fallback: Champs par défaut
    console.warn('📋 [FunnelQuizParticipate] ❌ Using fallback default formFields');
    return [
      { id: 'prenom', label: 'Prénom', type: 'text', required: true },
      { id: 'nom', label: 'Nom', type: 'text', required: true },
      { id: 'email', label: 'Email', type: 'email', required: true }
    ];
  }, [getCanonicalPreviewData, storeCampaign?.formFields, storeCampaign?._lastUpdate, campaign?.form_fields, (campaign as any)?.formFields, forceUpdate]);

  const backgroundStyle: React.CSSProperties = useMemo(() => {
    const design = (campaign.design as any);
    const canvasBackground = (campaign as any)?.canvasConfig?.background || design?.background;
    
    // Debug: log pour voir ce qu'on reçoit
    console.log('🖼️ [FunnelQuizParticipate] Background debug:', {
      previewMode,
      designBackground: design?.background,
      canvasBackground,
      designBackgroundImage: design?.backgroundImage,
      designMobileBackgroundImage: design?.mobileBackgroundImage
    });
    
    // PRIORITÉ 1: Vérifier si design.background est un objet image
    if (design?.background && typeof design.background === 'object' && design.background.type === 'image' && design.background.value) {
      console.log('✅ [FunnelQuizParticipate] Using design.background.value:', design.background.value.substring(0, 50) + '...');
      return { background: `url(${design.background.value}) center/cover no-repeat` };
    }
    
    // PRIORITÉ 2: Vérifier les propriétés backgroundImage/mobileBackgroundImage
    let backgroundImageUrl: string | undefined;
    if (previewMode === 'mobile') {
      backgroundImageUrl = design?.mobileBackgroundImage || design?.backgroundImage;
    } else {
      backgroundImageUrl = design?.backgroundImage;
    }
    
    if (backgroundImageUrl) {
      console.log('✅ [FunnelQuizParticipate] Using backgroundImageUrl:', backgroundImageUrl.substring(0, 50) + '...');
      return { background: `url(${backgroundImageUrl}) center/cover no-repeat` };
    }
    
    // PRIORITÉ 3: Vérifier canvasBackground
    if (canvasBackground?.type === 'image' && canvasBackground?.value) {
      console.log('✅ [FunnelQuizParticipate] Using canvasBackground.value:', canvasBackground.value.substring(0, 50) + '...');
      return { background: `url(${canvasBackground.value}) center/cover no-repeat` };
    }
    
    // FALLBACK: Utiliser la couleur ou le gradient
    const fallbackBg = canvasBackground?.value || design?.background?.value || '#ffffff';
    console.log('⚠️ [FunnelQuizParticipate] Using fallback background:', fallbackBg);
    return { background: fallbackBg };
  }, [campaign?.design, (campaign as any)?.canvasConfig?.background, previewMode, forceUpdate]);

  // Récupérer directement modularPage pour un rendu unifié
  const campaignAny = campaign as any;
  const modularPage = campaignAny?.modularPage || { screens: { screen1: [], screen2: [], screen3: [] }, _updatedAt: Date.now() };
  const modules = modularPage.screens.screen1 || [];
  const modules2 = modularPage.screens.screen2 || [];
  const modules3 = modularPage.screens.screen3 || [];

  type LayoutWidth = NonNullable<Module['layoutWidth']>;
  const layoutSpan: Record<LayoutWidth, number> = {
    full: 6,
    half: 3,
    twoThirds: 4,
    third: 2
  };

  const getModuleSpan = (module: Module): number => {
    const width = (module.layoutWidth || 'full') as LayoutWidth;
    return layoutSpan[width] ?? 6;
  };

  const buildRows = (mods: Module[]): Module[][] => {
    const rows: Module[][] = [];
    let current: Module[] = [];
    let currentUnits = 0;
    const MAX_ROW_UNITS = 6;

    mods.forEach((module) => {
      const span = getModuleSpan(module);
      if (current.length > 0 && currentUnits + span > MAX_ROW_UNITS) {
        rows.push(current);
        current = [];
        currentUnits = 0;
      }

      current.push(module);
      currentUnits += span;

      if (currentUnits === MAX_ROW_UNITS) {
        rows.push(current);
        current = [];
        currentUnits = 0;
      }
    });

    if (current.length > 0) {
      rows.push(current);
    }

    return rows;
  };

  const renderModuleGrid = (mods: Module[], options?: { onButtonClick?: () => void; device?: 'desktop' | 'tablet' | 'mobile' }) => {
    if (!mods?.length) return null;

    const device = options?.device || previewMode;
    const isMobile = device === 'mobile';
    const modulePaddingClass = isMobile ? 'p-0' : 'p-4';
    const rows = buildRows(mods);

    return (
      <div className="w-full max-w-[1500px]">
        <div className="flex flex-col gap-6">
          {rows.map((row, rowIndex) => {
            const hasSplit = row.some((module) => getModuleSpan(module) !== 6);
            return (
              <div
                key={`preview-row-${rowIndex}`}
                className={`grid grid-cols-1 gap-4 md:gap-6 ${hasSplit ? 'md:grid-cols-6' : 'md:grid-cols-6'}`}
              >
                {row.map((module) => {
                  const span = getModuleSpan(module);
                  const spanClass = span === 6 ? 'md:col-span-6' : `md:col-span-${span}`;
                  const paddingClass = module.type === 'BlocTexte'
                    ? (isMobile ? 'px-0 py-0' : 'px-0 py-1')
                    : modulePaddingClass;

                  return (
                    <div key={module.id} className={`w-full ${spanClass}`}>
                      <div className={`w-full ${paddingClass}`}>
                        <QuizModuleRenderer
                          modules={[module]}
                          previewMode={true}
                          device={device}
                          onButtonClick={options?.onButtonClick}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  console.log('🔍 [FunnelQuizParticipate] Component state:', {
    phase,
    screen1Count: modules.length,
    screen2Count: modules2.length,
    screen3Count: modules3.length,
    screen1: modules.map((m: any) => ({ id: m.id, type: m.type })),
    screen2: modules2.map((m: any) => ({ id: m.id, type: m.type })),
    screen3: modules3.map((m: any) => ({ id: m.id, type: m.type })),
    campaignId: campaign?.id,
    fullModularPage: modularPage,
    campaignModularPage: campaignAny?.modularPage
  });

  // Vérifier si une carte contient un bouton sur écran 1
  const carteWithButton = Array.isArray(modules)
    ? (modules as any[]).find((m) => 
        m?.type === 'BlocCarte' && 
        Array.isArray(m.children) && 
        m.children.some((child: any) => child?.type === 'BlocBouton')
      )
    : undefined;

  // Vérifier si une carte contient un bouton sur écran 3
  const carteWithButtonScreen3 = Array.isArray(modules3)
    ? (modules3 as any[]).find((m) => 
        m?.type === 'BlocCarte' && 
        Array.isArray(m.children) && 
        m.children.some((child: any) => child?.type === 'BlocBouton')
      )
    : undefined;

  // Si un module BlocBouton est défini (ou dans une carte), on l'utilise comme source de vérité pour le style du CTA preview
  const ctaModule: any | undefined = carteWithButton
    ? carteWithButton.children.find((c: any) => c?.type === 'BlocBouton')
    : Array.isArray(modules)
    ? (modules as any[]).find((m) => m?.type === 'BlocBouton')
    : undefined;

  const hasPrimaryCTA = Boolean(ctaModule);

  // Styles par défaut (hérités de gameConfig/buttonConfig) si aucun BlocBouton n'est présent
  const defaultParticipateStyles = useMemo(() => {
    const defaultBackground = '#000000';
    const buttonStyles = campaignAny?.gameConfig?.quiz?.buttonStyles || campaignAny?.buttonConfig?.styles || {};
    const style: React.CSSProperties = {
      background: buttonStyles.background || defaultBackground,
      color: buttonStyles.color || campaignAny?.buttonConfig?.textColor || '#ffffff',
      padding: buttonStyles.padding || '14px 28px',
      borderRadius: buttonStyles.borderRadius || campaignAny?.buttonConfig?.borderRadius || '9999px',
      boxShadow: buttonStyles.boxShadow || '0 4px 12px rgba(0, 0, 0, 0.15)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600
    };
    return style;
  }, [campaign]);

  // Styles du CTA réellement utilisés dans le preview: miroir du BlocBouton si présent
  const ctaStyles: React.CSSProperties = useMemo(() => {
    if (!ctaModule) return defaultParticipateStyles;
    return {
      background: ctaModule.background || defaultParticipateStyles.background,
      color: ctaModule.textColor || defaultParticipateStyles.color || '#ffffff',
      borderRadius: `${ctaModule.borderRadius ?? 9999}px`,
      border: `${ctaModule.borderWidth ?? 0}px solid ${ctaModule.borderColor || '#000000'}`,
      boxShadow: ctaModule.boxShadow || defaultParticipateStyles.boxShadow || 'none',
      padding: ctaModule.padding || defaultParticipateStyles.padding || '14px 28px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: (ctaModule.bold ? 700 : 600) as any,
      textTransform: ctaModule.uppercase ? 'uppercase' : undefined,
      width: 'min(280px, 100%)'
    } as React.CSSProperties;
  }, [ctaModule, defaultParticipateStyles]);

  const ctaLabel = ctaModule?.label || (campaignAny?.buttonConfig?.text || campaignAny?.screens?.[0]?.buttonText || 'Participer');
  const ctaClassName = `rounded-lg transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-white/70 mt-4 ${ctaModule?.uppercase ? 'uppercase' : ''} ${ctaModule?.bold ? 'font-bold' : 'font-semibold'}`;

  const handleParticipate = () => {
    setPhase('quiz');
  };

  const handleQuizComplete = () => {
    console.log('🎯 [FunnelQuizParticipate] Quiz completed');
    console.log('📋 [FunnelQuizParticipate] Current phase:', phase);
    console.log('📝 [FunnelQuizParticipate] Fields:', fields);
    console.log('🔍 [FunnelQuizParticipate] Campaign object:', campaign);
    
    // Check if form should be shown before result
    const showFormBeforeResult = (campaign as any)?.showFormBeforeResult ?? true;
    console.log('🔍 [FunnelQuizParticipate] showFormBeforeResult:', showFormBeforeResult);
    console.log('🔍 [FunnelQuizParticipate] Raw campaign.showFormBeforeResult:', (campaign as any)?.showFormBeforeResult);
    
    // FORCE FORM DISPLAY FOR DEBUGGING
    console.warn('⚠️ [FunnelQuizParticipate] FORCING FORM DISPLAY - showFormBeforeResult is TRUE by default');
    
    if (showFormBeforeResult) {
      console.log('✅ [FunnelQuizParticipate] Transitioning to form phase');
      setPhase('form');
    } else {
      console.log('⏭️ [FunnelQuizParticipate] Skipping form, going directly to thank you');
      setPhase('thankyou');
    }
  };

  const handleFormSubmit = async (formData: Record<string, string>) => {
    setParticipationLoading(true);
    try {
      if (campaign.id) {
        await createParticipation({
          campaign_id: campaign.id,
          form_data: { ...formData, score },
          user_email: formData.email
        });
      }
      setShowFormModal(false);
      setPhase('thankyou');
    } catch (e) {
      console.error('[FunnelQuizParticipate] submit error', e);
      toast.error('Erreur lors de la soumission du formulaire');
    } finally {
      setParticipationLoading(false);
    }
  };

  const handleReplay = () => {
    setScore(0);
    setPhase('participate');
  };

  return (
    <div className="w-full h-[100dvh] min-h-[100dvh]">
      <div className="relative w-full h-full">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute border border-dashed border-white/60"
            style={{
              inset: safeZonePadding,
              borderRadius: safeZoneRadius,
              boxShadow: '0 0 0 1px rgba(12, 18, 31, 0.08) inset'
            }}
          />
        </div>
        <div className="absolute inset-0" style={backgroundStyle} />

        {/* Participate phase */}
        {phase === 'participate' && (() => {
          console.log('🎯 [FunnelQuizParticipate] Rendering screen1 - modules:', modules.length, 'hasPrimaryCTA:', hasPrimaryCTA);
          return (
            <div
              className="relative z-10 h-full flex flex-col items-center justify-center gap-6"
              style={{ padding: safeZonePadding, boxSizing: 'border-box' }}
            >
              {/* Render modules using unified QuizModuleRenderer */}
              {modules.length > 0 ? (
                renderModuleGrid(modules as Module[], { onButtonClick: handleParticipate, device: previewMode })
              ) : (
                <div className="text-center text-white/80">
                  <p className="text-sm mb-4">Aucun contenu configuré pour l'écran 1</p>
                </div>
              )}
              
              {/* Bouton Participer - affiché uniquement si aucun CTA modulaire n'est présent */}
              {!hasPrimaryCTA && (
                <button
                  onClick={handleParticipate}
                  className={ctaClassName}
                  style={ctaStyles}
                >
                  {ctaLabel}
                </button>
              )}
            </div>
          );
        })()}

        {/* Quiz phase - Afficher le quiz réel */}
        {phase === 'quiz' && (
          <div
            className="relative z-10 h-full flex flex-col gap-6"
            style={{ padding: safeZonePadding, boxSizing: 'border-box' }}
          >
            {/* Modules de l'écran 2 */}
            {renderModuleGrid(modules2 as Module[], { device: previewMode })}
            <div className="w-full max-w-2xl">
              {/* Utiliser le composant TemplatedQuiz pour afficher le quiz */}
              <TemplatedQuiz
                campaign={campaign}
                device={previewMode}
                disabled={false}
                onClick={handleQuizComplete}
                templateId={campaignAny?.gameConfig?.quiz?.templateId || 'image-quiz'}
                onAnswerSelected={(isCorrect: boolean) => {
                  if (isCorrect) {
                    setScore(prev => prev + 1);
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Form phase - Afficher le formulaire dans le funnel */}
        {phase === 'form' && (() => {
          console.log('📝 [FunnelQuizParticipate] Rendering FORM phase');
          console.log('📋 Fields to render:', fields);
          console.warn('⚠️ [FunnelQuizParticipate] FORM PHASE IS ACTIVE - YOU SHOULD SEE THE FORM NOW');
          return (
            <div
              className="relative z-10 h-full flex flex-col items-center justify-center gap-6"
              style={{ padding: safeZonePadding, boxSizing: 'border-box' }}
            >
              {/* Debug indicator */}
              <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg z-50">
                ✅ FORMULAIRE ACTIF (phase={phase})
              </div>
              
              <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                  {campaignAny?.screens?.[1]?.title || 'Vos informations'}
                </h2>
                {campaignAny?.screens?.[1]?.description && (
                  <p className="text-sm text-gray-600 mb-6 text-center">
                    {campaignAny.screens[1].description}
                  </p>
                )}
                <DynamicContactForm
                  fields={fields as any}
                  submitLabel={participationLoading ? 'Chargement...' : campaignAny?.screens?.[1]?.buttonText || "Participer"}
                  onSubmit={handleFormSubmit}
                  textStyles={{
                    label: {
                      color: '#374151',
                      fontFamily: 'inherit'
                    },
                    button: {
                      backgroundColor: ctaStyles.background as string || '#000000',
                      color: ctaStyles.color as string || '#ffffff',
                      borderRadius: typeof ctaStyles.borderRadius === 'string' ? ctaStyles.borderRadius : '8px',
                      fontFamily: 'inherit',
                      fontWeight: '600'
                    }
                  }}
                  inputBorderColor="#E5E7EB"
                  inputFocusColor="#000000"
                />
              </div>
            </div>
          );
        })()}

        {/* Form modal - keep for backward compatibility but hidden when in form phase */}
        {phase !== 'form' && (
          <FormHandler
            showFormModal={showFormModal}
            campaign={campaignAny}
            fields={fields as any}
            participationLoading={participationLoading}
            onClose={() => setShowFormModal(false)}
            onSubmit={handleFormSubmit}
          />
        )}

        {/* Thank you phase */}
        {phase === 'thankyou' && (
          <div className="relative z-10 h-full">
            {/* Modules de l'écran 3 */}
            {modules3.length > 0 && (
              <div
                className="w-full h-full flex flex-col gap-6"
                style={{ padding: safeZonePadding, boxSizing: 'border-box' }}
              >
                {renderModuleGrid(modules3 as Module[], { onButtonClick: handleReplay, device: previewMode })}
              </div>
            )}

            {/* Carte par défaut uniquement si pas de modules déclarés sur écran 3 */}
            {modules3.length === 0 && (
              <div
                className="absolute inset-0 flex items-center justify-center z-10 px-4"
                style={{ padding: safeZonePadding, boxSizing: 'border-box' }}
              >
                <div className="bg-white/90 backdrop-blur px-6 py-5 rounded-xl shadow max-w-md w-full text-center">
                  <div className="text-lg font-semibold text-gray-800 mb-2">
                    {campaignAny?.screens?.[3]?.confirmationTitle || 'Merci pour votre participation !'}
                  </div>
                  <div className="text-sm text-gray-700 mb-3 whitespace-pre-wrap break-words">
                    {campaignAny?.screens?.[3]?.confirmationMessage || campaignAny?.screens?.[3]?.description || 'Votre participation a bien été enregistrée.'}
                  </div>
                  {showScore && (
                    <div className="text-sm text-gray-700 mb-3">Score: {score}</div>
                  )}
                  {shouldRenderReplayButton && (
                    <div className="flex justify-center">
                      <button
                        onClick={handleReplay}
                        className="rounded-lg transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-white/70"
                        style={ctaStyles}
                      >
                        {replayButtonLabel}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Si des modules3 existent, on affiche un overlay bas pour Score/Rejouer - sauf si une carte contient déjà un bouton */}
            {modules3.length > 0 && (showScore || shouldRenderReplayButton) && !carteWithButtonScreen3 && (
              <div
                className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-3 z-20 px-4"
                style={{ paddingLeft: safeZonePadding, paddingRight: safeZonePadding, boxSizing: 'border-box' }}
              >
                {showScore && (
                  <div className="px-3 py-1 rounded-full bg-white/85 text-gray-900 text-sm font-medium shadow">
                    Score: {score}
                  </div>
                )}
                {shouldRenderReplayButton && (
                  <button
                    onClick={handleReplay}
                    className="rounded-lg transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-white/70"
                    style={ctaStyles}
                  >
                    {replayButtonLabel}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FunnelQuizParticipate;
