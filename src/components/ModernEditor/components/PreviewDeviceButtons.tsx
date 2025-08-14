
import React from 'react';
import { Monitor, Smartphone } from 'lucide-react';

interface PreviewDeviceButtonsProps {
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
}

const PreviewDeviceButtons: React.FC<PreviewDeviceButtonsProps> = ({
  selectedDevice,
  onDeviceChange
}) => {
  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onDeviceChange('desktop')}
        className={`p-2 rounded-md transition-colors ${
          selectedDevice === 'desktop' 
            ? 'bg-white shadow-sm text-[#841b60]' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
        title="Desktop"
      >
        <Monitor className="w-4 h-4" />
      </button>
      <button
        onClick={() => onDeviceChange('mobile')}
        className={`p-2 rounded-md transition-colors ${
          selectedDevice === 'mobile' 
            ? 'bg-white shadow-sm text-[#841b60]' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
        title="Mobile"
      >
        <Smartphone className="w-4 h-4" />
      </button>
    </div>
  );
};

export default PreviewDeviceButtons;
