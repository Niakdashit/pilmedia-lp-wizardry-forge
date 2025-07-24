import React from 'react';
import { Eye, Save, LogOut } from 'lucide-react';

interface CanvaBottomActionsProps {
  onPreview: () => void;
  onSave: () => void;
  onSaveAndExit: () => void;
  isLoading: boolean;
  isModified: boolean;
}

const CanvaBottomActions: React.FC<CanvaBottomActionsProps> = ({
  onPreview,
  onSave,
  onSaveAndExit,
  isLoading,
  isModified
}) => {
  return (
    <div className="bg-[#f7f9fb] border-t border-[#e5e7eb] p-4">
      <div className="flex justify-center gap-3">
        <button
          onClick={onPreview}
          className="flex items-center gap-2 px-6 py-3 bg-white text-[#374151] border border-[#d1d5db] rounded-lg hover:bg-[#f9fafb] transition-colors font-medium"
        >
          <Eye className="w-4 h-4" />
          Aperçu
        </button>

        <button
          onClick={onSave}
          disabled={isLoading}
          className={`flex items-center gap-2 px-6 py-3 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors font-medium ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Save className="w-4 h-4" />
          {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>

        <button
          onClick={onSaveAndExit}
          disabled={isLoading}
          className={`flex items-center gap-2 px-6 py-3 bg-[#059669] text-white rounded-lg hover:bg-[#047857] transition-colors font-medium ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <LogOut className="w-4 h-4" />
          {isLoading ? 'Sauvegarde...' : 'Sauvegarder et quitter'}
        </button>
      </div>

      {isModified && !isLoading && (
        <div className="text-center mt-2">
          <span className="text-xs text-[#6b7280]">
            Modifications non sauvegardées
          </span>
        </div>
      )}
    </div>
  );
};

export default CanvaBottomActions;