import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCampaignSettings, CampaignSettings } from '@/hooks/useCampaignSettings';

const CampaignSettingsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSettings, upsertSettings, loading, error, saveDraft } = useCampaignSettings();

  const [form, setForm] = useState<Partial<CampaignSettings>>({});
  const campaignId = id || '';

  // Load existing settings (or local draft via hook fallback)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!campaignId) return;
      const data = await getSettings(campaignId);
      if (mounted) {
        setForm(data || { campaign_id: campaignId });
      }
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

  const handleTagsChange = (val: string) => {
    const list = val
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    setForm(prev => ({ ...(prev || {}), tags: list }));
  };

  const tagsValue = useMemo(() => (form.tags || []).join(', '), [form.tags]);

  const handleSave = async () => {
    if (!campaignId) return;
    // Persist settings; the hook will clear draft on success
    const saved = await upsertSettings(campaignId, {
      publication: form.publication ?? {},
      campaign_url: form.campaign_url ?? {},
      soft_gate: form.soft_gate ?? {},
      limits: form.limits ?? {},
      email_verification: form.email_verification ?? {},
      legal: form.legal ?? {},
      winners: form.winners ?? {},
      data_push: form.data_push ?? {},
      advanced: form.advanced ?? {},
      opt_in: form.opt_in ?? {},
      tags: form.tags ?? [],
    });
    if (saved) {
      // Navigate back to editor with explicit campaign context
      navigate(`/design-editor?id=${campaignId}`);
    } else {
      // Save a draft locally to avoid data loss
      try { saveDraft(campaignId, form); } catch {}
      alert('Sauvegarde distante échouée, un brouillon local a été enregistré.');
    }
  };

  // Simple Accordion state/component
  const [open, setOpen] = useState<Record<string, boolean>>({
    limites: true,
    classement: false,
    reglement: false,
    gagnants: false,
    push: false,
    avances: false,
  });

  const AccordionItem: React.FC<{ id: string; title: string; children: React.ReactNode }>
    = ({ id, title, children }) => (
    <div className="border border-primary-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(prev => ({ ...prev, [id]: !prev[id] }))}
        className="w-full flex items-center justify-between px-4 py-3 bg-primary-50 hover:bg-primary-100"
        aria-expanded={open[id] ? 'true' : 'false'}
      >
        <span className="font-semibold text-left">{title}</span>
        <span className="text-sm text-gray-500">{open[id] ? 'Réduire' : 'Développer'}</span>
      </button>
      {open[id] && (
        <div className="p-4 space-y-3 bg-white">
          {children}
        </div>
      )}
    </div>
  );

  if (!campaignId) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Paramètres de la campagne</h1>
        <p className="text-sm text-gray-600 mt-2">Identifiant de campagne invalide.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Paramètres de la campagne</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/design-editor?id=${campaignId}`)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            Retour à l'éditeur
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-white text-sm bg-[radial-gradient(circle_at_0%_0%,_#d4dbe8,_#b41b60)] disabled:opacity-60"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* URL de campagne on top */}
        <div>
          <h2 className="font-semibold mb-2">URL de campagne</h2>
          <input
            type="text"
            placeholder="https://votre-campagne.example.com"
            value={(form.campaign_url as any)?.url || ''}
            onChange={e => handleChange('campaign_url.url', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Limites */}
        <AccordionItem id="limites" title="Limites">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Participants max.</label>
              <input
                type="number"
                value={(form.limits as any)?.max_participants ?? ''}
                onChange={e => handleChange('limits.max_participants', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Par utilisateur</label>
              <input
                type="number"
                value={(form.limits as any)?.per_user ?? ''}
                onChange={e => handleChange('limits.per_user', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </AccordionItem>

        {/* Classement des scores */}
        <AccordionItem id="classement" title="Classement des scores">
          <p className="text-sm text-gray-600">Paramètres du classement à venir. Vous pourrez définir ici les règles de tri, d'affichage et d'export du leaderboard.</p>
        </AccordionItem>

        {/* Règlement */}
        <AccordionItem id="reglement" title="Règlement">
          <label className="block text-sm text-gray-600 mb-1">legal (JSON)</label>
          <textarea
            rows={6}
            value={JSON.stringify((form as any).legal ?? {}, null, 2)}
            onChange={e => {
              try {
                const v = JSON.parse(e.target.value || '{}');
                handleChange('legal', v);
              } catch { /* ignore invalid JSON */ }
            }}
            className="w-full px-3 py-2 border rounded-lg font-mono text-xs"
          />
        </AccordionItem>

        {/* Gagnants et Contact */}
        <AccordionItem id="gagnants" title="Gagnants et Contact">
          <label className="block text-sm text-gray-600 mb-1">winners (JSON)</label>
          <textarea
            rows={6}
            value={JSON.stringify((form as any).winners ?? {}, null, 2)}
            onChange={e => {
              try {
                const v = JSON.parse(e.target.value || '{}');
                handleChange('winners', v);
              } catch { /* ignore invalid JSON */ }
            }}
            className="w-full px-3 py-2 border rounded-lg font-mono text-xs"
          />
        </AccordionItem>

        {/* Push de données */}
        <AccordionItem id="push" title="Push de données">
          <label className="block text-sm text-gray-600 mb-1">data_push (JSON)</label>
          <textarea
            rows={6}
            value={JSON.stringify((form as any).data_push ?? {}, null, 2)}
            onChange={e => {
              try {
                const v = JSON.parse(e.target.value || '{}');
                handleChange('data_push', v);
              } catch { /* ignore invalid JSON */ }
            }}
            className="w-full px-3 py-2 border rounded-lg font-mono text-xs"
          />
        </AccordionItem>

        {/* Paramètres avancés */}
        <AccordionItem id="avances" title="Paramètres avancés">
          <div>
            <h3 className="font-medium mb-2">Vérification email</h3>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean((form.email_verification as any)?.required)}
                onChange={e => handleChange('email_verification.required', e.target.checked)}
              />
              Requérir une vérification email
            </label>
          </div>

          <div>
            <h3 className="font-medium mb-2">Opt-in marketing</h3>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean((form.opt_in as any)?.marketing)}
                onChange={e => handleChange('opt_in.marketing', e.target.checked)}
              />
              Activer la case opt-in marketing
            </label>
          </div>

          <div>
            <h3 className="font-medium mb-2">Tags</h3>
            <input
              type="text"
              placeholder="ex: soldes, rentrée, 2025"
              value={tagsValue}
              onChange={e => handleTagsChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <p className="mt-1 text-xs text-gray-500">Séparez les tags par des virgules</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(['publication', 'soft_gate', 'advanced'] as const).map((key) => (
              <div key={key}>
                <label className="block text-sm text-gray-600 mb-1">{key} (JSON)</label>
                <textarea
                  rows={4}
                  value={JSON.stringify((form as any)[key] ?? {}, null, 2)}
                  onChange={e => {
                    try {
                      const v = JSON.parse(e.target.value || '{}');
                      handleChange(key, v);
                    } catch {
                      // keep raw text ignored if invalid JSON
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-lg font-mono text-xs"
                />
              </div>
            ))}
          </div>
        </AccordionItem>
      </div>
    </div>
  );
};

export default CampaignSettingsPage;
