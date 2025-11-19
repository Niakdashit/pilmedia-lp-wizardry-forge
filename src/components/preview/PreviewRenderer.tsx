'use client';

'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import StandardizedWheel from '../shared/StandardizedWheel';
import TemplatedSwiper from '../shared/TemplatedSwiper';
import TemplatedQuiz from '../shared/TemplatedQuiz';
import DynamicContactForm, { type FieldConfig } from '../forms/DynamicContactForm';
import Modal from '../common/Modal';
import { useMessageStore } from '@/stores/messageStore';
import { useEditorStore } from '@/stores/editorStore';
import { useEditorPreviewSync } from '@/hooks/useEditorPreviewSync';
import { useButtonStyleCSS } from '@/stores/buttonStore';
import { DesignModuleRenderer } from '@/components/DesignEditor/DesignRenderer';
import { QuizModuleRenderer } from '@/components/QuizEditor/QuizRenderer';
import type { DesignScreenId } from '@/types/designEditorModular';
import { isTempCampaignId } from '@/utils/tempCampaignId';
import { useCampaignView } from '@/hooks/useCampaignView';

interface PreviewRendererProps {
  campaign: any;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  wheelModalConfig?: any;
  constrainedHeight?: boolean; // Pour mode mobile centré avec hauteur fixe
  onModuleClick?: (moduleId: string) => void; // Callback pour éditer les modules en fullscreen
}

/**
 * PreviewRenderer - Système de preview unifié et simplifié
 * 
 * Architecture:
 * - Screen 1: Page d'accueil avec bouton "Participer"
 * - Screen 2: Jeu (roue, scratch, etc.)
 * - Screen 3: Résultat (gain ou perte)
 * 
 * Logique:
 * - Pas de formulaire modal compliqué
 * - Clic sur "Participer" → Passe à l'écran 2 (jeu)
 * - Jeu terminé → Passe à l'écran 3 (résultat)
 */
