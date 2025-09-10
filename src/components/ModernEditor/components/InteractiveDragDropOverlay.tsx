// @ts-nocheck
import React, { useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useSelected } from '../../hooks/useSelected';
import { shallow } from 'zustand/shallow';
import { useAppStore } from '../../store/appStore';
import { getClosestCorners, snapCenterToCursor } from '@dnd-kit/modifiers';
import { AlignmentGuides } from '../../DesignEditor/components/AlignmentGuides';

const selector = (state) => ({
  setElements: state.setElements,
  elements: state.elements,
});

interface InteractiveDragDropOverlayProps {
  id: string;
}

export const InteractiveDragDropOverlay: React.FC<InteractiveDragDropOverlayProps> = ({ id }) => {
  const { setElements, elements } = useAppStore(selector, shallow);
  const { isSelected } = useSelected(id);
  const { attributes, listeners, setNodeRef, transform, transition } = useDraggable({
    id,
    modifiers: [snapCenterToCursor({ onlyWhenDragged: true }), getClosestCorners()],
  });

  const style = useMemo(() => {
    return {
      opacity: isSelected ? 0.6 : 0,
      transition,
      transform: CSS.Translate.toString(transform),
    };
  }, [isSelected, transform, transition]);

  return (
    <>
      {isSelected && <AlignmentGuides id={id} />}
      <div
        ref={setNodeRef}
        style={style}
        className="absolute top-0 left-0 w-full h-full cursor-move"
        {...listeners}
        {...attributes}
      />
    </>
  );
};
