import React from 'react';
import { Eye, EyeOff, Trash2, ChevronUp, ChevronDown, Lock, Unlock } from 'lucide-react';

interface LayersPanelProps {
  elements: any[];
  selectedElements: string[];
  onElementsChange: (elements: any[]) => void;
  onElementSelect: (id: string, isCtrlPressed?: boolean) => void;
}

const LayersPanel: React.FC<LayersPanelProps> = ({
  elements,
  selectedElements,
  onElementsChange,
  onElementSelect
}) => {
  const sortedElements = [...elements].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

  const handleVisibilityToggle = (elementId: string) => {
    onElementsChange(elements.map(el => 
      el.id === elementId 
        ? { ...el, visible: el.visible !== false ? false : true }
        : el
    ));
  };

  const handleLockToggle = (elementId: string) => {
    onElementsChange(elements.map(el => 
      el.id === elementId 
        ? { ...el, locked: !el.locked }
        : el
    ));
  };

  const handleMoveLayer = (elementId: string, direction: 'up' | 'down') => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const currentZ = element.zIndex || 0;
    const newZ = direction === 'up' ? currentZ + 1 : currentZ - 1;

    onElementsChange(elements.map(el => 
      el.id === elementId 
        ? { ...el, zIndex: newZ }
        : el
    ));
  };

  const handleDelete = (elementId: string) => {
    onElementsChange(elements.filter(el => el.id !== elementId));
  };

  const getElementName = (element: any) => {
    switch (element.type) {
      case 'text':
        return `Texte: ${element.content?.substring(0, 15) || 'Sans titre'}...`;
      case 'image':
        return `Image: ${element.alt || 'Sans titre'}`;
      case 'wheel':
        return 'Roue de la fortune';
      case 'shape':
        return 'Forme';
      default:
        return 'Élément';
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium mb-3 text-foreground">Calques</h3>
      <div className="space-y-1">
        {sortedElements.map((element) => (
          <div
            key={element.id}
            className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted/50 ${
              selectedElements.includes(element.id) 
                ? 'bg-primary/10 border border-primary/20' 
                : 'bg-background'
            }`}
            onClick={(e) => onElementSelect(element.id, e.ctrlKey || e.metaKey)}
          >
            {/* Visibility toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleVisibilityToggle(element.id);
              }}
              className="p-1 hover:bg-muted rounded"
            >
              {element.visible !== false ? (
                <Eye className="w-3 h-3 text-muted-foreground" />
              ) : (
                <EyeOff className="w-3 h-3 text-muted-foreground" />
              )}
            </button>

            {/* Element name */}
            <span className="flex-1 text-xs text-foreground truncate">
              {getElementName(element)}
            </span>

            {/* Layer controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveLayer(element.id, 'up');
                }}
                className="p-1 hover:bg-muted rounded"
              >
                <ChevronUp className="w-3 h-3 text-muted-foreground" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveLayer(element.id, 'down');
                }}
                className="p-1 hover:bg-muted rounded"
              >
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLockToggle(element.id);
                }}
                className="p-1 hover:bg-muted rounded"
              >
                {element.locked ? (
                  <Lock className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <Unlock className="w-3 h-3 text-muted-foreground" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(element.id);
                }}
                className="p-1 hover:bg-red-100 text-red-600 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
        
        {elements.length === 0 && (
          <div className="text-center py-4 text-xs text-muted-foreground">
            Aucun calque
          </div>
        )}
      </div>
    </div>
  );
};

export default LayersPanel;