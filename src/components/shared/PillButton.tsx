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
  const baseClasses = 'inline-flex items-center px-3.5 py-2 bg-[#fafafa] text-[#841b61] font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 border-2 border-[#bca0b2] text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
  
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
