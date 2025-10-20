import React from 'react';

interface ShapeRendererProps {
  shapeType: string;
  width: number;
  height: number;
  color: string;
  borderRadius?: string | number;
  borderStyle?: string;
  borderWidth?: string | number;
  borderColor?: string;
  className?: string;
  style?: React.CSSProperties;
  isEditing?: boolean;
  content?: string;
  onContentChange?: (content: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onBlur?: () => void;
  textRef?: React.RefObject<HTMLDivElement | null>;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: string;
  textColor?: string;
}

export const ShapeRenderer: React.FC<ShapeRendererProps> = ({
  shapeType,
  width,
  height,
  color,
  borderRadius = '0',
  borderStyle = 'none',
  borderWidth = '0px',
  borderColor = '#000000',
  className = '',
  style = {},
  isEditing = false,
  content = '',
  onContentChange,
  onKeyDown,
  onBlur,
  textRef,
  fontSize = 16,
  fontFamily = 'Inter',
  fontWeight = 'normal',
  fontStyle = 'normal',
  textDecoration = 'none',
  textAlign = 'center',
  textColor = '#000000',
}) => {
  // Normalize border values to ensure proper CSS format
  const normalizeBorderRadius = (val: string | number): string => {
    if (typeof val === 'number') return `${val}px`;
    if (typeof val === 'string' && !val.includes('px')) return `${val}px`;
    return val;
  };
  
  const normalizeBorderWidth = (val: string | number): string => {
    if (typeof val === 'number') return `${val}px`;
    if (typeof val === 'string' && !val.includes('px') && val !== 'none') return `${val}px`;
    return val;
  };
  
  const normalizedBorderRadius = normalizeBorderRadius(borderRadius);
  const normalizedBorderWidth = normalizeBorderWidth(borderWidth);
  
  // Style de base pour les formes simples
  const baseStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: color,
    borderRadius: normalizedBorderRadius,
    border: borderStyle !== 'none' ? `${normalizedBorderWidth} ${borderStyle} ${borderColor}` : 'none',
    boxSizing: 'border-box', // Important pour que les bordures ne débordent pas
    ...style,
  };

  // Styles pour le texte éditable
  const textStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: `${fontSize}px`,
    fontFamily,
    fontWeight,
    fontStyle,
    textDecoration,
    textAlign: textAlign as 'left' | 'center' | 'right' | 'justify',
    color: textColor,
    width: '80%',
    height: 'auto',
    minHeight: '1em',
    outline: 'none',
    border: 'none',
    background: 'transparent',
    cursor: isEditing ? 'text' : 'inherit',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
    justifyContent: textAlign as any,
    zIndex: 10,
  };

  // Pour les formes SVG complexes, on utilise des formes simples pour l'instant

  // Pour les formes simples sans définition SVG
  const renderShape = () => {
    switch (shapeType) {
      case 'circle':
        return <div style={{ ...baseStyle, borderRadius: '50%' }} />;
      
      case 'oval':
        return <div style={{ ...baseStyle, borderRadius: '50%', aspectRatio: '1.5' }} />;
      
      case 'square':
        // Respect provided borderRadius for squares
        return <div style={baseStyle} />;
      
      case 'rectangle':
      case 'rounded-rectangle':
        // For rectangles, do not override borderRadius so live updates apply.
        // If explicitly using 'rounded-rectangle', fall back to a default only when no borderRadius provided.
        return (
          <div
            style={{
              ...baseStyle,
              borderRadius: shapeType === 'rounded-rectangle'
                ? (normalizedBorderRadius && normalizedBorderRadius !== '0px' ? normalizedBorderRadius : '20px')
                : baseStyle.borderRadius,
            }}
          />
        );
      
      // Par défaut, afficher un rectangle
      default:
        return <div style={baseStyle} />;
    }
  };

  return (
    <div className={className} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {renderShape()}
      
      {/* Zone de texte éditable au centre de la forme */}
      {isEditing ? (
        <div
          ref={textRef as React.RefObject<HTMLDivElement>}
          contentEditable
          suppressContentEditableWarning
          style={textStyle}
          onInput={onContentChange ? (e) => onContentChange((e.target as HTMLDivElement).textContent || '') : undefined}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          data-element-type="text"
        >
          {content}
        </div>
      ) : content ? (
        <div style={textStyle}>
          {content}
        </div>
      ) : null}
    </div>
  );
};

export default ShapeRenderer;
