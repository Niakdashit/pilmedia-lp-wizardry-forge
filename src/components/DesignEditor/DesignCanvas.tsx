import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CanvasElement from './CanvasElement';
import CanvasToolbar from './CanvasToolbar';
import StandardizedWheel from '../shared/StandardizedWheel';
import WheelConfigModal from './WheelConfigModal';
import AlignmentGuides from './components/AlignmentGuides';
import GridOverlay from './components/GridOverlay';
import WheelSettingsButton from './components/WheelSettingsButton';
import GroupSelectionFrame from './components/GroupSelectionFrame';
import { useAutoResponsive } from '../../hooks/useAutoResponsive';
import { useSmartSnapping } from '../ModernEditor/hooks/useSmartSnapping';
import { useAdvancedCache } from '../ModernEditor/hooks/useAdvancedCache';
import { useAdaptiveAutoSave } from '../ModernEditor/hooks/useAdaptiveAutoSave';
import { useUltraFluidDragDrop } from '../ModernEditor/hooks/useUltraFluidDragDrop';
import { useVirtualizedCanvas } from '../ModernEditor/hooks/useVirtualizedCanvas';
import { useEditorStore } from '../../stores/editorStore';
import { useWheelConfigSync } from '../../hooks/useWheelConfigSync';
import CanvasContextMenu from './components/CanvasContextMenu';

import AnimationSettingsPopup from './panels/AnimationSettingsPopup';

import MobileResponsiveLayout from './components/MobileResponsiveLayout';
import type { DeviceType } from '../../utils/deviceDimensions';

export interface DesignCanvasProps {
  selectedDevice: DeviceType;
  elements: any[];
  onElementsChange: (elements: any[]) => void;
  background?: {
    type: 'color' | 'image';
    value: string;
  };
  campaign?: any;
  onCampaignChange?: (campaign: any) => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  selectedElement?: any;
  onSelectedElementChange?: (element: any) => void;
  selectedElements?: any[];
  onSelectedElementsChange?: (elements: any[]) => void;
  onElementUpdate?: (updates: any) => void;
  // Props pour la gestion des groupes
  selectedGroupId?: string;
  onSelectedGroupChange?: (groupId: string | null) => void;
  groups?: any[];
  onGroupMove?: (groupId: string, deltaX: number, deltaY: number) => void;
  onGroupResize?: (groupId: string, bounds: any) => void;
  onShowEffectsPanel?: () => void;
  onShowAnimationsPanel?: () => void;
  onShowPositionPanel?: () => void;
  onOpenElementsTab?: () => void;
  // Props pour la sidebar mobile
  onAddElement?: (element: any) => void;
  onBackgroundChange?: (background: { type: 'color' | 'image'; value: string }) => void;
  onExtractedColorsChange?: (colors: string[]) => void;
  // Props pour la toolbar mobile
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const DesignCanvas = React.forwardRef<HTMLDivElement, DesignCanvasProps>(({
  selectedDevice,
  elements,
  onElementsChange,
  background,
  campaign,
  onCampaignChange,
  zoom = 1,
  onZoomChange,
  selectedElement: externalSelectedElement,
  onSelectedElementChange,
  selectedElements,
  onSelectedElementsChange,
  onElementUpdate: externalOnElementUpdate,
  // Props pour la gestion des groupes
  selectedGroupId,
  onSelectedGroupChange,
  groups,
  onGroupMove,
  onGroupResize,
  onShowEffectsPanel,
  onShowAnimationsPanel,
  onShowPositionPanel,
  onOpenElementsTab,
  // Props pour la sidebar mobile
  onAddElement,
  onBackgroundChange,
  onExtractedColorsChange,
  // Props pour la toolbar mobile
  onUndo,
  onRedo,
  canUndo,
  canRedo
}, ref) => {

  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Utiliser la référence externe si fournie, sinon utiliser la référence interne
  const activeCanvasRef = ref || canvasRef;
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [localZoom, setLocalZoom] = useState(zoom);
  const [showBorderModal, setShowBorderModal] = useState(false);
  
  const [showAnimationPopup, setShowAnimationPopup] = useState(false);
  const [selectedAnimation, setSelectedAnimation] = useState<any>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  
  // État pour le menu contextuel global du canvas
  
  // Use global clipboard from Zustand
  const clipboard = useEditorStore(state => state.clipboard);

  // Optimisation mobile pour une expérience tactile parfaite

  // Synchroniser la sélection avec l'état externe
  useEffect(() => {
    if (externalSelectedElement && externalSelectedElement.id !== selectedElement) {
      setSelectedElement(externalSelectedElement.id);
    }
  }, [externalSelectedElement]);

  // Synchroniser le zoom local avec le prop
  useEffect(() => {
    setLocalZoom(zoom);
  }, [zoom]);

  // Support du zoom via trackpad et molette souris + Ctrl/Cmd
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Vérifier si Ctrl (Windows/Linux) ou Cmd (Mac) est pressé
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        
        // Calculer le facteur de zoom basé sur le delta (plus lent)
        const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05;
        const newZoom = Math.max(0.1, Math.min(5, localZoom * zoomFactor));
        
        setLocalZoom(newZoom);
        
        // Synchroniser avec la barre de zoom externe si disponible
        if (onZoomChange) {
          onZoomChange(newZoom);
        }
      }
    };

