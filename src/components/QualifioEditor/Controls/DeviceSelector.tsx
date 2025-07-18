
import React from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import type { DeviceType } from '../QualifioEditorLayout';

interface DeviceSelectorProps {
  currentDevice: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  currentDevice,
  onDeviceChange
}) => {
  const devices = [
    { type: 'desktop' as DeviceType, icon: Monitor, label: 'Desktop' },
    { type: 'tablet' as DeviceType, icon: Tablet, label: 'Tablet' },
    { type: 'mobile' as DeviceType, icon: Smartphone, label: 'Mobile' }
  ];

  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      {devices.map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          onClick={() => onDeviceChange(type)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md transition-colors
            ${currentDevice === type 
              ? 'bg-white shadow text-gray-900' 
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
};
