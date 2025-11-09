// FunnelUnlockedGame - Version avec logos/footers collés aux bords (UPDATED)
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
import { ScreenLayoutWrapper, useLayoutFromCampaign } from '../Layout/ScreenLayoutWrapper';

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

  // LOGIQUE FUNNEL UNLOCKED : écran 1 en premier, formulaire s'ouvre au grattage
  const [currentScreen, setCurrentScreen] = useState<'screen1' | 'screen2' | 'screen3'>('screen1'); // Écran 1 en premier
  const [formValidated, setFormValidated] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  const [showResultScreen, setShowResultScreen] = useState(false);
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
    
    const handleFormFieldsSync = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      console.log('📋 [FunnelUnlockedGame] FormFields sync event received:', {
        fieldsCount: detail?.formFields?.length,
        timestamp: detail?.timestamp
      });
      setForceUpdate(prev => prev + 1);
    };
    
    window.addEventListener('quizStyleUpdate', handleStyleUpdate);
    window.addEventListener('modularModuleSelected', handleStyleUpdate);
    window.addEventListener('editor-background-sync', handleEditorSync);
    window.addEventListener('editor-modules-sync', handleEditorSync);
    window.addEventListener('editor-module-sync', handleEditorSync);
    window.addEventListener('editor-force-sync', handleEditorSync);
    window.addEventListener('editor-formfields-sync', handleFormFieldsSync);
    
    return () => {
      window.removeEventListener('quizStyleUpdate', handleStyleUpdate);
      window.removeEventListener('modularModuleSelected', handleStyleUpdate);
      window.removeEventListener('editor-background-sync', handleEditorSync);
      window.removeEventListener('editor-modules-sync', handleEditorSync);
      window.removeEventListener('editor-module-sync', handleEditorSync);
      window.removeEventListener('editor-force-sync', handleEditorSync);
      window.removeEventListener('editor-formfields-sync', handleFormFieldsSync);
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

  // Safe-zone visibility: hidden by default in preview unless explicitly enabled
  const showSafeZone: boolean = React.useMemo(() => {
    try {
      if (typeof window === 'undefined') return false;
      const sp = new URLSearchParams(window.location.search);
      if ((window as any).__SHOW_SAFE_ZONE__ === true) return true;
      return sp.has('guides') || sp.get('safezone') === '1';
    } catch {
      return false;
    }
  }, []);

  const renderSafeZone = () => {
    if (!showSafeZone) return null;
    return (
      <div
        className="pointer-events-none absolute inset-0 z-[6]"
        aria-hidden="true"
      >
        <div
          className="absolute border border-dashed border-white/60"
          style={{
            inset: `${safeZonePadding}px`,
            borderRadius: `${safeZoneRadius}px`,
            boxShadow: '0 0 0 1px rgba(12, 18, 31, 0.08) inset'
          }}
        />
      </div>
    );
  };
  
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
            normalizedBackground ||
            storeCampaign.design?.background ||
            campaign.design?.background
        },
        // ✅ IMPORTANT: Synchroniser les formFields depuis le store
        formFields: storeCampaign.formFields || campaign.formFields,
        _lastUpdate: storeCampaign._lastUpdate || Date.now(),
        // Préserver les messages personnalisés (compat)
        scratchResultMessages: storeCampaign.scratchResultMessages || campaign.scratchResultMessages,
        // ✅ Nouveau: synchroniser aussi les messages de sortie unifiés
        resultMessages: (storeCampaign as any).resultMessages || (campaign as any).resultMessages
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
  // Étend les priorités pour inclure couleurs locales et background global miroir
  const backgroundStyle: React.CSSProperties = useMemo(() => {
    // Priorité 0.9: Couleur unie locale (localStorage) pour l'écran courant uniquement
    try {
      const campaignId = campaign?.id;
      if (campaignId && typeof window !== 'undefined') {
        const deviceKey = previewMode;
        const curKey = `campaign_${campaignId}:bgcolor-${deviceKey}-${currentScreen}`;
        const legacyCur = `bgcolor-${deviceKey}-${currentScreen}`;
        const quizLegacyCur = `quiz-bgcolor-${campaignId}-${deviceKey}-${currentScreen}`;
        const storedCur = localStorage.getItem(curKey) || localStorage.getItem(legacyCur) || localStorage.getItem(quizLegacyCur);
        if (storedCur && storedCur.trim().length > 0) {
          console.log('🎯 [FunnelUnlockedGame] Using stored solid color for CURRENT screen:', { value: storedCur });
          return { background: storedCur };
        }
      }
    } catch {}

    // Priorité 1: Background global le plus récent depuis campaign.canvasConfig/config.canvasConfig
    // Seulement si aucun per-screen n'existe
    try {
      const sbAny = campaign?.canvasConfig?.screenBackgrounds || campaign?.design?.screenBackgrounds || (campaign as any)?.config?.canvasConfig?.screenBackgrounds;
      const dk = previewMode;
      const hasAnyPerScreen = !!sbAny && ['screen1','screen2','screen3'].some((s) => {
        const bgS: any = (sbAny as any)[s];
        if (!bgS) return false;
        const db = bgS?.devices?.[dk];
        const chosen = db && db.value ? db : bgS;
        return !!chosen?.value;
      });
      const bg = !hasAnyPerScreen ? (campaign?.canvasConfig?.background || (campaign as any)?.config?.canvasConfig?.background) : undefined;
      if (bg && typeof bg === 'object' && bg.value) {
        if (bg.type === 'image') return { background: `url(${bg.value}) center/cover no-repeat` };
        return { background: bg.value };
      }
    } catch {}

    // Priorité 1.5: Backgrounds par écran depuis campaign (avec override par device)
    const screenBackgrounds = campaign?.canvasConfig?.screenBackgrounds || campaign?.design?.screenBackgrounds;
    if (screenBackgrounds && screenBackgrounds[currentScreen]) {
      const screenBg: any = screenBackgrounds[currentScreen];
      const deviceKey = previewMode; // 'desktop' | 'tablet' | 'mobile'
      const deviceBg = screenBg?.devices?.[deviceKey];
      const chosen = deviceBg && deviceBg.value ? deviceBg : screenBg;
      console.log(`✅ [FunnelUnlockedGame] Using screen-specific background for ${currentScreen} (${deviceKey}):`, chosen);
      if (chosen?.type === 'image' && chosen?.value) {
        return { background: `url(${chosen.value}) center/cover no-repeat` };
      }
      if (chosen?.value) return { background: chosen.value };
    }
    
    // Priorité 2: Per-screen localStorage
    const perScreenUrl = getPerScreenBg(currentScreen, previewMode);
    if (perScreenUrl) {
      return { background: `url(${perScreenUrl}) center/cover no-repeat` };
    }
    
    // Priorité 3: Obtenir les données canoniques depuis le hook de synchronisation
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
    
    return { background: canonicalBg.value || 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)' };
  }, [campaign, currentScreen, previewMode, getCanonicalPreviewData, forceUpdate]);

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

  // Séparer les modules Logo, Footer, Absolus et Réguliers pour tous les écrans
  // Seuls les BlocLogo sont traités comme des logos (sortent de la safezone avec margin négatif)
  const logoModules1 = (modules || []).filter((m: any) => m?.type === 'BlocLogo');
  const footerModules1 = (modules || []).filter((m: any) => m?.type === 'BlocPiedDePage');
  const absoluteModules1 = (modules || []).filter((m: any) => 
    m?.absolute === true && 
    m?.type !== 'BlocLogo' && 
    m?.type !== 'BlocPiedDePage'
  );
  const regularModules1 = (modules || []).filter((m: any) =>
    !m?.absolute &&
    m?.type !== 'BlocLogo' &&
    m?.type !== 'BlocPiedDePage'
  );
  
  console.log('🔍 [FunnelUnlockedGame] Module separation:', {
    total: modules?.length,
    logo: logoModules1.length,
    footer: footerModules1.length,
    absolute: absoluteModules1.length,
    regular: regularModules1.length,
    safeZonePadding,
    allModulesDetails: modules?.map((m: any) => ({ 
      id: m.id, 
      type: m.type, 
      label: m.label,
      y: m.y, 
      absolute: m.absolute,
      isAboveSafeZone: m.y !== undefined && m.y < safeZonePadding
    })),
    logoModulesDetails: logoModules1.map((m: any) => ({ id: m.id, type: m.type, label: m.label, y: m.y })),
    regularModulesDetails: regularModules1.map((m: any) => ({ id: m.id, type: m.type, label: m.label, y: m.y }))
  });
  
  const logoModules2 = (modules2 || []).filter((m: any) => m?.type === 'BlocLogo');
  const footerModules2 = (modules2 || []).filter((m: any) => m?.type === 'BlocPiedDePage');
  const absoluteModules2 = (modules2 || []).filter((m: any) => 
    m?.absolute === true && 
    m?.type !== 'BlocLogo' && 
    m?.type !== 'BlocPiedDePage'
  );
  const regularModules2 = (modules2 || []).filter((m: any) => 
    !m?.absolute && 
    m?.type !== 'BlocLogo' && 
    m?.type !== 'BlocPiedDePage'
  );
  
  const logoModules3 = (modules3 || []).filter((m: any) => m?.type === 'BlocLogo');
  const footerModules3 = (modules3 || []).filter((m: any) => m?.type === 'BlocPiedDePage');
  const absoluteModules3 = (modules3 || []).filter((m: any) => 
    m?.absolute === true && 
    m?.type !== 'BlocLogo' && 
    m?.type !== 'BlocPiedDePage'
  );
  const regularModules3 = (modules3 || []).filter((m: any) => 
    !m?.absolute && 
    m?.type !== 'BlocLogo' && 
    m?.type !== 'BlocPiedDePage'
  );

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
    // Priorité 1: Données canoniques du hook de synchronisation
    const canonicalData = getCanonicalPreviewData();
    if (canonicalData.formFields && Array.isArray(canonicalData.formFields) && canonicalData.formFields.length > 0) {
      console.log('📋 [FunnelUnlockedGame] ✅ Using canonical formFields:', {
        count: canonicalData.formFields.length,
        fields: canonicalData.formFields.map((f: any) => ({ id: f.id, label: f.label, type: f.type })),
        timestamp: canonicalData.timestamp
      });
      return canonicalData.formFields;
    }
    
    // Priorité 2: Utilisation des champs depuis liveCampaign.formFields (synchronisé en temps réel)
    if (liveCampaign?.formFields && Array.isArray(liveCampaign.formFields) && liveCampaign.formFields.length > 0) {
      console.log('📋 [FunnelUnlockedGame] ⚠️ Using liveCampaign formFields:', {
        count: liveCampaign.formFields.length,
        fields: liveCampaign.formFields.map((f: any) => ({ id: f.id, label: f.label, type: f.type }))
      });
      return liveCampaign.formFields;
    }
    
    // Priorité 3: Fallback vers campaign.formFields si liveCampaign n'est pas encore synchronisé
    if (campaign?.formFields && Array.isArray(campaign.formFields) && campaign.formFields.length > 0) {
      console.log('📋 [FunnelUnlockedGame] ⚠️ Using campaign formFields (default from generator):', {
        count: campaign.formFields.length,
        fields: campaign.formFields.map((f: any) => ({ id: f.id, label: f.label, type: f.type }))
      });
      return campaign.formFields;
    }
    
    // Fallback final: Champs par défaut (ne devrait jamais être utilisé)
    console.warn('📋 [FunnelUnlockedGame] ❌ Using fallback default formFields - this should not happen!');
    return [
      { id: 'prenom', label: 'Prénom', type: 'text', required: true },
      { id: 'nom', label: 'Nom', type: 'text', required: true },
      { id: 'email', label: 'Email', type: 'email', required: true }
    ];
  }, [getCanonicalPreviewData, liveCampaign?.formFields, liveCampaign?._lastUpdate, campaign?.formFields, campaign?._lastUpdate, forceUpdate]);

  const handleGameButtonClick = () => {
    // Passer à l'écran 2 (cartes visibles mais bloquées)
    setCurrentScreen('screen2');
    // Ne pas ouvrir le formulaire automatiquement, il s'ouvrira au grattage
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
      console.log('✅ Form validated! Setting formValidated to true');
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
    console.log('🎯 [FunnelUnlockedGame] handleGameFinish called with result:', result);
    
    // Le délai est géré dans CanvasGameRenderer, donc on peut définir gameResult immédiatement
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
    console.log('📦 [FunnelUnlockedGame] Setting gameResult to:', result);
    setGameResult(result);
    // Afficher immédiatement l'écran de résultat (pendant la fenêtre de 4s précédente)
    console.log('✅ [FunnelUnlockedGame] Showing result screen immediately');
    setShowResultScreen(true);
  };

  // FONCTION DE RESET COMPLET pour le funnel unlocked
  const handleReset = () => {
    setCurrentScreen('screen1'); // Retour à l'écran 1
    setFormValidated(false);  // ⚠️ IMPORTANT : remettre le formulaire à false
    setGameResult(null);
    setShowResultScreen(false);
    setShowFormModal(false);
    setShowValidationMessage(false);
    setHasPlayed(false);
  };

  // Si on a un résultat de jeu ET qu'on doit afficher l'écran de résultat
  if (gameResult && showResultScreen) {
    const backgroundStyle: React.CSSProperties = {
      background: campaign.design?.background?.type === 'image'
        ? `url(${campaign.design.background.value}) center/cover no-repeat`
        : campaign.design?.background?.value || '#ffffff'
    };
    return (
      <div className="w-full h-full" style={{ borderRadius: 0 }}>
        <div className="relative w-full h-full" style={{ borderRadius: 0, overflow: 'visible' }}>
          {/* Background avec TOUT le contenu à l'intérieur - EXACTEMENT comme DesignCanvas */}
          <div
            className="absolute inset-0"
            style={{
              ...backgroundStyle,
              borderRadius: 0,
              overflow: 'visible'
            }}
          >
            {renderSafeZone()}
            
            {/* Content À L'INTÉRIEUR du background */}
            <div 
              className="relative h-full w-full"
              style={{
                paddingLeft: `${safeZonePadding}px`,
                paddingRight: `${safeZonePadding}px`,
                paddingTop: `${safeZonePadding}px`,
                paddingBottom: `${safeZonePadding}px`,
                boxSizing: 'border-box'
              }}
            >
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
      </div>
    );
  }

  const hasDesignModules = Boolean(
    designModular &&
    designModular.screens &&
    Object.values(designModular.screens).some((screenModules: any) => Array.isArray(screenModules) && screenModules.length > 0)
  );
  
  console.log('🔍 [FunnelUnlockedGame] Route detection:', {
    campaignType: liveCampaign.type,
    hasDesignModules,
    designModular: !!designModular,
    designModularScreens: designModular?.screens ? Object.keys(designModular.screens) : 'none',
    currentScreen,
    willUseDesignModules: hasDesignModules && currentScreen === 'screen1',
    willUseScratch: liveCampaign.type === 'scratch'
  });

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
      <div className="w-full h-full" style={{ borderRadius: 0 }}>
        <div className="relative w-full h-full" style={{ borderRadius: 0, overflow: 'visible' }}>
          {/* Background avec TOUT le contenu à l'intérieur - EXACTEMENT comme DesignCanvas */}
          <div className="absolute inset-0" style={{ ...backgroundStyle, borderRadius: 0, overflow: 'visible' }}>
            {renderSafeZone()}

            {/* Content À L'INTÉRIEUR du background */}
            <div 
              className="relative h-full w-full overflow-visible"
              style={{
                paddingLeft: `${safeZonePadding}px`,
                paddingRight: `${safeZonePadding}px`,
                paddingTop: `${safeZonePadding}px`,
                // Important: no bottom padding so the footer band can stick to the bottom edge
                paddingBottom: 0,
                boxSizing: 'border-box',
                borderRadius: 0
              }}
            >
              <div className="flex flex-col h-full overflow-visible">
                {/* Modules Logo (collés en haut sans padding) */}
                {logoModules1.length > 0 && (
                  <div
                    className="w-full"
                    style={{
                      marginTop: `-${safeZonePadding}px`,
                      marginLeft: `-${safeZonePadding}px`,
                      marginRight: `-${safeZonePadding}px`,
                      width: `calc(100% + ${safeZonePadding * 2}px)`,
                      marginBottom: `${safeZonePadding}px`
                    }}
                  >
                    <DesignModuleRenderer
                      modules={logoModules1 as any}
                      previewMode
                      device={previewMode}
                    />
                  </div>
                )}

                {/* Contenu principal - flex-1 pour pousser le footer en bas */}
                {/* IMPORTANT: Pas de padding ici pour éviter le doublon avec les espacements des modules */}
                <div className="flex-1 relative">
                  {regularModules1.length > 0 && (
                    <DesignModuleRenderer
                      modules={regularModules1 as any}
                      previewMode
                      device={previewMode}
                      onButtonClick={handleGameButtonClick}
                    />
                  )}
                </div>
                
                {/* Modules Footer (collés en bas sans padding) */}
                {footerModules1.length > 0 && (
                  <div
                    className="mt-auto w-full"
                    style={{
                      paddingBottom: 0,
                      marginLeft: `-${safeZonePadding}px`,
                      marginRight: `-${safeZonePadding}px`,
                      width: `calc(100% + ${safeZonePadding * 2}px)`,
                      borderRadius: 0
                    }}
                  >
                    <DesignModuleRenderer
                      modules={footerModules1 as any}
                      previewMode
                      device={previewMode}
                    />
                  </div>
                )}

                {/* Overlay absolu: modules en position libre (vertical only) */}
                {absoluteModules1.length > 0 && (
                  <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
                    {absoluteModules1.map((m: any) => {
                      const y = (m.y ?? 0) as number;
                      // Ancrer sur la safe zone pour que les éléments au-dessus soient visibles
                      console.log(`📍 [FunnelUnlockedGame] Screen1 Absolute module "${m.label || m.type}":`, {
                        originalY: y,
                        safeZonePadding,
                        anchoredTop: safeZonePadding,
                        finalPosition: safeZonePadding + y,
                        moduleId: m.id
                      });
                      const modulePaddingClass = previewMode === 'mobile' ? 'p-0' : 'p-4';
                      return (
                        <div
                          key={m.id}
                          className="absolute"
                          style={{ 
                            left: '50%', 
                            top: `${safeZonePadding}px`, 
                            transform: `translate(-50%, ${y}px)`, 
                            pointerEvents: 'auto' 
                          }}
                        >
                          <div className={modulePaddingClass}>
                            <DesignModuleRenderer
                              modules={[m] as any}
                              previewMode
                              device={previewMode}
                              onButtonClick={handleGameButtonClick}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

  if (liveCampaign.type === 'scratch') {
    return (
      <div className="w-full h-full" style={{ borderRadius: 0 }}>
        <div className="relative w-full h-full" style={{ borderRadius: 0, overflow: 'visible' }}>
          {/* Background avec TOUT le contenu à l'intérieur - EXACTEMENT comme DesignCanvas */}
          <div className="absolute inset-0" style={{ ...backgroundStyle, borderRadius: 0, overflow: 'visible' }}>
            {renderSafeZone()}

            {/* Content À L'INTÉRIEUR du background */}
            <div 
              className="relative h-full w-full overflow-visible"
              style={{
                paddingLeft: `${safeZonePadding}px`,
                paddingRight: `${safeZonePadding}px`,
                paddingTop: `${safeZonePadding}px`,
                // Important: remove bottom padding to stick footer to bottom edge
                paddingBottom: 0,
                boxSizing: 'border-box'
              }}
            >
            {/* ÉCRAN 1 : Avant le jeu */}
            {currentScreen === 'screen1' && (
              <div className="flex flex-col h-full overflow-visible">
                {/* Modules Logo (collés en haut sans padding) */}
                {logoModules1.length > 0 && (
                  <div
                    className="w-full"
                    style={{
                      marginTop: `-${safeZonePadding}px`,
                      marginLeft: `-${safeZonePadding}px`,
                      marginRight: `-${safeZonePadding}px`,
                      width: `calc(100% + ${safeZonePadding * 2}px)`,
                      marginBottom: `${safeZonePadding}px`
                    }}
                  >
                    <QuizModuleRenderer 
                      modules={logoModules1}
                      previewMode={true}
                      device={previewMode}
                    />
                  </div>
                )}
                
                {/* Contenu principal - flex-1 pour pousser le footer en bas */}
                {/* IMPORTANT: Pas de padding ici pour éviter le doublon avec les espacements des modules */}
                <div className="flex-1 relative">
                  {regularModules1.length > 0 && (
                    <QuizModuleRenderer 
                      modules={regularModules1}
                      previewMode={true}
                      device={previewMode}
                      onButtonClick={handleGameButtonClick}
                    />
                  )}
                </div>
                
                {/* Modules Footer (collés en bas sans padding) */}
                {footerModules1.length > 0 && (
                  <div
                    className="mt-auto w-full"
                    style={{
                      paddingBottom: 0,
                      // Full-bleed horizontally: cancel container safe-zone padding
                      marginLeft: `-${safeZonePadding}px`,
                      marginRight: `-${safeZonePadding}px`,
                      width: `calc(100% + ${safeZonePadding * 2}px)`,
                      borderRadius: 0
                    }}
                  >
                    <QuizModuleRenderer 
                      modules={footerModules1}
                      previewMode={true}
                      device={previewMode}
                    />
                  </div>
                )}

                {/* Overlay absolu: modules en position libre (vertical only) */}
                {absoluteModules1.length > 0 && (
                  <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
                    {absoluteModules1.map((m: any) => {
                      const y = (m.y ?? 0) as number;
                      // Ancrer sur la safe zone pour que les éléments au-dessus soient visibles
                      const modulePaddingClass = previewMode === 'mobile' ? 'p-0' : 'p-4';
                      return (
                        <div
                          key={m.id}
                          className="absolute"
                          style={{ 
                            left: '50%', 
                            top: `${safeZonePadding}px`, 
                            transform: `translate(-50%, ${y}px)`, 
                            pointerEvents: 'auto' 
                          }}
                        >
                          <div className={modulePaddingClass}>
                            <QuizModuleRenderer 
                              modules={[m]}
                              previewMode={true}
                              device={previewMode}
                              onButtonClick={handleGameButtonClick}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ÉCRAN 2 : Cartes visibles (bloquées si formulaire non validé) */}
            {currentScreen === 'screen2' && !showResultScreen && (
              <div className="flex flex-col h-full overflow-y-auto">
              {/* Modules Logo (collés en haut sans padding) */}
              {logoModules2.length > 0 && (
                <div
                  className="w-full"
                  style={{
                    pointerEvents: 'auto',
                    marginTop: `-${safeZonePadding}px`,
                    marginLeft: `-${safeZonePadding}px`,
                    marginRight: `-${safeZonePadding}px`,
                    width: `calc(100% + ${safeZonePadding * 2}px)`,
                    marginBottom: `${safeZonePadding}px`
                  }}
                >
                  <QuizModuleRenderer 
                    modules={logoModules2}
                    previewMode={true}
                    device={previewMode}
                  />
                </div>
              )}
              
                {/* Contenu principal avec padding - flex-1 pour pousser le footer en bas */}
                <div className="flex-1 relative overflow-visible">
                  {/* Modules screen2 réguliers - en arrière-plan */}
                  {regularModules2.length > 0 && (
                    <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0 }}>
                      <QuizModuleRenderer 
                        modules={regularModules2}
                        previewMode={true}
                        device={previewMode}
                      />
                    </div>
                  )}

                  {/* Game Component (Roue ou Cartes selon le type) */}
                  <div 
                    className="absolute inset-0 flex items-center justify-center" 
                    style={{ 
                      zIndex: formValidated ? 100 : 50,
                      pointerEvents: 'auto'
                    }}
                  >
                    <div className="relative flex items-center justify-center" style={{ maxWidth: '100%', maxHeight: '100%', width: '100%', height: '100%' }}>
                      {liveCampaign.type === 'wheel' || campaign.type === 'wheel' || liveCampaign.type === 'jackpot' || campaign.type === 'jackpot' ? (
                        <GameRenderer
                          campaign={liveCampaign}
                          formValidated={formValidated}
                          showValidationMessage={false}
                          previewMode={previewMode}
                          mobileConfig={mobileConfig}
                          onGameFinish={handleGameFinish}
                          onGameStart={handleGameStart}
                          onGameButtonClick={handleCardClick}
                        />
                      ) : (
                        <div style={{ 
                          maxWidth: '100%', 
                          maxHeight: '100%', 
                          width: '100%', 
                          height: '100%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          overflow: 'visible',
                          position: 'relative'
                        }}>
                          <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transform: 'scale(0.85)',
                            transformOrigin: 'center center'
                          }}>
                            <ScratchCardCanvas 
                              selectedDevice={previewMode}
                              previewMode={!formValidated}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Overlay transparent: ouvre le formulaire au clic sans masque visuel */}
                      {!formValidated && (
                        <div 
                          className="absolute inset-0 cursor-pointer"
                          style={{ zIndex: 150, backgroundColor: 'transparent' }}
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
                    </div>
                  </div>
                </div>
                
                {/* Modules Footer (collés en bas sans padding) */}
                {footerModules2.length > 0 && (
                  <div
                    className="mt-auto w-full"
                    style={{
                      paddingBottom: 0,
                      marginLeft: `-${safeZonePadding}px`,
                      marginRight: `-${safeZonePadding}px`,
                      width: `calc(100% + ${safeZonePadding * 2}px)`,
                      borderRadius: 0
                    }}
                  >
                    <QuizModuleRenderer 
                      modules={footerModules2}
                      previewMode={true}
                      device={previewMode}
                    />
                  </div>
                )}

                {/* Overlay absolu: modules en position libre (vertical only) */}
                {absoluteModules2.length > 0 && (
                  <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
                    {absoluteModules2.map((m: any) => {
                      const y = (m.y ?? 0) as number;
                      // Ancrer sur la safe zone pour que les éléments au-dessus soient visibles
                      const modulePaddingClass = previewMode === 'mobile' ? 'p-0' : 'p-4';
                      return (
                        <div
                          key={m.id}
                          className="absolute"
                          style={{ 
                            left: '50%', 
                            top: `${safeZonePadding}px`, 
                            transform: `translate(-50%, ${y}px)`, 
                            pointerEvents: 'auto' 
                          }}
                        >
                          <div className={modulePaddingClass}>
                            <QuizModuleRenderer 
                              modules={[m]}
                              previewMode={true}
                              device={previewMode}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ÉCRAN 3 : Après le jeu (gameResult='win' ou 'lose') - Layout identique à l'éditeur */}
            {gameResult !== null && showResultScreen && (
              <div className="flex flex-col h-full">
                {/* Modules Logo (collés en haut sans padding) */}
                {logoModules3.length > 0 && (
                  <div
                    className="w-full"
                    style={{
                      marginTop: `-${safeZonePadding}px`,
                      marginLeft: `-${safeZonePadding}px`,
                      marginRight: `-${safeZonePadding}px`,
                      width: `calc(100% + ${safeZonePadding * 2}px)`,
                      marginBottom: `${safeZonePadding}px`
                    }}
                  >
                    <QuizModuleRenderer 
                      modules={logoModules3}
                      previewMode={true}
                      device={previewMode}
                    />
                  </div>
                )}
                
                {/* Contenu principal - flex-1 pour pousser le footer en bas */}
                {/* IMPORTANT: Pas de padding ici pour éviter le doublon avec les espacements des modules */}
                <div className="flex-1 relative">
                  {regularModules3.length > 0 && (
                    <QuizModuleRenderer 
                      modules={regularModules3}
                      previewMode={true}
                      device={previewMode}
                      onButtonClick={handleReset}
                    />
                  )}
                </div>
                
                {/* Modules Footer (collés en bas sans padding) */}
                {footerModules3.length > 0 && (
                  <div
                    className="mt-auto w-full"
                    style={{
                      paddingBottom: 0,
                      marginLeft: `-${safeZonePadding}px`,
                      marginRight: `-${safeZonePadding}px`,
                      width: `calc(100% + ${safeZonePadding * 2}px)`,
                      borderRadius: 0
                    }}
                  >
                    <QuizModuleRenderer 
                      modules={footerModules3}
                      previewMode={true}
                      device={previewMode}
                    />
                  </div>
                )}

                {/* Overlay absolu: modules en position libre (vertical only) */}
                {absoluteModules3.length > 0 && (
                  <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
                    {absoluteModules3.map((m: any) => {
                      const y = (m.y ?? 0) as number;
                      // Ancrer sur la safe zone pour que les éléments au-dessus soient visibles
                      const modulePaddingClass = previewMode === 'mobile' ? 'p-0' : 'p-4';
                      return (
                        <div
                          key={m.id}
                          className="absolute"
                          style={{ 
                            left: '50%', 
                            top: `${safeZonePadding}px`, 
                            transform: `translate(-50%, ${y}px)`, 
                            pointerEvents: 'auto' 
                          }}
                        >
                          <div className={modulePaddingClass}>
                            <QuizModuleRenderer 
                              modules={[m]}
                              previewMode={true}
                              device={previewMode}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            </div>
            
            {/* Modal de formulaire - À L'INTÉRIEUR du background pour rester dans le cadre */}
            <FormHandler
              showFormModal={showFormModal}
              campaign={campaign}
              fields={fields}
              participationLoading={participationLoading}
              onClose={() => setShowFormModal(false)}
              onSubmit={handleFormSubmit}
              launchButtonStyles={launchButtonStyles}
              usePortal={false}
            />
          </div>
        </div>
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
      <div className="relative w-full h-full">
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
        <div className="absolute inset-0 z-20">
          <ScreenLayoutWrapper 
            layout={useLayoutFromCampaign(liveCampaign)}
            style={{ padding: '1rem' }}
          >
            {(() => {
              // Reproduire exactement la logique de DesignCanvas pour le formulaire
              const campaignDesign = (liveCampaign as any)?.design || {};
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
                className={`opacity-100 pointer-events-auto`}
                style={{
                  // Centrage complet au milieu de l'écran
                  width: '100%',
                  maxWidth: formWidth,
                  height: 'auto',
                  maxHeight: 'calc(100vh - 2rem)'
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
          </ScreenLayoutWrapper>
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
        onGameButtonClick={handleCardClick} 
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
        usePortal={false}
      />
    </div>
  );
};

export default FunnelUnlockedGame;
