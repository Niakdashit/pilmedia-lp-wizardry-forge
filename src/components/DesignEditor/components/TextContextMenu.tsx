import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Copy, Clipboard, Move, Trash2, AlignLeft, MoreHorizontal } from 'lucide-react';
import { usePortalMenuPosition } from '../hooks/usePortalMenuPosition';

interface TextContextMenuProps {
  element: any;
  onCopy: (element: any) => void;
  onPaste: () => void;
  onDuplicate: (element: any) => void;
  onDelete: (id: string) => void;
  onAlign: (alignment: string) => void;
  canPaste?: boolean;
}

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
}

const TextContextMenu: React.FC<TextContextMenuProps> = ({
  element,
  onCopy,
  onPaste,
  onDuplicate,
  onDelete,
  onAlign,
  canPaste = false
}) => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0
  });
  const [showKebabMenu, setShowKebabMenu] = useState(false);
  // Use shared hook to keep menu inside viewport
  const { menuRef } = usePortalMenuPosition(
    contextMenu.isOpen,
    { x: contextMenu.x, y: contextMenu.y },
    (p) => setContextMenu((cm) => ({ ...cm, ...p })),
    8
  );
  const kebabRef = useRef<HTMLButtonElement>(null);

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setContextMenu({ ...contextMenu, isOpen: false });
        setShowKebabMenu(false);
      }
    };

    if (contextMenu.isOpen || showKebabMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [contextMenu.isOpen, showKebabMenu]);

  // Gérer le clic droit
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY
    });
    setShowKebabMenu(false);
  };

  // Gérer le clic sur le bouton kebab
  const handleKebabClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (kebabRef.current) {
      const rect = kebabRef.current.getBoundingClientRect();
      setContextMenu({
        isOpen: true,
        x: rect.left,
        y: rect.bottom + 5
      });
    }
    setShowKebabMenu(false);
  };

  // Actions du menu
  const handleCopy = () => {
    onCopy(element);
    setContextMenu({ ...contextMenu, isOpen: false });
  };

  const handlePaste = () => {
    onPaste();
    setContextMenu({ ...contextMenu, isOpen: false });
  };

  const handleDuplicate = () => {
    onDuplicate(element);
    setContextMenu({ ...contextMenu, isOpen: false });
  };

  const handleDelete = () => {
    onDelete(element.id);
    setContextMenu({ ...contextMenu, isOpen: false });
  };

  const handleAlign = (alignment: string) => {
    onAlign(alignment);
    setContextMenu({ ...contextMenu, isOpen: false });
  };

  const menuItems = [
    {
      icon: Copy,
      label: 'Copier',
      shortcut: '⌘C',
      action: handleCopy
    },
    {
      icon: Clipboard,
      label: 'Copier le style',
      shortcut: '⇧⌘C',
      action: handleCopy
    },
    {
      icon: Clipboard,
      label: 'Coller',
      shortcut: '⌘V',
      action: handlePaste,
      disabled: !canPaste
    },
    {
      icon: Move,
      label: 'Dupliquer',
      shortcut: '⌘D',
      action: handleDuplicate
    },
    {
      icon: Trash2,
      label: 'Effacer',
      shortcut: 'DELETE',
      action: handleDelete,
      danger: true
    }
  ];

  return (
    <>
      {/* Bouton kebab (3 petits points) */}
      <button
        ref={kebabRef}
        onClick={handleKebabClick}
        onContextMenu={handleContextMenu}
        className="absolute -top-8 -left-8 w-6 h-6 bg-gray-700 text-white rounded-full text-xs hover:bg-gray-800 shadow-lg flex items-center justify-center transition-colors"
        style={{ zIndex: 1002 }}
        title="Options du texte"
      >
        <MoreHorizontal className="w-3 h-3" />
      </button>

      {/* Zone invisible pour détecter le clic droit sur l'élément */}
      <div
        className="absolute inset-0 pointer-events-auto"
        onContextMenu={handleContextMenu}
        style={{ zIndex: 999 }}
      />

      {/* Menu contextuel - render in a portal to avoid parent transforms */}
      {contextMenu.isOpen && createPortal(
        <div
          ref={menuRef}
          className="fixed bg-gray-800 text-white rounded-lg shadow-xl border border-gray-700 py-3 min-w-56 z-50"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
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
              <span className="text-sm text-gray-400 ml-6">{item.shortcut}</span>
            </button>
          ))}
          
          {/* Séparateur */}
          <div className="border-t border-gray-600 my-2" />
          
          {/* Sous-menu Aligner */}
          <div className="px-5 py-3">
            <div className="flex items-center mb-3">
              <AlignLeft className="w-5 h-5 mr-4" />
              <span className="text-base">Aligner sur la page</span>
            </div>
            <div className="ml-9 space-y-2">
              <button
                onClick={() => handleAlign('left')}
                className="block w-full text-left text-sm text-gray-300 hover:text-white py-1.5 px-2 rounded hover:bg-gray-700 transition-colors"
              >
                Gauche
              </button>
              <button
                onClick={() => handleAlign('center')}
                className="block w-full text-left text-sm text-gray-300 hover:text-white py-1.5 px-2 rounded hover:bg-gray-700 transition-colors"
              >
                Centre
              </button>
              <button
                onClick={() => handleAlign('right')}
                className="block w-full text-left text-sm text-gray-300 hover:text-white py-1.5 px-2 rounded hover:bg-gray-700 transition-colors"
              >
                Droite
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default TextContextMenu;
