
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CampaignType } from '../utils/campaignTypes';
import { useCampaigns } from './useCampaigns';
import { getDefaultCampaign } from '../components/ModernEditor/utils/defaultCampaign';
import { loadCampaign } from './useModernCampaignEditor/campaignLoader';
import { createSaveHandler } from './useModernCampaignEditor/saveHandler';

export const useModernCampaignEditor = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isNewCampaign = id === 'new';
  const campaignType = searchParams.get('type') as CampaignType || 'wheel';
  
  const [activeTab, setActiveTab] = useState('general');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  
  const { saveCampaign, getCampaign } = useCampaigns();
  
  const [campaign, setCampaign] = useState<any>(() => {
    console.log('Initializing campaign with campaignType:', campaignType);
    return getDefaultCampaign(campaignType, isNewCampaign);
  });

  useEffect(() => {
    console.log('useEffect triggered with id:', id, 'isNewCampaign:', isNewCampaign);
    
    if (!isNewCampaign && id) {
      handleLoadCampaign(id);
    }
  }, [id, isNewCampaign]);

  const handleLoadCampaign = async (campaignId: string) => {
    setIsLoading(true);
    
    try {
      const loadedCampaign = await loadCampaign(campaignId, campaignType, getCampaign);
      if (loadedCampaign) {
        setCampaign(loadedCampaign);
      }
    } catch (error) {
      console.error('Error loading campaign:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = createSaveHandler(campaign, saveCampaign, navigate, isNewCampaign, setCampaign);

  console.log('Current campaign state:', campaign);

  return {
    campaign,
    setCampaign,
    activeTab,
    setActiveTab,
    showPreviewModal,
    setShowPreviewModal,
    previewDevice,
    setPreviewDevice,
    isLoading,
    campaignType,
    isNewCampaign,
    handleSave
  };
};
