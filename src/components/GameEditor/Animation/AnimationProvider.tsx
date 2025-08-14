import React, { createContext, useContext, useState, useCallback } from 'react';

export interface AnimationState {
  isPlaying: boolean;
  currentTimeline: string | null;
  globalDelay: number;
  reducedMotion: boolean;
}

export interface AnimationContextValue {
  state: AnimationState;
  playAnimation: (elementId: string, animation: any) => void;
  stopAnimation: (elementId: string) => void;
  playTimeline: (timelineId: string) => void;
  setGlobalDelay: (delay: number) => void;
  setReducedMotion: (enabled: boolean) => void;
}

const AnimationContext = createContext<AnimationContextValue | null>(null);

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};

interface AnimationProviderProps {
  children: React.ReactNode;
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({ children }) => {
  const [state, setState] = useState<AnimationState>({
    isPlaying: false,
    currentTimeline: null,
    globalDelay: 0,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  });

  const playAnimation = useCallback((elementId: string, animation: any) => {
    console.log(`Playing animation for element ${elementId}:`, animation);
    setState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const stopAnimation = useCallback((elementId: string) => {
    console.log(`Stopping animation for element ${elementId}`);
  }, []);

  const playTimeline = useCallback((timelineId: string) => {
    console.log(`Playing timeline ${timelineId}`);
    setState(prev => ({ ...prev, currentTimeline: timelineId, isPlaying: true }));
  }, []);

  const setGlobalDelay = useCallback((delay: number) => {
    setState(prev => ({ ...prev, globalDelay: delay }));
  }, []);

  const setReducedMotion = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, reducedMotion: enabled }));
  }, []);

  const value: AnimationContextValue = {
    state,
    playAnimation,
    stopAnimation,
    playTimeline,
    setGlobalDelay,
    setReducedMotion
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};