const PreviewRenderer: React.FC<PreviewRendererProps> = ({
  campaign: campaignProp,
  previewMode,
  wheelModalConfig,
  constrainedHeight = false,
  onModuleClick
}) => {
  const [currentScreen, setCurrentScreen] = useState<DesignScreenId>('screen1');
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [hasSubmittedForm, setHasSubmittedForm] = useState(false);
  const [participantEmail, setParticipantEmail] = useState<string>('');
  const [participantId, setParticipantId] = useState<string>('');
  // Verrou pour éviter que l'auto-sélection d'écran n'écrase une navigation manuelle (ex: clic Participer)
  const manualNavRef = useRef(false);
  
  // Lire les messages depuis le store Zustand persistant
  const { messages: storeMessages } = useMessageStore();
  
  // Lire le style global des boutons
  const globalButtonStyle = useButtonStyleCSS();

  // Lire directement depuis le store Zustand pour détecter les changements profonds
  // Utiliser un sélecteur qui force le re-render quand canvasConfig.background change
  const campaignFromStore = useEditorStore((state) => state.campaign);
  const canvasConfigBackground = useEditorStore((state) => state.campaign?.canvasConfig?.background);
  const campaign = campaignFromStore || campaignProp;
  
  // Forcer le re-render quand canvasConfigBackground change
  useEffect(() => {
    if (canvasConfigBackground) {
      console.log('🔄 [PreviewRenderer] canvasConfig.background changed:', {
        type: canvasConfigBackground.type,
        value: canvasConfigBackground.value?.substring(0, 50)
      });
      setForceUpdate(prev => prev + 1);
    }
  }, [canvasConfigBackground]);

  // Hook de synchronisation pour obtenir les données canoniques
  const { getCanonicalPreviewData } = useEditorPreviewSync();
  
  // 📊 Track campaign view (même en mode preview) - Stabilize campaignId to prevent infinite loops
  const campaignId = useMemo(() => campaign?.id || '', [campaign?.id]);
  const { trackInteraction } = useCampaignView(campaignId);

  // Mark body as being in preview to hide any editor-only overlays/controls (zoom slider, screen selector)
  useEffect(() => {
    try {
      document.body.setAttribute('data-in-preview', '1');
    } catch {}
    // Allow natural scrolling for content overflow, but hide editor controls
    try {
      // Just mark as preview mode, don't block scrolling
      document.body.setAttribute('data-in-preview', '1');
    } catch {}
    const hideEditorControls = () => {
      try {
        const sliderCandidates = Array.from(document.querySelectorAll(
          'input[type="range"], [role="slider"], .rc-slider, .MuiSlider-root, [data-radix-slider-root]'
        ));
        sliderCandidates.forEach((el) => {
          const container = (el as HTMLElement).closest('div,section,aside,nav,footer,header,main');
          if (container) (container as HTMLElement).style.display = 'none';
          const next = (el as HTMLElement).nextElementSibling as HTMLElement | null;
          if (next && (next.tagName === 'SELECT' || next.getAttribute('role') === 'combobox')) {
            next.style.display = 'none';
          }
          // Also hide any sibling selects within same container
          if (container) {
            container.querySelectorAll('select,[role="combobox"]').forEach((s) => {
              (s as HTMLElement).style.display = 'none';
            });
          }
        });

        // Hide French screen selector like "Écran 1/2/3" or "Ecran 1/2/3"
        const selects = Array.from(document.querySelectorAll('select')) as HTMLSelectElement[];
        selects.forEach((sel) => {
          const text = Array.from(sel.options).map(o => (o.text || '').toLowerCase()).join(' | ');
          if (/écran|ecran/.test(text)) {
            const container = sel.closest('div,section,aside,nav,footer,header,main');
            if (container) (container as HTMLElement).style.display = 'none';
          }
        });

        // Last resort A: hide any small fixed group bottom-left (common placement for zoom/screen controls)
        const fixedCandidates = Array.from(document.querySelectorAll('*')) as HTMLElement[];
        fixedCandidates.forEach((el) => {
          const cs = window.getComputedStyle(el);
          if (cs.position === 'fixed') {
            const rect = el.getBoundingClientRect();
            if (rect.left <= 40 && rect.bottom >= (window.innerHeight - 120) && rect.width <= 320 && rect.height <= 120) {
              el.style.display = 'none';
            }
          }
        });

        // Last resort B: sample elements at bottom-left screen area and hide their containers
        const samplePoints = [
          { x: 20, y: window.innerHeight - 20 },
          { x: 60, y: window.innerHeight - 40 },
          { x: 120, y: window.innerHeight - 60 }
        ];
        samplePoints.forEach(({ x, y }) => {
          const els = (document as any).elementsFromPoint ? (document as any).elementsFromPoint(x, y) : [];
          (els as HTMLElement[]).forEach((el) => {
            const txt = (el.innerText || el.textContent || '').toLowerCase();
            if (/écran|ecran|screen|zoom/.test(txt)) {
              const container = el.closest('div,section,aside,nav,footer,header,main');
              if (container) (container as HTMLElement).style.display = 'none';
            }
          });
        });
      } catch {}
    };

    hideEditorControls();
    const mo = new MutationObserver(() => hideEditorControls());
    try {
      mo.observe(document.body, { childList: true, subtree: true });
    } catch {}
    return () => {
      try {
        document.body.removeAttribute('data-in-preview');
      } catch {}
      try { mo.disconnect(); } catch {}
    };
  }, []);

  // Écouter les mises à jour depuis l'éditeur
  useEffect(() => {
    const handleUpdate = (e?: Event) => {
      console.log('🔔 [PreviewRenderer] Received sync event:', (e as CustomEvent)?.type, (e as CustomEvent)?.detail);
      setForceUpdate(prev => prev + 1);
    };
    
    const handleFormFieldsSync = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      console.log('📋 [PreviewRenderer] FormFields sync event received:', {
        fieldsCount: detail?.formFields?.length,
        timestamp: detail?.timestamp
      });
      setForceUpdate(prev => prev + 1);
    };
    
    window.addEventListener('editor-background-sync', handleUpdate);
    window.addEventListener('editor-modules-sync', handleUpdate);
    window.addEventListener('editor-module-sync', handleUpdate);
    window.addEventListener('editor-force-sync', handleUpdate);
    window.addEventListener('editor-formfields-sync', handleFormFieldsSync);
    
    return () => {
      window.removeEventListener('editor-background-sync', handleUpdate);
      window.removeEventListener('editor-modules-sync', handleUpdate);
      window.removeEventListener('editor-module-sync', handleUpdate);
      window.removeEventListener('editor-force-sync', handleUpdate);
      window.removeEventListener('editor-formfields-sync', handleFormFieldsSync);
    };
  }, []);

  // Obtenir les données canoniques
  const canonicalData = getCanonicalPreviewData();

  // Bindings to FormEditor "Jeu" tab: derive quiz config from multiple sources
  const derivedQuizConfig = React.useMemo(() => {
    const fromDesign = (campaign as any)?.design?.quizConfig || {};
    const fromRoot = (campaign as any)?.quizConfig || {};
    const fromGame = (campaign as any)?.gameConfig?.quiz || {};
    const templateId = fromDesign.templateId || fromRoot.templateId || fromGame.templateId;
    const questions = fromDesign.questions || fromRoot.questions || fromGame.questions || [];
    const style = fromDesign.style || fromRoot.style || {};
    return { templateId, questions, style } as any;
  }, [campaign]);

  const previewQuizCampaign = React.useMemo(() => {
    if (!campaign) return null;
    const design = (campaign as any)?.design || {};
    return {
      ...(campaign as any),
      design: {
        ...design,
        quizConfig: {
          ...(design as any)?.quizConfig,
          ...derivedQuizConfig
        }
      }
    } as any;
  }, [campaign, derivedQuizConfig]);
  
  // Déterminer quel renderer utiliser selon le type de campagne
  // Priorité 1: Si la campagne n'est pas un quiz et que des designModules existent → utiliser DesignModuleRenderer
  // Priorité 2: Sinon, si campaign.modularPage existe (Quiz) → utiliser QuizModuleRenderer
  // Priorité 3: Fallback sur canonicalData
  const hasQuizModularPage = Boolean((campaign as any)?.modularPage?.screens);
  const hasDesignModules = Boolean(campaign?.design?.designModules?.screens);
  
  console.log('🔍 [PreviewRenderer] Renderer selection debug:', {
    campaignType: campaign?.type,
    hasQuizModularPage,
    hasDesignModules,
    'campaign.modularPage': (campaign as any)?.modularPage,
    'campaign.design.designModules': campaign?.design?.designModules
  });
  
  // Choix robuste: pour tout type ≠ 'quiz', privilégier designModules même si modularPage existe
  const isDesignModular = (campaign?.type !== 'quiz' && hasDesignModules) || (!hasQuizModularPage && hasDesignModules);
  
  // Conserver l'info mais ne pas filtrer sur campagne temporaire
  const isTempCampaign = isTempCampaignId(campaign?.id);
  
  // Source des modules — alignée avec l'éditeur
  const modularPage = (
    // Priorité 1: store/campaign.modularPage
    (campaign as any)?.modularPage?.screens ? (campaign as any).modularPage : undefined
  ) || (
    // Priorité 2: design.quizModules
    (campaign as any)?.design?.quizModules?.screens ? (campaign as any).design.quizModules : undefined
  ) || (
    // Priorité 3: design.designModules (DesignEditor)
    (campaign as any)?.design?.designModules?.screens ? (campaign as any).design.designModules : undefined
  ) || (
    // Priorité 4: config.modularPage
    (campaign as any)?.config?.modularPage?.screens ? (campaign as any).config.modularPage : undefined
  ) || (
    // Priorité 5: données canoniques
    canonicalData?.modularPage
  ) || { screens: { screen1: [], screen2: [], screen3: [] } };
  
  console.log('📦 [PreviewRenderer] Loading modules from:', {
    isDesignModular,
    source: isDesignModular ? 'campaign.design.designModules' : 'campaign.modularPage',
    modularPage,
    'modularPage.screens.screen1': modularPage?.screens?.screen1
  });
  
  const allModules1 = modularPage?.screens?.screen1 || [];
  const allModules2 = modularPage?.screens?.screen2 || [];
  const allModules3 = modularPage?.screens?.screen3 || [];
  
  // Safe zone padding - doit être déclaré AVANT l'utilisation dans les filters
  const safeZonePadding = previewMode === 'mobile' ? 28 : previewMode === 'tablet' ? 40 : 56;

  // Separate logo, footer, absolute and regular modules
  // Only BlocLogo modules are treated as logos (escape safezone with negative margin)
  const logoModules1 = allModules1.filter((m: any) => m?.type === 'BlocLogo');
  const footerModules1 = allModules1.filter((m: any) => m?.type === 'BlocPiedDePage');
  const absoluteModules1 = allModules1.filter((m: any) => m?.absolute === true && m?.type !== 'BlocLogo' && m?.type !== 'BlocPiedDePage');
  const modules1 = allModules1.filter((m: any) => 
    !m?.absolute && 
    m?.type !== 'BlocLogo' && 
    m?.type !== 'BlocPiedDePage'
  );
  
  console.log('📦 [PreviewRenderer] Screen1 modules breakdown:', {
    total: allModules1.length,
    logos: logoModules1.length,
    footers: footerModules1.length,
    absolute: absoluteModules1.length,
    regular: modules1.length,
    safeZonePadding,
    allModulesDetails: allModules1.map((m: any) => ({ 
      id: m.id, 
      type: m.type, 
      label: m.label,
      y: m.y, 
      absolute: m.absolute,
      isAboveSafeZone: m.y !== undefined && m.y < safeZonePadding
    })),
    logoModulesDetails: logoModules1.map((m: any) => ({ id: m.id, type: m.type, label: m.label, y: m.y })),
    regularModulesDetails: modules1.map((m: any) => ({ id: m.id, type: m.type, label: m.label, y: m.y }))
  });
  
  // Log juste avant le rendu
  React.useEffect(() => {
    console.log(' [PreviewRenderer] About to render modules1:', {
      count: modules1.length,
      modules: modules1.map((m: any) => ({ id: m.id, type: m.type }))
    });
  }, [modules1]);
  
  const logoModules2 = allModules2.filter((m: any) => m?.type === 'BlocLogo');
  const footerModules2 = allModules2.filter((m: any) => m?.type === 'BlocPiedDePage');
  const absoluteModules2 = allModules2.filter((m: any) => m?.absolute === true && m?.type !== 'BlocLogo' && m?.type !== 'BlocPiedDePage');
  const modules2 = allModules2.filter((m: any) => !m?.absolute && m?.type !== 'BlocLogo' && m?.type !== 'BlocPiedDePage');
  
  const logoModules3 = allModules3.filter((m: any) => m?.type === 'BlocLogo');
  const footerModules3 = allModules3.filter((m: any) => m?.type === 'BlocPiedDePage');
  const modules3 = allModules3.filter((m: any) => m?.type !== 'BlocLogo' && m?.type !== 'BlocPiedDePage');

  // Au montage ou lorsque les données changent, sélectionner automatiquement l'écran qui a du contenu
  useEffect(() => {
    try {
      // Si l'utilisateur a navigué manuellement (ex: clic Participer), ne pas écraser son choix
      if (manualNavRef.current) {
        return;
      }
      // Détecter les backgrounds par écran
      const screenBackgrounds =
        (campaign as any)?.config?.canvasConfig?.screenBackgrounds
        || campaign?.canvasConfig?.screenBackgrounds
        || campaign?.design?.screenBackgrounds
        || {};

      const hasBg = (s: DesignScreenId) => {
        const bg: any = screenBackgrounds?.[s];
        if (!bg) return false;
        if (bg?.devices && typeof previewMode === 'string') {
          const dk = previewMode === 'mobile' ? 'mobile' : (previewMode === 'tablet' ? 'tablet' : 'desktop');
          const db = bg.devices?.[dk];
          return Boolean(db?.value);
        }
        return Boolean(bg?.value);
      };

      const candidates: Array<{ id: DesignScreenId; score: number }> = [
        { id: 'screen1', score: (modules1.length ? 2 : 0) + (hasBg('screen1') ? 1 : 0) },
        { id: 'screen2', score: (modules2.length ? 2 : 0) + (hasBg('screen2') ? 1 : 0) },
        { id: 'screen3', score: (modules3.length ? 2 : 0) + (hasBg('screen3') ? 1 : 0) }
      ];
      const best = candidates.sort((a, b) => b.score - a.score)[0];
      if (best && best.score > 0 && best.id !== currentScreen) {
        setCurrentScreen(best.id);
      }
    } catch {}
  }, [modules1.length, modules2.length, modules3.length, campaign?.canvasConfig?.screenBackgrounds, (campaign as any)?.config?.canvasConfig?.screenBackgrounds, campaign?.design?.screenBackgrounds, previewMode]);

  // Background style - Privilégier d'abord le localStorage par écran pour robustesse
  const backgroundStyle: React.CSSProperties = useMemo(() => {
    console.log('🎨 [PreviewRenderer] Raw data:', {
      'campaign.canvasConfig.background': campaign?.canvasConfig?.background,
      'campaign.canvasConfig.screenBackgrounds': campaign?.canvasConfig?.screenBackgrounds,
      'campaign.design.screenBackgrounds': campaign?.design?.screenBackgrounds,
      'campaign.design.background': campaign?.design?.background,
      'currentScreen': currentScreen,
      'forceUpdate': forceUpdate,
      'isTempCampaign': isTempCampaign
    });
    
    // Ne pas écraser le fond pour les campagnes temporaires — le preview doit refléter l'éditeur
    
    // Priorité 1: image de fond par écran stockée en session (localStorage) – la plus robuste entre Editor/Preview
    // Using campaign-namespaced keys
    let perScreenImage: string | null = null;
    try {
      const campaignId = campaign?.id;
      const deviceKey = previewMode === 'mobile' ? 'mobile' : (previewMode === 'tablet' ? 'tablet' : 'desktop');
      
      if (campaignId) {
        // Try new namespaced format first: quiz-bg-<campaignId>-<device>-<screen>
        const namespacedKey = `quiz-bg-${campaignId}-${deviceKey}-${currentScreen}`;
        perScreenImage = typeof window !== 'undefined' ? (localStorage.getItem(namespacedKey) || null) : null;
        
        console.log(`🔍 [PreviewRenderer] Checking localStorage for ${currentScreen}:`, {
          key: namespacedKey,
          found: !!perScreenImage
        });
      }
    } catch {}

    // Si une image par écran existe pour l'appareil courant, l'utiliser immédiatement
    if (perScreenImage) {
      return { background: `url(${perScreenImage}) center/cover no-repeat` };
    }

    // Priorité 2: Backgrounds par écran depuis canvasConfig (si non disponible en localStorage)
    const screenBackgrounds =
      // config.canvasConfig (utilisé par l'éditeur)
      (campaign as any)?.config?.canvasConfig?.screenBackgrounds
      || campaign?.canvasConfig?.screenBackgrounds
      || campaign?.design?.screenBackgrounds;
    if (screenBackgrounds && screenBackgrounds[currentScreen]) {
      const screenBg: any = screenBackgrounds[currentScreen];
      const deviceKey = previewMode === 'mobile' ? 'mobile' : (previewMode === 'tablet' ? 'tablet' : 'desktop');
      // Prefer device-specific override when available
      const deviceBg = screenBg?.devices?.[deviceKey];
      const chosenBg = deviceBg && deviceBg.value ? deviceBg : screenBg;
      console.log(`✅ [PreviewRenderer] Using screen-specific background for ${currentScreen} (${deviceKey}):`, chosenBg);
      if (chosenBg?.type === 'image' && chosenBg.value) {
        return { background: `url(${chosenBg.value}) center/cover no-repeat` };
      }
      // If color and non-empty, apply it; if empty, fall through to global backgrounds
      if (chosenBg?.type && chosenBg?.value) {
        return { background: chosenBg.value };
      }
      // else: do not return here, continue to global background resolution
    }

    // Priorité 3: campaign.canvasConfig.background (preview-only, le plus à jour)
    let bg = campaign?.canvasConfig?.background;
    // Inclure aussi config.canvasConfig.background
    if (!bg || (!bg.value && !bg.type)) {
      bg = (campaign as any)?.config?.canvasConfig?.background || bg;
    }
    
    // Priorité 4: campaign.design.background (global)
    if (!bg || (!bg.value && !bg.type)) {
      bg = campaign?.design?.background;
    }
    
    // Priorité 5: canonicalData.background (fallback)
    if (!bg || (!bg.value && !bg.type)) {
      bg = canonicalData.background;
    }
    
    // Priorité 6: backgroundImage si défini
    if (!bg?.value && campaign?.design?.backgroundImage) {
      bg = { type: 'image', value: campaign.design.backgroundImage };
    }
    
    // Si bg est un objet mais n'a pas de propriété type/value correcte, essayer de le réparer
    if (bg && typeof bg === 'object') {
      // Vérifier si c'est un format invalide
      if (!bg.type || !bg.value) {
        console.warn('⚠️ [PreviewRenderer] Invalid background format:', bg);
        // Essayer de détecter si c'est une image
        const bgStr = JSON.stringify(bg);
        if (bgStr.includes('http') || bgStr.includes('blob:') || bgStr.includes('data:image')) {
          // Extraire l'URL
          const match = bgStr.match(/(https?:\/\/[^\s"]+|blob:[^\s"]+|data:image[^\s"]+)/);
          if (match) {
            bg = { type: 'image', value: match[0] };
          }
        }
      }
    }
    
    console.log('🎨 [PreviewRenderer] Final background:', {
      type: bg?.type,
      value: bg?.value?.substring(0, 100),
      source: campaign?.canvasConfig?.background ? 'canvasConfig' : (campaign?.design?.background ? 'design.background' : 'canonicalData')
    });
    
    if (bg?.type === 'image' && bg.value) {
      return { background: `url(${bg.value}) center/cover no-repeat` };
    }
    // Final fallback: appliquer le même dégradé par défaut que l'éditeur Quiz
    const defaultGradient = 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)';
    return { background: bg?.value || defaultGradient };
  }, [
    // Dépendre aussi de l'écran courant et du mode pour rafraîchir la lecture localStorage
    currentScreen,
    previewMode,
    campaign?.canvasConfig?.background?.type,
    campaign?.canvasConfig?.background?.value,
    campaign?.canvasConfig?.screenBackgrounds,
    campaign?.design?.screenBackgrounds,
    campaign?.design?.background,
    campaign?.design?.backgroundImage,
    canonicalData.background,
    forceUpdate
  ]);

  // Se rafraîchir quand DesignCanvas synchronise les backgrounds entre écrans
  useEffect(() => {
    const rerender = () => setForceUpdate((p) => p + 1);
    window.addEventListener('quiz-bg-sync', rerender);
    return () => window.removeEventListener('quiz-bg-sync', rerender);
  }, []);

  // Debug: Track currentScreen changes
  useEffect(() => {
    console.log('🔄 [PreviewRenderer] currentScreen changed to:', currentScreen);
  }, [currentScreen]);

  // Handlers
  const handleParticipate = () => {
    console.log('🎮 [PreviewRenderer] handleParticipate called!');
    console.log('🎮 [PreviewRenderer] Current screen before:', currentScreen);
    // 📊 Track game start
    trackInteraction('game_start', { 
      campaign_type: campaign?.type,
      screen: 'screen1' 
    });
    manualNavRef.current = true;
    setCurrentScreen('screen2');
    console.log('🎮 [PreviewRenderer] setCurrentScreen("screen2") called');
  };

  const handleGameFinish = (result: 'win' | 'lose') => {
    console.log('🎯 Game finished with result:', result);
    // 📊 Track game completion
    trackInteraction('game_complete', { 
      result,
      campaign_type: campaign?.type 
    });
    manualNavRef.current = true;
    setGameResult(result);
    
    // Check if form should be shown before result
    const showFormBeforeResult = campaign?.showFormBeforeResult ?? true;
    console.log('🔍 [PreviewRenderer] showFormBeforeResult:', showFormBeforeResult);
    
    if (showFormBeforeResult && !hasSubmittedForm) {
      console.log('✅ [PreviewRenderer] Showing form before result');
      setShowContactForm(true);
    } else {
      console.log('⏭️ [PreviewRenderer] Skipping form, going to result');
      setCurrentScreen('screen3');
    }
  };

  const handleReset = () => {
    console.log('🔄 Reset - Back to screen1');
    manualNavRef.current = false;
    setCurrentScreen('screen1');
    setGameResult(null);
    setHasSubmittedForm(false);
  };

  const handleWheelClick = () => {
    console.log('🎡 Wheel clicked - hasSubmittedForm:', hasSubmittedForm);
    // Afficher le formulaire uniquement pour les campagnes de type 'wheel'
    if (campaign.type === 'wheel' && !hasSubmittedForm) {
      setShowContactForm(true);
    }
  };

  const handleFormSubmit = async (formData: Record<string, string>) => {
    console.log('📝 Form submitted:', formData);
    
    // Stocker l'email du participant pour le système de dotation
    if (formData.email) {
      setParticipantEmail(formData.email);
      // Générer un ID unique pour ce participant (ou utiliser l'email comme ID)
      setParticipantId(formData.email);
      console.log('✅ [PreviewRenderer] Participant email stored:', formData.email);
    }
    
    setShowContactForm(false);
    setHasSubmittedForm(true);
    // For quiz, transition to result screen after form submission
    // For other game types (wheel, scratch, etc.), just close the modal
    if (campaign?.type === 'quiz') {
      console.log('➡️ [PreviewRenderer] Quiz form submitted, moving to screen3');
      setCurrentScreen('screen3');
    } else {
      console.log('✅ [PreviewRenderer] Form submitted, modal closed');
      // Modal is closed, user stays on current screen (game screen)
    }
  };

  const contactFields: FieldConfig[] = useMemo(() => {
    // Priorité 1: Données canoniques du hook de synchronisation
    if (canonicalData.formFields && Array.isArray(canonicalData.formFields) && canonicalData.formFields.length > 0) {
      console.log('📋 [PreviewRenderer] ✅ Using canonical formFields:', {
        count: canonicalData.formFields.length,
        fields: canonicalData.formFields.map((f: any) => ({ id: f.id, label: f.label, type: f.type })),
        timestamp: canonicalData.timestamp
      });
      return canonicalData.formFields;
    }
    
    // Priorité 2: campaign.formFields (camelCase)
    if (campaign?.formFields && Array.isArray(campaign.formFields) && campaign.formFields.length > 0) {
      console.log('📋 [PreviewRenderer] ⚠️ Using campaign.formFields:', campaign.formFields.length);
      return campaign.formFields;
    }
    
    // Priorité 3: campaign.contactFields (ancien nom)
    const fields = campaign?.contactFields || [];
    if (fields.length > 0) {
      console.log('📋 [PreviewRenderer] ⚠️ Using campaign.contactFields (legacy):', fields.length);
      return fields;
    }
    
    // Fallback: Champs par défaut (ne devrait pas être utilisé)
    console.warn('📋 [PreviewRenderer] ❌ Using fallback default formFields');
    return [
      { id: 'firstName', label: 'Prénom', type: 'text', required: true },
      { id: 'lastName', label: 'Nom', type: 'text', required: true },
      { id: 'email', label: 'Email', type: 'email', required: true }
    ];
  }, [canonicalData, campaign?.formFields, campaign?.contactFields, forceUpdate]);

  const ModuleRenderer = isDesignModular ? DesignModuleRenderer : QuizModuleRenderer;

  // Read form config to mirror editor exactly
  const formConfig = (campaign as any)?.design?.formConfig || {
    title: 'Vos informations',
    description: 'Remplissez le formulaire pour participer',
    submitLabel: 'Envoyer',
    panelBg: '#ffffff',
    borderColor: '#e5e7eb',
    textColor: '#000000',
    buttonColor: '#44444d',
    buttonTextColor: '#ffffff',
    borderRadius: 12,
    fieldBorderRadius: 2,
  };

  const isPhoneFrame = constrainedHeight && previewMode === 'mobile';

  const InnerContent = (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        /* Hide common editor-only controls in preview */
        body[data-in-preview="1"] .canvas-zoom,
        body[data-in-preview="1"] .zoom-control,
        body[data-in-preview="1"] [data-zoom-control],
        body[data-in-preview="1"] [aria-label="zoom"],
        body[data-in-preview="1"] input[type="range"][name*="zoom"],
        body[data-in-preview="1"] .screen-selector,
        body[data-in-preview="1"] [data-screen-selector],
        body[data-in-preview="1"] [data-canvas-controls],
        body[data-in-preview="1"] .editor-controls,
        body[data-in-preview="1"] .canvas-toolbar,
        /* Radix/MUI/rc-slider and generic ARIA slider */
        body[data-in-preview="1"] [role="slider"],
        body[data-in-preview="1"] [data-radix-slider-root],
        body[data-in-preview="1"] .radix-slider-root,
        body[data-in-preview="1"] .MuiSlider-root,
        body[data-in-preview="1"] .rc-slider,
        /* Common container patterns that wrap a slider and a select (screen chooser) */
        body[data-in-preview="1"] .slider-container,
        body[data-in-preview="1"] .zoom-slider,
        body[data-in-preview="1"] .preview-zoom,
        body[data-in-preview="1"] .preview-controls,
        body[data-in-preview="1"] .bottom-controls,
        /* If a select is immediately following a slider (screen selector), hide it */
        body[data-in-preview="1"] [role="slider"] ~ select {
          display: none !important;
        }
      `}</style>
      <div className="relative w-full h-full">
        {/* Background */}
        <div className="absolute inset-0 z-0" style={backgroundStyle} />

        {/* Content avec safe zone */}
        <div className={`relative z-30 h-full w-full ${currentScreen === 'screen2' ? 'overflow-visible' : 'overflow-visible'}`}>
          {/* SCREEN 1: Page d'accueil */}
          {currentScreen === 'screen1' && (
            <div className={`flex flex-col ${isPhoneFrame ? 'min-h-full' : 'min-h-screen min-h-[100svh] min-h-[100dvh]'} relative`}>
              {/* Modules Logo (collés en haut sans padding) */}
              {logoModules1.length > 0 && (
                <div className="w-full">
                  <ModuleRenderer
                    modules={logoModules1 as any}
                    previewMode={true}
                    device={previewMode}
                    onButtonClick={() => {}}
                  />
                </div>
              )}
              
              {/* Autres modules (avec padding) - flex-1 pour pousser le footer en bas */}
              <div className="flex-1 relative">
                {/* Rendu des éléments canvas (images et textes personnalisés) */}
                {campaign?.design?.customImages && campaign.design.customImages.length > 0 && (
                  <div className="absolute inset-0 pointer-events-none" style={{ padding: safeZonePadding }}>
                    {campaign.design.customImages.map((img: any) => (
                      <div
                        key={img.id}
                        className="absolute"
                        style={{
                          left: `${img.x || 0}px`,
                          top: `${img.y || 0}px`,
                          width: `${img.width || 100}px`,
                          height: `${img.height || 100}px`,
                          transform: img.rotation ? `rotate(${img.rotation}deg)` : undefined,
                          pointerEvents: 'none'
                        }}
                      >
                        <img
                          src={img.src || img.url}
                          alt={img.alt || ''}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            borderRadius: img.borderRadius ? `${img.borderRadius}px` : undefined
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Form card is rendered in the fallback branch below for form campaigns (to avoid duplicates) */}
                
                {campaign?.design?.customTexts && campaign.design.customTexts.length > 0 && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ padding: safeZonePadding, zIndex: 1 }}
                  >
                    {campaign.design.customTexts.map((txt: any) => (
                      <div
                        key={txt.id}
                        className="absolute"
                        style={{
                          left: `${txt.x || 0}px`,
                          top: `${txt.y || 0}px`,
                          width: `${txt.width || 200}px`,
                          minHeight: `${txt.height || 40}px`,
                          fontSize: `${txt.fontSize || 16}px`,
                          fontWeight: txt.fontWeight || 'normal',
                          fontStyle: txt.fontStyle || 'normal',
                          textDecoration: txt.textDecoration || 'none',
                          color: txt.color || '#000000',
                          textAlign: (txt.textAlign || 'left') as any,
                          fontFamily: txt.fontFamily || 'inherit',
                          transform: txt.rotation ? `rotate(${txt.rotation}deg)` : undefined,
                          pointerEvents: 'none',
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word'
                        }}
                      >
                        {txt.content || txt.text || ''}
                      </div>
                    ))}
                  </div>
                )}

                {modules1.length > 0 ? (
                  <section 
                    className="space-y-6" 
                    data-screen="screen1"
                    style={{ padding: safeZonePadding, boxSizing: 'border-box' }}
                  >
                    <ModuleRenderer
                      modules={modules1 as any}
                      previewMode={true}
                      device={previewMode}
                      onButtonClick={handleParticipate}
                    />
                  </section>
                ) : (
                  <></>
                )}
              </div>
              
              {/* Modules Footer (collés en bas sans padding) */}
              {footerModules1.length > 0 && (
                isPhoneFrame ? (
                  <div className="mt-auto w-full z-[9999]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
                    <ModuleRenderer
                      modules={footerModules1 as any}
                      previewMode
                      device={previewMode}
                    />
                  </div>
                ) : (
                  <div
                    className="absolute inset-x-0 bottom-0 z-[9999]"
                    style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
                  >
                    <ModuleRenderer
                      modules={footerModules1 as any}
                      previewMode
                      device={previewMode}
                    />
                  </div>
                )
              )}

              {/* Overlay absolu: modules en position libre (vertical only) */}
              {absoluteModules1.length > 0 && (
                <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
                  {absoluteModules1.map((m: any) => {
                    const y = (m.y ?? 0) as number;
                    const modulePaddingClass = previewMode === 'mobile' ? 'p-0' : 'p-4';
                    return (
                      <div
                        key={m.id}
                        className="absolute"
                        style={{ 
                          left: '50%', 
                          top: 0, 
                          transform: `translate(-50%, ${y}px)`, 
                          pointerEvents: 'auto' 
                        }}
                        onClick={(e) => {
                          // Mode preview: pas d'interaction avec les modules
                          e.stopPropagation();
                        }}
                      >
                        <div className={modulePaddingClass}>
                          <ModuleRenderer
                            modules={[m] as any}
                            previewMode={true}
                            device={previewMode}
                            onButtonClick={handleParticipate}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SCREEN 2: Jeu */}
          {currentScreen === 'screen2' && (
            <div className={`flex flex-col ${isPhoneFrame ? 'min-h-full' : 'min-h-screen min-h-[100svh] min-h-[100dvh]'} relative`}>
              {/* Modules Logo (collés en haut sans padding) */}
              {logoModules2.length > 0 && (
                <div className="w-full">
                  <ModuleRenderer
                    modules={logoModules2 as any}
                    previewMode={true}
                    device={previewMode}
                  />
                </div>
              )}
              
              {/* Contenu avec padding */}
              <div className="flex-1 relative">
                {/* Rendu des éléments canvas (images et textes personnalisés) pour écran 2 */}
                {campaign?.design?.customImages && campaign.design.customImages.length > 0 && (
                  <div className="absolute inset-0 pointer-events-none" style={{ padding: safeZonePadding }}>
                    {campaign.design.customImages.map((img: any) => (
                      <div
                        key={img.id}
                        className="absolute"
                        style={{
                          left: `${img.x || 0}px`,
                          top: `${img.y || 0}px`,
                          width: `${img.width || 100}px`,
                          height: `${img.height || 100}px`,
                          transform: img.rotation ? `rotate(${img.rotation}deg)` : undefined,
                          pointerEvents: 'none'
                        }}
                      >
                        <img
                          src={img.src || img.url}
                          alt={img.alt || ''}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            borderRadius: img.borderRadius ? `${img.borderRadius}px` : undefined
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {campaign?.design?.customTexts && campaign.design.customTexts.length > 0 && (
                  <div className="absolute inset-0 pointer-events-none" style={{ padding: safeZonePadding }}>
                    {campaign.design.customTexts.map((txt: any) => (
                      <div
                        key={txt.id}
                        className="absolute"
                        style={{
                          left: `${txt.x || 0}px`,
                          top: `${txt.y || 0}px`,
                          width: `${txt.width || 200}px`,
                          minHeight: `${txt.height || 40}px`,
                          fontSize: `${txt.fontSize || 16}px`,
                          fontWeight: txt.fontWeight || 'normal',
                          fontStyle: txt.fontStyle || 'normal',
                          textDecoration: txt.textDecoration || 'none',
                          color: txt.color || '#000000',
                          textAlign: (txt.textAlign || 'left') as any,
                          fontFamily: txt.fontFamily || 'inherit',
                          transform: txt.rotation ? `rotate(${txt.rotation}deg)` : undefined,
                          pointerEvents: 'none',
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word'
                        }}
                      >
                        {txt.content || txt.text || ''}
                      </div>
                    ))}
                  </div>
                )}

                {/* Zone centrale: jeu centré; modules écran 2 rendus en arrière-plan pour ne pas pousser le jeu */}
                <div
                  className="flex flex-col items-center justify-center"
                  style={{ padding: safeZonePadding, boxSizing: 'border-box', minHeight: '100vh', position: 'relative', zIndex: 5 }}
                >
                  {/* Modules réguliers de l'écran 2 en overlay absolu derrière le quiz */}
                  {modules2.length > 0 && (
                    <div
                      className="absolute inset-0 flex items-start justify-center"
                      data-screen="screen2"
                      style={{ zIndex: 1, pointerEvents: 'none' }}
                    >
                      <div className="w-full max-w-[1500px]">
                        <ModuleRenderer
                          modules={modules2 as any}
                          previewMode={true}
                          device={previewMode}
                          onButtonClick={handleParticipate}
                        />
                      </div>
                    </div>
                  )}

                  {/* Modules en position libre (absolute) de l'écran 2, mirror du canvas éditeur */}
                  {absoluteModules2.length > 0 && (
                    <div className="absolute inset-0" style={{ pointerEvents: 'none', zIndex: 2 }}>
                      {absoluteModules2.map((m: any) => {
                        const y = (m.y ?? 0) as number;
                        const modulePaddingClass = previewMode === 'mobile' ? 'p-0' : 'p-4';
                        return (
                          <div
                            key={m.id}
                            className="absolute"
                            style={{
                              left: '50%',
                              top: 0,
                              transform: `translate(-50%, ${y}px)`,
                              pointerEvents: 'auto'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <div className={modulePaddingClass}>
                              <ModuleRenderer
                                modules={[m] as any}
                                previewMode={true}
                                device={previewMode}
                                onButtonClick={handleParticipate}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {campaign.type === 'wheel' && (
                    <>
                      {console.log('🔍 [PreviewRenderer] Campaign segments debug:', {
                        wheelConfigSegments: campaign?.wheelConfig?.segments,
                        gameConfigWheelSegments: campaign?.gameConfig?.wheel?.segments,
                        configRouletteSegments: campaign?.config?.roulette?.segments,
                        gameConfigWheelSegmentsCount: campaign?.gameConfig?.wheelSegments?.length,
                        gameConfigWheelSegmentsPreview: campaign?.gameConfig?.wheelSegments?.map((s: any) => ({ id: s.id, label: s.label }))
                      })}
                      <StandardizedWheel
                        campaign={campaign}
                        extractedColors={campaign?.design?.extractedColors || []}
                        wheelModalConfig={wheelModalConfig}
                        device={previewMode}
                        shouldCropWheel={true}
                        disabled={campaign.type === 'wheel' && !hasSubmittedForm}
                        onClick={handleWheelClick}
                        useDotationSystem={true}
                        participantEmail={participantEmail}
                        participantId={participantId}
                        onSpin={() => {
                          if (campaign.type === 'wheel' && !hasSubmittedForm) {
                            console.log('🎡 Wheel clicked but form not submitted yet');
                            return;
                          }
                          console.log('🎡 Wheel spinning with dotation system...');
                        }}
                        onComplete={(prize) => {
                          console.log('🎡 Wheel completed, prize:', prize);
                          // Le résultat sera déterminé par le système de dotation
                          // Pour l'instant, on considère que si un prize est retourné, c'est un win
                          const isWin = !!prize;
                          setTimeout(() => {
                            handleGameFinish(isWin ? 'win' : 'lose');
                          }, 1000);
                        }}
                      />
                    </>
                  )}

                  {/* Quiz / Swiper game */}
                  {campaign.type === 'quiz'
                    ? (
                      <TemplatedQuiz
                        campaign={previewQuizCampaign}
                        device={previewMode}
                        disabled={false}
                        templateId={derivedQuizConfig?.templateId || 'image-quiz'}
                        onClick={() => {
                          console.log('🎯 [PreviewRenderer] Quiz completed');
                          setTimeout(() => {
                            handleGameFinish('win');
                          }, 1000);
                        }}
                      />
                    )
                    : ((campaign.type === 'form' && derivedQuizConfig?.templateId) && (
                      <TemplatedSwiper
                        campaign={previewQuizCampaign}
                        device={previewMode}
                        disabled={false}
                        onClick={() => {
                          console.log('🎯 Swiper completed');
                          setTimeout(() => {
                            handleGameFinish('win');
                          }, 1000);
                        }}
                      />
                    ))}

                  {/* Fallback si aucun jeu configuré */}
                  {!campaign.type && modules2.length === 0 && (
                    <div className="mt-6 text-center p-8 bg-white/10 backdrop-blur rounded-xl">
                      <p className="text-white text-lg font-semibold mb-2">Jeu non configuré</p>
                      <p className="text-white/70 text-sm">Veuillez configurer un type de jeu dans l'éditeur</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Modules Footer (collés en bas sans padding) */}
              {footerModules2.length > 0 && (
                isPhoneFrame ? (
                  <div className="mt-auto w-full z-[9999]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
                    <ModuleRenderer
                      modules={footerModules2 as any}
                      previewMode
                      device={previewMode}
                    />
                  </div>
                ) : (
                  <div
                    className="absolute inset-x-0 bottom-0 z-[9999]"
                    style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
                  >
                    <ModuleRenderer
                      modules={footerModules2 as any}
                      previewMode
                      device={previewMode}
                    />
                  </div>
                )
              )}
            </div>
          )}

          {/* SCREEN 3: Résultat */}
          {currentScreen === 'screen3' && (
            <div 
              className="flex flex-col min-h-full"
            >
              {/* Modules Logo (collés en haut sans padding) */}
              {logoModules3.length > 0 && (
                <div className="w-full">
                  <ModuleRenderer
                    modules={logoModules3 as any}
                    previewMode={true}
                    device={previewMode}
                  />
                </div>
              )}
              
              {/* Autres modules (avec padding) - flex-1 pour pousser le footer en bas */}
              <div className="flex-1 relative">
                {/* Rendu des éléments canvas (images et textes personnalisés) pour écran 3 */}
                {campaign?.design?.customImages && campaign.design.customImages.length > 0 && (
                  <div className="absolute inset-0 pointer-events-none" style={{ padding: safeZonePadding }}>
                    {campaign.design.customImages.map((img: any) => (
                      <div
                        key={img.id}
                        className="absolute"
                        style={{
                          left: `${img.x || 0}px`,
                          top: `${img.y || 0}px`,
                          width: `${img.width || 100}px`,
                          height: `${img.height || 100}px`,
                          transform: img.rotation ? `rotate(${img.rotation}deg)` : undefined,
                          pointerEvents: 'none'
                        }}
                      >
                        <img
                          src={img.src || img.url}
                          alt={img.alt || ''}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            borderRadius: img.borderRadius ? `${img.borderRadius}px` : undefined
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {campaign?.design?.customTexts && campaign.design.customTexts.length > 0 && (
                  <div className="absolute inset-0 pointer-events-none" style={{ padding: safeZonePadding }}>
                    {campaign.design.customTexts.map((txt: any) => (
                      <div
                        key={txt.id}
                        className="absolute"
                        style={{
                          left: `${txt.x || 0}px`,
                          top: `${txt.y || 0}px`,
                          width: `${txt.width || 200}px`,
                          minHeight: `${txt.height || 40}px`,
                          fontSize: `${txt.fontSize || 16}px`,
                          fontWeight: txt.fontWeight || 'normal',
                          fontStyle: txt.fontStyle || 'normal',
                          textDecoration: txt.textDecoration || 'none',
                          color: txt.color || '#000000',
                          textAlign: (txt.textAlign || 'left') as any,
                          fontFamily: txt.fontFamily || 'inherit',
                          transform: txt.rotation ? `rotate(${txt.rotation}deg)` : undefined,
                          pointerEvents: 'none',
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word'
                        }}
                      >
                        {txt.content || txt.text || ''}
                      </div>
                    ))}
                  </div>
                )}

                {/* Messages de résultat dynamiques - Style Scratch Editor - Centré absolument */}
                <div 
                  className="absolute inset-0 flex items-center justify-center w-full"
                  style={{ padding: safeZonePadding, boxSizing: 'border-box' }}
                >
                  {(() => {
                    // Sélection des messages selon le type de campagne
                    // DesignEditor (roue) -> resultMessages
                    // JackpotEditor -> jackpotResultMessages
                    // ScratchCardEditor -> scratchResultMessages
                    const resultMessagesAll = 
                      campaign?.resultMessages || // DesignEditor (roue)
                      campaign?.jackpotResultMessages || // JackpotEditor
                      campaign?.scratchResultMessages || // ScratchCardEditor
                      (storeMessages as any) || 
                      {};
                    const hasConfirmation = Boolean((resultMessagesAll as any)?.confirmation);
                    const neutralMode = hasConfirmation || campaign?.type === 'form' || campaign?.resultMode === 'confirmation';
                    const confirmationDefaults = {
                      title: 'Merci !',
                      message: 'Votre participation a été enregistrée.',
                      subMessage: 'Vous recevrez une confirmation par email.',
                      buttonText: 'Fermer',
                      buttonAction: 'close' as const
                    };
                    const messages = neutralMode
                      ? ((resultMessagesAll as any).confirmation || confirmationDefaults)
                      : (gameResult === 'win'
                          ? ((resultMessagesAll as any).winner || {
                              title: '🎉 Félicitations !',
                              message: 'Vous avez gagné !',
                              subMessage: 'Un email de confirmation vous a été envoyé',
                              buttonText: 'Fermer',
                              buttonAction: 'close',
                              showPrizeImage: true
                            })
                          : ((resultMessagesAll as any).loser || {
                              title: '😞 Dommage !',
                              message: 'Merci pour votre participation !',
                              subMessage: 'Tentez votre chance une prochaine fois',
                              buttonText: 'Rejouer',
                              buttonAction: 'replay'
                            }));

                    const handleButtonClick = () => {
                      if (messages.buttonAction === 'replay') {
                        handleReset();
                      } else if (messages.buttonAction === 'redirect' && messages.redirectUrl) {
                        window.location.href = messages.redirectUrl;
                      } else {
                        // action close par défaut
                        console.log('Close action');
                      }
                    };

                    // Vérifier si on doit afficher une image de fond
                    const displayType = messages.displayType || 'message';
                    const backgroundImage = messages.backgroundImage;

                    // Si displayType est 'image' et qu'une image est uploadée
                    if (displayType === 'image' && backgroundImage) {
                      return (
                        <div
                          className="absolute inset-0 w-full h-full bg-cover bg-center flex items-center justify-center"
                          style={{
                            backgroundImage: `url(${backgroundImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          {/* Bouton d'action par-dessus l'image */}
                          <button
                            onClick={handleButtonClick}
                            className="absolute left-1/2 transform -translate-x-1/2 px-6 py-2.5 font-medium text-sm hover:opacity-90 transition-all duration-200 shadow-lg"
                            style={{
                              bottom: '20%',
                              ...globalButtonStyle,
                              backgroundColor: (formConfig as any)?.buttonColor || (globalButtonStyle as any)?.backgroundColor || '#44444d',
                              color: (formConfig as any)?.buttonTextColor || (globalButtonStyle as any)?.color || '#ffffff',
                              borderRadius: (typeof (formConfig as any)?.borderRadius === 'number'
                                ? `${(formConfig as any).borderRadius}px`
                                : ((globalButtonStyle as any)?.borderRadius || '12px')),
                              minWidth: 'auto',
                              width: 'auto'
                            }}
                          >
                            {messages.buttonText || 'Fermer'}
                          </button>
                        </div>
                      );
                    }

                    // Sinon, afficher le message classique (carte)
                    return (
                      <div
                        className="shadow-lg p-8 text-center max-w-md w-full mx-auto"
                        style={{
                          backgroundColor: (formConfig as any)?.panelBg || '#ffffff',
                          borderRadius: typeof (formConfig as any)?.borderRadius === 'number' ? `${(formConfig as any).borderRadius}px` : '12px',
                          border: `1px solid ${((formConfig as any)?.borderColor || 'rgba(0,0,0,0.05)')}`
                        }}
                      >
                        {/* Titre principal */}
                        <h2
                          className="text-2xl font-semibold mb-3 text-center"
                          style={{ color: (formConfig as any)?.textColor || '#111827' }}
                        >
                          {messages.title}
                        </h2>

                        {/* Message principal */}
                        <p
                          className="text-base mb-2"
                          style={{ color: (formConfig as any)?.textColor || '#374151' }}
                        >
                          {messages.message}
                        </p>

                        {/* Sous-message */}
                        {messages.subMessage && (
                          <p
                            className="text-sm mb-6"
                            style={{ color: (formConfig as any)?.textColor || '#6B7280' }}
                          >
                            {messages.subMessage}
                          </p>
                        )}

                        {/* Bouton d'action principal */}
                        <button
                          onClick={handleButtonClick}
                          className="w-full font-medium text-base hover:opacity-90 transition-all duration-200"
                          style={{
                            ...globalButtonStyle,
                            backgroundColor: (formConfig as any)?.buttonColor || (globalButtonStyle as any)?.backgroundColor || '#44444d',
                            color: (formConfig as any)?.buttonTextColor || (globalButtonStyle as any)?.color || '#ffffff',
                            borderRadius: (typeof (formConfig as any)?.borderRadius === 'number'
                              ? `${(formConfig as any).borderRadius}px`
                              : ((globalButtonStyle as any)?.borderRadius || '12px'))
                          }}
                        >
                          {messages.buttonText}
                        </button>
                      </div>
                    );
                  })()}
                </div>

                {/* Modules de l'écran 3 (en dessous des messages) */}
                {modules3.length > 0 && (
                  <section 
                    className="space-y-6" 
                    data-screen="screen3"
                    style={{ padding: safeZonePadding, boxSizing: 'border-box' }}
                  >
                    <ModuleRenderer
                      modules={modules3 as any}
                      previewMode={true}
                      device={previewMode}
                      onButtonClick={handleReset}
                    />
                  </section>
                )}
              </div>
              
              {/* Modules Footer (collés en bas sans padding) */}
              {footerModules3.length > 0 && (
                <div className="w-full">
                  <ModuleRenderer
                    modules={footerModules3 as any}
                    previewMode={true}
                    device={previewMode}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {isPhoneFrame ? (
        <div className="w-full h-full min-h-full flex items-center justify-center" style={{ backgroundColor: '#2c2c35' }}>
          <div
            className="relative"
            style={{
              width: 360,
              height: 640,
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 14px 40px rgba(0,0,0,0.35)',
              backgroundColor: '#000'
            }}
          >
            {InnerContent}
          </div>
        </div>
      ) : (
        <div className={constrainedHeight ? "w-full h-full" : "w-full h-[100dvh] min-h-[100dvh]"}>
          {InnerContent}
        </div>
      )}
      
      {/* Contact Form Modal - Skip for form campaigns in mobile (they use inline slide-up) */}
      {showContactForm && !(campaign?.type === 'form' && previewMode === 'mobile') && (() => {
        const baseHeight = 400;
        const fieldHeight = 80;
        const calculatedHeight = baseHeight + (contactFields.length * fieldHeight);
        const maxScreenHeight = window.innerHeight * 0.85;
        const maxHeight = `${Math.min(calculatedHeight, maxScreenHeight)}px`;
        
        return (
          <Modal
            onClose={() => {
              // Fermer la modal sans passer à l'écran suivant
              // L'utilisateur doit remplir le formulaire pour continuer
              console.log('⚠️ [PreviewRenderer] Form modal closed without submission - user must submit to continue');
              setShowContactForm(false);
              // Ne PAS passer à l'écran suivant si le formulaire n'a pas été soumis
            }}
            title={campaign?.screens?.[1]?.title || 'Vos informations'}
            maxHeight={maxHeight}
            usePortal={!constrainedHeight}
          >
        
          <DynamicContactForm
            fields={contactFields as any}
            submitLabel={campaign?.screens?.[1]?.buttonText || "C'est parti !"}
            onSubmit={handleFormSubmit}
            textStyles={{
              label: { color: '#374151', fontFamily: 'inherit' },
              button: {
                backgroundColor: globalButtonStyle.backgroundColor || '#44444d',
                color: globalButtonStyle.color || '#ffffff',
                borderRadius: globalButtonStyle.borderRadius || '8px',
                fontFamily: 'inherit',
                fontWeight: '600'
              }
            }}
            inputBorderColor={campaign?.design?.customColors?.primary || campaign?.design?.borderColor || '#E5E7EB'}
            inputFocusColor={campaign?.design?.customColors?.primary || campaign?.design?.buttonColor || '#44444d'}
          />
        </Modal>
        );
      })()}
    </>
  );
};

export default PreviewRenderer;
