import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCampaignSettings, CampaignSettings } from '@/hooks/useCampaignSettings';

const QualificationStep: React.FC = () => {
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
      const next: any = { ...(prev || {}) };
      const keys = path.split('.');
      let ref = next;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        ref[k] = ref[k] ?? {};
        ref = ref[k];
      }
      ref[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleSave = async () => {
    if (!campaignId) return;
    const saved = await upsertSettings(campaignId, {
      advanced: { ...(form.advanced || {}), qualification: (form as any)?.advanced?.qualification || { rules: [] } }
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

  return (
    <div className="space-y-6">
      <div aria-hidden className="h-[1.75rem]" />
      {error && (<div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>)}

      <div>
        <h2 className="font-semibold mb-2">Règles</h2>
        <textarea
          rows={4}
          className="w-full px-3 py-2 border border-primary-200 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          value={JSON.stringify((form as any)?.advanced?.qualification || { rules: [] }, null, 2)}
          onChange={e => {
            try { handleChange('advanced.qualification', JSON.parse(e.target.value || '{}')); } catch {}
          }}
        />
      </div>

    </div>
  );
};

export default QualificationStep;

