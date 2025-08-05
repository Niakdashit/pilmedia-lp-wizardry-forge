import React from 'react';
import { Monitor, Tablet, Smartphone, Download, Eye, Share2, Undo, Redo } from 'lucide-react';

interface DesignToolbarProps {
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
  onPreviewToggle?: () => void;
  isPreviewMode?: boolean;
}

const DesignToolbar: React.FC<DesignToolbarProps> = React.memo(({
  selectedDevice,
  onDeviceChange,
  onPreviewToggle,
  isPreviewMode = false
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
      {/* Left Section - Logo/Title */}
      <div className="flex items-center space-x-6">
        <h1 className="text-xl font-bold text-gray-900 font-inter">Design Editor</h1>
        <div className="flex items-center space-x-1">
          <button className="p-2 hover:bg-[hsl(var(--sidebar-hover))] rounded-lg transition-all duration-200 text-[hsl(var(--sidebar-icon))] hover:text-[hsl(var(--sidebar-icon-active))]">
            <Undo className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-[hsl(var(--sidebar-hover))] rounded-lg transition-all duration-200 text-[hsl(var(--sidebar-icon))] hover:text-[hsl(var(--sidebar-icon-active))]">
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Section - Device Selector */}
      <div className="flex items-center bg-[hsl(var(--sidebar-surface))] rounded-lg p-1 border border-[hsl(var(--sidebar-border))]">
        <button
          onClick={() => onDeviceChange('desktop')}
          className={`p-3 rounded-md transition-all duration-200 ${
            selectedDevice === 'desktop' 
              ? 'bg-white shadow-sm text-[hsl(var(--sidebar-icon-active))] ring-1 ring-[hsl(var(--sidebar-glow))]' 
              : 'text-[hsl(var(--sidebar-icon))] hover:text-[hsl(var(--sidebar-icon-active))] hover:bg-[hsl(var(--sidebar-hover))]'
          }`}
          title="Desktop"
        >
          <Monitor className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDeviceChange('tablet')}
          className={`p-3 rounded-md transition-all duration-200 ${
            selectedDevice === 'tablet' 
              ? 'bg-white shadow-sm text-[hsl(var(--sidebar-icon-active))] ring-1 ring-[hsl(var(--sidebar-glow))]' 
              : 'text-[hsl(var(--sidebar-icon))] hover:text-[hsl(var(--sidebar-icon-active))] hover:bg-[hsl(var(--sidebar-hover))]'
          }`}
          title="Tablet"
        >
          <Tablet className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDeviceChange('mobile')}
          className={`p-3 rounded-md transition-all duration-200 ${
            selectedDevice === 'mobile' 
              ? 'bg-white shadow-sm text-[hsl(var(--sidebar-icon-active))] ring-1 ring-[hsl(var(--sidebar-glow))]' 
              : 'text-[hsl(var(--sidebar-icon))] hover:text-[hsl(var(--sidebar-icon-active))] hover:bg-[hsl(var(--sidebar-hover))]'
          }`}
          title="Mobile"
        >
          <Smartphone className="w-4 h-4" />
        </button>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center space-x-2">
        <button 
          onClick={onPreviewToggle}
          className={`flex items-center px-3 py-2 text-sm border rounded-lg transition-colors ${
            isPreviewMode 
              ? 'bg-[#841b60] text-white border-[#841b60]' 
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Eye className="w-4 h-4 mr-2" />
          {isPreviewMode ? 'Mode Édition' : 'Aperçu'}
        </button>
        <button className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Share2 className="w-4 h-4 mr-2" />
          Partager
        </button>
        <button className="flex items-center px-4 py-2 text-sm bg-[hsl(var(--primary))] text-white rounded-lg hover:bg-[#6b1549] transition-colors">
          <Download className="w-4 h-4 mr-2" />
          Télécharger
        </button>
      </div>
    </div>
  );
});

DesignToolbar.displayName = 'DesignToolbar';

export default DesignToolbar;