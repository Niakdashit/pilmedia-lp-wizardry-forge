import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCampaignSettings, CampaignSettings } from '@/hooks/useCampaignSettings';
import { Plus, Trash2, Calendar, Clock, Package, AlertCircle } from 'lucide-react';

export interface TimedPrize {
  id: string;
  name: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  windowDuration: number; // en minutes (ex: 5 pour une fenêtre de 5 min)
  enabled: boolean;
}

const DotationStep: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getSettings, upsertSettings, error, saveDraft } = useCampaignSettings();
  const [form, setForm] = useState<Partial<CampaignSettings>>({});
  const campaignId = id || '';

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!campaignId) return;
      const data = await getSettings(campaignId);
      if (mounted) setForm(data || { campaign_id: campaignId });
    })();
    return () => { mounted = false; };
  }, [campaignId, getSettings]);

  const handleChange = (path: string, value: any) => {
    setForm(prev => {
      const next: any = JSON.parse(JSON.stringify(prev || {})); // Clone profond
      const keys = path.split('.');
      let ref = next;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        ref[k] = ref[k] ?? {};
        ref = ref[k];
      }
      ref[keys[keys.length - 1]] = value;
      console.log('📝 [DotationStep] handleChange:', path, value);
      return next;
    });
  };

  const handleSave = async () => {
    if (!campaignId) return;
    console.log('💾 [DotationStep] Saving dotation:', (form as any)?.dotation);
    const saved = await upsertSettings(campaignId, {
      dotation: (form as any)?.dotation,
    });
    if (!saved) {
      try { saveDraft(campaignId, form); } catch {}
      alert('Sauvegarde distante échouée, un brouillon local a été enregistré.');
    }
  };

  // Listen to global save-and-close action from layout
  useEffect(() => {
    const onSaveAndClose = (_e: Event) => {
      handleSave();
    };
    window.addEventListener('campaign:saveAndClose', onSaveAndClose as EventListener);
    return () => {
      window.removeEventListener('campaign:saveAndClose', onSaveAndClose as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, form]);

  const baseProbability = ((form as any)?.dotation?.base_probability ?? 10);
  const timedPrizes: TimedPrize[] = ((form as any)?.dotation?.timed_prizes ?? []);

  const addPrize = () => {
    const newPrize: TimedPrize = {
      id: `prize-${Date.now()}`,
      name: '',
      description: '',
      date: '',
      time: '',
      windowDuration: 5, // 5 minutes par défaut
      enabled: true
    };
    console.log('🎁 [DotationStep] Adding prize:', newPrize);
    handleChange('dotation.timed_prizes', [...timedPrizes, newPrize]);
  };

  const updatePrize = (index: number, field: keyof TimedPrize, value: any) => {
    const updated = [...timedPrizes];
    updated[index] = { ...updated[index], [field]: value };
    console.log(`🎁 [DotationStep] Updating prize ${index}, field ${field}:`, value);
    handleChange('dotation.timed_prizes', updated);
  };

  const deletePrize = (index: number) => {
    const updated = timedPrizes.filter((_, i) => i !== index);
    console.log('🗑️ [DotationStep] Deleting prize:', index);
    handleChange('dotation.timed_prizes', updated);
  };

  return (
    <div className="space-y-6 pb-20">
      <div aria-hidden className="h-[1.75rem]" />
      {error && (
        <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Système Hybride de Dotation</p>
            <p className="text-blue-700">
              Ce système combine une <strong>probabilité de base</strong> constante avec des <strong>fenêtres temporelles gagnantes</strong>.
              Tous les participants ont une chance de gagner grâce à la probabilité de base, et des lots garantis sont distribués aux moments programmés.
            </p>
          </div>
        </div>
      </div>

      {/* Probabilité de Base */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-purple-600" />
          Probabilité de Base
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Pourcentage de chance de gagner pour tous les participants, en dehors des fenêtres programmées.
        </p>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="100"
            value={baseProbability}
            onChange={e => handleChange('dotation.base_probability', Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="100"
              value={baseProbability}
              onChange={e => handleChange('dotation.base_probability', Number(e.target.value))}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-gray-600 font-medium">%</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Recommandation : 5-15% pour un bon équilibre entre engagement et budget
        </p>
      </div>

      {/* Lots Programmés */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Lots Programmés (Instants Gagnants)
          </h2>
          <button
            onClick={addPrize}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Ajouter un lot
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Durant les fenêtres temporelles définies, la probabilité de gain passe à <strong>100%</strong>. 
          Le premier participant dans la fenêtre remporte le lot, puis la mécanique normale reprend.
        </p>

        {timedPrizes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Aucun lot programmé</p>
            <p className="text-xs mt-1">Cliquez sur "Ajouter un lot" pour créer un instant gagnant</p>
          </div>
        ) : (
          <div className="space-y-4">
            {timedPrizes.map((prize, index) => (
              <div
                key={prize.id}
                className={`border rounded-lg p-4 ${
                  prize.enabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Enable Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={prize.enabled}
                      onChange={e => updatePrize(index, 'enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>

                  {/* Prize Details */}
                  <div className="flex-1 space-y-3">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Nom du lot *
                      </label>
                      <input
                        type="text"
                        value={prize.name}
                        onChange={e => updatePrize(index, 'name', e.target.value)}
                        placeholder="Ex: iPhone 15 Pro"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!prize.enabled}
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Description (optionnel)
                      </label>
                      <input
                        type="text"
                        value={prize.description || ''}
                        onChange={e => updatePrize(index, 'description', e.target.value)}
                        placeholder="Ex: iPhone 15 Pro 256Go, Titane Naturel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!prize.enabled}
                      />
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Date *
                        </label>
                        <input
                          type="date"
                          value={prize.date}
                          onChange={e => updatePrize(index, 'date', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={!prize.enabled}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Heure *
                        </label>
                        <input
                          type="time"
                          value={prize.time}
                          onChange={e => updatePrize(index, 'time', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={!prize.enabled}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Fenêtre (min)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={prize.windowDuration}
                          onChange={e => updatePrize(index, 'windowDuration', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={!prize.enabled}
                        />
                      </div>
                    </div>

                    {/* Info Window */}
                    {prize.date && prize.time && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-800">
                        <strong>Fenêtre gagnante :</strong> De {prize.time} à{' '}
                        {(() => {
                          const [h, m] = prize.time.split(':').map(Number);
                          const endTime = new Date(2000, 0, 1, h, m + prize.windowDuration);
                          return `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`;
                        })()}{' '}
                        le {prize.date}
                      </div>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => deletePrize(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-semibold text-sm text-gray-900 mb-2">📊 Résumé de la Dotation</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Probabilité de base :</p>
            <p className="font-bold text-purple-600">{baseProbability}%</p>
          </div>
          <div>
            <p className="text-gray-600">Lots programmés actifs :</p>
            <p className="font-bold text-blue-600">
              {timedPrizes.filter(p => p.enabled && p.name && p.date && p.time).length}
            </p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 18px;
            width: 18px;
            border-radius: 50%;
            background: #9333ea;
            cursor: pointer;
          }
          .slider::-moz-range-thumb {
            height: 18px;
            width: 18px;
            border-radius: 50%;
            background: #9333ea;
            cursor: pointer;
            border: none;
          }
        `
      }} />
    </div>
  );
};

export default DotationStep;
