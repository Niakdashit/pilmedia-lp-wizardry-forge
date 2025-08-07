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

    // Mettre à jour les éléments pour les associer au groupe
    const updatedElements = elements.map(element => {
      if (elementIds.includes(element.id)) {
        return {
          ...element,
          parentGroupId: groupId
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

    // Retirer l'association parentGroupId des éléments du groupe
    const updatedElements = elements
      .filter(el => el.id !== groupId) // Supprimer le groupe
      .map(element => {
        if (group.groupChildren?.includes(element.id)) {
          const { parentGroupId, ...elementWithoutParent } = element;
          return elementWithoutParent;
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

  // Déplacer un groupe entier
  const moveGroup = useCallback((groupId: string, deltaX: number, deltaY: number) => {
    const group = elements.find(el => el.id === groupId && el.isGroup);
    if (!group || !group.groupChildren) return;

    const updatedElements = elements.map(element => {
      if (element.id === groupId) {
        // Déplacer le groupe lui-même
        return {
          ...element,
          x: element.x + deltaX,
          y: element.y + deltaY
        };
      } else if (group.groupChildren.includes(element.id)) {
        // Déplacer tous les éléments du groupe
        return {
          ...element,
          x: element.x + deltaX,
          y: element.y + deltaY
        };
      }
      return element;
    });

    onElementsChange(updatedElements);
  }, [elements, onElementsChange]);

  // Redimensionner un groupe
  const resizeGroup = useCallback((groupId: string, newBounds: GroupBounds) => {
    const group = elements.find(el => el.id === groupId && el.isGroup);
    if (!group || !group.groupChildren) return;

    const currentBounds = calculateGroupBounds(group.groupChildren);
    const scaleX = newBounds.width / currentBounds.width;
    const scaleY = newBounds.height / currentBounds.height;

    const updatedElements = elements.map(element => {
      if (element.id === groupId) {
        // Mettre à jour le groupe
        return {
          ...element,
          x: newBounds.x,
          y: newBounds.y,
          width: newBounds.width,
          height: newBounds.height
        };
      } else if (group.groupChildren.includes(element.id)) {
        // Redimensionner et repositionner les éléments du groupe
        const relativeX = element.x - currentBounds.x;
        const relativeY = element.y - currentBounds.y;
        
        return {
          ...element,
          x: newBounds.x + (relativeX * scaleX),
          y: newBounds.y + (relativeY * scaleY),
          width: element.width ? element.width * scaleX : element.width,
          height: element.height ? element.height * scaleY : element.height,
          fontSize: element.fontSize ? element.fontSize * Math.min(scaleX, scaleY) : element.fontSize
        };
      }
      return element;
    });

    onElementsChange(updatedElements);
  }, [elements, calculateGroupBounds, onElementsChange]);

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

  // Obtenir la hiérarchie des calques pour l'affichage
  const getLayersHierarchy = useCallback((): LayerItem[] => {
    const layers: LayerItem[] = [];
    const processedElements = new Set<string>();

    // D'abord traiter les groupes
    groups.forEach(group => {
      if (!processedElements.has(group.id)) {
        const groupLayer: LayerItem = {
          id: group.id,
          type: 'group',
          name: group.name || 'Groupe sans nom',
          visible: group.visible !== false,
          locked: group.locked || false,
          isExpanded: true,
          children: []
        };

        // Ajouter les éléments du groupe
        if (group.groupChildren && group.groupChildren.length > 0) {
          group.groupChildren.forEach(childId => {
            const childElement = elements.find(el => el.id === childId);
            if (childElement) {
              groupLayer.children?.push({
                id: childElement.id,
                type: 'element',
                name: childElement.name || childElement.content || `${childElement.type} ${childElement.id.slice(-4)}`,
                visible: childElement.visible !== false,
                locked: childElement.locked || false,
                parentId: group.id
              });
              processedElements.add(childId);
            }
          });
        }

        layers.push(groupLayer);
        processedElements.add(group.id);
      }
    });

    // Ensuite traiter les éléments non groupés
    elements.forEach(element => {
      if (!processedElements.has(element.id) && !element.isGroup) {
        layers.push({
          id: element.id,
          type: 'element',
          name: element.name || element.content || `${element.type} ${element.id.slice(-4)}`,
          visible: element.visible !== false,
          locked: element.locked || false
        });
      }
    });

    return layers.reverse(); // Inverser pour avoir les derniers créés en haut
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
