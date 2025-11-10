// @ts-nocheck
/**
 * Modal de création/édition d'un lot
 * Avec assignation aux segments de roue
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Prize } from '@/types/dotation';

interface PrizeModalProps {
  prize?: Prize | null;
  segments: Array<{ id: string; label: string }>;
  onSave: (prize: Prize) => void;
  onClose: () => void;
}

const PrizeModal: React.FC<PrizeModalProps> = ({
  prize,
  segments,
  onSave,
  onClose
}) => {
  const [tab, setTab] = useState<'general' | 'attribution' | 'segments'>('general');
  const [formData, setFormData] = useState<Partial<Prize>>({
    id: prize?.id || `prize-${Date.now()}`,
    name: prize?.name || '',
    description: prize?.description || '',
    value: prize?.value || '',
    imageUrl: prize?.imageUrl || '',
    totalQuantity: prize?.totalQuantity || 1,
    awardedQuantity: prize?.awardedQuantity || 0,
    status: prize?.status || 'active',
    priority: prize?.priority || 0,
    assignedSegments: prize?.assignedSegments || [],
    attribution: prize?.attribution || {
      method: 'probability',
      winProbability: 100
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.totalQuantity) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    onSave(formData as Prize);
  };

  const handleSegmentToggle = (segmentId: string) => {
    const current = formData.assignedSegments || [];
    const updated = current.includes(segmentId)
      ? current.filter(id => id !== segmentId)
      : [...current, segmentId];
    
    setFormData({ ...formData, assignedSegments: updated });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
            {prize ? 'Modifier le lot' : 'Créer un lot'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6">
          {[
            { key: 'general', label: 'Informations générales' },
            { key: 'attribution', label: "Méthode d'attribution" },
            { key: 'segments', label: 'Segments de roue 🎯' }
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Tab: Général */}
            {tab === 'general' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nom du lot *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Ex: iPhone 15 Pro"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    rows={3}
                    placeholder="Description du lot..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Quantité totale *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.totalQuantity}
                      onChange={(e) => setFormData({ ...formData, totalQuantity: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Valeur (affichage)
                    </label>
                    <input
                      type="text"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Ex: 1000€"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Statut
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="active">Actif</option>
                    <option value="paused">En pause</option>
                    <option value="scheduled">Programmé</option>
                    <option value="exhausted">Épuisé</option>
                  </select>
                </div>
              </>
            )}

            {/* Tab: Attribution */}
            {tab === 'attribution' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Méthode d'attribution
                  </label>
                  <select
                    value={formData.attribution?.method}
                    onChange={(e) => setFormData({
                      ...formData,
                      attribution: {
                        ...formData.attribution,
                        method: e.target.value as any
                      }
                    })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="probability">🎲 Probabilité (% de chance)</option>
                    <option value="calendar">📅 Calendrier (date/heure)</option>
                    <option value="quota">📊 Quota (X gagnants sur Y)</option>
                    <option value="rank">🏆 Rang (Nième participant)</option>
                    <option value="instant_win">⚡ Gain instantané</option>
                  </select>
                </div>

                {/* Probabilité */}
                {formData.attribution?.method === 'probability' && (
                  <>
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <p className="text-sm text-foreground">
                        Chaque participant a X% de chance de gagner ce lot.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Probabilité de gain (%) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.attribution.winProbability || 0}
                        onChange={(e) => setFormData({
                          ...formData,
                          attribution: {
                            ...formData.attribution,
                            method: 'probability',
                            winProbability: parseFloat(e.target.value)
                          }
                        })}
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Ex: 10 = 10% de chance"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Ex: 10 = 10% de chance de gagner
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Nombre maximum de gagnants (optionnel)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.attribution.maxWinners || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          attribution: {
                            ...formData.attribution,
                            method: 'probability',
                            maxWinners: e.target.value ? parseInt(e.target.value) : undefined
                          }
                        })}
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Illimité"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Laissez vide pour illimité (limité par le stock)
                      </p>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Tab: Segments */}
            {tab === 'segments' && (
              <>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
                  <p className="text-sm text-foreground font-medium mb-1">
                    🎯 Assignation aux segments
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sélectionnez les segments de la roue qui afficheront ce lot quand le joueur gagne.
                    Si aucun segment n'est sélectionné, ce lot ne pourra pas être attribué via la roue.
                  </p>
                </div>

                {segments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Aucun segment disponible</p>
                    <p className="text-sm mt-1">Configurez d'abord les segments de votre roue</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {segments.map((segment) => (
                      <label
                        key={segment.id}
                        className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.assignedSegments?.includes(segment.id) || false}
                          onChange={() => handleSegmentToggle(segment.id)}
                          className="w-4 h-4 text-primary border-input rounded focus:ring-2 focus:ring-ring"
                        />
                        <span className="text-sm font-medium text-foreground">
                          {segment.label}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {formData.assignedSegments && formData.assignedSegments.length > 0 && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✅ {formData.assignedSegments.length} segment{formData.assignedSegments.length > 1 ? 's' : ''} sélectionné{formData.assignedSegments.length > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              {prize ? 'Enregistrer' : 'Créer le lot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrizeModal;
