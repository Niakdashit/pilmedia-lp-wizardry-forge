import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Percent,
  RotateCcw,
  Clock,
  Gift,
  Image,
  Type,
  Upload
} from 'lucide-react';
import { supabase } from '../../../integrations/supabase/client';
import type { Prize as DotationPrize } from '../../../types/dotation';

interface GameManagementPanelProps {
  campaign: any;
  setCampaign: (campaign: any) => void;
}

interface WheelSegment {
  id: string;
  label: string;
  color: string;
  probability?: number;
  prizeId?: string;
  contentType: 'text' | 'image';
  imageUrl?: string;
}

interface Prize {
  id: string;
  name: string;
  description?: string;
  totalUnits?: number;
  awardedUnits?: number;
  method?: string;
  probabilityPercent?: number;
  attributionMethod?: 'calendar' | 'probability';
  calendarDate?: string;
  calendarTime?: string;
  probability?: number;
  segmentId?: string;
}

const GameManagementPanel: React.FC<GameManagementPanelProps> = ({
  campaign,
  setCampaign
}) => {
  const [activeSection, setActiveSection] = useState<'segments' | 'prizes'>('segments');
  const gameType = campaign?.type || 'wheel';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dotationPrizes, setDotationPrizes] = useState<DotationPrize[]>([]);
  const lastExtractedColorsRef = useRef<string>('');

  // Récupérer les lots de dotation depuis Supabase
  useEffect(() => {
    const loadDotationPrizes = async () => {
      if (!campaign?.id) return;

      try {
        // Utiliser une requête sans typage strict pour dotation_configs
        const { data, error } = await (supabase as any)
          .from('dotation_configs')
          .select('prizes')
          .eq('campaign_id', campaign.id)
          .single();

        if (error) {
          console.log('⚠️ [GameManagementPanel] No dotation config found:', error);
          return;
        }

        if (data?.prizes) {
          console.log('✅ [GameManagementPanel] Loaded dotation prizes:', data.prizes);
          setDotationPrizes(data.prizes as DotationPrize[]);
        }
      } catch (err) {
        console.error('❌ [GameManagementPanel] Error loading dotation prizes:', err);
      }
    };

    loadDotationPrizes();
  }, [campaign?.id]);

  // Le type de jeu est désormais dérivé directement de la campagne

  // Fonction pour mettre à jour les couleurs des segments existants
  const updateSegmentColorsFromExtractedColors = () => {
    const extractedColors = campaign?.design?.extractedColors || [];
    if (extractedColors.length === 0) return;
    
    const primaryColor = extractedColors[0];
    const existingSegments = campaign?.wheelConfig?.segments || [];
    
    if (existingSegments.length > 0) {
      const updatedSegments = existingSegments.map((segment: WheelSegment, index: number) => {
        // Ne mettre à jour que les segments qui utilisent encore la couleur par défaut
        if (segment.color === '#44444d') {
          return { ...segment, color: primaryColor };
        }
        return segment;
      });
      
      updateSegments(updatedSegments);
    }
  };

  // Mettre à jour les couleurs quand les couleurs extraites changent
  React.useEffect(() => {
    const extractedColors = campaign?.design?.extractedColors || [];
    const colorsKey = JSON.stringify(extractedColors);
    
    // Only update if colors actually changed
    if (colorsKey !== lastExtractedColorsRef.current && extractedColors.length > 0) {
      lastExtractedColorsRef.current = colorsKey;
      updateSegmentColorsFromExtractedColors();
    }
  }, [campaign?.design?.extractedColors]);

  // Segments par défaut pour la roue de la fortune avec alternance couleur/blanc
  // Utiliser les couleurs extraites si disponibles
  const extractedColors = campaign?.design?.extractedColors || [];
  const primaryColor = extractedColors[0] || '#44444d';
  
  const defaultSegments: WheelSegment[] = [
    { id: '1', label: 'Segment 1', color: primaryColor, contentType: 'text' },
    { id: '2', label: 'Segment 2', color: '#ffffff', contentType: 'text' },
    { id: '3', label: 'Segment 3', color: primaryColor, contentType: 'text' },
    { id: '4', label: 'Segment 4', color: '#ffffff', contentType: 'text' },
    { id: '5', label: 'Segment 5', color: primaryColor, contentType: 'text' },
    { id: '6', label: 'Segment 6', color: '#ffffff', contentType: 'text' },
  ];

  // Charger les segments depuis tous les emplacements possibles (priorité à wheelConfig)
  const segments: WheelSegment[] = 
    campaign?.wheelConfig?.segments ||
    campaign?.gameConfig?.wheel?.segments ||
    campaign?.config?.roulette?.segments ||
    defaultSegments;
  
  const prizes: Prize[] = campaign?.prizes || [];
  
  console.log('🎯 GameManagementPanel: Loaded segments', {
    source: campaign?.wheelConfig?.segments ? 'wheelConfig' :
            campaign?.gameConfig?.wheel?.segments ? 'gameConfig.wheel' :
            campaign?.config?.roulette?.segments ? 'config.roulette' :
            'defaultSegments',
    count: segments.length,
    segments: segments.map(s => ({ id: s.id, label: s.label, prizeId: s.prizeId }))
  });

  const updateSegments = (newSegments: WheelSegment[]) => {
    console.log('🎯 GameManagementPanel: Updating segments', {
      newSegments,
      campaignId: campaign?.id,
      previousSegments: campaign?.wheelConfig?.segments
    });
    
    // Sauvegarder dans TOUS les emplacements pour assurer la persistance
    setCampaign({
      ...campaign,
      wheelConfig: {
        ...campaign.wheelConfig,
        segments: newSegments
      },
      gameConfig: {
        ...campaign.gameConfig,
        wheel: {
          ...campaign.gameConfig?.wheel,
          segments: newSegments
        }
      },
      config: {
        ...campaign.config,
        roulette: {
          ...campaign.config?.roulette,
          segments: newSegments
        }
      },
      _lastUpdate: Date.now() // Force re-render trigger
    });
  };

  const updatePrizes = (newPrizes: Prize[]) => {
    setCampaign({
      ...campaign,
      prizes: newPrizes.map(prize => ({
        ...prize,
        // Map GameManagementPanel format to ProbabilityEngine format
        method: prize.attributionMethod,
        probabilityPercent: prize.probability,
        calendarDateTime: prize.calendarDate && prize.calendarTime ? 
          `${prize.calendarDate}T${prize.calendarTime}` : undefined
      }))
    });
  };

  const addSegment = () => {
    const newSegmentIndex = segments.length;
    const isEven = newSegmentIndex % 2 === 0;
    
    // Utiliser les couleurs extraites si disponibles
    const extractedColors = campaign?.design?.extractedColors || [];
    const primaryColor = extractedColors[0] || '#44444d';
    
    const newSegment: WheelSegment = {
      id: Date.now().toString(),
      label: `Segment ${segments.length + 1}`,
      color: isEven ? primaryColor : '#ffffff',
      contentType: 'text'
    };
    updateSegments([...segments, newSegment]);
  };

  const removeSegment = (segmentId: string) => {
    if (segments.length > 2) { // Minimum 2 segments
      updateSegments(segments.filter(s => s.id !== segmentId));
    }
  };

  const updateSegment = (segmentId: string, updates: Partial<WheelSegment>) => {
    updateSegments(segments.map(s => 
      s.id === segmentId ? { ...s, ...updates } : s
    ));
  };

  const handleImageUpload = async (segmentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Validation du fichier avec l'utilitaire
      const { validateImageFile, optimizeImageForSegment } = await import('../../../utils/imageOptimizer');
      const validation = validateImageFile(file);
      
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      // Optimiser l'image pour les segments de roue - FORCER PNG pour préserver la transparence
      const optimizedImage = await optimizeImageForSegment(file, {
        maxWidth: 200,
        maxHeight: 200,
        quality: 0.9,
        format: 'png'
      });

      // Mettre à jour le segment avec l'image optimisée
      updateSegment(segmentId, { 
        imageUrl: optimizedImage.dataUrl, 
        contentType: 'image',
        label: '' // Pas de label pour les segments image - l'image sera affichée à la place
      });

      console.log(`Image optimized: ${optimizedImage.width}x${optimizedImage.height}, ${Math.round(optimizedImage.size / 1024)}KB`);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Erreur lors du traitement de l\'image');
    }
    
    // Reset input pour permettre de re-sélectionner le même fichier
    event.target.value = '';
  };

  const addPrize = () => {
    const newPrize: Prize = {
      id: Date.now().toString(),
      name: 'Nouveau lot',
      totalUnits: 1,
      awardedUnits: 0,
      method: 'probability',
      probabilityPercent: 10
    };
    updatePrizes([...prizes, newPrize]);
  };

  const removePrize = (prizeId: string) => {
    updatePrizes(prizes.filter(p => p.id !== prizeId));
  };

  const updatePrize = (prizeId: string, updates: Partial<Prize>) => {
    updatePrizes(prizes.map(p => 
      p.id === prizeId ? { ...p, ...updates } : p
    ));
  };

  return (
    <div className="p-6 space-y-6 min-h-full overflow-y-auto text-[hsl(var(--sidebar-text-primary))]">
      {/* En-tête */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Gestion du jeu</h2>
        <p className="text-gray-600 text-sm">
          Configurez les segments de la roue et gérez les lots à gagner
        </p>
      </div>

      {/* Configuration spécifique selon le type de jeu */}
      {gameType === 'wheel' && (
        <>
          {/* Navigation des sections pour la roue */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveSection('segments')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'segments'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              Segments
            </button>
            <button
              onClick={() => setActiveSection('prizes')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'prizes'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Gift className="w-4 h-4 inline mr-2" />
              Lots
            </button>
          </div>

          {/* Section Segments */}
          {activeSection === 'segments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Segments de la roue ({segments.length})
            </h3>
            <button
              onClick={addSegment}
              className="flex items-center px-3 py-2 bg-[#44444d] text-white text-sm rounded-lg hover:bg-[#5a5a63] transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Ajouter
            </button>
          </div>

          <div className="space-y-3">
            {segments.map((segment, index) => (
              <div key={segment.id} className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Segment {index + 1}
                  </span>
                  {segments.length > 2 && (
                    <button
                      onClick={() => removeSegment(segment.id)}
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
                          name={`content-type-${segment.id}`}
                          value="text"
                          checked={segment.contentType === 'text'}
                          onChange={() => updateSegment(segment.id, { contentType: 'text', imageUrl: undefined })}
                          className="mr-2"
                        />
                        <Type className="w-4 h-4 mr-1" />
                        <span className="text-sm">Texte</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`content-type-${segment.id}`}
                          value="image"
                          checked={segment.contentType === 'image'}
                          onChange={() => updateSegment(segment.id, { contentType: 'image' })}
                          className="mr-2"
                        />
                        <Image className="w-4 h-4 mr-1" />
                        <span className="text-sm">Image</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Contenu selon le type */}
                    <div>
                      {segment.contentType === 'text' ? (
                        <>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Texte
                          </label>
                          <input
                            type="text"
                            value={segment.label}
                            onChange={(e) => updateSegment(segment.id, { label: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#44444d] focus:border-transparent"
                          />
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
                              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                              onChange={(e) => handleImageUpload(segment.id, e)}
                              className="hidden"
                            />
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center transition-colors"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {segment.imageUrl ? 'Changer l\'image' : 'Choisir une image'}
                            </button>
                            {segment.imageUrl && (
                              <div className="relative">
                                <img
                                  src={segment.imageUrl}
                                  alt="Aperçu du segment"
                                  className="w-full h-20 object-cover rounded border bg-gray-100"
                                />
                                <button
                                  onClick={() => updateSegment(segment.id, { imageUrl: undefined, contentType: 'text' })}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                  title="Supprimer l'image"
                                >
                                  ×
                                </button>
                              </div>
                            )}
                            <p className="text-xs text-gray-500">
                              JPG, PNG, GIF, WebP - Max 5MB
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Couleur */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Couleur
                      </label>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-gray-300 cursor-pointer shadow-sm"
                          style={{ backgroundColor: segment.color }}
                          onClick={() => {
                            const colorInput = document.getElementById(`color-${segment.id}`) as HTMLInputElement;
                            colorInput?.click();
                          }}
                        />
                        <input
                          id={`color-${segment.id}`}
                          type="color"
                          value={segment.color}
                          onChange={(e) => updateSegment(segment.id, { color: e.target.value })}
                          className="hidden"
                        />
                        <input
                          type="text"
                          value={segment.color}
                          onChange={(e) => updateSegment(segment.id, { color: e.target.value })}
                          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#44444d] max-w-20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Attribution de lot */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Lot attribué
                    </label>
                    <select
                      value={segment.prizeId || ''}
                      onChange={(e) => updateSegment(segment.id, { prizeId: e.target.value || undefined })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#44444d] focus:border-transparent"
                    >
                      <option value="">Aucun lot</option>
                      {/* Lots de dotation (prioritaires) */}
                      {dotationPrizes.length > 0 && (
                        <optgroup label="🎁 Lots de dotation">
                          {dotationPrizes.map((prize) => (
                            <option key={prize.id} value={prize.id}>
                              {prize.name} ({prize.attribution?.method === 'calendar' ? '📅 Calendrier' : '🎲 Probabilité'})
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {/* Anciens lots (fallback) */}
                      {prizes.length > 0 && (
                        <optgroup label="📦 Lots classiques">
                          {prizes.map((prize) => (
                            <option key={prize.id} value={prize.id}>
                              {prize.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    {dotationPrizes.length === 0 && prizes.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Créez des lots dans "Paramètres" → "Dotation"
                      </p>
                    )}
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
            <h3 className="text-lg font-medium text-gray-900">
              Lots à gagner ({prizes.length})
            </h3>
            <button
              onClick={addPrize}
              className="flex items-center px-3 py-2 bg-[#44444d] text-white text-sm rounded-lg hover:bg-[#5a5a63] transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Créer un lot
            </button>
          </div>

          {prizes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Gift className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucun lot configuré</p>
              <p className="text-sm">Cliquez sur "Créer un lot" pour commencer</p>
            </div>
          ) : (
            <div className="space-y-4">
              {prizes.map((prize, index) => (
                <div key={prize.id} className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">
                      Lot {index + 1}
                    </span>
                    <button
                      onClick={() => removePrize(prize.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Nom et description */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Nom du lot
                        </label>
                        <input
                          type="text"
                          value={prize.name}
                          onChange={(e) => updatePrize(prize.id, { name: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#44444d] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Quantité
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={prize.totalUnits || 1}
                          onChange={(e) => updatePrize(prize.id, { totalUnits: Number(e.target.value) || 1 })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#44444d] focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Méthode d'attribution */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Méthode d'attribution
                      </label>
                      <div className="flex space-x-3">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`attribution-${prize.id}`}
                            value="probability"
                            checked={prize.attributionMethod === 'probability'}
                            onChange={(e) => updatePrize(prize.id, { attributionMethod: 'probability' })}
                            className="mr-2"
                          />
                          <Percent className="w-4 h-4 mr-1" />
                          <span className="text-sm">Probabilité</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`attribution-${prize.id}`}
                            value="calendar"
                            checked={prize.attributionMethod === 'calendar'}
                            onChange={(e) => updatePrize(prize.id, { attributionMethod: 'calendar' })}
                            className="mr-2"
                          />
                          <Calendar className="w-4 h-4 mr-1" />
                          <span className="text-sm">Calendrier</span>
                        </label>
                      </div>
                    </div>

                    {/* Configuration selon la méthode */}
                    {prize.attributionMethod === 'probability' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Probabilité (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={prize.probability || 0}
                            onChange={(e) => updatePrize(prize.id, { probability: Number(e.target.value) })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#44444d] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Segment associé
                          </label>
                          <select
                            value={prize.segmentId || ''}
                            onChange={(e) => updatePrize(prize.id, { segmentId: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#44444d] focus:border-transparent"
                          >
                            <option value="">Aucun segment</option>
                            {segments.map((segment) => (
                              <option key={segment.id} value={segment.id}>
                                {segment.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {prize.attributionMethod === 'calendar' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            Date d'attribution
                          </label>
                          <input
                            type="date"
                            value={prize.calendarDate || ''}
                            onChange={(e) => updatePrize(prize.id, { calendarDate: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#44444d] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            <Clock className="w-3 h-3 inline mr-1" />
                            Heure d'attribution
                          </label>
                          <input
                            type="time"
                            value={prize.calendarTime || ''}
                            onChange={(e) => updatePrize(prize.id, { calendarTime: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#44444d] focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
        </>
      )}

      {/* Configuration pour Jackpot */}
      {gameType === 'jackpot' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">🎰 Configuration Jackpot</h3>
            <p className="text-sm text-gray-600">
              Le jackpot est un jeu de machine à sous avec des symboles qui tournent. Configurez les symboles et les gains dans l'éditeur principal.
            </p>
          </div>
        </div>
      )}

      {/* Configuration pour Carte à Gratter */}
      {gameType === 'scratch' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">🎫 Configuration Carte à Gratter</h3>
            <p className="text-sm text-gray-600">
              Les cartes à gratter permettent aux joueurs de gratter virtuellement pour découvrir s'ils ont gagné. Configurez les cartes et les gains dans l'éditeur principal.
            </p>
          </div>
        </div>
      )}

      {/* Configuration pour Quiz */}
      {gameType === 'quiz' && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">📝 Configuration Quiz</h3>
            <p className="text-sm text-gray-600">
              Le quiz permet de poser des questions aux participants. Configurez les questions, les réponses et le scoring dans l'éditeur principal.
            </p>
          </div>
        </div>
      )}

      {/* Configuration pour Formulaire */}
      {gameType === 'form' && (
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">📋 Configuration Formulaire</h3>
            <p className="text-sm text-gray-600">
              Le formulaire permet de collecter des informations auprès des participants. Configurez les champs dans l'onglet "Formulaire".
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameManagementPanel;
