
import React from 'react';

interface CanvasHeaderProps {
  headerBanner: any;
  headerText: any;
  sizeMap: Record<string, string>;
}

const CanvasHeader: React.FC<CanvasHeaderProps> = ({
  headerBanner,
  headerText,
  sizeMap
}) => {
  if (!headerBanner?.enabled) return null;

  return (
    <div
      className="relative w-full"
      style={{
        backgroundImage: `url(${headerBanner.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: headerBanner.height || '120px'
      }}
    >
      {headerBanner.overlay && (
        <div className="absolute inset-0 bg-black opacity-40" />
      )}
      {headerText?.enabled && (
        <div
          className="relative w-full text-center flex items-center justify-center h-full"
          style={{
            color: headerText.color,
            fontSize: sizeMap[headerText.size] || '1rem',
            ...(headerText.showFrame
              ? {
                  backgroundColor: headerText.frameColor,
                  border: `1px solid ${headerText.frameBorderColor}`,
                  padding: '4px 8px',
                  borderRadius: '4px'
                }
              : {})
          }}
        >
          {headerText.text}
        </div>
      )}
    </div>
  );
};

export default CanvasHeader;
