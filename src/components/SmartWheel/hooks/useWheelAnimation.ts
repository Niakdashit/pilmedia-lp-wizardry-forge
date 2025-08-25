
import { useState, useCallback, useRef } from 'react';
import { WheelSegment, WheelState, WheelTheme } from '../types';

interface UseWheelAnimationProps {
  segments: WheelSegment[];
  theme: WheelTheme;
  onResult?: (segment: WheelSegment) => void;
  disabled?: boolean;
  speed?: 'slow' | 'medium' | 'fast';
  spinMode?: 'random' | 'instant_winner' | 'probability';
  winProbability?: number;
}

export const useWheelAnimation = ({
  segments,
  theme,
  onResult,
  disabled = false,
  speed = 'medium',
  spinMode = 'random',
  winProbability
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

    // Helpers
    const segmentAngle = 360 / segments.length;
    const isLosingLabel = (label: string) => {
      const l = (label || '').toLowerCase();
      return (
        l.includes('dommage') ||
        l.includes('rejouer') ||
        l.includes('perdu') ||
        l.includes('essaie')
      );
    };

    const pickWeightedIndex = (weights: number[]): number => {
      const total = weights.reduce((sum, w) => sum + (isFinite(w) && w > 0 ? w : 0), 0);
      if (!isFinite(total) || total <= 0) {
        return Math.floor(Math.random() * segments.length);
      }
      let r = Math.random() * total;
      for (let i = 0; i < weights.length; i++) {
        const w = isFinite(weights[i]) && weights[i] > 0 ? weights[i] : 0;
        if (r < w) return i;
        r -= w;
      }
      return weights.length - 1;
    };

    // 3 tours minimum
    const baseRotation = 1080;

    // Choose the target segment index according to spin mode
    let targetIndex = 0;
    if (spinMode === 'probability') {
      const weights = segments.map((s) => (typeof s.probability === 'number' ? s.probability! : 1));
      try {
        const total = weights.reduce((a, b) => a + (isFinite(b) && b > 0 ? b : 0), 0);
        // eslint-disable-next-line no-console
        console.debug('[SmartWheel] probability weights', { weights, total, n: weights.length });
      } catch {}
      targetIndex = pickWeightedIndex(weights);
    } else if (spinMode === 'instant_winner') {
      const winners: number[] = [];
      const losers: number[] = [];
      segments.forEach((s, idx) => (isLosingLabel(s.label) ? losers.push(idx) : winners.push(idx)));
      const p = typeof winProbability === 'number' ? Math.max(0, Math.min(1, winProbability)) : 0.1;
      const shouldWin = Math.random() < p;

      let pool = shouldWin ? winners : losers;
      if (pool.length === 0) {
        pool = shouldWin ? losers : winners;
      }
      if (pool.length === 0) {
        targetIndex = Math.floor(Math.random() * segments.length);
      } else {
        // Weight within the selected pool using probability if present
        const weights = pool.map((idx) => (typeof segments[idx].probability === 'number' ? segments[idx].probability! : 1));
        const localPick = pickWeightedIndex(weights);
        targetIndex = pool[localPick] ?? pool[0];
      }
    } else {
      // random
      targetIndex = Math.floor(Math.random() * segments.length);
    }

    // Compute a target rotation that lands in the center of the target segment
    const desiredNormalizedAngle = targetIndex * segmentAngle + segmentAngle / 2; // [0..360)
    // Pointer is rendered at the TOP (-90°). Align the segment center with -90°.
    // Therefore, the wheel's rotation modulo 360 should be (270 - desiredNormalizedAngle) mod 360.
    const currentMod = ((wheelState.rotation % 360) + 360) % 360;
    const pointerOffsetDeg = 90; // compensate for top pointer orientation
    // Small bias to avoid any potential floating-point landing exactly on a boundary
    const epsilon = 0.0001;
    const desiredMod = ((360 - ((desiredNormalizedAngle + pointerOffsetDeg + epsilon) % 360)) + 360) % 360;
    let delta = desiredMod - currentMod;
    if (delta < 0) delta += 360;
    const targetRotation = wheelState.rotation + baseRotation + delta;

    try {
      // Minimal debug: helps verify alignment without being too noisy
      // eslint-disable-next-line no-console
      console.debug('[SmartWheel] targetIndex=%s segAngle=%s desired=%s desiredMod=%s currentMod=%s delta=%s targetRotation=%s',
        targetIndex, segmentAngle, desiredNormalizedAngle, desiredMod, currentMod, delta, targetRotation);
    } catch {}

    const winningSegment = segments[targetIndex] || segments[0];
    try {
      // eslint-disable-next-line no-console
      console.debug('[SmartWheel] chosen', {
        targetIndex,
        id: (winningSegment as any)?.id,
        label: (winningSegment as any)?.label,
        prizeId: (winningSegment as any)?.prizeId,
        probability: (winningSegment as any)?.probability
      });
    } catch {}

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
      const baseDuration = theme?.animation?.duration ?? 3000;
      const speedFactor = speed === 'slow' ? 1.5 : speed === 'fast' ? 0.7 : 1.0;
      const effectiveDuration = Math.max(500, baseDuration * speedFactor);
      const progress = Math.min(elapsed / effectiveDuration, 1);

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
  }, [wheelState, segments, theme, onResult, disabled, speed, spinMode, winProbability]);

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
