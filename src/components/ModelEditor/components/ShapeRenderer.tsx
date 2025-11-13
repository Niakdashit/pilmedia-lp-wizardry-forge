import React from 'react';

interface ShapeRendererProps {
  shapeType: string;
  width: number;
  height: number;
  color: string;
  borderRadius?: string;
  borderStyle?: string;
  borderWidth?: string;
  borderColor?: string;
  className?: string;
  style?: React.CSSProperties;
  isEditing?: boolean;
  content?: string;
  onContentChange?: (content: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onBlur?: () => void;
  textRef?: React.RefObject<HTMLDivElement>;
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
  // Style de base pour les formes simples
  const baseStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: color,
    borderRadius: borderRadius,
    border: borderStyle !== 'none' ? `${borderWidth} ${borderStyle} ${borderColor}` : 'none',
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
                ? (borderRadius && borderRadius !== '0' ? borderRadius : '20px')
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
          ref={textRef}
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
