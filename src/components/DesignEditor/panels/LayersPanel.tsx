import React, { useMemo, useState, useCallback, useRef } from 'react';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Trash2, 
  Copy,
  Type,
  Image,
  Shapes,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Group,
  Ungroup,
  GripVertical
} from 'lucide-react';
import { LayerItem } from '../../../types/groupTypes';
import { useGroupManager } from '../../../hooks/useGroupManager';
import { DndProvider, useDrag, useDrop, useDragLayer } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface LayersPanelProps {
  elements: any[];
  onElementsChange: (elements: any[]) => void;
  selectedElements?: any[];
  onSelectedElementsChange?: (elements: any[]) => void;
  onAddToHistory?: (snapshot: any) => void;
}

const LayersPanel: React.FC<LayersPanelProps> = ({ 
  elements, 
  onElementsChange, 
  selectedElements = [], 
  onSelectedElementsChange,
  onAddToHistory 
}) => {
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Utiliser le hook de gestion des groupes
  const groupManager = useGroupManager({
    elements,
    onElementsChange,
    onAddToHistory
  });

  const {
    createGroup,
    ungroupElements,
    getLayersHierarchy,
    selectedGroupId,
    setSelectedGroupId
  } = groupManager;

  // Obtenir la hiérarchie des calques
  const layersHierarchy = getLayersHierarchy();

  type DragItem = { id: string; kind: 'group' | 'element'; parentId?: string };

// Internal component: floating preview of the dragged layer
const CustomDragPreview: React.FC = () => {
  const { isDragging, clientOffset, item } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
    clientOffset: monitor.getClientOffset(),
    item: monitor.getItem() as { id?: string } | null
  }));

  if (!isDragging || !clientOffset || !item || !item.id) return null;

  return (
    <div
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        left: 0,
        top: 0,
        transform: `translate(${clientOffset.x}px, ${clientOffset.y}px)`,
        zIndex: 9999
      }}
    >
      <div className="flex items-center space-x-2 px-2 py-1 rounded-md shadow-lg bg-white border border-gray-200">
        <GripVertical className="w-3 h-3 text-gray-400" />
        <span className="text-sm text-gray-800">{item.id}</span>
      </div>
    </div>
  );
};

  const getElementIcon = (element: any) => {
    if (element.isGroup) {
      return expandedGroups.has(element.id) ? FolderOpen : Folder;
    }
    switch (element.type) {
      case 'text':
        return Type;
      case 'image':
        return Image;
      case 'shape':
        return Shapes;
      default:
        return Shapes;
    }
  };


  const toggleVisibility = (id: string) => {
    onElementsChange(
      elements.map(el => 
        el.id === id 
          ? { ...el, visible: !el.visible }
          : el
      )
    );
  };

  const toggleLock = (id: string) => {
    onElementsChange(
      elements.map(el => 
        el.id === id 
          ? { ...el, locked: !el.locked }
          : el
      )
    );
  };

  const deleteElement = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element?.isGroup) {
      // Si c'est un groupe, le dissocier d'abord puis supprimer les éléments
      ungroupElements(id);
    } else {
      onElementsChange(elements.filter(el => el.id !== id));
    }
  };

  const duplicateElement = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      if (element.isGroup && element.groupChildren) {
        // Dupliquer un groupe : dupliquer tous ses éléments et créer un nouveau groupe
        const childElements = elements.filter(el => element.groupChildren?.includes(el.id));
        const duplicatedChildren = childElements.map(child => ({
          ...child,
          id: `${child.id}-copy-${Date.now()}`,
          x: child.x + 20,
          y: child.y + 20
        }));
        
        const newElements = [...elements, ...duplicatedChildren];
        onElementsChange(newElements);
        
        // Créer un nouveau groupe avec les éléments dupliqués
        setTimeout(() => {
          createGroup(duplicatedChildren.map(el => el.id), `${element.name} (copie)`);
        }, 100);
      } else {
        // Dupliquer un élément simple
        const newElement = {
          ...element,
          id: `${element.id}-copy-${Date.now()}`,
          x: element.x + 20,
          y: element.y + 20
        };
        onElementsChange([...elements, newElement]);
      }
    }
  };

  const toggleGroupExpansion = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const handleCreateGroup = () => {
    if (selectedElements.length >= 2) {
      const elementIds = selectedElements.map(el => el.id);
      const groupId = createGroup(elementIds);
      if (groupId) {
        setSelectedGroupId(groupId);
        onSelectedElementsChange?.([]);
        console.log('🎯 Groupe créé depuis LayersPanel:', groupId);
      }
    }
  };

  const handleUngroupSelected = () => {
    if (selectedGroupId) {
      ungroupElements(selectedGroupId);
      setSelectedGroupId(null);
      console.log('🎯 Groupe dissocié depuis LayersPanel:', selectedGroupId);
    }
  };

  // --- Reorder helpers ---
  const buildTopUnits = useCallback((): Array<{ kind: 'group' | 'element'; id: string; children?: LayerItem[] }> => {
    return layersHierarchy.map((layer) => {
      if (layer.type === 'group') {
        return { kind: 'group', id: layer.id, children: layer.children || [] };
      }
      return { kind: 'element', id: layer.id };
    });
  }, [layersHierarchy]);

  const assignZIndicesFromUnits = useCallback((units: Array<{ kind: 'group' | 'element'; id: string; children?: LayerItem[] }>) => {
    // Build final draw order top->bottom as array of element IDs (exclude group container IDs)
    const orderedIds: string[] = [];
    units.forEach((u) => {
      if (u.kind === 'group') {
        const children = (u.children || []);
        // Children are already ordered top->bottom from hierarchy; keep as provided
        children.forEach((c) => orderedIds.push(c.id));
      } else {
        orderedIds.push(u.id);
      }
    });

    // Highest z on top, so start from orderedIds.length and go down
    let z = orderedIds.length;
    const zMap = new Map<string, number>();
    for (const id of orderedIds) {
      zMap.set(id, z--);
    }

    // Apply to elements; set group's zIndex to max child z for consistency
    const updated = elements.map((el) => {
      if (el.isGroup) {
        const group = units.find((u) => u.kind === 'group' && u.id === el.id);
        if (group) {
          const childMax = Math.max(
            -Infinity,
            ...(group.children || []).map((c) => zMap.get(c.id) ?? -Infinity)
          );
          // If group has no children found, preserve its zIndex
          return { ...el, zIndex: isFinite(childMax) ? childMax : (el.zIndex ?? 0) } as any;
        }
        return el;
      }
      // Non-group element or child
      if (zMap.has(el.id)) {
        return { ...el, zIndex: zMap.get(el.id)! } as any;
      }
      return el;
    });

    onElementsChange(updated as any[]);
    onAddToHistory?.({
      canvasElements: updated,
      action: 'REORDER_LAYERS'
    });
  }, [elements, onElementsChange]);

  // Preview version: update zIndex without history commit (for live canvas feedback during drag)
  const assignZIndicesFromUnitsPreview = useCallback((units: Array<{ kind: 'group' | 'element'; id: string; children?: LayerItem[] }>) => {
    const orderedIds: string[] = [];
    units.forEach((u) => {
      if (u.kind === 'group') {
        (u.children || []).forEach((c) => orderedIds.push(c.id));
      } else {
        orderedIds.push(u.id);
      }
    });
    let z = orderedIds.length;
    const zMap = new Map<string, number>();
    for (const id of orderedIds) zMap.set(id, z--);
    const updated = elements.map((el) => {
      if (el.isGroup) {
        const group = units.find((u) => u.kind === 'group' && u.id === el.id);
        if (group) {
          const childMax = Math.max(-Infinity, ...(group.children || []).map((c) => zMap.get(c.id) ?? -Infinity));
          return { ...el, zIndex: isFinite(childMax) ? childMax : (el.zIndex ?? 0) } as any;
        }
        return el;
      }
      if (zMap.has(el.id)) return { ...el, zIndex: zMap.get(el.id)! } as any;
      return el;
    });
    onElementsChange(updated as any[]);
  }, [elements, onElementsChange]);

  const handleReorder = useCallback((drag: DragItem, target: DragItem, position: 'above' | 'below') => {
    // Preserve hierarchy: only allow top-level with top-level, or within same parent group
    const sameParent = (drag.parentId || null) === (target.parentId || null);
    if (!sameParent) return; // disallow moving in/out of groups

    // Build current units from hierarchy (top-level)
    const units = buildTopUnits();

    if (!drag.parentId && !target.parentId) {
      // Top-level reorder
      const dragIdx = units.findIndex((u) => u.id === drag.id && u.kind === drag.kind);
      const targetIdx = units.findIndex((u) => u.id === target.id && u.kind === target.kind);
      if (dragIdx === -1 || targetIdx === -1) return;
      const [moved] = units.splice(dragIdx, 1);
      const insertAt = position === 'above' ? targetIdx : targetIdx + 1;
      units.splice(insertAt > dragIdx ? insertAt - 1 : insertAt, 0, moved);
      assignZIndicesFromUnits(units);
      return;
    }

    // Within a group
    if (drag.parentId && target.parentId && drag.parentId === target.parentId) {
      const groupUnit = units.find((u) => u.kind === 'group' && u.id === drag.parentId);
      if (!groupUnit || !groupUnit.children) return;
      const children = [...groupUnit.children];
      const dIdx = children.findIndex((c) => c.id === drag.id);
      const tIdx = children.findIndex((c) => c.id === target.id);
      if (dIdx === -1 || tIdx === -1) return;
      const [movedChild] = children.splice(dIdx, 1);
      const insertAt = position === 'above' ? tIdx : tIdx + 1;
      children.splice(insertAt > dIdx ? insertAt - 1 : insertAt, 0, movedChild);
      groupUnit.children = children;
      assignZIndicesFromUnits(units);
    }
  }, [assignZIndicesFromUnits, buildTopUnits]);

  // Live preview (no history) during hover
  const handleReorderPreview = useCallback((drag: DragItem, target: DragItem, position: 'above' | 'below') => {
    const sameParent = (drag.parentId || null) === (target.parentId || null);
    if (!sameParent) return;
    const units = buildTopUnits();
    if (!drag.parentId && !target.parentId) {
      const dragIdx = units.findIndex((u) => u.id === drag.id && u.kind === drag.kind);
      const targetIdx = units.findIndex((u) => u.id === target.id && u.kind === target.kind);
      if (dragIdx === -1 || targetIdx === -1) return;
      const [moved] = units.splice(dragIdx, 1);
      const insertAt = position === 'above' ? targetIdx : targetIdx + 1;
      units.splice(insertAt > dragIdx ? insertAt - 1 : insertAt, 0, moved);
      assignZIndicesFromUnitsPreview(units);
      return;
    }
    if (drag.parentId && target.parentId && drag.parentId === target.parentId) {
      const groupUnit = units.find((u) => u.kind === 'group' && u.id === drag.parentId);
      if (!groupUnit || !groupUnit.children) return;
      const children = [...groupUnit.children];
      const dIdx = children.findIndex((c) => c.id === drag.id);
      const tIdx = children.findIndex((c) => c.id === target.id);
      if (dIdx === -1 || tIdx === -1) return;
      const [movedChild] = children.splice(dIdx, 1);
      const insertAt = position === 'above' ? tIdx : tIdx + 1;
      children.splice(insertAt > dIdx ? insertAt - 1 : insertAt, 0, movedChild);
      groupUnit.children = children;
      assignZIndicesFromUnitsPreview(units);
    }
  }, [assignZIndicesFromUnitsPreview, buildTopUnits]);

  // Track original elements to revert if drag is canceled
  const originalElementsRef = useRef<any[] | null>(null);
  const lastPreviewKeyRef = useRef<string | null>(null);

  // DnD Row component to attach drag/drop to each layer entry
  const LayerRow: React.FC<{ layer: LayerItem; depth: number }> = ({ layer, depth }) => {
    const element = useMemo(() => elements.find(el => el.id === layer.id), [elements, layer.id]);
    if (!element) return null;

    const isGroup = layer.type === 'group';
    const isExpanded = expandedGroups.has(layer.id);
    const isSelected = selectedLayerId === layer.id || selectedGroupId === layer.id;
    const isVisible = layer.visible;
    const isLocked = layer.locked;

    const dragItem: DragItem = { id: layer.id, kind: isGroup ? 'group' : 'element', parentId: layer.parentId };

    const [{ isDragging }, dragRef] = useDrag(() => ({
      type: 'LAYER',
      item: () => {
        // Initialize original elements snapshot at drag start
        if (!originalElementsRef.current) {
          originalElementsRef.current = elements.map(e => ({ ...e }));
        }
        console.debug('[LayersPanel][drag:start]', { id: dragItem.id, parentId: dragItem.parentId });
        return dragItem;
      },
      canDrag: () => !isLocked,
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
      end: (_item, monitor) => {
        const didDrop = monitor.didDrop();
        console.debug('[LayersPanel][drag:end]', { id: dragItem.id, didDrop });
        if (!didDrop && originalElementsRef.current) {
          onElementsChange(originalElementsRef.current);
        }
        originalElementsRef.current = null;
        lastPreviewKeyRef.current = null;
      }
    }), [dragItem, elements, onElementsChange]);

    const [hoverPos, setHoverPos] = useState<'above' | 'below' | null>(null);
    const [, dropRef] = useDrop(() => ({
      accept: 'LAYER',
      canDrop: (item: DragItem) => {
        const sameParent = (item.parentId || null) === (layer.parentId || null);
        // Disallow dropping a group onto a child row from a different level
        if (isGroup && layer.parentId) return false; // group rows are only top-level
        return sameParent && item.id !== layer.id;
      },
      hover: (item: DragItem, monitor) => {
        const node = rowRef.current;
        if (!node) return;
        const client = monitor.getClientOffset();
        if (!client) return;
        const rect = node.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const pos: 'above' | 'below' = client.y < midY ? 'above' : 'below';
        setHoverPos(pos);
        const key = `${item.id}->${layer.id}:${pos}`;
        if (lastPreviewKeyRef.current !== key) {
          lastPreviewKeyRef.current = key;
          console.debug('[LayersPanel][hover:preview]', { from: item.id, to: layer.id, pos });
          handleReorderPreview(item, dragItem, pos);
        }
      },
      drop: (item: DragItem, monitor) => {
        const didDrop = monitor.didDrop();
        if (didDrop) return; // already handled by nested target
        const node = rowRef.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const client = monitor.getClientOffset();
        const midY = rect.top + rect.height / 2;
        const pos: 'above' | 'below' = client && client.y < midY ? 'above' : 'below';
        console.debug('[LayersPanel][drop:commit]', { from: item.id, to: layer.id, pos });
        handleReorder(item, dragItem, pos);
        setHoverPos(null);
      }
    }), [layer.id, layer.parentId, isGroup, handleReorder, handleReorderPreview]);

    const rowRef = React.useRef<HTMLDivElement | null>(null);
    const handleRef = React.useRef<HTMLSpanElement | null>(null);
    dropRef(rowRef);
    dragRef(handleRef);

    const Icon = getElementIcon(element);

    return (
      <div key={layer.id}>
        <div
          ref={rowRef}
          className={`relative group flex items-center space-x-2 p-2 rounded-lg border transition-colors cursor-pointer ${
            isSelected ? 'bg-blue-100 border-blue-300' : 'border-transparent hover:bg-gray-50'
          } ${isDragging ? 'opacity-0' : ''} ${hoverPos === 'above' ? 'ring-1 ring-blue-300' : ''}`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => {
            if (isGroup) {
              setSelectedGroupId(layer.id);
              setSelectedLayerId(null);
            } else {
              setSelectedLayerId(layer.id);
              setSelectedGroupId(null);
            }
          }}
        >
          {/* Drop indicator line */}
          {hoverPos && (
            <div
              className="absolute left-0 right-0"
              style={{
                top: hoverPos === 'above' ? 0 : undefined,
                bottom: hoverPos === 'below' ? 0 : undefined,
                height: 0,
                borderTop: hoverPos === 'above' ? '2px solid rgba(59,130,246,0.8)' : undefined,
                borderBottom: hoverPos === 'below' ? '2px solid rgba(59,130,246,0.8)' : undefined
              }}
            />
          )}
          {/* Drag Handle */}
          <span
            ref={handleRef}
            className={`p-1 mr-1 ${isLocked ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing'}`}
            onClick={(e) => e.stopPropagation()}
            title="Réordonner"
          >
            <GripVertical className="w-3 h-3" />
          </span>

          {/* Expansion Toggle for Groups */}
          {isGroup && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleGroupExpansion(layer.id);
              }}
              className="p-1 hover:bg-gray-200 rounded flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-gray-600" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-600" />
              )}
            </button>
          )}

          {/* Element Icon & Label */}
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Icon className={`w-4 h-4 flex-shrink-0 ${
              isVisible ? 'text-gray-600' : 'text-gray-300'
            }`} />
            <span className={`text-sm truncate ${
              isVisible ? 'text-gray-800' : 'text-gray-400'
            }`}>
              {layer.name}
            </span>
            {isLocked && (
              <Lock className="w-3 h-3 text-gray-400 flex-shrink-0" />
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Visibility Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleVisibility(layer.id);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title={isVisible ? 'Masquer' : 'Afficher'}
            >
              {isVisible ? (
                <Eye className="w-3 h-3 text-gray-600" />
              ) : (
                <EyeOff className="w-3 h-3 text-gray-400" />
              )}
            </button>

            {/* Lock Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLock(layer.id);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title={isLocked ? 'Déverrouiller' : 'Verrouiller'}
            >
              {isLocked ? (
                <Lock className="w-3 h-3 text-gray-600" />
              ) : (
                <Unlock className="w-3 h-3 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Children (for expanded groups) */}
        {isGroup && isExpanded && layer.children && (
          <div className="ml-4">
            {layer.children.map((child) => (
              <LayerRow key={child.id} layer={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Rendu d'un élément de calque (récursif pour les groupes)
  const renderLayerItem = (layer: LayerItem, depth = 0) => {
    const element = elements.find(el => el.id === layer.id);
    if (!element) return null;

    const Icon = getElementIcon(element);
    const isSelected = selectedLayerId === layer.id || selectedGroupId === layer.id;
    const isVisible = layer.visible;
    const isLocked = layer.locked;
    const isGroup = layer.type === 'group';
    const isExpanded = expandedGroups.has(layer.id);

    return (
      <div key={layer.id}>
        {/* Layer Item */}
        <div
          className={`group flex items-center space-x-2 p-2 rounded-lg border transition-colors cursor-pointer ${
            isSelected
              ? 'bg-blue-100 border-blue-300'
              : 'border-transparent hover:bg-gray-50'
          }`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => {
            if (isGroup) {
              setSelectedGroupId(layer.id);
              setSelectedLayerId(null);
            } else {
              setSelectedLayerId(layer.id);
              setSelectedGroupId(null);
            }
          }}
        >
          {/* Expansion Toggle for Groups */}
          {isGroup && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleGroupExpansion(layer.id);
              }}
              className="p-1 hover:bg-gray-200 rounded flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-gray-600" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-600" />
              )}
            </button>
          )}

          {/* Element Icon & Label */}
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Icon className={`w-4 h-4 flex-shrink-0 ${
              isVisible ? 'text-gray-600' : 'text-gray-300'
            }`} />
            <span className={`text-sm truncate ${
              isVisible ? 'text-gray-800' : 'text-gray-400'
            }`}>
              {layer.name}
            </span>
            {isLocked && (
              <Lock className="w-3 h-3 text-gray-400 flex-shrink-0" />
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Visibility Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleVisibility(layer.id);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title={isVisible ? 'Masquer' : 'Afficher'}
            >
              {isVisible ? (
                <Eye className="w-3 h-3 text-gray-600" />
              ) : (
                <EyeOff className="w-3 h-3 text-gray-400" />
              )}
            </button>

            {/* Lock Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLock(layer.id);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title={isLocked ? 'Déverrouiller' : 'Verrouiller'}
            >
              {isLocked ? (
                <Lock className="w-3 h-3 text-gray-600" />
              ) : (
                <Unlock className="w-3 h-3 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Children (for expanded groups) */}
        {isGroup && isExpanded && layer.children && (
          <div className="ml-4">
            {layer.children.map(child => renderLayerItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-800">Calques</h3>
        <span className="text-xs text-gray-500">
          {elements.length} élément{elements.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Group Actions */}
      {(selectedElements.length >= 2 || selectedGroupId) && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">
              {selectedElements.length >= 2 ? 'Sélection multiple' : 'Groupe sélectionné'}
            </span>
          </div>
          <div className="flex space-x-2">
            {selectedElements.length >= 2 && (
              <button
                onClick={handleCreateGroup}
                className="flex items-center space-x-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Group className="w-3 h-3" />
                <span>Grouper</span>
              </button>
            )}
            {selectedGroupId && (
              <button
                onClick={handleUngroupSelected}
                className="flex items-center space-x-1 px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
              >
                <Ungroup className="w-3 h-3" />
                <span>Dissocier</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Layers List with DnD */}
      <DndProvider backend={HTML5Backend}>
        {layersHierarchy.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Shapes className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">Aucun élément</p>
            <p className="text-gray-400 text-xs mt-1">
              Ajoutez des éléments depuis la section Assets
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {layersHierarchy.map((layer) => (
              <LayerRow key={layer.id} layer={layer} depth={0} />
            ))}
          </div>
        )}
        {/* Custom drag preview following cursor */}
        <CustomDragPreview />
      </DndProvider>

      {/* Selected Element Actions */}
      {(selectedLayerId || selectedGroupId) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => duplicateElement(selectedLayerId || selectedGroupId || '')}
              className="flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              <Copy className="w-3 h-3" />
              <span>Dupliquer</span>
            </button>
            
            <button
              onClick={() => deleteElement(selectedLayerId || selectedGroupId || '')}
              className="flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Supprimer</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayersPanel;