
import React from 'react';

interface CustomElementsRendererProps {
  customTexts: any[];
  customImages: any[];
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  sizeMap: Record<string, string>;
  zoom?: number;
}

const CustomElementsRenderer: React.FC<CustomElementsRendererProps> = ({
  customTexts,
  customImages,
  previewDevice,
  sizeMap,
  zoom = 1
}) => {

  const parsePx = (v: any, fallback: number = 0) => {
    if (v == null) return fallback;
    if (typeof v === 'number') return v;
    const m = String(v).match(/([-+]?[0-9]*\.?[0-9]+)/);
    return m ? parseFloat(m[1]) : fallback;
  };

  const z = Math.max(0.1, Number(zoom) || 1);

  const renderTextElement = (customText: any) => {
    if (!customText?.content && !customText?.text) return null;

    // Gestion du responsive : utiliser les propriétés responsives si disponibles
    const deviceConfig = customText.deviceConfig?.[previewDevice] || customText.responsive?.[previewDevice];
    const config = deviceConfig || customText;
    
    const textContent = customText.content || customText.text || 'Texte personnalisé';
    
    // Responsive font sizes based on device
    const getFontSize = () => {
      let base: string | number | undefined = config.fontSize || (sizeMap[config.size || customText.size || 'base']);
      if (!base) {
        // Fallback responsive sizing
        base = previewDevice === 'mobile' ? '14px' : previewDevice === 'tablet' ? '16px' : '18px';
      }
      const n = parsePx(base, 16) * z;
      return `${n}px`;
    };

    // Width/height handling similar to editor (auto for text unless explicitly set)
    const getResponsiveWidth = () => {
      const width = config.width ?? customText.width;
      return width ? `${width}px` : 'auto';
    };

    const textStyle: React.CSSProperties = {
      position: 'absolute',
      transform: `translate3d(${config.x ?? customText.x ?? 0}px, ${config.y ?? customText.y ?? 0}px, 0)`,
      fontSize: getFontSize(),
      color: config.color || customText.color || '#000000',
      fontFamily: config.fontFamily || customText.fontFamily || 'Arial',
      fontWeight: config.fontWeight || customText.fontWeight || ((config.bold || customText.bold) ? 'bold' : 'normal'),
      fontStyle: config.fontStyle || customText.fontStyle || ((config.italic || customText.italic) ? 'italic' : 'normal'),
      textDecoration: config.textDecoration || customText.textDecoration || ((config.underline || customText.underline) ? 'underline' : 'none'),
      textAlign: (config.textAlign || customText.textAlign || 'left') as any,
      zIndex: 100,
      pointerEvents: 'none',
      cursor: 'default',
      width: getResponsiveWidth(),
      height: config.height ? `${config.height}px` : 'auto',
      minWidth: '50px',
      lineHeight: '1.2',
      wordWrap: 'break-word',
      // Mobile perf hints
      willChange: 'transform',
      backfaceVisibility: 'hidden',
      contain: 'content'
    };

    // Background styling with optional opacity (match editor behavior)
    if (config.backgroundColor || customText.backgroundColor) {
      const bg = config.backgroundColor || customText.backgroundColor;
      const opacity = (config.backgroundOpacity ?? customText.backgroundOpacity ?? 1) as number;
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      };
      if (bg && typeof bg === 'string' && bg.startsWith('#')) {
        const rgb = hexToRgb(bg);
        (textStyle as any).backgroundColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})` : bg;
      } else if (bg) {
        (textStyle as any).backgroundColor = bg as string;
      }
    }

    // Border radius scaling
    if (config.borderRadius != null || customText.borderRadius != null) {
      const br = parsePx(config.borderRadius ?? customText.borderRadius, 0) * z;
      (textStyle as any).borderRadius = `${br}px`;
    }

    // Padding object scaling
    if (config.padding || customText.padding) {
      const p = (config.padding ?? customText.padding) as any;
      const top = parsePx(p.top, 0) * z;
      const right = parsePx(p.right, 0) * z;
      const bottom = parsePx(p.bottom, 0) * z;
      const left = parsePx(p.left, 0) * z;
      (textStyle as any).padding = `${top}px ${right}px ${bottom}px ${left}px`;
    }

    // Text shadow if provided (scaled)
    if (config.textShadow || customText.textShadow) {
      const ts = (config.textShadow ?? customText.textShadow) as any;
      const ox = parsePx(ts.offsetX, 0) * z;
      const oy = parsePx(ts.offsetY, 0) * z;
      const bl = parsePx(ts.blur, 0) * z;
      (textStyle as any).textShadow = `${ox}px ${oy}px ${bl}px ${ts.color || 'rgba(0,0,0,0.5)'}`;
    }

    // Apply and scale known customCSS dimensional properties
    const scaledCustom: Record<string, any> = { ...(customText.customCSS || {}), ...(config.customCSS || {}) };
    if (scaledCustom.letterSpacing != null) {
      const v = parsePx(scaledCustom.letterSpacing, 0) * z;
      scaledCustom.letterSpacing = `${v}px`;
    }
    if (scaledCustom.borderRadius != null) {
      const v = parsePx(scaledCustom.borderRadius, 0) * z;
      scaledCustom.borderRadius = `${v}px`;
    }
    if (scaledCustom.padding != null && typeof scaledCustom.padding === 'string') {
      const nums = String(scaledCustom.padding).split(/\s+/).map((p: string) => `${parsePx(p, 0) * z}px`);
      scaledCustom.padding = nums.join(' ');
    }
    if (scaledCustom.boxShadow) {
      const parts = String(scaledCustom.boxShadow).split(/\s+/);
      let count = 0;
      const scaled = parts.map((p: string) => {
        const n = parsePx(p);
        if (!isNaN(n) && count < 3) {
          count++;
          return `${n * z}px`;
        }
        return p;
      });
      scaledCustom.boxShadow = scaled.join(' ');
    }
    if ((scaledCustom as any).WebkitTextStroke) {
      const val = String((scaledCustom as any).WebkitTextStroke);
      const m = val.match(/([-+]?[0-9]*\.?[0-9]+)px/);
      if (m) {
        const n = parseFloat(m[1]) * z;
        (scaledCustom as any).WebkitTextStroke = val.replace(/([-+]?[0-9]*\.?[0-9]+)px/, `${n}px`);
      }
    }
    Object.assign(textStyle, scaledCustom);

    if (config.showFrame || customText.showFrame) {
      (textStyle as any).backgroundColor = config.frameColor || customText.frameColor || 'rgba(255, 255, 255, 0.9)';
      (textStyle as any).border = `${1 * z}px solid ${config.frameBorderColor || customText.frameBorderColor || '#e5e7eb'}`;
      (textStyle as any).padding = `${8 * z}px ${12 * z}px`;
      (textStyle as any).borderRadius = `${4 * z}px`;
      (textStyle as any).boxShadow = `0 ${2 * z}px ${8 * z}px rgba(0, 0, 0, 0.15)`;
      (textStyle as any).backdropFilter = 'blur(10px)';
    }

    return (
      <div
        key={`text-${customText.id}-${previewDevice}`}
        style={textStyle}
        title="Double-cliquez pour éditer"
      >
        <span style={{ width: '100%', textAlign: 'inherit' }}>
          {textContent}
        </span>
      </div>
    );
  };

  const renderImageElement = (customImage: any) => {
    if (!customImage?.src) return null;

    // Gestion du responsive : utiliser les propriétés responsives si disponibles
    const deviceConfig = customImage.deviceConfig?.[previewDevice] || customImage.responsive?.[previewDevice];
    const config = deviceConfig || customImage;
    
    const imageStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${config.x || customImage.x || 0}px`,
      top: `${config.y || customImage.y || 0}px`,
      width: `${config.width || customImage.width || 100}px`,
      height: `${config.height || customImage.height || 100}px`,
      transform: `rotate(${config.rotation || customImage.rotation || 0}deg)`,
      zIndex: 99,
      pointerEvents: 'none',
      objectFit: 'cover',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      // Mobile perf hints
      willChange: 'transform',
      backfaceVisibility: 'hidden',
      contain: 'content'
    };

    return (
      <img
        key={`image-${customImage.id}-${previewDevice}`}
        src={customImage.src}
        alt="Image personnalisée"
        style={imageStyle}
        decoding="async"
        loading="eager"
        onError={(e) => {
          console.warn('Image failed to load:', customImage.src);
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  };

  return (
    <>
      {/* Render custom images first (lower z-index) */}
      {customImages.map(renderImageElement)}
      
      {/* Render custom texts on top (higher z-index) */}
      {customTexts.map(renderTextElement)}
    </>
  );
};

export default CustomElementsRenderer;
