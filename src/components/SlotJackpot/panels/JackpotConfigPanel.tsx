import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface JackpotConfigPanelProps {
  onBack: () => void;
  // Configuration du jackpot
  reelSymbols?: string[];
  spinDuration?: number;
  winProbability?: number;
  // Styles visuels
  reelSize?: number;
  fontSize?: number;
  borderColor?: string;
  backgroundColor?: string;
  textColor?: string;
  // Callbacks de modification
  onReelSymbolsChange?: (symbols: string[]) => void;
  onSpinDurationChange?: (duration: number) => void;
  onWinProbabilityChange?: (probability: number) => void;
  onReelSizeChange?: (size: number) => void;
  onFontSizeChange?: (size: number) => void;
  onBorderColorChange?: (color: string) => void;
  onBackgroundColorChange?: (color: string) => void;
  onTextColorChange?: (color: string) => void;
}

const JackpotConfigPanel: React.FC<JackpotConfigPanelProps> = ({
  onBack,
  reelSymbols = ['🍎', '🍊', '🍋', '🍇', '🍓', '🥝', '🍒'],
  spinDuration = 1500,
  winProbability = 15,
  reelSize = 70,
  fontSize = 32,
  borderColor = '#ffd700',
  backgroundColor = '#ffffff',
  textColor = '#333333',
  onReelSymbolsChange,
  onReelSizeChange,
  onFontSizeChange,
  onBorderColorChange,
  onBackgroundColorChange,
  onTextColorChange
}) => {

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Configuration du Jackpot</h2>
        </div>
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-center bg-white border-b border-gray-200 py-3">
        <h3 className="text-sm font-medium text-gray-900">Configuration du style</h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Taille des rouleaux
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="50"
                max="120"
                step="2"
                value={reelSize}
                onChange={(e) => onReelSizeChange?.(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Petit (50px)</span>
                <span className="font-medium">{reelSize}px</span>
                <span>Grand (120px)</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Taille de police
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="12"
                max="72"
                value={fontSize}
                onChange={(e) => onFontSizeChange?.(parseInt(e.target.value, 10))}
                className="flex-1"
              />
              <span className="text-sm text-gray-500 w-10 text-right">{fontSize}px</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur de la bordure
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={borderColor}
                onChange={(e) => onBorderColorChange?.(e.target.value)}
                className="w-10 h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={borderColor}
                onChange={(e) => onBorderColorChange?.(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur de fond
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => onBackgroundColorChange?.(e.target.value)}
                className="w-10 h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => onBackgroundColorChange?.(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur du texte
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={textColor}
                onChange={(e) => onTextColorChange?.(e.target.value)}
                className="w-10 h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => onTextColorChange?.(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          {/* Aperçu */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Aperçu</h3>
            <div className="flex justify-center">
              <div
                className="rounded-lg flex items-center justify-center"
                style={{
                  width: `${reelSize}px`,
                  height: `${reelSize}px`,
                  backgroundColor,
                  border: `2px solid ${borderColor}`,
                  fontSize: `${fontSize}px`,
                  color: textColor
                }}
              >
                🍎
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JackpotConfigPanel;
