import React from 'react';

export interface ShapeDefinition {
  id: string;
  name: string;
  category: string;
  label?: string;
  type?: string;
  color?: string;
  aspectRatio?: number;
  borderRadius?: number;
  icon?: any;
  viewBox?: string;
  paths?: string[];
}

export const shapes: ShapeDefinition[] = [];

// Shape library for ScratchCardEditor
const IconsPanel: React.FC = () => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Shapes Library</h3>
      <p className="text-gray-600">No shapes available</p>
    </div>
  );
};

export default IconsPanel;