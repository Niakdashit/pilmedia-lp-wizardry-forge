import React from 'react';
import { Monitor, Tablet, Smartphone, Eye } from 'lucide-react';

interface DevicePreviewSidebarProps {
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
  elements: any[];
  background: any;
  isAutoMode?: boolean;
}

const DevicePreviewSidebar: React.FC<DevicePreviewSidebarProps> = ({
  selectedDevice,
  onDeviceChange,
  elements,
  background,
  isAutoMode = true
}) => {
  const devices = [
    { id: 'desktop', label: 'Desktop', icon: Monitor, width: '240px', height: '150px' },
    { id: 'tablet', label: 'Tablet', icon: Tablet, width: '120px', height: '160px' },
    { id: 'mobile', label: 'Mobile', icon: Smartphone, width: '80px', height: '140px' }
  ] as const;


  const renderPreview = (device: any) => {
    const scale = device.id === 'desktop' ? 0.2 : device.id === 'tablet' ? 0.14 : 0.15;
    
    return (
      <div 
        key={device.id}
        className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
          selectedDevice === device.id 
            ? 'border-blue-500 ring-2 ring-blue-200' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        style={{ width: device.width, height: device.height }}
        onClick={() => onDeviceChange(device.id)}
      >
        {/* Device Frame */}
        <div 
          className="relative w-full h-full overflow-hidden"
          style={{
            backgroundImage: background.type === 'image' ? `url(${background.value})` : background.value,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Elements Preview */}
          {elements.map((element, index) => (
            <div
              key={index}
              className="absolute"
              style={{
                left: `${(element.x || 0) * scale}px`,
                top: `${(element.y || 0) * scale}px`,
                fontSize: `${Math.max(4, parseInt(element.style?.fontSize || '16') * scale)}px`,
                color: element.style?.color || '#000',
                fontWeight: element.style?.fontWeight || 'normal',
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: element.width ? `${element.width}px` : 'auto',
                height: element.height ? `${element.height}px` : 'auto',
              }}
            >
              {element.content || element.type}
            </div>
          ))}
        </div>

        {/* Device Label */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 text-center">
          <device.icon className="w-3 h-3 inline mr-1" />
          {device.label}
          {isAutoMode && (
            <span className="ml-1 text-green-300">●</span>
          )}
        </div>

        {/* Active Indicator */}
        {selectedDevice === device.id && (
          <div className="absolute top-2 right-2">
            <Eye className="w-4 h-4 text-blue-500" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Aperçu Multi-appareils</h3>
        {isAutoMode && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            Auto-sync
          </span>
        )}
      </div>

      <div className="space-y-4">
        {devices.map(device => renderPreview(device))}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p className="mb-1">🖱️ Cliquez pour basculer entre les appareils</p>
        {isAutoMode && (
          <p className="text-green-600">✨ Synchronisation automatique activée</p>
        )}
      </div>
    </div>
  );
};

export default DevicePreviewSidebar;