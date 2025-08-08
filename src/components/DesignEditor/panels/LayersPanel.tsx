import React, { useState } from 'react';
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
  Ungroup
} from 'lucide-react';
import { LayerItem } from '../../../types/groupTypes';
import { useGroupManager } from '../../../hooks/useGroupManager';

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

      {/* Layers List */}
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
          {layersHierarchy.map(layer => renderLayerItem(layer))}
        </div>
      )}

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