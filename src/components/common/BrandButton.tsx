
import React from 'react';
// import { useBrandTheme } from '../../hooks/useBrandTheme';

interface BrandButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const BrandButton: React.FC<BrandButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  type = 'button'
}) => {
  // Theme-based colors are not used in the unified button style anymore

  const getButtonStyle = () => {
    // Uniform global button styling
    return {
      backgroundColor: '#f0f5fd',
      color: '#646463',
      borderColor: 'transparent'
    } as React.CSSProperties;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${getSizeClasses()}
        font-medium rounded-lg transition-all duration-200
        hover:opacity-90 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:ring-2 focus:ring-offset-2
        ${className}
      `}
      style={getButtonStyle()}
    >
      {children}
    </button>
  );
};

export default BrandButton;
