import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LoadingBoundary, MinimalLoader } from '@/components/shared/LoadingBoundary';
import { supabase } from '@/integrations/supabase/client';
import PreviewRenderer from '@/components/preview/PreviewRenderer';

const PublicCampaign: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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
        
        // Fetch campaign directly from Supabase to bypass cache and check visibility
        const { data, error: fetchError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', id)
          .single();
        
        if (fetchError) throw fetchError;
        if (!mounted) return;
        
        if (!data) {
          setError('Campagne introuvable');
        } else {
          // Check if campaign is publicly accessible
          // Explicitly: true = public, false = private, undefined = public (default)
          const config = data.config as any;
          const isPublic = config?.isPublic !== false;
          console.log('🔒 Public access check:', { campaignId: id, isPublic, configValue: config?.isPublic });
          
          // Check if campaign has ended (status or end_date)
          const now = new Date();
          const endDate = data.end_date ? new Date(data.end_date) : null;
          const hasEnded = data.status === 'ended' || (endDate && endDate < now);
          
          if (!isPublic || hasEnded) {
            setError('Cette campagne est désormais terminée');
          } else {
            setCampaign(data);
          }
        }
      } catch (e: any) {
        setError(e?.message || 'Erreur lors du chargement');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

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
        <p className="text-sm text-gray-600">{error || 'Campagne introuvable.'}</p>
      </div>
    );
  }

  // Choix du rendu public: mode article => ArticleFunnelView, sinon PreviewRenderer (desktop)
  const editorMode = (campaign as any)?.editorMode || (campaign as any)?.editor_mode || 'fullscreen';

  return (
    <div className="min-h-screen" style={{ backgroundColor: editorMode === 'article' ? '#2c2c35' : undefined }}>
        {/* Unified public rendering using PreviewRenderer for all modes */}
        <div className="w-full min-h-screen">
          <PreviewRenderer campaign={campaign} previewMode="desktop" />
        </div>
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
