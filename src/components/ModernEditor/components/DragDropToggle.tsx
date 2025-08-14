import React from 'react';
import { Move, Hand } from 'lucide-react';

interface DragDropToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

const DragDropToggle: React.FC<DragDropToggleProps> = ({
  isEnabled,
  onToggle,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={() => onToggle(!isEnabled)}
        className={`
          flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
          ${isEnabled 
            ? 'bg-blue-500 text-white shadow-lg hover:bg-blue-600' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }
        `}
        title={isEnabled ? 'Désactiver le drag & drop' : 'Activer le drag & drop'}
      >
        {isEnabled ? (
          <>
            <Hand className="w-4 h-4" />
            <span>Mode édition</span>
          </>
        ) : (
          <>
            <Move className="w-4 h-4" />
            <span>Drag & Drop</span>
          </>
        )}
      </button>
      
      {isEnabled && (
        <span className="text-xs text-blue-600 font-medium">
          Cliquez et glissez les éléments
        </span>
      )}
    </div>
  );
};

export default DragDropToggle;