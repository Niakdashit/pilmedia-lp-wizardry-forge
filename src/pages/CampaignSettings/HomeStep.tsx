import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCampaignSettings, CampaignSettings } from '@/hooks/useCampaignSettings';

const HomeStep: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSettings, upsertSettings, loading, error, saveDraft } = useCampaignSettings();
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

  const handleSave = async (goNext = false) => {
    if (!campaignId) return;
    const saved = await upsertSettings(campaignId, {
      publication: form.publication ?? {},
      advanced: {
        ...(form.advanced || {}),
        home: { language: (form as any)?.advanced?.home?.language || 'fr' }
      }
    });
    if (saved) {
      if (goNext) navigate('prizes');
    } else {
      try { saveDraft(campaignId, form); } catch {}
      alert('Sauvegarde distante échouée, un brouillon local a été enregistré.');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold font-brand text-primary-800">Accueil</h1>
      {error && (<div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>)}

      <div>
        <h2 className="font-semibold mb-2">Langue</h2>
        <select
          className="px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          value={(form as any)?.advanced?.home?.language || 'fr'}
          onChange={e => handleChange('advanced.home.language', e.target.value)}
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button onClick={() => navigate('')} className="px-3 py-1.5 border border-primary-200 rounded-lg text-sm text-primary-700 hover:bg-primary-50">Précédent</button>
        <button onClick={() => handleSave(false)} disabled={loading} className="px-3 py-1.5 rounded-lg text-white text-sm bg-primary-700 hover:bg-primary-800 disabled:opacity-60">{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
        <button onClick={() => handleSave(true)} disabled={loading} className="px-3 py-1.5 rounded-lg text-white text-sm bg-brand hover:bg-brand-dark disabled:opacity-60">{loading ? 'Enregistrement...' : 'Enregistrer et continuer'}</button>
      </div>
    </div>
  );
};

export default HomeStep;
