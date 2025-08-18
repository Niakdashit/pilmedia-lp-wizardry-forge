import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Smartphone, Save, Eye, X, Undo, Redo, Layers } from 'lucide-react';

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
  // Contrôle de la position du bouton d'aperçu (gauche/droite)
  previewButtonSide?: 'left' | 'right';
  onPreviewButtonSideChange?: (side: 'left' | 'right') => void;
  // Mode de l'éditeur: influence le libellé du bouton d'enregistrement
  mode?: 'template' | 'campaign';
}

const DesignToolbar: React.FC<DesignToolbarProps> = React.memo(({
  selectedDevice,
  onDeviceChange,
  onPreviewToggle,
  isPreviewMode = false,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  previewButtonSide = 'right',
  onPreviewButtonSideChange,
  mode = 'campaign'
}) => {
  const navigate = useNavigate();
  const saveDesktopLabel = mode === 'template' ? 'Enregistrer template' : 'Sauvegarder et continuer';
  const saveMobileLabel = mode === 'template' ? 'Enregistrer' : 'Sauvegarder';
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm rounded-tl-[28px] rounded-tr-[28px]">
      {/* Left Section - Logo/Title */}
      <div className="flex items-center space-x-3">
        <h1 className="text-lg font-bold text-gray-900 font-inter hidden">Design Editor</h1>
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
        {/* Tablet button removed */}
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
          onClick={() => navigate('/template-editor')}
          className="hidden flex items-center px-2.5 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title="Parcourir les modèles"
          aria-hidden="true"
        >
          <Layers className="w-4 h-4 mr-1" />
          Modèles
        </button>
        {/* Position du bouton d'aperçu */}
        <div className="hidden items-center bg-[hsl(var(--sidebar-surface))] rounded-lg p-0.5 border border-[hsl(var(--sidebar-border))] mr-2">
          <button
            onClick={() => onPreviewButtonSideChange && onPreviewButtonSideChange('left')}
            className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${
              previewButtonSide === 'left'
                ? 'bg-white shadow-sm text-[hsl(var(--sidebar-icon-active))] ring-1 ring-[hsl(var(--sidebar-glow))]'
                : 'text-[hsl(var(--sidebar-icon))] hover:text-[hsl(var(--sidebar-icon-active))] hover:bg-[hsl(var(--sidebar-hover))]'
            }`}
            title="Bouton Aperçu à gauche"
          >
            Gauche
          </button>
          <button
            onClick={() => onPreviewButtonSideChange && onPreviewButtonSideChange('right')}
            className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${
              previewButtonSide === 'right'
                ? 'bg-white shadow-sm text-[hsl(var(--sidebar-icon-active))] ring-1 ring-[hsl(var(--sidebar-glow))]'
                : 'text-[hsl(var(--sidebar-icon))] hover:text-[hsl(var(--sidebar-icon-active))] hover:bg-[hsl(var(--sidebar-hover))]'
            }`}
            title="Bouton Aperçu à droite"
          >
            Droite
          </button>
        </div>
        <button 
          onClick={onPreviewToggle}
          className={`flex items-center px-2.5 py-1.5 text-xs sm:text-sm border rounded-lg transition-colors shadow-none focus:shadow-none ring-0 focus:ring-0 drop-shadow-none filter-none backdrop-blur-0 ${
            isPreviewMode 
              ? 'bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] text-white border-[#841b60]' 
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
        <button className="flex items-center px-3 py-1.5 text-xs sm:text-sm bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] text-white rounded-lg hover:bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] transition-colors">
          <Save className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">{saveDesktopLabel}</span>
          <span className="sm:hidden">{saveMobileLabel}</span>
        </button>
      </div>
    </div>
  );
});

DesignToolbar.displayName = 'DesignToolbar';

export default DesignToolbar;
