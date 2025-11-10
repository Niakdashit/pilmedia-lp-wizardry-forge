import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCampaignSettings, CampaignSettings } from '@/hooks/useCampaignSettings';
import { Plus, Trash2, Calendar, Clock, Gift } from 'lucide-react';

type ControlledProps = {
  form?: Partial<CampaignSettings>;
  setForm?: React.Dispatch<React.SetStateAction<Partial<CampaignSettings>>>;
  campaignId?: string;
};

export interface TimedPrize {
  id: string;
  name: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  enabled: boolean;
}

const DotationStep: React.FC<ControlledProps> = (props) => {
  const { id } = useParams<{ id: string }>();
  const { getSettings, saveDraft } = useCampaignSettings();

  const isControlled = !!props.form && !!props.setForm && !!props.campaignId;
  const [uncontrolledForm, setUncontrolledForm] = useState<Partial<CampaignSettings>>({});
  const form = (isControlled ? props.form! : uncontrolledForm);
  const setForm = (isControlled ? props.setForm! : setUncontrolledForm);
  const campaignId = (isControlled ? props.campaignId! : (id || ''));

  useEffect(() => {
    if (isControlled) return;
    let mounted = true;
    (async () => {
      if (!campaignId) return;
      const data = await getSettings(campaignId);
      if (mounted) {
        setForm(data || { campaign_id: campaignId });
      }
    })();
    return () => { mounted = false; };
  }, [campaignId, getSettings, isControlled, setForm]);

  const timedPrizes: TimedPrize[] = (form as any)?.dotation?.timed_prizes || [];

  const handleChange = (path: string, value: any) => {
    setForm(prev => {
      const next: any = { ...(prev || {}) };
      const keys = path.split('.');
      let ref = next;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        // Clone profond pour éviter les mutations
        ref[k] = { ...(ref[k] || {}) };
        ref = ref[k];
      }
      ref[keys[keys.length - 1]] = value;
      
      console.log('📝 [DotationStep] handleChange called:', { path, value });
      console.log('📝 [DotationStep] Updated form:', next);
      console.log('📝 [DotationStep] Dotation in form:', next.dotation);
      
      return next;
    });
  };

  const addTimedPrize = () => {
    const newPrize: TimedPrize = {
      id: `prize-${Date.now()}`,
      name: '',
      description: '',
      date: '',
      time: '',
      enabled: true,
    };
    const updated = [...timedPrizes, newPrize];
    console.log('🎁 [DotationStep] Adding prize:', newPrize);
    console.log('🎁 [DotationStep] Updated prizes:', updated);
    handleChange('dotation.timed_prizes', updated);
  };

  const updateTimedPrize = (index: number, field: keyof TimedPrize, value: any) => {
    const updated = [...timedPrizes];
    updated[index] = { ...updated[index], [field]: value };
    console.log(`🎁 [DotationStep] Updating prize ${index}, field ${field}:`, value);
    console.log('🎁 [DotationStep] Updated prizes:', updated);
    handleChange('dotation.timed_prizes', updated);
  };

  const removeTimedPrize = (index: number) => {
    const updated = timedPrizes.filter((_, i) => i !== index);
    handleChange('dotation.timed_prizes', updated);
  };

  // Listen to global save-and-close action from layout
  useEffect(() => {
    if (isControlled) return;
    const onSaveAndClose = (_e: Event) => {
      if (campaignId) {
        try { saveDraft(campaignId, form); } catch {}
      }
    };
    window.addEventListener('campaign:saveAndClose', onSaveAndClose as EventListener);
    return () => {
      window.removeEventListener('campaign:saveAndClose', onSaveAndClose as EventListener);
    };
  }, [campaignId, form, isControlled, saveDraft]);

  return (
    <div className="space-y-6">
      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Gift className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">Système de double mécanique</h3>
            <p className="text-sm text-blue-700 leading-relaxed">
              Par défaut, tous les participants tombent sur une mécanique <strong>100% perdante</strong>. 
              Vous pouvez configurer des lots gagnants à des dates et heures précises ci-dessous. 
              Seul le premier participant qui joue exactement à la date et l'heure configurée gagnera le lot.
            </p>
          </div>
        </div>
      </div>

      {/* Timed Prizes Section */}
      <div className="bg-white rounded-lg border border-[hsl(var(--sidebar-border))] shadow-sm">
        <div className="px-4 py-3 bg-[hsl(var(--sidebar-surface))] rounded-t-lg border-b border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-black">Lots programmés</h3>
            <button
              type="button"
              onClick={addTimedPrize}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-[#44444d] rounded-lg hover:opacity-95 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Ajouter un lot
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {timedPrizes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Gift className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Aucun lot programmé</p>
              <p className="text-xs mt-1">Cliquez sur "Ajouter un lot" pour commencer</p>
            </div>
          ) : (
            timedPrizes.map((prize, index) => (
              <div
                key={prize.id}
                className="bg-[hsl(var(--sidebar-surface))] rounded-lg border border-[hsl(var(--sidebar-border))] p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-[#44444d]" />
                    <span className="font-medium text-black">Lot #{index + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prize.enabled}
                        onChange={(e) => updateTimedPrize(index, 'enabled', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-[#44444d] focus:ring-[#44444d]"
                      />
                      <span className="text-sm text-gray-700">Actif</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeTimedPrize(index)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer ce lot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black mb-1.5">
                      Nom du lot
                    </label>
                    <input
                      type="text"
                      value={prize.name}
                      onChange={(e) => updateTimedPrize(index, 'name', e.target.value)}
                      placeholder="Ex: iPhone 15 Pro"
                      className="w-full px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-glow))] focus:border-[hsl(var(--sidebar-glow))] bg-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={prize.description}
                      onChange={(e) => updateTimedPrize(index, 'description', e.target.value)}
                      placeholder="Description du lot..."
                      rows={2}
                      className="w-full px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-glow))] focus:border-[hsl(var(--sidebar-glow))] bg-white resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1.5">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Date d'attribution
                    </label>
                    <input
                      type="date"
                      value={prize.date}
                      onChange={(e) => updateTimedPrize(index, 'date', e.target.value)}
                      className="w-full px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-glow))] focus:border-[hsl(var(--sidebar-glow))] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1.5">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Heure d'attribution
                    </label>
                    <input
                      type="time"
                      value={prize.time}
                      onChange={(e) => updateTimedPrize(index, 'time', e.target.value)}
                      className="w-full px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-glow))] focus:border-[hsl(var(--sidebar-glow))] bg-white"
                    />
                  </div>
                </div>

                {prize.date && prize.time && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                    <p className="text-sm text-green-800">
                      <strong>Attribution prévue :</strong> Le {new Date(prize.date).toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })} à {prize.time}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Warning Section */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
            !
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900 mb-1">Important</h4>
            <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
              <li>Seul le <strong>premier participant</strong> qui joue à la date et l'heure exacte gagnera le lot</li>
              <li>Tous les autres participants (avant ou après) tomberont sur la mécanique perdante</li>
              <li>Une fois le lot attribué, la mécanique perdante reprend jusqu'à la fin de la campagne</li>
              <li>Assurez-vous que les dates et heures sont correctement configurées</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DotationStep;
