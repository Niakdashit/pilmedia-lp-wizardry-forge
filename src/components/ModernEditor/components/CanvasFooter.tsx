
import React from 'react';

interface CanvasFooterProps {
  footerBanner: any;
  footerText: any;
  sizeMap: Record<string, string>;
}

const CanvasFooter: React.FC<CanvasFooterProps> = ({
  footerBanner,
  footerText,
  sizeMap
}) => {
  if (!footerBanner?.enabled) return null;

  return (
    <div
      className="relative w-full"
      style={{
        backgroundImage: `url(${footerBanner.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: footerBanner.height || '120px'
      }}
    >
      {footerBanner.overlay && (
        <div className="absolute inset-0 bg-black opacity-40" />
      )}
      {footerText?.enabled && (
        <div
          className="relative w-full text-center flex items-center justify-center h-full"
          style={{
            color: footerText.color,
            fontSize: sizeMap[footerText.size] || '1rem',
            ...(footerText.showFrame
              ? {
                  backgroundColor: footerText.frameColor,
                  border: `1px solid ${footerText.frameBorderColor}`,
                  padding: '4px 8px',
                  borderRadius: '4px'
                }
              : {})
          }}
        >
          {footerText.text}
        </div>
      )}
    </div>
  );
};

export default CanvasFooter;
