import React, { useState, useMemo, useEffect, useRef, useCallback, lazy } from 'react';
// Align routing with QuizEditor via router adapter
import { useLocation, useNavigate } from '@/lib/router-adapter';
import { Save, X } from 'lucide-react';
const HybridSidebar = lazy(() => import('./HybridSidebar'));
const DesignToolbar = lazy(() => import('./DesignToolbar'));
import FunnelUnlockedGame from '@/components/funnels/FunnelUnlockedGame';

import ZoomSlider from './components/ZoomSlider';
const DesignCanvas = lazy(() => import('./DesignCanvas'));
import { useEditorStore } from '../../stores/editorStore';
import { useKeyboardShortcuts } from '../ModernEditor/hooks/useKeyboardShortcuts';
import { useUndoRedo, useUndoRedoShortcuts } from '../../hooks/useUndoRedo';
// Model Editor doesn't need wheel config sync
// import { useWheelConfigSync } from '../../hooks/useWheelConfigSync';
import { useGroupManager } from '../../hooks/useGroupManager';
import { getDeviceDimensions } from '../../utils/deviceDimensions';
import { getEditorDeviceOverride } from '@/utils/deviceOverrides';
import EditorStateCleanup from '../EditorStateCleanup';


import { useCampaigns } from '@/hooks/useCampaigns';
import { createSaveAndContinueHandler, saveCampaignToDB } from '@/hooks/useModernCampaignEditor/saveHandler';
import { quizTemplates } from '../../types/quizTemplates';

const KeyboardShortcutsHelp = lazy(() => import('../shared/KeyboardShortcutsHelp'));
const MobileStableEditor = lazy(() => import('./components/MobileStableEditor'));

interface ModelEditorLayoutProps {
  mode?: 'template' | 'campaign';
  hiddenTabs?: string[];
  // When true, show the form preview overlay (30% right) on canvas hover
  showFormOverlay?: boolean;
}

