import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Upload, Plus, Trash2, Gift, Type, Image as ImageIcon, X, RefreshCw } from 'lucide-react';
import { supabase } from '../../../integrations/supabase/client';
import type { Prize as DotationPrize } from '../../../types/dotation';

// Emojis populaires pour le sélecteur
const POPULAR_EMOJIS = [
  // Fruits
  '🍒', '🍋', '🍊', '🍇', '🍉', '🍓', '🍑', '🍌', '🍍', '🥝',
  // Symboles de chance
  '💎', '⭐', '🌟', '✨', '💫', '🔥', '⚡', '🌈', '☀️', '🌙',
  // Chiffres et lettres
  '7️⃣', '🔢', '💯', '🅰️', '🅱️', '🆎', '🆑', '🆒', '🆓', '🆕',
  // Objets
  '🎰', '🎲', '🃏', '🎯', '🎪', '🎨', '🎭', '🎬', '🎮', '🎹',
  // Symboles
  '💰', '💵', '💴', '💶', '💷', '🪙', '💳', '🏆', '🥇', '🥈',
  // Animaux
  '🦁', '🐯', '🐻', '🐼', '🐨', '🐸', '🐵', '🦄', '🦋', '🐝',
  // Nourriture
  '🍕', '🍔', '🍟', '🌭', '🍿', '🧁', '🍰', '🍩', '🍪', '🍫',
  // Boissons
  '☕', '🍵', '🥤', '🍹', '🍺', '🍻', '🥂', '🍾', '🍷', '🥃',
  // Cœurs et émotions
  '❤️', '💛', '💚', '💙', '💜', '🖤', '🤍', '🧡', '💗', '💖',
  // Autres
  '🔔', '🎁', '🎈', '🎉', '🎊', '🏅', '🌺', '🌸', '🌼', '🌻'
];

interface JackpotGamePanelProps {
  campaign?: any;
  setCampaign?: (campaign: any) => void;
  onElementsChange?: (elements: any[]) => void;
  elements?: any[];
  onElementUpdate?: (updates: any) => void;
  selectedElement?: any;
}

interface JackpotSymbol {
  id: string;
  label: string;
  contentType: 'emoji' | 'image';
  emoji?: string;
  imageUrl?: string;
  prizeId?: string;
}

const JackpotGamePanel: React.FC<JackpotGamePanelProps> = ({
  campaign,
  setCampaign
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dotationPrizes, setDotationPrizes] = useState<DotationPrize[]>([]);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState<string | null>(null); // ID du symbole dont le picker est ouvert
  const [isLoadingPrizes, setIsLoadingPrizes] = useState(false);

  // Fonction pour charger les lots de dotation
  const loadDotationPrizes = useCallback(async () => {
    if (!campaign?.id) return;

    setIsLoadingPrizes(true);
    try {
      const { data, error } = await (supabase as any)
        .from('dotation_configs')
        .select('prizes')
        .eq('campaign_id', campaign.id)
        .single();

      if (error) {
        console.log('⚠️ [JackpotGamePanel] No dotation config found:', error);
        setDotationPrizes([]);
        return;
      }

      if (data?.prizes) {
        console.log('✅ [JackpotGamePanel] Loaded dotation prizes:', data.prizes);
        setDotationPrizes(data.prizes as DotationPrize[]);
      } else {
        setDotationPrizes([]);
      }
    } catch (err) {
      console.error('❌ [JackpotGamePanel] Error loading dotation prizes:', err);
      setDotationPrizes([]);
    } finally {
      setIsLoadingPrizes(false);
    }
  }, [campaign?.id]);

  // Récupérer les lots au montage et toutes les 2 secondes
  useEffect(() => {
    loadDotationPrizes();

    // Polling toutes les 2 secondes pour détecter les nouveaux lots
    const interval = setInterval(() => {
      loadDotationPrizes();
    }, 2000);

    return () => clearInterval(interval);
  }, [loadDotationPrizes]);

  // Fermer le picker d'emoji quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.emoji-picker-container')) {
          setEmojiPickerOpen(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [emojiPickerOpen]);

  // Symboles par défaut
  const defaultSymbols: JackpotSymbol[] = [
    { id: '1', label: 'Cerise', contentType: 'emoji', emoji: '🍒' },
    { id: '2', label: 'Citron', contentType: 'emoji', emoji: '🍋' },
    { id: '3', label: 'Diamant', contentType: 'emoji', emoji: '💎' },
    { id: '4', label: 'Étoile', contentType: 'emoji', emoji: '⭐' },
    { id: '5', label: 'Sept', contentType: 'emoji', emoji: '7️⃣' },
  ];

  // Configuration du jackpot stockée dans campaign
  const jackpotConfig = campaign?.jackpotConfig || {
    reels: 3,
    symbolsPerReel: 3,
    spinDuration: 3000,
    symbols: defaultSymbols,
    buttonText: 'SPIN',
    buttonBorderColor: '#ffffff',
    buttonBackgroundColor: '#ff00a6',
    buttonTextColor: '#8b4513'
  };

  const symbols: JackpotSymbol[] = jackpotConfig.symbols || defaultSymbols;

  // S'assurer que la configuration contient toujours les symboles pour éviter les retours aux valeurs par défaut
  useEffect(() => {
    if (!campaign?.jackpotConfig?.symbols && setCampaign) {
      setCampaign((prev: any) => ({
        ...prev,
        jackpotConfig: {
          ...(prev?.jackpotConfig ?? {}),
          symbols
        }
      }));
    }
  }, [campaign?.jackpotConfig?.symbols, setCampaign, symbols]);

  // Filtrer uniquement les symboles avec lots assignés pour le jeu
  const activeSymbols = useMemo(() => {
    return symbols.filter(symbol => symbol.prizeId);
  }, [symbols]);
  
  // Mise à jour de la configuration
  const updateConfig = React.useCallback((updates: any) => {
    if (!setCampaign) return;
    
    console.log('💾 [JackpotGamePanel] Updating config:', updates);
    
    setCampaign((prev: any) => {
      const prevJackpot = prev?.jackpotConfig ?? {};
      const mergedJackpot = {
        ...prevJackpot,
        ...updates
      } as any;

      const allSymbols: JackpotSymbol[] = Array.isArray(mergedJackpot.symbols)
        ? mergedJackpot.symbols
        : [];
      const convertSymbolToString = (symbol: JackpotSymbol | string | null | undefined) => {
        if (!symbol) return null;
        if (typeof symbol === 'string') return symbol;
        if (symbol.contentType === 'image' && symbol.imageUrl) {
          return symbol.imageUrl;
        }
        return symbol.emoji || null;
      };

      const allSymbolStrings = allSymbols
        .map((symbol) => convertSymbolToString(symbol))
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

      const nextActiveSymbols = allSymbols.filter((symbol) => symbol?.prizeId);
      const nextSlotSymbolsRaw = nextActiveSymbols
        .map((symbol) => convertSymbolToString(symbol))
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
      const nextSlotSymbols = nextSlotSymbolsRaw.length >= 3 ? nextSlotSymbolsRaw : allSymbolStrings;
      const prizeMapEntries = nextActiveSymbols
        .filter((symbol) => symbol.prizeId)
        .map((symbol) => [symbol.prizeId as string, convertSymbolToString(symbol) ?? '❓']);

      const enrichedJackpot = {
        ...mergedJackpot,
        symbols: allSymbols,
        activeSymbols: nextActiveSymbols,
        slotMachineSymbols: nextSlotSymbols,
        symbolToPrizeMap: Object.fromEntries(prizeMapEntries),
        allSymbolStrings
      };

      const newCampaign = {
        ...prev,
        name: prev?.name || 'Campaign',
        jackpotConfig: enrichedJackpot,
        gameConfig: {
          ...(prev?.gameConfig ?? {}),
          jackpot: {
            ...(prev?.gameConfig?.jackpot ?? {}),
            ...enrichedJackpot
          }
        }
      };

      console.log('✅ [JackpotGamePanel] New campaign config:', newCampaign.jackpotConfig);
      return newCampaign;
    });
  }, [setCampaign]);

  // Fonctions de gestion des symboles
  const updateSymbols = (newSymbols: JackpotSymbol[]) => {
    updateConfig({ symbols: newSymbols });
  };

  const updateSymbol = (id: string, updates: Partial<JackpotSymbol>) => {
    const updatedSymbols = symbols.map(symbol =>
      symbol.id === id ? { ...symbol, ...updates } : symbol
    );
    updateSymbols(updatedSymbols);
  };

  const addSymbol = () => {
    const newSymbol: JackpotSymbol = {
      id: `symbol-${Date.now()}`,
      label: `Symbole ${symbols.length + 1}`,
      contentType: 'emoji',
      emoji: '❓'
    };
    updateSymbols([...symbols, newSymbol]);
  };

  const removeSymbol = (id: string) => {
    if (symbols.length <= 3) {
      alert('Vous devez avoir au moins 3 symboles');
      return;
    }
    updateSymbols(symbols.filter(s => s.id !== id));
  };

  const handleImageUpload = async (symbolId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const imageUrl = canvas.toDataURL('image/png', 0.9);
        updateSymbol(symbolId, { imageUrl });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Titre */}
        <div>
          <h2 className="text-xl font-semibold">Jackpot</h2>
        </div>

        {/* Symboles des rouleaux */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Symboles des rouleaux</h3>
            <button
              onClick={addSymbol}
              className="flex items-center px-3 py-2 bg-[#44444d] text-white text-sm rounded-lg hover:bg-[#5a5a63] transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Ajouter
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>💡 Attribution des lots :</strong> Associez chaque symbole à un lot créé dans l'onglet Dotation. Quand un joueur gagne ce lot, les 3 rouleaux afficheront le symbole correspondant.
            </p>
          </div>

          {/* Liste des symboles */}
          <div className="space-y-3">
            {symbols.map((symbol, index) => {
              const assignedPrize = dotationPrizes.find(p => p.id === symbol.prizeId);
              
              return (
                <div key={symbol.id} className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Symbole {index + 1}
                    </span>
                    {symbols.length > 3 && (
                      <button
                        onClick={() => removeSymbol(symbol.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Type de contenu */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Type de contenu
                      </label>
                      <div className="flex space-x-3">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`content-type-${symbol.id}`}
                            value="emoji"
                            checked={symbol.contentType === 'emoji'}
                            onChange={() => updateSymbol(symbol.id, { contentType: 'emoji', imageUrl: undefined })}
                            className="mr-2"
                          />
                          <Type className="w-4 h-4 mr-1" />
                          <span className="text-sm">Emoji</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`content-type-${symbol.id}`}
                            value="image"
                            checked={symbol.contentType === 'image'}
                            onChange={() => updateSymbol(symbol.id, { contentType: 'image' })}
                            className="mr-2"
                          />
                          <ImageIcon className="w-4 h-4 mr-1" />
                          <span className="text-sm">Image</span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Contenu selon le type */}
                      <div>
                        {symbol.contentType === 'emoji' ? (
                          <>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Emoji
                            </label>
                            <div className="relative emoji-picker-container">
                              <button
                                type="button"
                                onClick={() => setEmojiPickerOpen(emojiPickerOpen === symbol.id ? null : symbol.id)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-[#44444d] focus:border-transparent text-center text-2xl transition-colors"
                              >
                                {symbol.emoji || '🍒'}
                              </button>
                              
                              {/* Mini modale sélecteur d'emoji */}
                              {emojiPickerOpen === symbol.id && (
                                <div className="absolute z-50 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-xl p-3 left-0">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-gray-700">Choisir un emoji</span>
                                    <button
                                      onClick={() => setEmojiPickerOpen(null)}
                                      className="text-gray-400 hover:text-gray-600"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                                    {POPULAR_EMOJIS.map((emoji, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                          updateSymbol(symbol.id, { emoji });
                                          setEmojiPickerOpen(null);
                                        }}
                                        className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 rounded transition-colors"
                                        title={emoji}
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Image
                            </label>
                            <div className="space-y-2">
                              <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={(e) => handleImageUpload(symbol.id, e)}
                                className="hidden"
                                id={`file-${symbol.id}`}
                              />
                              <button
                                onClick={() => document.getElementById(`file-${symbol.id}`)?.click()}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center transition-colors"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                {symbol.imageUrl ? 'Changer' : 'Choisir'}
                              </button>
                              {symbol.imageUrl && (
                                <img
                                  src={symbol.imageUrl}
                                  alt="Aperçu"
                                  className="w-full h-16 object-contain rounded border bg-white"
                                />
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Nom du symbole */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Nom
                        </label>
                        <input
                          type="text"
                          value={symbol.label}
                          onChange={(e) => updateSymbol(symbol.id, { label: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#44444d] focus:border-transparent"
                          placeholder="Ex: Cerise"
                        />
                      </div>
                    </div>

                    {/* Attribution du lot */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-gray-600">
                          <Gift className="w-3 h-3 inline mr-1" />
                          Lot associé
                        </label>
                        <button
                          onClick={() => loadDotationPrizes()}
                          disabled={isLoadingPrizes}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 disabled:opacity-50"
                          title="Recharger les lots"
                        >
                          <RefreshCw className={`w-3 h-3 ${isLoadingPrizes ? 'animate-spin' : ''}`} />
                          Actualiser
                        </button>
                      </div>
                      <select
                        value={symbol.prizeId || ''}
                        onChange={(e) => updateSymbol(symbol.id, { prizeId: e.target.value || undefined })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#44444d] focus:border-transparent"
                      >
                        <option value="">Aucun lot</option>
                        {dotationPrizes.map(prize => (
                          <option key={prize.id} value={prize.id}>
                            {prize.name}
                          </option>
                        ))}
                      </select>
                      {assignedPrize && (
                        <p className="text-xs text-gray-500 mt-1">
                          ✓ Quand ce lot est gagné → 3x ce symbole s'affichent
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

          </div>

          {dotationPrizes.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                ⚠️ <strong>Aucun lot trouvé.</strong> Créez des lots dans <strong>Paramètres → Dotation</strong> pour les associer aux symboles.
              </p>
            </div>
          )}

          {activeSymbols.length === 0 && symbols.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs text-red-800">
                🚫 <strong>Aucun symbole actif !</strong> Le jackpot ne fonctionnera pas tant qu'aucun symbole n'a de lot assigné. Assignez au moins un lot à un symbole.
              </p>
            </div>
          )}

          {activeSymbols.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-800">
                ✅ <strong>{activeSymbols.length} symbole(s) actif(s)</strong> avec lots assignés. Le jackpot affichera uniquement ces symboles pendant le jeu.
              </p>
            </div>
          )}
        </div>

        {/* Texte du bouton */}
        <div className="space-y-2">
          <label className="text-base font-semibold block">Texte du bouton</label>
          <input
            type="text"
            value={jackpotConfig.buttonText || 'SPIN'}
            onChange={(e) => updateConfig({ buttonText: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="SPIN"
          />
        </div>

        {/* Couleur de la bordure du bouton */}
        <div className="space-y-2">
          <label className="text-base font-semibold block">Couleur de la bordure du bouton</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={jackpotConfig.buttonBorderColor || '#ffffff'}
              onChange={(e) => updateConfig({ buttonBorderColor: e.target.value })}
              className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={jackpotConfig.buttonBorderColor || '#ffffff'}
              onChange={(e) => updateConfig({ buttonBorderColor: e.target.value })}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="#ffffff"
            />
          </div>
        </div>

        {/* Couleur de fond du bouton */}
        <div className="space-y-2">
          <label className="text-base font-semibold block">Couleur de fond du bouton</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={jackpotConfig.buttonBackgroundColor || '#ff00a6'}
              onChange={(e) => updateConfig({ buttonBackgroundColor: e.target.value })}
              className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={jackpotConfig.buttonBackgroundColor || '#ff00a6'}
              onChange={(e) => updateConfig({ buttonBackgroundColor: e.target.value })}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="#ff00a6"
            />
          </div>
        </div>

        {/* Couleur du texte du bouton */}
        <div className="space-y-2">
          <label className="text-base font-semibold block">Couleur du texte du bouton</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={jackpotConfig.buttonTextColor || '#8b4513'}
              onChange={(e) => updateConfig({ buttonTextColor: e.target.value })}
              className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={jackpotConfig.buttonTextColor || '#8b4513'}
              onChange={(e) => updateConfig({ buttonTextColor: e.target.value })}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="#8b4513"
            />
          </div>
        </div>

        {/* Info dotation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>🎁 Gestion de la dotation</strong><br />
            Pour configurer les lots et les images gagnantes, ouvrez les <strong>Paramètres de la campagne</strong> (icône ⚙️ en haut) puis allez dans l'onglet <strong>"Dotation"</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JackpotGamePanel;
