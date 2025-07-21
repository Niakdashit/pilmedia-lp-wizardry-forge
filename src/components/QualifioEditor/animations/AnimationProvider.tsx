
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AnimationConfig, TextAnimationConfig, ImageAnimationConfig } from './types';

interface AnimationState {
  textAnimations: Record<string, TextAnimationConfig>;
  imageAnimations: Record<string, ImageAnimationConfig>;
  globalAnimationsEnabled: boolean;
  reducedMotion: boolean;
  isPlaying: boolean;
}

interface AnimationContextType {
  state: AnimationState;
  updateTextAnimation: (id: string, config: Partial<TextAnimationConfig>) => void;
  updateImageAnimation: (id: string, config: Partial<ImageAnimationConfig>) => void;
  toggleGlobalAnimations: () => void;
  playAnimations: () => void;
  stopAnimations: () => void;
  resetAnimations: () => void;
}

const AnimationContext = createContext<AnimationContextType | null>(null);

export const useAnimations = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimations must be used within an AnimationProvider');
  }
  return context;
};

interface AnimationProviderProps {
  children: React.ReactNode;
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({ children }) => {
  const [state, setState] = useState<AnimationState>({
    textAnimations: {},
    imageAnimations: {},
    globalAnimationsEnabled: true,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    isPlaying: false
  });

  const updateTextAnimation = useCallback((id: string, config: Partial<TextAnimationConfig>) => {
    setState(prev => ({
      ...prev,
      textAnimations: {
        ...prev.textAnimations,
        [id]: {
          ...prev.textAnimations[id],
          ...config
        } as TextAnimationConfig
      }
    }));
  }, []);

  const updateImageAnimation = useCallback((id: string, config: Partial<ImageAnimationConfig>) => {
    setState(prev => ({
      ...prev,
      imageAnimations: {
        ...prev.imageAnimations,
        [id]: {
          ...prev.imageAnimations[id],
          ...config
        } as ImageAnimationConfig
      }
    }));
  }, []);

  const toggleGlobalAnimations = useCallback(() => {
    setState(prev => ({
      ...prev,
      globalAnimationsEnabled: !prev.globalAnimationsEnabled
    }));
  }, []);

  const playAnimations = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const stopAnimations = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const resetAnimations = useCallback(() => {
    setState(prev => ({
      ...prev,
      textAnimations: {},
      imageAnimations: {},
      isPlaying: false
    }));
  }, []);

  const contextValue: AnimationContextType = {
    state,
    updateTextAnimation,
    updateImageAnimation,
    toggleGlobalAnimations,
    playAnimations,
    stopAnimations,
    resetAnimations
  };

  return (
    <AnimationContext.Provider value={contextValue}>
      {children}
    </AnimationContext.Provider>
  );
};
