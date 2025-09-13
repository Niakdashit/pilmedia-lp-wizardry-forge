import React, { useState, useCallback, useMemo } from 'react';
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
    'jackpot-6': 'Jackpot 6.svg'
  };
  return templateMap[templateId] || 'jackpot-frame.svg';
};

// Retourne une URL encodée et safe pour CSS url(...) y compris les espaces
const getTemplateUrl = (templateId: string): string => {
  const path = `/assets/slot-frames/${getTemplateFileName(templateId)}`;
  return encodeURI(path);
};

const SlotMachine: React.FC<SlotMachineProps> = ({ onWin, onLose, onOpenConfig, disabled = false, symbols: propSymbols, templateOverride }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  
  // Persistance du template sélectionné via localStorage
  const getPersistedTemplate = () => {
    try {
      return localStorage.getItem('jackpotTemplate') || 'jackpot-frame';
    } catch {
      return 'jackpot-frame';
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
      const storeTemplate = state.campaign?.gameConfig?.jackpot?.template;
      const persistedTemplate = getPersistedTemplate();
      
      // Priorité: store > localStorage > fallback
      const newTemplate = storeTemplate || persistedTemplate;
      
      if (newTemplate !== currentTemplate) {
        console.log('🎰 [SlotMachine] Template changed from', currentTemplate, 'to', newTemplate);
        setCurrentTemplate(newTemplate);
        setRenderKey(prev => prev + 1);
      }
    });
    
    // Vérifier immédiatement au montage
    const initialCheck = () => {
      const storeTemplate = useEditorStore?.getState()?.campaign?.gameConfig?.jackpot?.template;
      const persistedTemplate = getPersistedTemplate();
      const newTemplate = storeTemplate || persistedTemplate;
      
      if (newTemplate !== currentTemplate) {
        console.log('🎰 [SlotMachine] Initial template set to', newTemplate);
        setCurrentTemplate(newTemplate);
        setRenderKey(prev => prev + 1);
      }
    };
    
    initialCheck();
    return unsubscribe;
  }, [currentTemplate, templateOverride]);
  
  // Récupérer les symboles depuis le store
  const campaign = useEditorStore?.((s: any) => s.campaign);
  const campaignSymbols = campaign?.gameConfig?.jackpot?.symbols as string[] | undefined;
  const jackpotStyle = (campaign?.gameConfig?.jackpot?.style as any) || {};
  const customFrameCfg = (campaign?.gameConfig?.jackpot?.customFrame as any) || {};
  const customTemplateUrl = (campaign?.gameConfig?.jackpot?.customTemplateUrl as string) || '';
  const buttonCfg = (campaign?.gameConfig?.jackpot?.button as any) || {};
  const btnTextCfg: string = buttonCfg.text ?? 'SPIN';
  const btnColors = (buttonCfg.colors as any) || {};
  const btnBg = btnColors.background ?? undefined;
  const btnBorder = btnColors.border ?? undefined;
  const btnTextColor = btnColors.text ?? undefined;
  const reelBorderColor = jackpotStyle.borderColor || '#ffd700';
  const reelBackgroundColor = jackpotStyle.backgroundColor || '#ffffff';
  const reelTextColor = jackpotStyle.textColor || '#333333';
  
  const symbols = useMemo(() => propSymbols ?? campaignSymbols ?? DEFAULT_SYMBOLS, [propSymbols, campaignSymbols]);
  const [reels, setReels] = useState([symbols[0], symbols[0], symbols[0]]);

  // Debug pour vérifier le template sélectionné
  console.log('🎰 [SlotMachine] currentTemplate:', currentTemplate);
  console.log('🎰 [SlotMachine] template file:', getTemplateFileName(currentTemplate));
  console.log('🎰 [SlotMachine] renderKey:', renderKey);

  // Force re-render is handled via renderKey; no extra memo needed

  const spin = useCallback(() => {
    if (isSpinning || disabled) return;

    setIsSpinning(true);
    
    // Durées différentes pour chaque rouleau (effet cascade)
    const durations = [1500, 2000, 2500];

    // Animation des rouleaux
    durations.forEach((duration, index) => {
      setTimeout(() => {
        const finalSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        setReels(prev => {
          const newReels = [...prev];
          newReels[index] = finalSymbol;
          return newReels;
        });
      }, duration);
    });

    // Vérifier le résultat après que tous les rouleaux se soient arrêtés
    setTimeout(() => {
      setIsSpinning(false);
      
      // Logique de gain simple
      const finalReels = reels.map(() => symbols[Math.floor(Math.random() * symbols.length)]);
      setReels(finalReels);
      
      const isWinning = finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2];
      
      if (isWinning) {
        onWin?.(finalReels);
      } else {
        onLose?.();
      }
    }, Math.max(...durations) + 100);
  }, [isSpinning, disabled, symbols, reels, onWin, onLose]);

  const isCustomTemplate = currentTemplate === 'custom-frame';
  const isUserTemplate = currentTemplate === 'user-template' && !!customTemplateUrl;

  return (
    <div 
      key={`slot-machine-${currentTemplate}-${renderKey}`}
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
                  {reels.map((symbol, index) => (
                    <div
                      key={index}
                      className={`slot-reel ${isSpinning ? 'slot-spinning' : ''}`}
                      style={{
                        width: '70px',
                        height: '70px',
                        background: reelBackgroundColor,
                        border: `2px solid ${reelBorderColor}`,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        fontWeight: 'bold',
                        color: reelTextColor,
                        animation: isSpinning ? `spin-reel-${index} 1500ms ease-out` : 'none'
                      }}
                    >
                      {symbol}
                    </div>
                  ))}
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
            {reels.map((symbol, index) => (
              <div
                key={index}
                className={`slot-reel ${isSpinning ? 'slot-spinning' : ''}`}
                style={{
                  width: (currentTemplate === 'jackpot-4') ? '80px' : '70px',
                  height: (currentTemplate === 'jackpot-4') ? '80px' : '70px',
                  background: (currentTemplate === 'jackpot-2' || currentTemplate === 'jackpot-3' || currentTemplate === 'jackpot-4') ? 'transparent' : reelBackgroundColor,
                  border: (currentTemplate === 'jackpot-2' || currentTemplate === 'jackpot-3' || currentTemplate === 'jackpot-4') ? 'none' : `2px solid ${reelBorderColor}`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: reelTextColor,
                  animation: isSpinning ? `spin-reel-${index} 1500ms ease-out` : 'none'
                }}
              >
                {symbol}
              </div>
            ))}
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
