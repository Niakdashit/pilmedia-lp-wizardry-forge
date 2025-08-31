import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { WheelSegment, WheelTheme } from '../types';

// Constants
const BASE_ROTATION = 1080; // 3 full rotations
const POINTER_ANGLE_DEG = -90; // Pointer is at top (-90 degrees)
const EPSILON = 0.0001; // Small offset to avoid landing exactly on the edge

// Types
interface UseWheelAnimationProps {
  segments: WheelSegment[];
  onResult?: (segment: WheelSegment) => void;
  disabled?: boolean;
  speed?: 'slow' | 'normal' | 'fast';
  spinMode?: 'random' | 'probability' | 'instant_winner';
  winProbability?: number;
  theme?: Partial<WheelTheme>;
}

interface WheelState {
  isSpinning: boolean;
  rotation: number;
  targetRotation: number;
  currentSegment: WheelSegment | null;
}

// Default theme values if not provided
const defaultTheme: WheelTheme = {
  name: 'default',
  colors: {
    primary: '#4f46e5',
    secondary: '#7c3aed',
    accent: '#8b5cf6',
    background: '#ffffff',
    border: '#e5e7eb',
    text: '#111827'
  },
  effects: {
    gradient: false,
    glow: false,
    shadow: false,
    metallic: false
  },
  animation: {
    duration: 3000,
    easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)',
    particles: false
  }
};

