import React from 'react';

interface TextPanelProps {
  onAddElement: (element: any) => void;
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
  selectedDevice?: 'desktop' | 'tablet' | 'mobile';
  elements?: any[];
}

const TextPanel: React.FC<TextPanelProps> = () => {
  return null;
};
export default TextPanel;
