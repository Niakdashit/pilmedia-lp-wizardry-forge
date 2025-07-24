
import { useState } from 'react';

export interface Participation {
  id?: string;
  campaign_id: string;
  form_data: Record<string, string>;
  user_email: string;
  created_at?: string; // Make optional for creation
  utm_source?: string;
}

export const useParticipations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createParticipation = async (participation: Omit<Participation, 'created_at'> & { created_at?: string }): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('Participation created:', {
          ...participation,
          created_at: participation.created_at || new Date().toISOString()
        });
      }
      
      return true;
    } catch (err) {
      setError('Erreur lors de l\'enregistrement de la participation');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getParticipations = async (): Promise<Participation[]> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return mock data
      return [];
    } catch (err) {
      setError('Erreur lors du chargement des participations');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getParticipationsByCampaign = async (campaignId: string): Promise<Participation[]> => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Loading participations for campaign:', campaignId);
    }
    return getParticipations();
  };

  const exportParticipationsToCSV = (participations: Participation[], campaignName: string) => {
    try {
      const headers = ['Date', 'Email', 'Prénom', 'Nom', 'Source'];
      const csvContent = [
        headers.join(','),
        ...participations.map(p => [
          p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '',
          p.user_email || '',
          p.form_data.prenom || '',
          p.form_data.nom || '',
          p.utm_source || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `participations_${campaignName}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Erreur lors de l\'export CSV:', err);
    }
  };

  return {
    createParticipation,
    getParticipations,
    getParticipationsByCampaign,
    exportParticipationsToCSV,
    loading,
    error
  };
};
