
import React from 'react';
import { X } from 'lucide-react';

interface PreviewHeaderProps {
  campaignName: string;
  selectedGameType: string;
  onClose: () => void;
}

const PreviewHeader: React.FC<PreviewHeaderProps> = ({
  campaignName,
  selectedGameType,
  onClose
}) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold text-gray-800">Aperçu de la campagne</h2>
        <span className="text-sm text-gray-500">{campaignName}</span>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {selectedGameType || 'wheel'}
        </span>
      </div>

      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default PreviewHeader;
