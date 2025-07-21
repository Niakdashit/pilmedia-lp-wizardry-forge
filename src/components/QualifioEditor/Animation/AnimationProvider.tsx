
import React, { createContext, useContext, useState } from 'react';

interface AnimationContextType {
  isAnimationEnabled: boolean;
  setAnimationEnabled: (enabled: boolean) => void;
  globalAnimationSpeed: number;
  setGlobalAnimationSpeed: (speed: number) => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

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
  const [isAnimationEnabled, setAnimationEnabled] = useState(true);
  const [globalAnimationSpeed, setGlobalAnimationSpeed] = useState(1);

  const value = {
    isAnimationEnabled,
    setAnimationEnabled,
    globalAnimationSpeed,
    setGlobalAnimationSpeed
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};
