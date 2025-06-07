
import React from 'react';
import { Palette } from 'lucide-react';
import ImageUpload from '../../../common/ImageUpload';

interface ScratchSurfaceConfigProps {
  scratchColor: string;
  scratchSurface?: string;
  onScratchColorChange: (color: string) => void;
  onScratchSurfaceChange: (surface: string) => void;
}

const ScratchSurfaceConfig: React.FC<ScratchSurfaceConfigProps> = ({
  scratchColor,
  scratchSurface,
  onScratchColorChange,
  onScratchSurfaceChange
}) => {
  return (
    <>
      {/* Couleur de grattage personnalisée */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Palette className="w-4 h-4 mr-2" />
          Couleur de la surface à gratter
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={scratchColor}
            onChange={(e) => onScratchColorChange(e.target.value)}
            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-600">
            {scratchColor}
          </span>
        </div>
      </div>

      {/* Surface à gratter personnalisée */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Surface à gratter personnalisée</label>
        <ImageUpload
          value={scratchSurface || ''}
          onChange={onScratchSurfaceChange}
          label=""
        />
        {scratchSurface && (
          <p className="text-xs text-gray-500">
            Image utilisée comme surface à gratter
          </p>
        )}
      </div>
    </>
  );
};

export default ScratchSurfaceConfig;
