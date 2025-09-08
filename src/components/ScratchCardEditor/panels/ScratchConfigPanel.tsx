import React, { useState } from 'react';
import { ArrowLeft, Upload, Gift, Type, Image as ImageIcon, Trash2, Plus, RotateCcw } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { toDataURL, isValidImageFile, CardCover } from '@/utils/imageUtils';

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
  const [activeSection, setActiveSection] = useState<'cards' | 'prizes'>('cards');
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

  const handleCardColorChange = (id: string, color: string) => {
    const cards = Array.isArray(scratchConfig.cards) ? [...scratchConfig.cards] : [];
    const idx = cards.findIndex((c: any) => c.id === id);
    if (idx >= 0) {
      cards[idx] = { ...cards[idx], color };
      handleConfigChange({ cards });

      // Send color change to canvas via postMessage
      window.postMessage({ t: 'SET_CARD_COLOR', cardId: id, color }, '*');
    }
  };

  // (zone de grattage précise non utilisée dans la vue Grille)

  // Cards helpers
  const addCard = () => {
    const cards = Array.isArray(scratchConfig.cards) ? [...scratchConfig.cards] : [];
    if (cards.length >= 8) return; // small guard
    const id = `card-${Date.now().toString().slice(-6)}`;
    cards.push({ id, text: `Carte ${cards.length + 1}`, contentType: 'text', coverColor: '' });
    handleConfigChange({ cards });
  };
  const removeCard = (id: string) => {
    const cards = Array.isArray(scratchConfig.cards) ? [...scratchConfig.cards] : [];
    handleConfigChange({ cards: cards.filter((c: any) => c.id !== id) });
  };
  const updateCard = (id: string, updates: any) => {
    const cards = Array.isArray(scratchConfig.cards) ? [...scratchConfig.cards] : [];
    const idx = cards.findIndex((c: any) => c.id === id);
    if (idx >= 0) {
      cards[idx] = { ...cards[idx], ...updates };
      handleConfigChange({ cards });
    }
  };
  // Couverture globale (image/couleur) appliquée visuellement à toutes les cartes
  /*
  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      handleConfigChange({ coverImage: url, coverColor: undefined });
    };
    reader.readAsDataURL(file);
    e.currentTarget.value = '';
  };
  
  const clearCoverImage = () => handleConfigChange({ coverImage: undefined });
  */
  
  const handleCoverColorChange = (value: string) => {
    console.log('[ScratchConfigPanel] Changement couleur couverture:', value);
    handleConfigChange({ overlayColor: value, coverColor: value });
    // Mettre à jour aussi la couleur de toutes les cartes
    if (scratchConfig.cards && Array.isArray(scratchConfig.cards)) {
      const updatedCards = scratchConfig.cards.map((card: any) => ({
        ...card,
        color: value,
        coverColor: value // Garder la compatibilité
      }));
      console.log('[ScratchConfigPanel] Cartes mises à jour:', updatedCards);
      handleConfigChange({ cards: updatedCards });
    }
  };
  const handleCardImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Reset input immediately
    e.currentTarget.value = '';
    
    if (!isValidImageFile(file)) {
      console.error('Invalid image file format or size too large');
      return;
    }

    try {
      // 1) Generate thumbnail for UI display
      const thumbDataUrl = await toDataURL(file, 256, 0.85);
      
      // 2) Send ArrayBuffer to canvas via postMessage (direct to window since no iframe)
      const arrayBuffer = await file.arrayBuffer();
      window.postMessage(
        { 
          t: 'SET_CARD_COVER', 
          cardId: id, 
          mime: file.type, 
          ab: arrayBuffer 
        },
        '*',
        [arrayBuffer] // transferable
      );
      
      // 3) Update card state with thumbnail and cover data
      updateCard(id, { 
        contentType: 'image', 
        thumbDataUrl,
        cover: { kind: 'data', mime: file.type, value: thumbDataUrl } as CardCover,
        // Keep legacy fields for backward compatibility
        imageUrl: thumbDataUrl, 
        overlayImage: thumbDataUrl 
      });
      
    } catch (error) {
      console.error('Failed to process image upload:', error);
    }
  };

  // textures pré-définies non utilisées dans cette version de l'onglet

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
        {/* En-tête (parité avec GameManagementPanel) */}
        <div className="space-y-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Gestion du jeu</h2>
            <p className="text-gray-600 text-sm">Configurez les cartes et gérez les lots à gagner</p>
          </div>

          {/* Navigation des sections */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveSection('cards')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'cards' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              Cartes
            </button>
            <button
              onClick={() => setActiveSection('prizes')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'prizes' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Gift className="w-4 h-4 inline mr-2" />
              Lots
            </button>
          </div>
          {/* Contrôles de couverture globale (appliqués visuellement à toutes les cartes) */}
          <div className="mt-3 grid grid-cols-1 gap-3">
            <div className="border rounded-lg p-3 bg-gray-50">
              <label className="block text-xs font-medium text-gray-600 mb-2">Image lot</label>
              {scratchConfig.prizeImage ? (
                <div className="space-y-2">
                  <img src={scratchConfig.prizeImage} alt="Image lot" className="w-full max-h-32 object-contain rounded" />
                  <div className="flex gap-2">
                    <button onClick={() => handleConfigChange({ prizeImage: undefined })} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100">Supprimer</button>
                    <label className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer">
                      Remplacer
                      <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const url = ev.target?.result as string;
                          handleConfigChange({ prizeImage: url });
                        };
                        reader.readAsDataURL(file);
                        e.currentTarget.value = '';
                      }} className="hidden" />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer inline-flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" /> Choisir une image
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const url = ev.target?.result as string;
                      handleConfigChange({ prizeImage: url });
                    };
                    reader.readAsDataURL(file);
                    e.currentTarget.value = '';
                  }} className="hidden" />
                </label>
              )}
            </div>
            <div className="border rounded-lg p-3 bg-gray-50">
              <label className="block text-xs font-medium text-gray-600 mb-2">Couleur de couverture</label>
              <div className="flex items-center gap-2">
                <input type="color" value={scratchConfig.overlayColor || '#E3C6B7'} onChange={(e) => handleCoverColorChange(e.target.value)} className="w-10 h-10 p-0 border border-gray-300 rounded" />
                <input type="text" value={scratchConfig.overlayColor || '#E3C6B7'} onChange={(e) => handleCoverColorChange(e.target.value)} className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#841b60] focus:border-transparent" />
              </div>
            </div>
          </div>
        </div>

        {/* Section Cartes */}
        {activeSection === 'cards' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Cartes ({(scratchConfig.cards || []).length || 0})</h3>
              <button onClick={addCard} className="flex items-center px-3 py-2 bg-[#841b60] text-white text-sm rounded-lg hover:bg-[#6d1650] transition-colors">
                <Plus className="w-4 h-4 mr-1" /> Ajouter
              </button>
            </div>

            <div className="space-y-3">
              {(scratchConfig.cards || [
                { id: 'card-1', text: '🎉 Surprise 1' },
                { id: 'card-2', text: '💎 Bonus 2' },
                { id: 'card-3', text: '🏆 Prix 3' },
                { id: 'card-4', text: '🎁 Cadeau 4' }
              ]).map((c: any, index: number) => (
                <div key={c.id} className="bg-gray-50 p-4 rounded-lg border overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold text-gray-900">Carte {index + 1}</span>
                    <button onClick={() => removeCard(c.id)} className="text-red-500 hover:text-red-700 transition-colors" title="Supprimer la carte">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type de contenu</label>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center">
                          <input type="radio" name={`ctype-${c.id}`} value="text" checked={(c.contentType || 'text') === 'text'} onChange={() => updateCard(c.id, { contentType: 'text' })} className="mr-2 w-4 h-4 text-blue-600" />
                          <Type className="w-5 h-5 mr-1 text-gray-900" />
                          <span className="text-base text-gray-900">Texte</span>
                        </label>
                        <label className="flex items-center">
                          <input type="radio" name={`ctype-${c.id}`} value="image" checked={c.contentType === 'image'} onChange={() => updateCard(c.id, { contentType: 'image' })} className="mr-2 w-4 h-4 text-gray-400" />
                          <ImageIcon className="w-5 h-5 mr-1 text-gray-900" />
                          <span className="text-base text-gray-900">Image</span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 items-start">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{(c.contentType || 'text') === 'text' ? 'Texte' : 'Image'}</label>
                        {(c.contentType || 'text') === 'text' ? (
                          <input type="text" value={c.text || ''} onChange={(e) => handleCardTextChange(c.id, e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#841b60] focus:border-transparent" />
                        ) : (
                          <div className="space-y-2">
                            <input type="file" accept="image/*" onChange={(e) => handleCardImageUpload(c.id, e)} className="hidden" id={`upload-${c.id}`} />
                            <button onClick={() => document.getElementById(`upload-${c.id}`)?.click()} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                              <Upload className="w-4 h-4 inline mr-2" /> Choisir une image
                            </button>
                            {c.imageUrl && <img src={c.imageUrl} alt="aperçu" className="w-full max-h-28 object-contain rounded" />}
                          </div>
                        )}
                      </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Couleur de carte</label>
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative w-7 h-7 shrink-0">
                          <div
                            className="absolute inset-0 rounded-full border border-gray-300 shadow-sm"
                            style={{ background: (c.color || '#841b60') as string }}
                          />
                          <input
                            type="color"
                            value={c.color || '#841b60'}
                            onChange={(e) => handleCardColorChange(c.id, e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            aria-label={`Couleur de carte ${index + 1}`}
                          />
                        </div>
                        <input
                          type="text"
                          value={c.color || '#841b60'}
                          onChange={(e) => handleCardColorChange(c.id, e.target.value)}
                          className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
                        />
                      </div>
                    </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Lot attribué</label>
                      <select value={c.prizeId || ''} onChange={(e) => updateCard(c.id, { prizeId: e.target.value || undefined })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#841b60] focus:border-transparent">
                        <option value="">Aucun lot</option>
                        {prizes.map((p: any) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section Lots */}
        {activeSection === 'prizes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Lots à gagner ({prizes.length || 0})</h3>
              <button
                onClick={() => {
                  const newPrize = { id: Date.now().toString(), name: 'Nouveau lot', totalUnits: 1, awardedUnits: 0, attributionMethod: 'probability', probability: 10 } as any;
                  const next = [...prizes, newPrize];
                  (useEditorStore.getState().setCampaign as any)((prev: any) => ({ ...prev, prizes: next }));
                }}
                className="flex items-center px-3 py-2 bg-[#841b60] text-white text-sm rounded-lg hover:bg-[#6d1650] transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" /> Créer un lot
              </button>
            </div>

            {prizes.length === 0 && (
              <div className="text-center text-gray-500 py-12">Aucun lot configuré</div>
            )}

            <div className="space-y-3">
              {prizes.map((prize: any) => (
                <div key={prize.id} className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <input type="text" value={prize.name || ''} onChange={(e) => (useEditorStore.getState().setCampaign as any)((prev: any) => ({ ...prev, prizes: prizes.map((p: any) => p.id === prize.id ? { ...p, name: e.target.value } : p) }))} className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#841b60] focus:border-transparent" />
                    <button onClick={() => (useEditorStore.getState().setCampaign as any)((prev: any) => ({ ...prev, prizes: prizes.filter((p: any) => p.id !== prize.id) }))} className="text-red-500 hover:text-red-700 transition-colors" title="Supprimer le lot">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Méthode d'attribution</label>
                      <div className="flex space-x-3">
                        <label className="flex items-center">
                          <input type="radio" name={`attr-${prize.id}`} value="probability" checked={(prize.attributionMethod || prize.method) === 'probability'} onChange={() => (useEditorStore.getState().setCampaign as any)((prev: any) => ({ ...prev, prizes: prizes.map((p: any) => p.id === prize.id ? { ...p, attributionMethod: 'probability' } : p) }))} className="mr-2" />
                          <span className="text-sm">Probabilité</span>
                        </label>
                        <label className="flex items-center">
                          <input type="radio" name={`attr-${prize.id}`} value="calendar" checked={(prize.attributionMethod || prize.method) === 'calendar'} onChange={() => (useEditorStore.getState().setCampaign as any)((prev: any) => ({ ...prev, prizes: prizes.map((p: any) => p.id === prize.id ? { ...p, attributionMethod: 'calendar' } : p) }))} className="mr-2" />
                          <span className="text-sm">Calendrier</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Carte associée</label>
                      <select value={prize.cardId || ''} onChange={(e) => (useEditorStore.getState().setCampaign as any)((prev: any) => ({ ...prev, prizes: prizes.map((p: any) => p.id === prize.id ? { ...p, cardId: e.target.value } : p) }))} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#841b60] focus:border-transparent">
                        <option value="">Aucune carte</option>
                        {(scratchConfig.cards || []).map((c: any) => (
                          <option key={c.id} value={c.id}>{c.text || c.id}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {(prize.attributionMethod || prize.method) === 'probability' && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Probabilité (%)</label>
                        <input type="number" min="0" max="100" value={prize.probability || 0} onChange={(e) => (useEditorStore.getState().setCampaign as any)((prev: any) => ({ ...prev, prizes: prizes.map((p: any) => p.id === prize.id ? { ...p, probability: Number(e.target.value) } : p) }))} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#841b60] focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Unités totales</label>
                        <input type="number" min="0" value={prize.totalUnits || 0} onChange={(e) => (useEditorStore.getState().setCampaign as any)((prev: any) => ({ ...prev, prizes: prizes.map((p: any) => p.id === prize.id ? { ...p, totalUnits: Number(e.target.value) } : p) }))} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#841b60] focus:border-transparent" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScratchConfigPanel;
