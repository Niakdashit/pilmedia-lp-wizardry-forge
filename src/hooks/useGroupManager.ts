import { useState, useCallback, useMemo } from 'react';
import { CanvasElement, GroupBounds, LayerItem } from '../types/groupTypes';

export interface UseGroupManagerProps {
  elements: CanvasElement[];
  onElementsChange: (elements: CanvasElement[]) => void;
  onAddToHistory?: (snapshot: any) => void;
}

export const useGroupManager = ({ elements, onElementsChange, onAddToHistory }: UseGroupManagerProps) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [editingElementInGroup, setEditingElementInGroup] = useState<string | null>(null);

  // Calculer les limites d'un groupe à partir de ses éléments
  const calculateGroupBounds = useCallback((elementIds: string[]): GroupBounds => {
    const groupElements = elements.filter(el => elementIds.includes(el.id));
    
    if (groupElements.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0, elements: [] };
    }

    const minX = Math.min(...groupElements.map(el => el.x));
    const minY = Math.min(...groupElements.map(el => el.y));
    const maxX = Math.max(...groupElements.map(el => el.x + (el.width || 0)));
    const maxY = Math.max(...groupElements.map(el => el.y + (el.height || 0)));

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      elements: groupElements
    };
  }, [elements]);

  // Créer un nouveau groupe à partir d'éléments sélectionnés
  const createGroup = useCallback((elementIds: string[], groupName?: string) => {
    if (elementIds.length < 2) {
      console.warn('Un groupe doit contenir au moins 2 éléments');
      return null;
    }

    const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const bounds = calculateGroupBounds(elementIds);
    
    // Créer l'objet groupe
    const newGroup: CanvasElement = {
      id: groupId,
      type: 'group',
      isGroup: true,
      name: groupName || `Groupe ${Math.floor(Math.random() * 1000)}`,
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      groupChildren: elementIds,
      visible: true,
      locked: false,
      zIndex: Math.max(...elements.map(el => el.zIndex || 0)) + 1
    };

    // Mettre à jour les éléments pour les associer au groupe ET convertir en positions relatives
    const updatedElements = elements.map(element => {
      if (elementIds.includes(element.id)) {
        // Convertir la position absolue en position relative au groupe
        const relativeX = element.x - bounds.x;
        const relativeY = element.y - bounds.y;
        
        return {
          ...element,
          parentGroupId: groupId,
          // Stocker les positions relatives au groupe
          x: relativeX,
          y: relativeY,
          // Sauvegarder les positions absolues originales pour debug
          originalX: element.x,
          originalY: element.y
        };
      }
      return element;
    });

    // Ajouter le groupe aux éléments
    const newElements = [...updatedElements, newGroup];
    
    console.log('🎯 Groupe créé:', {
      groupId,
      groupName: newGroup.name,
      elementIds,
      bounds
    });

    onElementsChange(newElements);
    onAddToHistory?.({ 
      canvasElements: newElements,
      action: 'CREATE_GROUP',
      groupId,
      elementIds 
    });

    return groupId;
  }, [elements, calculateGroupBounds, onElementsChange, onAddToHistory]);

  // Dissocier un groupe (ungroup)
  const ungroupElements = useCallback((groupId: string) => {
    const group = elements.find(el => el.id === groupId && el.isGroup);
    if (!group || !group.groupChildren) {
      console.warn('Groupe non trouvé:', groupId);
      return;
    }

    // Restaurer les positions absolues des éléments avant de dissocier le groupe
    const updatedElements = elements
      .filter(el => el.id !== groupId) // Supprimer le groupe
      .map(element => {
        if (group.groupChildren?.includes(element.id)) {
          // Calculer la position absolue finale : position du groupe + position relative
          const finalAbsoluteX = group.x + element.x; // element.x est relatif au groupe
          const finalAbsoluteY = group.y + element.y; // element.y est relatif au groupe
          
          console.log('🎯 Restoring absolute position for element:', {
            elementId: element.id,
            groupPosition: { x: group.x, y: group.y },
            relativePosition: { x: element.x, y: element.y },
            finalAbsolutePosition: { x: finalAbsoluteX, y: finalAbsoluteY }
          });
          
          // Supprimer parentGroupId et restaurer les positions absolues
          const { parentGroupId, ...elementWithoutParent } = element;
          return {
            ...elementWithoutParent,
            // Restaurer les positions absolues calculées
            x: finalAbsoluteX,
            y: finalAbsoluteY
          };
        }
        return element;
      });

    console.log('🎯 Groupe dissocié:', {
      groupId,
      elementsLiberated: group.groupChildren
    });

    onElementsChange(updatedElements);
    onAddToHistory?.({ 
      canvasElements: updatedElements,
      action: 'UNGROUP',
      groupId 
    });

    // Réinitialiser la sélection si le groupe dissocié était sélectionné
    if (selectedGroupId === groupId) {
      setSelectedGroupId(null);
    }
  }, [elements, selectedGroupId, onElementsChange, onAddToHistory]);

  // Déplacer un groupe entier (système Canva-style avec positions relatives)
  const moveGroup = useCallback((groupId: string, deltaX: number, deltaY: number) => {
    const group = elements.find(el => el.id === groupId && el.isGroup);
    if (!group || !group.groupChildren) return;

    console.log('🎯 Moving group:', { groupId, deltaX, deltaY, groupPosition: { x: group.x, y: group.y } });

    const updatedElements = elements.map(element => {
      if (element.id === groupId) {
        // Déplacer le groupe lui-même
        const newGroupX = element.x + deltaX;
        const newGroupY = element.y + deltaY;
        console.log('🎯 New group position:', { newGroupX, newGroupY });
        return {
          ...element,
          x: newGroupX,
          y: newGroupY
        };
      } else if (group.groupChildren?.includes(element.id)) {
        // Recalculer la position absolue des éléments enfants
        // Position absolue = Position du groupe + Position relative de l'élément
        const newGroupX = group.x + deltaX;
        const newGroupY = group.y + deltaY;
        const newAbsoluteX = newGroupX + element.x; // element.x est déjà relatif au groupe
        const newAbsoluteY = newGroupY + element.y; // element.y est déjà relatif au groupe
        
        console.log('🎯 Moving child element:', {
          elementId: element.id,
          relativePos: { x: element.x, y: element.y },
          newGroupPos: { x: newGroupX, y: newGroupY },
          newAbsolutePos: { x: newAbsoluteX, y: newAbsoluteY }
        });
        
        return {
          ...element,
          // Les positions restent relatives au groupe (pas de changement)
          // Le rendu se chargera de calculer la position absolue
        };
      }
      return element;
    });

    onElementsChange(updatedElements);
  }, [elements, onElementsChange]);

  // Redimensionner un groupe (mettre à jour UNIQUEMENT le cadre du groupe)
  // Les enfants sont redimensionnés proportionnellement par DesignCanvas.resizeSelectedElements()
  const resizeGroup = useCallback((groupId: string, newBounds: GroupBounds) => {
    const group = elements.find(el => el.id === groupId && el.isGroup);
    if (!group || !group.groupChildren) return;

    const updatedElements = elements.map(element => {
      if (element.id === groupId) {
        return {
          ...element,
          x: newBounds.x,
          y: newBounds.y,
          width: newBounds.width,
          height: newBounds.height
        };
      }
      // Ne pas toucher aux enfants ici pour éviter un double-redimensionnement
      return element;
    });

    onElementsChange(updatedElements);
  }, [elements, onElementsChange]);

  // Obtenir tous les groupes
  const groups = useMemo(() => {
    return elements.filter(el => el.isGroup);
  }, [elements]);

  // Obtenir les éléments d'un groupe
  const getGroupElements = useCallback((groupId: string) => {
    const group = elements.find(el => el.id === groupId && el.isGroup);
    if (!group || !group.groupChildren) return [];
    
    return elements.filter(el => group.groupChildren?.includes(el.id));
  }, [elements]);

  // Vérifier si un élément fait partie d'un groupe
  const isElementInGroup = useCallback((elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    return !!element?.parentGroupId;
  }, [elements]);

  // Obtenir la hiérarchie des calques pour l'affichage (ordonnée par zIndex du plus haut au plus bas)
  const getLayersHierarchy = useCallback((): LayerItem[] => {
    // Construire unités top-level: groupes et éléments non groupés
    type TopUnit = { kind: 'group'; id: string; z: number; children: LayerItem[] } | { kind: 'element'; id: string; z: number };

    const byId = new Map(elements.map(e => [e.id, e] as const));

    const units: TopUnit[] = [];
    // Groupes: z effectif = max zIndex des enfants, ou zIndex du groupe par défaut
    groups.forEach(group => {
      const childIds = (group.groupChildren || []).filter(id => byId.has(id));
      const childrenWithZ = childIds
        .map(id => byId.get(id)!)
        .map(el => ({ el, z: typeof el.zIndex === 'number' ? el.zIndex : 0 }));
      const maxChildZ = childrenWithZ.length > 0 ? Math.max(...childrenWithZ.map(c => c.z)) : (typeof group.zIndex === 'number' ? group.zIndex : 0);

      // Ordonner les enfants par zIndex descendant (haut -> bas)
      const orderedChildren: LayerItem[] = childrenWithZ
        .sort((a, b) => b.z - a.z)
        .map(({ el }) => ({
          id: el.id,
          type: 'element',
          name: el.name || el.content || `${el.type} ${el.id.slice(-4)}`,
          visible: el.visible !== false,
          locked: el.locked || false,
          parentId: group.id
        }));

      units.push({ kind: 'group', id: group.id, z: maxChildZ, children: orderedChildren });
    });

    // Éléments non groupés
    elements.forEach(el => {
      if (!el.isGroup && !el.parentGroupId) {
        units.push({ kind: 'element', id: el.id, z: typeof el.zIndex === 'number' ? el.zIndex : 0 });
      }
    });

    // Trier top-level du plus haut au plus bas
    units.sort((a, b) => b.z - a.z);

    // Transformer en LayerItem[] avec enfants pour les groupes
    const layers: LayerItem[] = units.map(unit => {
      if (unit.kind === 'group') {
        const group = byId.get(unit.id)!;
        return {
          id: group.id,
          type: 'group',
          name: group.name || 'Groupe sans nom',
          visible: group.visible !== false,
          locked: group.locked || false,
          isExpanded: true,
          children: unit.children
        };
      }
      const el = byId.get(unit.id)!;
      return {
        id: el.id,
        type: 'element',
        name: el.name || el.content || `${el.type} ${el.id.slice(-4)}`,
        visible: el.visible !== false,
        locked: el.locked || false
      };
    });

    return layers; // déjà trié du haut -> bas
  }, [elements, groups]);

  return {
    // État
    selectedGroupId,
    editingElementInGroup,
    groups,
    
    // Actions
    createGroup,
    ungroupElements,
    moveGroup,
    resizeGroup,
    setSelectedGroupId,
    setEditingElementInGroup,
    
    // Utilitaires
    calculateGroupBounds,
    getGroupElements,
    isElementInGroup,
    getLayersHierarchy
  };
};
