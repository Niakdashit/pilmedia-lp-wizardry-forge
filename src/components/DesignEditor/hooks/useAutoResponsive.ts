import { useState, useCallback, useRef } from 'react';

export interface ResponsiveConfig {
  isAutoMode: boolean;
  isExpertMode: boolean;
  baseDevice: 'desktop' | 'tablet' | 'mobile';
  smartDefaults: boolean;
  autoDetectIssues: boolean;
}

export interface ResponsiveIssue {
  id: string;
  type: 'text-too-small' | 'element-overflow' | 'poor-contrast';
  device: 'desktop' | 'tablet' | 'mobile';
  message: string;
  element?: any;
  suggestion?: string;
}

export const useAutoResponsive = () => {
  const [config, setConfig] = useState<ResponsiveConfig>({
    isAutoMode: true,
    isExpertMode: false,
    baseDevice: 'desktop',
    smartDefaults: true,
    autoDetectIssues: true,
  });

  const [detectedIssues, setDetectedIssues] = useState<ResponsiveIssue[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const analysisRef = useRef<NodeJS.Timeout>();

  const toggleExpertMode = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      isExpertMode: !prev.isExpertMode,
      isAutoMode: !prev.isExpertMode ? false : true // Disable auto when enabling expert
    }));
  }, []);

  const updateConfig = useCallback((updates: Partial<ResponsiveConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const analyzeResponsiveIssues = useCallback((elements: any[], device: string) => {
    if (!config.autoDetectIssues) return;

    // Clear previous timeout
    if (analysisRef.current) {
      clearTimeout(analysisRef.current);
    }

    // Debounce analysis
    analysisRef.current = setTimeout(() => {
      setIsAnalyzing(true);
      const issues: ResponsiveIssue[] = [];

      elements.forEach((element, index) => {
        if (element.type === 'text') {
          // Check font size for mobile
          if (device === 'mobile' && parseInt(element.style?.fontSize || '16') < 14) {
            issues.push({
              id: `text-small-${index}`,
              type: 'text-too-small',
              device: device as any,
              message: `Le texte "${element.content}" est trop petit sur mobile`,
              element,
              suggestion: 'Augmenter la taille à au moins 14px'
            });
          }

          // Check if element overflows
          if (element.x + (element.width || 100) > getDeviceWidth(device)) {
            issues.push({
              id: `overflow-${index}`,
              type: 'element-overflow',
              device: device as any,
              message: `L'élément "${element.content || 'sans titre'}" dépasse l'écran`,
              element,
              suggestion: 'Réduire la taille ou repositionner'
            });
          }
        }
      });

      setDetectedIssues(issues);
      setIsAnalyzing(false);
    }, 500);
  }, [config.autoDetectIssues]);

  const getDeviceWidth = (device: string): number => {
    switch (device) {
      case 'mobile': return 520;
      case 'tablet': return 850;
      default: return 1200;
    }
  };

  const generateResponsiveProperties = useCallback((element: any, targetDevice: string) => {
    if (!config.smartDefaults) return element;

    const baseDevice = config.baseDevice;
    const scale = getResponsiveScale(baseDevice, targetDevice);

    return {
      ...element,
      style: {
        ...element.style,
        fontSize: element.style?.fontSize ? 
          `${Math.max(14, parseInt(element.style.fontSize) * scale)}px` : 
          element.style?.fontSize,
      },
      x: element.x * scale,
      y: element.y * scale,
      width: element.width ? element.width * scale : element.width,
      height: element.height ? element.height * scale : element.height,
    };
  }, [config.baseDevice, config.smartDefaults]);

  const getResponsiveScale = (from: string, to: string): number => {
    const sizes = {
      desktop: 1200,
      tablet: 850,
      mobile: 520
    };

    return sizes[to as keyof typeof sizes] / sizes[from as keyof typeof sizes];
  };

  const applyAutoResponsive = useCallback((elements: any[], targetDevice: string) => {
    if (!config.isAutoMode) return elements;

    return elements.map(element => 
      generateResponsiveProperties(element, targetDevice)
    );
  }, [config.isAutoMode, generateResponsiveProperties]);

  return {
    config,
    updateConfig,
    toggleExpertMode,
    detectedIssues,
    isAnalyzing,
    analyzeResponsiveIssues,
    applyAutoResponsive,
    generateResponsiveProperties,
  };
};