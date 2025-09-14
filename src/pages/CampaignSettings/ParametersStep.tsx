import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCampaignSettings, CampaignSettings } from '@/hooks/useCampaignSettings';
import RichTextEditor from '@/components/shared/RichTextEditor';

const ParametersStep: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSettings, upsertSettings, error, saveDraft } = useCampaignSettings();

  const [form, setForm] = useState<Partial<CampaignSettings>>({});
  const campaignId = id || '';

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

  // No tags on this page anymore

  const handleSave = async (goNext = false) => {
    if (!campaignId) return;
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
      if (goNext) navigate('virality');
    } else {
      try { saveDraft(campaignId, form); } catch {}
      alert('Sauvegarde distante échouée, un brouillon local a été enregistré.');
    }
  };

  // Listen to global save-and-close action from layout
  useEffect(() => {
    const onSaveAndClose = (_e: Event) => {
      // Persist without navigating; layout handles navigation
      handleSave(false);
    };
    window.addEventListener('campaign:saveAndClose', onSaveAndClose as EventListener);
    return () => {
      window.removeEventListener('campaign:saveAndClose', onSaveAndClose as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, form]);

  // Accordion state/component
  const [open, setOpen] = useState<Record<string, boolean>>({
    limites: true,
    reglement: false,
  });


  // Tabs for the second accordion
  const [rgcTab, setRgcTab] = useState<'reglement' | 'winners' | 'contact'>('reglement');

  return (
    <div className="space-y-4">
      {error && (
        <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Panel for Limites */}
      <div className="bg-white rounded-lg border border-[hsl(var(--sidebar-border))] shadow-sm">
        <button
          type="button"
          onClick={() => setOpen(prev => ({ ...prev, limites: !prev.limites }))}
          className="w-full flex items-center justify-between px-4 py-3 bg-[hsl(var(--sidebar-surface))] hover:bg-[hsl(var(--sidebar-hover))] rounded-t-lg transition-colors"
          aria-expanded={open.limites ? 'true' : 'false'}
        >
          <span className="font-medium text-black">Limites</span>
          <span className="text-xs text-gray-600">{open.limites ? 'Réduire' : 'Développer'}</span>
        </button>
        {open.limites && (
          <div className="p-4 space-y-4 bg-white rounded-b-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div></div>
                <label className="block text-sm font-medium text-black mb-2">Nombre maximum de participations par personne</label>
                <input
                  type="number"
                  min="1"
                  value={String(((form as any).limits?.max_participations_per_user) ?? '')}
                  onChange={e => handleChange('limits.max_participations_per_user', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-glow))] focus:border-[hsl(var(--sidebar-glow))] bg-[hsl(var(--sidebar-surface))]"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Nombre maximum de gagnants</label>
                <input
                  type="number"
                  min="1"
                  value={String(((form as any).limits?.max_winners) ?? '')}
                  onChange={e => handleChange('limits.max_winners', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-glow))] focus:border-[hsl(var(--sidebar-glow))] bg-[hsl(var(--sidebar-surface))]"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Date de début</label>
                <input
                  type="datetime-local"
                  value={String(((form as any).limits?.start_date) ?? '')}
                  onChange={e => handleChange('limits.start_date', e.target.value)}
                  className="w-full px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-glow))] focus:border-[hsl(var(--sidebar-glow))] bg-[hsl(var(--sidebar-surface))]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Date de fin</label>
                <input
                  type="datetime-local"
                  value={String(((form as any).limits?.end_date) ?? '')}
                  onChange={e => handleChange('limits.end_date', e.target.value)}
                  className="w-full px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-glow))] focus:border-[hsl(var(--sidebar-glow))] bg-[hsl(var(--sidebar-surface))]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panel for Règlement, Gagnants et Contact */}
      <div className="bg-white rounded-lg border border-[hsl(var(--sidebar-border))] shadow-sm">
        <button
          type="button"
          onClick={() => setOpen(prev => ({ ...prev, reglement: !prev.reglement }))}
          className="w-full flex items-center justify-between px-4 py-3 bg-[hsl(var(--sidebar-surface))] hover:bg-[hsl(var(--sidebar-hover))] rounded-t-lg transition-colors"
          aria-expanded={open.reglement ? 'true' : 'false'}
        >
          <span className="font-medium text-black">Règlement, Gagnants et Contact</span>
          <span className="text-xs text-gray-600">{open.reglement ? 'Réduire' : 'Développer'}</span>
        </button>
        {open.reglement && (
          <div className="p-4 space-y-4 bg-white rounded-b-lg">
            <div className="flex items-center bg-[hsl(var(--sidebar-surface))] rounded-lg p-1 border border-[hsl(var(--sidebar-border))]">
              <button
                type="button"
                onClick={() => setRgcTab('reglement')}
                className={`px-3 py-1.5 rounded-md transition-all duration-200 text-sm ${
                  rgcTab==='reglement' 
                    ? 'bg-white shadow-sm text-black ring-1 ring-[hsl(var(--sidebar-glow))]' 
                    : 'text-gray-600 hover:text-black hover:bg-[hsl(var(--sidebar-hover))]'
                }`}
              >
                Règlement du concours
              </button>
              <button
                type="button"
                onClick={() => setRgcTab('winners')}
                className={`px-3 py-1.5 rounded-md transition-all duration-200 text-sm ${
                  rgcTab==='winners' 
                    ? 'bg-white shadow-sm text-black ring-1 ring-[hsl(var(--sidebar-glow))]' 
                    : 'text-gray-600 hover:text-black hover:bg-[hsl(var(--sidebar-hover))]'
                }`}
              >
                Liste des gagnants
              </button>
              <button
                type="button"
                onClick={() => setRgcTab('contact')}
                className={`px-3 py-1.5 rounded-md transition-all duration-200 text-sm ${
                  rgcTab==='contact' 
                    ? 'bg-white shadow-sm text-black ring-1 ring-[hsl(var(--sidebar-glow))]' 
                    : 'text-gray-600 hover:text-black hover:bg-[hsl(var(--sidebar-hover))]'
                }`}
              >
                Informations de contact
              </button>
            </div>

            <div className="mt-4">
              {rgcTab === 'reglement' && (
                <RichTextEditor
                  value={String(((form as any).legal?.html) ?? '')}
                  onChange={(html) => {
                    const legal = { ...(form as any).legal, html };
                    handleChange('legal', legal);
                  }}
                  placeholder="Règlement du concours (HTML)..."
                />
              )}

              {rgcTab === 'winners' && (
                <RichTextEditor
                  value={String(((form as any).winners?.html) ?? '')}
                  onChange={(html) => {
                    const winners = { ...(form as any).winners, html };
                    handleChange('winners', winners);
                  }}
                  placeholder="Liste des gagnants (HTML)..."
                />
              )}

              {rgcTab === 'contact' && (
                <RichTextEditor
                  value={String(((form as any).winners?.contact_html) ?? '')}
                  onChange={(html) => {
                    const winners = { ...(form as any).winners, contact_html: html };
                    handleChange('winners', winners);
                  }}
                  placeholder="Informations de contact (HTML)..."
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParametersStep;
