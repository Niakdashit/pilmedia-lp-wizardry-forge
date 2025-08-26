import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCampaignSettings, CampaignSettings } from '@/hooks/useCampaignSettings';

const ChannelsStep: React.FC = () => {
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
        const next: any = data ? { ...data } : { campaign_id: campaignId };
        const pub = (next.publication ?? {}) as any;
        // Split existing datetime strings into date/time inputs if present
        const splitDt = (dt?: string) => {
          if (!dt) return { date: '', time: '' };
          // Accept ISO or local datetime-local format
          const [date, timeWithZone] = dt.split('T');
          const time = (timeWithZone || '').replace('Z', '').slice(0,5);
          return { date: date || '', time: time || '' };
        };
        const s = splitDt(pub.start);
        const e = splitDt(pub.end);
        next.publication = {
          ...pub,
          startDate: pub.startDate ?? s.date,
          startTime: pub.startTime ?? s.time,
          endDate: pub.endDate ?? e.date,
          endTime: pub.endTime ?? e.time,
        };
        setForm(next);
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

  const handleSave = async (goNext = false) => {
    if (!campaignId) return;
    // Combine date & time fields into start/end strings for persistence
    const pub: any = { ...(form.publication || {}) };
    const combine = (d?: string, t?: string) =>
      d && t ? `${d}T${t}` : (d ? `${d}T00:00` : (t ? `${new Date().toISOString().slice(0,10)}T${t}` : ''));
    pub.start = combine(pub.startDate, pub.startTime) || pub.start;
    pub.end = combine(pub.endDate, pub.endTime) || pub.end;

    const saved = await upsertSettings(campaignId, {
      publication: pub,
      campaign_url: form.campaign_url ?? {},
    });
    if (saved) {
      if (goNext) navigate('home');
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

      {error && (
        <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      <div>
        <h2 className="font-semibold mb-2">Campagne</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nom de la campagne</label>
            <input
              type="text"
              placeholder="Ex: Rentrée 2025 - Jeu Concours"
              value={(form.publication as any)?.name || ''}
              onChange={e => handleChange('publication.name', e.target.value)}
              className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Dates et heures de publication</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date de début</label>
              <input
                type="date"
                value={(form.publication as any)?.startDate || ''}
                onChange={e => handleChange('publication.startDate', e.target.value)}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Heure de début</label>
              <input
                type="time"
                value={(form.publication as any)?.startTime || ''}
                onChange={e => handleChange('publication.startTime', e.target.value)}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date de fin</label>
              <input
                type="date"
                value={(form.publication as any)?.endDate || ''}
                onChange={e => handleChange('publication.endDate', e.target.value)}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Heure de fin</label>
              <input
                type="time"
                value={(form.publication as any)?.endTime || ''}
                onChange={e => handleChange('publication.endTime', e.target.value)}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-2">URL de la campagne</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="https://votre-campagne.example.com"
            value={(form.campaign_url as any)?.url || ''}
            onChange={e => handleChange('campaign_url.url', e.target.value)}
            className="flex-1 px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
          <button
            type="button"
            onClick={() => window.open((form.campaign_url as any)?.url || '#', '_blank')}
            className="px-3 py-2 border border-primary-200 rounded-lg text-sm text-primary-700 hover:bg-primary-50"
          >
            Ouvrir
          </button>
        </div>
      </div>

      {/* Intégrations auto-générées */}
      <IntegrationsBlock campaignId={campaignId} url={(form.campaign_url as any)?.url || ''} />

      {/* Per-step action buttons removed in favor of global fixed bottom action bar */}
    </div>
  );
};

export default ChannelsStep;

// --- Intégrations ---
type IntegrationTab = 'javascript' | 'html' | 'webview' | 'oembed' | 'smart';

const IntegrationsBlock: React.FC<{ campaignId: string; url: string }> = ({ campaignId, url }) => {
  const [tab, setTab] = useState<IntegrationTab>('javascript');
  const safeUrl = url && url.trim().length > 0 ? url.trim() : `${window.location.origin}/campaign/${campaignId}`;
  const origin = useMemo(() => {
    try { return new URL(safeUrl).origin; } catch { return window.location.origin; }
  }, [safeUrl]);

  const snippets = useMemo(() => buildIntegrationSnippets({ campaignId, url: safeUrl, origin }), [campaignId, safeUrl, origin]);

  const copy = (text: string) => {
    try { navigator.clipboard.writeText(text); } catch {}
  };

  const TabBtn: React.FC<{ id: IntegrationTab; label: string }> = ({ id, label }) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`px-3 py-1.5 text-sm rounded-md border ${tab === id ? 'bg-brand/10 border-brand text-brand' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
    >
      {label}
    </button>
  );

  const CodeBlock: React.FC<{ value: string }> = ({ value }) => (
    <div className="relative">
      <textarea readOnly value={value} className="w-full font-mono text-xs leading-5 p-3 border rounded-lg bg-gray-50 text-gray-800 min-h-[140px]" />
      <button
        type="button"
        onClick={() => copy(value)}
        className="absolute top-2 right-2 px-2 py-1 text-xs rounded border border-gray-200 bg-white hover:bg-gray-50"
      >
        Copier
      </button>
    </div>
  );

  return (
    <div>
      <h2 className="font-semibold mb-2">Intégrations</h2>
      <div className="flex flex-wrap gap-2 mb-3">
        <TabBtn id="javascript" label="Javascript" />
        <TabBtn id="html" label="HTML" />
        <TabBtn id="webview" label="Webview" />
        <TabBtn id="oembed" label="oEmbed" />
        <TabBtn id="smart" label="Smart URL" />
      </div>
      {tab === 'javascript' && <CodeBlock value={snippets.javascript} />}
      {tab === 'html' && <CodeBlock value={snippets.html} />}
      {tab === 'webview' && <CodeBlock value={snippets.webview} />}
      {tab === 'oembed' && <CodeBlock value={snippets.oembed} />}
      {tab === 'smart' && <CodeBlock value={snippets.smart} />}
    </div>
  );
};

function buildIntegrationSnippets({ campaignId, url, origin }: { campaignId: string; url: string; origin: string }) {
  const iframeHtml = `<iframe src="${url}" class="prosplay_iframe_tag" width="100%" height="2000" scrolling="no" frameborder="0" style="overflow-x:hidden;max-width:800px"></iframe>`;
  const js = `<div id="prosplay_insert_place_${campaignId}" class="prosplay_iframe_wrapper"></div>\n<script type="text/javascript">\n(function(w,d,elId,u){\n  var el=d.getElementById(elId);\n  if(!el){ return; }\n  var f=d.createElement('iframe');\n  f.src=u; f.width='100%'; f.height='2000'; f.setAttribute('scrolling','no'); f.setAttribute('frameborder','0');\n  f.style='overflow-x:hidden;max-width:800px';\n  el.appendChild(f);\n})(window,document,'prosplay_insert_place_${campaignId}','${url}');\n<\/script>`;
  const webview = `${url}`;
  const oembedJson = `${origin}/oembed?format=json&url=${encodeURIComponent(url)}&id=${encodeURIComponent(campaignId)}`;
  const oembedXml = `${origin}/oembed?format=xml&url=${encodeURIComponent(url)}&id=${encodeURIComponent(campaignId)}`;
  const smart = `${url}`;

  return {
    javascript: js,
    html: iframeHtml,
    webview,
    oembed: `JSON\n${oembedJson}\n\nXML\n${oembedXml}`,
    smart,
  } as const;
}
