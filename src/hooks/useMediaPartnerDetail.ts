// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdPlacement {
  id: string;
  name: string;
  description: string | null;
  format: string | null;
  position: string | null;
  estimated_visibility: number | null;
  available_slots: number;
}

export interface PartnershipCondition {
  id: string;
  duration_min: number | null;
  duration_max: number | null;
  validation_delay: number | null;
  min_dotation_value: number | null;
  max_dotation_value: number | null;
  dotation_types: string[] | null;
  specific_conditions: string[] | null;
}

export interface MediaPartnerDetail {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  category: string | null;
  audience_size: number;
  monthly_visitors: number;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  location: string | null;
  age_range: string | null;
  gender_distribution: { male: number; female: number; other: number } | null;
  interests: string[] | null;
  rating: number | null;
  partnerships_count: number;
  member_since: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  ad_placements: AdPlacement[];
  partnership_conditions: PartnershipCondition | null;
}

export const useMediaPartnerDetail = (id: string) => {
  const [mediaPartner, setMediaPartner] = useState<MediaPartnerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMediaPartnerDetail = async () => {
      if (!id) {
        setError('ID du partenaire manquant');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Récupérer les informations du partenaire
        const { data: partnerData, error: partnerError } = await supabase
          .from('media_partners')
          .select('*')
          .eq('id', id)
          .single();

        if (partnerError) throw partnerError;

        // Récupérer les emplacements publicitaires
        const { data: placementsData, error: placementsError } = await supabase
          .from('media_ad_placements')
          .select('*')
          .eq('media_id', id);

        if (placementsError) throw placementsError;

        // Récupérer les conditions de partenariat
        const { data: conditionsData, error: conditionsError } = await supabase
          .from('media_partnership_conditions')
          .select('*')
          .eq('media_id', id)
          .single();

        // Ne pas throw l'erreur si aucune condition n'existe
        const conditions = conditionsError ? null : conditionsData;

        // Combiner toutes les données
        const detailedPartner: MediaPartnerDetail = {
          ...partnerData,
          ad_placements: placementsData || [],
          partnership_conditions: conditions,
        };

        setMediaPartner(detailedPartner);
      } catch (err: any) {
        console.error('Erreur lors du chargement du partenaire:', err);
        setError(err.message || 'Erreur lors du chargement des détails');
      } finally {
        setLoading(false);
      }
    };

    fetchMediaPartnerDetail();
  }, [id]);

  return {
    mediaPartner,
    loading,
    error,
  };
};
