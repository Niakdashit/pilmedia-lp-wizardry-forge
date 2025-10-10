import React, { useState } from 'react';
import { Type, Shapes, Search } from 'lucide-react';
import TextPanel from './TextPanel';
import { shapes, ShapeDefinition } from '../shapes/shapeLibrary';

interface AssetsPanelProps {
  onAddElement: (element: any) => void;
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
  selectedDevice?: 'desktop' | 'tablet' | 'mobile';
  elements?: any[];
}

const AssetsPanel: React.FC<AssetsPanelProps> = ({ onAddElement, selectedElement, onElementUpdate, selectedDevice = 'desktop', elements = [] }) => {
  // Preview color for shapes in the sub-tab "Formes"
  const SHAPE_PREVIEW_COLOR = '#b1b1b1';
  const [activeTab, setActiveTab] = useState('text');
  const [searchQuery, setSearchQuery] = useState('');
  // uploads removed

  const categories = [
    { id: 'text', label: 'Texte', icon: Type },
    { id: 'shapes', label: 'Formes', icon: Shapes }
  ];

  const handleAddShape = (shape: ShapeDefinition) => {
    const element = {
      id: `shape-${Date.now()}-${shape.id}`,
      type: 'shape',
      x: 100,
      y: 100,
      width: 150,
      height: 150,
      rotation: 0,
      zIndex: 1,
      backgroundColor: shape.color,
      style: {
        backgroundColor: shape.color,
      },
      shapeType: shape.type, // Assurez-vous que c'est bien défini
      // Propriétés spécifiques pour certaines formes
      ...(shape.aspectRatio && { aspectRatio: shape.aspectRatio }),
      ...(shape.borderRadius && { borderRadius: shape.borderRadius }),
      metadata: {
        originalType: shape.type,
        icon: shape.icon?.name || 'square'
      }
    };
    onAddElement(element);
  };

  // uploads handlers removed

  const renderContent = () => {
    switch (activeTab) {
      case 'text':
        return <TextPanel onAddElement={onAddElement} selectedElement={selectedElement} onElementUpdate={onElementUpdate} selectedDevice={selectedDevice} elements={elements} />;

      case 'shapes':
        // Filtrer toutes les formes selon la recherche
        let shapesToShow = shapes;
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          shapesToShow = shapes.filter((shape: ShapeDefinition) => 
            shape.label.toLowerCase().includes(query) || 
            shape.type.toLowerCase().includes(query)
          );
        }

        return (
          <div>
            {/* Grille de formes sans cadres */}
            <div className="grid grid-cols-3 gap-4">
              {shapesToShow.map((shape: ShapeDefinition) => {
                return (
                  <button
                    key={shape.id}
                    onClick={() => handleAddShape(shape)}
                    className="aspect-square p-2 hover:bg-gray-100 hover:bg-opacity-20 transition-colors flex items-center justify-center"
                    title={shape.label}
                  >
                    {shape.viewBox && shape.paths ? (
                      <svg
                        viewBox={shape.viewBox}
                        className="w-full h-full"
                        fill="none"
                      >
                        {shape.paths.map((path: any, index: number) => (
                          <path
                            key={index}
                            d={path.d}
                            fill={SHAPE_PREVIEW_COLOR}
                            stroke="none"
                            {...(path.fillRule && { fillRule: path.fillRule })}
                            {...(path.clipRule && { clipRule: path.clipRule })}
                            {...(path.opacity && { opacity: path.opacity })}
                          />
                        ))}
                      </svg>
                    ) : (
                      <div className="w-full h-full" style={{ backgroundColor: SHAPE_PREVIEW_COLOR }}></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      // uploads tab removed

      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      {/* Tabs */}
      {(() => {
        const visibleCategories = categories; // shapes tab still present in QuizEditor; adjust if needed later
        if (visibleCategories.length <= 1) return null;
        return (
          <div className="flex border-b border-gray-200 mb-4">
            {visibleCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 ${
                    activeTab === category.id
                      ? 'text-[hsl(var(--primary))] border-b-2 border-[hsl(var(--primary))]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        );
      })()}

      {/* Search - Seulement affiché pour les formes */}
      {activeTab === 'shapes' && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une forme..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
          />
        </div>
      )}

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default AssetsPanel;