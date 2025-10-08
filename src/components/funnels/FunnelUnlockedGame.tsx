import React, { useMemo, useState, useEffect } from 'react';
import { useParticipations } from '../../hooks/useParticipations';
import { toast } from 'react-toastify';
import CanvasGameRenderer from './components/CanvasGameRenderer';
import GameRenderer from './components/GameRenderer';
import ResultScreen from './components/ResultScreen';
import FormHandler from './components/FormHandler';
import DynamicContactForm from '../forms/DynamicContactForm';
import { UNLOCKED_GAME_TYPES } from '../../utils/funnelMatcher';
import { FieldConfig } from '../forms/DynamicContactForm';
import { useEditorStore } from '../../stores/editorStore';
import CanvasElement from '../ModelEditor/CanvasElement';
import { useUniversalResponsive } from '../../hooks/useUniversalResponsive';
import { getDeviceDimensions } from '../../utils/deviceDimensions';
import { useEditorPreviewSync } from '../../hooks/useEditorPreviewSync';
import ScratchCardCanvas from '../ScratchCardEditor/ScratchCardCanvas';
import { useScratchCardStore } from '../ScratchCardEditor/state/scratchcard.store';
import { QuizModuleRenderer } from '../ScratchCardEditor/QuizRenderer';
import { DesignModuleRenderer } from '../DesignEditor/DesignRenderer';

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

interface FunnelUnlockedGameProps {
  campaign: any;
  previewMode: 'mobile' | 'tablet' | 'desktop';
  mobileConfig?: any;
  wheelModalConfig?: any; // Configuration en temps réel depuis le Design Editor
  onReset?: () => void;
  launchButtonStyles?: React.CSSProperties;
}

