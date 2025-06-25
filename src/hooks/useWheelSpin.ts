
import { useState, useCallback } from 'react';

interface UseWheelSpinProps {
  segments: any[];
  disabled?: boolean;
  config?: any;
  onStart?: () => void;
  onFinish?: (result: 'win' | 'lose') => void;
}

export const useWheelSpin = ({
  segments,
  disabled = false,
  config,
  onStart,
  onFinish
}: UseWheelSpinProps) => {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const spinWheel = useCallback(() => {
    if (spinning || disabled || segments.length === 0) return;

    if (onStart) {
      onStart();
    }

    setSpinning(true);
    
    // Calculate random rotation (minimum 5 full turns)
    const baseRotation = 1800 + Math.random() * 1800; // 5-10 tours
    const finalRotation = rotation + baseRotation;
    
    setRotation(finalRotation);

    // Stop spinning after animation
    setTimeout(() => {
      setSpinning(false);
      
      // Calculate winning segment
      const normalizedRotation = (360 - (finalRotation % 360)) % 360;
      const segmentAngle = 360 / segments.length;
      const winningIndex = Math.floor(normalizedRotation / segmentAngle);
      const winningSegment = segments[winningIndex];
      
      // Determine if it's a win or lose based on config
      let result: 'win' | 'lose' = 'win';
      
      if (config?.mode === 'instant_winner') {
        const winProbability = config.winProbability || 0.1;
        result = Math.random() < winProbability ? 'win' : 'lose';
      } else if (winningSegment) {
        // Check if segment indicates a loss
        const segmentText = winningSegment.label?.toLowerCase() || '';
        result = segmentText.includes('dommage') || segmentText.includes('perdu') ? 'lose' : 'win';
      }
      
      if (onFinish) {
        onFinish(result);
      }
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('Wheel spin result:', { winningSegment, result });
      }
    }, 3000);
  }, [spinning, disabled, segments, rotation, config, onStart, onFinish]);

  return {
    rotation,
    spinning,
    spinWheel
  };
};
