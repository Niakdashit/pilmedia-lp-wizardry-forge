// Session in-memory (module-scoped) to survive transient remounts within the same page
const jackpotSession = {
  hasSpun: false,
  spinning: false,
  hardTimerId: null as number | null,
};
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useEditorStore } from '../../stores/editorStore';
import './SlotMachine.css';

interface SlotMachineProps {
  campaign?: any; // Campaign data for configuration
  onWin?: (result: string[]) => void;
  onLose?: () => void;
  onOpenConfig?: () => void;
  disabled?: boolean;
  symbols?: string[]; // Optionnel: permet d'injecter des symboles
  templateOverride?: string; // Optionnel: forcer un template (preview)
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

const SlotMachine: React.FC<SlotMachineProps> = ({ onWin, onLose, onOpenConfig, disabled = false, symbols: propSymbols, templateOverride }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const animReqs = useRef<number[]>([]);
  const reelStartTimes = useRef<number[]>([]);
  const finalsRef = useRef<string[]>([]);
  const finishTimeoutRef = useRef<number | null>(null);
  const resultTimeoutRef = useRef<number | null>(null);
  const finishScheduledRef = useRef(false);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const heartbeatIdRef = useRef<number | null>(null);
  
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
  const campaign = useEditorStore?.((s: any) => s.campaign);
  const campaignId = campaign?.id || 'global';
  const jackpotConfig = (campaign?.gameConfig?.jackpot as any) || {};
  const campaignSymbols = jackpotConfig.symbols as string[] | undefined;
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
    const src = propSymbols ?? campaignSymbols ?? DEFAULT_SYMBOLS;
    const cleaned = (src || []).filter((s) => typeof s === 'string' && s.trim().length > 0);
    return cleaned.length > 0 ? cleaned : DEFAULT_SYMBOLS;
  }, [propSymbols, campaignSymbols]);
  // Initialiser dès le premier render pour éviter tout flash de symboles par défaut
  const initialSetup = useMemo(() => {
    const size = (templateOverride === 'jackpot-4') ? 80 : 70;
    const reels0 = [0, 1, 2].map(() => symbols[Math.floor(Math.random() * symbols.length)]);
    const offsets0 = reels0.map((s) => {
      const idx = symbols.indexOf(s);
      return -(Math.max(idx, 0) * size);
    });
    return { reels0, offsets0 };
  }, [symbols, templateOverride]);
  const [reels, setReels] = useState<string[]>(() => [initialSetup.reels0[0], initialSetup.reels0[1], initialSetup.reels0[2]]);
  const [isStable, setIsStable] = useState(true); // Toujours jouable immédiatement
  const [hasPlayed, setHasPlayed] = useState(false); // Non utilisé pour bloquer désormais
  // Utiliser useRef pour completedReels car setState ne fonctionne pas bien dans requestAnimationFrame
  const completedReelsRef = useRef<boolean[]>([true, true, true]);
  const [completedReels, setCompletedReels] = useState<boolean[]>([true, true, true]);
  // Offsets et cibles initialisés après initialSetup pour éviter toute référence précocement
  const [reelOffsets, setReelOffsets] = useState<number[]>(() => [initialSetup.offsets0[0], initialSetup.offsets0[1], initialSetup.offsets0[2]]);
  const targetOffsetsRef = useRef<number[]>([initialSetup.offsets0[0], initialSetup.offsets0[1], initialSetup.offsets0[2]]);
  
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
    const finals = finalsRef.current;
    finishScheduledRef.current = false;
    console.log('🎯 [SlotMachine] finalizeSpin triggered');
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

    const isWinning = finals.every((symbol) => symbol === finals[0]);
    console.log(`🎲 [SlotMachine] Final result computed: ${isWinning ? 'WIN' : 'LOSE'}`, finals);

    resultTimeoutRef.current = window.setTimeout(() => {
      if (isWinning) {
        console.log('🎉 [SlotMachine] Calling onWin after smooth stop');
        onWin?.(finals);
      } else {
        console.log('😔 [SlotMachine] Calling onLose after smooth stop');
        onLose?.();
      }
      // Pas de reset de spinLockRef: un seul spin autorisé par session de jeu
    }, 650);
  }, [onLose, onWin]);

  const spin = useCallback(() => {
    if (jackpotSession.spinning || jackpotSession.hasSpun) {
      console.log('⏸️ [SlotMachine] SPIN BLOCKED by session:', { session: { ...jackpotSession } });
      return;
    }
    if (isSpinning || disabled || hasPlayed) {
      console.log('⏸️ [SlotMachine] SPIN BLOCKED:', { isSpinning, disabled, hasPlayed });
      return;
    }

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
    const finals = [0, 1, 2].map(() => symbols[Math.floor(Math.random() * symbols.length)]);
    finalsRef.current = finals;

    // Durées identiques pour tous les rouleaux (ralentissement synchronisé = plus de suspense)
    const durations = [5200, 5200, 5200]; // ~5.2s pour tous les rouleaux (ralentissement encore plus long)
    const cellSize = (currentTemplate === 'jackpot-4') ? 80 : 70;
    const stripLength = symbols.length * cellSize;

    // Nettoyage
    animReqs.current.forEach((id) => cancelAnimationFrame(id));
    animReqs.current = [];
    reelStartTimes.current = [0, 0, 0];
    completedReelsRef.current = [false, false, false];
    setCompletedReels([false, false, false]);

    const startOffsets = [...reelOffsets];
    // Nudge immédiat fort pour rendre le mouvement visible dès le 1er clic
    const firstStep = Math.max(8, Math.floor(cellSize / 3));
    setReelOffsets((prev) => prev.map((v, idx) => v - firstStep - idx));
    [0, 1, 2].forEach((reelIndex) => {
      const finalSymbol = finals[reelIndex];
      const finalSymbolIndex = symbols.indexOf(finalSymbol);
      
      // Calculer la distance totale: plusieurs tours complets + position finale
      const fullCycles = 10; // Même nombre de tours pour tous les rouleaux (synchronisé)
      const totalDistance = (fullCycles * stripLength) + (finalSymbolIndex * cellSize);
      // Tous les rouleaux utilisent le même offset (l'inversion visuelle est gérée par scaleY(-1))
      const targetOffset = -(finalSymbolIndex * cellSize);
      targetOffsetsRef.current[reelIndex] = targetOffset;
      const fastCycles = Math.max(1, fullCycles - 1);
      const fastDistance = fastCycles * stripLength;
      const slowDistance = totalDistance - fastDistance;
      const fastPortion = Math.min(0.85, fastDistance / totalDistance);
      const duration = durations[reelIndex];

      const animate = (ts: number) => {
        if (reelStartTimes.current[reelIndex] === 0) {
          reelStartTimes.current[reelIndex] = ts;
        }
        const elapsed = ts - reelStartTimes.current[reelIndex];
        const progress = Math.min(1, elapsed / duration);
        let distanceTravelled: number;

        if (progress < fastPortion) {
          const phaseProgress = progress / fastPortion;
          distanceTravelled = fastDistance * phaseProgress;
        } else {
          const phaseProgress = (progress - fastPortion) / (1 - fastPortion || 1);
          const easedSlow = 1 - Math.pow(1 - phaseProgress, 4); // easeOutQuart
          distanceTravelled = fastDistance + slowDistance * easedSlow;
        }

        // Partir de l'offset courant pour éviter tout saut vers le premier symbole
        let normalizedOffset = (startOffsets[reelIndex] - distanceTravelled) % stripLength;
        if (normalizedOffset > 0) normalizedOffset -= stripLength; // garder offset négatif pour cohérence visuelle

        setReelOffsets((prev) => {
          const next = [...prev];
          next[reelIndex] = normalizedOffset;
          return next;
        });

        if (progress < 1) {
          animReqs.current[reelIndex] = requestAnimationFrame(animate);
        } else {
          // Animation terminée: marquer comme complété et continuer à animer jusqu'à la position finale
          console.log(`🎯 [SlotMachine] Rouleau ${reelIndex} terminé à ${Date.now()}`);
          const snapOffset = targetOffsetsRef.current[reelIndex] ?? -(finalSymbolIndex * cellSize);
          setReelOffsets((prev) => {
            const next = [...prev];
            next[reelIndex] = snapOffset;
            return next;
          });
          
          // Utiliser updateCompletedReel pour mise à jour synchrone
          updateCompletedReel(reelIndex, true);
          console.log(`✅ [SlotMachine] completedReels mis à jour:`, completedReelsRef.current);
          
          // Mettre à jour le symbole final
          setReels((prev) => {
            const next = [...prev];
            next[reelIndex] = finalSymbol;
            console.log(`🎰 [SlotMachine] reels[${reelIndex}] = ${finalSymbol}`);
            return next;
          });
          
          if (completedReelsRef.current.every(Boolean) && !finishScheduledRef.current) {
            finishScheduledRef.current = true;
            finishTimeoutRef.current = window.setTimeout(() => {
              finalizeSpin();
            }, 300);
          }
        }
      };
      
      animReqs.current[reelIndex] = requestAnimationFrame(animate);
    });
  }, [isSpinning, disabled, isStable, hasPlayed, symbols, currentTemplate, finalizeSpin, clearFinishTimers]);

  const isCustomTemplate = currentTemplate === 'custom-frame';
  const isUserTemplate = currentTemplate === 'user-template' && !!customTemplateUrl;

  // Log pour déboguer le rendu avec stack trace pour voir qui cause le re-render
  console.log('🎨 [SlotMachine] RENDER:', {
    isSpinning,
    completedReels: completedReels,
    completedReelsValues: `[${completedReels[0]}, ${completedReels[1]}, ${completedReels[2]}]`,
    reels: reels.map(r => typeof r === 'string' ? r.substring(0, 10) : r),
    disabled,
    templateOverride,
    symbolsCount: symbols?.length
  });
  
  // Si on passe de spinning à non-spinning pendant l'animation, c'est un problème
  if (!isSpinning && completedReels.some(c => !c)) {
    console.error('❌ [SlotMachine] BUG DÉTECTÉ: isSpinning=false mais rouleaux pas tous terminés!', {
      completedReels,
      stackTrace: new Error().stack
    });
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
    console.log('🟢 [SlotMachine] Component MOUNTED');
    return () => {
      console.log('🔴 [SlotMachine] Component UNMOUNTING - cleaning up animations');
      animReqs.current.forEach((id) => cancelAnimationFrame(id));
      animReqs.current = [];
      clearFinishTimers();
      if (heartbeatIdRef.current) {
        clearInterval(heartbeatIdRef.current as any);
        heartbeatIdRef.current = null;
      }
    };
  }, [clearFinishTimers]);

  // If remount happened mid-spin (fullscreen editor), resume and smoothly finish to targets
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

    // Mark spinning visually
    setIsSpinning(true);

    const total = 2400; // smooth finish duration (even smoother)
    const start = performance.now();

    const step = () => {
      const now = performance.now();
      const t = Math.min(1, (now - start) / total);
      const ease = (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)); // easeOutExpo for ultra-smooth end
      setReelOffsets((prev) => prev.map((v, idx) => v + (targets[idx] - v) * ease) as any);
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
                    const isReverse = reelIdx === 1; // Rouleau du milieu en sens inverse
                    // Strip répétée pour défilement fluide
                    const strip = Array(80).fill(null).flatMap(() => symbols);
                    const targetOffset = targetOffsetsRef.current[reelIdx] ?? -(Math.max(symbols.indexOf(reels[reelIdx]), 0) * size);
                    const shouldAnimate = isSpinning || jackpotSession.spinning;
                    const currentOffset = shouldAnimate ? reelOffsets[reelIdx] : targetOffset;

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
              const isReverse = reelIdx === 1; // Rouleau du milieu en sens inverse
              const strip = Array(80).fill(null).flatMap(() => symbols);
              const showBorders = !(currentTemplate === 'jackpot-2' || currentTemplate === 'jackpot-3' || currentTemplate === 'jackpot-4');
              const targetOffset = targetOffsetsRef.current[reelIdx] ?? -(Math.max(symbols.indexOf(reels[reelIdx]), 0) * size);
              const shouldAnimate = isSpinning;
              const currentOffset = shouldAnimate ? reelOffsets[reelIdx] : targetOffset;
              
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

export default SlotMachine;
