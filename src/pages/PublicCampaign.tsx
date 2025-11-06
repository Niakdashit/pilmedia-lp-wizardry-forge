import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LoadingBoundary, MinimalLoader } from '@/components/shared/LoadingBoundary';
import { useCampaigns } from '@/hooks/useCampaigns';
import ArticleFunnelView from '@/components/ArticleEditor/ArticleFunnelView';
import PreviewRenderer from '@/components/preview/PreviewRenderer';

const PublicCampaign: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getCampaign } = useCampaigns();
  const [campaign, setCampaign] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!id) throw new Error('Aucune campagne');
        const data = await getCampaign(id);
        if (!mounted) return;
        if (!data) {
          setError('Campagne introuvable');
        } else {
          setCampaign(data);
        }
      } catch (e: any) {
        setError(e?.message || 'Erreur lors du chargement');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [getCampaign, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <MinimalLoader />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border rounded-xl shadow p-6 text-center">
          <h1 className="text-lg font-semibold mb-2">Impossible d'afficher la campagne</h1>
          <p className="text-sm text-gray-600">{error || 'Campagne introuvable.'}</p>
        </div>
      </div>
    );
  }

  // Choix du rendu public: mode article => ArticleFunnelView, sinon PreviewRenderer (desktop)
  const editorMode = (campaign as any)?.editorMode || (campaign as any)?.editor_mode || 'fullscreen';
  const campaignType = (campaign as any)?.type || 'wheel';
  const formFields = (campaign as any)?.formFields || (campaign as any)?.design?.formFields || [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: editorMode === 'article' ? '#2c2c35' : undefined }}>
      {editorMode === 'article' ? (
        <div className="w-full h-full min-h-screen flex items-start justify-center overflow-y-auto p-0 md:p-8">
          <ArticleFunnelView
            articleConfig={(campaign as any)?.articleConfig || {}}
            campaignType={campaignType}
            campaign={campaign}
            currentStep={'article'}
            editable={false}
            formFields={formFields}
            maxWidth={810}
          />
        </div>
      ) : (
        // Fullscreen campaigns: use unified PreviewRenderer
        <div className="w-full min-h-screen">
          <PreviewRenderer campaign={campaign} previewMode="desktop" />
        </div>
      )}
    </div>
  );
};

export default function PublicCampaignPage() {
  return (
    <LoadingBoundary>
      <PublicCampaign />
    </LoadingBoundary>
  );
}
