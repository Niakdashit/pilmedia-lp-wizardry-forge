'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CampaignType } from '../utils/campaignTypes';
import { useCampaigns } from './useCampaigns';
import { getDefaultCampaign } from '../components/ModernEditor/utils/defaultCampaign';
import { loadCampaign } from './useModernCampaignEditor/campaignLoader';
import { saveCampaignToDB } from './useModernCampaignEditor/saveHandler';
import { useOptimizedCampaignState } from '../components/ModernEditor/hooks/useOptimizedCampaignState';
import { usePreviewOptimization } from '../components/ModernEditor/hooks/usePreviewOptimization';
import { isTempCampaignId } from '@/utils/tempCampaignId';

export const useModernCampaignEditor = () => {
  const params = useParams();
  const routeId = params?.id as string | undefined;
  const [searchParams] = useSearchParams();
  const location = window.location.pathname;
  
  // Supporte aussi l'ID via query param (?id=..., ?campaign=..., ?campaignId=...)
  const queryId = searchParams.get('id') || searchParams.get('campaign') || searchParams.get('campaignId') || undefined;
  const rawId = routeId ?? queryId;
  
  // Gestion spéciale pour quick-preview
  const isQuickPreview = location.includes('quick-preview') || rawId === 'quick-preview';
  const actualId = isQuickPreview ? 'quick-preview' : rawId;
  const isNewCampaign = !actualId || actualId === 'new' || isTempCampaignId(actualId);
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
    previewKey
  } = useOptimizedCampaignState(initialCampaign, {
    autosaveDelay: 3000,
    onSave: async (campaignToSave) => {
      if (isNewCampaign) return;
      
      // Use saveCampaignToDB for exhaustive save
      console.log('💾 [useModernCampaignEditor] Auto-saving campaign...');
      const wasTempId = isTempCampaignId(campaignToSave?.id);
      const savedCampaign = await saveCampaignToDB(campaignToSave, saveCampaign);
      
      // Si l'ID était temporaire et a été remplacé par un UUID réel, mettre à jour
      if (wasTempId && savedCampaign?.id && !isTempCampaignId(savedCampaign.id)) {
        console.log('✅ [useModernCampaignEditor] Temp ID replaced with real UUID:', {
          old: campaignToSave?.id,
          new: savedCampaign.id
        });
        
        // Mettre à jour l'état de la campagne avec le nouvel ID
        setCampaign((prev: any) => ({
          ...prev,
          id: savedCampaign.id
        }));
        
        // Mettre à jour l'URL du navigateur pour refléter le nouvel ID
        if (typeof window !== 'undefined') {
          const currentParams = new URLSearchParams(window.location.search);
          currentParams.set('campaign', savedCampaign.id);
          const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
          window.history.replaceState({}, '', newUrl);
          console.log('🔗 [useModernCampaignEditor] URL updated with real UUID');
        }
      }
      
      console.log('✅ [useModernCampaignEditor] Auto-save complete');
    },
    onError: (error) => {
      console.error('❌ [useModernCampaignEditor] Auto-save error:', error);
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
        console.log('💾 [useModernCampaignEditor] Manual save triggered...');
        const wasTempId = isTempCampaignId(campaign?.id);
        const savedCampaign = await saveCampaignToDB(campaign, saveCampaign);
        
        // Si l'ID était temporaire et a été remplacé, mettre à jour
        if (wasTempId && savedCampaign?.id && !isTempCampaignId(savedCampaign.id)) {
          console.log('✅ [useModernCampaignEditor] Temp ID replaced with real UUID:', {
            old: campaign?.id,
            new: savedCampaign.id
          });
          
          // Mettre à jour l'état de la campagne
          setCampaign((prev: any) => ({
            ...prev,
            id: savedCampaign.id
          }));
          
          // Mettre à jour l'URL
          if (typeof window !== 'undefined') {
            const currentParams = new URLSearchParams(window.location.search);
            currentParams.set('campaign', savedCampaign.id);
            const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
            window.history.replaceState({}, '', newUrl);
            console.log('🔗 [useModernCampaignEditor] URL updated with real UUID');
          }
        }
        
        console.log('✅ [useModernCampaignEditor] Manual save complete');
        if (showToast) {
          // Show success feedback
        }
      } catch (error) {
        console.error('❌ [useModernCampaignEditor] Save error:', error);
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
