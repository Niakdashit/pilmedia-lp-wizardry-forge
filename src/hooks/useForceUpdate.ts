
import { useState, useCallback } from 'react';

export const useForceUpdate = () => {
  const [, setUpdateTrigger] = useState(0);
  
  const forceUpdate = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
  }, []);
  
  return forceUpdate;
};
