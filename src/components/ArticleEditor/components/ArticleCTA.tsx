import React from 'react';
import { ArrowRight, ExternalLink, Play } from 'lucide-react';
import { useButtonStyleCSS } from '@/stores/buttonStore';

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
}) => {
  // Style global unifié des boutons (fond, bordure, arrondi, zoom, padding…)
  const globalButtonStyle = useButtonStyleCSS();

  // Icône selon le type
  const IconComponent = {
    arrow: ArrowRight,
    external: ExternalLink,
    play: Play,
    none: null,
  }[icon];

  const widthClass = fullWidth === false ? '' : 'w-full';

  const buttonClasses = `
    ${widthClass} px-6 py-3
    font-medium
    transition-colors duration-200 hover:opacity-90
    disabled:opacity-50 disabled:cursor-not-allowed
    ${className}
  `;

  const containerClasses = `
    article-cta-container
    flex justify-center items-center
    mt-3 mb-8
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
          style={{
            ...globalButtonStyle,
            ...(style || {}),
          }}
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
        style={{
          ...globalButtonStyle,
          ...(style || {}),
        }}
        type="button"
      >
        <span>{text}</span>
        {IconComponent && <IconComponent className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default ArticleCTA;
