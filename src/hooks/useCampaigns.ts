
import { useState } from 'react';

interface Campaign {
  id?: string;
  name: string;
  description: string;
  type: string;
  status: 'draft' | 'published';
  [key: string]: any;
}

export const useCampaigns = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveCampaign = async (campaign: Campaign): Promise<Campaign | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const savedCampaign = {
        ...campaign,
        id: campaign.id || `campaign_${Date.now()}`,
        updatedAt: new Date().toISOString()
      };
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('Campaign saved:', savedCampaign);
      }
      return savedCampaign;
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCampaign = async (id: string): Promise<Campaign | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return mock campaign data
      return {
        id,
        name: 'Campagne Exemple',
        description: 'Description de la campagne',
        type: 'wheel',
        status: 'draft'
      };
    } catch (err) {
      setError('Erreur lors du chargement');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const publishCampaign = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (process.env.NODE_ENV !== 'production') {
        console.log('Campaign published:', id);
      }
      return true;
    } catch (err) {
      setError('Erreur lors de la publication');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    saveCampaign,
    getCampaign,
    publishCampaign,
    loading,
    error
  };
};
