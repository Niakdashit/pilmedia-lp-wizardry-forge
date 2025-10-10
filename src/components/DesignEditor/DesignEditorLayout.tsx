import React, { useState, useMemo, useEffect, useRef, useCallback, lazy } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Save, X } from 'lucide-react';
const HybridSidebar = lazy(() => import('./HybridSidebar'));
const DesignToolbar = lazy(() => import('./DesignToolbar'));
import type { DesignModularPage, DesignScreenId, DesignModule } from '@/types/designEditorModular';
import { createEmptyDesignModularPage } from '@/types/designEditorModular';
import { SmartWheel } from '../SmartWheel';

import ZoomSlider from './components/ZoomSlider';
const DesignCanvas = lazy(() => import('./DesignCanvas'));
import { useEditorStore } from '../../stores/editorStore';
import { useKeyboardShortcuts } from '../ModernEditor/hooks/useKeyboardShortcuts';
import { useUndoRedo, useUndoRedoShortcuts } from '../../hooks/useUndoRedo';
import { useWheelConfigSync } from '../../hooks/useWheelConfigSync';
import { useGroupManager } from '../../hooks/useGroupManager';
import { getDeviceDimensions } from '../../utils/deviceDimensions';
import { getEditorDeviceOverride } from '@/utils/deviceOverrides';
import { useEditorPreviewSync } from '../../hooks/useEditorPreviewSync';


import { useCampaigns } from '@/hooks/useCampaigns';
import { createSaveAndContinueHandler, saveCampaignToDB } from '@/hooks/useModernCampaignEditor/saveHandler';

const KeyboardShortcutsHelp = lazy(() => import('../shared/KeyboardShortcutsHelp'));
const MobileStableEditor = lazy(() => import('./components/MobileStableEditor'));

interface DesignEditorLayoutProps {
  mode?: 'template' | 'campaign';
  hiddenTabs?: string[];
  allowWheelInteraction?: boolean;
}

const DESIGN_SCREEN_IDS: DesignScreenId[] = ['screen1', 'screen2', 'screen3'];

const normalizeDesignModularPage = (
  page: DesignModularPage,
  options?: { preserveTimestamp?: boolean }
): DesignModularPage => {
  const normalizedScreens: Record<DesignScreenId, DesignModule[]> = {
    screen1: [],
    screen2: [],
    screen3: []
  };

  const resolveScreen = (raw: any, fallback: DesignScreenId): DesignScreenId => {
    return DESIGN_SCREEN_IDS.includes(raw as DesignScreenId) ? (raw as DesignScreenId) : fallback;
  };

  DESIGN_SCREEN_IDS.forEach((screen) => {
    const modules = Array.isArray(page?.screens?.[screen]) ? page.screens[screen] : [];
    modules.forEach((module) => {
      const targetScreen = resolveScreen((module as any)?.screenId, screen);
      const normalizedModule = { ...module, screenId: targetScreen } as DesignModule & { screenId: DesignScreenId };
      normalizedScreens[targetScreen].push(normalizedModule);
    });
  });

  return {
    screens: normalizedScreens,
    _updatedAt: options?.preserveTimestamp && page?._updatedAt ? page._updatedAt : Date.now()
  };
};

