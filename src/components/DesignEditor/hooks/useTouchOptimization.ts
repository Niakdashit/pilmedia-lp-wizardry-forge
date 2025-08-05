import { useCallback, useMemo } from 'react';
import type { DeviceType } from '../../../utils/deviceDimensions';

interface TouchOptimizationConfig {
  selectedDevice: DeviceType;
  containerRef?: React.RefObject<HTMLElement>;
  zoom?: number;
}

interface TouchCalibration {
  offsetY: number;
  offsetX: number;
  precisionFactor: number;
  sensitivity: number;
  zoneMultiplier: number;
}

/**
 * Hook spécialisé pour l'optimisation des interactions tactiles sur mobile/tablette
 * Fournit des compensations et ajustements pour améliorer la précision du drag & drop
 */
export const useTouchOptimization = ({ selectedDevice, containerRef, zoom = 1 }: TouchOptimizationConfig) => {
  
  // Configuration des calibrages tactiles par appareil
  const touchCalibration = useMemo((): TouchCalibration => {
    switch (selectedDevice) {
      case 'mobile':
        return {
          offsetY: 45,        // Offset vertical pour éviter que l'élément soit caché sous le doigt
          offsetX: 0,         // Pas d'offset horizontal sur mobile
          precisionFactor: 0.98, // Facteur de précision légèrement réduit
          sensitivity: 1.3,   // Sensibilité augmentée pour les gestes de redimensionnement
          zoneMultiplier: 1.1 // Zone de détection élargie
        };
      case 'tablet':
        return {
          offsetY: 35,        // Offset plus petit sur tablette
          offsetX: 0,
          precisionFactor: 0.99,
          sensitivity: 1.2,
          zoneMultiplier: 1.05
        };
      default: // desktop
        return {
          offsetY: 0,         // Pas d'offset sur desktop
          offsetX: 0,
          precisionFactor: 1,
          sensitivity: 1,
          zoneMultiplier: 1
        };
    }
  }, [selectedDevice]);

  // Détecter si l'interaction est tactile
  const isTouchInteraction = useCallback((e: PointerEvent | React.PointerEvent) => {
    return e.pointerType === 'touch';
  }, []);

  // Calculer le zoom de manière robuste
  const calculateZoomScale = useCallback((container: HTMLElement): number => {
    const containerStyle = getComputedStyle(container);
    const transform = containerStyle.transform;
    let zoomScale = 1;
    
    if (transform && transform !== 'none') {
      // Méthode principale : parsing de la matrice transform
      const matrix = transform.match(/matrix\(([^)]+)\)/);
      if (matrix) {
        const values = matrix[1].split(',').map(v => parseFloat(v.trim()));
        zoomScale = values[0]; // Premier élément de la matrice = scale X
      }
    }
    
    // Méthode de fallback : vérifier les propriétés CSS scale
    if (zoomScale === 1) {
      const scaleMatch = containerStyle.transform.match(/scale\(([^)]+)\)/);
      if (scaleMatch) {
        zoomScale = parseFloat(scaleMatch[1]);
      }
    }
    
    return zoomScale;
  }, []);

  // Calculer les paddings adaptatifs selon l'appareil et le zoom
  const getAdaptivePadding = useCallback(() => {
    if (selectedDevice === 'tablet') {
      return zoom <= 0.7 ? { top: 40, left: 20 } : { top: 60, left: 32 };
    } else if (selectedDevice === 'mobile') {
      return zoom <= 0.7 ? { top: 24, left: 16 } : { top: 40, left: 24 };
    }
    return { top: zoom <= 0.7 ? 8 : 32, left: zoom <= 0.7 ? 8 : 32 };
  }, [selectedDevice, zoom]);

  // Convertir les coordonnées avec compensation tactile
  const convertToCanvasCoordinates = useCallback((
    clientX: number,
    clientY: number,
    isTouch: boolean = false
  ): { x: number; y: number } => {
    if (!containerRef?.current) {
      return { x: clientX, y: clientY };
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const zoomScale = calculateZoomScale(containerRef.current);
    const adaptivePadding = getAdaptivePadding();

    // Position de base avec compensation du padding adaptatif
    let canvasX = (clientX - containerRect.left - adaptivePadding.left) / zoomScale;
    let canvasY = (clientY - containerRect.top - adaptivePadding.top) / zoomScale;

    // 📱 Appliquer la compensation tactile si nécessaire
    if (isTouch && selectedDevice !== 'desktop') {
      canvasY -= touchCalibration.offsetY;
      canvasX -= touchCalibration.offsetX;
      
      canvasX *= touchCalibration.precisionFactor;
      canvasY *= touchCalibration.precisionFactor;
    }

    return { x: canvasX, y: canvasY };
  }, [containerRef, selectedDevice, touchCalibration, calculateZoomScale, getAdaptivePadding]);

  // Ajuster les dimensions pour les interactions tactiles
  const adjustDimensionsForTouch = useCallback((
    width: number,
    height: number,
    isTouch: boolean = false
  ): { width: number; height: number } => {
    if (!isTouch || selectedDevice === 'desktop') {
      return { width, height };
    }

    return {
      width: width * touchCalibration.zoneMultiplier,
      height: height * touchCalibration.zoneMultiplier
    };
  }, [selectedDevice, touchCalibration]);

  // Appliquer la sensibilité tactile aux deltas de mouvement
  const applyTouchSensitivity = useCallback((
    deltaX: number,
    deltaY: number,
    isTouch: boolean = false
  ): { deltaX: number; deltaY: number } => {
    if (!isTouch || selectedDevice === 'desktop') {
      return { deltaX, deltaY };
    }

    return {
      deltaX: deltaX * touchCalibration.sensitivity,
      deltaY: deltaY * touchCalibration.sensitivity
    };
  }, [selectedDevice, touchCalibration]);

  // Vérifier si l'appareil supporte les interactions tactiles
  const isTouchDevice = useMemo(() => {
    return selectedDevice === 'mobile' || selectedDevice === 'tablet';
  }, [selectedDevice]);

  // Obtenir les paramètres de debug pour le calibrage
  const getDebugInfo = useCallback(() => {
    return {
      device: selectedDevice,
      calibration: touchCalibration,
      isTouchDevice,
      zoomScale: containerRef?.current ? calculateZoomScale(containerRef.current) : 1
    };
  }, [selectedDevice, touchCalibration, isTouchDevice, containerRef, calculateZoomScale]);

  return {
    // Méthodes principales
    isTouchInteraction,
    convertToCanvasCoordinates,
    adjustDimensionsForTouch,
    applyTouchSensitivity,
    calculateZoomScale,
    
    // Configuration
    touchCalibration,
    isTouchDevice,
    
    // Debug
    getDebugInfo
  };
};

export type TouchOptimizationHook = ReturnType<typeof useTouchOptimization>;
