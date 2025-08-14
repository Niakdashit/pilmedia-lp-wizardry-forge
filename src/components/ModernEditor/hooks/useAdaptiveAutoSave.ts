import { useCallback, useRef, useState, useEffect } from 'react';
import { debounce } from 'lodash-es';

interface AutoSaveState {
  isSaving: boolean;
  lastSaved: number;
  pendingChanges: boolean;
  saveCount: number;
  errorCount: number;
  adaptiveDelay: number;
}

interface UserActivity {
  timestamp: number;
  type: 'typing' | 'drag' | 'click' | 'idle';
  intensity: number; // 0-1, où 1 = très actif
}

interface AdaptiveAutoSaveOptions {
  onSave: (data: any) => Promise<void>;
  onError?: (error: Error) => void;
  onSaveSuccess?: () => void;
  baseDelay?: number;
  minDelay?: number;
  maxDelay?: number;
  activityThreshold?: number;
  errorBackoffMultiplier?: number;
}

export const useAdaptiveAutoSave = <T>({
  onSave,
  onError,
  onSaveSuccess,
  baseDelay = 2000,
  minDelay = 500,
  maxDelay = 10000,
  activityThreshold = 0.7,
  errorBackoffMultiplier = 2
}: AdaptiveAutoSaveOptions) => {
  
  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: 0,
    pendingChanges: false,
    saveCount: 0,
    errorCount: 0,
    adaptiveDelay: baseDelay
  });

  const dataRef = useRef<T>();
  const activityHistoryRef = useRef<UserActivity[]>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  // Analyser l'activité utilisateur pour adapter le délai
  const analyzeUserActivity = useCallback((): number => {
    const now = Date.now();
    const recentActivity = activityHistoryRef.current.filter(
      activity => now - activity.timestamp < 30000 // 30 secondes
    );

    if (recentActivity.length === 0) return 0;

    // Calculer l'intensité moyenne récente
    const averageIntensity = recentActivity.reduce((sum, activity) => 
      sum + activity.intensity, 0) / recentActivity.length;

    // Calculer la fréquence d'activité
    const activityFrequency = recentActivity.length / 30; // activités par seconde

    // Score combiné (0-1)
    return Math.min(1, averageIntensity * 0.7 + activityFrequency * 0.3);
  }, []);

  // Calculer le délai adaptatif basé sur l'activité
  const calculateAdaptiveDelay = useCallback((): number => {
    const activityScore = analyzeUserActivity();
    const timeSinceLastActivity = Date.now() - lastActivityRef.current;
    
    let adaptiveDelay = baseDelay;

    // Si l'utilisateur est très actif, augmenter le délai pour éviter les sauvegardes trop fréquentes
    if (activityScore > activityThreshold) {
      adaptiveDelay = Math.min(maxDelay, baseDelay * (1 + activityScore));
    }
    // Si l'utilisateur est peu actif, réduire le délai pour sauvegarder rapidement
    else if (activityScore < 0.3) {
      adaptiveDelay = Math.max(minDelay, baseDelay * 0.5);
    }

    // Si pas d'activité récente, sauvegarder immédiatement
    if (timeSinceLastActivity > 5000) { // 5 secondes d'inactivité
      adaptiveDelay = minDelay;
    }

    // Appliquer le backoff en cas d'erreurs
    if (state.errorCount > 0) {
      adaptiveDelay *= Math.pow(errorBackoffMultiplier, Math.min(state.errorCount, 3));
    }

    return Math.max(minDelay, Math.min(maxDelay, adaptiveDelay));
  }, [analyzeUserActivity, baseDelay, minDelay, maxDelay, activityThreshold, state.errorCount, errorBackoffMultiplier]);

  // Enregistrer l'activité utilisateur
  const recordActivity = useCallback((type: UserActivity['type'], intensity: number = 0.5) => {
    const now = Date.now();
    lastActivityRef.current = now;
    
    activityHistoryRef.current.push({
      timestamp: now,
      type,
      intensity: Math.max(0, Math.min(1, intensity))
    });

    // Garder seulement les 100 dernières activités
    if (activityHistoryRef.current.length > 100) {
      activityHistoryRef.current = activityHistoryRef.current.slice(-100);
    }
  }, []);

  // Fonction de sauvegarde avec retry intelligent
  const performSave = useCallback(async (data: T): Promise<void> => {
    setState(prev => ({ ...prev, isSaving: true }));

    try {
      await onSave(data);
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: Date.now(),
        pendingChanges: false,
        saveCount: prev.saveCount + 1,
        errorCount: 0, // Reset error count on success
        adaptiveDelay: calculateAdaptiveDelay()
      }));

      onSaveSuccess?.();
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSaving: false,
        errorCount: prev.errorCount + 1,
        adaptiveDelay: calculateAdaptiveDelay()
      }));

      onError?.(error as Error);
      
      // Retry automatique avec backoff exponentiel
      if (state.errorCount < 3) {
        const retryDelay = Math.min(30000, 1000 * Math.pow(2, state.errorCount));
        setTimeout(() => {
          if (dataRef.current) {
            performSave(dataRef.current);
          }
        }, retryDelay);
      }
    }
  }, [onSave, onSaveSuccess, onError, calculateAdaptiveDelay, state.errorCount]);

  // Sauvegarde différée avec délai adaptatif
  const debouncedSave = useCallback(
    debounce((data: T) => {
      if (data) {
        performSave(data);
      }
    }, state.adaptiveDelay),
    [performSave, state.adaptiveDelay]
  );

  // Mettre à jour les données et déclencher la sauvegarde
  const updateData = useCallback((newData: T, activityType: UserActivity['type'] = 'click', intensity: number = 0.5) => {
    dataRef.current = newData;
    
    // Enregistrer l'activité
    recordActivity(activityType, intensity);
    
    setState(prev => ({
      ...prev,
      pendingChanges: true,
      adaptiveDelay: calculateAdaptiveDelay()
    }));

    // Annuler la sauvegarde précédente et programmer la nouvelle
    debouncedSave.cancel();
    
    // Recréer le debounce avec le nouveau délai
    const newDebouncedSave = debounce((data: T) => {
      if (data) {
        performSave(data);
      }
    }, calculateAdaptiveDelay());

    newDebouncedSave(newData);
  }, [recordActivity, calculateAdaptiveDelay, debouncedSave, performSave]);

  // Sauvegarde forcée immédiate
  const forceSave = useCallback(async (): Promise<void> => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    debouncedSave.cancel();

    if (dataRef.current) {
      await performSave(dataRef.current);
    }
  }, [debouncedSave, performSave]);

  // Détection automatique d'inactivité pour sauvegarde
  useEffect(() => {
    const checkInactivity = () => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      
      // Si inactif depuis 3 secondes et qu'il y a des changements en attente
      if (timeSinceLastActivity > 3000 && state.pendingChanges && !state.isSaving) {
        if (dataRef.current) {
          performSave(dataRef.current);
        }
      }
    };

    const inactivityInterval = setInterval(checkInactivity, 1000);
    
    return () => {
      clearInterval(inactivityInterval);
    };
  }, [state.pendingChanges, state.isSaving, performSave]);

  // Sauvegarde avant fermeture de page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.pendingChanges) {
        e.preventDefault();
        e.returnValue = 'Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?';
        
        // Tentative de sauvegarde synchrone (limitée par les navigateurs)
        if (dataRef.current) {
          navigator.sendBeacon?.('/api/autosave', JSON.stringify(dataRef.current));
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && state.pendingChanges && dataRef.current) {
        // Sauvegarde quand l'onglet devient invisible
        forceSave();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.pendingChanges, forceSave]);

  // Nettoyage
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  return {
    // État
    ...state,
    
    // Méthodes principales
    updateData,
    forceSave,
    recordActivity,
    
    // Utilitaires
    getActivityScore: analyzeUserActivity,
    getCurrentDelay: calculateAdaptiveDelay,
    
    // Stats
    getStats: () => ({
      saveCount: state.saveCount,
      errorCount: state.errorCount,
      averageDelay: state.adaptiveDelay,
      activityScore: analyzeUserActivity(),
      timeSinceLastSave: Date.now() - state.lastSaved
    })
  };
};
