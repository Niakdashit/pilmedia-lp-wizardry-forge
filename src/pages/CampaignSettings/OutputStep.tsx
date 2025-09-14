import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCampaignSettings, CampaignSettings } from '@/hooks/useCampaignSettings';
import RichTextEditor from '@/components/shared/RichTextEditor';

const OutputStep: React.FC = () => {
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
      data_push: (form as any)?.data_push || { destination: 'none' },
      output: (form as any)?.output || {}
    });
    if (saved) {
      if (goNext) navigate('parameters');
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
    sortie: true,
    email: false,
    redirect: false,
  });


  // Tabs for exit screens
  const [exitTab, setExitTab] = useState<'win' | 'lose'>('win');

  return (
    <div className="space-y-4">
      {error && (<div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>)}

      <div className="bg-white rounded-lg border border-[hsl(var(--sidebar-border))] shadow-sm p-4">
        <h3 className="text-lg font-medium text-black mb-3">Destination</h3>
        <select
          className="w-full px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-glow))] focus:border-[hsl(var(--sidebar-glow))] bg-[hsl(var(--sidebar-surface))]"
          value={(form as any)?.data_push?.destination || 'none'}
          onChange={e => handleChange('data_push.destination', e.target.value)}
        >
          <option value="none">Aucune</option>
          <option value="crm">CRM</option>
          <option value="webhook">Webhook</option>
        </select>
      </div>

      

      {/* Écran de sortie (gagné/perdu) */}
      <div className="bg-white rounded-lg border border-[hsl(var(--sidebar-border))] shadow-sm">
        <button
          type="button"
          onClick={() => setOpen(prev => ({ ...prev, sortie: !prev.sortie }))}
          className="w-full flex items-center justify-between px-4 py-3 bg-[hsl(var(--sidebar-surface))] hover:bg-[hsl(var(--sidebar-hover))] rounded-t-lg transition-colors"
          aria-expanded={open.sortie ? 'true' : 'false'}
        >
          <span className="font-medium text-black">Écran de sortie (gagné/perdu)</span>
          <span className="text-xs text-gray-600">{open.sortie ? 'Réduire' : 'Développer'}</span>
        </button>
        {open.sortie && (
          <div className="p-4 space-y-4 bg-white rounded-b-lg">
            <div className="flex items-center bg-[hsl(var(--sidebar-surface))] rounded-lg p-1 border border-[hsl(var(--sidebar-border))]">
              <button
                type="button"
                onClick={() => setExitTab('win')}
                className={`px-3 py-1.5 rounded-md transition-all duration-200 text-sm ${
                  exitTab==='win' 
                    ? 'bg-white shadow-sm text-black ring-1 ring-[hsl(var(--sidebar-glow))]' 
                    : 'text-gray-600 hover:text-black hover:bg-[hsl(var(--sidebar-hover))]'
                }`}
              >
                Écran gagnant
              </button>
              <button
                type="button"
                onClick={() => setExitTab('lose')}
                className={`px-3 py-1.5 rounded-md transition-all duration-200 text-sm ${
                  exitTab==='lose' 
                    ? 'bg-white shadow-sm text-black ring-1 ring-[hsl(var(--sidebar-glow))]' 
                    : 'text-gray-600 hover:text-black hover:bg-[hsl(var(--sidebar-hover))]'
                }`}
              >
                Écran perdant
              </button>
            </div>

            <div className="mt-4">
              {exitTab === 'win' && (
                <RichTextEditor
                  value={String(((form as any).output?.win_html) ?? '')}
                  onChange={(html) => {
                    const output = { ...(form as any).output, win_html: html };
                    handleChange('output', output);
                  }}
                  placeholder="Contenu de l'écran gagnant (vide par défaut)..."
                />
              )}

              {exitTab === 'lose' && (
                <RichTextEditor
                  value={String(((form as any).output?.lose_html) ?? '')}
                  onChange={(html) => {
                    const output = { ...(form as any).output, lose_html: html };
                    handleChange('output', output);
                  }}
                  placeholder="Contenu de l'écran perdant (vide par défaut)..."
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Envoi d'un e-mail aux gagnants */}
      <div className="bg-white rounded-lg border border-[hsl(var(--sidebar-border))] shadow-sm">
        <button
          type="button"
          onClick={() => setOpen(prev => ({ ...prev, email: !prev.email }))}
          className="w-full flex items-center justify-between px-4 py-3 bg-[hsl(var(--sidebar-surface))] hover:bg-[hsl(var(--sidebar-hover))] rounded-t-lg transition-colors"
          aria-expanded={open.email ? 'true' : 'false'}
        >
          <span className="font-medium text-black">Envoi d'un e-mail aux gagnants</span>
          <span className="text-xs text-gray-600">{open.email ? 'Réduire' : 'Développer'}</span>
        </button>
        {open.email && (
          <div className="p-4 space-y-4 bg-white rounded-b-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Nom de l'émetteur</label>
                <input
                  type="text"
                  value={String(((form as any).output?.email?.from_name) ?? '')}
                  onChange={e => handleChange('output.email.from_name', e.target.value)}
                  className="w-full px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-glow))] focus:border-[hsl(var(--sidebar-glow))] bg-[hsl(var(--sidebar-surface))]"
                  placeholder="Ex: Cuisine Actuelle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Adresse e-mail du destinataire</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={String(((form as any).output?.email?.to) ?? '')}
                    onChange={e => handleChange('output.email.to', e.target.value)}
                    className="flex-1 px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-glow))] focus:border-[hsl(var(--sidebar-glow))] bg-[hsl(var(--sidebar-surface))]"
                    placeholder="exemple@domaine.com"
                    disabled={((form as any).output?.email?.to_mode) === 'participant'}
                  />
                  <select
                    value={String(((form as any).output?.email?.to_mode) ?? 'participant')}
                    onChange={e => handleChange('output.email.to_mode', e.target.value)}
                    className="px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-glow))] focus:border-[hsl(var(--sidebar-glow))] bg-[hsl(var(--sidebar-surface))]"
                    title="Mode de destinataire"
                  >
                    <option value="participant">Utiliser l'adresse e-mail du participant</option>
                    <option value="custom">Utiliser l'adresse personnalisée</option>
                  </select>
                </div>
                <p className="mt-1 text-xs text-gray-600">Des virgules peuvent être utilisées pour séparer plusieurs adresses.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">E-mail de réponse</label>
                <input
                  type="email"
                  value={String(((form as any).output?.email?.reply_to) ?? '')}
                  onChange={e => handleChange('output.email.reply_to', e.target.value)}
                  className="w-full px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-glow))] focus:border-[hsl(var(--sidebar-glow))] bg-[hsl(var(--sidebar-surface))]"
                  placeholder="reponses@domaine.com"
                />
                <p className="mt-1 text-xs text-gray-600">À qui envoyer l'e-mail de gain ?</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-black mb-2">Objet</label>
                <input
                  type="text"
                  value={String(((form as any).output?.email?.subject) ?? '')}
                  onChange={e => handleChange('output.email.subject', e.target.value)}
                  className="w-full px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-glow))] focus:border-[hsl(var(--sidebar-glow))] bg-[hsl(var(--sidebar-surface))]"
                  placeholder="Félicitations pour votre gain !"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-black mb-2">Contenu de l'e-mail</label>
                <RichTextEditor
                  value={String(((form as any).output?.email?.html) ?? '')}
                  onChange={(html) => {
                    const output = { ...(form as any).output, email: { ...(form as any).output?.email, html } };
                    handleChange('output', output);
                  }}
                  placeholder="Contenu de l'e-mail (HTML)"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Redirection automatique */}
      <div className="bg-white rounded-lg border border-[hsl(var(--sidebar-border))] shadow-sm">
        <button
          type="button"
          onClick={() => setOpen(prev => ({ ...prev, redirect: !prev.redirect }))}
          className="w-full flex items-center justify-between px-4 py-3 bg-[hsl(var(--sidebar-surface))] hover:bg-[hsl(var(--sidebar-hover))] rounded-t-lg transition-colors"
          aria-expanded={open.redirect ? 'true' : 'false'}
        >
          <span className="font-medium text-black">Redirection automatique</span>
          <span className="text-xs text-gray-600">{open.redirect ? 'Réduire' : 'Développer'}</span>
        </button>
        {open.redirect && (
          <div className="p-4 space-y-4 bg-white rounded-b-lg">
            <label className="flex items-center gap-2 text-sm text-black">
              <input
                type="checkbox"
                checked={Boolean((form as any).output?.redirect?.enabled)}
                onChange={e => handleChange('output.redirect.enabled', e.target.checked)}
                className="rounded border-[hsl(var(--sidebar-border))] text-[hsl(var(--sidebar-glow))] focus:ring-[hsl(var(--sidebar-glow))]"
              />
              Rediriger automatiquement les participants à la fin de la campagne
            </label>
            {Boolean((form as any).output?.redirect?.enabled) && (
              <div>
                <label className="block text-sm font-medium text-black mb-2">URL de redirection</label>
                <input
                  type="url"
                  value={String(((form as any).output?.redirect?.url) ?? '')}
                  onChange={e => handleChange('output.redirect.url', e.target.value)}
                  className="w-full px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-glow))] focus:border-[hsl(var(--sidebar-glow))] bg-[hsl(var(--sidebar-surface))]"
                  placeholder="https://exemple.com/merci"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Per-step action buttons removed in favor of global fixed bottom action bar */}
    </div>
  );
};

export default OutputStep;
