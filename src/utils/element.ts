// @ts-nocheck
// Element utility functions for TemplatedQuiz component

// Duplicate element utility function
export const duplicateElement = (element: any) => {
  if (!element) return null;
  
  return {
    ...element,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    x: (element.x || 0) + 10,
    y: (element.y || 0) + 10
  };
};

// Delete element utility function
export const deleteElement = (elementId: string, elements: any[]) => {
  if (!elements || !elementId) return elements;
  
  return elements.filter(el => el.id !== elementId);
};
