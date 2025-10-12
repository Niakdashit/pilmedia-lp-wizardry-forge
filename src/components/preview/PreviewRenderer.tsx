'use client';

import React, { useState, useEffect, useMemo } from 'react';
import StandardizedWheel from '../shared/StandardizedWheel';
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

interface PreviewRendererProps {
  campaign: any;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  wheelModalConfig?: any;
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
  wheelModalConfig
}) => {
  const [currentScreen, setCurrentScreen] = useState<DesignScreenId>('screen1');
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [hasSubmittedForm, setHasSubmittedForm] = useState(false);
  
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

  // Écouter les mises à jour depuis l'éditeur
  useEffect(() => {
    const handleUpdate = (e?: Event) => {
      console.log('🔔 [PreviewRenderer] Received sync event:', (e as CustomEvent)?.type, (e as CustomEvent)?.detail);
      setForceUpdate(prev => prev + 1);
    };
    
    window.addEventListener('editor-background-sync', handleUpdate);
    window.addEventListener('editor-modules-sync', handleUpdate);
    window.addEventListener('editor-module-sync', handleUpdate);
    window.addEventListener('editor-force-sync', handleUpdate);
    
    return () => {
      window.removeEventListener('editor-background-sync', handleUpdate);
      window.removeEventListener('editor-modules-sync', handleUpdate);
      window.removeEventListener('editor-module-sync', handleUpdate);
      window.removeEventListener('editor-force-sync', handleUpdate);
    };
  }, []);

  // Obtenir les données canoniques
  const canonicalData = getCanonicalPreviewData();
  const modularPage = campaign?.design?.designModules || canonicalData.modularPage;
  const allModules1 = modularPage.screens.screen1 || [];
  const allModules2 = modularPage.screens.screen2 || [];
  const allModules3 = modularPage.screens.screen3 || [];
  
  // Séparer les modules Logo et Footer des autres modules
  // Les logos doivent être collés en haut sans padding
  // Les footers doivent être collés en bas sans padding
  const logoModules1 = allModules1.filter((m: any) => m?.type === 'BlocLogo');
  const footerModules1 = allModules1.filter((m: any) => m?.type === 'BlocPiedDePage');
  const modules1 = allModules1.filter((m: any) => m?.type !== 'BlocLogo' && m?.type !== 'BlocPiedDePage');
  
  const logoModules2 = allModules2.filter((m: any) => m?.type === 'BlocLogo');
  const footerModules2 = allModules2.filter((m: any) => m?.type === 'BlocPiedDePage');
  const modules2 = allModules2.filter((m: any) => m?.type !== 'BlocLogo' && m?.type !== 'BlocPiedDePage');
  
  const logoModules3 = allModules3.filter((m: any) => m?.type === 'BlocLogo');
  const footerModules3 = allModules3.filter((m: any) => m?.type === 'BlocPiedDePage');
  const modules3 = allModules3.filter((m: any) => m?.type !== 'BlocLogo' && m?.type !== 'BlocPiedDePage');

  // Background style - Utiliser directement campaign.design.background pour avoir les dernières données
  const backgroundStyle: React.CSSProperties = useMemo(() => {
    console.log('🎨 [PreviewRenderer] Raw data:', {
      'campaign.canvasConfig.background': campaign?.canvasConfig?.background,
      'campaign.canvasConfig.background.type': campaign?.canvasConfig?.background?.type,
      'campaign.canvasConfig.background.value': campaign?.canvasConfig?.background?.value?.substring(0, 100),
      'campaign.design.background': campaign?.design?.background,
      'campaign.design.backgroundImage': campaign?.design?.backgroundImage,
      'canonicalData.background': canonicalData.background,
      'forceUpdate': forceUpdate
    });
    
    // Top priorité (preview local): image de fond par écran stockée en session (localStorage)
    // Clés gérées par DesignCanvas lors des uploads: `quiz-bg-<device>-<screenId>`
    let perScreenImage: string | null = null;
    try {
      const deviceKey = previewMode === 'mobile' ? 'mobile' : (previewMode === 'tablet' ? 'tablet' : 'desktop');
      const lsKey = `quiz-bg-${deviceKey}-${currentScreen}`;
      perScreenImage = typeof window !== 'undefined' ? (localStorage.getItem(lsKey) || null) : null;
    } catch {}

    // Priorité 1bis: si une image par écran existe pour l'appareil courant, l'utiliser
    if (perScreenImage) {
      return { background: `url(${perScreenImage}) center/cover no-repeat` };
    }

    // Priorité 2: campaign.canvasConfig.background (preview-only, le plus à jour)
    let bg = campaign?.canvasConfig?.background;
    
    // Priorité 3: campaign.design.background (global)
    if (!bg || (!bg.value && !bg.type)) {
      bg = campaign?.design?.background;
    }
    
    // Priorité 4: canonicalData.background (fallback)
    if (!bg || (!bg.value && !bg.type)) {
      bg = canonicalData.background;
    }
    
    // Priorité 5: backgroundImage si défini
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
    return { background: bg?.value || 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)' };
  }, [
    // Dépendre aussi de l'écran courant et du mode pour rafraîchir la lecture localStorage
    currentScreen,
    previewMode,
    campaign?.canvasConfig?.background?.type,
    campaign?.canvasConfig?.background?.value,
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

  // Safe zone padding
  const safeZonePadding = previewMode === 'mobile' ? 28 : previewMode === 'tablet' ? 40 : 56;

  // Handlers
  const handleParticipate = () => {
    console.log('🎮 Participate clicked - Moving to screen2');
    setCurrentScreen('screen2');
  };

  const handleGameFinish = (result: 'win' | 'lose') => {
    console.log('🎯 Game finished with result:', result);
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
    setShowContactForm(false);
    setHasSubmittedForm(true);
    // After form submission, go to result screen
    console.log('➡️ [PreviewRenderer] Form submitted, moving to screen3');
    setCurrentScreen('screen3');
  };

  const contactFields: FieldConfig[] = useMemo(() => {
    const fields = campaign?.contactFields || [];
    if (fields.length === 0) {
      return [
        { id: 'firstName', label: 'Prénom', type: 'text', required: true },
        { id: 'lastName', label: 'Nom', type: 'text', required: true },
        { id: 'email', label: 'Email', type: 'email', required: true },
        { id: 'phone', label: 'Téléphone', type: 'tel', required: false }
      ];
    }
    return fields;
  }, [campaign?.contactFields]);

  // Déterminer quel renderer utiliser selon le type de campagne
  const isDesignModular = Boolean(
    campaign?.design?.designModules &&
    Object.values(campaign.design.designModules.screens || {}).some(
      (screenModules: any) => Array.isArray(screenModules) && screenModules.length > 0
    )
  );

  const ModuleRenderer = isDesignModular ? DesignModuleRenderer : QuizModuleRenderer;

  return (
    <div className="w-full h-[100dvh] min-h-[100dvh]">
      <div className="relative w-full h-full">
        {/* Background */}
        <div className="absolute inset-0 z-0" style={backgroundStyle} />

        {/* Content avec safe zone */}
        <div className="relative z-30 h-full w-full overflow-y-auto">
          {/* SCREEN 1: Page d'accueil */}
          {currentScreen === 'screen1' && (
            <div className="flex flex-col min-h-full">
              {/* Modules Logo (collés en haut sans padding) */}
              {logoModules1.length > 0 && (
                <div className="w-full">
                  <ModuleRenderer
                    modules={logoModules1 as any}
                    previewMode
                    device={previewMode}
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

                {modules1.length > 0 ? (
                  <section 
                    className="space-y-6" 
                    data-screen="screen1"
                    style={{ padding: safeZonePadding, boxSizing: 'border-box' }}
                  >
                    <ModuleRenderer
                      modules={modules1 as any}
                      previewMode
                      device={previewMode}
                      onButtonClick={handleParticipate}
                    />
                  </section>
                ) : (
                  /* Si pas de modules sur screen1, afficher un bouton "Participer" par défaut */
                  <div 
                    className="flex items-center justify-center h-full"
                    style={{ padding: safeZonePadding, boxSizing: 'border-box' }}
                  >
                    <button
                      onClick={handleParticipate}
                      className="inline-flex items-center px-8 py-4 text-lg rounded-xl bg-gradient-to-br from-[#841b60] to-[#b41b60] backdrop-blur-sm text-white font-semibold border border-white/20 shadow-lg shadow-[#841b60]/20 hover:from-[#841b60] hover:to-[#6d164f] hover:shadow-xl hover:shadow-[#841b60]/30 transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                      Participer
                    </button>
                  </div>
                )}
              </div>
              
              {/* Modules Footer (collés en bas sans padding) */}
              {footerModules1.length > 0 && (
                <div className="w-full">
                  <ModuleRenderer
                    modules={footerModules1 as any}
                    previewMode
                    device={previewMode}
                  />
                </div>
              )}
            </div>
          )}

          {/* SCREEN 2: Jeu */}
          {currentScreen === 'screen2' && (
            <div className="flex flex-col min-h-full">
              {/* Modules Logo (collés en haut sans padding) */}
              {logoModules2.length > 0 && (
                <div className="w-full">
                  <ModuleRenderer
                    modules={logoModules2 as any}
                    previewMode
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

                {/* Modules de l'écran 2 */}
                {modules2.length > 0 && (
                  <section 
                    className="space-y-6" 
                    data-screen="screen2"
                    style={{ padding: safeZonePadding, boxSizing: 'border-box' }}
                  >
                    <ModuleRenderer
                      modules={modules2 as any}
                      previewMode
                      device={previewMode}
                    />
                  </section>
                )}

                {/* Jeu (Roue, Scratch, etc.) - Centré */}
                <div 
                  className="flex items-center justify-center"
                  style={{ padding: safeZonePadding, boxSizing: 'border-box', minHeight: '400px' }}
                >
                  {campaign.type === 'wheel' && (
                    <StandardizedWheel
                      campaign={campaign}
                      extractedColors={campaign?.design?.extractedColors || []}
                      wheelModalConfig={wheelModalConfig}
                      device={previewMode}
                      shouldCropWheel={true}
                      disabled={campaign.type === 'wheel' && !hasSubmittedForm}
                      onClick={handleWheelClick}
                      onSpin={() => {
                        if (campaign.type === 'wheel' && !hasSubmittedForm) {
                          console.log('🎡 Wheel clicked but form not submitted yet');
                          return;
                        }
                        console.log('🎡 Wheel spinning...');
                        setTimeout(() => {
                          const isWin = Math.random() > 0.5;
                          handleGameFinish(isWin ? 'win' : 'lose');
                        }, 3000);
                      }}
                    />
                  )}

                  {/* Quiz */}
                  {campaign.type === 'quiz' && (
                    <TemplatedQuiz
                      campaign={campaign}
                      device={previewMode}
                      disabled={false}
                      templateId={campaign?.design?.quizConfig?.templateId || 'image-quiz'}
                      onAnswerSelected={(isCorrect) => {
                        console.log('🎯 Quiz answer selected:', isCorrect ? 'correct' : 'incorrect');
                        setTimeout(() => {
                          handleGameFinish(isCorrect ? 'win' : 'lose');
                        }, 1000);
                      }}
                    />
                  )}
                </div>
              </div>
              
              {/* Modules Footer (collés en bas sans padding) */}
              {footerModules2.length > 0 && (
                <div className="w-full">
                  <ModuleRenderer
                    modules={footerModules2 as any}
                    previewMode
                    device={previewMode}
                  />
                </div>
              )}
            </div>
          )}

          {/* SCREEN 3: Résultat */}
          {currentScreen === 'screen3' && (
            <div className="flex flex-col min-h-full">
              {/* Modules Logo (collés en haut sans padding) */}
              {logoModules3.length > 0 && (
                <div className="w-full">
                  <ModuleRenderer
                    modules={logoModules3 as any}
                    previewMode
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
                    // Utiliser les messages du store en priorité, sinon fallback sur campaign
                    const resultMessages = storeMessages || campaign?.resultMessages || {};
                    const messages = gameResult === 'win' 
                      ? (resultMessages.winner || {
                          title: '🎉 Félicitations !',
                          message: 'Vous avez gagné !',
                          subMessage: 'Un email de confirmation vous a été envoyé',
                          buttonText: 'Fermer',
                          buttonAction: 'close',
                          showPrizeImage: true
                        })
                      : (resultMessages.loser || {
                          title: '😞 Dommage !',
                          message: 'Merci pour votre participation !',
                          subMessage: 'Tentez votre chance une prochaine fois',
                          buttonText: 'Rejouer',
                          buttonAction: 'replay'
                        });

                    const handleButtonClick = () => {
                      if (messages.buttonAction === 'replay') {
                        handleReset();
                      } else if (messages.buttonAction === 'redirect' && messages.redirectUrl) {
                        window.location.href = messages.redirectUrl;
                      } else {
                        // close action - could close modal or navigate away
                        console.log('Close action');
                      }
                    };

                    return (
                      <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full mx-auto">
                        {/* Titre principal */}
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3 text-center">
                          {messages.title}
                        </h2>

                        {/* Message principal */}
                        <p className="text-base text-gray-700 mb-2">
                          {messages.message}
                        </p>

                        {/* Sous-message */}
                        {messages.subMessage && (
                          <p className="text-sm text-gray-600 mb-6">
                            {messages.subMessage}
                          </p>
                        )}

                        {/* Bouton d'action principal */}
                        <button
                          onClick={handleButtonClick}
                          className="w-full font-medium text-base hover:opacity-90 transition-all duration-200"
                          style={globalButtonStyle}
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
                      previewMode
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
                    previewMode
                    device={previewMode}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de formulaire de contact */}
      {showContactForm && (
        <Modal
          onClose={() => {
            setShowContactForm(false);
            // If user closes modal without submitting, go to result screen anyway
            if (!hasSubmittedForm) {
              console.log('⚠️ [PreviewRenderer] Form modal closed without submission, going to result');
              setCurrentScreen('screen3');
            }
          }}
          title={campaign?.screens?.[1]?.title || 'Vos informations'}
        >
          <DynamicContactForm
            fields={contactFields as any}
            submitLabel={campaign?.screens?.[1]?.buttonText || "C'est parti !"}
            onSubmit={handleFormSubmit}
            textStyles={{
              label: { color: '#374151', fontFamily: 'inherit' },
              button: {
                backgroundColor: globalButtonStyle.backgroundColor || '#841b60',
                color: globalButtonStyle.color || '#ffffff',
                borderRadius: globalButtonStyle.borderRadius || '8px',
                fontFamily: 'inherit',
                fontWeight: '600'
              }
            }}
            inputBorderColor={campaign?.design?.customColors?.primary || campaign?.design?.borderColor || '#E5E7EB'}
            inputFocusColor={campaign?.design?.customColors?.primary || campaign?.design?.buttonColor || '#841b60'}
          />
        </Modal>
      )}
    </div>
  );
};

export default PreviewRenderer;
