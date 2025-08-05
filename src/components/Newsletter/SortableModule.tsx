
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import ModuleRenderer from './ModuleRenderer';
import { useNewsletterStore } from '@/stores/newsletterStore';

interface SortableModuleProps {
  module: any;
}

export const SortableModule: React.FC<SortableModuleProps> = ({ module }) => {
  const { selectedModuleId, selectModule } = useNewsletterStore();
  const isSelected = selectedModuleId === module.id;
  
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
  };

  return (
    <motion.div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`relative transition-all duration-200 ${
        isDragging ? 'opacity-50 z-50' : 'opacity-100'
      } ${
        isSelected ? 'ring-2 ring-[#841b60] ring-offset-2 shadow-lg' : 'hover:shadow-md'
      }`}
      onClick={() => selectModule(module.id)}
      whileHover={{ scale: isDragging ? 1 : 1.01 }}
      whileTap={{ scale: 0.99 }}
      layout
    >
      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-br from-[#841b60] to-[#b41b60] rounded-full flex items-center justify-center z-10 shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        >
          <span className="text-white text-xs font-bold">✓</span>
        </motion.div>
      )}
      
      <ModuleRenderer module={module} />
    </motion.div>
  );
};
