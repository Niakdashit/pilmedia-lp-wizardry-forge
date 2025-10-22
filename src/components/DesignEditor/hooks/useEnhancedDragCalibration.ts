import { useCallback, useRef, useState, useEffect } from 'react';

interface DragCalibrationConfig {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  zoom: number;
  containerRef: React.RefObject<HTMLElement>;
}

interface CalibrationData {
  offsetX: number;
  offsetY: number;
  scaleX: number;
  scaleY: number;
  sensitivity: number;
  precision: number;
}

interface DragCoordinates {
  x: number;
  y: number;
  rawX: number;
  rawY: number;
  calibrated: boolean;
}

export const useEnhancedDragCalibration = ({
  deviceType,
  zoom,
  containerRef
}: DragCalibrationConfig) => {
  const [calibrationData, setCalibrationData] = useState<CalibrationData>({
    offsetX: 0,
    offsetY: 0,
    scaleX: 1,
    scaleY: 1,
    sensitivity: 1,
    precision: 1
  });

  const lastTouchRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const calibrationHistoryRef = useRef<Array<{ input: { x: number; y: number }, output: { x: number; y: number } }>>([]);

  // Calibrage dynamique selon l'appareil et le zoom
  useEffect(() => {
    const updateCalibration = () => {
      let newCalibration: CalibrationData;

      switch (deviceType) {
        case 'mobile':
          newCalibration = {
            offsetX: 0,
            offsetY: 0,
            scaleX: 1 / zoom,
            scaleY: 1 / zoom,
            sensitivity: 1,
            precision: 1
          };
          break;

        case 'tablet':
          newCalibration = {
            offsetX: 0,
            offsetY: 0,
            scaleX: 1 / zoom,
            scaleY: 1 / zoom,
            sensitivity: 1,
            precision: 1
          };
          break;

        default: // desktop
          newCalibration = {
            offsetX: 0,
            offsetY: 0,
            scaleX: 1 / zoom,
            scaleY: 1 / zoom,
            sensitivity: 1,
            precision: 1
          };
      }

      setCalibrationData(newCalibration);
      
      console.log('🎯 Drag Calibration updated:', {
        deviceType,
        zoom,
        calibration: newCalibration
      });
    };

    updateCalibration();
  }, [deviceType, zoom]);

  // Convertir les coordonnées avec calibrage avancé
  const convertDragCoordinates = useCallback((
    clientX: number,
    clientY: number,
    isTouch: boolean = false
  ): DragCoordinates => {
    if (!containerRef.current) {
      return {
        x: clientX,
        y: clientY,
        rawX: clientX,
        rawY: clientY,
        calibrated: false
      };
    }

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Coordonnées brutes relatives au container
    const rawX = clientX - rect.left;
    const rawY = clientY - rect.top;

    let calibratedX = rawX;
    let calibratedY = rawY;

    // Appliquer le calibrage pour les appareils tactiles
    if (isTouch && (deviceType === 'mobile' || deviceType === 'tablet')) {
      // Appliquer les offsets
      calibratedX -= calibrationData.offsetX;
      calibratedY -= calibrationData.offsetY;

      // Appliquer les facteurs d'échelle
      calibratedX *= calibrationData.scaleX;
      calibratedY *= calibrationData.scaleY;

      // Appliquer la sensibilité
      calibratedX *= calibrationData.sensitivity;
      calibratedY *= calibrationData.sensitivity;

      // Appliquer la précision (arrondi intelligent)
      if (calibrationData.precision < 1) {
        const precisionFactor = 1 / calibrationData.precision;
        calibratedX = Math.round(calibratedX * precisionFactor) / precisionFactor;
        calibratedY = Math.round(calibratedY * precisionFactor) / precisionFactor;
      }
    } else {
      // Pour desktop, appliquer seulement le zoom
      calibratedX *= calibrationData.scaleX;
      calibratedY *= calibrationData.scaleY;
    }

    // Enregistrer dans l'historique pour l'apprentissage adaptatif
    if (isTouch) {
      calibrationHistoryRef.current.push({
        input: { x: rawX, y: rawY },
        output: { x: calibratedX, y: calibratedY }
      });

      // Limiter l'historique
      if (calibrationHistoryRef.current.length > 100) {
        calibrationHistoryRef.current = calibrationHistoryRef.current.slice(-50);
      }
    }

    return {
      x: calibratedX,
      y: calibratedY,
      rawX,
      rawY,
      calibrated: isTouch && (deviceType !== 'desktop')
    };
  }, [containerRef, deviceType, calibrationData]);

  // Détecter si c'est un événement tactile
  const isTouchEvent = useCallback((event: any): boolean => {
    return (
      event.type.startsWith('touch') ||
      (event.pointerType && event.pointerType === 'touch') ||
      ('touches' in event && event.touches.length > 0)
    );
  }, []);

  // Filtrer les événements tactiles pour éviter les micro-mouvements
  const shouldProcessTouchEvent = useCallback((
    clientX: number,
    clientY: number,
    threshold: number = 2
  ): boolean => {
    const now = Date.now();
    const currentTouch = { x: clientX, y: clientY, time: now };

    if (!lastTouchRef.current) {
      lastTouchRef.current = currentTouch;
      return true;
    }

    const timeDiff = now - lastTouchRef.current.time;
    const distance = Math.sqrt(
      Math.pow(currentTouch.x - lastTouchRef.current.x, 2) +
      Math.pow(currentTouch.y - lastTouchRef.current.y, 2)
    );

    // Ignorer les micro-mouvements trop rapprochés
    if (timeDiff < 16 && distance < threshold) {
      return false;
    }

    lastTouchRef.current = currentTouch;
    return true;
  }, []);

  // Calculer la vitesse de déplacement pour l'inertie
  const calculateDragVelocity = useCallback((
    currentX: number,
    currentY: number
  ): { vx: number; vy: number } => {
    if (!lastTouchRef.current) {
      return { vx: 0, vy: 0 };
    }

    const timeDiff = Date.now() - lastTouchRef.current.time;
    if (timeDiff === 0) {
      return { vx: 0, vy: 0 };
    }

    const dx = currentX - lastTouchRef.current.x;
    const dy = currentY - lastTouchRef.current.y;

    return {
      vx: dx / timeDiff,
      vy: dy / timeDiff
    };
  }, []);

  // Optimiser les coordonnées pour le snap
  const optimizeForSnapping = useCallback((
    x: number,
    y: number,
    snapThreshold: number = 5
  ): { x: number; y: number } => {
    // Arrondir aux multiples de snapThreshold pour faciliter le snap
    const snappedX = Math.round(x / snapThreshold) * snapThreshold;
    const snappedY = Math.round(y / snapThreshold) * snapThreshold;

    return { x: snappedX, y: snappedY };
  }, []);

  // Diagnostics et debug
  const getDiagnostics = useCallback(() => {
    return {
      calibrationData,
      deviceType,
      zoom,
      historyLength: calibrationHistoryRef.current.length,
      lastTouch: lastTouchRef.current
    };
  }, [calibrationData, deviceType, zoom]);

  return {
    convertDragCoordinates,
    isTouchEvent,
    shouldProcessTouchEvent,
    calculateDragVelocity,
    optimizeForSnapping,
    getDiagnostics,
    calibrationData,
    isCalibrated: deviceType !== 'desktop'
  };
};
