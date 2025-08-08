import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Tablet, Smartphone, Save, Eye, X, Undo, Redo } from 'lucide-react';

interface DesignToolbarProps {
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
  onPreviewToggle?: () => void;
  isPreviewMode?: boolean;
  // Props pour undo/redo
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const DesignToolbar: React.FC<DesignToolbarProps> = React.memo(({
  selectedDevice,
  onDeviceChange,
  onPreviewToggle,
  isPreviewMode = false,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
}) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm">
      {/* Left Section - Logo/Title */}
      <div className="flex items-center space-x-3">
        <h1 className="text-lg font-bold text-gray-900 font-inter">Design Editor</h1>
        <div className="flex items-center space-x-1">
          <button 
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              canUndo 
                ? 'hover:bg-[hsl(var(--sidebar-hover))] text-[hsl(var(--sidebar-icon))] hover:text-[hsl(var(--sidebar-icon-active))]' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title={`Annuler (${navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+Z)`}
          >
            <Undo className="w-4 h-4" />
          </button>
          <button 
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              canRedo 
                ? 'hover:bg-[hsl(var(--sidebar-hover))] text-[hsl(var(--sidebar-icon))] hover:text-[hsl(var(--sidebar-icon-active))]' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title={`Rétablir (${navigator.platform.includes('Mac') ? 'Cmd+Shift' : 'Ctrl+Y'}+Z)`}
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Section - Device Selector */}
      <div className="flex items-center bg-[hsl(var(--sidebar-surface))] rounded-lg p-1 border border-[hsl(var(--sidebar-border))]">
        <button
          onClick={() => onDeviceChange('desktop')}
          className={`p-2 rounded-md transition-all duration-200 ${
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
          className={`p-2 rounded-md transition-all duration-200 ${
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
          className={`p-2 rounded-md transition-all duration-200 ${
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
      <div className="flex items-center space-x-1">
        <button 
          onClick={onPreviewToggle}
          className={`flex items-center px-2.5 py-1.5 text-xs sm:text-sm border rounded-lg transition-colors ${
            isPreviewMode 
              ? 'bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white border-[#841b60]' 
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Eye className="w-4 h-4 mr-1" />
          {isPreviewMode ? 'Mode Édition' : 'Aperçu'}
        </button>
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center px-2.5 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X className="w-4 h-4 mr-1" />
          Fermer
        </button>
          <button className="flex items-center px-3 py-1.5 text-xs sm:text-sm bg-[hsl(var(--primary))] text-white rounded-lg hover:bg-[#6b1549] transition-colors">
            <Save className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Sauvegarder et continuer</span>
            <span className="sm:hidden">Sauvegarder</span>
          </button>
      </div>
    </div>
  );
});

DesignToolbar.displayName = 'DesignToolbar';

export default DesignToolbar;