const DesignEditorLayout: React.FC<DesignEditorLayoutProps> = ({ mode = 'campaign', hiddenTabs, allowWheelInteraction = false }) => {
  const navigate = useNavigate();
  // Détection automatique de l'appareil basée sur l'user-agent pour éviter le basculement lors du redimensionnement de fenêtre
  const detectDevice = (): 'desktop' | 'tablet' | 'mobile' => {
    const override = getEditorDeviceOverride();
    if (override) return override;
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    if (/Mobi|Android/i.test(ua)) return 'mobile';
    if (/Tablet|iPad/i.test(ua)) return 'tablet';
    return 'desktop';
  };

  // Détection de l'appareil physique réel (pour l'interface)
  const [actualDevice, setActualDevice] = useState<'desktop' | 'tablet' | 'mobile'>(detectDevice());
  
  // Détection de la taille de fenêtre pour la responsivité
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const isWindowMobile = windowSize.height > windowSize.width && windowSize.width < 768;

  // Zoom par défaut selon l'appareil
  const getDefaultZoom = (device: 'desktop' | 'tablet' | 'mobile'): number => {
    if (device === 'mobile' && typeof window !== 'undefined') {
      const { width, height } = getDeviceDimensions('mobile');
      const scale = Math.min(window.innerWidth / width, window.innerHeight / height);
      return Math.min(scale, 1);
    }
    switch (device) {
      case 'desktop':
        return 0.7; // 70%
      case 'tablet':
        return 0.55; // 55%
      case 'mobile':
        return 0.45; // 45% pour une meilleure visibilité sur mobile
      default:
        return 0.7;
    }
  };

  // Store centralisé pour l'optimisation
  const { 
    setCampaign,
    setPreviewDevice,
    setIsLoading,
    setIsModified
  } = useEditorStore();
  // Campagne centralisée (source de vérité pour les champs de contact)
  const campaignState = useEditorStore((s) => s.campaign);

  // Supabase campaigns API
  const { saveCampaign } = useCampaigns();

  // État local pour la compatibilité existante
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>(actualDevice);

  // Gestionnaire de changement d'appareil avec ajustement automatique du zoom
  const handleDeviceChange = (device: 'desktop' | 'tablet' | 'mobile') => {
    setSelectedDevice(device);
    setCanvasZoom(getDefaultZoom(device));
  };

  // États principaux
  const [canvasElements, setCanvasElements] = useState<any[]>([]);
  const [canvasBackground, setCanvasBackground] = useState<{ type: 'color' | 'image'; value: string }>(() => (
    mode === 'template'
      ? { type: 'color', value: '#4ECDC4' }
      : { type: 'color', value: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)' }
  ));
  const [canvasZoom, setCanvasZoom] = useState(getDefaultZoom(selectedDevice));

  // Multi-screen system states
  const [currentScreen, setCurrentScreen] = useState<DesignScreenId>('screen1');
  const [modularPage, setModularPage] = useState<DesignModularPage>(createEmptyDesignModularPage());
  // Module selection for configuration panels
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<DesignModule | null>(null);

  // Auto-assign screenId to elements without one
  useEffect(() => {
    if (!canvasElements.length) return;
    const hasMissingScreen = canvasElements.some((element: any) => !element?.screenId);
    if (!hasMissingScreen) return;

    setCanvasElements((prev: any[]) => {
      let mutated = false;
      const updated = prev.map((element: any) => {
        if (element?.screenId) return element;

        mutated = true;
        const role = typeof element?.role === 'string' ? element.role.toLowerCase() : '';
        if (role.includes('exit-message')) {
          return { ...element, screenId: 'screen3' as const };
        }
        if (
          role.includes('form') ||
          role.includes('contact') ||
          role.includes('lead') ||
          role.includes('info') ||
          role.includes('screen2')
        ) {
          return { ...element, screenId: 'screen2' as const };
        }
        return { ...element, screenId: 'screen1' as const };
      });

      return mutated ? updated : prev;
    });
  }, [canvasElements]);

  // Detect scroll position to determine current screen
  useEffect(() => {
    const canvasScrollArea = document.querySelector('.canvas-scroll-area') as HTMLElement | null;
    if (!canvasScrollArea) return;

    const anchors = Array.from(canvasScrollArea.querySelectorAll('[data-screen-anchor]')) as HTMLElement[];
    if (anchors.length === 0) return;

    const computeNearestScreen = () => {
      const areaRect = canvasScrollArea.getBoundingClientRect();
      const areaCenter = areaRect.top + areaRect.height / 2;

      let closestId: DesignScreenId = 'screen1';
      let closestDistance = Infinity;

      anchors.forEach((anchor) => {
        const screenId = (anchor.dataset.screenAnchor as DesignScreenId | undefined) ?? 'screen1';
        const rect = anchor.getBoundingClientRect();
        const anchorCenter = rect.top + rect.height / 2;
        const distance = Math.abs(anchorCenter - areaCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestId = screenId;
        }
      });

      setCurrentScreen((prev: DesignScreenId) => (prev === closestId ? prev : closestId));
    };

    requestAnimationFrame(computeNearestScreen);

    const handleScroll = () => {
      requestAnimationFrame(computeNearestScreen);
    };

    const handleResize = () => {
      requestAnimationFrame(computeNearestScreen);
    };

    canvasScrollArea.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      canvasScrollArea.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Synchronise l'état de l'appareil réel et sélectionné après le montage (corrige les différences entre Lovable et Safari)
  useEffect(() => {
    const device = detectDevice();
    setActualDevice(device);
    setSelectedDevice(device);
    setCanvasZoom(getDefaultZoom(device));
  }, []);

  // Détection de la taille de fenêtre
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  // Écouter l'événement de sélection de module depuis le canvas
  useEffect(() => {
    const handleModuleSelected = (event: Event) => {
      const customEvent = event as CustomEvent;
      const module = customEvent.detail?.module;
      if (module) {
        console.log('🎯 Module sélectionné depuis le canvas:', module);
        console.log('🎯 Type du module:', module.type);
        setSelectedModuleId(module.id);
        setSelectedModule(module);
        // Si c'est un BlocTexte, ouvrir l'onglet Design (background) pour éditer le texte
        // Sinon, ouvrir l'onglet Elements pour les autres modules
        if (module.type === 'BlocTexte') {
          console.log('✅ BlocTexte détecté - Ouverture onglet Design');
          // Forcer l'ouverture du panneau Design
          setShowDesignInSidebar(true);
          setShowEffectsInSidebar(false);
          setShowAnimationsInSidebar(false);
          setShowPositionInSidebar(false);
          // Ouvrir l'onglet background
          setTimeout(() => {
            sidebarRef.current?.setActiveTab('background');
          }, 0);
        } else {
          console.log('✅ Autre module détecté - Ouverture onglet Elements');
          sidebarRef.current?.setActiveTab('elements');
        }
      }
    };

    // Écouter les deux types d'événements pour compatibilité
    window.addEventListener('modularModuleSelected', handleModuleSelected);
    window.addEventListener('designModularModuleSelected', handleModuleSelected);
    return () => {
      window.removeEventListener('modularModuleSelected', handleModuleSelected);
      window.removeEventListener('designModularModuleSelected', handleModuleSelected);
    };
  }, []);

  // Ajuste automatiquement le zoom lors du redimensionnement sur mobile
  useEffect(() => {
    if (actualDevice === 'mobile') {
      const updateZoom = () => setCanvasZoom(getDefaultZoom('mobile'));
      window.addEventListener('resize', updateZoom);
      return () => window.removeEventListener('resize', updateZoom);
    }
  }, [actualDevice]);
  
  // Référence pour le canvas
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // État pour gérer l'affichage des panneaux dans la sidebar
  const [showEffectsInSidebar, setShowEffectsInSidebar] = useState(false);
  const [showAnimationsInSidebar, setShowAnimationsInSidebar] = useState(false);
  const [showPositionInSidebar, setShowPositionInSidebar] = useState(false);
  const [showDesignInSidebar, setShowDesignInSidebar] = useState(false);
  // Référence pour contrôler l'onglet actif dans HybridSidebar
  const sidebarRef = useRef<{ setActiveTab: (tab: string) => void }>(null); // Nouvelle référence pour suivre la demande d'ouverture
  // Context de couleur demandé depuis la toolbar ('fill' | 'border' | 'text')
  const [designColorContext, setDesignColorContext] = useState<'fill' | 'border' | 'text'>('fill');
  // Inline WheelConfigPanel visibility (controlled at layout level)
  const [showWheelPanel, setShowWheelPanel] = useState(false);
  const [campaignConfig, setCampaignConfig] = useState<any>({
    design: {
      wheelConfig: {
        scale: 2
      }
    }
  });

  // État pour l'élément sélectionné
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [selectedElements, setSelectedElements] = useState<any[]>([]);
  
  // Fonction pour sélectionner tous les éléments (textes, images, etc.)
  const handleSelectAll = useCallback(() => {
    // Filtrer tous les éléments visibles sur le canvas (textes, images, formes, etc.)
    const selectableElements = canvasElements.filter(element => 
      element && element.id && (element.type === 'text' || element.type === 'image' || element.type === 'shape' || element.type)
    );
    
    if (selectableElements.length > 0) {
      setSelectedElements([...selectableElements]);
      setSelectedElement(null); // Désélectionner l'élément unique
      console.log('🎯 Selected all canvas elements:', {
        total: selectableElements.length,
        types: selectableElements.reduce((acc: Record<string, number>, el: any) => {
          acc[el.type] = (acc[el.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });
    } else {
      console.log('🎯 No selectable elements found on canvas');
    }
  }, [canvasElements]);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewScreen, setPreviewScreen] = useState<DesignScreenId>('screen1');
  // Calcul des onglets à masquer selon le mode
  const effectiveHiddenTabs = useMemo(
    () => {
      // Ne jamais masquer l'onglet 'game'
      const defaultHidden = mode === 'template' ? ['campaign', 'export', 'form'] : [];
      const result = hiddenTabs ? [...hiddenTabs] : [...defaultHidden];
      
      // S'assurer que 'game' n'est pas dans les onglets masqués
      const filteredResult = result.filter(tab => tab !== 'game');
      
      console.log('🔍 [DesignEditorLayout] effectiveHiddenTabs:', filteredResult, 'mode:', mode);
      return filteredResult;
    },
    [hiddenTabs, mode]
  );


  // Chargement d'un modèle transmis via navigation state
  const location = useLocation();
  useEffect(() => {
    const state = (location as any)?.state as any;
    const template = state?.templateCampaign;
    if (template) {
      const tplCanvas = template.canvasConfig || {};
      const bg = tplCanvas.background || template.design?.background || { type: 'color', value: '#ffffff' };

      setCanvasElements(Array.isArray(tplCanvas.elements) ? tplCanvas.elements : []);
      setCanvasBackground(typeof bg === 'string' ? { type: 'color', value: bg } : bg);

      if (template.design?.extractedColors && Array.isArray(template.design.extractedColors)) {
        setExtractedColors(template.design.extractedColors);
      }

      setCampaignConfig((prev: any) => ({
        ...prev,
        design: {
          ...(prev?.design || {}),
          ...(template.design || {}),
          wheelConfig: {
            ...((prev?.design as any)?.wheelConfig || {}),
            ...((template.design as any)?.wheelConfig || {})
          }
        }
      }));

      if (tplCanvas.device && ['desktop', 'tablet', 'mobile'].includes(tplCanvas.device)) {
        setSelectedDevice(tplCanvas.device);
        setCanvasZoom(getDefaultZoom(tplCanvas.device));
      }
    }
  }, [location]);

  // Ajoute à l'historique lors de l'ajout d'un nouvel élément (granulaire)
  const handleAddElement = (element: any) => {
    const resolvedScreenId = element?.screenId
      || (currentScreen === 'screen2'
        ? 'screen2'
        : currentScreen === 'screen3' ? 'screen3' : 'screen1');
    const enrichedElement = element?.screenId ? element : { ...element, screenId: resolvedScreenId };
    setCanvasElements((prev: any[]) => {
      const newArr = [...prev, enrichedElement];
      setTimeout(() => {
        addToHistory({
          campaignConfig: { ...campaignConfig },
          canvasElements: JSON.parse(JSON.stringify(newArr)),
          canvasBackground: { ...canvasBackground }
        }, 'element_create');
      }, 0);
      return newArr;
    });
    setSelectedElement(enrichedElement);
  };

  // Ajoute à l'historique lors du changement de background (granulaire)
  const handleBackgroundChange = (bg: any) => {
    setCanvasBackground(bg);
    
    // Synchroniser immédiatement avec le preview
    syncBackground(bg, selectedDevice);
    
    setTimeout(() => {
      addToHistory({
        campaignConfig: { ...campaignConfig },
        canvasElements: JSON.parse(JSON.stringify(canvasElements)),
        canvasBackground: { ...bg }
      }, 'background_update');
    }, 0);
  };

  // Ajoute à l'historique lors du changement de config (granulaire)
  const handleCampaignConfigChange = (cfg: any) => {
    setCampaignConfig(cfg);
    setTimeout(() => {
      addToHistory({
        campaignConfig: { ...cfg },
        canvasElements: JSON.parse(JSON.stringify(canvasElements)),
        canvasBackground: { ...canvasBackground }
      }, 'config_update');
    }, 0);
  };

  // Handler pour mettre à jour un module
  const handleModuleUpdate = (moduleId: string, updates: Partial<DesignModule>) => {
    console.log('🔧 [DesignEditorLayout] handleModuleUpdate appelé:', {
      moduleId,
      updates,
      timestamp: new Date().toISOString()
    });

    let moduleFound = false;
    let targetScreenForSelection: DesignScreenId | null = null;

    const nextScreens: DesignModularPage['screens'] = { ...modularPage.screens } as any;

    DESIGN_SCREEN_IDS.forEach((screenId) => {
      const screenModules = Array.isArray(nextScreens[screenId]) ? [...nextScreens[screenId]] : [];
      const moduleIndex = screenModules.findIndex((m: DesignModule) => m.id === moduleId);
      if (moduleIndex !== -1) {
        moduleFound = true;
        const prevModule = screenModules[moduleIndex];
        const updateScreenCandidate = (updates as any)?.screenId;
        const prevScreenCandidate = (prevModule as any)?.screenId;
        const desiredScreen = DESIGN_SCREEN_IDS.includes(updateScreenCandidate as DesignScreenId)
          ? (updateScreenCandidate as DesignScreenId)
          : DESIGN_SCREEN_IDS.includes(prevScreenCandidate as DesignScreenId)
            ? (prevScreenCandidate as DesignScreenId)
            : screenId;

        const updatedModule = {
          ...prevModule,
          ...updates,
          screenId: desiredScreen
        } as DesignModule & { screenId: DesignScreenId };

        screenModules[moduleIndex] = updatedModule;
        nextScreens[screenId] = screenModules;

        if (selectedModuleId === moduleId) {
          targetScreenForSelection = desiredScreen;
        }

        console.log('✅ [DesignEditorLayout] Module mis à jour:', {
          fromScreen: screenId,
          targetScreen: desiredScreen,
          moduleIndex,
          oldModule: { id: prevModule.id, type: prevModule.type },
          newModule: { id: updatedModule.id, type: updatedModule.type }
        });
      }
    });

    if (!moduleFound) {
      console.warn('⚠️ [DesignEditorLayout] Module non trouvé:', moduleId);
      return;
    }

    const nextPage: DesignModularPage = {
      screens: nextScreens,
      _updatedAt: Date.now()
    };

    const normalized = persistModular(nextPage);

    if (selectedModuleId === moduleId && targetScreenForSelection) {
      const normalizedModule = normalized.screens[targetScreenForSelection].find((m) => m.id === moduleId);
      if (normalizedModule) {
        setSelectedModule(normalizedModule);
      }
    }
  };

  // Ajoute à l'historique à chaque modification d'élément (granulaire)
  const handleElementUpdate = (updates: any) => {
    if (selectedElement) {
      const deviceScopedKeys = ['x', 'y', 'width', 'height', 'fontSize', 'textAlign'];
      const isDeviceScoped = selectedDevice !== 'desktop';
      const workingUpdates: Record<string, any> = { ...updates };
      const devicePatch: Record<string, any> = {};

      if (isDeviceScoped) {
        for (const key of deviceScopedKeys) {
          if (workingUpdates[key] !== undefined) {
            devicePatch[key] = workingUpdates[key];
            delete workingUpdates[key];
          }
        }
      }

      const updatedElement = {
        ...selectedElement,
        ...workingUpdates,
        ...(isDeviceScoped
          ? {
              [selectedDevice]: {
                ...(selectedElement as any)[selectedDevice],
                ...devicePatch
              }
            }
          : {})
      };

      setCanvasElements((prev: any[]) => {
        const newArr = prev.map((el: any) =>
          el.id === selectedElement.id ? updatedElement : el
        );
        setTimeout(() => {
          addToHistory({
            campaignConfig: { ...campaignConfig },
            canvasElements: JSON.parse(JSON.stringify(newArr)),
            canvasBackground: { ...canvasBackground }
          }, 'element_update');
        }, 0);
        return newArr;
      });
      setSelectedElement(updatedElement);
    }
  };

  // Hook de synchronisation robuste entre édition et preview
  const {
    syncBackground,
    syncModules,
    syncModule,
    getCanonicalPreviewData,
    forceSync
  } = useEditorPreviewSync();

  // Utilisation du hook de synchronisation unifié
  const {
    wheelModalConfig,
    // Individual setters for wheel config to wire into the sidebar panel
    setWheelBorderStyle,
    setWheelBorderColor,
    setWheelBorderWidth,
    setWheelScale,
    setShowBulbs,
    setWheelPosition
  } = useWheelConfigSync({
    campaign: campaignConfig,
    extractedColors,
    onCampaignChange: setCampaignConfig
  });

  // Système d'historique pour undo/redo avec le nouveau hook
  const {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo
  } = useUndoRedo({
    maxHistorySize: 50,
    onUndo: (restoredSnapshot) => {
      console.log(' Undo: Restauration du snapshot', restoredSnapshot);
      if (restoredSnapshot) {
        // Restaure tous les sous-états à partir du snapshot
        setCampaignConfig(restoredSnapshot.campaignConfig || {});
        setCanvasElements(restoredSnapshot.canvasElements || []);
        setCanvasBackground(restoredSnapshot.canvasBackground || { type: 'color', value: '#ffffff' });
        setSelectedElement(null);
      }
    },
    onRedo: (restoredSnapshot) => {
      console.log(' Redo: Restauration du snapshot', restoredSnapshot);
      if (restoredSnapshot) {
        setCampaignConfig(restoredSnapshot.campaignConfig || {});
        setCanvasElements(restoredSnapshot.canvasElements || []);
        setCanvasBackground(restoredSnapshot.canvasBackground || { type: 'color', value: '#ffffff' });
        setSelectedElement(null);
      }
    },
    onStateChange: (state, action) => {
      console.log(` Changement d'état dans l'historique: ${action}`, state);
      setIsModified(true);
    }
  });

  // Raccourcis clavier pour undo/redo
  useUndoRedoShortcuts(undo, redo, {
    enabled: true,
    preventDefault: true
  });
  
  // Hook de gestion des groupes (après addToHistory)
  const groupManager = useGroupManager({
    elements: canvasElements,
    onElementsChange: setCanvasElements,
    onAddToHistory: addToHistory
  });
  
  const {
    createGroup,
    ungroupElements,
    selectedGroupId,
    setSelectedGroupId,
    getGroupElements
  } = groupManager;
  
  // Fonctions pour les raccourcis clavier d'éléments
  const handleDeselectAll = useCallback(() => {
    setSelectedElement(null);
    setSelectedElements([]);
    console.log('🎯 Deselected all elements');
  }, []);
  
  const handleElementDelete = useCallback((elementId?: string) => {
    const targetElementId = elementId || selectedElement?.id;
    if (targetElementId) {
      setCanvasElements((prev: any[]) => {
        const newElements = prev.filter((el: any) => el.id !== targetElementId);
        setTimeout(() => {
          addToHistory({
            campaignConfig: { ...campaignConfig },
            canvasElements: JSON.parse(JSON.stringify(newElements)),
            canvasBackground: { ...canvasBackground }
          }, 'element_delete');
        }, 0);
        return newElements;
      });
      setSelectedElement(null);
      console.log('🗑️ Deleted element:', targetElementId);
    } else {
      console.log('🗑️ No element to delete - selectedElement:', selectedElement);
    }
  }, [selectedElement, campaignConfig, canvasBackground, addToHistory]);
  
  const handleElementCopy = useCallback(() => {
    if (selectedElement) {
      localStorage.setItem('clipboard-element', JSON.stringify(selectedElement));
      console.log('📋 Copied element:', selectedElement.id);
    }
  }, [selectedElement]);
  
  const handleElementCut = useCallback(() => {
    if (selectedElement) {
      // D'abord copier l'élément
      localStorage.setItem('clipboard-element', JSON.stringify(selectedElement));
      console.log('✂️ Cut element (copied):', selectedElement.id);
      
      // Puis le supprimer
      const elementId = selectedElement.id;
      setCanvasElements((prev: any[]) => {
        const newElements = prev.filter((el: any) => el.id !== elementId);
        setTimeout(() => {
          addToHistory({
            campaignConfig: { ...campaignConfig },
            canvasElements: JSON.parse(JSON.stringify(newElements)),
            canvasBackground: { ...canvasBackground }
          }, 'element_cut');
        }, 0);
        return newElements;
      });
      setSelectedElement(null);
      console.log('✂️ Cut element (deleted):', elementId);
    } else {
      console.log('✂️ No element to cut - selectedElement:', selectedElement);
    }
  }, [selectedElement, campaignConfig, canvasBackground, addToHistory]);
  
  const handleElementPaste = useCallback(() => {
    try {
      const clipboardData = localStorage.getItem('clipboard-element');
      if (clipboardData) {
        const element = JSON.parse(clipboardData);
        const newElement = {
          ...element,
          id: `${element.type}-${Date.now()}`,
          x: (element.x || 0) + 20,
          y: (element.y || 0) + 20
        };
        handleAddElement(newElement);
        console.log('📋 Pasted element:', newElement.id);
      }
    } catch (error) {
      console.error('Error pasting element:', error);
    }
  }, [handleAddElement]);
  
  const handleElementDuplicate = useCallback(() => {
    if (selectedElement) {
      const newElement = {
        ...selectedElement,
        id: `${selectedElement.type}-${Date.now()}`,
        x: (selectedElement.x || 0) + 20,
        y: (selectedElement.y || 0) + 20
      };
      handleAddElement(newElement);
      console.log('🔄 Duplicated element:', newElement.id);
    }
  }, [selectedElement, handleAddElement]);

  // Modular page management functions
  const persistModular = useCallback((next: DesignModularPage) => {
    const normalized = normalizeDesignModularPage(next);
    setModularPage(normalized);
    
    // Synchroniser immédiatement avec le preview
    syncModules(normalized);
    
    setCampaignConfig((prev: any) => ({
      ...(prev || {}),
      design: {
        ...(prev?.design || {}),
        designModules: normalized
      }
    }));
    try { setIsModified(true); } catch {}
    return normalized;
  }, [setIsModified, syncModules]);

  const scrollToScreen = useCallback((screen: DesignScreenId): boolean => {
    const canvasScrollArea = document.querySelector('.canvas-scroll-area') as HTMLElement | null;
    if (!canvasScrollArea) return false;
    const anchor = canvasScrollArea.querySelector(`[data-screen-anchor="${screen}"]`) as HTMLElement | null;
    if (!anchor) return false;

    const anchorTop = anchor.offsetTop;
    const centerOffset = Math.max(0, (canvasScrollArea.clientHeight - anchor.clientHeight) / 2);
    const target = anchorTop - centerOffset;
    const maxScroll = canvasScrollArea.scrollHeight - canvasScrollArea.clientHeight;
    const clamped = Math.min(Math.max(target, 0), Math.max(maxScroll, 0));

    canvasScrollArea.scrollTo({ top: clamped, behavior: 'smooth' });
    return true;
  }, []);

  const handleAddModule = useCallback((screen: DesignScreenId, module: DesignModule) => {
    const moduleWithScreen = { ...module, screenId: screen } as DesignModule & { screenId: DesignScreenId };
    const prevScreenModules = modularPage.screens[screen] || [];

    const next: DesignModularPage = {
      screens: {
        ...modularPage.screens,
        [screen]: [moduleWithScreen, ...prevScreenModules]
      },
      _updatedAt: Date.now()
    };

    persistModular(next);
  }, [modularPage, persistModular]);

  const handleUpdateModule = useCallback((id: string, patch: Partial<DesignModule>) => {
    const nextScreens: DesignModularPage['screens'] = { ...modularPage.screens };
    (Object.keys(nextScreens) as DesignScreenId[]).forEach((s) => {
      nextScreens[s] = (nextScreens[s] || []).map((m) => (m.id === id ? { ...m, ...patch } as DesignModule : m));
    });
    persistModular({ screens: nextScreens, _updatedAt: Date.now() });
  }, [modularPage, persistModular]);

  const handleDeleteModule = useCallback((id: string) => {
    const nextScreens: DesignModularPage['screens'] = { ...modularPage.screens };
    (Object.keys(nextScreens) as DesignScreenId[]).forEach((s) => {
      nextScreens[s] = (nextScreens[s] || []).filter((m) => m.id !== id);
    });
    
    // Vérifier s'il reste au moins un bouton après suppression
    const hasButton = (Object.values(nextScreens) as DesignModule[][]).some((modules) =>
      modules?.some((m) => m.type === 'BlocBouton')
    );
    
    // Si plus aucun bouton, en créer un par défaut sur screen1
    if (!hasButton) {
      const defaultButton: DesignModule = {
        id: `BlocBouton-${Date.now()}`,
        type: 'BlocBouton',
        label: 'Participer',
        href: '#',
        align: 'center',
        borderRadius: 9999,
        background: '#000000',
        textColor: '#ffffff',
        padding: '14px 28px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        uppercase: false,
        bold: false
      } as DesignModule;
      nextScreens.screen1 = [...(nextScreens.screen1 || []), defaultButton];
    }
    
    persistModular({ screens: nextScreens, _updatedAt: Date.now() });
  }, [modularPage, persistModular]);

  const handleMoveModule = useCallback((id: string, direction: 'up' | 'down') => {
    const nextScreens: DesignModularPage['screens'] = { ...modularPage.screens };
    (Object.keys(nextScreens) as DesignScreenId[]).forEach((s) => {
      const arr = [...(nextScreens[s] || [])];
      const idx = arr.findIndex((m) => m.id === id);
      if (idx >= 0) {
        const swapWith = direction === 'up' ? idx - 1 : idx + 1;
        if (swapWith >= 0 && swapWith < arr.length) {
          const tmp = arr[swapWith];
          arr[swapWith] = arr[idx];
          arr[idx] = tmp;
        }
        nextScreens[s] = arr;
      }
    });
    persistModular({ screens: nextScreens, _updatedAt: Date.now() });
  }, [modularPage, persistModular]);

  const handleDuplicateModule = useCallback((id: string) => {
    type ModuleWithMeta = DesignModule & { moduleId?: string; label?: string };

    const nextScreens: Record<DesignScreenId, DesignModule[]> = { ...modularPage.screens };
    let moduleToDuplicate: ModuleWithMeta | null = null;
    let foundScreenId: DesignScreenId | null = null;
    let originalIndex = -1;

    for (const screenId of Object.keys(nextScreens) as DesignScreenId[]) {
      const modules = nextScreens[screenId] ?? [];
      const index = modules.findIndex((m) => m.id === id);
      if (index >= 0) {
        moduleToDuplicate = modules[index] as ModuleWithMeta;
        foundScreenId = screenId;
        originalIndex = index;
        break;
      }
    }

    if (!moduleToDuplicate || !foundScreenId || originalIndex < 0) {
      console.warn(`⚠️ Impossible de trouver le module à dupliquer (ID: ${id})`);
      return;
    }

    const newId = `module-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const duplicatedModule: ModuleWithMeta = {
      ...moduleToDuplicate,
      id: newId
    };
    (duplicatedModule as any).screenId = (moduleToDuplicate as any)?.screenId ?? foundScreenId;

    if (typeof moduleToDuplicate.label === 'string' && moduleToDuplicate.label.trim().length > 0) {
      duplicatedModule.label = `${moduleToDuplicate.label} (copie)`;
    }

    const currentModules = nextScreens[foundScreenId] ?? [];
    const updatedModules = [...currentModules];
    updatedModules.splice(originalIndex + 1, 0, duplicatedModule);
    nextScreens[foundScreenId] = updatedModules;

    persistModular({ screens: nextScreens, _updatedAt: Date.now() });

    console.log(`✅ Module dupliqué avec succès (${id} → ${duplicatedModule.id})`);
  }, [modularPage.screens, persistModular]);
  
  // Assurer qu'un bouton "Participer" existe toujours sur l'écran 1
  const ensuredButtonRef = useRef(false);
  useEffect(() => {
    if (ensuredButtonRef.current) return;
    
    const hasButton = (Object.values(modularPage.screens) as DesignModule[][]).some((modules) =>
      modules?.some((m) => m.type === 'BlocBouton')
    );
    
    if (!hasButton) {
      const defaultButton: DesignModule = {
        id: `BlocBouton-${Date.now()}`,
        type: 'BlocBouton',
        label: 'Participer',
        href: '#',
        align: 'center',
        borderRadius: 9999,
        background: '#000000',
        textColor: '#ffffff',
        padding: '14px 28px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        uppercase: false,
        bold: false,
        screenId: 'screen1'
      } as DesignModule;
      
      const nextScreens: DesignModularPage['screens'] = { ...modularPage.screens };
      nextScreens.screen1 = [...(nextScreens.screen1 || []), defaultButton];
      persistModular({ screens: nextScreens, _updatedAt: Date.now() });
    }
    
    ensuredButtonRef.current = true;
  }, [modularPage.screens, persistModular]);
  
  // Synchronisation avec le store
  useEffect(() => {
    setPreviewDevice(selectedDevice);
  }, [selectedDevice, setPreviewDevice]);

  // Configuration de campagne dynamique optimisée avec synchronisation forcée
  const campaignData = useMemo(() => {
    const normalizedModularPage = normalizeDesignModularPage(modularPage, { preserveTimestamp: true });
    const titleElement = canvasElements.find(el => el.type === 'text' && el.role === 'title');
    const descriptionElement = canvasElements.find(el => el.type === 'text' && el.role === 'description');
    const buttonElement = canvasElements.find(el => el.type === 'text' && el.role === 'button');
    
    const customTexts = canvasElements.filter((el: any) => 
      el.type === 'text' && !['title', 'description', 'button'].includes(el.role)
    );
    const customImages = canvasElements.filter((el: any) => el.type === 'image');
    
    // Inclure les modules dans les éléments pour l'aperçu
    const allModules = Object.values(normalizedModularPage.screens).flat();
    console.log('📦 [DesignEditorLayout] Modules trouvés pour preview:', {
      modulesCount: allModules.length,
      modules: allModules.map((m: any) => ({ id: m.id, type: m.type, label: m.label })),
      modularPage: modularPage
    });

    const currentWheelConfig = {
      borderStyle: wheelModalConfig?.wheelBorderStyle || campaignConfig?.wheelConfig?.borderStyle || campaignConfig?.design?.wheelBorderStyle || 'classic',
      borderColor: wheelModalConfig?.wheelBorderColor || campaignConfig?.wheelConfig?.borderColor || campaignConfig?.design?.wheelConfig?.borderColor || '#841b60',
      scale: wheelModalConfig?.wheelScale !== undefined ? wheelModalConfig.wheelScale : (campaignConfig?.wheelConfig?.scale !== undefined ? campaignConfig.wheelConfig.scale : (campaignConfig?.design?.wheelConfig?.scale || 1))
    };

    console.log('🔄 CampaignData wheel config sync:', {
      wheelModalConfigScale: wheelModalConfig?.wheelScale,
      campaignConfigScale: campaignConfig?.wheelConfig?.scale,
      finalScale: currentWheelConfig.scale
    });

    const primaryColor = canvasBackground.type === 'image' && extractedColors[0]
      ? extractedColors[0]
      : currentWheelConfig.borderColor;
    const secondaryColor = '#ffffff';

    // Build dynamic wheel segments for preview:
    // Prefer central editor store (campaignState) updated by panels/modals,
    // then fallback to local campaignConfig, else generate by count
    const configuredSegments = (
      (campaignState as any)?.wheelConfig?.segments ||
      (campaignConfig as any)?.wheelConfig?.segments ||
      (campaignState as any)?.gameConfig?.wheel?.segments ||
      (campaignState as any)?.config?.roulette?.segments ||
      (campaignConfig as any)?.gameConfig?.wheel?.segments ||
      (campaignConfig as any)?.config?.roulette?.segments ||
      []
    );
    const fallbackCount = configuredSegments.length > 0 ? configuredSegments.length : 6;
    const generatedSegments = Array.from({ length: fallbackCount }, (_, i) => {
      const isWinning = i % 2 === 0;
      return {
        id: String(i + 1),
        label: isWinning ? `Prix ${Math.floor(i / 2) + 1}` : 'Dommage',
        color: isWinning ? primaryColor : secondaryColor,
        textColor: isWinning ? secondaryColor : primaryColor,
        probability: 1,
        isWinning
      } as any;
    });
    const wheelSegments = configuredSegments.length > 0 ? configuredSegments : generatedSegments;
    // Debug: trace the segment flow feeding the preview campaign
    try {
      const segIds = Array.isArray(wheelSegments) ? wheelSegments.map((s: any) => s?.id ?? '?') : [];
      const source = configuredSegments.length > 0 ? 'configured' : `generated(${fallbackCount})`;
      console.log('🧭 [DesignEditorLayout] campaignData segments:', {
        source,
        count: Array.isArray(wheelSegments) ? wheelSegments.length : 0,
        ids: segIds,
        haveCampaignStateWheelConfig: Boolean((campaignState as any)?.wheelConfig?.segments),
        haveCampaignConfigWheelConfig: Boolean((campaignConfig as any)?.wheelConfig?.segments),
        haveCampaignState: Boolean((campaignState as any)?.gameConfig?.wheel?.segments || (campaignState as any)?.config?.roulette?.segments),
        haveCampaignConfig: Boolean((campaignConfig as any)?.gameConfig?.wheel?.segments || (campaignConfig as any)?.config?.roulette?.segments),
        campaignStateSegments: (campaignState as any)?.wheelConfig?.segments,
        campaignConfigSegments: (campaignConfig as any)?.wheelConfig?.segments,
        device: selectedDevice
      });
    } catch (e) {
      console.warn('🧭 [DesignEditorLayout] segment log error', e);
    }

    return {
      id: 'wheel-design-preview',
      type: 'wheel',
      design: {
        background: canvasBackground,
        customTexts: customTexts,
        customImages: customImages,
        extractedColors: extractedColors,
        customColors: {
          primary: primaryColor,
          secondary: secondaryColor,
          accent: extractedColors[2] || '#45b7d1'
        },
        wheelConfig: currentWheelConfig,
        wheelBorderStyle: currentWheelConfig.borderStyle,
        designModules: {
          ...normalizedModularPage
        }
      },
      gameConfig: {
        wheel: {
          segments: wheelSegments,
          winProbability: 0.75,
          maxWinners: 100,
          buttonLabel: buttonElement?.content || 'Faire tourner'
        }
      },
      buttonConfig: {
        text: buttonElement?.content || 'Faire tourner',
        color: primaryColor,
        textColor: buttonElement?.style?.color || '#ffffff',
        borderRadius: campaignConfig.borderRadius || '8px'
      },
      screens: [
        {
          title: titleElement?.content || 'Tentez votre chance !',
          description: descriptionElement?.content || 'Tournez la roue et gagnez des prix incroyables',
          buttonText: buttonElement?.content || 'Jouer'
        }
      ],
      // Champs de contact dynamiques depuis le store (fallback uniquement si indéfini)
      formFields: ((campaignState as any)?.formFields !== undefined)
        ? ((campaignState as any)?.formFields as any)
        : [
            { id: 'prenom', label: 'Prénom', type: 'text', required: true },
            { id: 'nom', label: 'Nom', type: 'text', required: true },
            { id: 'email', label: 'Email', type: 'email', required: true }
          ],
      // Garder la configuration canvas pour compatibilité - NE PAS mélanger les modules des 3 écrans ici
      canvasConfig: {
        elements: [...canvasElements],
        background: canvasBackground,
        device: selectedDevice
      },
      // Ajouter modularPage pour compatibilité
      modularPage: normalizedModularPage
    };
  }, [canvasElements, canvasBackground, campaignConfig, extractedColors, selectedDevice, wheelModalConfig, campaignState, modularPage]);

  // Synchronisation avec le store (éviter les boucles d'updates)
  const lastTransformedSigRef = useRef<string>('');
  useEffect(() => {
    if (!campaignData) return;

    const transformedCampaign = {
      ...campaignData,
      name: 'Ma Campagne',
      type: (campaignData.type || 'wheel') as 'wheel' | 'scratch' | 'jackpot' | 'quiz' | 'dice' | 'form' | 'memory' | 'puzzle',
      design: {
        ...campaignData.design,
        background: typeof campaignData.design?.background === 'object'
          ? campaignData.design.background.value || '#ffffff'
          : campaignData.design?.background || '#ffffff'
      }
    };

    // Signature stable pour éviter les mises à jour redondantes
    const signature = (() => {
      try {
        return JSON.stringify(transformedCampaign);
      } catch {
        return String(Date.now());
      }
    })();

    if (signature !== lastTransformedSigRef.current) {
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[DesignEditorLayout] setCampaign: content changed, merging into store');
      }
      // Preserve existing wheel segments (including prizeId) to avoid overwriting
      // them with generated/fallback segments during preview sync.
      setCampaign((prev: any) => {
        if (!prev) return transformedCampaign as any;

        const prevSegments = (prev?.gameConfig?.wheel?.segments?.length
          ? prev.gameConfig.wheel.segments
          : (prev?.config?.roulette?.segments || [])) as any[];
        const nextSegments = (transformedCampaign as any)?.gameConfig?.wheel?.segments as any[] | undefined;
        const mergedSegments = (prevSegments && prevSegments.length) ? prevSegments : (nextSegments || []);

        if (process.env.NODE_ENV !== 'production') {
          try {
            const hasPrizeIds = Array.isArray(mergedSegments) && mergedSegments.some((s: any) => s && 'prizeId' in s && s.prizeId);
            console.debug('🎯 [DesignEditorLayout] Preserving wheel segments during merge', {
              prevCount: Array.isArray(prevSegments) ? prevSegments.length : 0,
              nextCount: Array.isArray(nextSegments) ? nextSegments.length : 0,
              used: (prevSegments && prevSegments.length) ? 'prev' : 'next',
              hasPrizeIds
            });
          } catch {}
        }

        return {
          ...prev,
          ...transformedCampaign,
          gameConfig: {
            ...prev.gameConfig,
            ...(transformedCampaign as any).gameConfig,
            wheel: {
              ...prev.gameConfig?.wheel,
              ...(transformedCampaign as any)?.gameConfig?.wheel,
              segments: mergedSegments
            }
          },
          // Mirror segments to legacy config.roulette as well for compatibility
          config: {
            ...prev.config,
            ...(transformedCampaign as any).config,
            roulette: {
              ...prev.config?.roulette,
              ...(transformedCampaign as any)?.config?.roulette,
              segments: mergedSegments
            }
          },
          // Préserver modularPage pour la synchronisation avec le preview
          modularPage: (transformedCampaign as any).modularPage || prev.modularPage,
          // Préserver design.designModules si présent
          design: {
            ...(transformedCampaign as any).design,
            designModules: (transformedCampaign as any).modularPage || prev.design?.designModules
          }
        } as any;
      });
      lastTransformedSigRef.current = signature;
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[DesignEditorLayout] Skipping setCampaign: no material change');
      }
    }
  }, [campaignData, setCampaign]);

  // Actions optimisées
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const saved = await saveCampaignToDB(campaignState, saveCampaign);
      if (saved?.id && !(campaignState as any)?.id) {
        setCampaign((prev: any) => ({ ...prev, id: saved.id }));
      }
      setIsModified(false);
    } catch (e) {
      console.error('[DesignEditorLayout] Save failed', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(!showPreview);
    if (!showPreview) {
      setPreviewScreen('screen1'); // Toujours commencer par l'écran 1
    }
  };

  // Save and continue: persist then navigate to settings page
  const handleSaveAndContinue = useCallback(() => {
    const fn = createSaveAndContinueHandler(
      campaignState,
      saveCampaign,
      navigate,
      setCampaign
    );
    return fn();
  }, [campaignState, saveCampaign, navigate, setCampaign]);

  // Navigate to settings without saving (same destination as Save & Continue)
  const handleNavigateToSettings = useCallback(() => {
    let campaignId = (campaignState as any)?.id as string | undefined;
    if (!campaignId) {
      campaignId = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
        ? (crypto as any).randomUUID()
        : `draft-${Date.now()}`;
      try {
        const draft = { ...(campaignState || {}), id: campaignId, _source: 'localStorage' };
        localStorage.setItem(`campaign:draft:${campaignId}`, JSON.stringify(draft));
      } catch {}
      setCampaign((prev: any) => ({ ...prev, id: campaignId }));
    }
    if (campaignId) {
      navigate(`/campaign/${campaignId}/settings`);
    }
  }, [campaignState, navigate, setCampaign]);

  // Fonction pour appliquer les couleurs extraites à la roue et aux segments
  const handleExtractedColorsChange = (colors: string[]) => {
    if (!colors || !Array.isArray(colors) || colors.length === 0) return;
    
    console.log('🎨 handleExtractedColorsChange - Nouvelles couleurs extraites:', colors);
    
    // Mettre à jour les couleurs extraites dans l'état
    setExtractedColors(colors);
    
    // Créer une copie profonde de la configuration actuelle
    setCampaignConfig((prev: any) => {
      if (!prev) return prev;
      
      // Créer une copie profonde de la configuration actuelle
      const currentConfig = JSON.parse(JSON.stringify(prev));
      
      // Mettre à jour les couleurs extraites dans l'objet campaign pour le mode preview
      if (!currentConfig.design) currentConfig.design = {};
      currentConfig.design.extractedColors = [...colors];
      
      // Récupérer la configuration actuelle de la roue
      const currentWheelConfig = currentConfig?.design?.wheelConfig || {};
      const isClassicBorder = (currentWheelConfig?.borderStyle || 'classic') === 'classic';
      const shouldUpdateBorderColor = isClassicBorder && 
        (!currentWheelConfig?.borderColor || currentWheelConfig.borderColor === '#841b60');
      
      // Couleurs principales à utiliser
      const primaryColor = colors[0] || currentConfig?.design?.brandColors?.primary || '#841b60';
      const secondaryColor = '#ffffff'; // Toujours blanc pour les segments secondaires
      const accentColor = colors[2] || currentConfig?.design?.brandColors?.accent || '#45b7d1';
      
      // Mettre à jour les segments de la roue avec les nouvelles couleurs
      const currentSegments = currentConfig?.gameConfig?.wheel?.segments || [];
      const updatedSegments = currentSegments.map((segment: any, index: number) => {
        // Déterminer si le segment est gagnant (alternance par défaut si non spécifié)
        const isWinning = segment.isWinning ?? (index % 2 === 0);
        
        // Pour les segments gagnants, utiliser la couleur primaire, sinon blanc
        const segmentColor = isWinning ? primaryColor : secondaryColor;
        const textColor = isWinning ? secondaryColor : primaryColor;
        
        return {
          ...segment,
          // Forcer la mise à jour de la couleur
          color: segmentColor,
          // Définir la couleur du texte pour un bon contraste
          textColor: textColor,
          // S'assurer que la propriété value est définie pour chaque segment
          value: segment.value || segment.label || `segment-${index + 1}`,
          // Forcer la mise à jour en modifiant un timestamp
          _updatedAt: Date.now()
        };
      });
      
      // Mettre à jour la configuration avec les nouvelles couleurs
      const updatedConfig = {
        ...currentConfig,
        design: {
          ...currentConfig.design,
          // Mettre à jour la configuration de la roue
          wheelConfig: {
            ...currentWheelConfig,
            // Mettre à jour la couleur de bordure si nécessaire
            ...(shouldUpdateBorderColor && {
              borderColor: primaryColor,
              // Forcer la mise à jour en modifiant un timestamp
              _updatedAt: Date.now()
            })
          },
          // Mettre à jour les couleurs de la marque
          brandColors: {
            ...currentConfig.design?.brandColors,
            primary: primaryColor,
            secondary: secondaryColor,
            accent: accentColor,
            // Forcer la mise à jour
            _updatedAt: Date.now()
          },
          // Mettre à jour les couleurs personnalisées
          customColors: {
            ...currentConfig.design?.customColors,
            primary: primaryColor,
            secondary: secondaryColor,
            // Forcer la mise à jour
            _updatedAt: Date.now()
          },
          // Forcer la mise à jour du design
          _updatedAt: Date.now()
        },
        // Mettre à jour les segments de la roue avec les nouvelles couleurs
        gameConfig: {
          ...currentConfig.gameConfig,
          wheel: {
            ...currentConfig.gameConfig?.wheel,
            segments: updatedSegments,
            // Forcer la mise à jour
            _updatedAt: Date.now()
          },
          // Forcer la mise à jour
          _updatedAt: Date.now()
        },
        // Forcer la mise à jour globale
        _updatedAt: Date.now()
      };
      
      console.log('🎨 Mise à jour des couleurs extraites:', {
        colors,
        primaryColor,
        secondaryColor,
        accentColor,
        segmentsCount: updatedSegments.length,
        firstSegment: updatedSegments[0],
        config: updatedConfig.design.wheelConfig,
        hasSegments: !!updatedConfig.gameConfig?.wheel?.segments?.length
      });
      
      return updatedConfig;
    });
  };

  // Raccourcis clavier professionnels
  const { shortcuts } = useKeyboardShortcuts({
    selectedElement,
    onSave: () => {
      handleSave();
    },
    onPreview: () => {
      handlePreview();
    },
    onUndo: () => {
      undo();
    },
    onRedo: () => {
      redo();
    },
    onZoomIn: () => {
      setCanvasZoom(prev => Math.min(prev + 0.1, 1));
    },
    onZoomOut: () => {
      setCanvasZoom(prev => Math.max(prev - 0.1, 0.1));
    },
    onZoomReset: () => {
      setCanvasZoom(1);
    },
    onZoomFit: () => {
      setCanvasZoom(1);
    },
    onSelectAll: handleSelectAll,
    onDeselectAll: handleDeselectAll,
    onElementDelete: handleElementDelete,
    onElementCopy: handleElementCopy,
    onElementCut: handleElementCut,
    onElementPaste: handleElementPaste,
    onDuplicate: handleElementDuplicate,
    onGroup: () => {
      console.log('🎯 🔥 GROUP FUNCTION CALLED!');
      console.log('🎯 Selected elements:', selectedElements);
      console.log('🎯 Selected elements length:', selectedElements?.length);
      
      const validElements = selectedElements.filter(el => el && !el.isGroup && el.type !== 'group');
      
      if (validElements.length >= 2) {
        console.log('🎯 ✅ Conditions met, creating group with', validElements.length, 'elements');
        const elementIds = validElements.map(el => el.id);
        console.log('🎯 Element IDs to group:', elementIds);
        
        const groupId = createGroup(elementIds, `Groupe ${Date.now()}`);
        console.log('🎯 Group created with ID:', groupId);
        
        if (groupId) {
          addToHistory({
            canvasElements: [...canvasElements],
            canvasBackground: { ...canvasBackground },
            campaignConfig: { ...campaignConfig },
            selectedElements: [],
            selectedGroupId: groupId
          });
          
          setSelectedElements([]);
          setSelectedElement(null);
          setSelectedGroupId(groupId);
          
          console.log('🎯 ✅ Group created successfully!');
        }
      } else {
        console.log('🎯 ❌ Need at least 2 elements to create a group. Found:', validElements.length);
      }
    },
    onUngroup: () => {
      console.log('🎯 Ungrouping selected group:', selectedGroupId);
      
      let targetGroupId = selectedGroupId;
      
      if (!targetGroupId && selectedElements.length > 0) {
        const selectedGroup = selectedElements.find(el => el.isGroup || el.type === 'group');
        if (selectedGroup) {
          targetGroupId = selectedGroup.id;
        }
      }
      
      if (targetGroupId) {
        console.log('🎯 Dissociating group:', targetGroupId);
        
        const groupElements = getGroupElements(targetGroupId);
        console.log('🎯 Group elements to liberate:', groupElements.map(el => el.id));
        
        ungroupElements(targetGroupId);
        
        addToHistory({
          canvasElements: [...canvasElements],
          canvasBackground: { ...canvasBackground },
          campaignConfig: { ...campaignConfig },
          selectedElements: groupElements,
          selectedGroupId: null
        });
        
        setSelectedElements(groupElements);
        setSelectedElement(null);
        setSelectedGroupId(null);
        
        console.log('🎯 ✅ Group ungrouped successfully!');
      } else {
        console.log('🎯 ❌ No group selected to ungroup');
      }
    },
    // --- Raccourcis de texte (élément texte sélectionné) ---
    onToggleBoldText: () => {
      if (selectedElement?.type === 'text') {
        handleElementUpdate({
          fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold'
        });
      }
    },
    onToggleItalicText: () => {
      if (selectedElement?.type === 'text') {
        handleElementUpdate({
          fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic'
        });
      }
    },
    onToggleUnderlineText: () => {
      if (selectedElement?.type === 'text') {
        const current = selectedElement.textDecoration || 'none';
        const next = current.includes('underline')
          ? (current.replace('underline', '').replace(/\s+/g, ' ').trim() || 'none')
          : ((current === 'none' || !current) ? 'underline' : `${current} underline`);
        handleElementUpdate({ textDecoration: next });
      }
    },
    onAlignTextLeft: () => {
      if (!selectedElement) {
        return;
      }
      if (selectedElement?.type === 'text') {
        handleElementUpdate({ textAlign: 'left' });
      }
    },
    onAlignTextCenter: () => {
      if (!selectedElement) {
        return;
      }
      if (selectedElement?.type === 'text') {
        handleElementUpdate({ textAlign: 'center' });
      }
    },
    onAlignTextRight: () => {
      if (!selectedElement) {
        return;
      }
      if (selectedElement?.type === 'text') {
        handleElementUpdate({ textAlign: 'right' });
      }
    },
    onIncrementFontSize: () => {
      if (selectedElement?.type === 'text') {
        const size = typeof selectedElement.fontSize === 'number' ? selectedElement.fontSize : 16;
        handleElementUpdate({ fontSize: Math.min(200, (isNaN(size) ? 16 : size) + 1) });
      }
    },
    onDecrementFontSize: () => {
      if (selectedElement?.type === 'text') {
        const size = typeof selectedElement.fontSize === 'number' ? selectedElement.fontSize : 16;
        handleElementUpdate({ fontSize: Math.max(8, (isNaN(size) ? 16 : size) - 1) });
      }
    }
  });

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundImage:
          'radial-gradient(130% 130% at 12% 20%, rgba(235, 155, 100, 0.8) 0%, rgba(235, 155, 100, 0) 55%), radial-gradient(120% 120% at 78% 18%, rgba(128, 82, 180, 0.85) 0%, rgba(128, 82, 180, 0) 60%), radial-gradient(150% 150% at 55% 82%, rgba(68, 52, 128, 0.75) 0%, rgba(68, 52, 128, 0) 65%), linear-gradient(90deg, #E07A3A 0%, #9A5CA9 50%, #3D2E72 100%)',
        backgroundBlendMode: 'screen, screen, lighten, normal',
        backgroundColor: '#3D2E72',
        padding: '0 9px 9px 9px',
        boxSizing: 'border-box'
      }}
    >
    <MobileStableEditor
      className="h-[100dvh] min-h-[100dvh] w-full bg-transparent flex flex-col overflow-hidden pt-[1.25cm] pb-[6px] rounded-tl-[28px] rounded-tr-[28px] rounded-br-[28px] transform -translate-y-[0.4vh]"
    >
      {/* Top Toolbar - Hidden in preview mode */}
      {!showPreview && (
        <>
          <DesignToolbar
            selectedDevice={selectedDevice}
            onDeviceChange={handleDeviceChange}
            onPreviewToggle={handlePreview}
            isPreviewMode={showPreview}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            mode={mode}
            onSave={handleSaveAndContinue}
            showSaveCloseButtons={false}
            onNavigateToSettings={handleNavigateToSettings}
          />

          {/* Bouton d'aide des raccourcis clavier */}
          <div className="absolute top-2 right-2 z-10">
            <KeyboardShortcutsHelp shortcuts={shortcuts} />
          </div>
        </>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative rounded-br-[28px]">
        {showPreview ? (
          /* Preview Mode - Fullscreen WYSIWYG */
          <div className="fixed inset-0 z-50 bg-white overflow-auto">
            {/* Bouton retour en mode édition */}
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 z-50 px-4 py-2 bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg"
            >
              Mode édition
            </button>
            
            {/* Écran dynamique selon previewScreen */}
            <div 
              className="w-full min-h-screen relative"
              style={{
                background: canvasBackground.type === 'image'
                  ? `url(${canvasBackground.value}) center/cover no-repeat`
                  : canvasBackground.value || 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
              }}
            >
              {previewScreen === 'screen1' && (
                <>
              {/* Rendu des éléments de l'écran 1 */}
              {canvasElements
                .filter((el: any) => {
                  const screenId = el?.screenId || 'screen1';
                  return screenId === 'screen1';
                })
                .map((element: any) => {
                  const props = selectedDevice !== 'desktop' && element[selectedDevice]
                    ? { ...element, ...element[selectedDevice] }
                    : element;

                  return (
                    <div
                      key={element.id}
                      style={{
                        position: 'absolute',
                        left: `${props.x || 0}px`,
                        top: `${props.y || 0}px`,
                        width: props.width ? `${props.width}px` : 'auto',
                        height: props.height ? `${props.height}px` : 'auto',
                        transform: props.rotation ? `rotate(${props.rotation}deg)` : undefined,
                        zIndex: props.zIndex || 1,
                        pointerEvents: 'none'
                      }}
                    >
                      {element.type === 'text' && (
                        <div
                          style={{
                            fontSize: `${props.fontSize || 16}px`,
                            fontFamily: props.fontFamily || 'Arial',
                            fontWeight: props.fontWeight || 'normal',
                            fontStyle: props.fontStyle || 'normal',
                            textDecoration: props.textDecoration || 'none',
                            color: props.color || '#000000',
                            textAlign: (props.textAlign as any) || 'left',
                            lineHeight: props.lineHeight || 1.5,
                            letterSpacing: props.letterSpacing || 'normal',
                            textTransform: props.textTransform || 'none',
                            textShadow: props.textShadow,
                            backgroundColor: props.backgroundColor,
                            padding: props.padding,
                            borderRadius: props.borderRadius ? `${props.borderRadius}px` : undefined,
                            border: props.border,
                            boxShadow: props.boxShadow,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {props.content || 'Texte'}
                        </div>
                      )}
                      {element.type === 'image' && props.src && (
                        <img
                          src={props.src}
                          alt={props.alt || ''}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: (props.objectFit as any) || 'contain',
                            borderRadius: props.borderRadius ? `${props.borderRadius}px` : undefined,
                            border: props.border,
                            boxShadow: props.boxShadow,
                            opacity: props.opacity !== undefined ? props.opacity : 1
                          }}
                        />
                      )}
                      {element.type === 'shape' && (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: props.backgroundColor || '#cccccc',
                            borderRadius: props.shape === 'circle' ? '50%' : props.borderRadius ? `${props.borderRadius}px` : undefined,
                            border: props.border,
                            boxShadow: props.boxShadow,
                            opacity: props.opacity !== undefined ? props.opacity : 1
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              
              {/* Rendu des modules de l'écran 1 */}
              {modularPage.screens.screen1.map((module) => {
                if (module.type === 'BlocTexte') {
                  return (
                    <div
                      key={module.id}
                      style={{
                        padding: '20px',
                        textAlign: (module.align as any) || 'center',
                        color: module.textColor || '#000000',
                        fontSize: `${module.fontSize || 16}px`,
                        fontWeight: module.bold ? 'bold' : 'normal',
                        textTransform: module.uppercase ? 'uppercase' : 'none'
                      }}
                    >
                      {module.content || ''}
                    </div>
                  );
                }
                if (module.type === 'BlocBouton') {
                  return (
                    <div
                      key={module.id}
                      style={{
                        padding: '20px',
                        textAlign: (module.align as any) || 'center'
                      }}
                    >
                      <button
                        style={{
                          padding: module.padding || '14px 28px',
                          background: module.background || '#000000',
                          color: module.textColor || '#ffffff',
                          borderRadius: `${module.borderRadius || 8}px`,
                          border: 'none',
                          fontSize: '16px',
                          fontWeight: module.bold ? 'bold' : 'normal',
                          textTransform: module.uppercase ? 'uppercase' : 'none',
                          boxShadow: module.boxShadow || '0 4px 12px rgba(0, 0, 0, 0.15)',
                          cursor: 'pointer',
                          pointerEvents: 'auto'
                        }}
                        onClick={() => setPreviewScreen('screen2')}
                      >
                        {module.label || 'Bouton'}
                      </button>
                    </div>
                  );
                }
                return null;
              })}
                </>
              )}

              {previewScreen === 'screen2' && (
                <>
                  {/* Rendu des éléments de l'écran 2 */}
                  {canvasElements
                    .filter((el: any) => {
                      const screenId = el?.screenId || 'screen1';
                      return screenId === 'screen2';
                    })
                    .map((element: any) => {
                      const props = selectedDevice !== 'desktop' && element[selectedDevice]
                        ? { ...element, ...element[selectedDevice] }
                        : element;

                      return (
                        <div
                          key={element.id}
                          style={{
                            position: 'absolute',
                            left: `${props.x || 0}px`,
                            top: `${props.y || 0}px`,
                            width: props.width ? `${props.width}px` : 'auto',
                            height: props.height ? `${props.height}px` : 'auto',
                            transform: props.rotation ? `rotate(${props.rotation}deg)` : undefined,
                            zIndex: props.zIndex || 1,
                            pointerEvents: element.type === 'wheel' ? 'auto' : 'none'
                          }}
                        >
                          {element.type === 'text' && (
                            <div
                              style={{
                                fontSize: `${props.fontSize || 16}px`,
                                fontFamily: props.fontFamily || 'Arial',
                                fontWeight: props.fontWeight || 'normal',
                                fontStyle: props.fontStyle || 'normal',
                                textDecoration: props.textDecoration || 'none',
                                color: props.color || '#000000',
                                textAlign: (props.textAlign as any) || 'left',
                                lineHeight: props.lineHeight || 1.5,
                                letterSpacing: props.letterSpacing || 'normal',
                                textTransform: props.textTransform || 'none',
                                textShadow: props.textShadow,
                                backgroundColor: props.backgroundColor,
                                padding: props.padding,
                                borderRadius: props.borderRadius ? `${props.borderRadius}px` : undefined,
                                border: props.border,
                                boxShadow: props.boxShadow,
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              {props.content || 'Texte'}
                            </div>
                          )}
                          {element.type === 'image' && props.src && (
                            <img
                              src={props.src}
                              alt={props.alt || ''}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: (props.objectFit as any) || 'contain',
                                borderRadius: props.borderRadius ? `${props.borderRadius}px` : undefined,
                                border: props.border,
                                boxShadow: props.boxShadow,
                                opacity: props.opacity !== undefined ? props.opacity : 1
                              }}
                            />
                          )}
                          {element.type === 'shape' && (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: props.backgroundColor || '#cccccc',
                                borderRadius: props.shape === 'circle' ? '50%' : props.borderRadius ? `${props.borderRadius}px` : undefined,
                                border: props.border,
                                boxShadow: props.boxShadow,
                                opacity: props.opacity !== undefined ? props.opacity : 1
                              }}
                            />
                          )}
                          {element.type === 'wheel' && (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <SmartWheel
                                segments={campaignData?.gameConfig?.wheel?.segments || [
                                  { id: '1', label: 'Prix 1', color: extractedColors[0] || '#841b60', textColor: '#ffffff' },
                                  { id: '2', label: 'Prix 2', color: '#ffffff', textColor: extractedColors[0] || '#841b60' },
                                  { id: '3', label: 'Prix 3', color: extractedColors[0] || '#841b60', textColor: '#ffffff' },
                                  { id: '4', label: 'Prix 4', color: '#ffffff', textColor: extractedColors[0] || '#841b60' }
                                ]}
                                onResult={(result) => {
                                  console.log('Résultat de la roue:', result);
                                  // Passer à l'écran 3 après le spin
                                  setTimeout(() => setPreviewScreen('screen3'), 2000);
                                }}
                                borderStyle={wheelModalConfig?.wheelBorderStyle || campaignConfig?.design?.wheelConfig?.borderStyle || 'classic'}
                                borderColor={wheelModalConfig?.wheelBorderColor || campaignConfig?.design?.wheelConfig?.borderColor || extractedColors[0] || '#841b60'}
                                borderWidth={campaignConfig?.design?.wheelConfig?.borderWidth || 20}
                                scale={wheelModalConfig?.wheelScale || campaignConfig?.design?.wheelConfig?.scale || 1}
                                showBulbs={campaignConfig?.design?.wheelConfig?.showBulbs !== false}
                                brandColors={extractedColors}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  
                  {/* Rendu des modules de l'écran 2 */}
                  {modularPage.screens.screen2.map((module) => {
                    if (module.type === 'BlocTexte') {
                      return (
                        <div
                          key={module.id}
                          style={{
                            padding: '20px',
                            textAlign: (module.align as any) || 'center',
                            color: module.textColor || '#000000',
                            fontSize: `${module.fontSize || 16}px`,
                            fontWeight: module.bold ? 'bold' : 'normal',
                            textTransform: module.uppercase ? 'uppercase' : 'none'
                          }}
                        >
                          {module.content || ''}
                        </div>
                      );
                    }
                    if (module.type === 'BlocBouton') {
                      return (
                        <div
                          key={module.id}
                          style={{
                            padding: '20px',
                            textAlign: (module.align as any) || 'center'
                          }}
                        >
                          <button
                            style={{
                              padding: module.padding || '14px 28px',
                              background: module.background || '#000000',
                              color: module.textColor || '#ffffff',
                              borderRadius: `${module.borderRadius || 8}px`,
                              border: 'none',
                              fontSize: '16px',
                              fontWeight: module.bold ? 'bold' : 'normal',
                              textTransform: module.uppercase ? 'uppercase' : 'none',
                              boxShadow: module.boxShadow || '0 4px 12px rgba(0, 0, 0, 0.15)',
                              cursor: 'pointer',
                              pointerEvents: 'auto'
                            }}
                            onClick={() => setPreviewScreen('screen3')}
                          >
                            {module.label || 'Bouton'}
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })}
                </>
              )}

              {previewScreen === 'screen3' && (
                <div className="w-full min-h-screen flex flex-col items-center justify-center p-8">
                  {/* Rendu des éléments de l'écran 3 */}
                  {canvasElements
                    .filter((el: any) => {
                      const screenId = el?.screenId || 'screen1';
                      return screenId === 'screen3';
                    })
                    .map((element: any) => {
                      const props = selectedDevice !== 'desktop' && element[selectedDevice]
                        ? { ...element, ...element[selectedDevice] }
                        : element;

                      return (
                        <div
                          key={element.id}
                          style={{
                            position: 'absolute',
                            left: `${props.x || 0}px`,
                            top: `${props.y || 0}px`,
                            width: props.width ? `${props.width}px` : 'auto',
                            height: props.height ? `${props.height}px` : 'auto',
                            transform: props.rotation ? `rotate(${props.rotation}deg)` : undefined,
                            zIndex: props.zIndex || 1
                          }}
                        >
                          {element.type === 'text' && (
                            <div
                              style={{
                                fontSize: `${props.fontSize || 16}px`,
                                fontFamily: props.fontFamily || 'Arial',
                                fontWeight: props.fontWeight || 'normal',
                                color: props.color || '#000000',
                                textAlign: (props.textAlign as any) || 'left'
                              }}
                            >
                              {props.content || 'Texte'}
                            </div>
                          )}
                        </div>
                      );
                    })}

                  {/* Modules de l'écran 3 */}
                  {modularPage.screens.screen3.map((module) => {
                    if (module.type === 'BlocTexte') {
                      return (
                        <div
                          key={module.id}
                          style={{
                            padding: '20px',
                            textAlign: (module.align as any) || 'center',
                            color: module.textColor || '#000000',
                            fontSize: `${module.fontSize || 16}px`
                          }}
                        >
                          {module.content || ''}
                        </div>
                      );
                    }
                    return null;
                  })}

                  {/* Bouton retour à l'écran 1 */}
                  <button
                    onClick={() => setPreviewScreen('screen1')}
                    className="mt-8 px-6 py-3 rounded-lg text-white font-semibold"
                    style={{ background: extractedColors[0] || '#841b60' }}
                  >
                    Retour à l'accueil
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Design Editor Mode */
          <>
            {/* Hybrid Sidebar - Design & Technical (always vertical, with drawer from bottom) */}
            <HybridSidebar
                ref={sidebarRef}
                onAddElement={handleAddElement}
                onBackgroundChange={handleBackgroundChange}
                onExtractedColorsChange={handleExtractedColorsChange}
                currentBackground={canvasBackground}
                extractedColors={extractedColors} // Ajout des couleurs extraites
                campaignConfig={campaignConfig}
                onCampaignConfigChange={handleCampaignConfigChange}
                elements={canvasElements}
                onElementsChange={setCanvasElements}
                selectedElement={selectedElement}
                onElementUpdate={handleElementUpdate}
                showEffectsPanel={showEffectsInSidebar}
                onEffectsPanelChange={setShowEffectsInSidebar}
                showAnimationsPanel={showAnimationsInSidebar}
                onAnimationsPanelChange={setShowAnimationsInSidebar}
                showPositionPanel={showPositionInSidebar}
                onPositionPanelChange={setShowPositionInSidebar}
                showWheelPanel={showWheelPanel}
                onWheelPanelChange={setShowWheelPanel}
                showDesignPanel={showDesignInSidebar}
                onDesignPanelChange={(isOpen) => {
                  if (!isOpen) {
                    setShowDesignInSidebar(false);
                  }
                }}
                canvasRef={canvasRef}
                selectedElements={selectedElements}
                onSelectedElementsChange={setSelectedElements}
                onAddToHistory={addToHistory}
                wheelBorderStyle={wheelModalConfig?.wheelBorderStyle || campaignConfig?.design?.wheelConfig?.borderStyle}
                wheelBorderColor={wheelModalConfig?.wheelBorderColor || campaignConfig?.design?.wheelConfig?.borderColor}
                wheelBorderWidth={campaignConfig?.design?.wheelConfig?.borderWidth}
                wheelScale={
                  wheelModalConfig?.wheelScale !== undefined
                    ? wheelModalConfig.wheelScale
                    : campaignConfig?.design?.wheelConfig?.scale
                }
                wheelShowBulbs={campaignConfig?.design?.wheelConfig?.showBulbs}
                wheelPosition={campaignConfig?.design?.wheelConfig?.position}
                onWheelBorderStyleChange={setWheelBorderStyle}
                onForceElementsTab={() => {
                  // Utiliser la référence pour changer l'onglet actif
                  if (sidebarRef.current) {
                    sidebarRef.current.setActiveTab('elements');
                  }
                  // Fermer les autres panneaux
                  setShowEffectsInSidebar(false);
                  setShowAnimationsInSidebar(false);
                  setShowPositionInSidebar(false);
                }}
                onWheelBorderColorChange={setWheelBorderColor}
                onWheelBorderWidthChange={setWheelBorderWidth}
                onWheelScaleChange={setWheelScale}
                onWheelShowBulbsChange={setShowBulbs}
                onWheelPositionChange={setWheelPosition}
                selectedDevice={selectedDevice}
                hiddenTabs={effectiveHiddenTabs}
                colorEditingContext={designColorContext}
                className={isWindowMobile ? "vertical-sidebar-drawer" : ""}
                // Multi-screen system props
                currentScreen={currentScreen}
                onAddModule={handleAddModule}
                // Module selection props
                selectedModuleId={selectedModuleId}
                selectedModule={selectedModule}
                onModuleUpdate={handleModuleUpdate}
                onSelectedModuleChange={setSelectedModuleId}
              />
            {/* Canvas Scrollable Area with 3 screens */}
            <div className="flex-1 canvas-scroll-area relative z-20 rounded-br-[28px] rounded-bl-none" style={{ borderBottomLeftRadius: '0 !important' }}>
              <div className="min-h-full flex flex-col">
                {/* Premier Canvas - Screen 1 */}
                <div data-screen-anchor="screen1" className="relative">
                  <DesignCanvas
                    screenId="screen1"
                    ref={canvasRef}
                    selectedDevice={selectedDevice}
                    elements={canvasElements}
                    onElementsChange={setCanvasElements}
                    background={canvasBackground}
                    campaign={campaignData}
                    onCampaignChange={handleCampaignConfigChange}
                    zoom={canvasZoom}
                    onZoomChange={setCanvasZoom}
                    enableInternalAutoFit={true}
                    selectedElement={selectedElement}
                    onSelectedElementChange={setSelectedElement}
                    selectedElements={selectedElements}
                    onSelectedElementsChange={setSelectedElements}
                    onElementUpdate={handleElementUpdate}
                    // Wheel sync props
                    wheelModalConfig={wheelModalConfig}
                    extractedColors={extractedColors}
                    containerClassName={mode === 'template' ? 'bg-gray-50' : undefined}
                    elementFilter={(element: any) => {
                      const role = typeof element?.role === 'string' ? element.role.toLowerCase() : '';
                      return !role.includes('exit-message');
                    }}
                    // Sidebar panel triggers
                    onShowEffectsPanel={() => {
                        if (!isWindowMobile) {
                          setShowEffectsInSidebar(true);
                          setShowAnimationsInSidebar(false);
                          setShowPositionInSidebar(false);
                        }
                      }}
onShowAnimationsPanel={() => {
                        if (!isWindowMobile) {
                          setShowAnimationsInSidebar(true);
                          setShowEffectsInSidebar(false);
                          setShowPositionInSidebar(false);
                        }
                      }}
onShowPositionPanel={() => {
                        if (!isWindowMobile) {
                          setShowPositionInSidebar(true);
                          setShowEffectsInSidebar(false);
                          setShowAnimationsInSidebar(false);
                          setShowDesignInSidebar(false);
                        }
                      }}
              onShowDesignPanel={(context?: 'fill' | 'border' | 'text') => {
                // Met à jour le contexte immédiatement même si le panneau est déjà ouvert
                if (context) {
                  setDesignColorContext(context);
                }
                // Toujours ouvrir/forcer l'onglet Design
                setShowDesignInSidebar(true);
                setShowEffectsInSidebar(false);
                setShowAnimationsInSidebar(false);
                setShowPositionInSidebar(false);

                if (sidebarRef.current) {
                  sidebarRef.current.setActiveTab('background');
                }
              }}
              onOpenElementsTab={() => {
                // Utiliser la même logique que onForceElementsTab
                if (sidebarRef.current) {
                  sidebarRef.current.setActiveTab('elements');
                }
                // Fermer les autres panneaux
                setShowEffectsInSidebar(false);
                setShowAnimationsInSidebar(false);
                setShowPositionInSidebar(false);
              }}
                    // Mobile sidebar integrations
                    onAddElement={handleAddElement}
                    onBackgroundChange={handleBackgroundChange}
                    onExtractedColorsChange={handleExtractedColorsChange}
                    // Group selection wiring
                    selectedGroupId={selectedGroupId as any}
                    onSelectedGroupChange={setSelectedGroupId as any}
                    onUndo={undo}
                    onRedo={redo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    showWheelPanel={showWheelPanel}
                    onWheelPanelChange={setShowWheelPanel}
                    // Modular page (screen1)
                    modularModules={modularPage.screens.screen1}
                    onModuleUpdate={handleModuleUpdate}
                    selectedModuleId={selectedModuleId}
                    allowWheelInteraction={allowWheelInteraction}
                  />
                </div>

                {/* Deuxième Canvas - Screen 2 */}
                <div className="mt-4 relative" data-screen-anchor="screen2">
                  <div 
                    className="absolute inset-0 z-0"
                    style={{
                      background: canvasBackground.type === 'image'
                        ? `url(${canvasBackground.value}) center/cover no-repeat`
                        : canvasBackground.value || 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
                    }}
                  />
                  <div 
                    className="absolute -top-4 left-0 right-0 h-4 z-0"
                    style={{ background: '#ffffff' }}
                  />
                  <div className="relative z-10">
                    <DesignCanvas
                    screenId="screen2"
                    selectedDevice={selectedDevice}
                    elements={canvasElements.filter((el: any) => {
                      const role = typeof el?.role === 'string' ? el.role.toLowerCase() : '';
                      return !role.includes('exit-message');
                    })}
                    onElementsChange={setCanvasElements}
                      background={canvasBackground}
                      campaign={campaignData}
                      onCampaignChange={handleCampaignConfigChange}
                      zoom={canvasZoom}
                      onZoomChange={setCanvasZoom}
                      allowWheelInteraction={allowWheelInteraction}
                      selectedElement={selectedElement}
                      onSelectedElementChange={setSelectedElement}
                      selectedElements={selectedElements}
                      onSelectedElementsChange={setSelectedElements}
                      onElementUpdate={handleElementUpdate}
                      wheelModalConfig={wheelModalConfig}
                      extractedColors={extractedColors}
                      containerClassName={mode === 'template' ? 'bg-gray-50' : undefined}
                      elementFilter={(element: any) => {
                        const role = typeof element?.role === 'string' ? element.role.toLowerCase() : '';
                        return !role.includes('exit-message');
                      }}
                      onShowEffectsPanel={() => {
                        if (!isWindowMobile) {
                          setShowEffectsInSidebar(true);
                          setShowAnimationsInSidebar(false);
                          setShowPositionInSidebar(false);
                        }
                      }}
                      onShowAnimationsPanel={() => {
                        if (!isWindowMobile) {
                          setShowAnimationsInSidebar(true);
                          setShowEffectsInSidebar(false);
                          setShowPositionInSidebar(false);
                        }
                      }}
                      onShowPositionPanel={() => {
                        if (!isWindowMobile) {
                          setShowPositionInSidebar(true);
                          setShowEffectsInSidebar(false);
                          setShowAnimationsInSidebar(false);
                          setShowDesignInSidebar(false);
                        }
                      }}
                      onShowDesignPanel={(context?: 'fill' | 'border' | 'text') => {
                        if (context) {
                          setDesignColorContext(context);
                        }
                        setShowDesignInSidebar(true);
                        setShowEffectsInSidebar(false);
                        setShowAnimationsInSidebar(false);
                        setShowPositionInSidebar(false);
                        if (sidebarRef.current) {
                          sidebarRef.current.setActiveTab('background');
                        }
                      }}
                      onOpenElementsTab={() => {
                        if (sidebarRef.current) {
                          sidebarRef.current.setActiveTab('elements');
                        }
                        setShowEffectsInSidebar(false);
                        setShowAnimationsInSidebar(false);
                        setShowPositionInSidebar(false);
                      }}
                      onAddElement={handleAddElement}
                      onBackgroundChange={handleBackgroundChange}
                      onExtractedColorsChange={handleExtractedColorsChange}
                      selectedGroupId={selectedGroupId as any}
                      onSelectedGroupChange={setSelectedGroupId as any}
                      onUndo={undo}
                      onRedo={redo}
                      canUndo={canUndo}
                      canRedo={canRedo}
                      showWheelPanel={showWheelPanel}
                      onWheelPanelChange={setShowWheelPanel}
                      modularModules={modularPage.screens.screen2}
                      onModuleUpdate={handleModuleUpdate}
                      selectedModuleId={selectedModuleId}
                    />
                  </div>
                </div>

                {/* Troisième Canvas - Screen 3 */}
                <div className="mt-4 relative" data-screen-anchor="screen3">
                  <div 
                    className="absolute inset-0 z-0"
                    style={{
                      background: canvasBackground.type === 'image'
                        ? `url(${canvasBackground.value}) center/cover no-repeat`
                        : canvasBackground.value || 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
                    }}
                  />
                  <div 
                    className="absolute -top-4 left-0 right-0 h-4 z-0"
                    style={{ background: '#ffffff' }}
                  />
                  <div className="relative z-10">
                    <DesignCanvas
                    screenId="screen3"
                    selectedDevice={selectedDevice}
                    elements={canvasElements.filter((el: any) => {
                      const role = typeof el?.role === 'string' ? el.role.toLowerCase() : '';
                      return role.includes('exit-message');
                    })}
                    onElementsChange={setCanvasElements}
                      background={canvasBackground}
                      campaign={campaignData}
                      onCampaignChange={handleCampaignConfigChange}
                      zoom={canvasZoom}
                      onZoomChange={setCanvasZoom}
                      allowWheelInteraction={allowWheelInteraction}
                      selectedElement={selectedElement}
                      onSelectedElementChange={setSelectedElement}
                      selectedElements={selectedElements}
                      onSelectedElementsChange={setSelectedElements}
                      onElementUpdate={handleElementUpdate}
                      wheelModalConfig={wheelModalConfig}
                      extractedColors={extractedColors}
                      containerClassName={mode === 'template' ? 'bg-gray-50' : undefined}
                      elementFilter={(element: any) => {
                        const role = typeof element?.role === 'string' ? element.role.toLowerCase() : '';
                        return role.includes('exit-message');
                      }}
                      onShowEffectsPanel={() => {
                        if (!isWindowMobile) {
                          setShowEffectsInSidebar(true);
                          setShowAnimationsInSidebar(false);
                          setShowPositionInSidebar(false);
                        }
                      }}
                      onShowAnimationsPanel={() => {
                        if (!isWindowMobile) {
                          setShowAnimationsInSidebar(true);
                          setShowEffectsInSidebar(false);
                          setShowPositionInSidebar(false);
                        }
                      }}
                      onShowPositionPanel={() => {
                        if (!isWindowMobile) {
                          setShowPositionInSidebar(true);
                          setShowEffectsInSidebar(false);
                          setShowAnimationsInSidebar(false);
                          setShowDesignInSidebar(false);
                        }
                      }}
                      onShowDesignPanel={(context?: 'fill' | 'border' | 'text') => {
                        if (context) {
                          setDesignColorContext(context);
                        }
                        setShowDesignInSidebar(true);
                        setShowEffectsInSidebar(false);
                        setShowAnimationsInSidebar(false);
                        setShowPositionInSidebar(false);
                        if (sidebarRef.current) {
                          sidebarRef.current.setActiveTab('background');
                        }
                      }}
                      onOpenElementsTab={() => {
                        if (sidebarRef.current) {
                          sidebarRef.current.setActiveTab('elements');
                        }
                        setShowEffectsInSidebar(false);
                        setShowAnimationsInSidebar(false);
                        setShowPositionInSidebar(false);
                      }}
                      onAddElement={handleAddElement}
                      onBackgroundChange={handleBackgroundChange}
                      onExtractedColorsChange={handleExtractedColorsChange}
                      selectedGroupId={selectedGroupId as any}
                      onSelectedGroupChange={setSelectedGroupId as any}
                      onUndo={undo}
                      onRedo={redo}
                      canUndo={canUndo}
                      canRedo={canRedo}
                      showWheelPanel={showWheelPanel}
                      onWheelPanelChange={setShowWheelPanel}
                      modularModules={modularPage.screens.screen3}
                      onModuleUpdate={handleModuleUpdate}
                      selectedModuleId={selectedModuleId}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Zoom Slider with integrated Screen navigation button */}
            {!isWindowMobile && (
              <ZoomSlider 
                zoom={canvasZoom}
                onZoomChange={setCanvasZoom}
                minZoom={0.1}
                maxZoom={1}
                step={0.05}
                onNavigateToScreen2={() => {
                  const nextScreen = currentScreen === 'screen1'
                    ? 'screen2'
                    : currentScreen === 'screen2'
                      ? 'screen3'
                      : 'screen1';
                  const scrolled = scrollToScreen(nextScreen);
                  if (scrolled) {
                    setCurrentScreen(nextScreen);
                  }
                }}
                currentScreen={currentScreen}
              />
            )}
          </>
        )}
      </div>
      {/* Floating bottom-right actions (no band) - Hidden in preview */}
      {!showPreview && (
        <div className="fixed bottom-6 right-6 flex items-center gap-3 z-30">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center px-3 py-2 text-xs sm:text-sm border border-gray-300 bg-white/90 backdrop-blur rounded-lg hover:bg-white transition-colors shadow-sm"
            title="Fermer"
          >
            <X className="w-4 h-4 mr-1" />
            Fermer
          </button>
          <button
            onClick={handleSaveAndContinue}
            className="flex items-center px-3 py-2 text-xs sm:text-sm rounded-lg text-white bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] hover:opacity-95 transition-colors shadow-sm"
            title="Sauvegarder et continuer"
          >
            <Save className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Sauvegarder et continuer</span>
            <span className="sm:hidden">Sauvegarder</span>
          </button>
        </div>
      )}
    </MobileStableEditor>
    </div>
  );
};

export default DesignEditorLayout;
