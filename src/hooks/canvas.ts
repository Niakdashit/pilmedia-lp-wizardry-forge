// @ts-nocheck
// Canvas perspective and origin hooks for TemplatedQuiz component

import { useState, useCallback } from 'react';

// Hook for managing canvas perspective origin
export const useCanvasPerspectiveOrigin = () => {
  const [perspectiveOrigin, setPerspectiveOrigin] = useState({ x: 50, y: 50 });
  
  return perspectiveOrigin;
};

// Hook for setting canvas perspective origin
export const useSetCanvasPerspectiveOrigin = () => {
  const [perspectiveOrigin, setPerspectiveOrigin] = useState({ x: 50, y: 50 });
  
  const setOrigin = useCallback((origin: { x: number; y: number }) => {
    setPerspectiveOrigin(origin);
  }, []);
  
  return setOrigin;
};
