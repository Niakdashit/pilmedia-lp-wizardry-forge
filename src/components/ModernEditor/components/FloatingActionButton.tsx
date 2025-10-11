
import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  showAddMenu: boolean;
  onToggleMenu: (e: React.MouseEvent) => void;
  onAddText: () => void;
  onAddImage: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  showAddMenu,
  onToggleMenu,
  onAddText,
  onAddImage
}) => {
  return (
    <div className="absolute bottom-8 right-8" style={{ zIndex: 50 }}>
      <div className="relative">
        {/* Add menu */}
        {showAddMenu && (
          <div
            className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-2xl border border-gray-200/50 p-2 min-w-48"
            style={{ zIndex: 60 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onAddText}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">T</span>
              </div>
              <span className="font-medium text-gray-900">Ajouter du texte</span>
            </button>
            <button
              onClick={onAddImage}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-semibold text-sm">📷</span>
              </div>
              <span className="font-medium text-gray-900">Ajouter une image</span>
            </button>
          </div>
        )}

        {/* Main add button */}
        <button
          onClick={onToggleMenu}
          className="w-14 h-14 bg-[#f0f5fd] text-[#646463] hover:bg-[#eaf2ff] rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center transform hover:scale-105"
          type="button"
        >
          <Plus className={`w-6 h-6 transition-transform duration-300 ${showAddMenu ? 'rotate-45' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default FloatingActionButton;
