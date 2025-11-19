import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PreviewRenderer from '@/components/preview/PreviewRenderer';
import { useCampaignView } from '@/hooks/useCampaignView';
import { isTempCampaignId } from '@/utils/tempCampaignId';
import { useFastCampaignLoader } from '@/hooks/useFastCampaignLoader';

const PublicCampaignPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  // 🎯 Track campaign view with rich data (only for real campaigns)
  const shouldTrack = id && !isTempCampaignId(id);
  const { trackInteraction } = useCampaignView(shouldTrack ? id : '');

  // 🚀 Fast campaign loader with cache and image preloading
  const { campaign, isLoading } = useFastCampaignLoader({
    campaignId: id || null,
    enabled: !!id && !isTempCampaignId(id)
  });

  useEffect(() => {
    if (!id) {
      setError('Aucune campagne');
      return;
    }

    // 🚫 Detect temporary IDs
    if (isTempCampaignId(id)) {
      console.log('⚠️ Temp campaign detected in public URL');
      setError('Cette campagne est un brouillon temporaire non publié. Veuillez la sauvegarder depuis l\'éditeur pour obtenir une URL publique.');
      return;
    }

    if (!isLoading && campaign) {
      // Check if campaign is publicly accessible
      const config = campaign.config as any;
      const isPublic = config?.isPublic !== false;
      
      // Check if campaign has ended
      const now = new Date();
      const endDate = campaign.end_date ? new Date(campaign.end_date) : null;
      const hasEnded = campaign.status === 'ended' || (endDate && endDate < now);
      
      if (!isPublic || hasEnded) {
        setError('Cette campagne est désormais terminée');
      } else {
        // 📊 Track successful campaign load
        if (shouldTrack) {
          trackInteraction('click', { 
            action: 'campaign_loaded', 
            campaign_name: campaign.name,
            campaign_type: campaign.type 
          });
        }
        // Wait a bit for images to be preloaded, then show everything at once
        setTimeout(() => setIsReady(true), 100);
      }
    } else if (!isLoading && !campaign) {
      setError('Campagne introuvable');
    }
  }, [id, campaign, isLoading, shouldTrack]);

  // Show nothing while loading (browser default behavior)
  if (isLoading || (!isReady && !error)) {
    return null;
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-sm text-gray-600">{error || 'Campagne introuvable.'}</p>
      </div>
    );
  }

  // Render campaign with everything preloaded
  const editorMode = (campaign as any)?.editorMode || (campaign as any)?.editor_mode || 'fullscreen';

  return (
    <div className="min-h-screen" style={{ backgroundColor: editorMode === 'article' ? '#2c2c35' : undefined }}>
      <div className="w-full min-h-screen">
        <PreviewRenderer campaign={campaign} previewMode="desktop" />
      </div>
    </div>
  );
};

export default PublicCampaignPage;
