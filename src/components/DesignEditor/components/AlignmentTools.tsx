import React from 'react';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignStartVertical, 
  AlignCenterVertical, 
  AlignEndVertical,
  ArrowRightLeft,
  ArrowUpDown
} from 'lucide-react';

interface AlignmentToolsProps {
  selectedElements: string[];
  elements: any[];
  onElementsChange: (elements: any[]) => void;
  canvasSize: { width: number; height: number };
}

const AlignmentTools: React.FC<AlignmentToolsProps> = ({
  selectedElements,
  elements,
  onElementsChange,
  canvasSize
}) => {
  const handleAlign = (type: string) => {
    if (selectedElements.length < 2) return;

    const selected = elements.filter(el => selectedElements.includes(el.id));
    
    let updates: any = {};

    switch (type) {
      case 'left':
        const leftMost = Math.min(...selected.map(el => el.x || 0));
        updates = selected.reduce((acc, el) => {
          acc[el.id] = { x: leftMost };
          return acc;
        }, {});
        break;
        
      case 'center':
        const centerX = canvasSize.width / 2;
        updates = selected.reduce((acc, el) => {
          const elementWidth = el.width || 100;
          acc[el.id] = { x: centerX - elementWidth / 2 };
          return acc;
        }, {});
        break;
        
      case 'right':
        const rightMost = Math.max(...selected.map(el => (el.x || 0) + (el.width || 100)));
        updates = selected.reduce((acc, el) => {
          const elementWidth = el.width || 100;
          acc[el.id] = { x: rightMost - elementWidth };
          return acc;
        }, {});
        break;
        
      case 'top':
        const topMost = Math.min(...selected.map(el => el.y || 0));
        updates = selected.reduce((acc, el) => {
          acc[el.id] = { y: topMost };
          return acc;
        }, {});
        break;
        
      case 'middle':
        const centerY = canvasSize.height / 2;
        updates = selected.reduce((acc, el) => {
          const elementHeight = el.height || 100;
          acc[el.id] = { y: centerY - elementHeight / 2 };
          return acc;
        }, {});
        break;
        
      case 'bottom':
        const bottomMost = Math.max(...selected.map(el => (el.y || 0) + (el.height || 100)));
        updates = selected.reduce((acc, el) => {
          const elementHeight = el.height || 100;
          acc[el.id] = { y: bottomMost - elementHeight };
          return acc;
        }, {});
        break;
    }

    onElementsChange(elements.map(el => 
      updates[el.id] ? { ...el, ...updates[el.id] } : el
    ));
  };

  const handleDistribute = (direction: 'horizontal' | 'vertical') => {
    if (selectedElements.length < 3) return;

    const selected = elements.filter(el => selectedElements.includes(el.id));
    
    if (direction === 'horizontal') {
      selected.sort((a, b) => (a.x || 0) - (b.x || 0));
      const totalWidth = (selected[selected.length - 1].x || 0) - (selected[0].x || 0);
      const spacing = totalWidth / (selected.length - 1);
      
      const updates = selected.reduce((acc, el, index) => {
        if (index > 0 && index < selected.length - 1) {
          acc[el.id] = { x: (selected[0].x || 0) + spacing * index };
        }
        return acc;
      }, {});
      
      onElementsChange(elements.map(el => 
        updates[el.id] ? { ...el, ...updates[el.id] } : el
      ));
    } else {
      selected.sort((a, b) => (a.y || 0) - (b.y || 0));
      const totalHeight = (selected[selected.length - 1].y || 0) - (selected[0].y || 0);
      const spacing = totalHeight / (selected.length - 1);
      
      const updates = selected.reduce((acc, el, index) => {
        if (index > 0 && index < selected.length - 1) {
          acc[el.id] = { y: (selected[0].y || 0) + spacing * index };
        }
        return acc;
      }, {});
      
      onElementsChange(elements.map(el => 
        updates[el.id] ? { ...el, ...updates[el.id] } : el
      ));
    }
  };

  if (selectedElements.length < 2) {
    return (
      <div className="p-4 text-center text-xs text-muted-foreground">
        Sélectionnez au moins 2 éléments pour utiliser les outils d'alignement
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium mb-3 text-foreground">Alignement</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-2">Alignement horizontal</p>
          <div className="flex gap-1">
            <button
              onClick={() => handleAlign('left')}
              className="p-2 hover:bg-muted rounded"
              title="Aligner à gauche"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAlign('center')}
              className="p-2 hover:bg-muted rounded"
              title="Centrer horizontalement"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAlign('right')}
              className="p-2 hover:bg-muted rounded"
              title="Aligner à droite"
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Alignement vertical</p>
          <div className="flex gap-1">
            <button
              onClick={() => handleAlign('top')}
              className="p-2 hover:bg-muted rounded"
              title="Aligner en haut"
            >
              <AlignStartVertical className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAlign('middle')}
              className="p-2 hover:bg-muted rounded"
              title="Centrer verticalement"
            >
              <AlignCenterVertical className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAlign('bottom')}
              className="p-2 hover:bg-muted rounded"
              title="Aligner en bas"
            >
              <AlignEndVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {selectedElements.length >= 3 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Distribution</p>
            <div className="flex gap-1">
              <button
                onClick={() => handleDistribute('horizontal')}
                className="p-2 hover:bg-muted rounded"
                title="Distribuer horizontalement"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDistribute('vertical')}
                className="p-2 hover:bg-muted rounded"
                title="Distribuer verticalement"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlignmentTools;