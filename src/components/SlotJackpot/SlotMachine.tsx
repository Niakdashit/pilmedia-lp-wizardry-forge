import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useEditorStore } from '../../stores/editorStore';
import './SlotMachine.css';

interface SlotMachineProps {
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
  const [reelOffsets, setReelOffsets] = useState<number[]>([0, 0, 0]);
  
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
  const [renderKey, setRenderKey] = useState(0);

  // Forcer la mise à jour lorsqu'un templateOverride est fourni par le mode preview
  React.useEffect(() => {
    if (templateOverride) {
      setCurrentTemplate(templateOverride);
      setRenderKey((prev) => prev + 1);
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
        setRenderKey(prev => prev + 1);
      }
    });
    
    // Vérifier immédiatement au montage
    const initialCheck = () => {
      const storeTemplate = (useEditorStore?.getState()?.campaign?.gameConfig?.jackpot as any)?.template;
      const persistedTemplate = getPersistedTemplate();
      const newTemplate = storeTemplate || persistedTemplate;
      
      if (newTemplate !== currentTemplate) {
        setCurrentTemplate(newTemplate);
        setRenderKey(prev => prev + 1);
      }
    };
    
    initialCheck();
    return unsubscribe;
  }, [currentTemplate, templateOverride]);
  
  // Récupérer les symboles depuis le store
  const campaign = useEditorStore?.((s: any) => s.campaign);
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
  const [reels, setReels] = useState([symbols[0], symbols[0], symbols[0]]);
  // Utiliser useRef pour completedReels car setState ne fonctionne pas bien dans requestAnimationFrame
  const completedReelsRef = useRef<boolean[]>([true, true, true]);
  const [completedReels, setCompletedReels] = useState<boolean[]>([true, true, true]);
  
  // Fonction helper pour mettre à jour completedReels de manière synchrone
  const updateCompletedReel = (index: number, value: boolean) => {
    completedReelsRef.current[index] = value;
    setCompletedReels([...completedReelsRef.current]);
  };

  const spin = useCallback(() => {
    if (isSpinning || disabled) return;

    console.log('🚀 [SlotMachine] SPIN STARTED');
    setIsSpinning(true);

    // Choisir les résultats finaux dès le départ
    const finals = [0, 1, 2].map(() => symbols[Math.floor(Math.random() * symbols.length)]);

    // Durées en cascade pour effet professionnel (plus longues pour voir le ralentissement)
    const durations = [3000, 4000, 5000]; // 3s, 4s, 5s pour un ralentissement bien visible
    const cellSize = (currentTemplate === 'jackpot-4') ? 80 : 70;

    // Easing personnalisé pour slot machine avec décélération TRÈS forte
    const slotEasing = (t: number) => {
      // Phase 1 (0-0.5): Vitesse constante rapide
      if (t < 0.5) {
        return t;
      }
      // Phase 2 (0.5-1.0): Décélération exponentielle TRÈS forte
      const slowPhase = (t - 0.5) / 0.5; // Normaliser 0.5-1.0 vers 0-1
      return 0.5 + 0.5 * (1 - Math.pow(1 - slowPhase, 6)); // Décélération puissance 6
    };

    // Nettoyage
    animReqs.current.forEach((id) => cancelAnimationFrame(id));
    animReqs.current = [];
    reelStartTimes.current = [0, 0, 0];
    setReelOffsets([0, 0, 0]);
    completedReelsRef.current = [false, false, false];
    setCompletedReels([false, false, false]);

    [0, 1, 2].forEach((reelIndex) => {
      const finalSymbol = finals[reelIndex];
      const finalSymbolIndex = symbols.indexOf(finalSymbol);
      
      // Calculer la distance totale: plusieurs tours complets + position finale
      const fullCycles = 8 + reelIndex * 2; // Plus de tours pour les rouleaux suivants
      const totalSymbols = fullCycles * symbols.length + finalSymbolIndex;
      const targetOffset = totalSymbols * cellSize;
      const duration = durations[reelIndex];

      const animate = (ts: number) => {
        if (reelStartTimes.current[reelIndex] === 0) {
          reelStartTimes.current[reelIndex] = ts;
        }
        const elapsed = ts - reelStartTimes.current[reelIndex];
        const progress = Math.min(1, elapsed / duration);
        const eased = slotEasing(progress);
        const currentOffset = -targetOffset * eased;

        setReelOffsets((prev) => {
          const next = [...prev];
          next[reelIndex] = currentOffset;
          return next;
        });

        if (progress < 1) {
          animReqs.current[reelIndex] = requestAnimationFrame(animate);
        } else {
          // Animation terminée: marquer comme complété et continuer à animer jusqu'à la position finale
          console.log(`🎯 [SlotMachine] Rouleau ${reelIndex} terminé à ${Date.now()}`);
          
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
          
          // NE PAS forcer offset à 0 immédiatement, laisser l'animation se terminer naturellement
          // L'offset sera déjà proche de 0 grâce au calcul de targetOffset
        }
      };
      
      animReqs.current[reelIndex] = requestAnimationFrame(animate);
    });

    // Vérifier le résultat après la fin du dernier rouleau (avec marge suffisante)
    setTimeout(() => {
      console.log('🎰 [SlotMachine] Animation complete, setting isSpinning to false');
      setIsSpinning(false);
      const isWinning = finals[0] === finals[1] && finals[1] === finals[2];
      console.log(`🎲 [SlotMachine] Result: ${isWinning ? 'WIN' : 'LOSE'}`, finals);
      if (isWinning) {
        console.log('🎉 [SlotMachine] Calling onWin');
        onWin?.(finals);
      } else {
        console.log('😔 [SlotMachine] Calling onLose');
        onLose?.();
      }
    }, Math.max(...durations) + 800); // Marge de 800ms pour être sûr que tous les rouleaux terminent
  }, [isSpinning, disabled, symbols, currentTemplate, onWin, onLose]);

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
        onClick={() => { onOpenConfig?.(); }}
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
                    // Strip répétée pour défilement fluide
                    const strip = Array(80).fill(null).flatMap(() => symbols);
                    const isImg = typeof symbol === 'string' && (symbol.startsWith('data:') || symbol.startsWith('http'));
                    
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
                          position: 'relative'
                        }}
                      >
                        {!completedReels[reelIdx] ? (
                          <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              display: 'flex',
                              flexDirection: 'column',
                              transform: `translateY(${reelOffsets[reelIdx]}px)`,
                              willChange: 'transform'
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
                                    color: reelTextColor
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
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            fontWeight: 'bold',
                            color: reelTextColor
                          }}>
                            {isImg ? (
                              <img src={symbol as string} alt="" style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />
                            ) : (
                              <span>{symbol}</span>
                            )}
                          </div>
                        )}
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
            onClick={() => { onOpenConfig?.(); }}
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
              const strip = Array(80).fill(null).flatMap(() => symbols);
              const showBorders = !(currentTemplate === 'jackpot-2' || currentTemplate === 'jackpot-3' || currentTemplate === 'jackpot-4');
              const isImg = typeof symbol === 'string' && (symbol.startsWith('data:') || symbol.startsWith('http'));
              
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
                    position: 'relative'
                  }}
                >
                  {isSpinning ? (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        transform: `translateY(${reelOffsets[reelIdx]}px)`,
                        willChange: 'transform'
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
                              color: reelTextColor
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
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: reelTextColor
                    }}>
                      {isImg ? (
                        <img src={symbol as string} alt="" style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />
                      ) : (
                        <span>{symbol}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        )}
      </div>

      {/* Bouton SPIN - En dehors du template */}
      <button
        onClick={spin}
        disabled={isSpinning}
        className="slot-spin-button"
        style={{
          background: isSpinning
            ? (btnBg ? btnBg : 'linear-gradient(145deg, #999, #666)')
            : (btnBg ? btnBg : 'linear-gradient(145deg, #ffd700, #ffed4e)'),
          border: `3px solid ${btnBorder ?? '#b8860b'}`,
          borderRadius: '15px',
          padding: '12px 30px',
          fontSize: '18px',
          fontWeight: 'bold',
          color: isSpinning ? (btnTextColor ? btnTextColor : '#ccc') : (btnTextColor ?? '#8b4513'),
          cursor: isSpinning ? 'not-allowed' : 'pointer',
          boxShadow: isSpinning 
            ? 'inset 0 4px 8px rgba(0,0,0,0.3)' 
            : '0 6px 20px rgba(255, 215, 0, 0.4), inset 0 2px 5px rgba(255,255,255,0.3)',
          transition: 'all 0.2s ease',
          minWidth: '120px',
          transform: isSpinning ? 'scale(0.95)' : 'scale(1)'
        }}
      >
        {isSpinning ? 'SPINNING...' : (btnTextCfg || 'SPIN')}
      </button>
    </div>
  );
};

export default SlotMachine;
