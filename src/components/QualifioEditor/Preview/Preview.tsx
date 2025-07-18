
import React from 'react';
import type { EditorConfig, DeviceType } from '../QualifioEditorLayout';
import Mode1Preview from './Mode1Preview';

interface PreviewProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
  currentDevice: DeviceType;
}

export const Preview: React.FC<PreviewProps> = ({
  config,
  onConfigUpdate,
  currentDevice
}) => {
  const getDeviceFrame = () => {
    switch (currentDevice) {
      case 'mobile':
        return 'w-80 h-[600px]';
      case 'tablet':
        return 'w-[600px] h-[800px]';
      case 'desktop':
      default:
        return 'w-full h-full';
    }
  };

  return (
    <div className="flex-1 bg-gray-100 p-6 flex items-center justify-center">
      <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${getDeviceFrame()}`}>
        <Mode1Preview 
          device={currentDevice}
          config={config}
          onConfigUpdate={onConfigUpdate}
        />
      </div>
    </div>
  );
};
