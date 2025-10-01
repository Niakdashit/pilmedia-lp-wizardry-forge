import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import FormHandler from './components/FormHandler';
import { useParticipations } from '../../hooks/useParticipations';
import { FieldConfig } from '../forms/DynamicContactForm';
import TemplatedQuiz from '../shared/TemplatedQuiz';

interface FunnelQuizParticipateProps {
  campaign: any;
  previewMode: 'mobile' | 'tablet' | 'desktop';
}

// Flow: Participate button -> Quiz -> Form -> Thank you (+optional score) -> Replay
const FunnelQuizParticipate: React.FC<FunnelQuizParticipateProps> = ({ campaign, previewMode }) => {
  const [phase, setPhase] = useState<'participate' | 'quiz' | 'form' | 'thankyou'>('participate');
  const [score, setScore] = useState<number>(0);
  
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [participationLoading, setParticipationLoading] = useState<boolean>(false);

  const showScore = !!campaign?.gameConfig?.quiz?.showScore;

  const participateLabel = campaign?.buttonConfig?.text || campaign?.screens?.[0]?.buttonText || 'Participer';
  const participateStyles = useMemo(() => {
    const gradientFallback = 'radial-gradient(circle at 0% 0%, #d4dbe8, #b41b60)';
    const buttonStyles = campaign?.gameConfig?.quiz?.buttonStyles || campaign?.buttonConfig?.styles || {};

    const style: React.CSSProperties = {
      background: buttonStyles.background || gradientFallback,
      color: buttonStyles.color || campaign?.buttonConfig?.textColor || '#ffffff',
      padding: buttonStyles.padding || '14px 28px',
      borderRadius: buttonStyles.borderRadius || campaign?.buttonConfig?.borderRadius || '9999px',
      boxShadow: buttonStyles.boxShadow || '0 12px 30px rgba(132, 27, 96, 0.35)',
      display: buttonStyles.display || 'inline-flex',
      alignItems: buttonStyles.alignItems || 'center',
      justifyContent: buttonStyles.justifyContent || 'center',
      minWidth: buttonStyles.minWidth,
      minHeight: buttonStyles.minHeight,
      width: buttonStyles.width,
      height: buttonStyles.height,
      fontWeight: 600
    };

    return style;
  }, [campaign]);

  const rawReplayButton = campaign?.screens?.[3]?.replayButtonText;
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

  const fields: FieldConfig[] = useMemo(() => (
    (campaign?.formFields && Array.isArray(campaign.formFields)) ? campaign.formFields : [
      { id: 'prenom', label: 'Prénom', type: 'text', required: true },
      { id: 'nom', label: 'Nom', type: 'text', required: true },
      { id: 'email', label: 'Email', type: 'email', required: true }
    ]
  ), [campaign?.formFields]);

  const backgroundStyle: React.CSSProperties = useMemo(() => ({
    background: campaign.design?.background?.type === 'image'
      ? `url(${campaign.design.background.value}) center/cover no-repeat`
      : campaign.design?.background?.value || '#ffffff'
  }), [campaign?.design?.background]);

  const designTexts = Array.isArray(campaign?.design?.customTexts) ? campaign.design.customTexts : [];
  const designImages = Array.isArray(campaign?.design?.customImages) ? campaign.design.customImages : [];
  const canvasConfig = campaign?.canvasConfig || {};
  const canvasElements = Array.isArray(canvasConfig.elements) ? canvasConfig.elements : [];
  const { participateElements, exitMessageElements } = useMemo(() => {
    const parsePx = (value: any): number | undefined => {
      if (value == null) return undefined;
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      if (typeof value === 'string') {
        const match = value.match(/-?\d*\.?\d+/);
        if (match) {
          const parsed = parseFloat(match[0]);
          if (Number.isFinite(parsed)) return parsed;
        }
      }
      return undefined;
    };

    const mergeStyles = (base: any, extra: any) => {
      if (!extra) return base;
      const merged = { ...(base || {}) };
      for (const key of Object.keys(extra)) {
        const value = extra[key];
        if (value === undefined || value === null || value === '') continue;
        merged[key] = value;
      }
      return merged;
    };

    const toPx = (value: any) => {
      const parsed = parsePx(value);
      return typeof parsed === 'number' ? `${parsed}px` : undefined;
    };

    const baseElements = [
      ...canvasElements,
      ...designTexts.map((text: any) => ({ ...text, type: 'text' })),
      ...designImages.map((image: any) => ({ ...image, type: 'image' }))
    ];
    const toRenderable = (element: any) => {
      const deviceOverrides = (element?.[previewMode] || {}) as Record<string, any>;
      const x = deviceOverrides.x ?? element.x ?? 0;
      const y = deviceOverrides.y ?? element.y ?? 0;

      const widthCandidates = [
        deviceOverrides.width,
        element.width,
        element.customCSS?.width,
        element.customCSS?.minWidth
      ];
      const heightCandidates = [
        deviceOverrides.height,
        element.height,
        element.customCSS?.height,
        element.customCSS?.minHeight
      ];

      const width = widthCandidates.reduce<number | undefined>((acc, candidate) => acc ?? parsePx(candidate), undefined);
      const height = heightCandidates.reduce<number | undefined>((acc, candidate) => acc ?? parsePx(candidate), undefined);

      const baseStyle: React.CSSProperties = {
        position: 'absolute',
        left: toPx(x) || '0px',
        top: toPx(y) || '0px',
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
        transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
        zIndex: element.zIndex || 1,
        pointerEvents: 'none'
      };

      let combinedStyle = mergeStyles(
        mergeStyles(baseStyle, element.style),
        mergeStyles(element.customCSS, (deviceOverrides as any)?.customCSS)
      );

      if (combinedStyle.fontSize == null) {
        const fontSize = parsePx(deviceOverrides.fontSize ?? element.fontSize ?? element.customCSS?.fontSize);
        if (fontSize) combinedStyle.fontSize = `${fontSize}px`;
      }
      if (combinedStyle.color == null && (deviceOverrides.color || element.color)) {
        combinedStyle.color = deviceOverrides.color || element.color;
      }
      if (element.textAlign || deviceOverrides.textAlign || combinedStyle.textAlign) {
        combinedStyle.textAlign = deviceOverrides.textAlign || combinedStyle.textAlign || element.textAlign;
      }

      if (combinedStyle.fontWeight == null) {
        const fontWeight = deviceOverrides.fontWeight ?? element.fontWeight;
        if (fontWeight != null) combinedStyle.fontWeight = fontWeight;
      }

      if (combinedStyle.fontFamily == null) {
        const fontFamily = deviceOverrides.fontFamily ?? element.fontFamily;
        if (fontFamily) combinedStyle.fontFamily = fontFamily;
      }

      if (combinedStyle.fontStyle == null && (deviceOverrides.fontStyle || element.fontStyle)) {
        combinedStyle.fontStyle = deviceOverrides.fontStyle || element.fontStyle;
      }

      if (combinedStyle.textDecoration == null && (deviceOverrides.textDecoration || element.textDecoration)) {
        combinedStyle.textDecoration = deviceOverrides.textDecoration || element.textDecoration;
      }

      if (combinedStyle.letterSpacing == null && (deviceOverrides.letterSpacing || element.letterSpacing)) {
        const spacing = deviceOverrides.letterSpacing ?? element.letterSpacing;
        if (spacing !== undefined) {
          const parsed = parsePx(spacing);
          combinedStyle.letterSpacing = Number.isFinite(parsed) ? `${parsed}px` : spacing;
        }
      }

      if (combinedStyle.textTransform == null && (deviceOverrides.textTransform || element.textTransform)) {
        combinedStyle.textTransform = deviceOverrides.textTransform || element.textTransform;
      }

      combinedStyle = Object.fromEntries(
        Object.entries(combinedStyle).filter(([, value]) => value !== undefined && value !== null)
      );

      if (element.type === 'text') {
        combinedStyle.display = combinedStyle.display || 'flex';
        combinedStyle.alignItems = combinedStyle.alignItems || 'center';
        combinedStyle.justifyContent = combinedStyle.justifyContent || ((combinedStyle.textAlign === 'center')
          ? 'center'
          : combinedStyle.textAlign === 'right'
            ? 'flex-end'
            : 'flex-start');
        if (combinedStyle.lineHeight == null && typeof combinedStyle.fontSize === 'string') {
          combinedStyle.lineHeight = combinedStyle.fontSize;
        }
        if (combinedStyle.color == null && element.customCSS?.color) {
          combinedStyle.color = element.customCSS.color;
        }
      }

      combinedStyle.pointerEvents = 'none';
      combinedStyle.userSelect = 'none';
      combinedStyle.whiteSpace = combinedStyle.whiteSpace || 'pre-wrap';
      combinedStyle.wordBreak = combinedStyle.wordBreak || 'break-word';
      combinedStyle.overflowWrap = combinedStyle.overflowWrap || 'break-word';

      if (typeof combinedStyle.padding === 'string') {
        combinedStyle.padding = combinedStyle.padding
          .split(/\s+/)
          .map((segment: string) => {
            const parsed = parsePx(segment);
            return Number.isFinite(parsed) ? `${parsed}px` : segment;
          })
          .join(' ');
      }

      return {
        ...element,
        x,
        y,
        width,
        height,
        resolvedStyle: combinedStyle
      };
    };

    return baseElements.reduce<{ participateElements: any[]; exitMessageElements: any[] }>((acc, element: any) => {
      const role = typeof element?.role === 'string' ? element.role.toLowerCase() : '';
      if (role.includes('button')) {
        return acc;
      }

      const renderable = toRenderable(element);
      if (!renderable) {
        return acc;
      }

      if (role.includes('exit-message')) {
        acc.exitMessageElements.push(renderable);
      } else {
        acc.participateElements.push(renderable);
      }

      return acc;
    }, { participateElements: [], exitMessageElements: [] });
  }, [canvasElements, designTexts, designImages, previewMode]);

  console.log('🎯 [FunnelQuizParticipate] static elements', {
    participateCount: participateElements.length,
    exitMessageCount: exitMessageElements.length,
    ids: [...participateElements, ...exitMessageElements].map((el: any) => el.id),
    previewMode,
    campaignId: campaign?.id,
    canvasElementsCount: canvasElements.length,
    designTextsCount: designTexts.length,
    designImagesCount: designImages.length
  });

  const handleParticipate = () => {
    setPhase('quiz');
  };

  // Unused answer handler

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
        <div className="absolute inset-0" style={backgroundStyle} />

        {/* Participate phase */}
        {phase === 'participate' && (
          <div className="relative z-10 h-full flex items-center justify-center">
            {participateElements.length > 0 && (
              <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
                {participateElements.map((element: any) => {
                  if (element.type === 'text') {
                    return (
                      <div
                        key={element.id}
                        style={element.resolvedStyle}
                        className="select-text"
                      >
                        {element.content || element.text || 'Texte personnalisé'}
                      </div>
                    );
                  }
                  if (element.type === 'image' && element.src) {
                    return (
                      <img
                        key={element.id}
                        src={element.src}
                        alt={element.alt || ''}
                        style={element.resolvedStyle}
                        className="select-none"
                      />
                    );
                  }
                  return null;
                })}
              </div>
            )}
            <button
              onClick={handleParticipate}
              className="rounded-lg transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-white/70"
              style={participateStyles}
            >
              {participateLabel}
            </button>
          </div>
        )}

        {/* Quiz phase - Afficher le quiz réel */}
        {phase === 'quiz' && (
          <div className="relative z-10 h-full flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              {/* Utiliser le composant TemplatedQuiz pour afficher le quiz */}
              <TemplatedQuiz
                campaign={campaign}
                device={previewMode}
                disabled={false}
                onClick={() => setPhase('form')}
                templateId={campaign?.gameConfig?.quiz?.templateId || 'image-quiz'}
                onAnswerSelected={(isCorrect) => {
                  if (isCorrect) {
                    setScore(prev => prev + 1);
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Form phase - use modal component to keep look consistent */}
        <FormHandler
          showFormModal={showFormModal}
          campaign={campaign}
          fields={fields}
          participationLoading={participationLoading}
          onClose={() => setShowFormModal(false)}
          onSubmit={handleFormSubmit}
        />

        {/* Thank you phase */}
        {phase === 'thankyou' && (
          <div className="relative z-10 h-full">
            {exitMessageElements.length > 0 ? (
              <>
                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
                  {exitMessageElements.map((element: any) => {
                    if (element.type === 'text') {
                      return (
                        <div
                          key={element.id}
                          style={element.resolvedStyle}
                          className="select-text"
                        >
                          {element.content || element.text || 'Merci pour votre participation !'}
                        </div>
                      );
                    }
                    if (element.type === 'image' && element.src) {
                      return (
                        <img
                          key={element.id}
                          src={element.src}
                          alt={element.alt || ''}
                          style={element.resolvedStyle}
                          className="select-none"
                        />
                      );
                    }
                    return null;
                  })}
                </div>
                {(showScore || shouldRenderReplayButton) && (
                  <div className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-3 z-20 px-4">
                    {showScore && (
                      <div className="px-3 py-1 rounded-full bg-white/85 text-gray-900 text-sm font-medium shadow">
                        Score: {score}
                      </div>
                    )}
                    {shouldRenderReplayButton && (
                      <button
                        onClick={handleReplay}
                        className="rounded-lg transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-white/70"
                        style={participateStyles}
                      >
                        {replayButtonLabel}
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center z-10 px-4">
                <div className="bg-white/90 backdrop-blur px-6 py-5 rounded-xl shadow max-w-md w-full text-center">
                  <div className="text-lg font-semibold text-gray-800 mb-2">
                    {campaign?.screens?.[3]?.confirmationTitle || 'Merci pour votre participation !'}
                  </div>
                  <div className="text-sm text-gray-700 mb-3 whitespace-pre-wrap break-words">
                    {campaign?.screens?.[3]?.confirmationMessage || campaign?.screens?.[3]?.description || 'Votre participation a bien été enregistrée.'}
                  </div>
                  {showScore && (
                    <div className="text-sm text-gray-700 mb-3">Score: {score}</div>
                  )}
                  {shouldRenderReplayButton && (
                    <div className="flex justify-center">
                      <button
                        onClick={handleReplay}
                        className="rounded-lg transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-white/70"
                        style={participateStyles}
                      >
                        {replayButtonLabel}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FunnelQuizParticipate;
