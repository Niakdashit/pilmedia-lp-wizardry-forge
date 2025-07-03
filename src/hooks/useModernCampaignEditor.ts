
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
  const location = window.location.pathname;
  
  // Gestion spéciale pour quick-preview
  const isQuickPreview = location.includes('quick-preview') || id === 'quick-preview';
  const actualId = isQuickPreview ? 'quick-preview' : id;
  const isNewCampaign = actualId === 'new';
  const campaignType = searchParams.get('type') as CampaignType || 'wheel';
  
  const [activeTab, setActiveTab] = useState('general');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  
  const { saveCampaign, getCampaign } = useCampaigns();
  
  const [campaign, setCampaign] = useState<any>(() => {
    console.log('Initializing campaign with campaignType:', campaignType);
    const defaultCampaign = getDefaultCampaign(campaignType, isNewCampaign);
    return {
      ...defaultCampaign,
      _lastUpdate: Date.now(),
      _initialized: true
    };
  });

  useEffect(() => {
    console.log('useEffect triggered with actualId:', actualId, 'isNewCampaign:', isNewCampaign, 'isQuickPreview:', isQuickPreview);
    
    if (!isNewCampaign && actualId) {
      handleLoadCampaign(actualId);
    }
  }, [actualId, isNewCampaign, isQuickPreview]);

  const handleLoadCampaign = async (campaignId: string) => {
    setIsLoading(true);
    
    try {
      const loadedCampaign = await loadCampaign(campaignId, campaignType, getCampaign);
      if (loadedCampaign) {
        setCampaign({
          ...loadedCampaign,
          _lastUpdate: Date.now(),
          _loaded: true
        });
      } else if (campaignId === 'quick-preview') {
        // Fallback pour quick-preview sans données
        console.warn('No quick-preview data found, using default campaign');
        const fallbackCampaign = getDefaultCampaign(campaignType, false);
        setCampaign({
          ...fallbackCampaign,
          _lastUpdate: Date.now(),
          _fallback: true
        });
      }
    } catch (error) {
      console.error('Error loading campaign:', error);
      // Fallback en cas d'erreur
      const errorFallbackCampaign = getDefaultCampaign(campaignType, false);
      setCampaign({
        ...errorFallbackCampaign,
        _lastUpdate: Date.now(),
        _error: true,
        _errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
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
