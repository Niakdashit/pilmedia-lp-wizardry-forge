import React, { useState } from 'react';
import { Gift, Calendar as CalendarIcon, Plus, GripVertical, Pencil, Copy, Trash2, Trophy, Image as ImageIcon } from 'lucide-react';
import { useEditorStore } from '../../../stores/editorStore';
import ImageUpload from '../../common/ImageUpload';
import Modal from '../../common/Modal';
import { usePrizeLogic } from '../../../hooks/usePrizeLogic';
import type { Prize, CampaignConfig } from '../../../types/PrizeSystem';

type WheelSegment = {
  id?: string;
  label?: string;
  color?: string;
  textColor?: string;
  prizeId?: string;
  imageUrl?: string;
};

const GameLogicPanel: React.FC = () => {
  const campaign = useEditorStore((s) => s.campaign as any);
  const setCampaign = useEditorStore((s) => s.setCampaign as any);

  const [activeTab, setActiveTab] = useState<'lots' | 'calendar'>('lots');
  
  // Utiliser le nouveau système centralisé
  const { 
    segments, 
    prizes, 
    validation,
    addPrize, 
    updatePrize, 
    removePrize, 
    duplicatePrize,
    updateSegmentPrize
  } = usePrizeLogic({ 
    campaign: campaign as CampaignConfig, 
    setCampaign 
  });

  const showPrizes: boolean = campaign?.showPrizes ?? true;

  // Fonctions utilitaires
  const upsertCampaign = (patch: Partial<any>) =>
    setCampaign((prev: any) => (prev ? { ...prev, ...patch } : prev));

  const isValidHex = (v: any) =>
    typeof v === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim());

  const setShowPrizes = (val: boolean) => upsertCampaign({ showPrizes: val });

  // Gestion des lots avec le nouveau système
  const handleAddPrize = () => {
    const base = {
      name: 'Nouveau lot',
      totalUnits: 1,
      awardedUnits: 0,
      method: 'probability' as Prize['method'],
      probabilityPercent: 100,
    };
    const newPrizeId = addPrize(base);
    console.log('[GameLogicPanel] Ajouter un lot → id', newPrizeId);
    // Ouvre la modale immédiatement avec l'objet local (l'état global se mettra à jour en parallèle)
    setEditing({ id: newPrizeId, ...base } as Prize);
    setIsModalOpen(true);
  };

  const handleUpdatePrize = (updated: Prize) => {
    updatePrize(updated.id, updated);
  };

  const handleDuplicatePrize = (id: string) => {
    const source = prizes.find((p) => p.id === id);
    const newPrizeId = duplicatePrize(id);
    console.log('[GameLogicPanel] Dupliquer un lot', id, '→', newPrizeId);
    if (source) {
      const duplicated: Prize = { ...source, id: newPrizeId, name: `${source.name} (copie)`, awardedUnits: 0 };
      setEditing(duplicated);
      setIsModalOpen(true);
    }
  };

  const handleRemovePrize = (id: string) => {
    removePrize(id);
  };

  // Gestion des segments - versions simplifiées qui utilisent le setCampaign directement
  const getRawSegments = () =>
    (campaign?.gameConfig?.wheel?.segments || campaign?.config?.roulette?.segments || []) as any[];

  const updateWheelSegments = (newSegments: any[]) => {
    setCampaign((prev: any) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        gameConfig: {
          ...prev.gameConfig,
          wheel: {
            ...prev.gameConfig?.wheel,
            segments: newSegments
          }
        },
        config: {
          ...prev.config,
          roulette: {
            ...prev.config?.roulette,
            segments: newSegments
          }
        },
        _lastUpdate: Date.now()
      };
      return next;
    });
  };

  // Palette de couleurs par défaut
  const colorPalette = ['#44444d', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];

  const setSegmentCount = (targetCount: number) => {
    let count = Math.max(2, Math.floor(targetCount));
    if (count % 2 === 1) count += 1;

    const raw = getRawSegments();
    let next = [...raw];

    if (next.length % 2 === 1) {
      next = next.slice(0, -1);
    }

    if (next.length > count) {
      next = next.slice(0, count);
    }

    while (next.length < count) {
      const idx = next.length;
      const defaultSeg = {
        id: `segment-${idx}`,
        label: `Segment ${idx + 1}`,
        color: colorPalette[idx % colorPalette.length],
        textColor: '#ffffff'
      } as any;
      next.push(defaultSeg);
    }

    if (next.length > count) {
      next = next.slice(0, count);
    }

    updateWheelSegments(next);
  };

  const setSegmentLabel = (index: number, label: string) => {
    const raw = getRawSegments();
    const newSegments = [...raw];
    if (!newSegments[index]) {
      for (let i = raw.length; i <= index; i++) {
        newSegments[i] = { id: `segment-${i}`, label: `Segment ${i + 1}` };
      }
    }
    newSegments[index] = { ...newSegments[index], label };
    updateWheelSegments(newSegments);
  };

  const setSegmentColor = (index: number, color: string) => {
    const raw = getRawSegments();
    const newSegments = [...raw];
    if (!newSegments[index]) {
      for (let i = raw.length; i <= index; i++) {
        newSegments[i] = { id: `segment-${i}`, label: `Segment ${i + 1}` };
      }
    }
    newSegments[index] = { ...newSegments[index], color };
    updateWheelSegments(newSegments);
  };

  const setSegmentImage = (index: number, imageUrl: string) => {
    const raw = getRawSegments();
    const newSegments = [...raw];
    if (!newSegments[index]) {
      for (let i = raw.length; i <= index; i++) {
        newSegments[i] = { id: `segment-${i}`, label: `Segment ${i + 1}` };
      }
    }
    newSegments[index] = { ...newSegments[index], imageUrl };
    updateWheelSegments(newSegments);
  };

  // Appliquer explicitement la configuration des segments à la roue
  const [lastAppliedAt, setLastAppliedAt] = useState<number | null>(null);
  const applySegmentsToWheel = () => {
    const raw = getRawSegments();
    // Re-sauvegarde défensive (clone) + bump _lastUpdate via updateWheelSegments
    const applied = Array.isArray(raw) ? raw.map((s) => ({ ...s })) : [];
    updateWheelSegments(applied);
    setLastAppliedAt(Date.now());
    try {
      console.log('[GameLogicPanel] Segments appliqués à la roue', { count: applied.length });
    } catch {}
  };

  // État de l'édition
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Prize | null>(null);

  // Filtrer les lots de probabilité pour l'affichage
  const probabilityPrizes = prizes.filter(p => p.method === 'probability' || p.method === 'immediate');

  return (
    <div className="p-4 space-y-6">
      {/* Header avec onglets */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button
            className={`pb-2 border-b-2 text-sm font-medium ${
              activeTab === 'lots' ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]' : 'border-transparent text-gray-600'
            }`}
            onClick={() => setActiveTab('lots')}
          >
            <span className="inline-flex items-center"><Gift className="w-4 h-4 mr-2"/>Lots</span>
          </button>
          <button
            className={`pb-2 border-b-2 text-sm font-medium ${
              activeTab === 'calendar' ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]' : 'border-transparent text-gray-600'
            }`}
            onClick={() => setActiveTab('calendar')}
          >
            <span className="inline-flex items-center"><CalendarIcon className="w-4 h-4 mr-2"/>Calendrier</span>
          </button>
        </div>
      </div>

      {activeTab === 'lots' && (
        <div className="space-y-6">
          {/* Bouton d'ajout */}
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              <button
                onClick={handleAddPrize}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" />
                Ajouter un lot
              </button>
            </div>

            {/* Total des probabilités avec validation */}
            {probabilityPrizes.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <span className={validation.totalProbability > 100 ? 'text-red-600' : 'text-gray-600'}>
                  Somme des probabilités: {Math.round(validation.totalProbability)}%
                  {validation.totalProbability > 100 && ' — la somme dépasse 100%, elle sera normalisée'}
                </span>
                {validation.warnings.length > 0 && (
                  <div className="mt-2 text-sm text-yellow-600">
                    {validation.warnings.map((warning, idx) => (
                      <div key={idx}>⚠️ {warning}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-center">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="showPrizesSingleRadio"
                  checked={!!showPrizes}
                  onClick={() => setShowPrizes(!showPrizes)}
                  readOnly
                  className="text-[hsl(var(--primary))]"
                  aria-checked={!!showPrizes}
                />
                Afficher les lots dans la campagne
              </label>
            </div>
          </div>

          {/* Table des lots */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="grid grid-cols-[32px_1fr_160px_120px_132px] items-center bg-gray-50 text-xs font-medium text-gray-600 px-3 py-2">
              <div></div>
              <div>Nom du lot</div>
              <div>Unités gagnées</div>
              <div>Méthode</div>
              <div></div>
            </div>

            {prizes.map((p) => (
              <div key={p.id} className="grid grid-cols-[32px_1fr_160px_120px_132px] items-center px-3 py-3 border-t border-gray-100">
                <div className="text-gray-400"><GripVertical className="w-4 h-4"/></div>
                <div className="flex items-center space-x-3">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt="logo" className="w-8 h-8 rounded object-cover"/>
                  ) : (
                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-4 h-4"/>
                    </div>
                  )}
                  <div className="text-sm text-gray-800">{p.name}</div>
                </div>
                <div className="text-sm text-gray-700 inline-flex items-center">
                  {p.awardedUnits}/{p.totalUnits}
                  <Trophy className="w-4 h-4 text-amber-500 ml-2"/>
                </div>
                <div className="text-sm text-gray-700 inline-flex items-center">
                  {p.method === 'calendar' ? (
                    <span className="inline-flex items-center"><CalendarIcon className="w-4 h-4 mr-1"/>Calendrier</span>
                  ) : (
                    <span>
                      Probabilité{typeof p.probabilityPercent === 'number' ? ` (${p.probabilityPercent}%)` : ''}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-end space-x-3 text-gray-500">
                  <button className="hover:text-gray-700" onClick={() => { setEditing(p); setIsModalOpen(true); }} title="Éditer">
                    <Pencil className="w-4 h-4"/>
                  </button>
                  <button
                    onClick={() => handleDuplicatePrize(p.id)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Dupliquer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemovePrize(p.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {prizes.length === 0 && (
              <div className="px-4 py-8 text-sm text-gray-500">Aucun lot</div>
            )}
          </div>

          {/* Sélecteur du nombre de segments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700">Nombre de segments</div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={2}
                  step={2}
                  value={segments.length || 0}
                  onChange={(e) => setSegmentCount(parseInt(e.target.value || '0', 10))}
                  className="w-24 px-3 py-1 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">La roue fonctionne mieux avec un nombre pair de segments.</p>
          </div>

          {/* Affectation des lots aux segments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700">Affectation des lots à la roue</div>
              <div className="flex items-center gap-2">
                {lastAppliedAt && (
                  <span className="text-xs text-green-600">Segments appliqués</span>
                )}
                <button
                  onClick={applySegmentsToWheel}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[hsl(var(--primary))] text-white hover:opacity-90"
                >
                  Appliquer
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {segments.map((s: WheelSegment, idx: number) => (
                <div key={s.id || idx} className="border border-amber-200 rounded-lg p-3 bg-amber-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="inline-flex items-center text-amber-700 text-xs font-semibold">
                      <Trophy className="w-4 h-4 mr-1"/> Segment {idx + 1}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <input
                      type="text"
                      value={s.label || ''}
                      onChange={(e) => setSegmentLabel(idx, e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder={`Libellé segment ${idx + 1}`}
                    />
                  </div>
                  <div className="flex items-center space-x-3 mb-3">
                    <input
                      type="color"
                      value={isValidHex((s as any).color) ? (s as any).color : '#ffffff'}
                      onChange={(e) => setSegmentColor(idx, e.target.value)}
                      className="w-8 h-8 rounded border"
                      title="Choisir une couleur"
                    />
                    <ImageUpload
                      value={(s as any).imageUrl || ''}
                      onChange={(v) => setSegmentImage(idx, v)}
                      label=""
                      compact
                      accept="image/*"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      value={(s as any).prizeId || ''}
                      onChange={(e) => updateSegmentPrize(idx, e.target.value || undefined)}
                    >
                      <option value="">Aucun lot</option>
                      {prizes.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    {(s as any).prizeId ? (
                      <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-700">1 lot</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">Aucun lot</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {segments.length === 0 && (
              <div className="px-3 py-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded">
                Configurez d'abord les segments dans l'onglet de configuration de la roue.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">Planifiez la disponibilité des lots (seuls les lots en mode calendrier sont listés).</div>
          {prizes.filter((p) => p.method === 'calendar').map((p) => (
            <div key={p.id} className="border border-gray-200 rounded-md p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                <Gift className="w-4 h-4"/>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">{p.name}</div>
                <div className="mt-2 grid grid-cols-1 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Date</label>
                    <input
                      type="date"
                      value={p.startDate || ''}
                      onChange={(e) => handleUpdatePrize({ ...p, startDate: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Heure</label>
                    <input
                      type="time"
                      value={p.startTime || ''}
                      onChange={(e) => handleUpdatePrize({ ...p, startTime: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          {prizes.filter((p) => p.method === 'calendar').length === 0 && (
            <div className="text-sm text-gray-500">Aucun lot en mode calendrier. Passez un lot en « Calendrier » dans l'onglet Lots pour l'afficher ici.</div>
          )}
        </div>
      )}

      {/* Modal d'édition (via Portal) */}
      {isModalOpen && (
        <Modal title="Éditer le lot" onClose={() => { setIsModalOpen(false); setEditing(null); console.log('Closing modal'); }}>
          <div className="space-y-3" id="prize-edit-modal">
            {!editing && (
              <div className="text-sm text-gray-600">Initialisation du lot...</div>
            )}
            {editing && (
            <>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nom du lot</label>
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Unités</label>
                  <input
                    type="number"
                    min={0}
                    value={editing.totalUnits}
                    onChange={(e) => setEditing({ ...editing, totalUnits: Number(e.target.value || 0) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <ImageUpload
                    value={editing.imageUrl || ''}
                    onChange={(v) => setEditing({ ...editing, imageUrl: v })}
                    label="Image"
                    compact
                    accept="image/*"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Méthode</label>
                <select
                  value={(editing.method === 'immediate' ? 'probability' : (editing.method || 'probability'))}
                  onChange={(e) => setEditing({ ...editing, method: e.target.value as Prize['method'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="probability">Probabilité</option>
                  <option value="calendar">Calendrier</option>
                </select>
              </div>
              {editing.method !== 'calendar' && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Probabilité (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={typeof editing.probabilityPercent === 'number' ? editing.probabilityPercent : 100}
                    onChange={(e) => {
                      const raw = Number(e.target.value);
                      const clamped = Math.max(0, Math.min(100, isNaN(raw) ? 0 : raw));
                      setEditing({ ...editing, method: 'probability', probabilityPercent: clamped });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              )}
              {editing.method === 'calendar' && (
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Date</label>
                    <input
                      type="date"
                      value={editing.startDate || ''}
                      onChange={(e) => setEditing({ ...editing, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Heure</label>
                    <input
                      type="time"
                      value={editing.startTime || ''}
                      onChange={(e) => setEditing({ ...editing, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              )}
            </>
            )}
            <div className="mt-3 flex items-center justify-end space-x-2">
              <button
                className="px-4 py-2 rounded border border-gray-300 text-gray-700"
                onClick={() => { setIsModalOpen(false); setEditing(null); }}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 rounded bg-[hsl(var(--primary))] text-white"
                onClick={() => {
                  if (editing) {
                    const payload = {
                      ...editing,
                      method: editing.method === 'immediate' ? 'probability' : editing.method,
                      probabilityPercent:
                        (editing.method === 'probability' || editing.method === 'immediate')
                          ? Math.max(0, Math.min(100, Number(editing.probabilityPercent ?? 100)))
                          : undefined,
                    } as typeof editing;
                    handleUpdatePrize(payload);
                  }
                  setIsModalOpen(false);
                  setEditing(null);
                }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default GameLogicPanel;