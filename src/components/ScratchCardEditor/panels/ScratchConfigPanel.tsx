import React, { useState } from 'react';
import { ArrowLeft, Upload, Palette, Target } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';

interface ScratchConfigPanelProps {
  onBack?: () => void;
  scratchConfig?: any;
  onScratchConfigChange?: (config: any) => void;
  selectedDevice?: 'desktop' | 'tablet' | 'mobile';
}

const ScratchConfigPanel: React.FC<ScratchConfigPanelProps> = ({
  onBack,
  scratchConfig = {},
  onScratchConfigChange,
  selectedDevice = 'desktop'
}) => {
  const [activeSection, setActiveSection] = useState<'area' | 'content' | 'texture'>('area');
  const campaign = useEditorStore((s) => s.campaign);
  const prizes = (campaign as any)?.prizes || [];

  const handleConfigChange = (updates: any) => {
    onScratchConfigChange?.({ ...scratchConfig, ...updates });
  };

  const handleCardTextChange = (id: string, value: string) => {
    const cards = Array.isArray(scratchConfig.cards) ? [...scratchConfig.cards] : [];
    const idx = cards.findIndex((c: any) => c.id === id);
    if (idx >= 0) {
      cards[idx] = { ...cards[idx], text: value };
    }
    handleConfigChange({ cards });
  };

  const handleScratchAreaChange = (field: string, value: any) => {
    const newArea = { ...scratchConfig.scratchArea, [field]: value };
    handleConfigChange({ scratchArea: newArea });
  };

  const handleRevealedContentChange = (field: string, value: any) => {
    const newContent = { ...scratchConfig.revealedContent, [field]: value };
    handleConfigChange({ revealedContent: newContent });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        handleRevealedContentChange('type', 'image');
        handleRevealedContentChange('value', imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const scratchTextures = [
    { id: 'silver', label: 'Argent', color: '#C0C0C0' },
    { id: 'gold', label: 'Or', color: '#FFD700' },
    { id: 'bronze', label: 'Bronze', color: '#CD7F32' },
    { id: 'gray', label: 'Gris', color: '#808080' },
    { id: 'black', label: 'Noir', color: '#000000' }
  ];

  return (
    <div className="h-full flex flex-col">
      {onBack && (
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {/* Section Tabs */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-2">
            {[
              { id: 'area', label: 'Zone', icon: Target },
              { id: 'content', label: 'Contenu', icon: Upload },
              { id: 'texture', label: 'Texture', icon: Palette }
            ].map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? 'bg-[#d4dbe8] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Zone de grattage */}
        {activeSection === 'area' && (
          <div className="p-4 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Zone de grattage</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position X
                    </label>
                    <input
                      type="number"
                      value={scratchConfig.scratchArea?.x || 50}
                      onChange={(e) => handleScratchAreaChange('x', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4dbe8] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position Y
                    </label>
                    <input
                      type="number"
                      value={scratchConfig.scratchArea?.y || 50}
                      onChange={(e) => handleScratchAreaChange('y', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4dbe8] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Largeur
                    </label>
                    <input
                      type="number"
                      value={scratchConfig.scratchArea?.width || 300}
                      onChange={(e) => handleScratchAreaChange('width', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4dbe8] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hauteur
                    </label>
                    <input
                      type="number"
                      value={scratchConfig.scratchArea?.height || 200}
                      onChange={(e) => handleScratchAreaChange('height', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4dbe8] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Épaisseur du grattage
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={scratchConfig.scratchThickness || 20}
                    onChange={(e) => handleConfigChange({ scratchThickness: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    {scratchConfig.scratchThickness || 20}px
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenu révélé */}
        {activeSection === 'content' && (
          <div className="p-4 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contenu révélé</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de contenu
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="contentType"
                        value="text"
                        checked={scratchConfig.revealedContent?.type === 'text'}
                        onChange={() => handleRevealedContentChange('type', 'text')}
                        className="mr-2"
                      />
                      Texte
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="contentType"
                        value="image"
                        checked={scratchConfig.revealedContent?.type === 'image'}
                        onChange={() => handleRevealedContentChange('type', 'image')}
                        className="mr-2"
                      />
                      Image
                    </label>
                  </div>
                </div>

                {scratchConfig.revealedContent?.type === 'text' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texte à révéler
                    </label>
                    <textarea
                      value={scratchConfig.revealedContent?.value || 'Félicitations!'}
                      onChange={(e) => handleRevealedContentChange('value', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4dbe8] focus:border-transparent"
                      rows={3}
                      placeholder="Entrez le texte à révéler..."
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image à révéler
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {scratchConfig.revealedContent?.value ? (
                        <div className="space-y-2">
                          <img
                            src={scratchConfig.revealedContent.value}
                            alt="Contenu révélé"
                            className="max-w-full h-32 object-contain mx-auto"
                          />
                          <button
                            onClick={() => handleRevealedContentChange('value', '')}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Supprimer
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Glissez une image ou</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="content-upload"
                          />
                          <label
                            htmlFor="content-upload"
                            className="inline-block px-4 py-2 bg-[#d4dbe8] text-white rounded-md text-sm font-medium cursor-pointer hover:bg-[#6d1650] transition-colors"
                          >
                            Parcourir
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Texture de grattage */}
        {activeSection === 'texture' && (
          <div className="p-4 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Texture de grattage</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur de la surface (overlay)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {scratchTextures.map((texture) => (
                      <button
                        key={texture.id}
                        onClick={() => handleConfigChange({ scratchTexture: texture.id })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          scratchConfig.scratchTexture === texture.id
                            ? 'border-[#d4dbe8] ring-2 ring-[#d4dbe8]/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="w-full h-8 rounded mb-2"
                          style={{ backgroundColor: texture.color }}
                        />
                        <div className="text-xs font-medium text-gray-700">
                          {texture.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opacité de la surface
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={scratchConfig.scratchOpacity || 0.8}
                    onChange={(e) => handleConfigChange({ scratchOpacity: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    {Math.round((scratchConfig.scratchOpacity || 0.8) * 100)}%
                  </div>
                </div>

                {/* Options pour la mécanique Grille 2x2 */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-md font-semibold text-gray-800 mb-4">Options du jeu (Grille 2×2)</h4>
                  <div className="space-y-4">
                    {/* Édition rapide des libellés */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Libellés des 4 cartes</label>
                      <div className="space-y-2">
                        {(scratchConfig.cards || [
                          { id: 'card-1', text: '🎉 Surprise 1' },
                          { id: 'card-2', text: '💎 Bonus 2' },
                          { id: 'card-3', text: '🏆 Prix 3' },
                          { id: 'card-4', text: '🎁 Cadeau 4' }
                        ]).map((c: any) => (
                          <div key={c.id} className="flex items-center gap-2">
                            <span className="text-xs w-16 text-gray-500">{c.id}</span>
                            <input
                              type="text"
                              value={c.text || ''}
                              onChange={(e) => handleCardTextChange(c.id, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4dbe8] focus:border-transparent"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* La carte gagnante est tirée selon les probabilités/stock. Pas de forçage manuel ici. */}
                    {/* Attribution des lots par carte */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Attribuer un lot à chaque carte</label>
                      <div className="space-y-2">
                        {(scratchConfig.cards || [
                          { id: 'card-1', text: '🎉 Surprise 1' },
                          { id: 'card-2', text: '💎 Bonus 2' },
                          { id: 'card-3', text: '🏆 Prix 3' },
                          { id: 'card-4', text: '🎁 Cadeau 4' }
                        ]).map((c: any) => (
                          <div key={c.id} className="flex items-center gap-2">
                            <span className="text-xs w-16 text-gray-500">{c.id}</span>
                            <select
                              value={c.prizeId || ''}
                              onChange={(e) => {
                                const prizeId = e.target.value || undefined;
                                const cards = Array.isArray(scratchConfig.cards) ? [...scratchConfig.cards] : [];
                                const idx = cards.findIndex((x: any) => x.id === c.id);
                                if (idx >= 0) {
                                  cards[idx] = { ...cards[idx], prizeId };
                                  handleConfigChange({ cards });
                                }
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4dbe8] focus:border-transparent"
                            >
                              <option value="">— Aucun (perdant)</option>
                              {prizes.map((p: any) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                        {prizes.length === 0 && (
                          <p className="text-xs text-gray-500">Aucun lot configuré pour la campagne. Ajoutez des lots dans Paramétrage → Lots.</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Couleur de l'overlay</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={scratchConfig.overlayColor || '#E3C6B7'}
                          onChange={(e) => handleConfigChange({ overlayColor: e.target.value })}
                          className="w-10 h-10 p-0 border border-gray-300 rounded"
                          aria-label="Couleur de l'overlay"
                        />
                        <input
                          type="text"
                          value={scratchConfig.overlayColor || '#E3C6B7'}
                          onChange={(e) => handleConfigChange({ overlayColor: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4dbe8] focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Taille de la brosse</label>
                      <input
                        type="range"
                        min="10"
                        max="120"
                        step="2"
                        value={scratchConfig.brushSize ?? 40}
                        onChange={(e) => handleConfigChange({ brushSize: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-500 mt-1">{scratchConfig.brushSize ?? 40}px</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Seuil de révélation</label>
                      <input
                        type="range"
                        min="0.2"
                        max="1"
                        step="0.05"
                        value={scratchConfig.revealThreshold ?? 0.6}
                        onChange={(e) => handleConfigChange({ revealThreshold: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-500 mt-1">{Math.round(100 * (scratchConfig.revealThreshold ?? 0.6))}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScratchConfigPanel;
