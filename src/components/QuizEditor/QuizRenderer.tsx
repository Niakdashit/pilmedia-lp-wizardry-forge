import React, { useRef, useState, useCallback } from 'react';
import type { Module, BlocTexte, BlocImage, BlocVideo, BlocBouton, BlocCarte } from '@/types/modularEditor';
import type { DeviceType } from '@/utils/deviceDimensions';

interface QuizModuleRendererProps {
  modules: Module[];
  previewMode?: boolean;
  device?: DeviceType;
  onModuleClick?: (moduleId: string) => void;
  selectedModuleId?: string;
  className?: string;
  onButtonClick?: () => void; // Callback pour les boutons en preview
  // Couleur de texte héritée depuis un conteneur parent (ex: Carte)
  inheritedTextColor?: string;
  // Callback pour mettre à jour un module (utilisé en mode édition)
  onModuleUpdate?: (moduleId: string, patch: Partial<Module>) => void;
}

/**
 * QuizModuleRenderer - Composant unifié pour le rendu des modules
 * Utilisé à la fois en mode édition (ModularCanvas) et en mode preview (FunnelQuizParticipate)
 * Garantit un rendu WYSIWYG parfait
 * 
 * Extrait de ModularCanvas.tsx pour centraliser la logique de rendu
 */
