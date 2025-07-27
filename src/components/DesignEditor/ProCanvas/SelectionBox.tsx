import React from 'react';

interface SelectionBoxProps {
  box: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  };
  onElementsSelect: (elementIds: string[]) => void;
  elements: any[];
}

const SelectionBox: React.FC<SelectionBoxProps> = ({ box }) => {
  const left = Math.min(box.startX, box.endX);
  const top = Math.min(box.startY, box.endY);
  const width = Math.abs(box.endX - box.startX);
  const height = Math.abs(box.endY - box.startY);

  return (
    <div
      className="absolute pointer-events-none z-40"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        border: '2px dashed #3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '2px'
      }}
    />
  );
};

export default SelectionBox;