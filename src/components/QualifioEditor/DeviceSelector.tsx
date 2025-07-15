import React from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import type { DeviceType } from './QualifioEditorLayout';

interface DeviceSelectorProps {
  selectedDevice: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
}

const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  selectedDevice,
  onDeviceChange
}) => {
  const devices = [
    { type: 'desktop' as DeviceType, icon: Monitor, label: 'Desktop' },
    { type: 'tablet' as DeviceType, icon: Tablet, label: 'Tablette' },
    { type: 'mobile' as DeviceType, icon: Smartphone, label: 'Mobile' }
  ];

  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      {devices.map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          onClick={() => onDeviceChange(type)}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-all text-xs ${
            selectedDevice === type
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          title={label}
        >
          <Icon className="w-3 h-3" />
          <span className="font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
};

export default DeviceSelector;