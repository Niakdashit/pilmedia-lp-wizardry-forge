import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCampaignSettings, CampaignSettings } from '@/hooks/useCampaignSettings';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { isTempCampaignId } from '@/utils/tempCampaignId';

const HomeStep: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSettings, upsertSettings, error, saveDraft } = useCampaignSettings();
  const [form, setForm] = useState<Partial<CampaignSettings>>({});
  const [copied, setCopied] = useState(false);
  const campaignId = id || '';
  
  // Construire l'URL publique
  const publicUrl = campaignId && !isTempCampaignId(campaignId)
    ? `${window.location.origin}/campaign/${campaignId}`
    : null;

  const handleCopyUrl = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  // Listen to global save-and-close action from layout
  useEffect(() => {
    const onSaveAndClose = (_e: Event) => {
      // Persist without navigating; layout handles navigation after dispatch
      handleSave(false);
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

      {/* URL Publique */}
      {publicUrl ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                URL publique de votre campagne
              </h3>
              <p className="text-xs text-blue-700 mb-3">
                Partagez ce lien pour que vos participants accèdent à la campagne en direct.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded text-sm font-mono text-blue-900"
                />
                <button
                  onClick={handleCopyUrl}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copié !' : 'Copier'}
                </button>
              </div>
            </div>
          </div>
          <div className="text-xs text-blue-600 bg-blue-100 rounded p-2">
            💡 <strong>Important :</strong> Les URLs commençant par <code className="bg-blue-200 px-1 rounded">temp-</code> sont réservées à l'éditeur et ne sont pas accessibles publiquement.
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            ⚠️ Cette campagne est un brouillon temporaire. Sauvegardez-la pour obtenir une URL publique définitive.
          </p>
        </div>
      )}

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
    </div>
  );
};

export default HomeStep;
