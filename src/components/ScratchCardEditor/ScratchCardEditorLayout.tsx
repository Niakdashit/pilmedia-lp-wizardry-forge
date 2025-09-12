import React, { useState, useMemo, useEffect, useRef, useCallback, lazy } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, Save, X } from 'lucide-react';
const HybridSidebar = lazy(() => import('./HybridSidebar'));
const DesignToolbar = lazy(() => import('./DesignToolbar'));
const FunnelUnlockedGame = lazy(() => import('../funnels/FunnelUnlockedGame'));
import GradientBand from '../shared/GradientBand';

import ZoomSlider from './components/ZoomSlider';
const DesignCanvas = lazy(() => import('./DesignCanvas'));
import { useEditorStore } from '../../stores/editorStore';
import { useKeyboardShortcuts } from '../ModernEditor/hooks/useKeyboardShortcuts';
import { useUndoRedo, useUndoRedoShortcuts } from '../../hooks/useUndoRedo';
// ScratchCard Editor doesn't need wheel config sync
// import { useWheelConfigSync } from '../../hooks/useWheelConfigSync';
import { useGroupManager } from '../../hooks/useGroupManager';
import { getDeviceDimensions } from '../../utils/deviceDimensions';


import { useCampaigns } from '@/hooks/useCampaigns';
import { createSaveAndContinueHandler, saveCampaignToDB } from '@/hooks/useModernCampaignEditor/saveHandler';

const KeyboardShortcutsHelp = lazy(() => import('../shared/KeyboardShortcutsHelp'));
const MobileStableEditor = lazy(() => import('./components/MobileStableEditor'));

interface ScratchCardEditorLayoutProps {
  mode?: 'template' | 'campaign';
  hiddenTabs?: string[];
}

