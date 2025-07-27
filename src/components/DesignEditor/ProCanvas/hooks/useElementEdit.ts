import { useState, useCallback } from 'react';

export const useElementEdit = (element: any, onUpdate: (id: string, updates: any) => void) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(element.content || '');

  const handleEditStart = useCallback(() => {
    if (element.type === 'text') {
      setIsEditing(true);
      setEditValue(element.content || '');
    }
  }, [element]);

  const handleEditEnd = useCallback(() => {
    if (isEditing) {
      onUpdate(element.id, { content: editValue });
      setIsEditing(false);
    }
  }, [isEditing, editValue, element.id, onUpdate]);

  return {
    isEditing,
    editValue,
    setEditValue,
    handleEditStart,
    handleEditEnd
  };
};