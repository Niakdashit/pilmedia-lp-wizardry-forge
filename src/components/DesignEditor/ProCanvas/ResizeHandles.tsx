import React from 'react';

interface ResizeHandlesProps {
  element?: any;
  onResizeStart: (handle: string) => (e: React.MouseEvent) => void;
  isResizing?: boolean;
}

const ResizeHandles: React.FC<ResizeHandlesProps> = ({
  onResizeStart
}) => {
  const handleStyle = "absolute w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-pointer hover:bg-blue-600 transition-colors";
  
  return (
    <>
      {/* Corner handles */}
      <div
        className={`${handleStyle} -top-1 -left-1 cursor-nw-resize`}
        onMouseDown={onResizeStart('nw')}
      />
      <div
        className={`${handleStyle} -top-1 -right-1 cursor-ne-resize`}
        onMouseDown={onResizeStart('ne')}
      />
      <div
        className={`${handleStyle} -bottom-1 -left-1 cursor-sw-resize`}
        onMouseDown={onResizeStart('sw')}
      />
      <div
        className={`${handleStyle} -bottom-1 -right-1 cursor-se-resize`}
        onMouseDown={onResizeStart('se')}
      />
      
      {/* Edge handles */}
      <div
        className={`${handleStyle} -top-1 left-1/2 transform -translate-x-1/2 cursor-n-resize`}
        onMouseDown={onResizeStart('n')}
      />
      <div
        className={`${handleStyle} -bottom-1 left-1/2 transform -translate-x-1/2 cursor-s-resize`}
        onMouseDown={onResizeStart('s')}
      />
      <div
        className={`${handleStyle} -left-1 top-1/2 transform -translate-y-1/2 cursor-w-resize`}
        onMouseDown={onResizeStart('w')}
      />
      <div
        className={`${handleStyle} -right-1 top-1/2 transform -translate-y-1/2 cursor-e-resize`}
        onMouseDown={onResizeStart('e')}
      />
    </>
  );
};

export default ResizeHandles;