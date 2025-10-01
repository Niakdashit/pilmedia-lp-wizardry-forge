import React from 'react';

interface GradientBandProps {
  children?: React.ReactNode;
  className?: string;
  heightClass?: string; // Tailwind height utility, e.g., 'h-12' or 'h-[5cm]'
  zIndex?: number; // Control stacking order; defaults to -1 to sit behind content
  imageSrc?: string; // Optional background image placed under /public
}

const GradientBand: React.FC<GradientBandProps> = ({ children, className = '', heightClass = 'h-[5cm]', zIndex = -1, imageSrc }) => {
  // Defaults: prefer SVG, fallback to PNG, then gradient
  const defaultSvg = '/assets/branding/top-gradient-band.svg';
  const defaultPng = '/assets/branding/top-gradient-band.png';

  const backgroundImage = imageSrc
    ? `url(${imageSrc}), radial-gradient(circle at 0% 0%, #b41b60, #841b60 70%)`
    : `url(${defaultSvg}), url(${defaultPng}), radial-gradient(circle at 0% 0%, #b41b60, #841b60 70%)`;
  const backgroundSize = imageSrc ? 'cover, auto' : 'cover, cover, auto';
  const backgroundRepeat = imageSrc ? 'no-repeat, no-repeat' : 'no-repeat, no-repeat, no-repeat';
  const backgroundPosition = imageSrc ? 'center, center' : 'center, center, center';

  return (
    <div 
      className={`fixed top-0 left-0 right-0 ${heightClass} ${className}`}
      style={{
        // Use stacked backgrounds with robust fallbacks
        backgroundImage,
        backgroundSize,
        backgroundRepeat,
        backgroundPosition,
        backgroundColor: '#2e353e',
        overflow: 'hidden',
        padding: '2px 32px 24px',
        zIndex,
        boxShadow: '0 14px 34px rgba(0, 0, 0, 0.67)'
      }}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px'
      }}>
        {children}
      </div>
    </div>
  );
};

export default GradientBand;
