
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CampaignType } from '../utils/campaignTypes';
import { useCampaigns } from './useCampaigns';
import { getDefaultCampaign } from '../components/ModernEditor/utils/defaultCampaign';
import { loadCampaign } from './useModernCampaignEditor/campaignLoader';
import { useOptimizedCampaignState } from '../components/ModernEditor/hooks/useOptimizedCampaignState';
import { usePreviewOptimization } from '../components/ModernEditor/hooks/usePreviewOptimization';

export const useModernCampaignEditor = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
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
  
  // Initialize with optimized state management
  const initialCampaign = getDefaultCampaign(campaignType, isNewCampaign);
  const {
    campaign,
    setCampaign,
    isModified,
    isSaving,
    previewKey,
    forceSave
  } = useOptimizedCampaignState(initialCampaign, {
    autosaveDelay: 3000,
    onSave: async (campaignToSave) => {
      if (isNewCampaign) return;
      await saveCampaign(campaignToSave);
    },
    onError: (error) => {
      console.error('Auto-save error:', error);
    }
  });

  // Preview optimization
  const { optimizedPreviewConfig, isPreviewLoading } = usePreviewOptimization(campaign, previewDevice);

  useEffect(() => {
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
          _loaded: true
        });
      } else if (campaignId === 'quick-preview') {
        const fallbackCampaign = getDefaultCampaign(campaignType, false);
        setCampaign({
          ...fallbackCampaign,
          _fallback: true
        });
      }
    } catch (error) {
      console.error('Error loading campaign:', error);
      const errorFallbackCampaign = getDefaultCampaign(campaignType, false);
      setCampaign({
        ...errorFallbackCampaign,
        _error: true,
        _errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    campaign,
    setCampaign,
    activeTab,
    setActiveTab,
    showPreviewModal,
    setShowPreviewModal,
    previewDevice,
    setPreviewDevice,
    isLoading: isLoading || isSaving,
    campaignType,
    isNewCampaign,
    handleSave: async (showToast = true) => {
      try {
        await forceSave();
        if (showToast) {
          // Show success feedback
        }
      } catch (error) {
        console.error('Save error:', error);
        throw error;
      }
    },
    isModified,
    isSaving,
    previewKey,
    optimizedPreviewConfig,
    isPreviewLoading
  };
};
