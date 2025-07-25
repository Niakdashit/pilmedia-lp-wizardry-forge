import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Trash2, 
  Copy,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Type,
  Image,
  Shapes
} from 'lucide-react';

interface LayersPanelProps {
  elements: any[];
  onElementsChange: (elements: any[]) => void;
}

const LayersPanel: React.FC<LayersPanelProps> = ({ elements, onElementsChange }) => {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const getElementIcon = (element: any) => {
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

  const getElementLabel = (element: any) => {
    switch (element.type) {
      case 'text':
        return element.content || 'Texte';
      case 'image':
        return 'Image';
      case 'shape':
        return `Forme ${element.shapeType || ''}`;
      default:
        return 'Élément';
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
    onElementsChange(elements.filter(el => el.id !== id));
  };

  const duplicateElement = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      const newElement = {
        ...element,
        id: `${element.id}-copy-${Date.now()}`,
        x: element.x + 20,
        y: element.y + 20
      };
      onElementsChange([...elements, newElement]);
    }
  };

  const moveElement = (id: string, direction: 'up' | 'down') => {
    const currentIndex = elements.findIndex(el => el.id === id);
    if (currentIndex === -1) return;

    const newElements = [...elements];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex >= 0 && targetIndex < elements.length) {
      [newElements[currentIndex], newElements[targetIndex]] = 
      [newElements[targetIndex], newElements[currentIndex]];
      onElementsChange(newElements);
    }
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

      {/* Elements List */}
      {elements.length === 0 ? (
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
          {elements.map((element) => {
            const Icon = getElementIcon(element);
            const isSelected = selectedElement === element.id;
            const isVisible = element.visible !== false;
            const isLocked = element.locked === true;

            return (
              <div
                key={element.id}
                className={`group flex items-center space-x-2 p-2 rounded-lg border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 border-blue-200'
                    : 'border-transparent hover:bg-gray-50'
                }`}
                onClick={() => setSelectedElement(element.id)}
              >
                {/* Element Icon & Label */}
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${
                    isVisible ? 'text-gray-600' : 'text-gray-300'
                  }`} />
                  <span className={`text-sm truncate ${
                    isVisible ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                    {getElementLabel(element)}
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
                      toggleVisibility(element.id);
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
                      toggleLock(element.id);
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

                  {/* More Options */}
                  <div className="relative">
                    <button
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Plus d'options"
                    >
                      <MoreVertical className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Element Actions */}
      {selectedElement && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => duplicateElement(selectedElement)}
              className="flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              <Copy className="w-3 h-3" />
              <span>Dupliquer</span>
            </button>
            
            <button
              onClick={() => deleteElement(selectedElement)}
              className="flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Supprimer</span>
            </button>

            <button
              onClick={() => moveElement(selectedElement, 'up')}
              className="flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              <ArrowUp className="w-3 h-3" />
              <span>Avant</span>
            </button>
            
            <button
              onClick={() => moveElement(selectedElement, 'down')}
              className="flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              <ArrowDown className="w-3 h-3" />
              <span>Arrière</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayersPanel;