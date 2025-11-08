import React from 'react';
import { Square, Circle, Triangle, Star, Heart, Zap } from 'lucide-react';

interface ElementsPanelProps {
  onAddElement: (element: any) => void;
}

const ElementsPanel: React.FC<ElementsPanelProps> = ({ onAddElement }) => {
  const shapes = [
    { id: 'rectangle', name: 'Rectangle', icon: Square, shape: 'rectangle' },
    { id: 'circle', name: 'Cercle', icon: Circle, shape: 'circle' },
    { id: 'triangle', name: 'Triangle', icon: Triangle, shape: 'triangle' },
    { id: 'star', name: 'Étoile', icon: Star, shape: 'star' },
    { id: 'heart', name: 'Cœur', icon: Heart, shape: 'heart' },
    { id: 'lightning', name: 'Éclair', icon: Zap, shape: 'lightning' },
  ];

  const lines = [
    { id: 'line-horizontal', name: 'Ligne horizontale', width: 100, height: 2 },
    { id: 'line-vertical', name: 'Ligne verticale', width: 2, height: 100 },
    { id: 'line-diagonal', name: 'Ligne diagonale', width: 100, height: 2, rotation: 45 },
  ];

  const addShape = (shape: any) => {
    onAddElement({
      id: `shape-${Date.now()}`,
      type: 'shape',
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      backgroundColor: '#3B82F6',
      borderRadius: shape.shape === 'circle' ? 50 : 0,
      shape: shape.shape,
      zIndex: 10
    });
  };

  const addWheel = () => {
    const wheelSegments = [
      { id: '1', label: 'Cadeau 1', color: '#FF6B6B', value: 'cadeau1' },
      { id: '2', label: 'Cadeau 2', color: '#4ECDC4', value: 'cadeau2' },
      { id: '3', label: 'Cadeau 3', color: '#45B7D1', value: 'cadeau3' },
      { id: '4', label: 'Cadeau 4', color: '#96CEB4', value: 'cadeau4' },
      { id: '5', label: 'Cadeau 5', color: '#FFEAA7', value: 'cadeau5' },
      { id: '6', label: 'Cadeau 6', color: '#DDA0DD', value: 'cadeau6' },
    ];

    onAddElement({
      id: `wheel-${Date.now()}`,
      type: 'wheel',
      x: 200,
      y: 150,
      width: 300,
      height: 300,
      segments: wheelSegments,
      zIndex: 10
    });
  };

  const addLine = (line: any) => {
    onAddElement({
      id: `line-${Date.now()}`,
      type: 'shape',
      x: 100,
      y: 100,
      width: line.width,
      height: line.height,
      backgroundColor: '#000000',
      rotation: line.rotation || 0,
      zIndex: 10
    });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Roue de la Fortune */}
      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">JEU INTERACTIF</h3>
        <button
          onClick={addWheel}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] hover:text-white transition-colors flex flex-col items-center group"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-red-500 rounded-full mb-2 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white rounded-full"></div>
          </div>
          <span className="text-sm text-gray-600 group-hover:text-white">Roue de la Fortune</span>
        </button>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">FORMES</h3>
        <div className="grid grid-cols-3 gap-2">
          {shapes.map((shape) => {
            const Icon = shape.icon;
            return (
              <button
                key={shape.id}
                onClick={() => addShape(shape)}
                className="p-3 border border-gray-200 rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] hover:text-white transition-colors group"
                title={shape.name}
              >
                <Icon className="w-6 h-6 mx-auto text-gray-600 group-hover:text-white" />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">LIGNES</h3>
        <div className="space-y-2">
          {lines.map((line) => (
            <button
              key={line.id}
              onClick={() => addLine(line)}
              className="w-full p-3 border border-gray-200 rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] hover:text-white transition-colors text-left text-sm"
            >
              {line.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">GRILLES</h3>
        <div className="grid grid-cols-2 gap-2">
          <button className="p-4 border border-gray-200 rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] hover:text-white transition-colors">
            <div className="grid grid-cols-2 gap-1 w-8 h-8 mx-auto">
              <div className="bg-gray-400 rounded-sm"></div>
              <div className="bg-gray-400 rounded-sm"></div>
              <div className="bg-gray-400 rounded-sm"></div>
              <div className="bg-gray-400 rounded-sm"></div>
            </div>
            <div className="text-xs text-center mt-2">2×2</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] hover:text-white transition-colors">
            <div className="grid grid-cols-3 gap-1 w-8 h-8 mx-auto">
              <div className="bg-gray-400 rounded-sm"></div>
              <div className="bg-gray-400 rounded-sm"></div>
              <div className="bg-gray-400 rounded-sm"></div>
              <div className="bg-gray-400 rounded-sm"></div>
              <div className="bg-gray-400 rounded-sm"></div>
              <div className="bg-gray-400 rounded-sm"></div>
            </div>
            <div className="text-xs text-center mt-2">3×2</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ElementsPanel;