const ScratchCardEditorLayout: React.FC<ScratchCardEditorLayoutProps> = ({ mode = 'campaign', hiddenTabs }) => {
  const navigate = useNavigate();
  // Détection automatique de l'appareil basée sur l'user-agent pour éviter le basculement lors du redimensionnement de fenêtre
  const detectDevice = (): 'desktop' | 'tablet' | 'mobile' => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    if (/Mobi|Android/i.test(ua)) return 'mobile';
    if (/Tablet|iPad/i.test(ua)) return 'tablet';
    return 'desktop';
  };

  // Détection de l'appareil physique réel (pour l'interface)
  const [actualDevice, setActualDevice] = useState<'desktop' | 'tablet' | 'mobile'>(detectDevice());

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
    mode === 'template'
      ? { type: 'color', value: '#4ECDC4' }
      : { type: 'color', value: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)' }
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
  
  const [showDesignInSidebar, setShowDesignInSidebar] = useState(false);
  // Référence pour contrôler l'onglet actif dans HybridSidebar
  const sidebarRef = useRef<{ setActiveTab: (tab: string) => void }>(null); // Nouvelle référence pour suivre la demande d'ouverture
  // Context de couleur demandé depuis la toolbar ('fill' | 'border' | 'text')
  const [designColorContext, setDesignColorContext] = useState<'fill' | 'border' | 'text'>('fill');
  // Inline QuizConfigPanel visibility (controlled at layout level)
  const [showQuizPanel, setShowQuizPanel] = useState(false);
  const [campaignConfig, setCampaignConfig] = useState<any>({
    design: {
      quizConfig: {
        questionCount: 5,
        timeLimit: 30
      }
    }
  });
  // Quiz config state
  const [quizConfig] = useState({
    questionCount: 5,
    timeLimit: 30,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    templateId: 'image-quiz',
    borderRadius: 12, // Valeur par défaut pour le border radius
    // Taille par défaut du quiz
    width: '800px',
    mobileWidth: '400px',
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
  const handleBackgroundChange = (bg: any) => {
    setCanvasBackground(bg);
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

  // ScratchCard Editor doesn't need wheel config sync - using scratch config instead
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
    
    const customTexts = canvasElements.filter(el => 
      el.type === 'text' && !['title', 'description', 'button'].includes(el.role)
    );
    const customImages = canvasElements.filter(el => el.type === 'image');

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
      id: 'quiz-design-preview',
      type: 'quiz',
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
        quizConfig: {
          questionCount: campaignConfig?.design?.quizConfig?.questionCount || quizConfig.questionCount || 5,
          timeLimit: campaignConfig?.design?.quizConfig?.timeLimit || quizConfig.timeLimit || 30,
          templateId: quizConfig.templateId,
          style: {
            ...campaignConfig?.design?.quizConfig?.style,
            buttonBackgroundColor: campaignConfig?.design?.quizConfig?.style?.buttonBackgroundColor || quizConfig.buttonBackgroundColor,
            buttonTextColor: campaignConfig?.design?.quizConfig?.style?.buttonTextColor || quizConfig.buttonTextColor,
            buttonHoverBackgroundColor: campaignConfig?.design?.quizConfig?.style?.buttonHoverBackgroundColor || quizConfig.buttonHoverBackgroundColor,
            buttonActiveBackgroundColor: campaignConfig?.design?.quizConfig?.style?.buttonActiveBackgroundColor || quizConfig.buttonActiveBackgroundColor,
            borderRadius: campaignConfig?.design?.quizConfig?.style?.borderRadius || `${quizConfig.borderRadius}px` || '8px',
            // Styles pour le texte
            textColor: campaignConfig?.design?.quizConfig?.style?.textColor || '#000000',
            questionTextWrap: 'break-word',
            answerTextWrap: 'break-word',
            // Zoom/largeur - respecter les valeurs ajustées par le panel
            width: campaignConfig?.design?.quizConfig?.style?.width || `${quizConfig.width ?? '800px'}`,
            mobileWidth: campaignConfig?.design?.quizConfig?.style?.mobileWidth || `${quizConfig.mobileWidth ?? '400px'}`,
            // Opacité de fond si définie
            backgroundOpacity: campaignConfig?.design?.quizConfig?.style?.backgroundOpacity ?? 100,
            // Mise en page responsive
            questionPadding: '12px',
            answerPadding: '12px 16px',
            answerMargin: '8px 0',
            answerMinHeight: 'auto'
          }
        }
      },
      gameConfig: {
        quiz: {
          questions: configuredQuestions,
          timeLimit: campaignConfig?.design?.quizConfig?.timeLimit || quizConfig.timeLimit || 30,
          templateId: quizConfig.templateId,
          buttonLabel: buttonElement?.content || 'Commencer le quiz'
        }
      },
      buttonConfig: {
        text: buttonElement?.content || 'Commencer le quiz',
        color: primaryColor,
        textColor: buttonElement?.style?.color || '#ffffff',
        borderRadius: campaignConfig.borderRadius || '8px'
      },
      screens: [
        {
          title: titleElement?.content || 'Testez vos connaissances !',
          description: descriptionElement?.content || 'Répondez aux questions et découvrez votre score',
          buttonText: buttonElement?.content || 'Commencer'
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
      // Garder la configuration canvas pour compatibilité
      canvasConfig: {
        elements: canvasElements,
        background: canvasBackground,
        device: selectedDevice
      }
    };
  }, [canvasElements, canvasBackground, campaignConfig, extractedColors, selectedDevice, wheelModalConfig, campaignState]);

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
      const getTextOn = (rgb: { r: number; g: number; b: number }) => (luminance(rgb) > 0.55 ? '#111111' : '#ffffff');

      const primaryRgb = toRgb(primaryColor) || { r: 132, g: 27, b: 96 }; // fallback #841b60
      const buttonText = getTextOn(primaryRgb);
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

  return (
    <MobileStableEditor className="h-[100dvh] min-h-[100dvh] w-full bg-transparent flex flex-col overflow-hidden pt-[1.25cm] rounded-tl-[28px] rounded-tr-[28px] transform -translate-y-[0.4vh]">
      {/* Bande dégradée avec logo et icônes */}
      <GradientBand className="transform translate-y-[0.4vh]">
        {mode === 'template' ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '-122px',
              marginLeft: '24px'
            }}
          >
            <span className="text-white font-semibold tracking-wide text-base sm:text-lg select-text">
              Edition de template
            </span>
          </div>
        ) : (
          <img 
            src="/logo.png" 
            alt="Prosplay Logo" 
            style={{
              height: '93px',
              width: 'auto',
              filter: 'brightness(0) invert(1)',
              maxWidth: '468px',
              marginTop: '-120px',
              marginLeft: '1.5%',
              padding: 0
            }} 
          />
        )}
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          marginTop: '-122px',
          marginRight: '24px'
        }}>
          <button 
            onClick={() => {}}
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors duration-200"
            title="Mon compte"
          >
            <User className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {}}
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors duration-200"
            title="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </GradientBand>

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
      <div className="flex-1 flex overflow-hidden relative">
        {showFunnel ? (
          /* Funnel Preview Mode */
          <div className="group fixed inset-0 z-40 w-full h-[100dvh] min-h-[100dvh] overflow-hidden bg-transparent flex">
            {/* Floating Edit Mode Button */}
            <button
              onClick={() => setShowFunnel(false)}
              className={`absolute top-4 ${previewButtonSide === 'left' ? 'left-4' : 'right-4'} z-50 px-4 py-2 bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] shadow-none focus:shadow-none ring-0 focus:ring-0 drop-shadow-none filter-none backdrop-blur-0`}
            >
              Mode édition
            </button>
            <FunnelUnlockedGame
              campaign={campaignData}
              previewMode={selectedDevice}
              wheelModalConfig={wheelModalConfig}
            />
          </div>
        ) : (
          /* Design Editor Mode */
          <>
            {/* Hybrid Sidebar - Design & Technical (always visible on PC/desktop, hidden only on actual mobile devices) */}
            {actualDevice !== 'mobile' && (
              <HybridSidebar
                ref={sidebarRef}
                onAddElement={handleAddElement}
                onBackgroundChange={handleBackgroundChange}
                onExtractedColorsChange={handleExtractedColorsChange}
                currentBackground={canvasBackground}
                extractedColors={extractedColors} // Ajout des couleurs extraites
                
                elements={canvasElements}
                onElementsChange={setCanvasElements}
                selectedElement={selectedElement}
                onElementUpdate={handleElementUpdate}
                showEffectsPanel={showEffectsInSidebar}
                onEffectsPanelChange={setShowEffectsInSidebar}
                showAnimationsPanel={showAnimationsInSidebar}
                onAnimationsPanelChange={setShowAnimationsInSidebar}
                onPositionPanelChange={setShowAnimationsInSidebar}
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
                // Quiz config props removed for HybridSidebar compatibility
                selectedDevice={selectedDevice}
                hiddenTabs={effectiveHiddenTabs}
                colorEditingContext={designColorContext}
              />
            )}
            {/* Main Canvas Area */}
            <DesignCanvas
              ref={canvasRef}
              selectedDevice={selectedDevice}
              elements={canvasElements}
              onElementsChange={setCanvasElements}
              background={canvasBackground}
              campaign={campaignConfig}
              onCampaignChange={handleCampaignConfigChange}
              zoom={canvasZoom}
              onZoomChange={setCanvasZoom}
              selectedElement={selectedElement}
              onSelectedElementChange={setSelectedElement}
              selectedElements={selectedElements}
              onSelectedElementsChange={setSelectedElements}
              onElementUpdate={handleElementUpdate}
              // Quiz sync props
              extractedColors={extractedColors}
              quizModalConfig={quizModalConfig}
              containerClassName={mode === 'template' ? 'bg-gray-50' : undefined}
              // Sidebar panel triggers
              onShowEffectsPanel={() => {
                setShowEffectsInSidebar(true);
                setShowAnimationsInSidebar(false);
                setShowAnimationsInSidebar(false);
              }}
              onShowAnimationsPanel={() => {
                setShowAnimationsInSidebar(true);
                setShowEffectsInSidebar(false);
                setShowAnimationsInSidebar(false);
              }}
              onShowPositionPanel={() => {
                setShowDesignInSidebar(true);
                setShowEffectsInSidebar(false);
                setShowAnimationsInSidebar(false);
                setShowDesignInSidebar(false);
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
                setShowAnimationsInSidebar(false);

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
                setShowAnimationsInSidebar(false);
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
            />
            {/* Zoom Slider - Always visible in bottom center */}
            {selectedDevice === 'mobile' && (
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
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
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
  );
};

export default ScratchCardEditorLayout;
