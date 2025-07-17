
import React from 'react';

interface TextResizeHandlesProps {
  onResizeStart: (handle: string) => (e: React.MouseEvent) => void;
}

const TextResizeHandles: React.FC<TextResizeHandlesProps> = ({ onResizeStart }) => {
  const getResizeHandleStyle = (position: string) => {
    const baseStyle = "absolute w-3 h-3 bg-blue-500 border border-white rounded-full shadow-lg hover:bg-blue-600 transition-colors cursor-pointer";
    
    switch (position) {
      case 'nw':
        return `${baseStyle} -top-1 -left-1 cursor-nw-resize`;
      case 'ne':
        return `${baseStyle} -top-1 -right-1 cursor-ne-resize`;
      case 'sw':
        return `${baseStyle} -bottom-1 -left-1 cursor-sw-resize`;
      case 'se':
        return `${baseStyle} -bottom-1 -right-1 cursor-se-resize`;
      case 'n':
        return `${baseStyle} -top-1 left-1/2 transform -translate-x-1/2 cursor-n-resize`;
      case 's':
        return `${baseStyle} -bottom-1 left-1/2 transform -translate-x-1/2 cursor-s-resize`;
      case 'w':
        return `${baseStyle} -left-1 top-1/2 transform -translate-y-1/2 cursor-w-resize`;
      case 'e':
        return `${baseStyle} -right-1 top-1/2 transform -translate-y-1/2 cursor-e-resize`;
      default:
        return baseStyle;
    }
  };

  return (
    <>
      {/* Coins */}
      <div
        className={getResizeHandleStyle('nw')}
        onMouseDown={onResizeStart('nw')}
        style={{ zIndex: 1001, pointerEvents: 'auto' }}
      />
      <div
        className={getResizeHandleStyle('ne')}
        onMouseDown={onResizeStart('ne')}
        style={{ zIndex: 1001, pointerEvents: 'auto' }}
      />
      <div
        className={getResizeHandleStyle('sw')}
        onMouseDown={onResizeStart('sw')}
        style={{ zIndex: 1001, pointerEvents: 'auto' }}
      />
      <div
        className={getResizeHandleStyle('se')}
        onMouseDown={onResizeStart('se')}
        style={{ zIndex: 1001, pointerEvents: 'auto' }}
      />
      
      {/* Milieux des côtés */}
      <div
        className={getResizeHandleStyle('n')}
        onMouseDown={onResizeStart('n')}
        style={{ zIndex: 1001, pointerEvents: 'auto' }}
      />
      <div
        className={getResizeHandleStyle('s')}
        onMouseDown={onResizeStart('s')}
        style={{ zIndex: 1001, pointerEvents: 'auto' }}
      />
      <div
        className={getResizeHandleStyle('w')}
        onMouseDown={onResizeStart('w')}
        style={{ zIndex: 1001, pointerEvents: 'auto' }}
      />
      <div
        className={getResizeHandleStyle('e')}
        onMouseDown={onResizeStart('e')}
        style={{ zIndex: 1001, pointerEvents: 'auto' }}
      />
    </>
  );
};

export default TextResizeHandles;
