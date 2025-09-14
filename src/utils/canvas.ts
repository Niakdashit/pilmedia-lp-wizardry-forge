// @ts-nocheck
// Canvas utility functions for TemplatedQuiz component

// Add element to canvas utility function
export const addElementToCanvas = (element: any, canvas?: any) => {
  // Basic implementation for adding elements to canvas
  if (!element) return null;
  
  return {
    id: element.id || Date.now().toString(),
    type: element.type || 'text',
    x: element.x || 0,
    y: element.y || 0,
    width: element.width || 100,
    height: element.height || 50,
    ...element
  };
};
