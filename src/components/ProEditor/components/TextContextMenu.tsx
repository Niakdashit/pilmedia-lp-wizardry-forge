import React, { useState, useRef, useEffect } from 'react';
import { Copy, Trash2, Layers, MoreHorizontal, Clipboard, ChevronsUp, ChevronUp, ChevronDown, ChevronsDown } from 'lucide-react';
import { createPortal } from 'react-dom';
import { usePortalMenuPosition } from '../hooks/usePortalMenuPosition';

interface TextContextMenuProps {
  element: any;
  onCopy: (element: any) => void;
  onPaste: () => void;
  onDuplicate: (element: any) => void;
  onDelete: (id: string) => void;
  onAlign: (alignment: string) => void; // kept for backward-compat (unused section removed)
  onBringToFront?: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  onSendToBack?: () => void;
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
  onBringToFront,
  onBringForward,
  onSendBackward,
  onSendToBack,
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
    
    console.log('🖱️ Right-click detected on element:', element.id, 'at position:', e.clientX, e.clientY);
    
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

  // Layer order actions (restored)
  const handleBringToFront = () => {
    onBringToFront?.();
    setContextMenu({ ...contextMenu, isOpen: false });
  };
  const handleBringForward = () => {
    onBringForward?.();
    setContextMenu({ ...contextMenu, isOpen: false });
  };
  const handleSendBackward = () => {
    onSendBackward?.();
    setContextMenu({ ...contextMenu, isOpen: false });
  };
  const handleSendToBack = () => {
    onSendToBack?.();
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
      icon: Copy,
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
          className="fixed bg-gray-800 text-white rounded-lg shadow-xl border border-gray-700 py-1.5 z-50"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 9999,
            width: 'max-content'
          }}
        >
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              disabled={item.disabled}
              className={`w-full px-2.5 py-1 text-left flex items-center justify-between hover:bg-gray-700 transition-colors whitespace-nowrap ${
                item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              } ${item.danger ? 'hover:bg-red-600' : ''}`}
            >
              <div className="flex items-center min-w-0 whitespace-nowrap">
                <item.icon className="w-3.5 h-3.5 mr-2" />
                <span className="text-xs">{item.label}</span>
              </div>
              <span className="text-[10px] text-gray-400 ml-3 shrink-0">{item.shortcut}</span>
            </button>
          ))}
          
          {/* Séparateur */}
          <div className="border-t border-gray-600 my-2" />
          
          {/* Sous-menu Ordre des calques */}
          <div className="px-2.5 py-1.5 whitespace-nowrap">
            <div className="flex items-center mb-1.5 whitespace-nowrap">
              <Layers className="w-3.5 h-3.5 mr-2" />
              <span className="text-xs">Ordre des calques</span>
            </div>
            {/* Layer ordering section */}
            <div className="border-t border-gray-600 pt-1 mt-1">
              <button
                onClick={handleBringToFront}
                className="block w-full text-left text-[11px] text-gray-300 hover:text-white py-0.5 px-2 rounded hover:bg-gray-700 transition-colors flex items-center"
                disabled={!onBringToFront}
              >
                <ChevronsUp className="w-3.5 h-3.5 mr-2" /> Amener au premier plan
              </button>
              <button
                onClick={handleBringForward}
                className="block w-full text-left text-[11px] text-gray-300 hover:text-white py-0.5 px-2 rounded hover:bg-gray-700 transition-colors flex items-center"
                disabled={!onBringForward}
              >
                <ChevronUp className="w-3.5 h-3.5 mr-2" /> Avancer
              </button>
              <button
                onClick={handleSendBackward}
                className="block w-full text-left text-[11px] text-gray-300 hover:text-white py-0.5 px-2 rounded hover:bg-gray-700 transition-colors flex items-center"
                disabled={!onSendBackward}
              >
                <ChevronDown className="w-3.5 h-3.5 mr-2" /> Reculer
              </button>
              <button
                onClick={handleSendToBack}
                className="block w-full text-left text-[11px] text-gray-300 hover:text-white py-0.5 px-2 rounded hover:bg-gray-700 transition-colors flex items-center"
                disabled={!onSendToBack}
              >
                <ChevronsDown className="w-3.5 h-3.5 mr-2" /> Envoyer à l'arrière-plan
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
