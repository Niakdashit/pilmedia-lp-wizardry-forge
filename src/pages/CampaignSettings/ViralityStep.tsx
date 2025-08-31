import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCampaignSettings, CampaignSettings } from '@/hooks/useCampaignSettings';
import ImageUpload from '@/components/common/ImageUpload';
import RichTextEditor from '@/components/shared/RichTextEditor';

const ViralityStep: React.FC = () => {
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
      advanced: { ...(form.advanced || {}), virality: (form as any)?.advanced?.virality || { share_enabled: false } }
    });
    if (saved) {
      if (goNext) navigate('appearance');
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

  // Tabs for Virality
  const [tab, setTab] = useState<'general' | 'social' | 'exit' | 'emails'>('general');

  // Simple accordion block
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const AccordionItem: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
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

  const socialPlatforms: Array<{ key: string; label: string }> = [
    { key: 'facebook', label: 'Facebook' },
    { key: 'x', label: 'X' },
    { key: 'whatsapp', label: 'WhatsApp' },
    { key: 'linkedin', label: 'LinkedIn' },
  ];

  const exitPlatforms: Array<{ key: string; label: string }> = [
    { key: 'facebook', label: 'Facebook' },
    { key: 'messenger', label: 'Messenger' },
    { key: 'x', label: 'X' },
    { key: 'whatsapp', label: 'WhatsApp' },
    { key: 'pinterest', label: 'Pinterest' },
  ];

  return (
    <div className="space-y-4">
      {error && (<div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>)}

      {/* Tabs header */}
      <div className="flex items-center bg-[hsl(var(--sidebar-surface))] rounded-lg p-1 border border-[hsl(var(--sidebar-border))]">
        <button
          type="button"
          onClick={() => setTab('general')}
          className={`px-3 py-1.5 rounded-md transition-all duration-200 text-sm ${
            tab==='general' 
              ? 'bg-white shadow-sm text-black ring-1 ring-[hsl(var(--sidebar-glow))]' 
              : 'text-gray-600 hover:text-black hover:bg-[hsl(var(--sidebar-hover))]'
          }`}
        >
          Contenu général
        </button>
        <button
          type="button"
          onClick={() => setTab('social')}
          className={`px-3 py-1.5 rounded-md transition-all duration-200 text-sm ${
            tab==='social' 
              ? 'bg-white shadow-sm text-black ring-1 ring-[hsl(var(--sidebar-glow))]' 
              : 'text-gray-600 hover:text-black hover:bg-[hsl(var(--sidebar-hover))]'
          }`}
        >
          Boutons sociaux
        </button>
        <button
          type="button"
          onClick={() => setTab('exit')}
          className={`px-3 py-1.5 rounded-md transition-all duration-200 text-sm ${
            tab==='exit' 
              ? 'bg-white shadow-sm text-black ring-1 ring-[hsl(var(--sidebar-glow))]' 
              : 'text-gray-600 hover:text-black hover:bg-[hsl(var(--sidebar-hover))]'
          }`}
        >
          Actions écran de sortie
        </button>
        <button
          type="button"
          onClick={() => setTab('emails')}
          className={`px-3 py-1.5 rounded-md transition-all duration-200 text-sm ${
            tab==='emails' 
              ? 'bg-white shadow-sm text-black ring-1 ring-[hsl(var(--sidebar-glow))]' 
              : 'text-gray-600 hover:text-black hover:bg-[hsl(var(--sidebar-hover))]'
          }`}
        >
          Emails d'invitation
        </button>
      </div>

      {/* General content */}
      {tab === 'general' && (
        <div className="bg-white rounded-lg border border-[hsl(var(--sidebar-border))] shadow-sm p-4">
          <p className="text-sm text-gray-600 mb-4">Toutes les informations remplies ci-dessous pré-rempliront les champs des boutons de partage que vous activerez dans les autres onglets.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ImageUpload
                value={String(((form as any)?.advanced?.virality?.general?.image) ?? '')}
                onChange={(v) => handleChange('advanced.virality.general.image', v)}
                label="Image de partage (1200x627px)"
                accept="image/*"
              />
              <label className="block text-sm font-medium text-black mt-4 mb-2">Description de l'image</label>
              <input
                type="text"
                value={String(((form as any)?.advanced?.virality?.general?.image_alt) ?? '')}
                onChange={e => handleChange('advanced.virality.general.image_alt', e.target.value)}
                className="w-full px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-glow))] focus:border-[hsl(var(--sidebar-glow))] bg-[hsl(var(--sidebar-surface))]"
                placeholder="Description de l'image"
              />
              <label className="flex items-center gap-2 text-sm mt-4">
                <input
                  type="checkbox"
                  checked={Boolean((form as any)?.advanced?.virality?.general?.xml_image_enabled)}
                  onChange={e => handleChange('advanced.virality.general.xml_image_enabled', e.target.checked)}
                />
                Ajouter une image pour le flux XML
              </label>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Titre</label>
                <input
                  type="text"
                  value={String(((form as any)?.advanced?.virality?.general?.title) ?? '')}
                  onChange={e => handleChange('advanced.virality.general.title', e.target.value)}
                  className="w-full px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-glow))] focus:border-[hsl(var(--sidebar-glow))] bg-[hsl(var(--sidebar-surface))]"
                  placeholder="Gagnez votre Plancha..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Description</label>
                <textarea
                  value={String(((form as any)?.advanced?.virality?.general?.description) ?? '')}
                  onChange={e => handleChange('advanced.virality.general.description', e.target.value)}
                  className="w-full px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-glow))] focus:border-[hsl(var(--sidebar-glow))] bg-[hsl(var(--sidebar-surface))] min-h-[120px]"
                  placeholder="Jouez et rejouez jusqu'à ..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social buttons */}
      {tab === 'social' && (
        <div className="bg-white rounded-lg border border-[hsl(var(--sidebar-border))] shadow-sm p-4">
          <p className="text-sm text-gray-600 mb-4">Les options activées s'affichent en haut à gauche de toutes les étapes de votre campagne.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {socialPlatforms.map(p => (
              <div key={p.key} className="border rounded-lg p-3 flex flex-col gap-2 items-start">
                <div className="font-medium">{p.label}</div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean((form as any)?.advanced?.virality?.social?.[p.key]?.enabled)}
                    onChange={e => handleChange(`advanced.virality.social.${p.key}.enabled`, e.target.checked)}
                  />
                  Activer
                </label>
              </div>
            ))}
          </div>

          {socialPlatforms.map(p => (
            <AccordionItem key={`acc-${p.key}`} id={`social-${p.key}`} title={p.label}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Titre</label>
                  <input
                    type="text"
                    value={String(((form as any)?.advanced?.virality?.social?.[p.key]?.title) ?? '')}
                    onChange={e => handleChange(`advanced.virality.social.${p.key}.title`, e.target.value)}
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={String(((form as any)?.advanced?.virality?.social?.[p.key]?.description) ?? '')}
                    onChange={e => handleChange(`advanced.virality.social.${p.key}.description`, e.target.value)}
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                </div>
              </div>
            </AccordionItem>
          ))}
        </div>
      )}

      {/* Exit screen actions */}
      {tab === 'exit' && (
        <div className="bg-white rounded-lg border border-[hsl(var(--sidebar-border))] shadow-sm p-4">
          <p className="text-sm text-gray-600 mb-4">Les options activées s'affichent dans l'écran de fin de campagne.</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {exitPlatforms.map(p => (
              <div key={p.key} className="border rounded-lg p-3 flex flex-col gap-2 items-start">
                <div className="font-medium">{p.label}</div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean((form as any)?.advanced?.virality?.exit?.[p.key]?.enabled)}
                    onChange={e => handleChange(`advanced.virality.exit.${p.key}.enabled`, e.target.checked)}
                  />
                  Activer
                </label>
              </div>
            ))}
          </div>

          {exitPlatforms.map(p => (
            <AccordionItem key={`exit-${p.key}`} id={`exit-${p.key}`} title={p.label}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Texte du bouton</label>
                  <input
                    type="text"
                    value={String(((form as any)?.advanced?.virality?.exit?.[p.key]?.cta) ?? '')}
                    onChange={e => handleChange(`advanced.virality.exit.${p.key}.cta`, e.target.value)}
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">URL (si applicable)</label>
                  <input
                    type="text"
                    value={String(((form as any)?.advanced?.virality?.exit?.[p.key]?.url) ?? '')}
                    onChange={e => handleChange(`advanced.virality.exit.${p.key}.url`, e.target.value)}
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                </div>
              </div>
            </AccordionItem>
          ))}
        </div>
      )}

      {/* Invitation emails */}
      {tab === 'emails' && (
        <div className="bg-white rounded-lg border border-[hsl(var(--sidebar-border))] shadow-sm p-4">
          <label className="flex items-center gap-2 text-sm text-black mb-4">
            <input
              type="checkbox"
              checked={Boolean((form as any)?.advanced?.virality?.invite?.enabled)}
              onChange={e => handleChange('advanced.virality.invite.enabled', e.target.checked)}
              className="rounded border-[hsl(var(--sidebar-border))] text-[hsl(var(--sidebar-glow))] focus:ring-[hsl(var(--sidebar-glow))]"
            />
            Activer les e-mails d'invitation
          </label>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Objet</label>
              <input
                type="text"
                value={String(((form as any)?.advanced?.virality?.invite?.subject) ?? '')}
                onChange={e => handleChange('advanced.virality.invite.subject', e.target.value)}
                className="w-full px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-glow))] focus:border-[hsl(var(--sidebar-glow))] bg-[hsl(var(--sidebar-surface))]"
                placeholder="Rejoignez ma partie et tentez votre chance !"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Message</label>
              <RichTextEditor
                value={String(((form as any)?.advanced?.virality?.invite?.html) ?? '')}
                onChange={(html) => handleChange('advanced.virality.invite.html', html)}
                placeholder="Contenu de l'e-mail d'invitation"
              />
            </div>
          </div>
        </div>
      )}

      {/* Per-step action buttons removed in favor of global fixed bottom action bar */}
    </div>
  );
};

export default ViralityStep;
