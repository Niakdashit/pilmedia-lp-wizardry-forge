import React from 'react';

interface RulerGuidesProps {
  width: number;
  height: number;
  zoom: number;
  snapGuides?: any[];
}

const RulerGuides: React.FC<RulerGuidesProps> = ({ 
  width, 
  height, 
  zoom
  // snapGuides 
}) => {
  const rulerSize = 20;
  const tickSpacing = 10;
  
  const generateTicks = (dimension: number) => {
    const ticks = [];
    for (let i = 0; i <= dimension; i += tickSpacing) {
      ticks.push(i);
    }
    return ticks;
  };

  const horizontalTicks = generateTicks(width);
  const verticalTicks = generateTicks(height);

  return (
    <>
      {/* Horizontal Ruler */}
      <div
        className="absolute top-0 left-0 bg-gray-100 border-b border-gray-300 flex items-end z-30"
        style={{
          width: `${width}px`,
          height: `${rulerSize}px`,
          fontSize: '10px',
          transform: `scale(${zoom})`,
          transformOrigin: 'top left'
        }}
      >
        {horizontalTicks.map((tick) => (
          <div
            key={tick}
            className="absolute text-gray-600"
            style={{
              left: `${tick}px`,
              transform: 'translateX(-50%)'
            }}
          >
            {tick % 50 === 0 && (
              <>
                <div className="w-px h-3 bg-gray-400 mb-1" />
                <span className="text-xs">{tick}</span>
              </>
            )}
            {tick % 50 !== 0 && tick % 10 === 0 && (
              <div className="w-px h-2 bg-gray-300 mb-1" />
            )}
          </div>
        ))}
      </div>

      {/* Vertical Ruler */}
      <div
        className="absolute top-0 left-0 bg-gray-100 border-r border-gray-300 flex flex-col justify-end z-30"
        style={{
          width: `${rulerSize}px`,
          height: `${height}px`,
          fontSize: '10px',
          transform: `scale(${zoom})`,
          transformOrigin: 'top left'
        }}
      >
        {verticalTicks.map((tick) => (
          <div
            key={tick}
            className="absolute text-gray-600 flex items-center"
            style={{
              top: `${tick}px`,
              transform: 'translateY(-50%)'
            }}
          >
            {tick % 50 === 0 && (
              <>
                <div className="h-px w-3 bg-gray-400 mr-1" />
                <span className="text-xs transform -rotate-90 origin-center">{tick}</span>
              </>
            )}
            {tick % 50 !== 0 && tick % 10 === 0 && (
              <div className="h-px w-2 bg-gray-300 mr-1" />
            )}
          </div>
        ))}
      </div>

      {/* Corner */}
      <div
        className="absolute top-0 left-0 bg-gray-200 border-r border-b border-gray-300 z-40"
        style={{
          width: `${rulerSize}px`,
          height: `${rulerSize}px`,
          transform: `scale(${zoom})`,
          transformOrigin: 'top left'
        }}
      />
    </>
  );
};

export default RulerGuides;