import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCampaignSettings, CampaignSettings } from '@/hooks/useCampaignSettings';
import ShortUrlGenerator from '@/components/ShortUrlGenerator';
import QRCodeGenerator from '@/components/QRCodeGenerator';

type ControlledProps = {
  form?: Partial<CampaignSettings>;
  setForm?: React.Dispatch<React.SetStateAction<Partial<CampaignSettings>>>;
  campaignId?: string;
};

const ChannelsStep: React.FC<ControlledProps> = (props) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSettings, upsertSettings, error, saveDraft } = useCampaignSettings();
  const isControlled = !!props.form && !!props.setForm && !!props.campaignId;
  const [uncontrolledForm, setUncontrolledForm] = useState<Partial<CampaignSettings>>({});
  const form = (isControlled ? props.form! : uncontrolledForm);
  const setForm = (isControlled ? props.setForm! : setUncontrolledForm);
  const campaignId = (isControlled ? props.campaignId! : (id || ''));

  useEffect(() => {
    if (isControlled) return; // modal controls loading
    let mounted = true;
    (async () => {
      if (!campaignId) return;
      const data = await getSettings(campaignId);
      if (mounted) {
        const next: any = data ? { ...data } : { campaign_id: campaignId };
        const pub = (next.publication ?? {}) as any;
        const splitDt = (dt?: string) => {
          if (!dt) return { date: '', time: '' };
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
  }, [campaignId, getSettings, isControlled, setForm]);

  // Auto-generate campaign URL when campaignId is available
  useEffect(() => {
    // Déterminer le meilleur ID public possible pour générer l'URL
    let effectiveId = campaignId;

    if (typeof window !== 'undefined') {
      try {
        const urlParamId = new URLSearchParams(window.location.search).get('campaign');
        // Si l'URL contient déjà un vrai UUID, on le privilégie
        if (urlParamId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(urlParamId)) {
          effectiveId = urlParamId;
        }
      } catch {
        // no-op
      }
    }

    if (effectiveId && effectiveId !== 'new' && effectiveId !== 'preview') {
      const currentUrl = (form.campaign_url as any)?.url;
      const generatedUrl = `${window.location.origin}/campaign/${effectiveId}`;
      
      // Only set if URL is empty or not already set
      if (!currentUrl || currentUrl.trim() === '') {
        setForm(prev => ({
          ...prev,
          campaign_url: {
            ...(typeof (prev.campaign_url as any) === 'string' ? {} : ((prev.campaign_url as any) || {})),
            url: generatedUrl
          }
        }));
      }
    }
  }, [campaignId, form.campaign_url, setForm]);

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
    if (isControlled) {
      // In controlled mode, saving is handled by the modal. No-op here.
      return;
    }
    if (!campaignId) return;
    const pub: any = { ...(form.publication || {}) };
    const combine = (d?: string, t?: string) =>
      d && t ? `${d}T${t}` : (d ? `${d}T00:00` : (t ? `${new Date().toISOString().slice(0,10)}T${t}` : ''));
    pub.start = combine(pub.startDate, pub.startTime) || pub.start;
    pub.end = combine(pub.endDate, pub.endTime) || pub.end;

    const saved = await upsertSettings(campaignId, {
      publication: pub,
      campaign_url: (form as any).campaign_url ?? {},
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
    if (isControlled) return; // modal handles global save
    const onSaveAndClose = (_e: Event) => {
      handleSave(false);
    };
    window.addEventListener('campaign:saveAndClose', onSaveAndClose as EventListener);
    return () => {
      window.removeEventListener('campaign:saveAndClose', onSaveAndClose as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, form, isControlled]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {/* Campagne */}
      <div className="bg-white rounded-lg border border-[hsl(var(--sidebar-border))] shadow-sm p-4">
        <h2 className="font-medium text-black mb-3">Campagne</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Nom de la campagne</label>
            <input
              type="text"
              placeholder="Ex: Rentrée 2025 - Jeu Concours"
              value={(form.publication as any)?.name || ''}
              onChange={e => handleChange('publication.name', e.target.value)}
              className="w-full px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-glow))] focus:border-[hsl(var(--sidebar-glow))] bg-[hsl(var(--sidebar-surface))]"
            />
          </div>
        </div>
      </div>

      {/* Dates et heures */}
      <div className="bg-white rounded-lg border border-[hsl(var(--sidebar-border))] shadow-sm p-4">
        <h2 className="font-medium text-black mb-3">Dates et heures de publication</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Date de début</label>
              <input
                type="date"
                value={(form.publication as any)?.startDate || ''}
                onChange={e => handleChange('publication.startDate', e.target.value)}
                className="w-full px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-glow))] focus:border-[hsl(var(--sidebar-glow))] bg-[hsl(var(--sidebar-surface))]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Heure de début</label>
              <input
                type="time"
                value={(form.publication as any)?.startTime || ''}
                onChange={e => handleChange('publication.startTime', e.target.value)}
                className="w-full px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-glow))] focus:border-[hsl(var(--sidebar-glow))] bg-[hsl(var(--sidebar-surface))]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Date de fin</label>
              <input
                type="date"
                value={(form.publication as any)?.endDate || ''}
                onChange={e => handleChange('publication.endDate', e.target.value)}
                className="w-full px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-glow))] focus:border-[hsl(var(--sidebar-glow))] bg-[hsl(var(--sidebar-surface))]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Heure de fin</label>
              <input
                type="time"
                value={(form.publication as any)?.endTime || ''}
                onChange={e => handleChange('publication.endTime', e.target.value)}
                className="w-full px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-glow))] focus:border-[hsl(var(--sidebar-glow))] bg-[hsl(var(--sidebar-surface))]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* URL de la campagne */}
      <div className="bg-white rounded-lg border border-[hsl(var(--sidebar-border))] shadow-sm p-4">
        <h2 className="font-medium text-black mb-3">URL de la campagne</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="https://votre-campagne.example.com"
            value={(form.campaign_url as any)?.url || ''}
            onChange={e => handleChange('campaign_url.url', e.target.value)}
            className="flex-1 px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-glow))] focus:border-[hsl(var(--sidebar-glow))] bg-[hsl(var(--sidebar-surface))]"
          />
          <button
            type="button"
            onClick={() => window.open((form.campaign_url as any)?.url || '#', '_blank')}
            className="px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg text-sm text-black hover:bg-[hsl(var(--sidebar-hover))]"
          >
            Ouvrir
          </button>
        </div>
      </div>

      {/* URL Publique */}
      <div className="bg-white rounded-lg border border-[hsl(var(--sidebar-border))] shadow-sm p-4">
        <h2 className="font-medium text-black mb-3">URL Publique</h2>
        <p className="text-sm text-gray-600 mb-3">
          Définissez une URL personnalisée pour votre campagne. Si laissé vide, l'URL générée automatiquement sera utilisée.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="https://votre-campagne-personnalisee.com"
            value={(form.campaign_url as any)?.custom_url || ''}
            onChange={e => handleChange('campaign_url.custom_url', e.target.value)}
            className="flex-1 px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-glow))] focus:border-[hsl(var(--sidebar-glow))] bg-[hsl(var(--sidebar-surface))]"
          />
          <button
            type="button"
            onClick={() => {
              const customUrl = (form.campaign_url as any)?.custom_url;
              if (customUrl && customUrl.trim()) {
                window.open(customUrl, '_blank');
              }
            }}
            disabled={!(form.campaign_url as any)?.custom_url?.trim()}
            className="px-3 py-2 border border-[hsl(var(--sidebar-border))] rounded-lg text-sm text-black hover:bg-[hsl(var(--sidebar-hover))] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ouvrir
          </button>
        </div>
      </div>

      {/* Intégrations avec Short URL & QR Code */}
      <IntegrationsBlock
        campaignId={campaignId}
        url={(form.campaign_url as any)?.custom_url || (form.campaign_url as any)?.url || ''}
        customUrl={(form.campaign_url as any)?.custom_url}
        generatedUrl={(form.campaign_url as any)?.url}
        campaignName={(form.publication as any)?.name || 'Campagne'}
      />

      {/* Per-step action buttons removed in favor of global fixed bottom action bar */}
    </div>
  );
};

export default ChannelsStep;

// --- Intégrations ---
type IntegrationTab = 'javascript' | 'html' | 'webview' | 'oembed' | 'smart' | 'shorturl' | 'qrcode';

const IntegrationsBlock: React.FC<{ 
  campaignId: string; 
  url: string; 
  customUrl?: string; 
  generatedUrl?: string;
  campaignName?: string;
}> = ({ campaignId, url, customUrl, generatedUrl, campaignName = 'Campagne' }) => {
  const [tab, setTab] = useState<IntegrationTab>('javascript');
  const [shortUrl, setShortUrl] = useState('');
  const safeUrl = url && url.trim().length > 0 ? url.trim() : `${window.location.origin}/campaign/${campaignId}`;
  const origin = useMemo(() => {
    try { return new URL(safeUrl).origin; } catch { return window.location.origin; }
  }, [safeUrl]);

  // Charger la Short URL existante si disponible
  useEffect(() => {
    if (campaignId) {
      const stored = localStorage.getItem('prosplay_short_urls');
      if (stored) {
        try {
          const mappings = JSON.parse(stored);
          const existing = mappings.find((m: any) => m.campaignId === campaignId);
          if (existing) {
            setShortUrl(`${window.location.origin}/s/${existing.code}`);
          }
        } catch (error) {
          console.error('Error loading short URL:', error);
        }
      }
    }
  }, [campaignId]);

  const snippets = useMemo(() => buildIntegrationSnippets({ campaignId, url: safeUrl, origin }), [campaignId, safeUrl, origin]);

  const copy = (text: string) => {
    try { navigator.clipboard.writeText(text); } catch {}
  };

  const TabBtn: React.FC<{ id: IntegrationTab; label: string }> = ({ id, label }) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`px-3 py-1.5 rounded-md transition-all duration-200 text-sm ${
        tab === id 
          ? 'bg-white shadow-sm text-black ring-1 ring-[hsl(var(--sidebar-glow))]' 
          : 'text-gray-600 hover:text-black hover:bg-[hsl(var(--sidebar-hover))]'
      }`}
    >
      {label}
    </button>
  );

  const CodeBlock: React.FC<{ value: string }> = ({ value }) => (
    <div className="relative">
      <textarea 
        readOnly 
        value={value} 
        className="w-full font-mono text-xs leading-5 p-3 border border-[hsl(var(--sidebar-border))] rounded-lg bg-[hsl(var(--sidebar-surface))] text-black min-h-[140px]" 
      />
      <button
        type="button"
        onClick={() => copy(value)}
        className="absolute top-2 right-2 px-2 py-1 text-xs rounded border border-[hsl(var(--sidebar-border))] bg-white hover:bg-[hsl(var(--sidebar-hover))] text-black"
      >
        Copier
      </button>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-[hsl(var(--sidebar-border))] shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-medium text-black">Intégrations</h2>
        {customUrl && customUrl.trim() && (
          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
            URL personnalisée
          </span>
        )}
      </div>
      <div className="flex items-center bg-[hsl(var(--sidebar-surface))] rounded-lg p-1 border border-[hsl(var(--sidebar-border))] mb-4 flex-wrap gap-1">
        <TabBtn id="javascript" label="Javascript" />
        <TabBtn id="html" label="HTML" />
        <TabBtn id="webview" label="Webview" />
        <TabBtn id="oembed" label="oEmbed" />
        <TabBtn id="smart" label="Smart URL" />
        <TabBtn id="shorturl" label="Short URL" />
        <TabBtn id="qrcode" label="QR Code" />
      </div>
      {tab === 'javascript' && <CodeBlock value={snippets.javascript} />}
      {tab === 'html' && <CodeBlock value={snippets.html} />}
      {tab === 'webview' && <CodeBlock value={snippets.webview} />}
      {tab === 'oembed' && <CodeBlock value={snippets.oembed} />}
      {tab === 'smart' && <CodeBlock value={snippets.smart} />}
      {tab === 'shorturl' && (
        <ShortUrlGenerator
          longUrl={safeUrl}
          campaignId={campaignId}
          onShortUrlCreated={(url) => setShortUrl(url)}
        />
      )}
      {tab === 'qrcode' && (
        <div className="space-y-3">
          <QRCodeGenerator
            data={safeUrl}
            campaignId={campaignId}
            title="QR Code - URL Complète"
            defaultColor="0F172A"
          />
          {shortUrl && (
            <div className="relative">
              <div className="absolute -top-2 left-4 z-10">
                <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full shadow-sm">
                  Recommandé
                </span>
              </div>
              <QRCodeGenerator
                data={shortUrl}
                campaignId={`${campaignId}-short`}
                title="QR Code - Short URL"
                defaultColor="16A34A"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function buildIntegrationSnippets({ campaignId, url, origin }: { campaignId: string; url: string; origin: string }) {
  const iframeHtml = `<iframe src="${url}" class="prosplay_iframe_tag" width="100%" height="2000" scrolling="no" frameborder="0" style="overflow-x:hidden;max-width:800px"></iframe>`;
  const js = `<div id="prosplay_insert_place_${campaignId}" class="prosplay_iframe_wrapper"></div>\n<script type="text/javascript">\n(function(w,d,elId,u){\n  var el=d.getElementById(elId);\n  if(!el){ return; }\n  var f=d.createElement('iframe');\n  f.src=u; f.width='100%'; f.height='2000'; f.setAttribute('scrolling','no'); f.setAttribute('frameborder','0');\n  f.style='overflow-x:hidden;max-width:800px';\n  el.appendChild(f);\n})(window,document,'prosplay_insert_place_${campaignId}','${url}');\n<\/script>`;
  const webview = `${url}`;
  const oembedJson = `${origin}/oembed?format=json&url=${encodeURIComponent(url)}&id=${encodeURIComponent(campaignId)}`;
  const oembedXml = `${origin}/oembed?format=xml&url=${encodeURIComponent(url)}&id=${encodeURIComponent(campaignId)}`;
  
  // Smart URL with device detection and responsive behavior
  const smart = `<!-- Smart URL avec détection automatique -->
<script type="text/javascript">
(function() {
  var campaignUrl = '${url}';
  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  var isTablet = /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768;
  
  if (isMobile && !isTablet) {
    // Mobile: Redirection plein écran
    window.location.href = campaignUrl;
  } else {
    // Desktop/Tablet: Iframe responsive
    var container = document.currentScript.parentElement;
    var iframe = document.createElement('iframe');
    iframe.src = campaignUrl;
    iframe.style.cssText = 'width:100%;height:2000px;border:0;max-width:800px;margin:0 auto;display:block;';
    iframe.setAttribute('scrolling', 'no');
    container.appendChild(iframe);
  }
})();
<\/script>`;

  return {
    javascript: js,
    html: iframeHtml,
    webview,
    oembed: `JSON:\n${oembedJson}\n\nXML:\n${oembedXml}`,
    smart,
  } as const;
}
