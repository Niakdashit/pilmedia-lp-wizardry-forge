// @ts-nocheck
import React, { useRef, useState, useCallback } from 'react';
import type { Module, BlocTexte, BlocImage, BlocVideo, BlocBouton, BlocCarte, BlocLogo, BlocPiedDePage, BlocHtml } from '@/types/modularEditor';
import type { DeviceType } from '@/utils/deviceDimensions';
import { STANDARD_DEVICE_DIMENSIONS, getDeviceScale } from '@/utils/deviceDimensions';
import VideoModule from '@/components/shared/modules/VideoModule';

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
  console.log('🎯 [QuizModuleRenderer] Rendering modules:', {
    count: modules.length,
    previewMode,
    device,
    modules: modules.map(m => ({ id: m.id, type: m.type }))
  });
  
  const isMobileDevice = device === 'mobile';
  
  // Calcul du deviceScale : 65% de la taille desktop pour mobile
  const scale = getDeviceScale('desktop', device);
  const deviceScale = Math.min(scale.x, scale.y);
  
  console.log(`📱 [QuizModuleRenderer] Device: ${device}, Scale: ${deviceScale.toFixed(3)} (${device === 'mobile' ? '65% desktop' : '100%'})`);
  console.log(`📌 [QuizModuleRenderer] Modules seront ${device === 'mobile' ? '65%' : '100%'} de la taille desktop`);
  
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
    // Sauvegarder le contenu final au blur
    const ref = textRefs.current[moduleId];
    if (ref && onModuleUpdate) {
      const content = ref.textContent || '';
      onModuleUpdate(moduleId, { body: content });
    }
  }, [onModuleUpdate]);

  const handleTextInput = useCallback((moduleId: string, e: React.FormEvent<HTMLDivElement>) => {
    // Ne pas mettre à jour pendant l'édition pour éviter de réinitialiser le curseur
    // La mise à jour se fera au blur
    e.stopPropagation();
  }, []);

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

  // Helper pour scaler les valeurs numériques (espacements, padding, etc.)
  const scaleValue = useCallback((value: number | undefined, defaultValue: number = 0): number => {
    if (value === undefined) return defaultValue;
    return Math.round(value * deviceScale);
  }, [deviceScale]);

  const renderModule = (m: Module) => {
    console.log('🔍 [QuizRenderer] renderModule called for:', { id: m.id, type: m.type });
    
    const commonStyle: React.CSSProperties = {
      background: m.backgroundColor,
      textAlign: m.align || 'left'
    };

    // BlocTexte
    if (m.type === 'BlocTexte') {
      const textModule = m as BlocTexte;
      const baseBodyFontSize = textModule.bodyFontSize;
      // En mobile, garder la taille de police normale (conteneur 430px = iPhone 14 Pro Max)
      const fontSizeMultiplier = deviceScale;
      const scaledBodyFontSize = baseBodyFontSize ? Math.max(8, Math.round(baseBodyFontSize * fontSizeMultiplier)) : undefined;
      
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
      const maxTextWidth = 800;
      
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

      const content = textModule.body || textModule.text || 'Texte';
      const isEditing = editingModuleId === m.id && !previewMode;

      return (
        <div 
          key={m.id} 
          style={{ 
            ...commonStyle, 
            paddingTop: scaleValue((textModule as any).spacingTop, 0), 
            paddingBottom: scaleValue((textModule as any).spacingBottom, 0) 
          }}
          onClick={() => !previewMode && onModuleClick?.(m.id)}
        >
          <div style={{ display: 'flex', justifyContent, width: '100%' }}>
            <div style={{ width: '100%', maxWidth: maxTextWidth }}>
              {hasContainerStyles ? (
                <div style={{ display: 'inline-block', ...containerStyles, ...rotationStyle }}>
                  {isEditing ? (
                    <div
                      key={`editing-${m.id}`}
                      ref={(el) => { textRefs.current[m.id] = el; }}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={(e) => handleTextInput(m.id, e)}
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
                    key={`editing-${m.id}`}
                    ref={(el) => { textRefs.current[m.id] = el; }}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => handleTextInput(m.id, e)}
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
        : '/assets/templates/placeholder.svg';

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
                paddingTop: scaleValue((imageModule as any).spacingTop, 0),
                paddingBottom: scaleValue((imageModule as any).spacingBottom, 0)
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
      console.log('🎬 [QuizRenderer] Rendering BlocVideo with VideoModule:', {
        id: m.id,
        previewMode,
        module: videoModule
      });
      return (
        <div key={m.id} style={commonStyle}>
          <VideoModule
            module={videoModule}
            onClick={() => !previewMode && onModuleClick?.(m.id)}
            isSelected={selectedModuleId === m.id}
          />
        </div>
      );
    }

    // BlocHtml - render custom HTML (iframes/embeds) inside a fixed-height container
    if (m.type === 'BlocHtml') {
      const htmlModule = m as BlocHtml;
      const align = htmlModule.align || 'center';
      const justifyContent = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
      const containerHeight = (typeof htmlModule.minHeight === 'number')
        ? Math.max(40, Math.round(htmlModule.minHeight * deviceScale))
        : Math.round(300 * deviceScale);

      return (
        <div
          key={m.id}
          style={{
            ...commonStyle,
            paddingTop: scaleValue((htmlModule as any).spacingTop, 0),
            paddingBottom: scaleValue((htmlModule as any).spacingBottom, 0)
          }}
          onClick={() => !previewMode && onModuleClick?.(m.id)}
        >
          <div style={{ display: 'flex', justifyContent, width: '100%' }}>
            <div style={{ width: '100%', maxWidth: 960, height: containerHeight }}>
              <style>{`.html-embed iframe, .html-embed embed, .html-embed object { max-width: 100% !important; width: 100% !important; height: 100% !important; border: 0; display: block; }`}</style>
              <div className="html-embed" style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: htmlModule.html || '' }} />
            </div>
          </div>
        </div>
      );
    }

    // BlocEspace / BlocSeparateur (Spacer)
    if ((m as any).type === 'BlocEspace' || (m as any).type === 'BlocSeparateur') {
      const space = m as any;
      const baseHeight =
        typeof space.height === 'number' ? space.height :
        typeof space.spaceHeight === 'number' ? space.spaceHeight :
        typeof space.minHeight === 'number' ? space.minHeight : 40;
      // SOLUTION RADICALE: Ignorer les spacings en preview
      const height = baseHeight;
      return (
        <div
          key={m.id}
          style={{
            ...commonStyle,
            paddingTop: previewMode ? 0 : scaleValue((space as any).spacingTop, 0),
            paddingBottom: previewMode ? 0 : scaleValue((space as any).spacingBottom, 0)
          }}
          onClick={() => !previewMode && onModuleClick?.(m.id)}
        >
          <div style={{ width: '100%', height }} />
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
              marginTop: scaleValue((buttonModule as any).spacingTop, 0),
              marginBottom: scaleValue((buttonModule as any).spacingBottom, 0),
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
        padding: `${scaleValue(carteModule.padding, 24)}px`,
        boxShadow: carteModule.boxShadow || '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: maxWidth * deviceScale
      };

      return (
        <div 
          key={m.id} 
          style={{ 
            ...commonStyle,
            paddingTop: scaleValue((carteModule as any).spacingTop, 0),
            paddingBottom: scaleValue((carteModule as any).spacingBottom, 0)
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
                      onModuleUpdate(m.id, { children: updatedChildren } as any);
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

    // BlocLogo
    if (m.type === 'BlocLogo') {
      const logoModule = m as BlocLogo;
      const bandHeight = scaleValue(logoModule.bandHeight, 60);
      const bandColor = logoModule.bandColor ?? '#ffffff';
      const bandPadding = scaleValue(logoModule.bandPadding, 16);
      const logoWidth = scaleValue(logoModule.logoWidth, 120);
      const logoHeight = scaleValue(logoModule.logoHeight, 120);
      const align = logoModule.align || 'center';
      const justifyContent = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';

      return (
        <div 
          key={m.id} 
          style={{ 
            backgroundColor: bandColor,
            height: bandHeight,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent,
            padding: `${bandPadding}px`,
            paddingTop: scaleValue((logoModule as any).spacingTop, 0),
            paddingBottom: scaleValue((logoModule as any).spacingBottom, 0),
            position: 'relative',
            cursor: previewMode ? 'default' : 'pointer'
          }}
          onClick={() => {
            console.log('🎯 [QuizModuleRenderer] Logo onClick triggered!', { previewMode, moduleId: m.id });
            if (!previewMode) {
              console.log('✅ [QuizModuleRenderer] Calling onModuleClick for logo');
              onModuleClick?.(m.id);
            }
          }}
        >
          {logoModule.logoUrl ? (
            <img
              src={logoModule.logoUrl}
              alt="Logo"
              style={{
                maxWidth: logoWidth,
                maxHeight: logoHeight,
                objectFit: 'contain'
              }}
            />
          ) : !previewMode ? (
            <div style={{
              width: logoWidth,
              height: logoHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a0aec0',
              fontSize: '14px',
              textAlign: 'center',
              padding: '16px'
            }}>
              <strong>Logo</strong>
            </div>
          ) : null}
        </div>
      );
    }

    // BlocPiedDePage
    if (m.type === 'BlocPiedDePage') {
      const footerModule = m as BlocPiedDePage;
      const baseBandHeight = scaleValue(footerModule.bandHeight, 60);
      const bandHeight = baseBandHeight;
      const bandColor = footerModule.bandColor ?? '#ffffff';
      const bandPadding = scaleValue(footerModule.bandPadding, 24);
      const logoWidth = scaleValue(footerModule.logoWidth, 120);
      const logoHeight = scaleValue(footerModule.logoHeight, 120);
      const align = footerModule.align || 'center';
      const justifyContent = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
      
      // Nouvelles propriétés
      const footerText = footerModule.footerText ?? '';
      const footerLinks = footerModule.footerLinks ?? [];
      const textColor = footerModule.textColor ?? '#000000';
      const linkColor = footerModule.linkColor ?? '#841b60';
      const fontSize = footerModule.fontSize ?? 14;
      const separator = footerModule.separator ?? '|';
      const socialLinks = footerModule.socialLinks ?? [];
      const socialIconSize = footerModule.socialIconSize ?? 24;
      const socialIconColor = footerModule.socialIconColor ?? '#000000';

      const hasContent = footerModule.logoUrl || footerText || footerLinks.length > 0 || socialLinks.length > 0;

      // Ne pas afficher le footer vide en mode preview
      if (previewMode && !hasContent) {
        return null;
      }

      return (
        <div 
          key={m.id} 
          style={{ 
            backgroundColor: bandColor,
            height: hasContent ? 'auto' : bandHeight,
            minHeight: hasContent ? bandHeight : undefined,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
            justifyContent: 'center',
            paddingTop: scaleValue((footerModule as any).spacingTop, bandPadding),
            paddingBottom: scaleValue((footerModule as any).spacingBottom, bandPadding),
            paddingLeft: scaleValue(64, 64),
            paddingRight: scaleValue(64, 64),
            gap: scaleValue(16, 16),
            cursor: previewMode ? 'default' : 'pointer'
          }}
          onClick={(e) => {
            if (!previewMode) {
              onModuleClick?.(m.id);
            }
          }}
        >
          {/* Logo */}
          {footerModule.logoUrl && (
            <img
              src={footerModule.logoUrl}
              alt="Footer logo"
              style={{
                maxWidth: logoWidth,
                maxHeight: logoHeight,
                objectFit: 'contain'
              }}
            />
          )}

          {/* Texte du footer */}
          {footerText && (
            <div
              style={{
                color: textColor,
                fontSize: `${fontSize}px`,
                textAlign: align,
                lineHeight: 1.2
              }}
            >
              {footerText}
            </div>
          )}

          {/* Liens du footer */}
          {footerLinks.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                alignItems: 'center',
                justifyContent,
                fontSize: `${fontSize}px`
              }}
            >
              {footerLinks.map((link, index) => (
                <React.Fragment key={link.id}>
                  <a
                    href={link.url}
                    target={link.openInNewTab ? '_blank' : '_self'}
                    rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                    style={{
                      color: linkColor,
                      textDecoration: 'underline',
                      cursor: 'pointer'
                    }}
                    onClick={(e) => {
                      if (!previewMode) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {link.text}
                  </a>
                  {index < footerLinks.length - 1 && separator && (
                    <span style={{ color: textColor, margin: '0 4px' }}>
                      {separator}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Réseaux sociaux */}
          {socialLinks.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                justifyContent
              }}
            >
              {socialLinks.map((social) => {
                const getSocialIcon = (platform: string) => {
                  const icons: Record<string, string> = {
                    facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
                    linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
                    twitter: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
                    instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
                    youtube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
                    tiktok: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z'
                  };
                  return icons[platform] || '';
                };

                return (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onClick={(e) => {
                      if (!previewMode) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <svg
                      width={socialIconSize}
                      height={socialIconSize}
                      viewBox="0 0 24 24"
                      fill={socialIconColor}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d={getSocialIcon(social.platform)} />
                    </svg>
                  </a>
                );
              })}
            </div>
          )}

          {/* Placeholder en mode édition */}
          {!hasContent && !previewMode && (
            <span style={{
              color: '#a0aec0',
              fontSize: '14px',
              whiteSpace: 'nowrap'
            }}>
              <strong>Pied de page</strong>
            </span>
          )}
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
