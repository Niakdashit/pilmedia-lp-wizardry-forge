
import { useState, useRef } from 'react';

export const useCanvasState = () => {
  const [showGridLines, setShowGridLines] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowAddMenu(false);
    }
  };

  const toggleAddMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAddMenu(!showAddMenu);
  };

  return {
    showGridLines,
    setShowGridLines,
    showAddMenu,
    setShowAddMenu,
    canvasRef,
    handleCanvasClick,
    toggleAddMenu
  };
};
