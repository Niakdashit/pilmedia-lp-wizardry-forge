import React from 'react';
import { X, Eye, Download, Save } from 'lucide-react';

interface ActionButtonsProps {
  onClose?: () => void;
  onPreview?: () => void;
  onSave?: () => void;
  onExport?: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onClose,
  onPreview,
  onSave,
  onExport
}) => {
  return (
    <div className="flex items-center gap-3">
      <button 
        onClick={onClose}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
      >
        <X className="w-4 h-4" />
        Fermer
      </button>
      
      <button 
        onClick={onPreview}
        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
      >
        <Eye className="w-4 h-4" />
        Aperçu
      </button>
      
      <button 
        onClick={onSave}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        Sauvegarder
      </button>
      
      <button 
        onClick={onExport}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Sauvegarder et quitter
      </button>
    </div>
  );
};

export default ActionButtons;