const FunnelUnlockedGame: React.FC<FunnelUnlockedGameProps> = ({
  campaign,
  previewMode = 'desktop',
  mobileConfig,
  wheelModalConfig,
  launchButtonStyles
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
  const [hasPlayed, setHasPlayed] = useState(false);

  // Écouter les mises à jour de style pour forcer le re-render (comme FunnelQuizParticipate)
  React.useEffect(() => {
    const handleStyleUpdate = () => {
      console.log('🔄 [FunnelUnlockedGame] Style update received, forcing re-render');
      setForceUpdate(prev => prev + 1);
    };
    
    const handleEditorSync = (e: Event) => {
      console.log('🔄 [FunnelUnlockedGame] Editor sync event received:', (e as CustomEvent).detail);
      setForceUpdate(prev => prev + 1);
    };
    
    window.addEventListener('quizStyleUpdate', handleStyleUpdate);
    window.addEventListener('modularModuleSelected', handleStyleUpdate);
    window.addEventListener('editor-background-sync', handleEditorSync);
    window.addEventListener('editor-modules-sync', handleEditorSync);
    window.addEventListener('editor-module-sync', handleEditorSync);
    window.addEventListener('editor-force-sync', handleEditorSync);
    
    return () => {
      window.removeEventListener('quizStyleUpdate', handleStyleUpdate);
      window.removeEventListener('modularModuleSelected', handleStyleUpdate);
      window.removeEventListener('editor-background-sync', handleEditorSync);
      window.removeEventListener('editor-modules-sync', handleEditorSync);
      window.removeEventListener('editor-module-sync', handleEditorSync);
      window.removeEventListener('editor-force-sync', handleEditorSync);
    };
  }, []);

  // Écouter les MAJ d'image de fond (DesignCanvas) pour forcer le re-render du preview
  React.useEffect(() => {
    const handleBgSync = (e: Event) => {
      const detail = (e as CustomEvent<any>)?.detail;
      console.log('🔄 [FunnelUnlockedGame] Background sync event:', detail);
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
        console.log('🔄 [FunnelUnlockedGame] storage change:', e.key);
        setForceUpdate(prev => prev + 1);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
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
  const safeZonePadding = SAFE_ZONE_PADDING[previewMode] ?? SAFE_ZONE_PADDING.desktop;
  const safeZoneRadius = SAFE_ZONE_RADIUS[previewMode] ?? SAFE_ZONE_RADIUS.desktop;
  
  // Hook de synchronisation pour obtenir les données canoniques
  const { getCanonicalPreviewData } = useEditorPreviewSync();
  
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
        },
        // Préserver les messages personnalisés
        scratchResultMessages: storeCampaign.scratchResultMessages || campaign.scratchResultMessages
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

  // Helper: lire un éventuel override local (par écran et par appareil) depuis sessionStorage
  const getPerScreenBg = (screen: 'screen1' | 'screen2' | 'screen3', device: 'desktop' | 'tablet' | 'mobile'): string | null => {
    try {
      const url = localStorage.getItem(`sc-bg-${device}-${screen}`);
      if (url && typeof url === 'string' && url.length > 0) return url;
    } catch {}
    return null;
  };

  // Background style avec synchronisation en temps réel et override par écran (DesignCanvas)
  // Utilise les données canoniques du hook de synchronisation
  const backgroundStyle: React.CSSProperties = useMemo(() => {
    const perScreenUrl = getPerScreenBg(currentScreen, previewMode);
    if (perScreenUrl) {
      return { background: `url(${perScreenUrl}) center/cover no-repeat` };
    }
    
    // Obtenir les données canoniques depuis le hook de synchronisation
    const canonicalData = getCanonicalPreviewData();
    const canonicalBg = canonicalData.background;
    
    console.log('🖼️ [FunnelUnlockedGame] Using canonical background:', {
      currentScreen,
      previewMode,
      type: canonicalBg.type,
      value: canonicalBg.value?.substring(0, 50) + '...',
      timestamp: canonicalData.timestamp
    });
    
    // Utiliser directement les données canoniques
    if (canonicalBg.type === 'image' && canonicalBg.value) {
      return { background: `url(${canonicalBg.value}) center/cover no-repeat` };
    }
    
    return { background: canonicalBg.value };
  }, [currentScreen, previewMode, getCanonicalPreviewData, forceUpdate]);

  // Récupérer directement modularPage depuis les données canoniques
  const canonicalData = getCanonicalPreviewData();
  const designModular = liveCampaign?.design?.designModules;
  const modularPage = designModular || canonicalData.modularPage;
  const modules = modularPage.screens.screen1 || [];
  const modules2 = modularPage.screens.screen2 || [];
  const modules3 = modularPage.screens.screen3 || [];
  
  console.log('📦 [FunnelUnlockedGame] Using canonical modules:', {
    screen1Count: modules.length,
    screen2Count: modules2.length,
    screen3Count: modules3.length,
    timestamp: canonicalData.timestamp
  });

  // Séparer les modules Logo et Footer pour l'écran 1
  const logoModules1 = (modules || []).filter((m: any) => m?.type === 'BlocLogo');
  const footerModules1 = (modules || []).filter((m: any) => m?.type === 'BlocPiedDePage');
  const regularModules1 = (modules || []).filter((m: any) => m?.type !== 'BlocLogo' && m?.type !== 'BlocPiedDePage');
  const logoBandHeight1 = logoModules1.reduce((acc: number, m: any) => Math.max(acc, m?.bandHeight ?? 60), 0);

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
    if (!formValidated) {
      setShowFormModal(true);
    }
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
      setHasPlayed(false);
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
    setHasPlayed(true);
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
    setHasPlayed(false);
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
          <div className="absolute inset-0 pointer-events-none z-20">
            <div
              className="absolute border border-dashed border-white/60"
              style={{
                inset: safeZonePadding,
                borderRadius: safeZoneRadius,
                boxShadow: '0 0 0 1px rgba(12, 18, 31, 0.08) inset'
              }}
            />
          </div>
          <div className="absolute inset-0 z-0" style={backgroundStyle} />
          <div className="relative z-30 h-full w-full" style={{ padding: safeZonePadding, boxSizing: 'border-box' }}>
            <ResultScreen 
              gameResult={gameResult} 
              campaign={liveCampaign} 
              mobileConfig={mobileConfig} 
              onReset={handleReset}
              launchButtonStyles={launchButtonStyles}
            />
          </div>
        </div>
      </div>
    );
  }

  const hasDesignModules = Boolean(
    designModular &&
    designModular.screens &&
    Object.values(designModular.screens).some((screenModules: any) => Array.isArray(screenModules) && screenModules.length > 0)
  );

  if (hasDesignModules && currentScreen === 'screen1') {
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[DesignPreview] Rendering design modules', {
          screen1: modules?.map((m: any) => ({ id: m.id, type: m.type })),
          screen2: modules2?.map((m: any) => ({ id: m.id, type: m.type })),
          screen3: modules3?.map((m: any) => ({ id: m.id, type: m.type }))
        });
      } catch (error) {
        console.warn('[DesignPreview] Unable to log design modules', error);
      }
    }
    return (
      <div className="w-full h-[100dvh] min-h-[100dvh]">
        <div className="relative w-full h-full">
          <div className="absolute inset-0 z-0" style={backgroundStyle} />
          <div
            className="relative z-30 h-full w-full overflow-y-auto"
            style={{ padding: safeZonePadding, boxSizing: 'border-box' }}
          >
            {modules.length > 0 && (
              <section className="space-y-6" data-design-screen="screen1">
                <DesignModuleRenderer
                  modules={modules as any}
                  previewMode
                  device={previewMode}
                  onButtonClick={handleGameButtonClick}
                />
              </section>
            )}

          </div>
        </div>
      </div>
    );
  }

  if (liveCampaign.type === 'scratch') {
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

          {/* ÉCRAN 1 : Avant le jeu */}
          {currentScreen === 'screen1' && (
            <>
              {/* Bande logo absolue en haut (comme l'éditeur) */}
              {logoModules1.length > 0 && (
                <div
                  className="absolute left-0 top-0 w-full z-40"
                  style={{ pointerEvents: 'none', padding: safeZonePadding, boxSizing: 'border-box' }}
                >
                  <div className="w-full" style={{ pointerEvents: 'auto' }}>
                    <QuizModuleRenderer 
                      modules={logoModules1}
                      previewMode={true}
                      device={previewMode}
                    />
                  </div>
                </div>
              )}

              {/* Contenu régulier sous la bande - Layout identique à l'éditeur */}
              <div
                className="relative z-30 h-full w-full"
                style={{ padding: safeZonePadding, boxSizing: 'border-box' }}
              >
                {logoModules1.length > 0 && (
                  <div style={{ height: logoBandHeight1 }} />
                )}
                {regularModules1.length > 0 && (
                  <QuizModuleRenderer 
                    modules={regularModules1}
                    previewMode={true}
                    device={previewMode}
                    onButtonClick={handleGameButtonClick}
                  />
                )}
              </div>

              {/* Bande footer absolue en bas */}
              {footerModules1.length > 0 && (
                <div
                  className="absolute left-0 bottom-0 w-full z-40"
                  style={{ pointerEvents: 'none', padding: safeZonePadding, boxSizing: 'border-box' }}
                >
                  <div className="w-full" style={{ pointerEvents: 'auto' }}>
                    <QuizModuleRenderer 
                      modules={footerModules1}
                      previewMode={true}
                      device={previewMode}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* ÉCRAN 2 : Cartes visibles (bloquées si formulaire non validé) */}
          {currentScreen === 'screen2' && gameResult === null && (
            <>
              {/* Modules screen2 - en arrière-plan - Layout identique à l'éditeur */}
              <div
                className="relative z-30 h-full w-full"
                style={{ pointerEvents: 'none', padding: safeZonePadding, boxSizing: 'border-box' }}
              >
                {modules2.length > 0 && (
                  <QuizModuleRenderer 
                    modules={modules2}
                    previewMode={true}
                    device={previewMode}
                  />
                )}
              </div>

              {/* Game Component (Roue ou Cartes selon le type) */}
              <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 50 }}>
                {liveCampaign.type === 'wheel' || campaign.type === 'wheel' ? (
                  <GameRenderer
                    campaign={liveCampaign}
                    formValidated={formValidated}
                    showValidationMessage={false}
                    previewMode={previewMode}
                    mobileConfig={mobileConfig}
                    onGameFinish={handleGameFinish}
                    onGameStart={() => console.log('Game started')}
                    onGameButtonClick={handleCardClick}
                  />
                ) : (
                  <ScratchCardCanvas 
                    selectedDevice={previewMode}
                    previewMode={!formValidated}
                  />
                )}
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

          {/* ÉCRAN 3 : Après le jeu (gameResult='win' ou 'lose') - Layout identique à l'éditeur */}
          {gameResult !== null && (
            <div
              className="relative z-30 h-full w-full"
              style={{ padding: safeZonePadding, boxSizing: 'border-box' }}
            >
              {modules3.length > 0 && (
                <QuizModuleRenderer 
                  modules={modules3}
                  previewMode={true}
                  device={previewMode}
                  onButtonClick={handleReset}
                />
              )}
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
          launchButtonStyles={launchButtonStyles}
        />
      </div>
    );
  }

  // Pour les campagnes de type "form", afficher directement le formulaire en plein écran
  if (liveCampaign.type === 'form') {
    // Sélectionner l'image de fond appropriée selon le device pour les formulaires
    const design = liveCampaign?.design || campaign?.design;
    let formBackgroundUrl: string | undefined;
    
    if (previewMode === 'mobile') {
      formBackgroundUrl = design?.mobileBackgroundImage || design?.backgroundImage;
    } else {
      formBackgroundUrl = design?.backgroundImage;
    }
    
    const backgroundStyle: React.CSSProperties = {
      background: formBackgroundUrl
        ? `url(${formBackgroundUrl}) center/cover no-repeat`
        : formPreviewBackground?.type === 'image'
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
          launchButtonStyles={launchButtonStyles}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <CanvasGameRenderer 
        campaign={liveCampaign} 
        formValidated={formValidated && !hasPlayed} 
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
        launchButtonStyles={launchButtonStyles}
      />
    </div>
  );
};

export default FunnelUnlockedGame;
