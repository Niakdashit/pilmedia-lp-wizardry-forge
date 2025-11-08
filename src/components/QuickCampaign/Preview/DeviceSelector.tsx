
import React from 'react';
import { Monitor, Smartphone } from 'lucide-react';

interface DeviceSelectorProps {
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
}

const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  selectedDevice,
  onDeviceChange
}) => {
  return (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onDeviceChange('desktop')}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          selectedDevice === 'desktop'
            ? 'bg-white text-[#841b60] shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Monitor className="w-4 h-4" />
        <span>Desktop</span>
      </button>
      <button
        onClick={() => onDeviceChange('mobile')}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          selectedDevice === 'mobile'
            ? 'bg-white text-[#841b60] shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Smartphone className="w-4 h-4" />
        <span>Mobile</span>
      </button>
    </div>
  );
};

export default DeviceSelector;
