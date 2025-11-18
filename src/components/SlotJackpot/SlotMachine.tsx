// Session in-memory (module-scoped) to survive transient remounts within the same page
const jackpotSession = {
  hasSpun: false,
  spinning: false,
  hardTimerId: null as number | null,
};

// UI cache per campaign to avoid flicker on transient remounts
const jackpotUiCache: Map<string, { reels: string[]; offsets: number[] }> = new Map();

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { jackpotDotationIntegration } from '@/services/JackpotDotationIntegration';
import './SlotMachine.css';

interface SlotMachineProps {
  campaign?: any; // Campaign data for configuration
  onWin?: (result: string[]) => void;
  onLose?: () => void;
  onOpenConfig?: () => void;
  disabled?: boolean;
  symbols?: string[]; // Optionnel: permet d'injecter des symboles
  templateOverride?: string; // Optionnel: forcer un template (preview)
  // Dotation system
  participantEmail?: string;
  participantId?: string;
  useDotationSystem?: boolean;
}

const DEFAULT_SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '🔔', '7️⃣'];

// Mapping des templates vers les noms de fichiers
const getTemplateFileName = (templateId: string): string => {
  const templateMap: Record<string, string> = {
    'jackpot-frame': 'jackpot-frame.svg',
    'jackpot-2': 'Jackpot 2.svg',
    'jackpot-3': 'Jackpot 3.svg',
    'jackpot-4': 'Jackpot 4.svg',
    'jackpot-5': 'Jackpot 5.svg',
    'jackpot-6': 'Jackpot 6.svg',
    'jackpot-8': 'Jackpot 8.svg',
    'jackpot-9': 'Jackpot 9.svg',
    'jackpot-10': 'Jackpot 10.svg',
    'jackpot-11': 'Jackpot 11.svg'
  };
  return templateMap[templateId] || 'Jackpot 11.svg';
};

// Retourne une URL encodée et safe pour CSS url(...) y compris les espaces
const getTemplateUrl = (templateId: string): string => {
  const path = `/assets/slot-frames/${getTemplateFileName(templateId)}`;
  return encodeURI(path);
};

