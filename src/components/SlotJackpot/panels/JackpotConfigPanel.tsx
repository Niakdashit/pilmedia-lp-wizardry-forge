import React, { useState } from 'react';
import { ArrowLeft, Check, Image } from 'lucide-react';

interface JackpotTemplate {
  id: string;
  name: string;
  description: string;
  imagePath: string;
}

interface JackpotConfigPanelProps {
  onBack: () => void;
  // Configuration du jackpot
  reelSymbols?: string[];
  spinDuration?: number;
  winProbability?: number;
  selectedTemplate?: string;
  // Personnalisation avancée du cadre personnalisé
  customFrame?: {
    frameColor?: string;
    backgroundColor?: string;
    showBorder?: boolean;
    borderColor?: string;
    frameThickness?: number;
  };
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
  onTemplateChange?: (templateId: string) => void;
  onReelSizeChange?: (size: number) => void;
  onFontSizeChange?: (size: number) => void;
  onBorderColorChange?: (color: string) => void;
  onBackgroundColorChange?: (color: string) => void;
  onTextColorChange?: (color: string) => void;
  onCustomFrameChange?: (updates: Partial<NonNullable<JackpotConfigPanelProps['customFrame']>>) => void;
  // Template personnalisé importé par l'utilisateur
  customTemplateUrl?: string;
  onCustomTemplateChange?: (url: string) => void;
}

const jackpotTemplates: JackpotTemplate[] = [
  {
    id: 'jackpot-frame',
    name: 'Cadre Principal',
    description: 'Template de base avec bordure dorée classique',
    imagePath: '/assets/slot-frames/jackpot-frame.svg'
  },
  {
    id: 'jackpot-2',
    name: 'Style Vintage',
    description: 'Design rétro avec ornements décoratifs',
    imagePath: '/assets/slot-frames/Jackpot 2.svg'
  },
  {
    id: 'jackpot-3',
    name: 'Bordure Néon Rouge',
    description: 'Cadre moderne avec éclairage néon rouge',
    imagePath: '/assets/slot-frames/Jackpot 3.svg'
  },
  {
    id: 'jackpot-4',
    name: 'Design Orange Moderne',
    description: 'Style contemporain avec accents orange',
    imagePath: '/assets/slot-frames/Jackpot 4.svg'
  },
  {
    id: 'jackpot-5',
    name: 'Cadre Doré Lumineux',
    description: 'Bordure dorée avec effets lumineux',
    imagePath: '/assets/slot-frames/Jackpot 5.svg'
  },
  {
    id: 'jackpot-6',
    name: 'Style Cylindre Classique',
    description: 'Design traditionnel de machine à sous',
    imagePath: '/assets/slot-frames/Jackpot 6.svg'
  },
  {
    id: 'jackpot-8',
    name: 'Jackpot Style 8',
    description: 'Design moderne avec effets métalliques',
    imagePath: '/assets/slot-frames/Jackpot 8.svg'
  },
  {
    id: 'jackpot-9',
    name: 'Jackpot Style 9',
    description: 'Cadre élégant avec ornements dorés',
    imagePath: '/assets/slot-frames/Jackpot 9.svg'
  },
  {
    id: 'jackpot-10',
    name: 'Jackpot Style 10',
    description: 'Design épuré avec accents lumineux',
    imagePath: '/assets/slot-frames/Jackpot 10.svg'
  },
  {
    id: 'jackpot-11',
    name: 'Jackpot Style 11',
    description: 'Cadre sophistiqué avec effets 3D',
    imagePath: '/assets/slot-frames/Jackpot 11.svg'
  },
  {
    id: 'custom-frame',
    name: 'Personnalisé',
    description: 'Cadre entièrement personnalisable (couleurs, bordure, fond)',
    imagePath: ''
  }
];

