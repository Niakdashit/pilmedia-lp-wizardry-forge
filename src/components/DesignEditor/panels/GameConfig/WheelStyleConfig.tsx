import React, { useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import BorderStyleSelector from '../../../SmartWheel/components/BorderStyleSelector';

interface WheelStyleConfigProps {
  campaign?: any;
  onCampaignUpdate?: (updates: any) => void;
}

const WheelStyleConfig: React.FC<WheelStyleConfigProps> = ({
  campaign,
  onCampaignUpdate
}) => {
  const currentBorderStyle = campaign?.design?.wheelBorderStyle || campaign?.design?.borderStyle || 'classic';
  const currentBorderColor = campaign?.design?.wheelBorderColor || campaign?.design?.borderColor || '#841b60';
  const currentScale = campaign?.design?.wheelScale || campaign?.design?.scale || 1;

  const handleBorderStyleChange = useCallback((style: string) => {
    onCampaignUpdate?.({
      wheelBorderStyle: style,
      borderStyle: style
    });
  }, [onCampaignUpdate]);

  const handleBorderColorChange = useCallback((color: string) => {
    onCampaignUpdate?.({
      wheelBorderColor: color,
      borderColor: color
    });
  }, [onCampaignUpdate]);

  const handleScaleChange = useCallback((scale: number) => {
    onCampaignUpdate?.({
      wheelScale: scale,
      scale: scale
    });
  }, [onCampaignUpdate]);

  const resetToDefaults = () => {
    onCampaignUpdate?.({
      wheelBorderStyle: 'classic',
      borderStyle: 'classic',
      wheelBorderColor: '#841b60',
      borderColor: '#841b60',
      wheelScale: 1,
      scale: 1
    });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Style de la roue</h3>
          <p className="text-sm text-gray-600">Personnalisez l'apparence de votre roue</p>
        </div>
        <button
          onClick={resetToDefaults}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          title="Réinitialiser aux valeurs par défaut"
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Scale Control */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Taille de la roue: {Math.round(currentScale * 100)}%
        </label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={currentScale}
          onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>50%</span>
          <span>100%</span>
          <span>200%</span>
        </div>
      </div>

      {/* Border Color */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Couleur de la bordure
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="color"
            value={currentBorderColor}
            onChange={(e) => handleBorderColorChange(e.target.value)}
            className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
          />
          <input
            type="text"
            value={currentBorderColor}
            onChange={(e) => handleBorderColorChange(e.target.value)}
            placeholder="#841b60"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => handleBorderColorChange('#841b60')}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded border border-gray-300 transition-colors"
            title="Couleur par défaut"
          >
            Défaut
          </button>
        </div>
      </div>

      {/* Border Style */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Style de bordure
        </label>
        <BorderStyleSelector
          currentStyle={currentBorderStyle}
          onStyleChange={handleBorderStyleChange}
        />
      </div>

      {/* Preview */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Aperçu des paramètres</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Échelle:</span>
            <span className="font-medium">{Math.round(currentScale * 100)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Style de bordure:</span>
            <span className="font-medium capitalize">{currentBorderStyle}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Couleur de bordure:</span>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: currentBorderColor }}
              />
              <span className="font-medium text-xs">{currentBorderColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <h5 className="text-sm font-medium text-amber-900 mb-1">💡 Conseils de style</h5>
        <ul className="text-xs text-amber-800 space-y-1">
          <li>• Utilisez une échelle entre 80% et 120% pour un rendu optimal</li>
          <li>• Les bordures métalliques (gold, silver) donnent un aspect premium</li>
          <li>• Assurez-vous que la couleur de bordure contraste avec le fond</li>
        </ul>
      </div>
    </div>
  );
};

export default WheelStyleConfig;