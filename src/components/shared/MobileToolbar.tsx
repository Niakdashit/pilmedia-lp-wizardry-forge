import React from 'react';
import { Undo, Redo, Eye, Save, Monitor, Tablet, Smartphone } from 'lucide-react';

interface MobileToolbarProps {
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
  onPreview: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onSave?: () => void;
  isMobile: boolean;
}

export const MobileToolbar: React.FC<MobileToolbarProps> = ({
  selectedDevice,
  onDeviceChange,
  onPreview,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSave,
  isMobile
}) => {
  const deviceIcons = {
    desktop: Monitor,
    tablet: Tablet,
    mobile: Smartphone
  };

  if (!isMobile) {
    // Version desktop - toolbar complète
    return (
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          {onUndo && (
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
              title="Annuler"
            >
              <Undo size={20} />
            </button>
          )}
          {onRedo && (
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
              title="Rétablir"
            >
              <Redo size={20} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {(['desktop', 'tablet', 'mobile'] as const).map((device) => {
            const Icon = deviceIcons[device];
            return (
              <button
                key={device}
                onClick={() => onDeviceChange(device)}
                className={`p-2 rounded-md transition-colors ${
                  selectedDevice === device
                    ? 'bg-white shadow-sm text-[#44444d]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title={device}
              >
                <Icon size={18} />
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPreview}
            className="px-4 py-2 bg-[#44444d] text-white rounded-lg hover:bg-[#5a5a67] transition-colors flex items-center gap-2"
          >
            <Eye size={18} />
            <span>Aperçu</span>
          </button>
          {onSave && (
            <button
              onClick={onSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Save size={18} />
              <span>Sauvegarder</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Version mobile - toolbar simplifiée et compacte
  return (
    <div className="flex items-center justify-between px-3 py-3 bg-white border-b border-gray-200">
      {/* Actions gauche */}
      <div className="flex items-center gap-1">
        {onUndo && (
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-3 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed active:bg-gray-200"
            title="Annuler"
          >
            <Undo size={22} />
          </button>
        )}
        {onRedo && (
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-3 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed active:bg-gray-200"
            title="Rétablir"
          >
            <Redo size={22} />
          </button>
        )}
      </div>

      {/* Sélecteur d'appareil au centre */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        {(['desktop', 'mobile'] as const).map((device) => {
          const Icon = deviceIcons[device];
          return (
            <button
              key={device}
              onClick={() => onDeviceChange(device)}
              className={`p-2.5 rounded-md transition-colors ${
                selectedDevice === device
                  ? 'bg-white shadow-sm text-[#44444d]'
                  : 'text-gray-600'
              }`}
              title={device}
            >
              <Icon size={20} />
            </button>
          );
        })}
      </div>

      {/* Actions droite */}
      <div className="flex items-center gap-1">
        <button
          onClick={onPreview}
          className="p-3 bg-[#44444d] text-white rounded-lg hover:bg-[#5a5a67] active:bg-[#6a6a77] transition-colors"
          title="Aperçu"
        >
          <Eye size={22} />
        </button>
        {onSave && (
          <button
            onClick={onSave}
            className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors"
            title="Sauvegarder"
          >
            <Save size={22} />
          </button>
        )}
      </div>
    </div>
  );
};
