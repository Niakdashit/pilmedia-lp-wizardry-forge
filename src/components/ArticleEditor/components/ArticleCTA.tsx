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
  mobileVerticalPosition?: number; // Position verticale sur mobile (0-100%)
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
  mobileVerticalPosition = 85, // Par défaut en bas (85%)
}) => {
  // Styles de base selon le variant
  const variantStyles = {
    primary: 'bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white hover:from-[#841b60] hover:to-[#6d164f] shadow-lg shadow-[#841b60]/20 hover:shadow-xl hover:shadow-[#841b60]/30',
    secondary: 'bg-white text-[#841b60] border-2 border-[#841b60] hover:bg-[#841b60] hover:text-white',
    outline: 'bg-transparent text-[#841b60] border-2 border-[#841b60] hover:bg-[#841b60] hover:text-white',
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

  const buttonClasses = `
    inline-flex items-center justify-center gap-2
    font-bold rounded-xl
    transition-all duration-300 transform
    hover:-translate-y-0.5
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    focus:outline-none focus:ring-2 focus:ring-[#841b60] focus:ring-opacity-50
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  // Détecter si on est sur mobile
  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const containerClasses = `
    article-cta-container
    flex justify-center items-center
    ${isMobile ? 'fixed left-0 right-0 z-50' : 'py-6'}
  `;
  
  // Style pour le positionnement vertical sur mobile
  const mobilePositionStyle: React.CSSProperties = isMobile ? {
    top: `${mobileVerticalPosition}%`,
    transform: 'translateY(-50%)',
    padding: '0 1rem',
  } : {};

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
      <div 
        className={containerClasses} 
        style={{ 
          maxWidth: isMobile ? '100%' : `${maxWidth}px`,
          ...mobilePositionStyle 
        }}
      >
        <a
          href={href}
          onClick={handleClick}
          className={buttonClasses}
          style={style}
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
    <div 
      className={containerClasses} 
      style={{ 
        maxWidth: isMobile ? '100%' : `${maxWidth}px`,
        ...mobilePositionStyle 
      }}
    >
      <button
        onClick={handleClick}
        disabled={disabled}
        className={buttonClasses}
        style={style}
        type="button"
      >
        <span>{text}</span>
        {IconComponent && <IconComponent className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default ArticleCTA;
