import React, { useState } from 'react';

interface InteractiveWheelProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  onSpin?: () => void;
}

const InteractiveWheel: React.FC<InteractiveWheelProps> = ({
  primaryColor,
  secondaryColor,
  accentColor,
  onSpin
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  
  const segments = [
    '10% OFF', '20% OFF', 'CADEAU', '5% OFF', 'ESSAI GRATUIT', '15% OFF', 'BONUS', '30% OFF'
  ];

  const handleSpin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    onSpin?.();
    
    // Simulation de rotation
    setTimeout(() => {
      setIsSpinning(false);
    }, 3000);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Roue principale */}
      <div className="relative">
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          className={`${isSpinning ? 'animate-spin' : ''} transition-transform duration-3000 ease-out`}
          style={{
            animationDuration: isSpinning ? '3s' : '0s',
            transform: isSpinning ? 'rotate(1440deg)' : 'rotate(0deg)'
          }}
        >
          {segments.map((segment, index) => {
            const angle = (360 / segments.length) * index;
            const isEven = index % 2 === 0;
            const color = isEven ? primaryColor : secondaryColor;
            
            return (
              <g key={index}>
                {/* Segment de la roue */}
                <path
                  d={`M 100 100 L ${100 + 90 * Math.cos((angle - 22.5) * Math.PI / 180)} ${100 + 90 * Math.sin((angle - 22.5) * Math.PI / 180)} A 90 90 0 0 1 ${100 + 90 * Math.cos((angle + 22.5) * Math.PI / 180)} ${100 + 90 * Math.sin((angle + 22.5) * Math.PI / 180)} Z`}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                
                {/* Texte du segment */}
                <text
                  x={100 + 60 * Math.cos(angle * Math.PI / 180)}
                  y={100 + 60 * Math.sin(angle * Math.PI / 180)}
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${angle}, ${100 + 60 * Math.cos(angle * Math.PI / 180)}, ${100 + 60 * Math.sin(angle * Math.PI / 180)})`}
                >
                  {segment}
                </text>
              </g>
            );
          })}
          
          {/* Centre de la roue */}
          <circle
            cx="100"
            cy="100"
            r="20"
            fill={accentColor}
            stroke={primaryColor}
            strokeWidth="3"
          />
        </svg>
        
        {/* Pointeur */}
        <div 
          className="absolute top-2 left-1/2 transform -translate-x-1/2"
          style={{ color: primaryColor }}
        >
          <div 
            className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent"
            style={{ borderBottomColor: primaryColor }}
          />
        </div>
      </div>
      
      {/* Bouton de rotation */}
      <button
        onClick={handleSpin}
        disabled={isSpinning}
        className="mt-4 px-6 py-3 rounded-full font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: primaryColor,
          border: `2px solid ${accentColor}`
        }}
      >
        {isSpinning ? 'ROTATION...' : 'TOURNER'}
      </button>
    </div>
  );
};

export default InteractiveWheel;