export const useWheelAnimation = (props: UseWheelAnimationProps) => {
  // Destructure props with defaults
  const {
    segments = [],
    onResult,
    disabled = false,
    speed = 'normal',
    spinMode = 'random',
    winProbability = 0.5,
    theme: customTheme = {}
  } = props;

  // State for wheel animation
  const [wheelState, setWheelState] = useState<WheelState>({
    isSpinning: false,
    rotation: 0,
    targetRotation: 0,
    currentSegment: null
  });

  // Refs for animation and state management
  const animationRef = useRef<number | null>(null);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const completedRef = useRef<boolean>(false);
  const runIdRef = useRef<number>(0);
  const targetRotationRef = useRef<number>(0);
  const rotationRef = useRef<number>(0);
  const startRotationRef = useRef<number>(0);
  const lastLogRef = useRef<number>(0);

  // Merge custom theme with default theme
  const theme = useMemo<WheelTheme>(() => ({
    ...defaultTheme,
    ...customTheme,
    colors: {
      ...defaultTheme.colors,
      ...(customTheme.colors || {})
    },
    effects: {
      ...defaultTheme.effects,
      ...(customTheme.effects || {})
    },
    animation: {
      ...defaultTheme.animation,
      ...(customTheme.animation || {})
    }
  }), [customTheme]);

  // Keep rotation ref in sync with state
  useEffect(() => {
    rotationRef.current = wheelState.rotation;
  }, [wheelState.rotation]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      if (fallbackTimerRef.current !== null) {
        clearTimeout(fallbackTimerRef.current);
      }
    };
  }, []);

  // Get duration based on speed
  const getDuration = useCallback((): number => {
    switch (speed) {
      case 'slow': return 5000;
      case 'fast': return 2000;
      case 'normal':
      default:
        return theme.animation?.duration || 3000;
    }
  }, [speed, theme.animation?.duration]);

  // Check if a label is a losing label
  const isLosingLabel = useCallback((label: string): boolean => {
    const l = (label || '').toLowerCase();
    return (
      l.includes('dommage') ||
      l.includes('rejouer') ||
      l.includes('perdu') ||
      l.includes('essaie')
    );
  }, []);

  const spin = useCallback((): void => {
    if (wheelState.isSpinning || disabled || segments.length === 0) return;

    // Clear any existing animation frame or timer
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (fallbackTimerRef.current !== null) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }

    const currentRunId = ++runIdRef.current;
    const duration = getDuration();
    const segmentAngle = 360 / segments.length;
    
    let targetIndex = 0;
    
    // Vérifier d'abord si un segment a une probabilité de 100%
    const guaranteedWinSegment = segments.find(segment => segment.probability === 100);
    
    if (guaranteedWinSegment) {
      // Si un segment a 100% de probabilité, le sélectionner systématiquement
      targetIndex = segments.indexOf(guaranteedWinSegment);
    } 
    // Si aucun segment n'a 100% de probabilité, utiliser la logique normale
    else if (spinMode === 'probability') {
      // En mode probabilité, utiliser la probabilité de gain fournie
      const isWin = Math.random() < (winProbability || 0.5);
      const winningSegments = segments.filter(segment => !isLosingLabel(segment.label));
      const losingSegments = segments.filter(segment => isLosingLabel(segment.label));
      
      if (isWin && winningSegments.length > 0) {
        targetIndex = segments.indexOf(winningSegments[Math.floor(Math.random() * winningSegments.length)]);
      } else if (losingSegments.length > 0) {
        targetIndex = segments.indexOf(losingSegments[Math.floor(Math.random() * losingSegments.length)]);
      }
    } else if (spinMode === 'instant_winner') {
      // En mode gagnant instantané, toujours sélectionner un segment gagnant s'il est disponible
      const winningSegments = segments.filter(segment => !isLosingLabel(segment.label));
      if (winningSegments.length > 0) {
        targetIndex = segments.indexOf(winningSegments[Math.floor(Math.random() * winningSegments.length)]);
      }
    } else {
      // En mode aléatoire, sélectionner n'importe quel segment
      targetIndex = Math.floor(Math.random() * segments.length);
    }
    
    // Calculate the target rotation
    const desiredNormalizedAngle = targetIndex * segmentAngle + segmentAngle / 2;
    const currentRotation = rotationRef.current;
    const currentMod = ((currentRotation % 360) + 360) % 360;
    const desiredMod = ((POINTER_ANGLE_DEG - (desiredNormalizedAngle + EPSILON)) % 360 + 360) % 360;
    let delta = desiredMod - currentMod;
    if (delta < 0) delta += 360;
    const targetRotation = currentRotation + BASE_ROTATION + delta;
    
    // Store the winning segment for later use
    const winningSegment = segments[targetIndex];
    
    // Update state with the target rotation and mark as spinning
    setWheelState(prev => ({
      ...prev,
      isSpinning: true,
      targetRotation,
      currentSegment: winningSegment
    }));

    // Store the start rotation and target rotation in refs
    startRotationRef.current = currentRotation;
    targetRotationRef.current = targetRotation;
    startTimeRef.current = performance.now();
    
    // Animation frame callback
    const animate = (currentTime: number) => {
      if (currentRunId !== runIdRef.current) return; // Cancel if a new spin started
      
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOutCubic(progress);
      
      // Calculate new rotation
      const newRotation = startRotationRef.current + 
        (targetRotationRef.current - startRotationRef.current) * easedProgress;
      
      // Update rotation ref and state
      rotationRef.current = newRotation;
      setWheelState(prev => ({
        ...prev,
        rotation: newRotation
      }));
      
      // Continue animation if not complete
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        setWheelState(prev => ({
          ...prev,
          isSpinning: false,
          rotation: targetRotationRef.current
        }));
        
        // Call onResult callback with the winning segment
        if (onResult && winningSegment) {
          onResult(winningSegment);
        }
        
        // Clean up
        if (fallbackTimerRef.current !== null) {
          clearTimeout(fallbackTimerRef.current);
          fallbackTimerRef.current = null;
        }
      }
    };
    
    // Start the animation
    animationRef.current = requestAnimationFrame(animate);
    
    // Fallback in case requestAnimationFrame doesn't fire
    fallbackTimerRef.current = setTimeout(() => {
      if (currentRunId !== runIdRef.current) return; // Ignore if a new spin started
      
      // Force complete the animation
      setWheelState(prev => ({
        ...prev,
        isSpinning: false,
        rotation: targetRotationRef.current
      }));
      
      // Call onResult callback with the winning segment
      if (onResult && winningSegment) {
        onResult(winningSegment);
      }
      
      // Clean up
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }, duration + 1000); // Add 1s buffer to the duration
  }, [
    segments,
    onResult,
    disabled,
    spinMode,
    winProbability,
    wheelState.isSpinning,
    getDuration,
    isLosingLabel
  ]);
  
  // Reset the wheel to its initial state
  const reset = useCallback((): void => {
    if (wheelState.isSpinning || disabled || segments.length === 0) {
      return;
    }

    // Cancel any previous animation/timer
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (fallbackTimerRef.current !== null) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    
    // Increment run ID to cancel any in-progress animations
    runIdRef.current += 1;
    
    // Reset state
    setWheelState({
      isSpinning: false,
      rotation: 0,
      targetRotation: 0,
      currentSegment: null
    });
    
    // Reset refs
    rotationRef.current = 0;
    targetRotationRef.current = 0;
    startRotationRef.current = 0;
    startTimeRef.current = 0;
    completedRef.current = false;
    lastLogRef.current = 0;
  }, [wheelState.isSpinning, disabled, segments.length]);

  // Return the hook's API
  return useMemo(() => ({
    ...wheelState,
    spin,
    reset
  }), [wheelState, spin, reset]);
};