const SlotMachine: React.FC<SlotMachineProps> = ({ 
  campaign: campaignProp,
  onWin, 
  onLose, 
  onOpenConfig, 
  disabled = false, 
  symbols: propSymbols, 
  templateOverride,
  participantEmail,
  participantId,
  useDotationSystem = true // ✅ Activer par défaut le système de dotation
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const animReqs = useRef<number[]>([]);
  const reelStartTimes = useRef<number[]>([]);
  const finalsRef = useRef<string[]>([]);
  const finishTimeoutRef = useRef<number | null>(null);
  const resultTimeoutRef = useRef<number | null>(null);
  const finishScheduledRef = useRef(false);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const heartbeatIdRef = useRef<number | null>(null);
  
  // 🚀 REFS DOM pour manipulation directe (pas de re-render)
  const reelStripRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  
  // Persistance du template sélectionné via localStorage
  const getPersistedTemplate = () => {
    try {
      return localStorage.getItem('jackpotTemplate') || 'jackpot-11';
    } catch {
      return 'jackpot-11';
    }
  };

  // Utiliser le template persisté ou l'override du preview
  const [currentTemplate, setCurrentTemplate] = useState<string>(() => {
    return templateOverride || getPersistedTemplate();
  });

  // Forcer la mise à jour lorsqu'un templateOverride est fourni par le mode preview
  React.useEffect(() => {
    if (templateOverride) {
      setCurrentTemplate(templateOverride);
    }
  }, [templateOverride]);
  
  // Écouter les changements du store ET localStorage
  React.useEffect(() => {
    if (templateOverride) {
      // En mode preview avec override, on n'écoute pas le store pour éviter les conflits
      return;
    }
    
    const unsubscribe = useEditorStore?.subscribe((state: any) => {
      const storeTemplate = (state.campaign?.gameConfig?.jackpot as any)?.template;
      const persistedTemplate = getPersistedTemplate();
      
      // Priorité: store > localStorage > fallback
      const newTemplate = storeTemplate || persistedTemplate;
      
      if (newTemplate !== currentTemplate) {
        setCurrentTemplate(newTemplate);
      }
    });

    // Vérifier immédiatement au montage
    const initialCheck = () => {
      const storeTemplate = (useEditorStore?.getState()?.campaign?.gameConfig?.jackpot as any)?.template;
      const persistedTemplate = getPersistedTemplate();
      const newTemplate = storeTemplate || persistedTemplate;
      
      if (newTemplate !== currentTemplate) {
        setCurrentTemplate(newTemplate);
      }
    };
    
    initialCheck();
    return unsubscribe;
  }, [currentTemplate, templateOverride]);
  
  // Récupérer les symboles depuis le store
  const campaignFromStore = useEditorStore?.((s: any) => s.campaign);
  // Utiliser la prop en priorité, sinon le store
  const campaign = campaignProp || campaignFromStore;
  const jackpotConfig = (campaign?.gameConfig?.jackpot as any) || {};
  const storedSlotSymbols = Array.isArray(jackpotConfig.slotMachineSymbols)
    ? (jackpotConfig.slotMachineSymbols as unknown[]).filter((s) => typeof s === 'string') as string[]
    : undefined;
  const symbolToPrizeMap = jackpotConfig.symbolToPrizeMap as Record<string, string> | undefined;
  const campaignSymbolsRaw = jackpotConfig.symbols;
  const campaignSymbols = useMemo(() => {
    if (!campaignSymbolsRaw) return undefined;
    if (Array.isArray(campaignSymbolsRaw)) {
      if (campaignSymbolsRaw.every((s) => typeof s === 'string')) {
        return campaignSymbolsRaw as string[];
      }
      const converted = (campaignSymbolsRaw as any[]).map((symbol) => {
        if (typeof symbol === 'string') return symbol;
        if (symbol?.contentType === 'image' && typeof symbol?.imageUrl === 'string') {
          return symbol.imageUrl;
        }
        if (typeof symbol?.emoji === 'string') {
          return symbol.emoji;
        }
        return null;
      }).filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
      return converted.length > 0 ? converted : undefined;
    }
    return undefined;
  }, [campaignSymbolsRaw]);
  const jackpotStyle = (jackpotConfig.style as any) || {};
  const customFrameCfg = (jackpotConfig.customFrame as any) || {};
  const customTemplateUrl = (jackpotConfig.customTemplateUrl as string) || '';
  const buttonCfg = (jackpotConfig.button as any) || {};
  const btnTextCfg: string = buttonCfg.text ?? 'SPIN';
  const btnColors = (buttonCfg.colors as any) || {};
  const btnBg = btnColors.background ?? jackpotConfig.buttonColor ?? undefined;
  const btnBorder = btnColors.border ?? jackpotConfig.borderColor ?? undefined;
  const btnTextColor = btnColors.text ?? undefined;
  const reelBorderColor = jackpotConfig.borderColor || jackpotStyle.borderColor || '#ffd700';
  const reelBackgroundColor = jackpotConfig.backgroundColor || jackpotStyle.backgroundColor || '#ffffff';
  const reelTextColor = jackpotConfig.textColor || jackpotStyle.textColor || '#333333';
  
  const symbols = useMemo(() => {
    const src = propSymbols ?? storedSlotSymbols ?? campaignSymbols ?? DEFAULT_SYMBOLS;
    const cleaned = (src || []).filter((s) => typeof s === 'string' && s.trim().length > 0);
    return cleaned.length > 0 ? cleaned : DEFAULT_SYMBOLS;
  }, [propSymbols, storedSlotSymbols, campaignSymbols]);

  // Réinitialiser la session globale lorsque l'on change de campagne pour éviter
  // qu'un spin d'une ancienne campagne bloque la nouvelle (aperçu de campagnes sauvegardées).
  React.useEffect(() => {
    try {
      const campaignId = campaign?.id;
      if (!campaignId) {
        return;
      }
      // Reset complet de la session in-memory
      if (jackpotSession.hardTimerId) {
        clearTimeout(jackpotSession.hardTimerId as any);
        jackpotSession.hardTimerId = null;
      }
      jackpotSession.hasSpun = false;
      jackpotSession.spinning = false;
    } catch {
      // ignore
    }
  }, [campaign?.id]);
  // Initialiser dès le premier render pour éviter tout flash de symboles par défaut
  const initialSetup = useMemo(() => {
    const size = (templateOverride === 'jackpot-4') ? 80 : 70;
    const campaignId = String(campaign?.id || 'preview');

    // Use cached UI state if available to prevent flicker on remount
    const cached = jackpotUiCache.get(campaignId);
    if (cached && Array.isArray(cached.reels) && Array.isArray(cached.offsets)) {
      return { reels0: cached.reels, offsets0: cached.offsets };
    }

    const reels0 = [0, 1, 2].map(() => symbols[Math.floor(Math.random() * symbols.length)]);
    const offsets0 = reels0.map((s) => {
      const idx = symbols.indexOf(s);
      return -(Math.max(idx, 0) * size);
    });

    // Prime cache for first render
    jackpotUiCache.set(campaignId, { reels: reels0, offsets: offsets0 });
    return { reels0, offsets0 };
  }, [symbols, templateOverride, campaign?.id]);
  const [reels, setReels] = useState<string[]>(() => [initialSetup.reels0[0], initialSetup.reels0[1], initialSetup.reels0[2]]);
  const [hasPlayed, setHasPlayed] = useState(false); // Non utilisé pour bloquer désormais
  // Utiliser useRef pour completedReels car setState ne fonctionne pas bien dans requestAnimationFrame
  const completedReelsRef = useRef<boolean[]>([true, true, true]);
  const [completedReels, setCompletedReels] = useState<boolean[]>([true, true, true]);
  // Offsets et cibles initialisés après initialSetup pour éviter toute référence précocement
  const [reelOffsets, setReelOffsets] = useState<number[]>(() => [initialSetup.offsets0[0], initialSetup.offsets0[1], initialSetup.offsets0[2]]);
  const targetOffsetsRef = useRef<number[]>([initialSetup.offsets0[0], initialSetup.offsets0[1], initialSetup.offsets0[2]]);

  // Persist UI state in cache to survive transient remounts
  React.useEffect(() => {
    try {
      const campaignId = String(campaign?.id || 'preview');
      jackpotUiCache.set(campaignId, { reels, offsets: reelOffsets });
    } catch {}
  }, [reels, reelOffsets, campaign?.id]);
  
  // 🔒 CRITICAL: Ref séparé pour stocker le résultat final de manière IMMUABLE
  const lockedFinalsRef = useRef<string[] | null>(null);
  
  // Fonction helper pour mettre à jour completedReels de manière synchrone
  const updateCompletedReel = (index: number, value: boolean) => {
    completedReelsRef.current[index] = value;
    setCompletedReels([...completedReelsRef.current]);
  };

  const clearFinishTimers = useCallback(() => {
    if (finishTimeoutRef.current) {
      clearTimeout(finishTimeoutRef.current);
      finishTimeoutRef.current = null;
    }
    if (resultTimeoutRef.current) {
      clearTimeout(resultTimeoutRef.current);
      resultTimeoutRef.current = null;
    }
    finishScheduledRef.current = false;
  }, []);

  const finalizeSpin = useCallback(() => {
    if (finishTimeoutRef.current) {
      clearTimeout(finishTimeoutRef.current);
      finishTimeoutRef.current = null;
    }
    
    // 🔒 CRITICAL: Utiliser lockedFinalsRef qui n'a JAMAIS été modifié depuis le début du spin
    const finals = lockedFinalsRef.current ? [...lockedFinalsRef.current] : [];
    finishScheduledRef.current = false;
    console.log('🎯 [SlotMachine] finalizeSpin triggered');
    console.log('🔍 [SlotMachine] Finals from lockedFinalsRef:', finals);
    console.log('🔍 [SlotMachine] lockedFinalsRef.current:', lockedFinalsRef.current);
    console.log('🔍 [SlotMachine] finalsRef.current (for comparison):', finalsRef.current);
    
    setIsSpinning(false);
    jackpotSession.spinning = false;
    try {
      (window as any).__jackpotSpinLock = false;
      window.dispatchEvent(new CustomEvent('jackpot:spin-end'));
    } catch {}
    if (jackpotSession.hardTimerId) {
      clearTimeout(jackpotSession.hardTimerId);
      jackpotSession.hardTimerId = null;
    }
    if (heartbeatIdRef.current) {
      clearInterval(heartbeatIdRef.current as any);
      heartbeatIdRef.current = null;
    }
    // Forcer l'état visuel final uniquement si des frames ont été perdues
    const allCompleted = completedReelsRef.current?.every(Boolean);
    if (finals && finals.length === 3 && !allCompleted) {
      const size = (currentTemplate === 'jackpot-4') ? 80 : 70;
      const finalOffsets = finals.map((s) => -(Math.max(symbols.indexOf(s), 0) * size));
      targetOffsetsRef.current = finalOffsets as any;
      setReelOffsets(finalOffsets as any);
      completedReelsRef.current = [true, true, true];
      setCompletedReels([true, true, true]);
      setReels([finals[0], finals[1], finals[2]]);
    }

    if (!finals || finals.length === 0) {
      console.warn('⚠️ [SlotMachine] finalizeSpin appelée sans résultat');
      return;
    }

    // 🔒 Calculer le résultat AVANT d'appeler les callbacks
    const isWinning = finals.every((symbol) => symbol === finals[0]);
    console.log(`🎲 [SlotMachine] Final result computed: ${isWinning ? 'WIN' : 'LOSE'}`, finals);
    console.log('🔒 [SlotMachine] Result locked, calling callbacks with:', finals);

    // Appeler immédiatement car l'animation a déjà duré ~3.6s + 100ms
    // Le délai de 2s sera géré par FunnelUnlockedGame qui affiche le jeu pendant 2s avant de montrer le résultat
    if (isWinning) {
      console.log('🎉 [SlotMachine] Calling onWin immediately with finals:', finals);
      onWin?.(finals);
    } else {
      console.log('😔 [SlotMachine] Calling onLose immediately');
      onLose?.();
    }
  }, [onLose, onWin, currentTemplate, symbols]);

  const spin = useCallback(async () => {
    if (jackpotSession.spinning || jackpotSession.hasSpun) {
      console.log('⏸️ [SlotMachine] SPIN BLOCKED by session:', { session: { ...jackpotSession } });
      return;
    }
    if (isSpinning || disabled || hasPlayed) {
      console.log('⏸️ [SlotMachine] SPIN BLOCKED:', { isSpinning, disabled, hasPlayed });
      return;
    }

    // Log du démarrage de spin gardé minimal pour éviter le flood console
    console.log('🚀 [SlotMachine] SPIN STARTED');
    try {
      // Notifier le parent pour verrouiller les re-renders destructifs pendant le spin
      (window as any).__jackpotSpinLock = true;
      window.dispatchEvent(new CustomEvent('jackpot:spin-start'));
    } catch {}
    clearFinishTimers();
    jackpotSession.hasSpun = true;
    jackpotSession.spinning = true;
    setHasPlayed(true); // Autoriser un seul spin maximum
    setIsSpinning(true);

    // Choisir les résultats finaux dès le départ
    let finals: string[];
    
    // 🎯 Utiliser le système de dotation si activé
    if (useDotationSystem && campaign?.id && participantEmail) {
      try {
        // Logs de debug détaillés désactivés par défaut pour ne pas saturer la console
        
        const result = await jackpotDotationIntegration.determineJackpotSpin(
          {
            campaignId: campaign.id,
            participantEmail,
            participantId,
            userAgent: navigator.userAgent
          },
          symbols,
          symbolToPrizeMap
        );
        
        finals = result.symbols;
        if ((window as any).__DEBUG_JACKPOT__) {
          console.log('🎲 [SlotMachine] Dotation result:', result);
        }
      } catch (error) {
        console.error('❌ [SlotMachine] Dotation error, falling back to random:', error);
        finals = [0, 1, 2].map(() => symbols[Math.floor(Math.random() * symbols.length)]);
      }
    } else {
      // Mode aléatoire (par défaut)
      if ((window as any).__DEBUG_JACKPOT__) {
        console.log('🎲 [SlotMachine] Using random mode');
      }
      finals = [0, 1, 2].map(() => symbols[Math.floor(Math.random() * symbols.length)]);
    }
    
    // 🔒 CRITICAL: Verrouiller les finals pour qu'ils ne changent JAMAIS pendant le spin
    finalsRef.current = [...finals]; // Copie pour éviter toute mutation
    lockedFinalsRef.current = [...finals]; // Copie IMMUABLE pour finalizeSpin
    if ((window as any).__DEBUG_JACKPOT__) {
      console.log('🎯 [SlotMachine] Finals determined at spin start:', finals);
      console.log('🔒 [SlotMachine] Finals locked in finalsRef.current:', finalsRef.current);
      console.log('🔒 [SlotMachine] Finals locked in lockedFinalsRef.current:', lockedFinalsRef.current);
    }
    
    // Sauvegarder aussi dans une variable locale pour l'animation
    const lockedFinals = [...finals];

    // 🎰 ANIMATION RÉALISTE AVEC DÉCALAGES
    // Chaque rouleau a sa propre durée et son propre délai de démarrage (définis plus bas)
    const cellSize = (currentTemplate === 'jackpot-4') ? 80 : 70;
    const stripLength = symbols.length * cellSize;

    // Nettoyage
    animReqs.current.forEach((id) => cancelAnimationFrame(id));
    animReqs.current = [];
    reelStartTimes.current = [0, 0, 0];
    completedReelsRef.current = [false, false, false];
    setCompletedReels([false, false, false]);

    const startOffsets = [...reelOffsets];
    
    [0, 1, 2].forEach((reelIndex) => {
      const finalSymbol = lockedFinals[reelIndex];
      const finalSymbolIndex = symbols.indexOf(finalSymbol);
      if ((window as any).__DEBUG_JACKPOT__) {
        console.log(`🎯 [SlotMachine] Rouleau ${reelIndex} target:`, finalSymbol);
      }
      
      // 🎰 CONFIGURATION PAR ROULEAU
      // Chaque rouleau fait un nombre différent de tours pour plus de suspense
      const fullCycles = 12 + (reelIndex * 3); // 12, 15, 18 tours (plus de rotations = plus de suspense)
      
      // Position finale du symbole gagnant
      const targetOffset = -(finalSymbolIndex * cellSize);
      targetOffsetsRef.current[reelIndex] = targetOffset;
      
      // Calculer la distance pour arriver pile sur le symbole final
      const currentPos = startOffsets[reelIndex];
      const distanceToTarget = currentPos - targetOffset;
      const totalDistance = (fullCycles * stripLength) + distanceToTarget;
      // Durées plus longues pour plus de suspense (4s, 4.6s, 5.2s)
      const duration = 4000 + (reelIndex * 600);
      // Délais de démarrage plus espacés (0ms, 300ms, 600ms)
      const startDelay = reelIndex * 300;

      // 🎰 DÉLAI DE DÉMARRAGE pour effet cascade
      const startAnimation = () => {
        const animate = (ts: number) => {
          if (reelStartTimes.current[reelIndex] === 0) {
            reelStartTimes.current[reelIndex] = ts;
          }
          const elapsed = ts - reelStartTimes.current[reelIndex];
          
          // Appliquer le délai de démarrage
          if (elapsed < startDelay) {
            animReqs.current[reelIndex] = requestAnimationFrame(animate);
            return;
          }
          
          const adjustedElapsed = elapsed - startDelay;
          const progress = Math.min(1, adjustedElapsed / duration);
          
          // 🎰 EASING RÉALISTE TYPE MACHINE À SOUS
          // Phase 1: Accélération rapide (0-10%)
          // Phase 2: Vitesse maximale constante (10-70%)
          // Phase 3: Décélération progressive dramatique (70-100%)
          let eased: number;
          if (progress < 0.1) {
            // Accélération rapide (easeOutCubic)
            const t = progress / 0.1;
            eased = t * t * t * 0.1;
          } else if (progress < 0.7) {
            // Vitesse constante élevée
            const t = (progress - 0.1) / 0.6;
            eased = 0.1 + (t * 0.6);
          } else {
            // Décélération dramatique (easeOutQuart avec effet de "settling")
            const t = (progress - 0.7) / 0.3;
            // Courbe en 4 phases pour ralentissement progressif
            const easeOut = 1 - Math.pow(1 - t, 4);
            eased = 0.7 + (0.3 * easeOut);
          }
          
          // 🎰 ANIMATION CONTINUE SANS MODULO (pas de saut)
          const distanceTravelled = totalDistance * eased;
          const currentOffset = startOffsets[reelIndex] - distanceTravelled;

          // 🚀 MANIPULATION DOM DIRECTE pour 60 FPS (pas de re-render React)
          const stripElement = reelStripRefs.current[reelIndex];
          if (stripElement) {
            // Pas de modulo = animation continue et fluide
            stripElement.style.transform = `translateY(${currentOffset}px)`;
          }

          if (progress < 1) {
            animReqs.current[reelIndex] = requestAnimationFrame(animate);
          } else {
          // Animation terminée: snap à la position finale exacte
          if ((window as any).__DEBUG_JACKPOT__) {
            console.log(`🎯 [SlotMachine] Rouleau ${reelIndex} terminé`);
          }
          const snapOffset = targetOffsetsRef.current[reelIndex] ?? -(finalSymbolIndex * cellSize);
          
          // Snap final via DOM direct
          if (stripElement) {
            stripElement.style.transform = `translateY(${snapOffset}px)`;
          }
          
          updateCompletedReel(reelIndex, true);
          
          setReels((prev) => {
            const next = [...prev];
            next[reelIndex] = finalSymbol;
            return next;
          });
          
          // Si tous les rouleaux sont terminés, finaliser
          if (completedReelsRef.current.every(Boolean) && !finishScheduledRef.current) {
            finishScheduledRef.current = true;
            setIsSpinning(false);
            
            finishTimeoutRef.current = window.setTimeout(() => {
              finalizeSpin();
            }, 100);
          }
          }
        };
        
        animReqs.current[reelIndex] = requestAnimationFrame(animate);
      };
      
      // Démarrer l'animation
      startAnimation();
    });
  }, [isSpinning, disabled, hasPlayed, symbols, currentTemplate, finalizeSpin, clearFinishTimers, useDotationSystem, campaign, participantEmail, participantId, campaignProp]);

  const isCustomTemplate = currentTemplate === 'custom-frame';
  const isUserTemplate = currentTemplate === 'user-template' && !!customTemplateUrl;

  // Log pour déboguer le rendu avec stack trace pour voir qui cause le re-render
  // Log de render désactivé par défaut pour éviter un spam massif (60fps).
  if ((window as any).__DEBUG_JACKPOT__) {
    console.log('🎨 [SlotMachine] RENDER:', {
      isSpinning,
      completedReels: completedReels,
      completedReelsValues: `[${completedReels[0]}, ${completedReels[1]}, ${completedReels[2]}]`,
      reels: reels.map(r => typeof r === 'string' ? r.substring(0, 10) : r),
      disabled,
      templateOverride,
      symbolsCount: symbols?.length
    });
  }
  
  // Si on passe de spinning à non-spinning pendant l'animation, c'est un problème
  if (!isSpinning && completedReels.some(c => !c)) {
    console.error('❌ [SlotMachine] BUG DÉTECTÉ: isSpinning=false mais rouleaux pas tous terminés! Correction automatique en cours...', {
      completedReels,
      stackTrace: new Error().stack
    });

    try {
      // 🔒 Utiliser les finals verrouillés si disponibles, sinon générer un fallback cohérent
      const size = (currentTemplate === 'jackpot-4') ? 80 : 70;
      let finals = lockedFinalsRef.current || finalsRef.current;
      if (!finals || finals.length !== 3) {
        finals = [0, 1, 2].map(() => symbols[Math.floor(Math.random() * symbols.length)]);
        finalsRef.current = finals;
        lockedFinalsRef.current = finals;
      }

      const targets = finals.map((s) => -(Math.max(symbols.indexOf(s), 0) * size));
      targetOffsetsRef.current = targets as any;

      // Snap direct des rouleaux sur la position finale
      setReelOffsets(targets as any);
      completedReelsRef.current = [true, true, true];
      setCompletedReels([true, true, true]);
      setReels([finals[0], finals[1], finals[2]]);

      // Finaliser immédiatement le spin pour débloquer l'état
      finalizeSpin();
    } catch (autoFixError) {
      console.error('❌ [SlotMachine] Auto-fix failed:', autoFixError);
    }
  }

  React.useEffect(() => {
    // Synchronize with module session to prevent second click after remount
    if (jackpotSession.hasSpun && !hasPlayed) {
      setHasPlayed(true);
    }
    if (jackpotSession.spinning && !isSpinning) {
      // Re-signal spinning state for rendering logic after remount
      setIsSpinning(true);
    }
    if ((window as any).__DEBUG_JACKPOT__) {
      console.log('🟢 [SlotMachine] Component MOUNTED');
    }
    return () => {
      if ((window as any).__DEBUG_JACKPOT__) {
        console.log('🔴 [SlotMachine] Component UNMOUNTING - cleaning up animations');
      }
      animReqs.current.forEach((id) => cancelAnimationFrame(id));
      animReqs.current = [];
      clearFinishTimers();
      if (heartbeatIdRef.current) {
        clearInterval(heartbeatIdRef.current as any);
        heartbeatIdRef.current = null;
      }
    };
  }, [clearFinishTimers]);

  // If remount happened mid-spin (fullscreen editor), snap directly to final positions
  React.useEffect(() => {
    if (!jackpotSession.spinning) return;
    // If there are already RAFs active, do nothing
    if (animReqs.current && animReqs.current.length > 0) return;

    // Ensure we have finals and target offsets
    const size = (currentTemplate === 'jackpot-4') ? 80 : 70;
    let finals = finalsRef.current;
    if (!finals || finals.length !== 3) {
      finals = [0, 1, 2].map(() => symbols[Math.floor(Math.random() * symbols.length)]);
      finalsRef.current = finals;
    }
    const targets = finals.map((s) => -(Math.max(symbols.indexOf(s), 0) * size));
    targetOffsetsRef.current = targets as any;

    // CRITICAL: Snap directement aux positions finales (pas d'animation smooth)
    setReelOffsets(targets as any);
    setIsSpinning(false);
    completedReelsRef.current = [true, true, true];
    setCompletedReels([true, true, true]);
    setReels([finals![0], finals![1], finals![2]]);
    finalizeSpin();
  }, [currentTemplate, symbols, finalizeSpin]);

  // Heartbeat: if frames stop > 150ms while spinning, auto-resume smooth finish
  React.useEffect(() => {
    if (!(isSpinning || jackpotSession.spinning)) return;
    if (heartbeatIdRef.current) {
      clearInterval(heartbeatIdRef.current as any);
      heartbeatIdRef.current = null;
    }
    heartbeatIdRef.current = window.setInterval(() => {
      const now = performance.now();
      if (now - (lastFrameTimeRef.current || 0) > 150) {
        if (animReqs.current.length === 0) {
          // Trigger the same smooth finish as resume effect
          const size = (currentTemplate === 'jackpot-4') ? 80 : 70;
          let finals = finalsRef.current;
          if (!finals || finals.length !== 3) {
            finals = [0, 1, 2].map(() => symbols[Math.floor(Math.random() * symbols.length)]);
            finalsRef.current = finals;
          }
          const targets = finals.map((s) => -(Math.max(symbols.indexOf(s), 0) * size));
          targetOffsetsRef.current = targets as any;
          setIsSpinning(true);
          const total = 2400;
          const start = performance.now();
          const step = () => {
            const t = Math.min(1, (performance.now() - start) / total);
            const ease = (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)); // easeOutExpo
            setReelOffsets((prev) => prev.map((v, idx) => v + (targets[idx] - v) * ease) as any);
            lastFrameTimeRef.current = performance.now();
            if (t < 1) {
              const id = requestAnimationFrame(step);
              animReqs.current.push(id);
            } else {
              completedReelsRef.current = [true, true, true];
              setCompletedReels([true, true, true]);
              setReels([finals![0], finals![1], finals![2]]);
              finalizeSpin();
            }
          };
          const id = requestAnimationFrame(step);
          animReqs.current = [id];
        }
      }
    }, 200) as any;
    return () => {
      if (heartbeatIdRef.current) {
        clearInterval(heartbeatIdRef.current as any);
        heartbeatIdRef.current = null;
      }
    };
  }, [isSpinning, currentTemplate, symbols, finalizeSpin]);

  // Update lastFrameTimeRef on visual updates
  React.useEffect(() => {
    lastFrameTimeRef.current = performance.now();
  }, [reelOffsets, completedReels]);

  return (
    <div 
      className="slot-root"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px'
      }}
    >
      <div 
        className="slot-machine"
        style={{
          width: '400px',
          height: '300px',
          position: 'relative',
          backgroundImage: isCustomTemplate 
            ? 'none' 
            : (isUserTemplate ? `url("${customTemplateUrl}")` : `url("${getTemplateUrl(currentTemplate)}")`),
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        {/* Pour le template personnalisé: dessiner un cadre flexible */}
        {isCustomTemplate ? (
          <div
            style={{
              position: 'absolute',
              top: '65%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              // Base dimensions fixes pour le cadre personnalisé
              width: 272,
              height: 133,
              borderRadius: 14,
              background: customFrameCfg.frameColor || '#bdbdbd',
              border: customFrameCfg.showBorder ? `4px solid ${customFrameCfg.borderColor || '#000'}` : 'none',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              // Largeur de couleur du cadre contrôlée par frameThickness
              padding: Number(customFrameCfg?.frameThickness ?? 12)
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 10,
                background: customFrameCfg.backgroundColor || '#3d343d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Zone centrale pour les rouleaux */}
              <div 
                className="slot-machine-container"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {/* Rouleaux */}
                <div 
                  className="slot-reels"
                  style={{ display: 'flex', gap: '8px' }}
                >
                  {reels.map((symbol, reelIdx) => {
                    const size = 70;
                    const isReverse = false; // Tous les rouleaux tournent dans le même sens
                    // Strip TRÈS LONGUE pour animation continue sans boucle
                    const strip = Array(150).fill(null).flatMap(() => symbols);
                    const targetOffset = targetOffsetsRef.current[reelIdx] ?? -(Math.max(symbols.indexOf(reels[reelIdx]), 0) * size);
                    const shouldAnimate = isSpinning || jackpotSession.spinning;
                    // L'offset est maintenant géré directement par le DOM via refs
                    const currentOffset = targetOffset;

                    return (
                      <div
                        key={reelIdx}
                        className={`slot-reel`}
                        style={{
                          width: `${size}px`,
                          height: `${size}px`,
                          background: reelBackgroundColor,
                          border: `2px solid ${reelBorderColor}`,
                          borderRadius: '8px',
                          overflow: 'hidden',
                          position: 'relative',
                          transform: isReverse ? 'scaleY(-1)' : 'none' // Inverser visuellement le rouleau du milieu
                        }}
                      >
                        <div
                          ref={(el) => { reelStripRefs.current[reelIdx] = el; }}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            transform: `translateY(${currentOffset}px)`,
                            transition: shouldAnimate ? 'none' : 'transform 260ms cubic-bezier(0.25, 0.9, 0.3, 1)',
                            willChange: shouldAnimate ? 'transform' : undefined
                          }}
                        >
                          {strip.map((s, i) => {
                            const isStripImg = typeof s === 'string' && (s.startsWith('data:') || s.startsWith('http'));
                            return (
                              <div
                                key={i}
                                style={{
                                  height: `${size}px`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '32px',
                                  fontWeight: 'bold',
                                  color: reelTextColor,
                                  transform: isReverse ? 'scaleY(-1)' : 'none' // Remettre les symboles à l'endroit
                                }}
                              >
                                {isStripImg ? (
                                  <img src={s as string} alt="" style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />
                                ) : (
                                  <span>{s}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Templates SVG existants
          <div 
            className="slot-machine-container"
            style={{
              position: 'absolute',
              top: '65%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
          {/* Rouleaux */}
          <div 
            className="slot-reels"
            style={{
              display: 'flex',
              gap: (currentTemplate === 'jackpot-4') ? '20%' : '8px'
            }}
          >
            {reels.map((symbol, reelIdx) => {
              const size = (currentTemplate === 'jackpot-4') ? 80 : 70;
              const isReverse = false; // Tous les rouleaux tournent dans le même sens
              // Strip TRÈS LONGUE pour animation continue sans boucle
              const strip = Array(150).fill(null).flatMap(() => symbols);
              const showBorders = !(currentTemplate === 'jackpot-2' || currentTemplate === 'jackpot-3' || currentTemplate === 'jackpot-4');
              const targetOffset = targetOffsetsRef.current[reelIdx] ?? -(Math.max(symbols.indexOf(reels[reelIdx]), 0) * size);
              const shouldAnimate = isSpinning;
              // L'offset est maintenant géré directement par le DOM via refs
              const currentOffset = targetOffset;
              
              return (
                <div
                  key={reelIdx}
                  className={`slot-reel`}
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    background: showBorders ? reelBackgroundColor : 'transparent',
                    border: showBorders ? `2px solid ${reelBorderColor}` : 'none',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    position: 'relative',
                    transform: isReverse ? 'scaleY(-1)' : 'none' // Inverser visuellement le rouleau du milieu
                  }}
                >
                  <div
                    ref={(el) => { reelStripRefs.current[reelIdx] = el; }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      transform: `translateY(${currentOffset}px)`,
                      transition: shouldAnimate ? 'none' : 'transform 260ms cubic-bezier(0.25, 0.9, 0.3, 1)',
                      willChange: shouldAnimate ? 'transform' : undefined
                    }}
                  >
                    {strip.map((s, i) => {
                      const isStripImg = typeof s === 'string' && (s.startsWith('data:') || s.startsWith('http'));
                      return (
                        <div
                          key={i}
                          style={{
                            height: `${size}px`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            fontWeight: 'bold',
                            color: reelTextColor,
                            transform: isReverse ? 'scaleY(-1)' : 'none' // Remettre les symboles à l'endroit
                          }}
                        >
                          {isStripImg ? (
                            <img src={s as string} alt="" style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />
                          ) : (
                            <span>{s}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}
      </div>

      {/* Bouton SPIN - En dehors du template */}
      <button
        type="button"
        onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); if (!isSpinning && !disabled && !hasPlayed) { spin(); } }}
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!jackpotSession.hasSpun) { spin(); } }}
        disabled={isSpinning || disabled || hasPlayed}
        className="slot-spin-button"
        style={{
          position: 'relative',
          zIndex: 1000,
          background: (isSpinning || hasPlayed)
            ? (btnBg ? btnBg : 'linear-gradient(145deg, #999, #666)')
            : (btnBg ? btnBg : 'linear-gradient(145deg, #ffd700, #ffed4e)'),
          border: `3px solid ${btnBorder ?? '#b8860b'}`,
          borderRadius: '15px',
          padding: '12px 30px',
          fontSize: '18px',
          fontWeight: 'bold',
          color: (isSpinning || hasPlayed) ? (btnTextColor ? btnTextColor : '#ccc') : (btnTextColor ?? '#8b4513'),
          cursor: (isSpinning || hasPlayed) ? 'not-allowed' : 'pointer',
          boxShadow: (isSpinning || hasPlayed) 
            ? 'inset 0 4px 8px rgba(0,0,0,0.3)' 
            : '0 6px 20px rgba(255, 215, 0, 0.4), inset 0 2px 5px rgba(255,255,255,0.3)',
          transition: 'all 0.2s ease',
          minWidth: '120px',
          transform: isSpinning ? 'scale(0.95)' : 'scale(1)'
        }}
      >
        {isSpinning ? 'SPINNING...' : (hasPlayed ? (btnTextCfg || 'SPIN') : (btnTextCfg || 'SPIN'))}
      </button>
    </div>
  );
};

export default React.memo(SlotMachine, (prev, next) => {
  // Avoid re-render if only symbols array reference changed but content is same
  const arrEq = (a?: string[], b?: string[]) => {
    if (a === b) return true;
    if (!Array.isArray(a) || !Array.isArray(b)) return a === (b as any);
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  };
  return prev.disabled === next.disabled
    && prev.templateOverride === next.templateOverride
    && arrEq(prev.symbols, next.symbols)
    && prev.onWin === next.onWin
    && prev.onLose === next.onLose;
});
