
import { useState, useCallback, useRef } from 'react';
import { WheelSegment, WheelState, WheelTheme } from '../types';

interface UseWheelAnimationProps {
  segments: WheelSegment[];
  theme: WheelTheme;
  onResult?: (segment: WheelSegment) => void;
  disabled?: boolean;
}

export const useWheelAnimation = ({
  segments,
  theme,
  onResult,
  disabled = false
}: UseWheelAnimationProps) => {
  const [wheelState, setWheelState] = useState<WheelState>({
    isSpinning: false,
    rotation: 0,
    targetRotation: 0,
    currentSegment: null
  });

  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const spin = useCallback(() => {
    if (wheelState.isSpinning || disabled || segments.length === 0) return;

    // Calculer la rotation cible
    const baseRotation = 1080; // 3 tours minimum
    const randomRotation = Math.random() * 360;
    const targetRotation = wheelState.rotation + baseRotation + randomRotation;

    // Déterminer le segment gagnant
    const segmentAngle = 360 / segments.length;
    const normalizedRotation = (360 - (targetRotation % 360)) % 360;
    const winningIndex = Math.floor(normalizedRotation / segmentAngle);
    const winningSegment = segments[winningIndex] || segments[0];

    setWheelState(prev => ({
      ...prev,
      isSpinning: true,
      targetRotation,
      currentSegment: winningSegment
    }));

    // Animation avec RequestAnimationFrame
    const startTime = Date.now();
    startTimeRef.current = startTime;

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / theme.animation.duration, 1);

      // Fonction d'easing - ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentRotation = wheelState.rotation + (targetRotation - wheelState.rotation) * easeProgress;

      setWheelState(prev => ({
        ...prev,
        rotation: currentRotation
      }));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation terminée
        setWheelState(prev => ({
          ...prev,
          isSpinning: false,
          rotation: targetRotation
        }));

        // Déclencher le callback de résultat
        if (onResult && winningSegment) {
          setTimeout(() => onResult(winningSegment), 500);
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [wheelState, segments, theme, onResult, disabled]);

  const reset = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setWheelState({
      isSpinning: false,
      rotation: 0,
      targetRotation: 0,
      currentSegment: null
    });
  }, []);

  return {
    wheelState,
    spin,
    reset
  };
};