const ModelEditorLayout: React.FC<ModelEditorLayoutProps> = ({ mode = 'campaign', hiddenTabs, showFormOverlay = false }) => {
  const navigate = useNavigate();
  const getTemplateBaseWidths = useCallback((templateId?: string) => {
    const template = quizTemplates.find((tpl) => tpl.id === templateId) || quizTemplates[0];
    const width = template?.style?.containerWidth ?? 450;
    return { desktop: `${width}px`, mobile: `${width}px` };
  }, []);

  const initialTemplateWidths = useMemo(() => getTemplateBaseWidths('image-quiz'), [getTemplateBaseWidths]);

  // Hook pour surveiller les changements du store en temps réel
  const storeCampaign = useEditorStore((state) => state.campaign);
  
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

  // Zoom par défaut selon l'appareil, avec restauration depuis localStorage
  const getDefaultZoom = (device: 'desktop' | 'tablet' | 'mobile'): number => {
    try {
      const saved = localStorage.getItem(`editor-zoom-${device}`);
      if (saved) {
        const v = parseFloat(saved);
        if (!Number.isNaN(v) && v >= 0.1 && v <= 1) return v;
      }
    } catch {}
    if (device === 'mobile' && typeof window !== 'undefined') {
      const { width, height } = getDeviceDimensions('mobile');
      const scale = Math.min(window.innerWidth / width, window.innerHeight / height);
      return Math.min(scale, 1);
    }
    switch (device) {
      case 'desktop':
        return 0.7;
      case 'tablet':
        return 0.55;
      case 'mobile':
        return 0.45;
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
    // Utiliser le zoom sauvegardé si présent
    setCanvasZoom(getDefaultZoom(device));
  };

  // États principaux
  const [canvasElements, setCanvasElements] = useState<any[]>([]);
  const [canvasBackground, setCanvasBackground] = useState<{ type: 'color' | 'image'; value: string }>(() => (
    { type: 'color', value: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)' }
  ));
  const [canvasZoom, setCanvasZoom] = useState(getDefaultZoom(selectedDevice));

  // Sauvegarder le zoom à chaque changement pour persistance entre modes
  useEffect(() => {
    try {
      localStorage.setItem(`editor-zoom-${selectedDevice}`, String(canvasZoom));
    } catch {}
  }, [canvasZoom, selectedDevice]);

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
  // État pour l'onglet actif dans HybridSidebar
  const [activeTab, setActiveTab] = useState<string | null>('background');
  // Référence pour contrôler l'onglet actif dans HybridSidebar
  const sidebarRef = useRef<{ setActiveTab: (tab: string) => void }>(null); // Nouvelle référence pour suivre la demande d'ouverture
  // Context de couleur demandé depuis la toolbar ('fill' | 'border' | 'text')
  const [designColorContext, setDesignColorContext] = useState<'fill' | 'border' | 'text'>('fill');
  // Inline QuizConfigPanel visibility (controlled at layout level)
  const [showQuizPanel, setShowQuizPanel] = useState(false);
  const [showJackpotPanel, setShowJackpotPanel] = useState(false);
  const [campaignConfig, setCampaignConfig] = useState<any>({
    design: {
      quizConfig: {
        questionCount: 5,
        timeLimit: 30,
        style: {
          width: initialTemplateWidths.desktop,
          mobileWidth: initialTemplateWidths.mobile
        }
      }
    }
  });
  // Quiz config state
  const [quizConfig, setQuizConfig] = useState({
    questionCount: 5,
    timeLimit: 30,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    templateId: 'image-quiz',
    borderRadius: 12, // Valeur par défaut pour le border radius
    // Taille par défaut du quiz
    width: initialTemplateWidths.desktop,
    mobileWidth: initialTemplateWidths.mobile,
    height: 'auto',
    // Couleurs par défaut des boutons
    buttonBackgroundColor: '#f3f4f6',
    buttonTextColor: '#000000',
    buttonHoverBackgroundColor: '#9fa4a4',
    buttonActiveBackgroundColor: '#a7acb5'
  });

  // Quiz modal config - synchronisé avec quizConfig
  const [quizModalConfig, setQuizModalConfig] = useState<any>({
    templateId: quizConfig.templateId,
    borderRadius: quizConfig.borderRadius
  });

  // Synchroniser quizModalConfig avec quizConfig
  React.useEffect(() => {
    setQuizModalConfig((prev: any) => ({
      ...prev,
      templateId: quizConfig.templateId,
      borderRadius: quizConfig.borderRadius
    }));
  }, [quizConfig.templateId, quizConfig.borderRadius]);

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
        types: selectableElements.reduce((acc, el) => {
          acc[el.type] = (acc[el.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });
    } else {
      console.log('🎯 No selectable elements found on canvas');
    }
  }, [canvasElements]);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [showFunnel, setShowFunnel] = useState(false);
  useEffect(() => {
    if (!showFunnel) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setShowFunnel(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFunnel]);
  const [previewButtonSide, setPreviewButtonSide] = useState<'left' | 'right'>(() =>
    (typeof window !== 'undefined' && localStorage.getItem('previewButtonSide') === 'left') ? 'left' : 'right'
  );
  // Calcul des onglets à masquer selon le mode
  const effectiveHiddenTabs = useMemo(
    () => {
      const result = hiddenTabs ?? (mode === 'template' ? ['campaign', 'export', 'form'] : []);
      console.log('🔍 [DesignEditorLayout] effectiveHiddenTabs:', result, 'mode:', mode);
      return result;
    },
    [hiddenTabs, mode]
  );

  useEffect(() => {
    try {
      localStorage.setItem('previewButtonSide', previewButtonSide);
    } catch {}
  }, [previewButtonSide]);

  // Sur la page de form editor, activer immédiatement l'onglet "Jeu"
  useEffect(() => {
    if (showFormOverlay && sidebarRef.current) {
      try {
        sidebarRef.current.setActiveTab('game');
      } catch {}
    }
  }, [showFormOverlay]);

  // Activer la saisie directe sur double-clic pour tous les curseurs (input[type="range"]) de l'éditeur
  useEffect(() => {
    const handleDblClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Rechercher l'input range le plus proche (utile si on double-clique sur le track personnalisé)
      const range = target.closest('input[type="range"]') as HTMLInputElement | null;
      if (!range) return;

      // Empêcher les comportements par défaut, puis demander une saisie
      e.preventDefault();

      const min = Number(range.min || '0');
      const max = Number(range.max || '100');
      const step = Number(range.step || '1');
      const current = range.value || String((min + max) / 2);

      const suffixFromAria = /%/.test(range.getAttribute('aria-label') || '') ? '%' : '';
      const suffix = range.dataset.suffix || suffixFromAria;

      const label = `Entrer une valeur (${min} - ${max})${suffix ? ' ' + suffix : ''}`;
      const raw = window.prompt(label, current);
      if (raw == null) return; // annulé

      // Supporter virgule décimale et espaces
      const normalized = raw.replace(/\s+/g, '').replace(',', '.');
      let val = Number(normalized);
      if (Number.isNaN(val)) return;

      // Clamp min/max
      val = Math.min(max, Math.max(min, val));

      // Respecter le pas si applicable
      if (!Number.isNaN(step) && step > 0) {
        val = Math.round(val / step) * step;
      }

      // Appliquer la valeur et émettre les événements React
      range.value = String(val);
      range.dispatchEvent(new Event('input', { bubbles: true }));
      range.dispatchEvent(new Event('change', { bubbles: true }));
    };

    // Utiliser la capture pour attraper le double-clic même sur des éléments enfants stylisés
    document.addEventListener('dblclick', handleDblClick, true);
    return () => document.removeEventListener('dblclick', handleDblClick, true);
  }, []);

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
    setCanvasElements(prev => {
      const newArr = [...prev, element];
      setTimeout(() => {
        addToHistory({
          campaignConfig: { ...campaignConfig },
          canvasElements: JSON.parse(JSON.stringify(newArr)),
          canvasBackground: { ...canvasBackground }
        }, 'element_create');
      }, 0);
      return newArr;
    });
    setSelectedElement(element);
  };

  // Ajoute à l'historique lors du changement de background (granulaire)
  const handleBackgroundChange = (bg: any, options?: { screenId?: 'screen1' | 'screen2' | 'screen3'; applyToAllScreens?: boolean; device?: 'desktop' | 'tablet' | 'mobile' }) => {
    console.log('🎨 [ModelEditor] handleBackgroundChange:', { bg, options });
    
    if (options?.device) {
      // 📱 Stocker avec device-specific data
      const newBg = {
        ...bg,
        devices: {
          ...(canvasBackground?.devices || {}),
          [options.device]: bg
        }
      };
      console.log('📱 Updated background with device-specific data:', {
        deviceKey: options.device,
        newBg
      });
      setCanvasBackground(newBg);
    } else {
      setCanvasBackground(bg);
    }
    
    setTimeout(() => {
      addToHistory({
        campaignConfig: { ...campaignConfig },
        canvasElements: JSON.parse(JSON.stringify(canvasElements)),
        canvasBackground: { ...bg }
      }, 'background_update');
    }, 0);

    // Auto-theme quiz + form based on solid background color
    try {
      if (bg?.type === 'color' && typeof bg.value === 'string') {
        const base = bg.value as string;

        const toRgb = (color: string): { r: number; g: number; b: number } | null => {
          if (!color) return null;
          const hex = color.trim();
          const rgbMatch = hex.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
          if (rgbMatch) {
            return { r: +rgbMatch[1], g: +rgbMatch[2], b: +rgbMatch[3] };
          }
          const h = hex.replace('#', '');
          if (h.length === 3) {
            const r = parseInt(h[0] + h[0], 16);
            const g = parseInt(h[1] + h[1], 16);
            const b = parseInt(h[2] + h[2], 16);
            return { r, g, b };
          }
          if (h.length === 6) {
            const r = parseInt(h.slice(0, 2), 16);
            const g = parseInt(h.slice(2, 4), 16);
            const b = parseInt(h.slice(4, 6), 16);
            return { r, g, b };
          }
          return null;
        };
        const toHex = (rgb: { r: number; g: number; b: number }): string => {
          const c = (n: number) => n.toString(16).padStart(2, '0');
          return `#${c(Math.max(0, Math.min(255, Math.round(rgb.r))))}${c(Math.max(0, Math.min(255, Math.round(rgb.g))))}${c(Math.max(0, Math.min(255, Math.round(rgb.b))))}`;
        };
        const luminance = (rgb: { r: number; g: number; b: number }) => {
          const a = [rgb.r, rgb.g, rgb.b].map((v) => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
        };
        const darken = (rgb: { r: number; g: number; b: number }, pct: number) => ({
          r: rgb.r * (1 - pct),
          g: rgb.g * (1 - pct),
          b: rgb.b * (1 - pct)
        });
        const lighten = (rgb: { r: number; g: number; b: number }, pct: number) => ({
          r: rgb.r + (255 - rgb.r) * pct,
          g: rgb.g + (255 - rgb.g) * pct,
          b: rgb.b + (255 - rgb.b) * pct
        });
        const getTextOn = (rgb: { r: number; g: number; b: number }) => (luminance(rgb) > 0.55 ? '#111111' : '#ffffff');

        const baseRgb = toRgb(base);
        if (baseRgb) {
          // Choose a primary accent that contrasts with background
          const primaryRgb = luminance(baseRgb) > 0.6 ? darken(baseRgb, 0.35) : lighten(baseRgb, 0.35);
          const primaryHex = toHex(primaryRgb);
          const buttonText = getTextOn(primaryRgb);
          const hoverHex = toHex(darken(primaryRgb, 0.12));
          const activeHex = toHex(darken(primaryRgb, 0.24));

          setCampaignConfig((prev: any) => {
            const next = {
              ...(prev || {}),
              design: {
                ...(prev?.design || {}),
                // expose brand colors for forms + other UIs
                customColors: {
                  ...(prev?.design?.customColors || {}),
                  primary: primaryHex,
                  secondary: '#ffffff',
                  _updatedAt: Date.now()
                },
                quizConfig: {
                  ...(prev?.design?.quizConfig || {}),
                  style: {
                    ...(prev?.design?.quizConfig?.style || {}),
                    buttonBackgroundColor: primaryHex,
                    buttonTextColor: buttonText,
                    buttonHoverBackgroundColor: hoverHex,
                    buttonActiveBackgroundColor: activeHex
                  }
                }
              }
            };
            return next;
          });
        }
      }
    } catch (e) {
      console.warn('Auto-theme from background color failed:', e);
    }
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

      setCanvasElements(prev => {
        const newArr = prev.map(el =>
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

  // Mettre à jour les éléments du canvas avec le nouveau border radius
  const updateCanvasElementsBorderRadius = useCallback((borderRadius: number) => {
    console.log('🔄 updateCanvasElementsBorderRadius appelé avec:', borderRadius);
    
    // Mettre à jour campaignConfig avec le nouveau border radius
    setCampaignConfig((currentConfig: any) => {
      const updatedConfig = { ...currentConfig };
      updatedConfig.design = updatedConfig.design || {};
      updatedConfig.design.quizConfig = updatedConfig.design.quizConfig || {};
      // Ne pas écraser les couleurs; ne mettre à jour que borderRadius
      updatedConfig.design.quizConfig.style = {
        ...(updatedConfig.design.quizConfig.style || {}),
        borderRadius: `${borderRadius}px`
      };
      console.log('🎯 CampaignConfig mise à jour (borderRadius uniquement):', updatedConfig.design.quizConfig.style);
      return updatedConfig;
    });
    
    // Émettre un événement pour forcer le re-render du TemplatedQuiz
    const event = new CustomEvent('quizStyleUpdate', { 
      detail: { 
        borderRadius: `${borderRadius}px`
      } 
    });
    window.dispatchEvent(event);
    
    // Mettre à jour les éléments du canvas (pour compatibilité)
    setCanvasElements(currentElements => 
      currentElements.map(element => {
        if (element?.type === 'quiz' || element?.id === 'quiz-template') {
          return {
            ...element,
            borderRadius: `${borderRadius}px`,
            style: {
              ...(element.style || {}),
              borderRadius: `${borderRadius}px`
            }
          };
        }
        return element;
      })
    );
  }, [setCampaignConfig]);

  // Quiz Editor doesn't need wheel config sync - using quiz config instead
  const wheelModalConfig = null;

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
      setCanvasElements(prev => {
        const newElements = prev.filter(el => el.id !== targetElementId);
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
      setCanvasElements(prev => {
        const newElements = prev.filter(el => el.id !== elementId);
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
  
  // Synchronisation avec le store
  useEffect(() => {
    setPreviewDevice(selectedDevice);
  }, [selectedDevice, setPreviewDevice]);

  // Configuration de campagne dynamique optimisée avec synchronisation forcée
  const campaignData = useMemo(() => {
    const titleElement = canvasElements.find(el => el.type === 'text' && el.role === 'title');
    const descriptionElement = canvasElements.find(el => el.type === 'text' && el.role === 'description');
    const buttonElement = canvasElements.find(el => el.type === 'text' && el.role === 'button');
    
    // Synchronisation forcée avec le store en temps réel pour le form-editor
    const currentCampaignState = storeCampaign;
    
    const customTexts = canvasElements.filter(el => 
      el.type === 'text' && !['title', 'description', 'button'].includes(el.role)
    );
    const customImages = canvasElements.filter(el => el.type === 'image');

    // Fallback secondaire: template jackpot persisté localement
    const lsJackpotTemplate = (typeof window !== 'undefined') ? localStorage.getItem('jackpotTemplate') : null;

    // Primary color used by quiz buttons and participation form
    const toRgb = (color: string): { r: number; g: number; b: number } | null => {
      if (!color) return null;
      const m = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
      if (m) return { r: +m[1], g: +m[2], b: +m[3] };
      const h = color.replace('#', '');
      if (h.length === 3) return { r: parseInt(h[0]+h[0],16), g: parseInt(h[1]+h[1],16), b: parseInt(h[2]+h[2],16) };
      if (h.length === 6) return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) };
      return null;
    };
    const toHex = (rgb: { r: number; g: number; b: number }): string => {
      const c = (n: number) => n.toString(16).padStart(2, '0');
      return `#${c(Math.max(0, Math.min(255, Math.round(rgb.r))))}${c(Math.max(0, Math.min(255, Math.round(rgb.g))))}${c(Math.max(0, Math.min(255, Math.round(rgb.b))))}`;
    };
    const luminance = (rgb: { r: number; g: number; b: number }) => {
      const a = [rgb.r, rgb.g, rgb.b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    };
    const darken = (rgb: { r: number; g: number; b: number }, pct: number) => ({ r: rgb.r * (1 - pct), g: rgb.g * (1 - pct), b: rgb.b * (1 - pct) });
    const lighten = (rgb: { r: number; g: number; b: number }, pct: number) => ({ r: rgb.r + (255 - rgb.r) * pct, g: rgb.g + (255 - rgb.g) * pct, b: rgb.b + (255 - rgb.b) * pct });

    const configuredPrimary = campaignConfig?.design?.customColors?.primary as string | undefined;
    const primaryColor = (() => {
      if (configuredPrimary) return configuredPrimary;
      if (canvasBackground.type === 'image' && extractedColors[0]) return extractedColors[0];
      if (canvasBackground.type === 'color' && typeof canvasBackground.value === 'string') {
        const baseRgb = toRgb(canvasBackground.value);
        if (baseRgb) {
          const accentRgb = luminance(baseRgb) > 0.6 ? darken(baseRgb, 0.35) : lighten(baseRgb, 0.35);
          return toHex(accentRgb);
        }
      }
      return '#841b60';
    })();
    const secondaryColor = '#ffffff';

    // Build dynamic quiz questions for preview:
    const configuredQuestions = (
      (campaignState as any)?.quizConfig?.questions ||
      (campaignConfig as any)?.quizConfig?.questions ||
      (campaignState as any)?.gameConfig?.quiz?.questions ||
      (campaignConfig as any)?.gameConfig?.quiz?.questions ||
      []
    );
    
    console.log('🧭 [QuizEditorLayout] campaignData questions:', {
      count: Array.isArray(configuredQuestions) ? configuredQuestions.length : 0,
      device: selectedDevice
    });

    return {
      id: 'jackpot-design-preview',
      type: 'jackpot',
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
        // Styles du formulaire depuis campaignState
        ...(campaignState?.design || {}),
        jackpotConfig: {
          template: (() => {
            // Priorité 1: campaignState (état local)
            const stateTemplate = (campaignState?.gameConfig?.jackpot as any)?.template;
            if (stateTemplate) return stateTemplate;
            
            // Priorité 2: store global (préservation entre modes)
            const storeTemplate = (useEditorStore.getState()?.campaign?.gameConfig?.jackpot as any)?.template;
            if (storeTemplate) return storeTemplate;

            // Priorité 2b: localStorage (si disponible)
            if (lsJackpotTemplate) return lsJackpotTemplate;
            
            // Priorité 3: fallback par défaut
            return 'jackpot-frame';
          })(),
          symbols: (campaignState?.gameConfig?.jackpot as any)?.symbols || ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '🔔', '7️⃣'],
          style: {
            borderColor: (campaignState?.gameConfig?.jackpot as any)?.style?.borderColor || primaryColor || '#ffd700',
            backgroundColor: (campaignState?.gameConfig?.jackpot as any)?.style?.backgroundColor || '#ffffff',
            textColor: (campaignState?.gameConfig?.jackpot as any)?.style?.textColor || '#333333'
          },
          button: {
            text: (campaignState?.gameConfig?.jackpot as any)?.button?.text || 'SPIN',
            colors: {
              background: (campaignState?.gameConfig?.jackpot as any)?.button?.colors?.background || primaryColor || '#ffd700',
              border: (campaignState?.gameConfig?.jackpot as any)?.button?.colors?.border || '#b8860b',
              text: (campaignState?.gameConfig?.jackpot as any)?.button?.colors?.text || '#8b4513'
            }
          },
          customFrame: (campaignState?.gameConfig?.jackpot as any)?.customFrame || {},
          customTemplateUrl: (campaignState?.gameConfig?.jackpot as any)?.customTemplateUrl || ''
        }
      },
      gameConfig: {
        jackpot: {
          template: (() => {
            // Priorité 1: campaignState (état local)
            const stateTemplate = (campaignState?.gameConfig?.jackpot as any)?.template;
            if (stateTemplate) return stateTemplate;
            
            // Priorité 2: store global (préservation entre modes)
            const storeTemplate = (useEditorStore.getState()?.campaign?.gameConfig?.jackpot as any)?.template;
            if (storeTemplate) return storeTemplate;

            // Priorité 2b: localStorage (si disponible)
            if (lsJackpotTemplate) return lsJackpotTemplate;
            
            // Priorité 3: fallback par défaut
            return 'jackpot-frame';
          })(),
          symbols: (campaignState?.gameConfig?.jackpot as any)?.symbols || ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '🔔', '7️⃣'],
          style: {
            borderColor: (campaignState?.gameConfig?.jackpot as any)?.style?.borderColor || primaryColor || '#ffd700',
            backgroundColor: (campaignState?.gameConfig?.jackpot as any)?.style?.backgroundColor || '#ffffff',
            textColor: (campaignState?.gameConfig?.jackpot as any)?.style?.textColor || '#333333'
          },
          button: {
            text: (campaignState?.gameConfig?.jackpot as any)?.button?.text || 'SPIN',
            colors: {
              background: (campaignState?.gameConfig?.jackpot as any)?.button?.colors?.background || primaryColor || '#ffd700',
              border: (campaignState?.gameConfig?.jackpot as any)?.button?.colors?.border || '#b8860b',
              text: (campaignState?.gameConfig?.jackpot as any)?.button?.colors?.text || '#8b4513'
            }
          },
          customFrame: (campaignState?.gameConfig?.jackpot as any)?.customFrame || {},
          customTemplateUrl: (campaignState?.gameConfig?.jackpot as any)?.customTemplateUrl || '',
        }
      },
      buttonConfig: {
        text: buttonElement?.content || 'SPIN',
        color: primaryColor,
        textColor: buttonElement?.style?.color || '#ffffff',
        borderRadius: campaignConfig.borderRadius || '8px'
      },
      screens: [
        {
          title: titleElement?.content || (currentCampaignState as any)?.screens?.[1]?.title || 'Tentez votre chance !',
          description: descriptionElement?.content || (currentCampaignState as any)?.screens?.[1]?.description || 'Faites tourner les rouleaux et décrochez le jackpot',
          buttonText: buttonElement?.content || (currentCampaignState as any)?.screens?.[1]?.buttonText || 'SPIN'
        },
        {
          title: (currentCampaignState as any)?.screens?.[1]?.title || titleElement?.content || 'Vos informations',
          description: (currentCampaignState as any)?.screens?.[1]?.description || descriptionElement?.content || 'Remplissez le formulaire pour participer',
          buttonText: (currentCampaignState as any)?.buttonConfig?.text || buttonElement?.content || 'Participer'
        }
      ],
      // Champs de contact dynamiques avec synchronisation en temps réel
      formFields: currentCampaignState?.formFields || 
        ((campaignState as any)?.formFields !== undefined)
        ? ((campaignState as any)?.formFields as any)
        : [
            { id: 'prenom', label: 'Prénom', type: 'text', required: true },
            { id: 'nom', label: 'Nom', type: 'text', required: true },
            { id: 'email', label: 'Email', type: 'email', required: true }
          ],
      // Garder la configuration canvas pour compatibilité
      canvasConfig: {
        elements: canvasElements,
        background: canvasBackground,
        device: selectedDevice
      },
      // Debug: Ajouter les éléments directement pour le preview
      elements: canvasElements
    };
  }, [canvasElements, canvasBackground, campaignConfig, extractedColors, selectedDevice, wheelModalConfig, campaignState, storeCampaign]);

  // Synchronisation avec le store (éviter les boucles d'updates)
  const lastTransformedSigRef = useRef<string>('');
  useEffect(() => {
    if (!campaignData) return;

    const transformedCampaign = {
      ...campaignData,
      name: 'Ma Campagne',
      type: ((showFormOverlay ? 'form' : campaignData.type) || 'wheel') as 'wheel' | 'scratch' | 'jackpot' | 'quiz' | 'dice' | 'form' | 'memory' | 'puzzle',
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
        console.debug('🎰 [DesignEditorLayout] Jackpot template in transformedCampaign:', (transformedCampaign as any)?.gameConfig?.jackpot?.template);
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

        const result = {
          ...prev,
          ...transformedCampaign,
          gameConfig: {
            ...prev.gameConfig,
            ...(transformedCampaign as any).gameConfig,
            jackpot: (() => {
              const prevJackpot = (prev.gameConfig?.jackpot as any) || {};
              const nextJackpot = (((transformedCampaign as any)?.gameConfig?.jackpot) as any) || {};
              const prevTemplate = prevJackpot?.template;
              const nextTemplate = nextJackpot?.template;
              
              // Priorité absolue: localStorage pour éviter les resets
              let effectiveTemplate = prevTemplate ?? nextTemplate;
              try {
                const lsTemplate = localStorage.getItem('jackpotTemplate');
                if (lsTemplate) effectiveTemplate = lsTemplate;
              } catch {}
              
              effectiveTemplate = effectiveTemplate ?? 'jackpot-frame';
              
              return {
                ...prevJackpot,
                ...nextJackpot,
                template: effectiveTemplate
              };
            })(),
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
          }
        } as any;
        
        if (process.env.NODE_ENV !== 'production') {
          console.debug('🎰 [DesignEditorLayout] Final merged jackpot template:', result?.gameConfig?.jackpot?.template);
        }
        
        return result;
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
    setShowFunnel(!showFunnel);
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
      const toRgb = (color: string): { r: number; g: number; b: number } | null => {
        if (!color) return null;
        const m = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
        if (m) return { r: +m[1], g: +m[2], b: +m[3] };
        const h = color.replace('#', '');
        if (h.length === 3) return { r: parseInt(h[0]+h[0],16), g: parseInt(h[1]+h[1],16), b: parseInt(h[2]+h[2],16) };
        if (h.length === 6) return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) };
        return null;
      };
      const toHex = (rgb: { r: number; g: number; b: number }): string => {
        const c = (n: number) => n.toString(16).padStart(2, '0');
        return `#${c(Math.max(0, Math.min(255, Math.round(rgb.r))))}${c(Math.max(0, Math.min(255, Math.round(rgb.g))))}${c(Math.max(0, Math.min(255, Math.round(rgb.b))))}`;
      };
      const luminance = (rgb: { r: number; g: number; b: number }) => {
        const a = [rgb.r, rgb.g, rgb.b].map((v) => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
      };
      const darken = (rgb: { r: number; g: number; b: number }, pct: number) => ({ r: rgb.r * (1 - pct), g: rgb.g * (1 - pct), b: rgb.b * (1 - pct) });

      const primaryRgb = toRgb(primaryColor) || { r: 132, g: 27, b: 96 }; // fallback #841b60
      const buttonText = luminance(primaryRgb) > 0.55 ? '#111111' : '#ffffff';
      const hoverHex = toHex(darken(primaryRgb, 0.12));
      const activeHex = toHex(darken(primaryRgb, 0.24));

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
          // Appliquer aussi aux styles du quiz
          quizConfig: {
            ...(currentConfig.design?.quizConfig || {}),
            style: {
              ...(currentConfig.design?.quizConfig?.style || {}),
              buttonBackgroundColor: (primaryColor.startsWith('#') ? primaryColor : toHex(primaryRgb)),
              buttonTextColor: buttonText,
              buttonHoverBackgroundColor: hoverHex,
              buttonActiveBackgroundColor: activeHex
            }
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
      if (selectedElement?.type === 'text') {
        handleElementUpdate({ textAlign: 'left' });
      }
    },
    onAlignTextCenter: () => {
      if (selectedElement?.type === 'text') {
        handleElementUpdate({ textAlign: 'center' });
      }
    },
    onAlignTextRight: () => {
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

  useEffect(() => {
    const handleOpenQuizConfig = () => {
      console.log('📋 Événement openQuizConfig reçu - Ouverture du panneau Quiz');
      setShowQuizPanel(true);
    };

    const handleOpenJackpotConfig = () => {
      console.log('🎰 Événement openJackpotConfig reçu - Ouverture du panneau Jackpot');
      setShowJackpotPanel(true);
    };

    window.addEventListener('openQuizConfig', handleOpenQuizConfig);
    window.addEventListener('openJackpotConfig', handleOpenJackpotConfig);
    return () => {
      window.removeEventListener('openQuizConfig', handleOpenQuizConfig);
      window.removeEventListener('openJackpotConfig', handleOpenJackpotConfig);
    };
  }, []);


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
    <MobileStableEditor className={showFunnel ? "h-[100dvh] min-h-[100dvh] w-full bg-transparent flex flex-col overflow-hidden" : "h-[100dvh] min-h-[100dvh] w-full bg-transparent flex flex-col overflow-hidden pt-[1.25cm] pb-[6px] rounded-tl-[28px] rounded-tr-[28px] rounded-br-[28px] transform -translate-y-[0.4vh]"}>
      {/* Nettoyage des états d'éditeur */}
      <EditorStateCleanup />
      
      {/* Top Toolbar - Hidden only in preview mode */}
      {!showFunnel && (
        <>
          <DesignToolbar
            selectedDevice={selectedDevice}
            onDeviceChange={handleDeviceChange}
            onPreviewToggle={handlePreview}
            isPreviewMode={showFunnel}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            previewButtonSide={previewButtonSide}
            onPreviewButtonSideChange={setPreviewButtonSide}
            mode={mode}
            onSave={handleSaveAndContinue}
            showSaveCloseButtons={false}
            onNavigateToSettings={handleNavigateToSettings}
          />

          {/* Bouton d'aide des raccourcis clavier */}
          <div className="absolute top-4 right-4 z-10">
            <KeyboardShortcutsHelp shortcuts={shortcuts} />
          </div>
        </>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative rounded-br-[28px]">
          {/* Overlay Preview: full live funnel (matches other editors) */}
          {showFunnel && (() => {
            const previewCampaign = {
              ...campaignData, // Utiliser campaignData qui est synchronisé avec le store
              type: (showFormOverlay ? 'form' : campaignData?.type) || 'wheel',
              design: {
                ...campaignData?.design,
                background: canvasBackground
              },
              canvasConfig: {
                elements: canvasElements,
                background: canvasBackground
              }
            } as any;

            // Pour le form-editor, afficher le formulaire en plein écran
            if (showFormOverlay) {
              const node = (
                <div className="group fixed inset-0 z-[9999] w-full h-[100dvh] min-h-[100dvh] overflow-hidden bg-transparent flex">
                  {/* Floating Edit Mode Button */}
                  <button
                    onClick={() => setShowFunnel(false)}
                    className={`absolute ${previewButtonSide === 'left' ? 'left-4' : 'right-4'} z-50 px-4 py-2 bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] text-white rounded-lg shadow-lg transition-opacity duration-300 opacity-100`}
                    style={{ top: 'calc(var(--editor-preview-toolbar-offset, 72px) + 16px)' }}
                    aria-label="Retourner en mode édition"
                  >
                    Mode édition
                </button>
                <div className="relative w-full h-full">
                  {/* Afficher le formulaire en plein écran comme les autres éditeurs */}
                  <FunnelUnlockedGame 
                    campaign={previewCampaign}
                    previewMode={selectedDevice}
                    wheelModalConfig={quizModalConfig}
                  />
                </div>
                {/* Fallback exit control (bottom-left) */}
                <button
                  onClick={() => setShowFunnel(false)}
                  className="absolute bottom-4 left-4 z-[100000] px-3 py-1.5 text-xs sm:text-sm bg-black/70 text-white rounded-md shadow-md"
                  aria-label="Quitter l'aperçu (Échap)"
                  title="Quitter l'aperçu (Échap)"
                >
                  Quitter l'aperçu (Échap)
                </button>
              </div>
              );
              return node;
            }

            // Pour les autres types de jeux, utiliser FunnelUnlockedGame
            const node = (
              <div className="group fixed inset-0 z-[9999] w-full h-[100dvh] min-h-[100dvh] overflow-hidden bg-transparent flex">
                {/* Floating Edit Mode Button */}
                <button
                  onClick={() => setShowFunnel(false)}
                  className={`absolute ${previewButtonSide === 'left' ? 'left-4' : 'right-4'} z-50 px-4 py-2 bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] text-white rounded-lg shadow-lg transition-opacity duration-300 opacity-100`}
                  style={{ top: 'calc(var(--editor-preview-toolbar-offset, 72px) + 16px)' }}
                  aria-label="Retourner en mode édition"
                >
                  Mode édition
                </button>
                <div className="relative w-full h-full">
                  <FunnelUnlockedGame 
                    campaign={previewCampaign}
                    previewMode={selectedDevice}
                    wheelModalConfig={quizModalConfig}
                  />
                </div>
                {/* Fallback exit control (bottom-left) */}
                <button
                  onClick={() => setShowFunnel(false)}
                  className="absolute bottom-4 left-4 z-[100000] px-3 py-1.5 text-xs sm:text-sm bg-black/70 text-white rounded-md shadow-md"
                  aria-label="Quitter l'aperçu (Échap)"
                  title="Quitter l'aperçu (Échap)"
                >
                  Quitter l'aperçu (Échap)
                </button>
              </div>
            );
            return node as any;
          })()}
          {/* Design Editor Mode */}
          {!showFunnel && (
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
                showQuizPanel={showQuizPanel}
                onQuizPanelChange={setShowQuizPanel}
                showJackpotPanel={showJackpotPanel}
                onJackpotPanelChange={setShowJackpotPanel}
                showDesignPanel={showDesignInSidebar}
                onDesignPanelChange={(isOpen) => {
                  if (!isOpen) {
                    setShowDesignInSidebar(false);
                  }
                }}
                activeTab={activeTab}
                onActiveTabChange={setActiveTab}
                canvasRef={canvasRef}
                selectedElements={selectedElements}
                onSelectedElementsChange={setSelectedElements}
                onAddToHistory={addToHistory}
                // Quiz sync props
                quizQuestionCount={quizConfig.questionCount}
                quizTimeLimit={quizConfig.timeLimit}
                quizDifficulty={quizConfig.difficulty}
                quizBorderRadius={quizConfig.borderRadius}
                selectedQuizTemplate={quizConfig.templateId}
                onQuizQuestionCountChange={(count) => setQuizConfig(prev => ({ ...prev, questionCount: count }))}
                onQuizTimeLimitChange={(time) => setQuizConfig(prev => ({ ...prev, timeLimit: time }))}
                onQuizDifficultyChange={(difficulty) => setQuizConfig(prev => ({ ...prev, difficulty }))}
                onQuizBorderRadiusChange={(borderRadius) => {
                  setQuizConfig(prev => ({ ...prev, borderRadius }));
                  updateCanvasElementsBorderRadius(borderRadius);
                }}
                onQuizTemplateChange={(templateId) => {
                  console.log('🎯 Changement de template quiz:', templateId);
                  const { desktop, mobile } = getTemplateBaseWidths(templateId);

                  setQuizConfig(prev => ({
                    ...prev,
                    templateId,
                    width: desktop,
                    mobileWidth: mobile
                  }));

                  setCampaignConfig((current: any) => ({
                    ...current,
                    design: {
                      ...current.design,
                      quizConfig: {
                        ...current.design.quizConfig,
                        templateId,
                        style: {
                          ...(current.design.quizConfig?.style || {}),
                          width: desktop,
                          mobileWidth: mobile
                        }
                      }
                    }
                  }));

                  try {
                    const event = new CustomEvent('quizStyleUpdate', { detail: { width: desktop, mobileWidth: mobile } });
                    (document.getElementById('quiz-preview-container') || window).dispatchEvent(event);
                  } catch (error) {
                    console.error('❌ Erreur lors de la diffusion de quizStyleUpdate après changement de template (ModelEditor):', error);
                  }
                }}
                // Gestion de la largeur du quiz
                quizWidth={typeof quizConfig.width === 'string' ? quizConfig.width : initialTemplateWidths.desktop}
                onQuizWidthChange={(width) => {
                  // S'assurer que width est une chaîne avec 'px' à la fin
                  const normalizedWidth = width.endsWith('px') ? width : `${width}px`;
                  console.log('🔄 Mise à jour de la largeur du quiz:', normalizedWidth);
                  
                  setQuizConfig(prev => ({ ...prev, width: normalizedWidth }));
                  
                  // Mettre à jour campaignConfig
                  setCampaignConfig((current: any) => {
                    const updated = {
                      ...current,
                      design: {
                        ...current.design,
                        quizConfig: {
                          ...current.design.quizConfig,
                          style: {
                            ...(current.design.quizConfig?.style || {}),
                            width: normalizedWidth
                          }
                        }
                      }
                    };
                    console.log('📝 Nouvelle configuration de campagne (width):', updated);
                    return updated;
                  });
                  
                  // Créer et dispatcher l'événement personnalisé
                  try {
                    const event = new CustomEvent('quizStyleUpdate', {
                      detail: { width }
                    });
                    
                    const logData = {
                      type: 'quizStyleUpdate',
                      detail: { width },
                      timestamp: new Date().toISOString(),
                      target: 'window',
                      bubbles: true,
                      cancelable: true,
                      composed: true
                    };
                    
                    console.log('📤 [DesignEditorLayout] Émission de l\'événement quizStyleUpdate (width):', logData);
                    
                    // Émettre l'événement de manière synchrone
                    const target = document.getElementById('quiz-preview-container') || window;
                    const eventDispatched = target.dispatchEvent(event);
                    
                    console.log('📤 [DesignEditorLayout] Événement émis avec succès:', {
                      eventDispatched,
                      target: target === window ? 'window' : 'quiz-preview-container'
                    });
                    
                    // Si l'événement n'a pas été traité, émettre un événement de secours
                    if (!eventDispatched) {
                      console.warn('⚠️ [DesignEditorLayout] L\'événement n\'a pas été traité, tentative avec un événement de secours');
                      const fallbackEvent = new CustomEvent('quizStyleUpdateFallback', {
                        detail: { width },
                        bubbles: true,
                        cancelable: true
                      });
                      target.dispatchEvent(fallbackEvent);
                    }
                  } catch (error) {
                    console.error('❌ Erreur lors de l\'émission de l\'événement quizStyleUpdate:', error);
                  }
                }}
                // Gestion de la largeur mobile du quiz
                quizMobileWidth={typeof quizConfig.mobileWidth === 'string' ? quizConfig.mobileWidth : initialTemplateWidths.mobile}
                onQuizMobileWidthChange={(width) => {
                  // S'assurer que width est une chaîne avec 'px' à la fin
                  const normalizedWidth = width.endsWith('px') ? width : `${width}px`;
                  console.log('🔄 Mise à jour de la largeur mobile du quiz:', normalizedWidth);
                  
                  setQuizConfig(prev => ({ ...prev, mobileWidth: normalizedWidth }));
                  
                  // Mettre à jour campaignConfig
                  setCampaignConfig((current: any) => {
                    const updated = {
                      ...current,
                      design: {
                        ...current.design,
                        quizConfig: {
                          ...current.design.quizConfig,
                          style: {
                            ...(current.design.quizConfig?.style || {}),
                            mobileWidth: normalizedWidth
                          }
                        }
                      }
                    };
                    console.log('📝 Nouvelle configuration de campagne (mobileWidth):', updated);
                    return updated;
                  });
                  
                  // Créer et dispatcher l'événement personnalisé
                  try {
                    const event = new CustomEvent('quizStyleUpdate', {
                      detail: { mobileWidth: width }
                    });
                    
                    const logData = {
                      type: 'quizStyleUpdate',
                      detail: { mobileWidth: width },
                      timestamp: new Date().toISOString(),
                      target: 'window',
                      bubbles: true,
                      cancelable: true,
                      composed: true
                    };
                    
                    console.log('📤 [DesignEditorLayout] Émission de l\'événement quizStyleUpdate (mobileWidth):', logData);
                    
                    // Émettre l'événement de manière synchrone
                    const target = document.getElementById('quiz-preview-container') || window;
                    const eventDispatched = target.dispatchEvent(event);
                    
                    console.log('✅ [DesignEditorLayout] Événement quizStyleUpdate (mobileWidth) émis avec succès:', eventDispatched);
                  } catch (error) {
                    console.error('❌ Erreur lors de l\'émission de l\'événement quizStyleUpdate (mobileWidth):', error);
                  }
                }}
                // Gestion des couleurs des boutons
                onButtonBackgroundColorChange={(color) => {
                  setQuizConfig(prev => ({
                    ...prev,
                    buttonBackgroundColor: color,
                    // Mettre à jour automatiquement la couleur de survol si elle n'a pas été personnalisée
                    buttonHoverBackgroundColor: prev.buttonHoverBackgroundColor === prev.buttonBackgroundColor 
                      ? color 
                      : prev.buttonHoverBackgroundColor,
                    buttonActiveBackgroundColor: prev.buttonActiveBackgroundColor === prev.buttonBackgroundColor
                      ? color
                      : prev.buttonActiveBackgroundColor
                  }));
                  // Mettre à jour campaignConfig
                  setCampaignConfig((current: any) => ({
                    ...current,
                    design: {
                      ...current.design,
                      quizConfig: {
                        ...current.design.quizConfig,
                        style: {
                          ...(current.design.quizConfig?.style || {}),
                          buttonBackgroundColor: color
                        }
                      }
                    }
                  }));
                }}
                onButtonTextColorChange={(color) => {
                  setQuizConfig(prev => ({ ...prev, buttonTextColor: color }));
                  // Mettre à jour campaignConfig
                  setCampaignConfig((current: any) => ({
                    ...current,
                    design: {
                      ...current.design,
                      quizConfig: {
                        ...current.design.quizConfig,
                        style: {
                          ...(current.design.quizConfig?.style || {}),
                          buttonTextColor: color
                        }
                      }
                    }
                  }));
                }}
                onButtonHoverBackgroundColorChange={(color) => {
                  setQuizConfig(prev => ({
                    ...prev,
                    buttonHoverBackgroundColor: color,
                    // Mettre à jour automatiquement la couleur active si elle n'a pas été personnalisée
                    buttonActiveBackgroundColor: prev.buttonActiveBackgroundColor === prev.buttonHoverBackgroundColor
                      ? color
                      : prev.buttonActiveBackgroundColor
                  }));
                  // Mettre à jour campaignConfig
                  setCampaignConfig((current: any) => ({
                    ...current,
                    design: {
                      ...current.design,
                      quizConfig: {
                        ...current.design.quizConfig,
                        style: {
                          ...(current.design.quizConfig?.style || {}),
                          buttonHoverBackgroundColor: color
                        }
                      }
                    }
                  }));
                }}
                onButtonActiveBackgroundColorChange={(color) => {
                  setQuizConfig(prev => ({ ...prev, buttonActiveBackgroundColor: color }));
                  // Mettre à jour campaignConfig
                  setCampaignConfig((current: any) => ({
                    ...current,
                    design: {
                      ...current.design,
                      quizConfig: {
                        ...current.design.quizConfig,
                        style: {
                          ...(current.design.quizConfig?.style || {}),
                          buttonActiveBackgroundColor: color
                        }
                      }
                    }
                  }));
                }}
                // Passer les couleurs actuelles
                buttonBackgroundColor={quizConfig.buttonBackgroundColor}
                buttonTextColor={quizConfig.buttonTextColor}
                buttonHoverBackgroundColor={quizConfig.buttonHoverBackgroundColor}
                buttonActiveBackgroundColor={quizConfig.buttonActiveBackgroundColor}
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
                selectedDevice={selectedDevice}
                hiddenTabs={effectiveHiddenTabs}
                colorEditingContext={designColorContext}
                className={isWindowMobile ? "vertical-sidebar-drawer" : ""}
              />
            {/* Main Canvas Area */}
            <DesignCanvas
              ref={canvasRef}
              selectedDevice={selectedDevice}
              elements={canvasElements}
              onElementsChange={setCanvasElements}
              background={canvasBackground?.devices?.[selectedDevice] || canvasBackground}
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
              // Quiz sync props
              extractedColors={extractedColors}
              quizModalConfig={quizModalConfig}
              containerClassName={mode === 'template' ? 'bg-gray-50' : undefined}
              // Show the form overlay only if requested by the page
              showFormOverlay={showFormOverlay}
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
              // Quiz panels
              showQuizPanel={showQuizPanel}
              onQuizPanelChange={setShowQuizPanel}
              showJackpotPanel={showJackpotPanel}
              onJackpotPanelChange={setShowJackpotPanel}
            />
            {/* Zoom Slider - Hidden when window is in mobile format */}
            {!isWindowMobile && (
              <ZoomSlider 
                zoom={canvasZoom}
                onZoomChange={setCanvasZoom}
                minZoom={0.1}
                maxZoom={1}
                step={0.05}
              />
            )}
          </>
          )}
      </div>
      {/* Floating bottom-right actions (no band) */}
      {!showFunnel && (
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

export default ModelEditorLayout;