const JackpotConfigPanel: React.FC<JackpotConfigPanelProps> = ({
  onBack,
  reelSymbols = ['🍎', '🍊', '🍋', '🍇', '🍓', '🥝', '🍒'],
  spinDuration = 1500,
  winProbability = 15,
  selectedTemplate = 'jackpot-frame',
  reelSize = 70,
  fontSize = 32,
  borderColor = '#ffd700',
  backgroundColor = '#ffffff',
  textColor = '#333333',
  onReelSymbolsChange,
  onTemplateChange,
  onReelSizeChange,
  onFontSizeChange,
  onBorderColorChange,
  onBackgroundColorChange,
  onTextColorChange,
  customFrame,
  onCustomFrameChange,
  customTemplateUrl,
  onCustomTemplateChange
}) => {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      onCustomTemplateChange?.(url);
    };
    reader.readAsDataURL(file);
  };

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

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">

          

          

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

          

          {/* Sélecteur de templates */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">Templates de Jackpot</h3>
              <span className="text-xs text-gray-500">{jackpotTemplates.length} disponibles</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {jackpotTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedTemplate === template.id
                      ? 'border-[#841b60] bg-white shadow-lg'
                      : hoveredTemplate === template.id
                      ? 'border-gray-300 bg-gray-50'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                  onClick={() => onTemplateChange?.(template.id)}
                  onMouseEnter={() => setHoveredTemplate(template.id)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                >
                  {/* Selection indicator */}
                  {selectedTemplate === template.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #841b60 0%, #a21d6b 100%)' }}>
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      selectedTemplate === template.id
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`} style={selectedTemplate === template.id ? {
                      background: 'linear-gradient(135deg, #841b60 0%, #a21d6b 100%)'
                    } : {}}>
                      <Image className="w-5 h-5" />
                    </div>

                    <div className="flex-1 flex flex-col gap-1">
                      <span className="h-2 rounded bg-gray-200" />
                      <span className="h-2 w-2/3 rounded bg-gray-100" />
                    </div>
                  </div>

                  {/* Preview image */}
                  <div className="mt-3 flex justify-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {template.imagePath ? (
                        <img 
                          src={template.imagePath}
                          alt={template.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                          Aperçu
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accordéon de personnalisation pour le template Personnalisé */}
          {selectedTemplate === 'custom-frame' && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Personnalisation du cadre</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Largeur de couleur du cadre</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={4}
                      max={40}
                      step={1}
                      value={Number(customFrame?.frameThickness ?? 12)}
                      onChange={(e) => onCustomFrameChange?.({ frameThickness: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      min={4}
                      max={40}
                      step={1}
                      value={Number(customFrame?.frameThickness ?? 12)}
                      onChange={(e) => onCustomFrameChange?.({ frameThickness: Number(e.target.value) })}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <span className="text-xs text-gray-500">px</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Couleur du cadre</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customFrame?.frameColor || '#bdbdbd'}
                      onChange={(e) => onCustomFrameChange?.({ frameColor: e.target.value })}
                      className="w-10 h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customFrame?.frameColor || '#bdbdbd'}
                      onChange={(e) => onCustomFrameChange?.({ frameColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Couleur de fond</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customFrame?.backgroundColor || '#3d343d'}
                      onChange={(e) => onCustomFrameChange?.({ backgroundColor: e.target.value })}
                      className="w-10 h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customFrame?.backgroundColor || '#3d343d'}
                      onChange={(e) => onCustomFrameChange?.({ backgroundColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Afficher une bordure</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!!customFrame?.showBorder}
                      onChange={(e) => onCustomFrameChange?.({ showBorder: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#841b60]"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Couleur de la bordure</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customFrame?.borderColor || '#000000'}
                      onChange={(e) => onCustomFrameChange?.({ borderColor: e.target.value })}
                      className="w-10 h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
                      disabled={!customFrame?.showBorder}
                    />
                    <input
                      type="text"
                      value={customFrame?.borderColor || '#000000'}
                      onChange={(e) => onCustomFrameChange?.({ borderColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                      disabled={!customFrame?.showBorder}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload de template personnalisé – visible en permanence, placé juste après Personnalisé */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Votre template (500×500)</h3>
                <p className="text-xs text-gray-500">PNG, JPG ou SVG. Un carré 500×500 est recommandé.</p>
              </div>
              <button
                onClick={handleUploadClick}
                className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50 whitespace-nowrap"
              >
                Importer template
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.svg"
                className="hidden"
                onChange={handleFileSelected}
              />
            </div>
            {customTemplateUrl && (
              <div className="mt-3">
                <img src={customTemplateUrl} alt="Aperçu importé" className="w-40 h-40 object-contain border rounded-md" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JackpotConfigPanel;