export const QuizModuleRenderer: React.FC<QuizModuleRendererProps> = ({
  modules,
  previewMode = false,
  device = 'desktop',
  onModuleClick,
  selectedModuleId,
  className = '',
  onButtonClick,
  inheritedTextColor,
  onModuleUpdate
}) => {
  const isMobileDevice = device === 'mobile';
  const deviceScale = isMobileDevice ? 0.8 : 1;
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const textRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Fonctions de gestion de l'édition de texte
  const handleTextClick = useCallback((moduleId: string) => {
    if (previewMode) return;
    setEditingModuleId(moduleId);
    setTimeout(() => {
      const ref = textRefs.current[moduleId];
      if (ref) {
        ref.focus();
        const range = document.createRange();
        range.selectNodeContents(ref);
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }, 0);
  }, [previewMode]);

  const handleTextBlur = useCallback((moduleId: string) => {
    setEditingModuleId(null);
  }, []);

  const handleTextInput = useCallback((moduleId: string, content: string) => {
    if (onModuleUpdate) {
      onModuleUpdate(moduleId, { body: content });
    }
  }, [onModuleUpdate]);

  const handleTextKeyDown = useCallback((e: React.KeyboardEvent, moduleId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const ref = textRefs.current[moduleId];
      if (ref) {
        ref.blur();
      }
    }
    e.stopPropagation();
  }, []);

  const renderModule = (m: Module) => {
    const commonStyle: React.CSSProperties = {
      background: m.backgroundColor,
      textAlign: m.align || 'left'
    };

    // BlocTexte
    if (m.type === 'BlocTexte') {
      const textModule = m as BlocTexte;
      const baseBodyFontSize = textModule.bodyFontSize;
      const scaledBodyFontSize = baseBodyFontSize ? Math.max(8, Math.round(baseBodyFontSize * deviceScale)) : undefined;
      
      // Séparer les styles de conteneur et de texte
      const customCSS = textModule.customCSS || {};
      const containerStyles: React.CSSProperties = {};
      const textStyles: React.CSSProperties = {};
      
      // Propriétés de conteneur (effet "bouton")
      const containerProps = ['backgroundColor', 'padding', 'borderRadius', 'display', 'border', 'boxShadow'];
      containerProps.forEach(prop => {
        if (customCSS[prop]) {
          (containerStyles as any)[prop] = customCSS[prop];
        }
      });
      
      // Propriétés de texte
      Object.keys(customCSS).forEach(prop => {
        if (!containerProps.includes(prop)) {
          (textStyles as any)[prop] = customCSS[prop];
        }
      });
      
      const bodyStyle: React.CSSProperties = {
        fontSize: scaledBodyFontSize ? `${scaledBodyFontSize}px` : undefined,
        fontWeight: textModule.bodyBold ? '600' as any : undefined,
        fontStyle: textModule.bodyItalic ? 'italic' : undefined,
        textDecoration: textModule.bodyUnderline ? 'underline' : undefined,
        lineHeight: 1.6,
        fontFamily: textModule.bodyFontFamily || 'Open Sans',
        // Utilise la couleur héritée si aucune couleur n'est définie pour le texte
        color: textModule.bodyColor || inheritedTextColor || '#154b66',
        textAlign: (textModule.align || 'left') as any,
        ...textStyles
      };

      const align = textModule.align || 'left';
      const justifyContent = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
      const maxTextWidth = textModule.width ?? 800;
      
      const hasContainerStyles = Object.keys(containerStyles).length > 0;
      const rotationStyle = typeof textModule.rotation === 'number' ? {
        transform: `rotate(${textModule.rotation}deg)`,
        transformOrigin: 'center center',
        display: 'inline-block'
      } : {};
      
      if (!hasContainerStyles && typeof textModule.rotation === 'number') {
        bodyStyle.transform = `rotate(${textModule.rotation}deg)`;
        bodyStyle.transformOrigin = 'center center';
        bodyStyle.display = 'inline-block';
      }

      const content = textModule.body || textModule.text || textModule.label || 'Texte';
      const isEditing = editingModuleId === m.id && !previewMode;

      return (
        <div 
          key={m.id} 
          style={{ 
            ...commonStyle, 
            paddingTop: (textModule as any).spacingTop ?? 0, 
            paddingBottom: (textModule as any).spacingBottom ?? 0 
          }}
          onClick={() => !previewMode && onModuleClick?.(m.id)}
        >
          <div style={{ display: 'flex', justifyContent, width: '100%' }}>
            <div style={{ width: '100%', maxWidth: maxTextWidth }}>
              {hasContainerStyles ? (
                <div style={{ display: 'inline-block', ...containerStyles, ...rotationStyle }}>
                  {isEditing ? (
                    <div
                      ref={(el) => { textRefs.current[m.id] = el; }}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={(e) => handleTextInput(m.id, e.currentTarget.textContent || '')}
                      onBlur={() => handleTextBlur(m.id)}
                      onKeyDown={(e) => handleTextKeyDown(e, m.id)}
                      className="outline-none bg-transparent border-none whitespace-pre-wrap break-words select-text cursor-text"
                      style={{
                        ...bodyStyle,
                        boxSizing: 'border-box',
                        display: 'inline-block',
                        touchAction: 'auto',
                        userSelect: 'text'
                      }}
                      onPointerDown={(ev) => { ev.stopPropagation(); }}
                      onPointerMove={(ev) => { ev.stopPropagation(); }}
                      onMouseDown={(ev) => { ev.stopPropagation(); }}
                      onMouseMove={(ev) => { ev.stopPropagation(); }}
                      onTouchStart={(ev) => { ev.stopPropagation(); }}
                      onTouchMove={(ev) => { ev.stopPropagation(); }}
                      draggable={false}
                      data-element-type="text"
                    >
                      {content}
                    </div>
                  ) : (
                    <div 
                      style={bodyStyle}
                      onClick={() => handleTextClick(m.id)}
                      className={!previewMode ? 'cursor-text' : ''}
                    >
                      {content}
                    </div>
                  )}
                </div>
              ) : (
                isEditing ? (
                  <div
                    ref={(el) => { textRefs.current[m.id] = el; }}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => handleTextInput(m.id, e.currentTarget.textContent || '')}
                    onBlur={() => handleTextBlur(m.id)}
                    onKeyDown={(e) => handleTextKeyDown(e, m.id)}
                    className="outline-none bg-transparent border-none whitespace-pre-wrap break-words select-text cursor-text"
                    style={{
                      ...bodyStyle,
                      boxSizing: 'border-box',
                      display: 'inline-block',
                      touchAction: 'auto',
                      userSelect: 'text'
                    }}
                    onPointerDown={(ev) => { ev.stopPropagation(); }}
                    onPointerMove={(ev) => { ev.stopPropagation(); }}
                    onMouseDown={(ev) => { ev.stopPropagation(); }}
                    onMouseMove={(ev) => { ev.stopPropagation(); }}
                    onTouchStart={(ev) => { ev.stopPropagation(); }}
                    onTouchMove={(ev) => { ev.stopPropagation(); }}
                    draggable={false}
                    data-element-type="text"
                  >
                    {content}
                  </div>
                ) : (
                  <div 
                    style={bodyStyle}
                    onClick={() => handleTextClick(m.id)}
                    className={!previewMode ? 'cursor-text' : ''}
                  >
                    {content}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      );
    }

    // BlocImage
    if (m.type === 'BlocImage') {
      const imageModule = m as BlocImage;
      const align = imageModule.align || 'center';
      const justifyContent = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
      const maxContentWidth = ((imageModule.width ?? 480) * deviceScale);
      const fit = imageModule.objectFit || 'cover';
      const baseHeight = typeof imageModule.minHeight === 'number'
        ? Math.max(50, Math.round(imageModule.minHeight * deviceScale))
        : Math.max(200, Math.round((maxContentWidth || 520) * 0.6));
      const vhCap = (typeof window !== 'undefined' && window.innerHeight) ? Math.max(240, Math.round(window.innerHeight * 0.6)) : 600;
      const containerHeight = fit === 'cover' ? Math.min(baseHeight, vhCap) : undefined;
      const borderRadius = imageModule.borderRadius ?? 0;
      const imageSource = (imageModule.url && imageModule.url.trim().length > 0)
        ? imageModule.url
        : '/assets/templates/placeholder.png';

      return (
        <div 
          key={m.id} 
          style={{ ...commonStyle }}
          onClick={() => !previewMode && onModuleClick?.(m.id)}
        >
          <div style={{ display: 'flex', justifyContent, width: '100%' }}>
            <div
              style={{
                width: '100%',
                maxWidth: maxContentWidth,
                borderRadius,
                overflow: 'hidden',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: containerHeight,
                paddingTop: (imageModule as any).spacingTop ?? 0,
                paddingBottom: (imageModule as any).spacingBottom ?? 0
              }}
            >
              <img
                src={imageSource}
                alt={imageModule.alt || ''}
                style={{
                  width: '100%',
                  height: fit === 'cover' ? '100%' : 'auto',
                  objectFit: fit,
                  display: 'block'
                }}
              />
            </div>
          </div>
        </div>
      );
    }

    // BlocVideo
    if (m.type === 'BlocVideo') {
      const videoModule = m as BlocVideo;
      const align = videoModule.align || 'center';
      const justifyContent = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
      const borderRadius = videoModule.borderRadius ?? 0;

      return (
        <div 
          key={m.id} 
          style={{ ...commonStyle }}
          onClick={() => !previewMode && onModuleClick?.(m.id)}
        >
          <div style={{ display: 'flex', justifyContent, width: '100%' }}>
            <div
              style={{
                width: '100%',
                maxWidth: (((videoModule as any).width ?? 560) * deviceScale),
                borderRadius,
                overflow: 'hidden',
                background: 'transparent',
                display: 'block',
                paddingTop: (videoModule as any).spacingTop ?? 0,
                paddingBottom: (videoModule as any).spacingBottom ?? 0
              }}
            >
              <div className="relative" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={(videoModule as any).src || videoModule.videoUrl}
                  title={(videoModule as any).title || 'Video'}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // BlocBouton
    // Important: en mode preview, le CTA principal est géré par FunnelQuizParticipate.
    // On ne rend donc PAS les BlocBouton en preview pour éviter le doublon, SAUF s'il est dans une carte.
    if (m.type === 'BlocBouton') {
      // Si en preview et qu'il y a un callback, c'est un bouton dans une carte, on le rend
      if (previewMode && !onButtonClick) return null;
      const buttonModule = m as BlocBouton;
      
      return (
        <div 
          key={m.id} 
          style={{ ...commonStyle, textAlign: 'center' }}
          onClick={() => !previewMode && onModuleClick?.(m.id)}
        >
          <a
            href={buttonModule.href || '#'}
            onClick={(e) => {
              e.preventDefault();
              if (previewMode && onButtonClick) {
                onButtonClick();
              }
            }}
            className={`inline-flex items-center justify-center px-6 py-3 text-sm transition-transform hover:-translate-y-[1px] ${((buttonModule as any).uppercase) ? 'uppercase' : ''} ${((buttonModule as any).bold) ? 'font-bold' : 'font-semibold'}`}
            style={{
              background: buttonModule.background || '#000000',
              color: buttonModule.textColor || '#ffffff',
              borderRadius: `${buttonModule.borderRadius ?? 9999}px`,
              border: `${(buttonModule as any).borderWidth ?? 0}px solid ${(buttonModule as any).borderColor || '#000000'}`,
              width: 'min(280px, 100%)',
              display: 'inline-flex',
              marginTop: (buttonModule as any).spacingTop ?? 0,
              marginBottom: (buttonModule as any).spacingBottom ?? 0,
              boxShadow: (buttonModule as any).boxShadow || '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            {buttonModule.label || 'Participer'}
          </a>
        </div>
      );
    }

    // BlocCarte - Conteneur pour regrouper d'autres modules
    if (m.type === 'BlocCarte') {
      const carteModule = m as BlocCarte;
      const align = carteModule.align || 'center';
      const justifyContent = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
      const maxWidth = carteModule.maxWidth || 600;

      const cardStyle: React.CSSProperties = {
        backgroundColor: carteModule.cardBackground || '#ffffff',
        borderRadius: `${carteModule.cardRadius ?? 12}px`,
        border: carteModule.cardBorderWidth 
          ? `${carteModule.cardBorderWidth}px solid ${carteModule.cardBorderColor || '#e5e7eb'}`
          : '1px solid #e5e7eb',
        padding: `${carteModule.padding ?? 24}px`,
        boxShadow: carteModule.boxShadow || '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: maxWidth
      };

      return (
        <div 
          key={m.id} 
          style={{ 
            ...commonStyle,
            paddingTop: (carteModule as any).spacingTop ?? 0,
            paddingBottom: (carteModule as any).spacingBottom ?? 0
          }}
          onClick={() => !previewMode && onModuleClick?.(m.id)}
        >
          <div style={{ display: 'flex', justifyContent, width: '100%' }}>
            <div className="quiz-card" style={{
              ...cardStyle,
              // Appliquer la couleur au conteneur pour héritage
              color: carteModule.textColor || undefined,
              '--card-title-color': carteModule.textColor || '#1f2937',
              '--card-description-color': carteModule.textColor || '#6b7280'
            } as React.CSSProperties}>
              {/* Titre de la carte */}
              {carteModule.title && (
                <h3
                  className="card-title"
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    color: carteModule.textColor || '#1f2937',
                    fontFamily: 'inherit'
                  }}
                >
                  {carteModule.title}
                </h3>
              )}

              {/* Description de la carte */}
              {carteModule.description && (
                <p
                  className="card-description"
                  style={{
                    fontSize: '14px',
                    marginBottom: '16px',
                    color: carteModule.textColor || '#6b7280',
                    fontFamily: 'inherit'
                  }}
                >
                  {carteModule.description}
                </p>
              )}
              
              {/* Rendu récursif des modules enfants */}
              <div className="flex flex-col gap-4">
                {(carteModule.children || []).map((child) => {
                  // Créer un callback de sélection pour chaque enfant
                  const handleChildModuleClick = () => {
                    if (onModuleClick && !previewMode) {
                      onModuleClick(child.id);
                    }
                  };

                  // Créer un callback de mise à jour pour chaque enfant
                  const handleChildModuleUpdate = (childId: string, patch: Partial<Module>) => {
                    if (onModuleUpdate && !previewMode) {
                      // Mettre à jour l'enfant dans la carte
                      const updatedChildren = (carteModule.children || []).map((c: Module) =>
                        c.id === childId ? { ...c, ...patch } : c
                      );
                      onModuleUpdate(m.id, { children: updatedChildren });
                    }
                  };

                  return (
                    <div key={child.id} className="relative card-child-module" style={{
                      pointerEvents: 'auto',
                      userSelect: 'text'
                    }}>
                      <QuizModuleRenderer
                        modules={[child]}
                        previewMode={previewMode}
                        device={device}
                        onModuleClick={handleChildModuleClick}
                        selectedModuleId={selectedModuleId}
                        onButtonClick={onButtonClick}
                        onModuleUpdate={handleChildModuleUpdate}
                        // Propager la couleur de texte de la carte vers les modules enfants
                        inheritedTextColor={carteModule.textColor}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-6 w-full ${className}`}>
      <style dangerouslySetInnerHTML={{
        __html: `
          .card-title, .card-description {
            color: inherit !important;
          }
          .card-child-module {
            position: relative;
            z-index: 10;
          }
          .card-child-module * {
            pointer-events: auto !important;
          }

          /* Styles spécifiques pour forcer la couleur du texte de la carte */
          .quiz-card h3.card-title {
            color: var(--card-title-color, #1f2937) !important;
          }
          .quiz-card p.card-description {
            color: var(--card-description-color, #6b7280) !important;
          }
        `
      }} />
      {modules.map(renderModule)}
    </div>
  );
};
