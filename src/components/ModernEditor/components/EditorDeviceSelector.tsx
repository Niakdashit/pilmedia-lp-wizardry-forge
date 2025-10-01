
import React from 'react';
import { Monitor, Smartphone } from 'lucide-react';

interface EditorDeviceSelectorProps {
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
}

const EditorDeviceSelector: React.FC<EditorDeviceSelectorProps> = ({
  previewDevice,
  onDeviceChange
}) => {
  return (
    <div className="flex items-center bg-gray-100 rounded-xl p-1">
      <button
        onClick={() => onDeviceChange('desktop')}
        className={`p-2 rounded-lg transition-colors ${
          previewDevice === 'desktop' ? 'bg-white shadow-sm text-[#d4dbe8]' : 'hover:bg-gray-200'
        }`}
      >
        <Monitor className="w-4 h-4" />
      </button>
      <button
        onClick={() => onDeviceChange('mobile')}
        className={`p-2 rounded-lg transition-colors ${
          previewDevice === 'mobile' ? 'bg-white shadow-sm text-[#d4dbe8]' : 'hover:bg-gray-200'
        }`}
      >
        <Smartphone className="w-4 h-4" />
      </button>
    </div>
  );
};

export default EditorDeviceSelector;
