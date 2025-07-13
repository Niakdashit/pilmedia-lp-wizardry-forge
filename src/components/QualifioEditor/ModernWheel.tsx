import React, { useState } from 'react';

interface ModernWheelProps {
  size?: number;
  onComplete?: () => void;
}

const ModernWheel: React.FC<ModernWheelProps> = ({ size = 300, onComplete }) => {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const segments = [
    { text: "Prix 3", color: "#4ECDC4", angle: 0 },
    { text: "Dommage", color: "#F7B731", angle: 90 },
    { text: "Prix 1", color: "#E74C3C", angle: 180 },
    { text: "Prix 2", color: "#26D0CE", angle: 270 }
  ];

  const handleSpin = () => {
    if (spinning) return;
    
    setSpinning(true);
    const spinAmount = Math.random() * 360 + 1440; // 4+ tours
    setRotation(prev => prev + spinAmount);
    
    setTimeout(() => {
      setSpinning(false);
      onComplete?.();
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Roue container */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* Pointer triangulaire */}
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20"
          style={{ marginTop: '8px' }}
        >
          <div 
            className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent"
            style={{ borderBottomColor: '#4ECDC4' }}
          />
        </div>

        {/* Bordure extérieure grise */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{ 
            background: 'linear-gradient(135deg, #E5E5E5 0%, #D1D1D1 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }}
        />

        {/* Roue principale */}
        <div 
          className="absolute inset-2 rounded-full overflow-hidden transition-transform duration-[3000ms] ease-out"
          style={{ 
            transform: `rotate(${rotation}deg)`,
            background: 'conic-gradient(from 0deg, #4ECDC4 0deg 90deg, #F7B731 90deg 180deg, #E74C3C 180deg 270deg, #26D0CE 270deg 360deg)'
          }}
        >
          {/* Lignes de séparation */}
          <div className="absolute inset-0">
            {[0, 90, 180, 270].map((angle, index) => (
              <div
                key={index}
                className="absolute w-0.5 bg-white origin-bottom"
                style={{
                  height: '50%',
                  left: '50%',
                  bottom: '50%',
                  transform: `translateX(-50%) rotate(${angle}deg)`,
                }}
              />
            ))}
          </div>

          {/* Textes des segments */}
          {segments.map((segment, index) => (
            <div
              key={index}
              className="absolute text-white font-bold text-sm transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) rotate(${segment.angle + 45}deg) translateY(-${size * 0.25}px) rotate(-${segment.angle + 45}deg)`,
              }}
            >
              {segment.text}
            </div>
          ))}
        </div>

        {/* Centre de la roue */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
        >
          <div 
            className="rounded-full border-4 border-white"
            style={{ 
              width: size * 0.15,
              height: size * 0.15,
              background: 'linear-gradient(135deg, #4ECDC4 0%, #26D0CE 100%)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
            }}
          />
        </div>
      </div>

      {/* Bouton Remplir le formulaire */}
      <button
        onClick={handleSpin}
        disabled={spinning}
        className="px-8 py-4 text-white font-bold text-lg rounded-full transition-all duration-300 hover:scale-105 disabled:opacity-50"
        style={{ 
          background: 'linear-gradient(135deg, #8E44AD 0%, #9B59B6 100%)',
          boxShadow: '0 8px 32px rgba(142, 68, 173, 0.3)'
        }}
      >
        {spinning ? 'Tournage...' : 'Remplir le formulaire'}
      </button>
    </div>
  );
};

export default ModernWheel;