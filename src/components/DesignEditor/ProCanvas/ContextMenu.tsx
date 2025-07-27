import React, { useEffect, useRef } from 'react';
import { 
  Copy, Scissors, Clipboard, Trash2, RotateCw, FlipHorizontal, 
  FlipVertical, MoveUp, MoveDown, Edit3
} from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  element?: any;
  onClose: () => void;
  onDuplicate: (element: any) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  element,
  onClose,
  onDuplicate,
  onDelete,
  onBringToFront,
  onSendToBack
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const menuItems = [
    {
      icon: Copy,
      label: 'Copier',
      shortcut: 'Ctrl+C',
      action: () => {
        // Handle copy
        onClose();
      }
    },
    {
      icon: Scissors,
      label: 'Couper',
      shortcut: 'Ctrl+X',
      action: () => {
        // Handle cut
        onClose();
      }
    },
    {
      icon: Clipboard,
      label: 'Coller',
      shortcut: 'Ctrl+V',
      action: () => {
        // Handle paste
        onClose();
      }
    },
    { divider: true },
    {
      icon: Edit3,
      label: 'Dupliquer',
      shortcut: 'Ctrl+D',
      action: () => {
        if (element) {
          onDuplicate(element);
        }
        onClose();
      }
    },
    {
      icon: Trash2,
      label: 'Supprimer',
      shortcut: 'Del',
      action: () => {
        if (element) {
          onDelete(element.id);
        }
        onClose();
      },
      danger: true
    },
    { divider: true },
    {
      icon: MoveUp,
      label: 'Premier plan',
      action: () => {
        if (element) {
          onBringToFront(element.id);
        }
        onClose();
      }
    },
    {
      icon: MoveDown,
      label: 'Arrière-plan',
      action: () => {
        if (element) {
          onSendToBack(element.id);
        }
        onClose();
      }
    },
    { divider: true },
    {
      icon: RotateCw,
      label: 'Rotation 90°',
      action: () => {
        // Handle rotation
        onClose();
      }
    },
    {
      icon: FlipHorizontal,
      label: 'Retourner H',
      action: () => {
        // Handle flip horizontal
        onClose();
      }
    },
    {
      icon: FlipVertical,
      label: 'Retourner V',
      action: () => {
        // Handle flip vertical
        onClose();
      }
    }
  ];

  return (
    <div
      ref={menuRef}
      className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-48 z-50 animate-fade-in"
      style={{
        left: x,
        top: y,
        maxHeight: '400px',
        overflowY: 'auto'
      }}
    >
      {menuItems.map((item, index) => {
        if (item.divider) {
          return <div key={index} className="h-px bg-gray-200 my-1 mx-2" />;
        }

        const Icon = item.icon!;
        
        return (
          <button
            key={index}
            onClick={item.action}
            className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-3 text-sm ${
              item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="flex-1">{item.label}</span>
            {item.shortcut && (
              <span className="text-xs text-gray-400">{item.shortcut}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ContextMenu;