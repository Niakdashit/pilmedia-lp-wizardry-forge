import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit3, 
  Type, 
  Palette, 
  Move, 
  Copy, 
  Trash2, 
  MoreHorizontal,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface MobileFloatingToolbarProps {
  selectedElement?: any;
  onShowEffectsPanel?: () => void;
  onShowPositionPanel?: () => void;
  zoom: number;
  onZoomChange?: (zoom: number) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const MobileFloatingToolbar: React.FC<MobileFloatingToolbarProps> = ({
  selectedElement,
  onShowEffectsPanel,
  onShowPositionPanel,
  zoom,
  onZoomChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQuickActions] = useState(true);

  // Auto-collapse after inactivity
  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 5000); // 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  const handleZoomIn = () => {
    if (onZoomChange) {
      onZoomChange(Math.min(zoom + 0.1, 3));
    }
  };

  const handleZoomOut = () => {
    if (onZoomChange) {
      onZoomChange(Math.max(zoom - 0.1, 0.25));
    }
  };

  const quickActions = [
    {
      id: 'undo',
      icon: Undo,
      label: 'Annuler',
      action: onUndo,
      disabled: !canUndo,
      color: '#6B7280'
    },
    {
      id: 'redo',
      icon: Redo,
      label: 'Refaire',
      action: onRedo,
      disabled: !canRedo,
      color: '#6B7280'
    },
    {
      id: 'zoom-out',
      icon: ZoomOut,
      label: 'Zoom -',
      action: handleZoomOut,
      disabled: zoom <= 0.25,
      color: '#059669'
    },
    {
      id: 'zoom-in',
      icon: ZoomIn,
      label: 'Zoom +',
      action: handleZoomIn,
      disabled: zoom >= 3,
      color: '#059669'
    }
  ];

  const elementActions = [
    {
      id: 'edit',
      icon: Edit3,
      label: 'Éditer',
      action: () => {},
      color: '#3B82F6'
    },
    {
      id: 'style',
      icon: Type,
      label: 'Style',
      action: onShowEffectsPanel,
      color: '#EC4899'
    },
    {
      id: 'colors',
      icon: Palette,
      label: 'Couleurs',
      action: () => {},
      color: '#F59E0B'
    },
    {
      id: 'position',
      icon: Move,
      label: 'Position',
      action: onShowPositionPanel,
      color: '#8B5CF6'
    },
    {
      id: 'copy',
      icon: Copy,
      label: 'Copier',
      action: () => {},
      color: '#10B981'
    },
    {
      id: 'delete',
      icon: Trash2,
      label: 'Supprimer',
      action: () => {},
      color: '#EF4444'
    }
  ];

  return (
    <>
      {/* Quick Actions Toolbar */}
      <AnimatePresence>
        {showQuickActions && !selectedElement && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-2">
              <div className="flex items-center space-x-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => {
                        if (!action.disabled && action.action) {
                          action.action();
                        }
                      }}
                      disabled={action.disabled}
                      className={`p-3 rounded-xl transition-all duration-200 ${
                        action.disabled 
                          ? 'opacity-40 cursor-not-allowed' 
                          : 'hover:bg-gray-100 active:scale-95'
                      }`}
                      style={{
                        backgroundColor: action.disabled ? 'transparent' : 'transparent'
                      }}
                    >
                      <Icon 
                        className="w-5 h-5" 
                        style={{ 
                          color: action.disabled ? '#9CA3AF' : action.color 
                        }} 
                      />
                    </button>
                  );
                })}
                
                {/* Zoom Indicator */}
                <div className="px-3 py-1 bg-gray-100 rounded-lg">
                  <span className="text-xs font-medium text-gray-600">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Element Actions Toolbar */}
      <AnimatePresence>
        {selectedElement && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              {/* Element Info Header */}
              <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700">
                      {selectedElement.type === 'text' ? 'Texte' : 'Élément'} sélectionné
                    </span>
                  </div>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 rounded-lg hover:bg-white/50 transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="p-2">
                <div className={`grid transition-all duration-300 ${
                  isExpanded ? 'grid-cols-3 gap-2' : 'grid-cols-4 gap-1'
                }`}>
                  {(isExpanded ? elementActions : elementActions.slice(0, 4)).map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        onClick={() => {
                          if (action.action) {
                            action.action();
                          }
                          // Auto-collapse after action
                          if (isExpanded) {
                            setTimeout(() => setIsExpanded(false), 1000);
                          }
                        }}
                        className={`p-3 rounded-xl transition-all duration-200 hover:bg-gray-100 active:scale-95 ${
                          isExpanded ? 'flex flex-col items-center space-y-1' : 'flex items-center justify-center'
                        }`}
                      >
                        <Icon 
                          className={isExpanded ? "w-5 h-5" : "w-4 h-4"} 
                          style={{ color: action.color }} 
                        />
                        {isExpanded && (
                          <span className="text-xs font-medium text-gray-600">
                            {action.label}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context-sensitive hint */}
      <AnimatePresence>
        {selectedElement && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 2, duration: 0.3 }}
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40"
          >
            <div className="bg-gray-800/90 text-white px-3 py-1 rounded-lg text-xs">
              Appuyez sur ⋯ pour plus d'options
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileFloatingToolbar;