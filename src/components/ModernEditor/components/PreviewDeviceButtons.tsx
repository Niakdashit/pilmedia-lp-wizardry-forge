
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
    <div className="flex items-center bg-[#f0f5fd] rounded-lg p-1">
      <button
        onClick={() => onDeviceChange('desktop')}
        className={`p-2 rounded-md transition-colors ${
          selectedDevice === 'desktop' 
            ? 'bg-[#eaf2ff] text-[#646463]' 
            : 'text-[#646463] hover:bg-[#eaf2ff]'
        }`}
        title="Desktop"
      >
        <Monitor className="w-4 h-4" />
      </button>
      <button
        onClick={() => onDeviceChange('mobile')}
        className={`p-2 rounded-md transition-colors ${
          selectedDevice === 'mobile' 
            ? 'bg-[#eaf2ff] text-[#646463]' 
            : 'text-[#646463] hover:bg-[#eaf2ff]'
        }`}
        title="Mobile"
      >
        <Smartphone className="w-4 h-4" />
      </button>
    </div>
  );
};

export default PreviewDeviceButtons;
