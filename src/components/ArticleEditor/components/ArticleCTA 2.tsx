import React from 'react';
import { ArrowRight, ExternalLink, Play } from 'lucide-react';

interface ArticleCTAProps {
  text?: string;
  onClick?: () => void;
  href?: string;
  style?: React.CSSProperties;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  icon?: 'arrow' | 'external' | 'play' | 'none';
  disabled?: boolean;
  fullWidth?: boolean;
  maxWidth?: number;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: string | number;
  borderColor?: string;
  borderWidth?: number;
}

/**
 * ArticleCTA - Bouton "Participer" du mode Article
 * 
 * Caractéristiques:
 * - Positionné sous le texte descriptif, centré
 * - Lance la suite du funnel (formulaire, mécanique, résultat)
 * - Style identique aux boutons par défaut de l'éditeur
 * - Personnalisable via panneau latéral
 */
const ArticleCTA: React.FC<ArticleCTAProps> = ({
  text = 'PARTICIPER !',
  onClick,
  href,
  style,
  className = '',
  variant = 'primary',
  size = 'large',
  icon = 'arrow',
  disabled = false,
  fullWidth = false,
  maxWidth = 810,
  backgroundColor,
  textColor,
  borderRadius,
  borderColor,
  borderWidth,
}) => {
  // Styles de base selon le variant
  const variantStyles = {
    primary: 'bg-gradient-to-br from-[#E0004D] to-[#6B2AA0] text-white hover:from-[#E0004D] hover:to-[#4D2388] shadow-lg shadow-[#E0004D]/20 hover:shadow-xl hover:shadow-[#E0004D]/30',
    secondary: 'bg-white text-[#E0004D] border-2 border-[#E0004D] hover:bg-[#E0004D] hover:text-white',
    outline: 'bg-transparent text-[#E0004D] border-2 border-[#E0004D] hover:bg-[#E0004D] hover:text-white',
  };

  // Tailles de bouton
  const sizeStyles = {
    small: 'px-6 py-2 text-sm',
    medium: 'px-8 py-3 text-base',
    large: 'px-12 py-4 text-lg',
  };

  // Icône selon le type
  const IconComponent = {
    arrow: ArrowRight,
    external: ExternalLink,
    play: Play,
    none: null,
  }[icon];

  const resolvedBorderRadius =
    borderRadius !== undefined
      ? typeof borderRadius === 'number'
        ? `${borderRadius}px`
        : borderRadius
      : undefined;

  const resolvedBorderWidth =
    borderWidth !== undefined ? `${Math.max(borderWidth, 0)}px` : undefined;

  const inlineStyle: React.CSSProperties = {
    ...style,
  };

  if (backgroundColor) {
    inlineStyle.background = backgroundColor;
  }

  if (textColor) {
    inlineStyle.color = textColor;
  }

  if (resolvedBorderRadius) {
    inlineStyle.borderRadius = resolvedBorderRadius;
  }

  if (borderColor) {
    inlineStyle.borderColor = borderColor;
    inlineStyle.borderStyle = (borderWidth ?? 2) > 0 ? 'solid' : inlineStyle.borderStyle;
  }

  if (resolvedBorderWidth) {
    inlineStyle.borderWidth = resolvedBorderWidth;
    inlineStyle.borderStyle = (borderWidth ?? 0) > 0 ? 'solid' : inlineStyle.borderStyle;
  }

  const needsBorderClass = (borderWidth ?? 0) > 0 || !!borderColor;

  const buttonClasses = `
    inline-flex items-center justify-center gap-2
    font-bold rounded-xl
    transition-all duration-300 transform
    hover:-translate-y-0.5
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    focus:outline-none focus:ring-2 focus:ring-[#E0004D] focus:ring-opacity-50
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${fullWidth ? 'w-full' : ''}
    ${needsBorderClass ? 'border' : ''}
    ${className}
  `;

  const containerClasses = `
    article-cta-container
    flex justify-center items-center
    py-6
  `;

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick();
    }
  };

  // Si href est fourni, rendu en lien
  if (href && !disabled) {
    return (
      <div className={containerClasses} style={{ maxWidth: `${maxWidth}px` }}>
        <a
          href={href}
          onClick={handleClick}
          className={buttonClasses}
          style={inlineStyle}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          <span>{text}</span>
          {IconComponent && <IconComponent className="w-5 h-5" />}
        </a>
      </div>
    );
  }

  // Sinon, rendu en bouton
  return (
    <div className={containerClasses} style={{ maxWidth: `${maxWidth}px` }}>
      <button
        onClick={handleClick}
        disabled={disabled}
        className={buttonClasses}
        style={inlineStyle}
        type="button"
      >
        <span>{text}</span>
        {IconComponent && <IconComponent className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default ArticleCTA;
