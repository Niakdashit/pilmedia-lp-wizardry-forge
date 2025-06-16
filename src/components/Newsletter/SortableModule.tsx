import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ModuleRenderer from './ModuleRenderer';

interface SortableModuleProps {
  module: any;
  isSelected?: boolean;
  onClick?: () => void;
}

export const SortableModule: React.FC<SortableModuleProps> = ({
  module,
  isSelected,
  onClick
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`relative ${isSelected ? 'ring-2 ring-[#841b60]' : ''}`}
      onClick={onClick}
    >
      <ModuleRenderer module={module} />
    </div>
  );
};