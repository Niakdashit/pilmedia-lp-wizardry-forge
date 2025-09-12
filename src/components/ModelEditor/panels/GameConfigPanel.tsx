import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Trash2, Palette, Settings, Image as ImageIcon, Gamepad2 } from 'lucide-react';
import { useEditorStore } from '../../../stores/editorStore';
import QuizTemplateSelector from '../components/QuizTemplateSelector';

interface GameConfigPanelProps {
  onBack?: () => void;
}

const DEFAULT_SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '🔔', '7️⃣'];

const GameConfigPanel: React.FC<GameConfigPanelProps> = ({ onBack }) => {
  const campaign = useEditorStore((s) => s.campaign);
  const setCampaign = useEditorStore((s) => s.setCampaign);
  const [activeSection, setActiveSection] = useState<'templates' | 'symbols' | 'colors' | 'settings'>('templates');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current jackpot config
  const jackpotConfig = campaign?.gameConfig?.jackpot || {};
  const slotConfig = campaign?.gameConfig?.slot || {};
  const symbols = slotConfig.symbols || DEFAULT_SYMBOLS;

  // Update functions
  const updateJackpotConfig = (updates: any) => {
    setCampaign((prev: any) => ({
      ...prev,
      gameConfig: {
        ...prev?.gameConfig,
        jackpot: {
          ...prev?.gameConfig?.jackpot,
          ...updates
        }
      }
    }));
  };

  const updateSlotConfig = (updates: any) => {
    setCampaign((prev: any) => ({
      ...prev,
      gameConfig: {
        ...prev?.gameConfig,
        slot: {
          ...prev?.gameConfig?.slot,
          ...updates
        }
      }
    }));
  };

  // Symbol management
  const handleSymbolChange = (index: number, value: string) => {
    const newSymbols = [...symbols];
    newSymbols[index] = value;
    updateSlotConfig({ symbols: newSymbols });
  };

  const handleSymbolRemove = (index: number) => {
    const newSymbols = symbols.filter((_: any, i: number) => i !== index);
    updateSlotConfig({ symbols: newSymbols.length ? newSymbols : DEFAULT_SYMBOLS });
  };

  const handleAddEmoji = (emoji: string) => {
    if (!symbols.includes(emoji)) {
      updateSlotConfig({ symbols: [...symbols, emoji] });
    }
  };

  // Image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const newSymbols = [...symbols];
      
      for (const file of Array.from(files)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          newSymbols.push(dataUrl);
          updateSlotConfig({ symbols: newSymbols });
        };
        reader.readAsDataURL(file);
      }
      
      // Reset input
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };

  const renderSymbolsSection = () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-300 mb-4">
        Personnalisez les symboles qui apparaîtront sur les rouleaux du jackpot
      </div>

      {/* Current symbols grid */}
      <div className="grid grid-cols-4 gap-3">
        {symbols.map((symbol: string, index: number) => (
          <div key={index} className="relative bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-center min-h-[60px]">
            {symbol.startsWith('data:image') || symbol.startsWith('http') ? (
              <img src={symbol} alt={`symbol-${index}`} className="w-8 h-8 object-contain" />
            ) : (
              <input
                type="text"
                value={symbol}
                onChange={(e) => handleSymbolChange(index, e.target.value)}
                className="w-full bg-transparent text-center text-2xl border-none outline-none text-white"
                maxLength={2}
              />
            )}
            <button
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 text-xs"
              onClick={() => handleSymbolRemove(index)}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Add emoji buttons */}
      <div>
        <div className="text-xs text-gray-400 mb-2">Symboles rapides</div>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_SYMBOLS.map((emoji) => (
            <button
              key={emoji}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-lg transition-colors"
              onClick={() => handleAddEmoji(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Upload images */}
      <div>
        <div className="text-xs text-gray-400 mb-2">Importer des images</div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-4 h-4" />
          Importer des images
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          multiple
          className="hidden"
          onChange={handleImageUpload}
        />
        <div className="text-xs text-gray-500 mt-1">PNG, JPG, SVG supportés</div>
      </div>
    </div>
  );

  const renderColorsSection = () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-300 mb-4">
        Personnalisez les couleurs du jeu jackpot
      </div>

      {/* Reel colors */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Couleur de fond des rouleaux
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={jackpotConfig.slotBackgroundColor || '#ffffff'}
              onChange={(e) => updateJackpotConfig({ slotBackgroundColor: e.target.value })}
              className="w-12 h-10 border border-gray-600 rounded cursor-pointer"
            />
            <input
              type="text"
              value={jackpotConfig.slotBackgroundColor || '#ffffff'}
              onChange={(e) => updateJackpotConfig({ slotBackgroundColor: e.target.value })}
              className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Couleur de bordure des rouleaux
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={jackpotConfig.slotBorderColor || '#ffd700'}
              onChange={(e) => updateJackpotConfig({ slotBorderColor: e.target.value })}
              className="w-12 h-10 border border-gray-600 rounded cursor-pointer"
            />
            <input
              type="text"
              value={jackpotConfig.slotBorderColor || '#ffd700'}
              onChange={(e) => updateJackpotConfig({ slotBorderColor: e.target.value })}
              className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Couleur de fond du conteneur
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={jackpotConfig.containerBackgroundColor || '#000000'}
              onChange={(e) => updateJackpotConfig({ containerBackgroundColor: e.target.value })}
              className="w-12 h-10 border border-gray-600 rounded cursor-pointer"
            />
            <input
              type="text"
              value={jackpotConfig.containerBackgroundColor || '#000000'}
              onChange={(e) => updateJackpotConfig({ containerBackgroundColor: e.target.value })}
              className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Couleur du bouton
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={jackpotConfig.buttonColor || '#ffd700'}
              onChange={(e) => updateJackpotConfig({ buttonColor: e.target.value })}
              className="w-12 h-10 border border-gray-600 rounded cursor-pointer"
            />
            <input
              type="text"
              value={jackpotConfig.buttonColor || '#ffd700'}
              onChange={(e) => updateJackpotConfig({ buttonColor: e.target.value })}
              className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsSection = () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-300 mb-4">
        Configurez les paramètres du jeu
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Texte du bouton
          </label>
          <input
            type="text"
            value={jackpotConfig.buttonLabel || 'SPIN'}
            onChange={(e) => updateJackpotConfig({ buttonLabel: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white"
            placeholder="Texte du bouton"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Largeur de bordure ({jackpotConfig.slotBorderWidth || 2}px)
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={jackpotConfig.slotBorderWidth || 2}
            onChange={(e) => updateJackpotConfig({ slotBorderWidth: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Probabilité de gain ({(jackpotConfig.winProbability || 0.15) * 100}%)
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={(jackpotConfig.winProbability || 0.15) * 100}
            onChange={(e) => updateJackpotConfig({ winProbability: parseInt(e.target.value) / 100 })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nombre maximum de gagnants
          </label>
          <input
            type="number"
            min="1"
            max="1000"
            value={jackpotConfig.maxWinners || 10}
            onChange={(e) => updateJackpotConfig({ maxWinners: parseInt(e.target.value) })}
            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white"
          />
        </div>
      </div>
    </div>
  );

  const renderTemplatesSection = () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-300 mb-4">
        Choisissez un template prédéfini pour votre jackpot
      </div>
      
      <QuizTemplateSelector
        selectedTemplate={jackpotConfig.templateId || 'classic'}
        onTemplateSelect={(template) => {
          updateJackpotConfig({ 
            templateId: template.id,
            templateStyle: template.style,
            slotBackgroundColor: template.style.backgroundColor,
            containerBackgroundColor: template.style.backgroundColor
          });
        }}
      />
    </div>
  );

  const sections = [
    { id: 'templates', label: 'Templates', icon: Palette },
    { id: 'symbols', label: 'Symboles', icon: ImageIcon },
    { id: 'colors', label: 'Couleurs', icon: Palette },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--sidebar-bg))]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
          )}
          <div className="flex items-center space-x-2">
            <Gamepad2 className="w-5 h-5 text-white" />
            <h2 className="text-lg font-semibold text-white">Configuration du Jeu</h2>
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex border-b border-white/10">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 transition-colors ${
                activeSection === section.id
                  ? 'bg-white/10 text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{section.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeSection === 'templates' && renderTemplatesSection()}
        {activeSection === 'symbols' && renderSymbolsSection()}
        {activeSection === 'colors' && renderColorsSection()}
        {activeSection === 'settings' && renderSettingsSection()}
      </div>
    </div>
  );
};

export default GameConfigPanel;