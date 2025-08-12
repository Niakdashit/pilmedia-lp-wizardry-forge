import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface PillButtonProps {
  to?: string;
  onClick?: () => void;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const PillButton: React.FC<PillButtonProps> = ({
  to,
  onClick,
  children,
  icon,
  className = '',
  type = 'button',
  disabled = false,
}) => {
  const baseClasses = 'inline-flex items-center px-4 py-2 bg-gradient-to-br from-[#841b60] to-[#b41b60] backdrop-blur-sm text-white font-medium rounded-xl hover:from-[#841b60] hover:to-[#6d164f] transition-all duration-300 shadow-lg shadow-[#841b60]/20 hover:shadow-xl hover:shadow-[#841b60]/30 transform hover:-translate-y-0.5 border border-white/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[#841b60]/20';
  
  if (to) {
    return (
      <Link
        to={to}
        className={`${baseClasses} ${className}`}
        onClick={onClick}
      >
        {icon && <span className="mr-2 drop-shadow-sm">{icon}</span>}
        <span className="drop-shadow-sm">{children}</span>
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${className}`}
      disabled={disabled}
    >
      {icon && <span className="mr-2 drop-shadow-sm">{icon}</span>}
      <span className="drop-shadow-sm">{children}</span>
    </button>
  );
};

export default PillButton;
