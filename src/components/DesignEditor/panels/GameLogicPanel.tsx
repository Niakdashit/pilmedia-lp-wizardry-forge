import React, { useMemo, useState } from 'react';
import { Gift, Calendar as CalendarIcon, Plus, GripVertical, Pencil, Copy, Trash2, Trophy, Image as ImageIcon } from 'lucide-react';
import { useEditorStore } from '../../../stores/editorStore';
import ImageUpload from '../../common/ImageUpload';
import { getWheelSegments } from '../../../utils/wheelConfig';

type Prize = {
  id: string;
  name: string;
  totalUnits: number;
  awardedUnits: number;
  imageUrl?: string;
  method?: 'immediate' | 'calendar';
  startDate?: string; // YYYY-MM-DD (for calendar method)
  endDate?: string;
};

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
  const prizes: Prize[] = useMemo(() => (campaign?.prizes as Prize[]) || [], [campaign]);
  const showPrizes: boolean = campaign?.showPrizes ?? true;
  // Segments used by the actual wheel rendering (source of truth)
  const segments = useMemo<WheelSegment[]>(
    () => getWheelSegments(campaign) as any,
    [campaign, campaign?._lastUpdate, campaign?.gameConfig?.wheel?.segments, campaign?.config?.roulette?.segments]
  );

  const upsertCampaign = (patch: Partial<any>) =>
    setCampaign((prev: any) => (prev ? { ...prev, ...patch } : prev));

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

  const isValidHex = (v: any) =>
    typeof v === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim());

  // no hex text input anymore; color is edited via native color picker

  const addPrize = () => {
    const newPrize: Prize = {
      id: `prize_${Date.now()}`,
      name: 'Nouveau lot',
      totalUnits: 1,
      awardedUnits: 0,
      method: 'immediate',
    };
    upsertCampaign({ prizes: [...prizes, newPrize] });
    setEditing(newPrize);
    setIsModalOpen(true);
  };

  const updatePrize = (updated: Prize) => {
    const next = prizes.map((p) => (p.id === updated.id ? updated : p));
    upsertCampaign({ prizes: next });
  };

  const duplicatePrize = (id: string) => {
    const src = prizes.find((p) => p.id === id);
    if (!src) return;
    const copy: Prize = { ...src, id: `prize_${Date.now()}` };
    upsertCampaign({ prizes: [...prizes, copy] });
  };

  const deletePrize = (id: string) => {
    const next = prizes.filter((p) => p.id !== id);
    // Remove mapping from wheel segments as well
    const raw = getRawSegments();
    const updated = raw.map((seg: any) =>
      seg?.prizeId === id ? { ...seg, prizeId: undefined } : seg
    );
    upsertCampaign({ prizes: next });
    updateWheelSegments(updated);
  };

  const setShowPrizes = (val: boolean) => upsertCampaign({ showPrizes: val });

  const setSegmentPrize = (index: number, prizeId?: string) => {
    const raw = getRawSegments();
    const newSegments = [...raw];
    if (!newSegments[index]) {
      // If segments aren't initialized, create placeholders to match visual segments
      for (let i = raw.length; i <= index; i++) {
        newSegments[i] = { id: `segment-${i}`, label: `Segment ${i + 1}` };
      }
    }
    newSegments[index] = { ...newSegments[index], prizeId };
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

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Prize | null>(null);

  return (
    <div className="p-4 space-y-6">
      {/* Header with tabs and toggle */}
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
        {/* Toggle moved to the toolbar below */}
      </div>

      {activeTab === 'lots' && (
        <div className="space-y-6">
          {/* Create button centered, then a single radio centered below */}
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              <button
                onClick={addPrize}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-md hover:opacity-90"
              >
                <Plus className="w-4 h-4"/>
                <span>Créer un lot</span>
              </button>
            </div>
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

          {/* Table */}
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
                    <span>Immédiat</span>
                  )}
                </div>
                <div className="flex items-center justify-end space-x-3 text-gray-500">
                  <button className="hover:text-gray-700" onClick={() => { setEditing(p); setIsModalOpen(true); }} title="Éditer">
                    <Pencil className="w-4 h-4"/>
                  </button>
                  <button className="hover:text-gray-700" onClick={() => duplicatePrize(p.id)} title="Dupliquer">
                    <Copy className="w-4 h-4"/>
                  </button>
                  <button className="hover:text-red-600" onClick={() => deletePrize(p.id)} title="Supprimer">
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            ))}
            {prizes.length === 0 && (
              <div className="px-4 py-8 text-sm text-gray-500">Aucun lot</div>
            )}
          </div>

          {/* Wheel segments assignment (one per row) */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Affectation des lots à la roue</div>
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
                      onChange={(e) => setSegmentPrize(idx, e.target.value || undefined)}
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
          <div className="text-sm text-gray-600">Planifiez la disponibilité des lots.</div>
          {prizes.map((p) => (
            <div key={p.id} className="border border-gray-200 rounded-md p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                <Gift className="w-4 h-4"/>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">{p.name}</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Début</label>
                    <input
                      type="date"
                      value={p.startDate || ''}
                      onChange={(e) => updatePrize({ ...p, method: 'calendar', startDate: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Fin</label>
                    <input
                      type="date"
                      value={p.endDate || ''}
                      onChange={(e) => updatePrize({ ...p, method: 'calendar', endDate: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          {prizes.length === 0 && (
            <div className="text-sm text-gray-500">Aucun lot créé pour le moment.</div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-5">
            <div className="text-base font-semibold mb-4">{editing ? 'Éditer le lot' : 'Créer un lot'}</div>
            <div className="space-y-3">
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
                  value={editing.method || 'immediate'}
                  onChange={(e) => setEditing({ ...editing, method: e.target.value as Prize['method'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="immediate">Immédiat</option>
                  <option value="calendar">Calendrier</option>
                </select>
              </div>
              {editing.method === 'calendar' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Début</label>
                    <input
                      type="date"
                      value={editing.startDate || ''}
                      onChange={(e) => setEditing({ ...editing, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Fin</label>
                    <input
                      type="date"
                      value={editing.endDate || ''}
                      onChange={(e) => setEditing({ ...editing, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="mt-5 flex items-center justify-end space-x-2">
              <button
                className="px-4 py-2 rounded border border-gray-300 text-gray-700"
                onClick={() => { setIsModalOpen(false); setEditing(null); }}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 rounded bg-[hsl(var(--primary))] text-white"
                onClick={() => { if (editing) updatePrize(editing); setIsModalOpen(false); setEditing(null); }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameLogicPanel;