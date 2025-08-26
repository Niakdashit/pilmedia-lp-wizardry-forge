
import { useState, useCallback, useRef, useEffect } from 'react';
import { WheelSegment, WheelState, WheelTheme } from '../types';
import { pickWeightedIndex } from '../../../utils/weightedPicker';

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
  const completedRef = useRef<boolean>(false);
  const fallbackTimerRef = useRef<number | null>(null);
  const startRotationRef = useRef<number>(0);
  const targetRotationRef = useRef<number>(0);
  const rotationRef = useRef<number>(0);
  // Track the "run" to avoid stale callbacks finalizing a previous spin
  const runIdRef = useRef<number>(0);
  // Throttle very verbose logs
  const lastLogRef = useRef<number>(0);

  // keep a mirror of rotation to read synchronously without depending on state in closures
  useEffect(() => {
    rotationRef.current = wheelState.rotation;
  }, [wheelState.rotation]);

  const spin = useCallback(() => {
    if (wheelState.isSpinning || disabled || segments.length === 0) return;

    // Cancel any previous animation/timer just in case
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }

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

    

    // 3 tours minimum
    const baseRotation = 1080;

    // Choose the target segment index according to spin mode
    let targetIndex = 0;
    if (spinMode === 'probability') {
      const weights = segments.map((s) => (typeof s.probability === 'number' ? s.probability! : 0));
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
    // Pointer is rendered at the TOP and points inward (angle -90° from +X axis).
    // We want: (rotation mod 360) == (-90° - desiredNormalizedAngle) mod 360
    startRotationRef.current = rotationRef.current;
    const currentMod = ((startRotationRef.current % 360) + 360) % 360;
    const pointerAngleDeg = -90;
    // Small bias to avoid any potential floating-point landing exactly on a boundary
    const epsilon = 0.0001;
    const desiredMod = ((pointerAngleDeg - (desiredNormalizedAngle + epsilon)) % 360 + 360) % 360;
    let delta = desiredMod - currentMod;
    if (delta < 0) delta += 360;
    const targetRotation = startRotationRef.current + baseRotation + delta;
    targetRotationRef.current = targetRotation;

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
    completedRef.current = false;
    runIdRef.current = startTime + Math.random();
    const runId = runIdRef.current; // capture for this spin
    lastLogRef.current = 0;

    // Precompute effective duration once for both RAF and fallback
    const baseDuration = theme?.animation?.duration ?? 3000;
    const speedFactor = speed === 'slow' ? 1.5 : speed === 'fast' ? 0.7 : 1.0;
    const effectiveDuration = Math.max(500, baseDuration * speedFactor);

    // Failsafe: ensure completion even if RAF is interrupted (tab switch, unmount glitches, etc.)
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }

    const finalize = () => {
      // Do not finalize if a new spin has started
      if (runIdRef.current !== runId) return;
      if (completedRef.current) return;
      completedRef.current = true;
      // Animation terminée / forcer l'état final
      setWheelState(prev => ({
        ...prev,
        isSpinning: false,
        rotation: targetRotationRef.current
      }));
      if (onResult && winningSegment) {
        setTimeout(() => onResult(winningSegment), 500);
      }
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };

    fallbackTimerRef.current = window.setTimeout(() => {
      if (runIdRef.current !== runId) return; // stale timeout, ignore
      try {
        // eslint-disable-next-line no-console
        console.warn('[SmartWheel] Fallback completion triggered');
      } catch {}
      finalize();
    }, effectiveDuration + 1000);

    const animate = () => {
      // Ignore stale callbacks from previous runs
      if (runIdRef.current !== runId) return;
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / effectiveDuration, 1);

      // Fonction d'easing - ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const startRot = startRotationRef.current;
      const endRot = targetRotationRef.current;
      const currentRotation = startRot + (endRot - startRot) * easeProgress;

      setWheelState(prev => ({
        ...prev,
        rotation: currentRotation
      }));

      // Throttled debug logs
      try {
        const DBG = (globalThis as any)?.__DEBUG_WHEEL_ANIM__;
        const now = currentTime;
        if (DBG && (lastLogRef.current === 0 || now - lastLogRef.current > 250)) {
          lastLogRef.current = now;
          // eslint-disable-next-line no-console
          console.debug('[SmartWheel] frame', {
            progress: Number(progress.toFixed(4)),
            ease: Number(easeProgress.toFixed(4)),
            currentRotation: Number(currentRotation.toFixed(3)),
            startRot: Number(startRot.toFixed(3)),
            endRot: Number(endRot.toFixed(3)),
            elapsed
          });
        }
      } catch {}

      // Additional completion guards
      const angleEps = 0.05; // degrees tolerance
      const nearTarget = Math.abs(currentRotation - endRot) <= angleEps;
      const overtime = elapsed > (effectiveDuration + 500);

      if (progress < 1) {
        if (!nearTarget && !overtime && runIdRef.current === runId) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // eslint-disable-next-line no-console
          try { console.debug('[SmartWheel] early finalize', { nearTarget, overtime, progress }); } catch {}
          finalize();
        }
      } else {
        finalize();
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [segments, theme, onResult, disabled, speed, spinMode, winProbability, wheelState.isSpinning]);

  const reset = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    completedRef.current = false;
    setWheelState({
      isSpinning: false,
      rotation: 0,
      targetRotation: 0,
      currentSegment: null
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };
  }, []);

  return {
    wheelState,
    spin,
    reset
  };
};
