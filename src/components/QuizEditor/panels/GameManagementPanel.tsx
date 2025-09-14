// @ts-nocheck
import React, { useState, useCallback, useMemo, memo } from 'react';
import { Plus, Trash2, Edit3, Calendar, Percent, Trophy, Info, Upload, Image, ChevronDown, ChevronUp, X, Settings } from 'lucide-react';
import { ColorPicker } from '../../shared/ColorPicker';

// Interfaces locales
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
  description: string;
  totalUnits: number;
  awardedUnits: number;
  method: 'calendar' | 'probability';
  attributionMethod: 'calendar' | 'probability';
  probabilityPercent?: number;
  calendarDate?: string;
  calendarTime?: string;
  probability?: number;
  segmentId?: string;
}

interface GameManagementPanelProps {
  onBack: () => void;
  segments: WheelSegment[];
  onUpdateSegments: (segments: WheelSegment[]) => void;
  prizes: Prize[];
  onUpdatePrizes: (prizes: Prize[]) => void;
  gameType: 'wheel' | 'quiz' | 'scratch';
}

const GameManagementPanel = memo<GameManagementPanelProps>(({ 
  onBack, 
  segments, 
  onUpdateSegments, 
  prizes, 
  onUpdatePrizes, 
  gameType = 'wheel' 
}) => {
  const [activeView, setActiveView] = useState<'segments' | 'prizes'>('segments');
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [selectedPrizeId, setSelectedPrizeId] = useState<string | null>(null);
  const [showImageUpload, setShowImageUpload] = useState<string | null>(null);

  const gameLabels = {
    wheel: {
      segments: 'Segments de la roue',
      prizes: 'Lots disponibles',
      addSegment: 'Ajouter un segment',
      segmentLabel: 'Libellé du segment',
      probability: 'Probabilité (%)',
      colors: 'Couleurs des segments'
    },
    quiz: {
      segments: 'Réponses du quiz',
      prizes: 'Récompenses disponibles',
      addSegment: 'Ajouter une réponse',
      segmentLabel: 'Texte de la réponse',
      probability: 'Probabilité de gain (%)',
      colors: 'Couleurs des réponses'
    },
    scratch: {
      segments: 'Cartes à gratter',
      prizes: 'Gains cachés',
      addSegment: 'Ajouter une carte',
      segmentLabel: 'Contenu de la carte',
      probability: 'Chance de gain (%)',
      colors: 'Couleurs des cartes'
    }
  };

  const labels = gameLabels[gameType] || gameLabels.wheel;

  // Gestion des segments
  const addSegment = () => {
    const newSegment: WheelSegment = {
      id: Date.now().toString(),
      label: `Nouveau ${gameType === 'wheel' ? 'segment' : gameType === 'quiz' ? 'réponse' : 'carte'} ${segments.length + 1}`,
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
      probability: 10,
      contentType: 'text'
    };
    onUpdateSegments([...segments, newSegment]);
  };

  const updateSegment = (segmentId: string, updates: Partial<WheelSegment>) => {
    const updatedSegments = segments.map(segment => 
      segment.id === segmentId ? { ...segment, ...updates } : segment
    );
    onUpdateSegments(updatedSegments);
  };

  const deleteSegment = (segmentId: string) => {
    const updatedSegments = segments.filter(segment => segment.id !== segmentId);
    onUpdateSegments(updatedSegments);
    if (selectedSegmentId === segmentId) {
      setSelectedSegmentId(null);
    }
  };

  // Gestion des lots
  const addPrize = () => {
    const newPrize: Prize = {
      id: Date.now().toString(),
      name: 'Nouveau lot',
      description: '',
      totalUnits: 1,
      awardedUnits: 0,
      method: 'probability',
      attributionMethod: 'probability',
      probabilityPercent: 10
    };
    onUpdatePrizes([...prizes, newPrize]);
  };

  const updatePrize = (prizeId: string, updates: Partial<Prize>) => {
    const updatedPrizes = prizes.map(prize => 
      prize.id === prizeId ? { ...prize, ...updates } : prize
    );
    onUpdatePrizes(updatedPrizes);
  };

  const deletePrize = (prizeId: string) => {
    const updatedPrizes = prizes.filter(prize => prize.id !== prizeId);
    onUpdatePrizes(updatedPrizes);
    if (selectedPrizeId === prizeId) {
      setSelectedPrizeId(null);
    }
  };

  const handleImageUpload = (segmentId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      updateSegment(segmentId, { 
        imageUrl: e.target?.result as string,
        contentType: 'image'
      });
      setShowImageUpload(null);
    };
    reader.readAsDataURL(file);
  };

  // Calcul des probabilités totales
  const totalProbability = useMemo(() => {
    return segments.reduce((sum, segment) => sum + (segment.probability || 0), 0);
  }, [segments]);

  const totalPrizeProbability = useMemo(() => {
    return prizes.reduce((sum, prize) => sum + (prize.probabilityPercent || 0), 0);
  }, [prizes]);

  return (
    <div className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center px-3 py-2 text-sm rounded-md bg-white border hover:bg-gray-50 text-gray-700"
          >
            <ChevronDown className="w-4 h-4 mr-2 rotate-90" />
            Retour
          </button>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveView('segments')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeView === 'segments' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {labels.segments}
            </button>
            <button
              onClick={() => setActiveView('prizes')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeView === 'prizes' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {labels.prizes}
            </button>
          </div>
        </div>

        {/* Vue Segments */}
        {activeView === 'segments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">{labels.segments}</h3>
              <button
                onClick={addSegment}
                className="inline-flex items-center px-2 py-1 text-xs bg-[hsl(var(--primary))] text-white rounded-md hover:bg-[hsl(var(--primary-dark))]"
              >
                <Plus className="w-3 h-3 mr-1" />
                {labels.addSegment}
              </button>
            </div>

            {totalProbability !== 100 && totalProbability > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center">
                  <Info className="w-4 h-4 text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-800">
                    Total des probabilités : {totalProbability.toFixed(1)}% (recommandé : 100%)
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {segments.map((segment, index) => (
                <div key={segment.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Libellé */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          {labels.segmentLabel}
                        </label>
                        <input
                          type="text"
                          value={segment.label}
                          onChange={(e) => updateSegment(segment.id, { label: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
                        />
                      </div>

                      <div className="flex gap-3">
                        {/* Couleur */}
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Couleur
                          </label>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-md border-2 border-gray-300 cursor-pointer"
                              style={{ backgroundColor: segment.color }}
                              onClick={() => setSelectedSegmentId(selectedSegmentId === segment.id ? null : segment.id)}
                            />
                            <input
                              type="text"
                              value={segment.color}
                              onChange={(e) => updateSegment(segment.id, { color: e.target.value })}
                              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md"
                              placeholder="#ff0000"
                            />
                          </div>
                        </div>

                        {/* Probabilité */}
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            {labels.probability}
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={segment.probability || 0}
                            onChange={(e) => updateSegment(segment.id, { probability: Number(e.target.value) })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Type de contenu */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Type de contenu
                        </label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateSegment(segment.id, { contentType: 'text', imageUrl: undefined })}
                            className={`px-3 py-1 text-xs rounded-md border ${
                              segment.contentType === 'text'
                                ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            Texte
                          </button>
                          <button
                            onClick={() => setShowImageUpload(segment.id)}
                            className={`px-3 py-1 text-xs rounded-md border ${
                              segment.contentType === 'image'
                                ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <Image className="w-3 h-3 mr-1 inline" />
                            Image
                          </button>
                        </div>
                      </div>

                      {/* Upload d'image */}
                      {showImageUpload === segment.id && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-600 mb-2">Glissez une image ou cliquez pour parcourir</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(segment.id, file);
                            }}
                            className="hidden"
                            id={`image-upload-${segment.id}`}
                          />
                          <label
                            htmlFor={`image-upload-${segment.id}`}
                            className="inline-block px-3 py-1 bg-[hsl(var(--primary))] text-white text-xs rounded-md cursor-pointer hover:bg-[hsl(var(--primary-dark))]"
                          >
                            Parcourir
                          </label>
                        </div>
                      )}

                      {/* Aperçu de l'image */}
                      {segment.imageUrl && (
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                          <img
                            src={segment.imageUrl}
                            alt="Aperçu"
                            className="w-8 h-8 rounded object-cover"
                          />
                          <span className="text-xs text-gray-600 flex-1 ml-2">Image uploadée</span>
                          <button
                            onClick={() => updateSegment(segment.id, { imageUrl: undefined, contentType: 'text' })}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="ml-3 flex flex-col gap-1">
                      <button
                        onClick={() => deleteSegment(segment.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Color Picker */}
                  {selectedSegmentId === segment.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <ColorPicker
                        color={segment.color}
                        onChange={(color) => updateSegment(segment.id, { color })}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {segments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Aucun segment configuré</p>
                <p className="text-xs mt-1">Cliquez sur "{labels.addSegment}" pour commencer</p>
              </div>
            )}
          </div>
        )}

        {/* Vue Lots/Récompenses */}
        {activeView === 'prizes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">{labels.prizes}</h3>
              <button
                onClick={addPrize}
                className="inline-flex items-center px-2 py-1 text-xs bg-[hsl(var(--primary))] text-white rounded-md hover:bg-[hsl(var(--primary-dark))]"
              >
                <Plus className="w-3 h-3 mr-1" />
                Ajouter un lot
              </button>
            </div>

            {totalPrizeProbability !== 100 && totalPrizeProbability > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center">
                  <Info className="w-4 h-4 text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-800">
                    Total des probabilités : {totalPrizeProbability.toFixed(1)}% (recommandé : 100%)
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {prizes.map((prize) => (
                <div key={prize.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Nom du lot */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nom du lot
                        </label>
                        <input
                          type="text"
                          value={prize.name}
                          onChange={(e) => updatePrize(prize.id, { name: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={prize.description || ''}
                          onChange={(e) => updatePrize(prize.id, { description: e.target.value })}
                          rows={2}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
                          placeholder="Description du lot..."
                        />
                      </div>

                      <div className="flex gap-3">
                        {/* Méthode d'attribution */}
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Méthode d'attribution
                          </label>
                          <select
                            value={prize.method || prize.attributionMethod || 'probability'}
                            onChange={(e) => updatePrize(prize.id, { 
                              method: e.target.value as 'calendar' | 'probability',
                              attributionMethod: e.target.value as 'calendar' | 'probability'
                            })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
                          >
                            <option value="probability">Probabilité</option>
                            <option value="calendar">Calendrier</option>
                          </select>
                        </div>

                        {/* Unités disponibles */}
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Unités disponibles
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={prize.totalUnits || 1}
                            onChange={(e) => updatePrize(prize.id, { totalUnits: Number(e.target.value) || 1 })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Configuration spécifique à la méthode */}
                      {(prize.method || prize.attributionMethod) === 'probability' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Probabilité (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={prize.probabilityPercent || prize.probability || 0}
                            onChange={(e) => updatePrize(prize.id, { 
                              probabilityPercent: Number(e.target.value),
                              probability: Number(e.target.value)
                            })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
                          />
                        </div>
                      )}

                      {(prize.method || prize.attributionMethod) === 'calendar' && (
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Date
                            </label>
                            <input
                              type="date"
                              value={prize.calendarDate || ''}
                              onChange={(e) => updatePrize(prize.id, { calendarDate: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Heure
                            </label>
                            <input
                              type="time"
                              value={prize.calendarTime || ''}
                              onChange={(e) => updatePrize(prize.id, { calendarTime: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
                            />
                          </div>
                        </div>
                      )}

                      {/* Statistiques */}
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Attribués:</span>
                          <span className="font-medium">{prize.awardedUnits || 0}/{prize.totalUnits || 1}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                          <div 
                            className="bg-[hsl(var(--primary))] h-1 rounded-full transition-all"
                            style={{ 
                              width: `${Math.min(((prize.awardedUnits || 0) / (prize.totalUnits || 1)) * 100, 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="ml-3 flex flex-col gap-1">
                      <button
                        onClick={() => deletePrize(prize.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {prizes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Aucun lot configuré</p>
                <p className="text-xs mt-1">Cliquez sur "Ajouter un lot" pour commencer</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

GameManagementPanel.displayName = 'GameManagementPanel';

export default GameManagementPanel;
