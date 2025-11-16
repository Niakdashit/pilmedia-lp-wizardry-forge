// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { Clipboard, Trash2, Palette } from 'lucide-react';
import { useEditorStore } from '../../../stores/editorStore';

interface CanvasContextMenuProps {
  onCopyStyle: () => void;
  onPaste: () => void;
  onRemoveBackground: () => void;
  canPaste?: boolean;
  hasStyleToCopy?: boolean;
}

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
}

const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  onCopyStyle,
  onPaste,
  onRemoveBackground,
  hasStyleToCopy = false
}) => {
  // Use global clipboard state
  const canPaste = useEditorStore(state => state.canPaste);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0
  });
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setContextMenu(prev => ({ ...prev, isOpen: false }));
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setContextMenu(prev => ({ ...prev, isOpen: false }));
      }
    };

    if (contextMenu.isOpen) {
      // Ajouter un petit délai pour éviter la fermeture immédiate
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', handleEscapeKey);
      }, 100);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [contextMenu.isOpen]);

  // Gérer le clic droit sur le canvas
  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY
    });
  };

  // Actions du menu
  const handleCopyStyle = () => {
    onCopyStyle();
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  };

  const handlePaste = () => {
    onPaste();
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  };

  const handleRemoveBackground = () => {
    onRemoveBackground();
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  };

  const menuItems = [
    {
      icon: Palette,
      label: 'Copier le style',
      shortcut: '⇧⌘C',
      action: handleCopyStyle,
      disabled: !hasStyleToCopy
    },
    {
      icon: Clipboard,
      label: 'Coller',
      shortcut: '⌘V',
      action: handlePaste,
      disabled: !canPaste
    },
    {
      icon: Trash2,
      label: 'Supprimer l\'arrière-plan',
      shortcut: '',
      action: handleRemoveBackground,
      danger: true
    }
  ];

  return (
    <>
      {/* Zone invisible pour détecter le clic droit sur le canvas */}
      <div
        className="absolute left-0 right-0 pointer-events-auto"
        style={{
          top: '-25%',
          height: '125%',
          zIndex: 1
        }}
        onContextMenu={handleCanvasContextMenu}
      />

      {/* Menu contextuel */}
      {contextMenu.isOpen && (
        <div
          ref={menuRef}
          className="fixed bg-gray-800 text-white rounded-lg shadow-xl border border-gray-700 py-3 min-w-56 z-50"
          style={{
            left: Math.min(contextMenu.x, window.innerWidth - 240), // Éviter le débordement
            top: Math.min(contextMenu.y, window.innerHeight - 200),
            zIndex: 9999
          }}
        >
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              disabled={item.disabled}
              className={`w-full px-5 py-3 text-left flex items-center justify-between hover:bg-gray-700 transition-colors ${
                item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              } ${item.danger ? 'hover:bg-red-600' : ''}`}
            >
              <div className="flex items-center">
                <item.icon className="w-5 h-5 mr-4" />
                <span className="text-base">{item.label}</span>
              </div>
              {item.shortcut && (
                <span className="text-sm text-gray-400 ml-6">{item.shortcut}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default CanvasContextMenu;
