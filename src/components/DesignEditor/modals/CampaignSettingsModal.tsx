import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCampaignSettings, CampaignSettings } from '@/hooks/useCampaignSettings';
import ChannelsStep from '@/pages/CampaignSettings/ChannelsStep';
import ParametersStep from '@/pages/CampaignSettings/ParametersStep';
import OutputStep from '@/pages/CampaignSettings/OutputStep';
import ViralityStep from '@/pages/CampaignSettings/ViralityStep';
import { useEditorStore } from '@/stores/editorStore';
import { useCampaigns } from '@/hooks/useCampaigns';
import { saveCampaignToDB } from '@/hooks/useModernCampaignEditor/saveHandler';
import { getEditorUrl } from '@/utils/editorRouting';

interface CampaignSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId?: string;
}

const steps = [
  { id: 'channels', label: 'Canaux', component: ChannelsStep },
  { id: 'parameters', label: 'Paramètres', component: ParametersStep },
  { id: 'output', label: 'Sortie', component: OutputStep },
  { id: 'virality', label: 'Viralité', component: ViralityStep },
];

const CampaignSettingsModal: React.FC<CampaignSettingsModalProps> = ({ isOpen, onClose, campaignId }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('channels');
  const { getSettings, upsertSettings, loading, error, saveDraft } = useCampaignSettings();
  const [form, setForm] = useState<Partial<CampaignSettings>>({});
  const [isLoadingData, setIsLoadingData] = useState(true);
  const effectiveCampaignId = campaignId || '';
  const campaignStoreName = useEditorStore((s) => (s.campaign as any)?.name as string | undefined);
  const campaign = useEditorStore((s) => s.campaign);
  const setCampaign = useEditorStore((s) => s.setCampaign);
  const { saveCampaign } = useCampaigns();

// Load settings when modal opens
useEffect(() => {
  if (!isOpen || !effectiveCampaignId) {
    setIsLoadingData(false);
    return;
  }
  let mounted = true;
  setIsLoadingData(true);
  (async () => {
    const data = await getSettings(effectiveCampaignId);
    if (mounted) {
      const incoming: any = data || { campaign_id: effectiveCampaignId };
      // Prefill name from editor store if missing
      if (!incoming?.publication?.name && campaignStoreName) {
        incoming.publication = { ...(incoming.publication || {}), name: campaignStoreName };
      }
      setForm(incoming);
      setIsLoadingData(false);
    }
  })();
  return () => { mounted = false; };
}, [isOpen, effectiveCampaignId, getSettings, campaignStoreName]);

  // React to external campaign name updates from editor naming modal
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<any>)?.detail as { campaignId?: string; name?: string } | undefined;
      if (!isOpen) return;
      if (!detail?.name) return;
      if (detail?.campaignId && detail.campaignId !== effectiveCampaignId) return;
      setForm(prev => ({
        ...(prev || {}),
        publication: {
          ...((prev as any)?.publication || {}),
          name: detail.name,
        }
      }));
    };
    window.addEventListener('campaign:name:update', handler as EventListener);
    return () => window.removeEventListener('campaign:name:update', handler as EventListener);
  }, [isOpen, effectiveCampaignId]);

  const handleSaveAndClose = async () => {
    try {
      // Step 0: Trigger state synchronization in the editor BEFORE saving
      console.log('🔄 [CampaignSettingsModal] Requesting state sync from editor...');
      
      // Wait for sync completion event from editor
      const syncCompleted = new Promise<void>((resolve) => {
        const handler = () => {
          console.log('✅ [CampaignSettingsModal] Sync completed event received');
          window.removeEventListener('campaign:sync:completed', handler);
          resolve();
        };
        window.addEventListener('campaign:sync:completed', handler);
        
        // Fallback timeout in case event doesn't fire
        setTimeout(() => {
          console.warn('⚠️ [CampaignSettingsModal] Sync timeout, proceeding anyway');
          window.removeEventListener('campaign:sync:completed', handler);
          resolve();
        }, 500);
      });
      
      // Trigger sync
      console.log('🚀 [CampaignSettingsModal] Dispatching campaign:sync:before-save event');
      window.dispatchEvent(new CustomEvent('campaign:sync:before-save'));
      
      // Wait for sync to complete
      await syncCompleted;
      
      // Get the updated campaign from store after sync
      const updatedCampaign = useEditorStore.getState().campaign as any;
      
      // Verify sync worked by checking if modularPage exists
      const hasModules = updatedCampaign?.modularPage || 
                        updatedCampaign?.config?.modularPage || 
                        updatedCampaign?.design?.modularPage ||
                        updatedCampaign?.design?.quizModules;
      
      console.log('🔍 [CampaignSettingsModal] Campaign after sync:', {
        id: updatedCampaign?.id,
        hasModularPage: !!hasModules,
        modulesCount: hasModules?.screens ? Object.values(hasModules.screens).flat().length : 0
      });
      
      // Step 1: Save the campaign itself (with all design, config, etc.)
      let savedCampaignId = effectiveCampaignId;
      
      // If no campaign ID yet, save campaign to DB first to get ID
      if (!effectiveCampaignId || effectiveCampaignId === 'new' || effectiveCampaignId === 'preview') {
        if (!updatedCampaign && !campaign) {
          alert('Aucune campagne à sauvegarder');
          return;
        }
        
        console.log('💾 [CampaignSettingsModal] Saving campaign to DB...');
        const savedCampaign = await saveCampaignToDB(updatedCampaign || campaign, saveCampaign);
        
        if (!savedCampaign?.id) {
          alert('Erreur lors de la sauvegarde de la campagne');
          return;
        }
        
        savedCampaignId = savedCampaign.id;
        
        // Update campaign state with new ID
        setCampaign({ ...campaign, id: savedCampaignId } as any);
        console.log('✅ [CampaignSettingsModal] Campaign saved with ID:', savedCampaignId);
      }
      
      // Step 2: Save campaign settings
      console.log('💾 [CampaignSettingsModal] Saving campaign settings...');
      const pub: any = { ...(form.publication || {}) };
      const parseDateToISO = (d?: string): string | null => {
        if (!d || typeof d !== 'string') return null;
        // Already ISO-like
        if (/^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10);
        // French DMY format: 14/12/2025
        const m = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (m) {
          const dd = m[1].padStart(2, '0');
          const mm = m[2].padStart(2, '0');
          const yyyy = m[3];
          return `${yyyy}-${mm}-${dd}`;
        }
        // Fallback: let Date parse and convert back to YYYY-MM-DD
        const parsed = new Date(d);
        if (!isNaN(parsed.getTime())) {
          const yyyy = parsed.getFullYear();
          const mm = String(parsed.getMonth() + 1).padStart(2, '0');
          const dd = String(parsed.getDate()).padStart(2, '0');
          return `${yyyy}-${mm}-${dd}`;
        }
        return null;
      };
      const combine = (d?: string, t?: string) => {
        const dateISO = parseDateToISO(d);
        const time = (t && /^\d{2}:\d{2}$/.test(t)) ? t : '00:00';
        return dateISO ? `${dateISO}T${time}` : '';
      };

      // Normalize publication ISO fields from date/time inputs
      // IMPORTANT: Always use form values (startDate/endDate) if present, not the old ISO values
      pub.start = combine(pub.startDate, pub.startTime) || pub.start;
      pub.end = combine(pub.endDate, pub.endTime) || pub.end;

      const saved = await upsertSettings(savedCampaignId, {
        publication: pub,
        campaign_url: (typeof (form.campaign_url as any) === 'string')
          ? { url: (form.campaign_url as any) }
          : (form.campaign_url ?? {}),
        soft_gate: form.soft_gate ?? {},
        limits: form.limits ?? {},
        email_verification: form.email_verification ?? {},
        legal: form.legal ?? {},
        winners: form.winners ?? {},
        output: form.output ?? {},
        data_push: form.data_push ?? {},
        advanced: form.advanced ?? {},
        opt_in: form.opt_in ?? {},
        tags: form.tags ?? [],
      });

      if (saved) {
        console.log('✅ [CampaignSettingsModal] Settings saved successfully');
        
        // CRITICAL: Invalidate campaign list cache immediately
        try {
          console.log('🧹 [CampaignSettingsModal] Invalidating campaign list cache');
          localStorage.removeItem('campaign:list:default');
        } catch {}
        
        try { window.dispatchEvent(new CustomEvent('campaign:settings:saved')); } catch {}
        
        // Notify list views to refresh campaign name immediately
        try {
          const pubName = (form.publication as any)?.name as string | undefined;
          if (pubName && savedCampaignId) {
            window.dispatchEvent(new CustomEvent('campaign:name:update', { detail: { campaignId: savedCampaignId, name: pubName } }));
          }
        } catch {}
        
        // Step 3: Redirect to editor with campaign ID (preserve mode parameter)
        if (campaign?.type) {
          // Determine editor mode from current URL or campaign data
          const currentUrl = new URL(window.location.href);
          const currentMode = currentUrl.searchParams.get('mode');
          const campaignEditorMode = (campaign as any)?.editorMode || (updatedCampaign as any)?.editorMode;
          const editorMode = currentMode === 'article' || campaignEditorMode === 'article' ? 'article' : undefined;
          
          const editorUrl = getEditorUrl(campaign.type, savedCampaignId, editorMode as 'article' | 'fullscreen' | undefined);
          
          // Build a snapshot of current modularPage to guard against stale reloads
          const snapshotCampaign: any = useEditorStore.getState().campaign as any;
          const snapshotMP = snapshotCampaign?.modularPage
            || snapshotCampaign?.config?.modularPage
            || snapshotCampaign?.design?.quizModules;
          console.log('🔄 [CampaignSettingsModal] Redirecting to:', editorUrl);
          
          onClose();
          navigate(editorUrl, { state: { modularPageSnapshot: snapshotMP, snapshotAt: Date.now() } });
        } else {
          onClose();
        }
      } else {
        try { saveDraft(savedCampaignId, form); } catch {}
        alert('Sauvegarde distante échouée, un brouillon local a été enregistré.');
      }
    } catch (error) {
      console.error('❌ [CampaignSettingsModal] Error saving:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  // Listen to global save-and-close event
  useEffect(() => {
    const onSaveAndClose = (_e: Event) => {
      handleSaveAndClose();
    };
    window.addEventListener('campaign:saveAndClose', onSaveAndClose as EventListener);
    return () => {
      window.removeEventListener('campaign:saveAndClose', onSaveAndClose as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCampaignId, form]);

  if (!isOpen) return null;

  // Validation du campaignId
  if (!effectiveCampaignId) {
    return createPortal(
      <div 
        className="fixed z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        style={{
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          minHeight: '100vh',
          minWidth: '100vw'
        }}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-[95vw] max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Erreur</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all duration-200 hover:bg-[hsl(var(--sidebar-hover))] text-gray-600 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-700 mb-4">
            Impossible d'ouvrir les paramètres : aucune campagne n'est actuellement chargée.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Veuillez d'abord sauvegarder votre campagne avant d'accéder aux paramètres.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-[radial-gradient(circle_at_0%_0%,_#E0004D,_#6B2AA0)] text-white rounded-lg hover:opacity-95 transition-opacity"
          >
            Fermer
          </button>
        </div>
      </div>,
      document.body
    );
  }

  const ActiveStepComponent = steps.find(s => s.id === activeTab)?.component;

  return createPortal(
    <div 
      className="fixed z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        minWidth: '100vw'
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-[95vw] max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-[hsl(var(--sidebar-border))] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Paramètres de la campagne</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all duration-200 hover:bg-[hsl(var(--sidebar-hover))] text-gray-600 hover:text-black"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-[hsl(var(--sidebar-surface))] border-b border-[hsl(var(--sidebar-border))] px-6 py-3">
          <div className="flex items-center gap-2">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveTab(step.id)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                  activeTab === step.id
                    ? 'bg-white shadow-sm text-black ring-1 ring-[hsl(var(--sidebar-glow))]'
                    : 'text-gray-600 hover:text-black hover:bg-[hsl(var(--sidebar-hover))]'
                }`}
              >
                {step.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {error && (
            <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {isLoadingData ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-[#E0004D]/30 border-t-[#E0004D] rounded-full animate-spin" />
                <p className="text-sm text-gray-600">Chargement des paramètres...</p>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {ActiveStepComponent && (
                // Pass down controlled form state so steps edit the modal's form
                // Steps should treat props.form as source of truth and call props.setForm to update
                <ActiveStepComponent
                  // @ts-ignore allow steps to accept these props without strict typing here
                  form={form}
                  setForm={setForm}
                  campaignId={effectiveCampaignId}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-[hsl(var(--sidebar-border))] px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSaveAndClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-opacity bg-[radial-gradient(circle_at_0%_0%,_#6B2AA0,_#E0004D_70%)] hover:opacity-95 disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CampaignSettingsModal;