    const canvasElement = typeof activeCanvasRef === 'object' && activeCanvasRef?.current;
    if (canvasElement) {
      canvasElement.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        canvasElement.removeEventListener('wheel', handleWheel);
      };
    }
  }, [localZoom, activeCanvasRef]);

  // Fonction de sélection qui notifie l'état externe
  const handleElementSelect = useCallback((elementId: string | null, isMultiSelect?: boolean) => {
    console.log('🔥 handleElementSelect called with:', {
      elementId,
      isMultiSelect,
      currentSelectedElements: selectedElements?.length || 0,
      hasOnSelectedElementsChange: !!onSelectedElementsChange
    });
    
    if (isMultiSelect && elementId) {
      // Sélection multiple avec Ctrl/Cmd + clic
      const currentSelectedElements = selectedElements || [];
      const isAlreadySelected = currentSelectedElements.some((el: any) => el.id === elementId);
      
      console.log('🔥 Multi-select logic:', {
        currentCount: currentSelectedElements.length,
        isAlreadySelected,
        targetElementId: elementId
      });
      
      if (isAlreadySelected) {
        // Désélectionner l'élément s'il est déjà sélectionné
        const newSelectedElements = currentSelectedElements.filter((el: any) => el.id !== elementId);
        console.log('🔥 Removing element from selection:', {
          removed: elementId,
          newCount: newSelectedElements.length,
          newSelection: newSelectedElements.map(el => el.id)
        });
        onSelectedElementsChange?.(newSelectedElements);
      } else {
        // Ajouter l'élément à la sélection
        const elementToAdd = elements.find(el => el.id === elementId);
        if (elementToAdd) {
          const newSelectedElements = [...currentSelectedElements, elementToAdd];
          console.log('🔥 Adding element to selection:', {
            added: elementId,
            newCount: newSelectedElements.length,
            newSelection: newSelectedElements.map(el => el.id)
          });
          onSelectedElementsChange?.(newSelectedElements);
        } else {
          console.error('🔥 Element not found in elements array:', elementId);
        }
      }
      // En mode multi-sélection, on ne change pas l'élément unique sélectionné
      setSelectedElement(null);
      if (onSelectedElementChange) {
        onSelectedElementChange(null);
      }
    } else {
      // Sélection simple (comportement normal)
      console.log('🔥 Single select mode:', { elementId, clearingMultiSelection: true });
      setSelectedElement(elementId);
      if (onSelectedElementChange) {
        const element = elementId ? elements.find(el => el.id === elementId) : null;
        onSelectedElementChange(element);
      }
      // Réinitialiser la sélection multiple
      onSelectedElementsChange?.([]);
    }
  }, [elements, onSelectedElementChange, selectedElements, onSelectedElementsChange]);

  // Store centralisé pour la grille
  const { showGridLines, setShowGridLines } = useEditorStore();

  // Fonction utilitaire pour calculer les positions absolues des éléments groupés
  const calculateAbsolutePosition = useCallback((element: any) => {
    if (!element.parentGroupId) {
      // Élément non groupé : position absolue normale
      return { x: element.x, y: element.y };
    }
    
    // Élément groupé : calculer position absolue = position du groupe + position relative
    const parentGroup = elements.find(el => el.id === element.parentGroupId && el.isGroup);
    if (!parentGroup) {
      console.warn('🎯 Parent group not found for element:', element.id, 'parentGroupId:', element.parentGroupId);
      return { x: element.x, y: element.y };
    }
    
    const absoluteX = parentGroup.x + element.x; // element.x est relatif au groupe
    const absoluteY = parentGroup.y + element.y; // element.y est relatif au groupe
    
    console.log('🎯 Calculating absolute position:', {
      elementId: element.id,
      parentGroupId: element.parentGroupId,
      groupPosition: { x: parentGroup.x, y: parentGroup.y },
      relativePosition: { x: element.x, y: element.y },
      absolutePosition: { x: absoluteX, y: absoluteY }
    });
    
    return { x: absoluteX, y: absoluteY };
  }, [elements]);

  // Hook de synchronisation unifié pour la roue
  const { updateWheelConfig, getCanonicalConfig } = useWheelConfigSync({
    campaign,
    extractedColors: campaign?.design?.brandColors ? Object.values(campaign.design.brandColors) : [],
    onCampaignChange
  });

  // Écouteur d'événement pour l'application des effets de texte depuis le panneau latéral
  useEffect(() => {
    const handleApplyTextEffect = (event: CustomEvent) => {
      console.log('🎯 Événement applyTextEffect reçu:', event.detail);
      if (selectedElement) {
        console.log('✅ Application de l\'effet au texte sélectionné:', selectedElement);
        handleElementUpdate(selectedElement, event.detail);
      } else {
        console.log('❌ Aucun élément sélectionné pour appliquer l\'effet');
      }
    };

    window.addEventListener('applyTextEffect', handleApplyTextEffect as EventListener);
    return () => {
      window.removeEventListener('applyTextEffect', handleApplyTextEffect as EventListener);
    };
  }, [selectedElement]);

  // Écouteur d'événement pour afficher le popup d'animation
  useEffect(() => {
    const handleShowAnimationPopup = (event: CustomEvent) => {
      const { animation, selectedElementId } = event.detail;
      
      // Calculer la position du popup sous l'élément sélectionné
      const elementInDOM = document.querySelector(`[data-element-id="${selectedElementId}"]`);
      let position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      
      if (elementInDOM) {
        const rect = elementInDOM.getBoundingClientRect();
        const canvasRect = (activeCanvasRef as React.RefObject<HTMLDivElement>).current?.getBoundingClientRect();
        
        if (canvasRect) {
          // Position relative au canvas
          position = {
            x: rect.left + rect.width / 2,
            y: rect.bottom + 10
          };
        }
      }
      
      setSelectedAnimation(animation);
      setPopupPosition(position);
      setShowAnimationPopup(true);
    };

    window.addEventListener('showAnimationPopup', handleShowAnimationPopup as EventListener);
    return () => {
      window.removeEventListener('showAnimationPopup', handleShowAnimationPopup as EventListener);
    };
  }, []);

  // 🚀 Cache intelligent pour optimiser les performances
  const elementCache = useAdvancedCache({
    maxSize: 5 * 1024 * 1024, // 5MB pour commencer
    maxEntries: 200,
    ttl: 10 * 60 * 1000, // 10 minutes
    enableCompression: true,
    storageKey: 'design-canvas-cache'
  });

  // 🚀 Auto-save adaptatif pour une sauvegarde intelligente
  const { updateData: updateAutoSaveData, recordActivity } = useAdaptiveAutoSave({
    onSave: async (data) => {
      if (onCampaignChange) {
        onCampaignChange(data);
      }
    },
    baseDelay: 2000, // 2 secondes de base
    minDelay: 500,   // Minimum 500ms
    maxDelay: 8000,  // Maximum 8 secondes
    onSaveSuccess: () => {
      console.log('✓ Sauvegarde automatique réussie');
    },
    onError: (error) => {
      console.warn('⚠️ Erreur de sauvegarde automatique:', error);
    }
  });

  // Intégration du système auto-responsive (doit être défini avant canvasSize)
  const { applyAutoResponsive, getPropertiesForDevice, DEVICE_DIMENSIONS } = useAutoResponsive();

  // Taille du canvas memoized
  const canvasSize = useMemo(() => {
    return DEVICE_DIMENSIONS[selectedDevice];
  }, [selectedDevice, DEVICE_DIMENSIONS]);

  // 🚀 Canvas virtualisé pour un rendu ultra-optimisé
  const { markRegionsDirty, isElementVisible } = useVirtualizedCanvas({
    containerRef: activeCanvasRef,
    regionSize: 200,
    maxRegions: 50,
    updateThreshold: 16 // 60fps
  });

  // 🚀 Drag & drop ultra-fluide pour une expérience premium
  useUltraFluidDragDrop({
    containerRef: activeCanvasRef,
    snapToGrid: showGridLines,
    gridSize: 20,
    enableInertia: true,
    onDragStart: (elementId, position) => {
      // Enregistrer l'activité de début de drag
      recordActivity('drag', 0.9);
      // Marquer les éléments affectés pour le rendu optimisé
      const element = elements.find(el => el.id === elementId);
      if (element) {
        markRegionsDirty([{ ...element, x: position.x, y: position.y }]);
      }
      elementCache.set(`drag-start-${elementId}`, { position, timestamp: Date.now() });
    },
    onDragMove: (elementId, position, velocity) => {
      // Optimiser le rendu en marquant seulement les éléments nécessaires
      const element = elements.find(el => el.id === elementId);
      if (element) {
        markRegionsDirty([{ ...element, x: position.x, y: position.y }]);
      }
      const moveKey = `drag-move-${elementId}-${Math.floor(position.x/2)}-${Math.floor(position.y/2)}`;
      elementCache.set(moveKey, { position, velocity, timestamp: Date.now() });
    },
    onDragEnd: (elementId, position) => {
      // Finaliser le drag avec mise à jour des données
      const element = elements.find(el => el.id === elementId);
      if (element) {
        markRegionsDirty([{ ...element, x: position.x, y: position.y }]);
      }
      handleElementUpdate(elementId, { x: position.x, y: position.y });
    }
  });

  // Hooks optimisés pour snapping (gardé pour compatibilité)
  const { applySnapping } = useSmartSnapping({
    containerRef: activeCanvasRef,
    gridSize: 20,
    snapTolerance: 3 // Réduit pour plus de précision
  });

  // Configuration canonique de la roue
  const wheelConfig = useMemo(() => 
    getCanonicalConfig({ device: selectedDevice, shouldCropWheel: true }),
    [getCanonicalConfig, selectedDevice]
  );



  // Convertir les éléments en format compatible avec useAutoResponsive
  const responsiveElements = useMemo(() => {
    return elements.map(element => ({
      id: element.id,
      x: element.x || 0,
      y: element.y || 0,
      width: element.width,
      height: element.height,
      fontSize: element.fontSize || 16,
      type: element.type,
      content: element.content,
      // Préserver les autres propriétés
      ...element
    }));
  }, [elements]);

  // Appliquer les calculs responsives
  const elementsWithResponsive = useMemo(() => {
    return applyAutoResponsive(responsiveElements);
  }, [responsiveElements, applyAutoResponsive]);

  // Handlers optimisés avec snapping et cache intelligent
  const handleElementUpdate = useCallback((id: string, updates: any) => {
    // Utiliser la fonction externe si disponible
    if (externalOnElementUpdate && selectedElement === id) {
      externalOnElementUpdate(updates);
      return;
    }
    // Vérifier le cache pour éviter les recalculs
    const cacheKey = `element-update-${id}-${JSON.stringify(updates).slice(0, 50)}`;
    const cachedResult = elementCache.get(cacheKey);
    
    if (cachedResult && Date.now() - cachedResult.timestamp < 1000) {
      // Utiliser le résultat mis en cache si récent (< 1 seconde)
      onElementsChange(cachedResult.elements);
      return;
    }

    // Appliquer le snapping si c'est un déplacement
    if (updates.x !== undefined && updates.y !== undefined) {
      const element = elements.find(el => el.id === id);
      if (element) {
        const snappedPosition = applySnapping(
          updates.x,
          updates.y,
          element.width || 100,
          element.height || 100,
          id
        );
        updates.x = snappedPosition.x;
        updates.y = snappedPosition.y;
        
        // Mettre en cache la position snappée pour optimiser les mouvements répétitifs
        const positionCacheKey = `snap-${id}-${Math.floor(updates.x/5)}-${Math.floor(updates.y/5)}`;
        elementCache.set(positionCacheKey, { x: updates.x, y: updates.y, timestamp: Date.now() });
      }
    }

    const updatedElements = elements.map(el => el.id === id ? {
      ...el,
      ...updates
    } : el);
    
    // Mettre en cache le résultat
    elementCache.set(cacheKey, { elements: updatedElements, timestamp: Date.now() });
    
    onElementsChange(updatedElements);
    
    // 🚀 Déclencher l'auto-save adaptatif avec activité intelligente
    const activityType = (updates.x !== undefined || updates.y !== undefined) ? 'drag' : 'click';
    const intensity = activityType === 'drag' ? 0.8 : 0.5;
    updateAutoSaveData(campaign, activityType, intensity);
  }, [elements, onElementsChange, applySnapping, elementCache, updateAutoSaveData, campaign]);

  const handleElementDelete = useCallback((id: string) => {
    const updatedElements = elements.filter(el => el.id !== id);
    onElementsChange(updatedElements);
    
    // 🚀 Auto-save après suppression avec activité élevée
    updateAutoSaveData(campaign, 'click', 0.9);
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  }, [elements, onElementsChange, updateAutoSaveData, campaign, selectedElement]);

  // Handlers pour le menu contextuel global du canvas
  const handleCanvasCopyStyle = useCallback(() => {
    if (selectedElement) {
      const element = elements.find(el => el.id === selectedElement);
      if (element) {
        const style = {
          fontFamily: element.fontFamily,
          fontSize: element.fontSize,
          color: element.color,
          fontWeight: element.fontWeight,
          textAlign: element.textAlign,
          backgroundColor: element.backgroundColor,
          borderRadius: element.borderRadius
        };
        // Style copié depuis le canvas
        console.log('Style copié depuis le canvas:', style);
      }
    }
  }, [selectedElement, elements]);

  const handleCanvasPaste = useCallback(() => {
    if (clipboard && clipboard.type === 'element' && onElementsChange) {
      const elementToPaste = clipboard.payload;
      const deviceProps = getPropertiesForDevice(elementToPaste, selectedDevice);
      const newElement = {
        ...elementToPaste,
        id: `text-${Date.now()}`,
        x: (deviceProps.x || 0) + 30,
        y: (deviceProps.y || 0) + 30
      };
      const updatedElements = [...elements, newElement];
      onElementsChange(updatedElements);
      handleElementSelect(newElement.id);
      console.log('Élément collé depuis le canvas (global clipboard):', newElement);
    }
  }, [clipboard, elements, onElementsChange, getPropertiesForDevice, selectedDevice, handleElementSelect]);

  const handleRemoveBackground = useCallback(() => {
    if (background && background.type !== 'color') {
      // Remettre le background par défaut
      const defaultBackground = {
        type: 'color' as const,
        value: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
      };
      // Déclencher un événement personnalisé pour notifier le changement de background
      const event = new CustomEvent('backgroundChange', { detail: defaultBackground });
      window.dispatchEvent(event);
      console.log('Arrière-plan supprimé');
    }
  }, [background]);
  const selectedElementData = selectedElement ? elements.find(el => el.id === selectedElement) : null;

  // Les segments et tailles sont maintenant gérés par StandardizedWheel
  return (
    <DndProvider backend={HTML5Backend}>
      <MobileResponsiveLayout
        selectedElement={elements.find(el => el.id === selectedElement)}
        onElementUpdate={(updates) => {
          if (selectedElement) {
            handleElementUpdate(selectedElement, updates);
          }
        }}
        onShowEffectsPanel={onShowEffectsPanel}
        onShowAnimationsPanel={onShowAnimationsPanel}
        onShowPositionPanel={onShowPositionPanel}
        canvasRef={activeCanvasRef as React.RefObject<HTMLDivElement>}
        zoom={zoom}
        className="design-canvas-container flex-1 flex flex-col items-center justify-center p-4 bg-gray-100 relative overflow-hidden"
        // Props pour la sidebar mobile
        onAddElement={onAddElement}
        onBackgroundChange={onBackgroundChange}
        onExtractedColorsChange={onExtractedColorsChange}
        campaignConfig={campaign}
        onCampaignConfigChange={onCampaignChange}
        elements={elements}
        onElementsChange={onElementsChange}
        // Props pour la toolbar mobile
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={canUndo}
        canRedo={canRedo}
      >
        {/* Canvas Toolbar - Only show when text element is selected */}
        {selectedElementData && selectedElementData.type === 'text' && (
          <div className={`z-10 ${
            selectedDevice === 'desktop' 
              ? 'absolute top-4 left-1/2 transform -translate-x-1/2' 
              : 'flex justify-center py-2 px-4'
          }`}>
            <CanvasToolbar 
              selectedElement={selectedElementData} 
              onElementUpdate={updates => selectedElement && handleElementUpdate(selectedElement, updates)}
              onShowEffectsPanel={onShowEffectsPanel}
              onShowAnimationsPanel={onShowAnimationsPanel}
              onShowPositionPanel={onShowPositionPanel}
              onOpenElementsTab={onOpenElementsTab}
              canvasRef={activeCanvasRef as React.RefObject<HTMLDivElement>}
            />
          </div>
        )}
        
        <div className="flex justify-center items-center h-full" style={{
          padding: selectedDevice === 'tablet' 
            ? (zoom <= 0.7 ? '40px 20px' : '60px 32px')
            : selectedDevice === 'mobile'
            ? (zoom <= 0.7 ? '24px 16px' : '40px 24px')
            : (zoom <= 0.7 ? '8px' : '32px'),
          transition: 'padding 0.2s ease-in-out',
          minHeight: '100%'
        }}>
          {/* Canvas wrapper pour maintenir le centrage avec zoom */}
          <div 
            className="flex justify-center items-center"
            style={{
              width: 'fit-content',
              height: 'fit-content',
              minHeight: 'auto'
            }}
          >
            <div 
              ref={activeCanvasRef}
              className="relative bg-white shadow-lg rounded-lg overflow-hidden border border-[hsl(var(--border))]" 
              style={{
                width: `${canvasSize.width}px`,
                height: `${canvasSize.height}px`,
                minWidth: `${canvasSize.width}px`,
                minHeight: `${canvasSize.height}px`,
                flexShrink: 0,
                transform: `scale(${localZoom})`,
                transformOrigin: 'center center'
              }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedElement(null);
              }
            }}
          >
            {/* Canvas Background */}
            <div 
              className="absolute inset-0" 
              style={{
                background: background?.type === 'image' ? `url(${background.value}) center/cover no-repeat` : background?.value || 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
              }}
              onMouseDown={(e) => {
                console.log('🔘 Clic sur le background détecté');
                // Désélectionner l'élément quand on clique sur le background
                e.stopPropagation();
                setSelectedElement(null);
              }}
            >
              {/* Menu contextuel global du canvas */}
              <CanvasContextMenu
                onCopyStyle={handleCanvasCopyStyle}
                onPaste={handleCanvasPaste}
                onRemoveBackground={handleRemoveBackground}
                canPaste={!!clipboard && clipboard.type === 'element'}
                hasStyleToCopy={selectedElement !== null}
              />
              {/* Grid Overlay Optimisé */}
              <GridOverlay 
                canvasSize={canvasSize}
                showGrid={showGridLines}
                gridSize={20}
                opacity={0.15}
              />
              
              {/* Alignment Guides */}
              <AlignmentGuides
                canvasSize={canvasSize}
                elements={elementsWithResponsive}
              />
              
              {/* Clouds */}
              
              
              
              
              
              {/* Roue standardisée avec découpage cohérent */}
              <StandardizedWheel
                campaign={campaign}
                device={selectedDevice}
                shouldCropWheel={true}
                onClick={() => {
                  console.log('🔘 Clic sur la roue détecté');
                  setShowBorderModal(true);
                }}
              />
              {/* Bouton roue fortune ABSOLU dans le canvas d'aperçu */}
              <div className="absolute bottom-2 right-2 z-50">
                <WheelSettingsButton onClick={() => {
                  console.log('🔘 Clic sur WheelSettingsButton détecté');
                  setShowBorderModal(true);
                }} />
              </div>
            </div>

            {/* Canvas Elements - Rendu optimisé avec virtualisation */}
            {elementsWithResponsive
              .filter((element: any) => {
                // 🚀 S'assurer que l'élément a des dimensions numériques pour la virtualisation
                const elementWithProps = {
                  ...element,
                  ...getPropertiesForDevice(element, selectedDevice)
                };
                
                // Ajouter des dimensions par défaut pour les éléments de texte si manquantes
                if (element.type === 'text') {
                  elementWithProps.width = elementWithProps.width || 200;
                  elementWithProps.height = elementWithProps.height || 40;
                }
                
                // S'assurer que x, y, width, height sont des nombres
                elementWithProps.x = Number(elementWithProps.x) || 0;
                elementWithProps.y = Number(elementWithProps.y) || 0;
                elementWithProps.width = Number(elementWithProps.width) || 100;
                elementWithProps.height = Number(elementWithProps.height) || 100;
                
                return isElementVisible(elementWithProps);
              })
              .map((element: any) => {
              // Obtenir les propriétés pour l'appareil actuel
              const responsiveProps = getPropertiesForDevice(element, selectedDevice);
              
              // Calculer la position absolue pour les éléments groupés
              const absolutePosition = calculateAbsolutePosition(element);
              
              // Fusionner les propriétés responsive avec l'élément original et les positions absolues
              const elementWithResponsive = {
                ...element,
                // Utiliser les positions absolues calculées pour les éléments groupés
                x: absolutePosition.x,
                y: absolutePosition.y,
                // Garder les autres propriétés responsive
                width: responsiveProps.width,
                height: responsiveProps.height,
                fontSize: responsiveProps.fontSize,
                // Appliquer l'alignement de texte responsive si disponible
                textAlign: responsiveProps.textAlign || element.textAlign
              };

              return (
                <CanvasElement 
                  key={element.id} 
                  element={elementWithResponsive} 
                  selectedDevice={selectedDevice}
                  isSelected={
                    selectedElement === element.id || 
                    Boolean(selectedElements && selectedElements.some((sel: any) => sel.id === element.id))
                  } 
                  onSelect={handleElementSelect} 
                  onUpdate={handleElementUpdate} 
                  onDelete={handleElementDelete}
                  containerRef={activeCanvasRef as React.RefObject<HTMLDivElement>}
                  zoom={zoom}
                  onAddElement={(newElement) => {
                    const updatedElements = [...elements, newElement];
                    onElementsChange(updatedElements);
                    handleElementSelect(newElement.id);
                  }}
                  elements={elements}
                />
              );
            })}

            {/* Grid and Guides Toggle */}
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() => setShowGridLines(!showGridLines)}
                className={`p-2 rounded-lg shadow-sm text-xs z-40 transition-colors ${
                  showGridLines 
                    ? 'bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]' 
                    : 'bg-white/80 hover:bg-white text-gray-700'
                }`}
                title="Afficher/masquer la grille (G)"
              >
                📐
              </button>
              

            </div>

            {/* Device Frame for mobile/tablet */}
            {selectedDevice !== 'desktop' && <div className="absolute inset-0 pointer-events-none">
                {selectedDevice === 'mobile' && <>
                    {/* iPhone-like frame */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-black rounded-full"></div>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-800 rounded-full"></div>
                  </>}
                {selectedDevice === 'tablet' && <>
                    {/* Tablet-like frame */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 border-2 border-gray-300 rounded-full"></div>
                  </>}
              </div>}
            </div>
          </div>
        </div>

        {/* Canvas Info */}
        <div className="text-center mt-4 text-sm text-gray-500">
          {selectedDevice} • {canvasSize.width} × {canvasSize.height}px • Cliquez sur la roue pour changer le style de bordure
          {selectedDevice !== 'desktop' && (
            <span className="block text-xs text-orange-600 mt-1">
              💡 Mode tactile optimisé - Utilisez le bouton 🔧 pour le debug
            </span>
          )}
        </div>

        {/* Multi-Selection Debug Display */}
        {selectedElements && selectedElements.length > 0 && (
          <div className="absolute top-2 left-2 z-50 bg-blue-500 text-white px-3 py-1 rounded text-sm font-bold">
            🎯 Multi-Selection: {selectedElements.length} elements
            <div className="text-xs mt-1">
              {selectedElements.map((el: any, i: number) => (
                <div key={el.id}>{i + 1}. {el.id}</div>
              ))}
            </div>
          </div>
        )}
        
        {/* Cadre de sélection pour les groupes */}
        {selectedGroupId && groups && (
          (() => {
            const selectedGroup = groups.find(g => g.id === selectedGroupId);
            if (selectedGroup && selectedGroup.groupChildren) {
              // Calculer les bounds du groupe à partir des positions absolues de ses éléments
              const groupElements = elements.filter(el => selectedGroup.groupChildren?.includes(el.id));
              if (groupElements.length > 0) {
                // Utiliser les positions absolues pour calculer les bounds du groupe
                const elementsWithAbsolutePos = groupElements.map(el => {
                  const absPos = calculateAbsolutePosition(el);
                  return { ...el, x: absPos.x, y: absPos.y };
                });
                
                const minX = Math.min(...elementsWithAbsolutePos.map(el => el.x));
                const minY = Math.min(...elementsWithAbsolutePos.map(el => el.y));
                const maxX = Math.max(...elementsWithAbsolutePos.map(el => el.x + (el.width || 0)));
                const maxY = Math.max(...elementsWithAbsolutePos.map(el => el.y + (el.height || 0)));
                
                const groupBounds = {
                  x: minX,
                  y: minY,
                  width: maxX - minX,
                  height: maxY - minY
                };
                
                console.log('🎯 Group bounds calculated:', {
                  groupId: selectedGroup.id,
                  groupElements: groupElements.length,
                  bounds: groupBounds,
                  elementsPositions: elementsWithAbsolutePos.map(el => ({ id: el.id, x: el.x, y: el.y }))
                });
                
                return (
                  <GroupSelectionFrame
                    key={selectedGroup.id}
                    groupId={selectedGroup.id}
                    bounds={groupBounds}
                    zoom={zoom}
                    onMove={(deltaX, deltaY) => {
                      console.log('🎯 Moving group:', selectedGroup.id, { deltaX, deltaY });
                      onGroupMove?.(selectedGroup.id, deltaX, deltaY);
                    }}
                    onResize={(newBounds) => {
                      console.log('🎯 Resizing group:', selectedGroup.id, newBounds);
                      onGroupResize?.(selectedGroup.id, newBounds);
                    }}
                    onDoubleClick={() => {
                      console.log('🎯 Double-click on group - entering edit mode:', selectedGroup.id);
                      // Passer en mode édition individuelle des éléments du groupe
                      onSelectedGroupChange?.(null);
                    }}
                  />
                );
              }
            }
            return null;
          })()
        )}
        
        {/* Bouton roue fortune ABSOLU dans la zone d'aperçu (canvas) */}
        <div className="absolute bottom-2 right-2 z-50">
          <WheelSettingsButton onClick={() => setShowBorderModal(true)} />
        </div>

        {/* Modal pour la configuration de la roue */}
        <WheelConfigModal
          isOpen={showBorderModal}
          onClose={() => setShowBorderModal(false)}
          wheelBorderStyle={wheelConfig.borderStyle}
          wheelBorderColor={wheelConfig.borderColor}
          wheelBorderWidth={wheelConfig.borderWidth}
          wheelScale={wheelConfig.scale}
          onBorderStyleChange={(style) => updateWheelConfig({ borderStyle: style })}
          onBorderColorChange={(color) => updateWheelConfig({ borderColor: color })}
          onBorderWidthChange={(width) => updateWheelConfig({ borderWidth: width })}
          onScaleChange={(scale) => updateWheelConfig({ scale })}
          selectedDevice={selectedDevice}
        />
        

        
        {/* Popup contextuel d'animation */}
        {showAnimationPopup && selectedAnimation && (
          <AnimationSettingsPopup
            animation={selectedAnimation}
            position={popupPosition}
            onApply={(settings) => {
              if (selectedElement) {
                handleElementUpdate(selectedElement, settings);
                setShowAnimationPopup(false);
              }
            }}
            onClose={() => setShowAnimationPopup(false)}
            visible={showAnimationPopup}
          />
        )}
      </MobileResponsiveLayout>
    </DndProvider>
  );
});

DesignCanvas.displayName = 'DesignCanvas';

export default DesignCanvas;