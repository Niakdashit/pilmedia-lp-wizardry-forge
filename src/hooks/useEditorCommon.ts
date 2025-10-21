import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from '@/lib/router-adapter';
import { useUndoRedo } from './useUndoRedo';
import { useGroupManager } from './useGroupManager';
import { useEditorPreviewSync } from './useEditorPreviewSync';
import { getDeviceDimensions } from '../utils/deviceDimensions';
import { getEditorDeviceOverride } from '@/utils/deviceOverrides';
import type { ModularPage, Module, ScreenId } from '@/types/modularEditor';
import { createEmptyModularPage } from '@/types/modularEditor';

/**
 * Détecte l'appareil physique de l'utilisateur
 */
const detectDevice = (): 'desktop' | 'tablet' | 'mobile' => {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

/**
 * Calcule le zoom par défaut selon l'appareil
 */
const getDefaultZoom = (device: 'desktop' | 'tablet' | 'mobile'): number => {
  const dims = getDeviceDimensions(device);
  const availableWidth = typeof window !== 'undefined' ? window.innerWidth - 400 : 1200;
  const calculatedZoom = Math.min(100, (availableWidth / dims.width) * 100);
  
  const savedZoom = typeof window !== 'undefined' 
    ? localStorage.getItem(`editorZoom_${device}`)
    : null;
  
  return savedZoom ? parseFloat(savedZoom) : Math.max(30, calculatedZoom);
};

export interface UseEditorCommonOptions {
  mode?: 'campaign' | 'template';
  campaignId?: string;
  hiddenTabs?: string[];
}

/**
 * Hook commun pour tous les éditeurs (Design, Scratch, Jackpot)
 * Factorize les états et logiques communes
 */
export const useEditorCommon = (options: UseEditorCommonOptions = {}) => {
  const { mode = 'campaign', campaignId, hiddenTabs } = options;
  const location = useLocation();
  const navigate = useNavigate();

  // ========== DEVICE & WINDOW ==========
  const [actualDevice, setActualDevice] = useState<'desktop' | 'tablet' | 'mobile'>(detectDevice());
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const isWindowMobile = windowSize.height > windowSize.width && windowSize.width < 768;
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>(actualDevice);

  // ========== CANVAS STATES ==========
  const [canvasElements, setCanvasElements] = useState<any[]>([]);
  const [canvasZoom, setCanvasZoom] = useState(getDefaultZoom(selectedDevice));
  const canvasRef = useRef<HTMLDivElement>(null);

  // ========== BACKGROUNDS ==========
  const defaultBackground = mode === 'template'
    ? { type: 'color' as const, value: '#4ECDC4' }
    : { type: 'color' as const, value: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)' };
  
  const [screenBackgrounds, setScreenBackgrounds] = useState<Record<'screen1' | 'screen2' | 'screen3', { type: 'color' | 'image'; value: string }>>({
    screen1: defaultBackground,
    screen2: defaultBackground,
    screen3: defaultBackground
  });
  
  const [canvasBackground, setCanvasBackground] = useState<{ type: 'color' | 'image'; value: string }>(defaultBackground);

  // ========== SCREEN & MODULES ==========
  const [currentScreen, setCurrentScreen] = useState<'screen1' | 'screen2' | 'screen3'>('screen1');
  const [modularPage, setModularPage] = useState<ModularPage>(createEmptyModularPage());
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const lastModuleSelectionRef = useRef<string | null>(null);
  
  const selectedModule: Module | null = useMemo(() => {
    if (!selectedModuleId) return null;
    const allModules = (Object.values(modularPage.screens) as Module[][]).flat();
    return allModules.find((module) => module.id === selectedModuleId) || null;
  }, [selectedModuleId, modularPage.screens]);

  // ========== SELECTION ==========
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [selectedElements, setSelectedElements] = useState<any[]>([]);

  // ========== SIDEBAR & PANELS ==========
  const [showEffectsInSidebar, setShowEffectsInSidebar] = useState(false);
  const [showAnimationsInSidebar, setShowAnimationsInSidebar] = useState(false);
  const [showPositionInSidebar, setShowPositionInSidebar] = useState(false);
  const [showDesignInSidebar, setShowDesignInSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('background');
  const sidebarRef = useRef<{ setActiveTab: (tab: string) => void }>(null);
  const [designColorContext, setDesignColorContext] = useState<'fill' | 'border' | 'text'>('fill');

  // ========== COLORS & PREVIEW ==========
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [showFunnel, setShowFunnel] = useState(false);
  const [previewButtonSide, setPreviewButtonSide] = useState<'left' | 'right'>(() =>
    (typeof window !== 'undefined' && localStorage.getItem('previewButtonSide') === 'left') ? 'left' : 'right'
  );

  // ========== UNDO/REDO ==========
  const {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory
  } = useUndoRedo({
    elements: canvasElements,
    onRestore: setCanvasElements
  });

  // ========== GROUP MANAGER ==========
  const {
    selectedGroupId,
    setSelectedGroupId,
    createGroup,
    ungroupElements,
    updateGroupElement
  } = useGroupManager({
    elements: canvasElements,
    onElementsChange: setCanvasElements,
    selectedElements,
    onAddToHistory: addToHistory
  });

  // ========== DEVICE CHANGE HANDLER ==========
  const handleDeviceChange = useCallback((device: 'desktop' | 'tablet' | 'mobile') => {
    setSelectedDevice(device);
    setCanvasZoom(getDefaultZoom(device));
  }, []);

  // ========== WINDOW RESIZE ==========
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ========== ZOOM PERSISTENCE ==========
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`editorZoom_${selectedDevice}`, canvasZoom.toString());
    }
  }, [canvasZoom, selectedDevice]);

  // ========== PREVIEW BUTTON SIDE PERSISTENCE ==========
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('previewButtonSide', previewButtonSide);
    }
  }, [previewButtonSide]);

  // ========== EFFECTIVE HIDDEN TABS ==========
  const effectiveHiddenTabs = useMemo(
    () => hiddenTabs ?? (mode === 'template' ? ['campaign', 'export', 'form'] : []),
    [hiddenTabs, mode]
  );

  return {
    // Device & Window
    actualDevice,
    setActualDevice,
    windowSize,
    isWindowMobile,
    selectedDevice,
    setSelectedDevice,
    handleDeviceChange,

    // Canvas
    canvasElements,
    setCanvasElements,
    canvasZoom,
    setCanvasZoom,
    canvasRef,

    // Backgrounds
    screenBackgrounds,
    setScreenBackgrounds,
    canvasBackground,
    setCanvasBackground,
    defaultBackground,

    // Screen & Modules
    currentScreen,
    setCurrentScreen,
    modularPage,
    setModularPage,
    selectedModuleId,
    setSelectedModuleId,
    selectedModule,
    lastModuleSelectionRef,

    // Selection
    selectedElement,
    setSelectedElement,
    selectedElements,
    setSelectedElements,

    // Sidebar & Panels
    showEffectsInSidebar,
    setShowEffectsInSidebar,
    showAnimationsInSidebar,
    setShowAnimationsInSidebar,
    showPositionInSidebar,
    setShowPositionInSidebar,
    showDesignInSidebar,
    setShowDesignInSidebar,
    activeTab,
    setActiveTab,
    sidebarRef,
    designColorContext,
    setDesignColorContext,

    // Colors & Preview
    extractedColors,
    setExtractedColors,
    showFunnel,
    setShowFunnel,
    previewButtonSide,
    setPreviewButtonSide,

    // Undo/Redo
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,

    // Group Manager
    selectedGroupId,
    setSelectedGroupId,
    createGroup,
    ungroupElements,
    updateGroupElement,

    // Misc
    effectiveHiddenTabs,
    location,
    navigate,
    mode
  };
};
