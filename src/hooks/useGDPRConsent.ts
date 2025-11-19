import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getDeviceFingerprint } from '@/utils/deviceFingerprint';

interface ConsentPreferences {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  personalization: boolean;
  method: 'banner' | 'settings' | 'registration';
}

interface ConsentRecord {
  id: string;
  analytics_consent: boolean;
  marketing_consent: boolean;
  functional_consent: boolean;
  personalization_consent: boolean;
  consent_date: string;
  consent_version: string;
}

const CONSENT_STORAGE_KEY = 'gdpr_consent';
const CONSENT_VERSION = '1.0';

export const useGDPRConsent = () => {
  const [hasConsent, setHasConsent] = useState<boolean>(false);
  const [consent, setConsent] = useState<ConsentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Charger le consentement au montage
  useEffect(() => {
    loadConsent();
  }, []);

  const loadConsent = async () => {
    try {
      setIsLoading(true);
      
      // Vérifier d'abord le localStorage
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setConsent(parsed);
        setHasConsent(true);
        setIsLoading(false);
        return;
      }

      // Vérifier dans la base de données si l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('user_consents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data && !error) {
          setConsent(data as ConsentRecord);
          setHasConsent(true);
          // Sauvegarder aussi en local
          localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(data));
        }
      }
    } catch (error) {
      console.error('Error loading consent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConsent = async (preferences: ConsentPreferences) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const fingerprint = await getDeviceFingerprint();
      
      // Préparer les données de consentement
      const consentData = {
        analytics_consent: preferences.analytics,
        marketing_consent: preferences.marketing,
        functional_consent: preferences.functional,
        personalization_consent: preferences.personalization,
        consent_version: CONSENT_VERSION,
        consent_method: preferences.method,
        user_agent: navigator.userAgent,
      };

      // Sauvegarder en local immédiatement
      const localConsent = {
        ...consentData,
        consent_date: new Date().toISOString(),
        id: 'local',
      };
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(localConsent));
      setConsent(localConsent as ConsentRecord);
      setHasConsent(true);

      // Si l'utilisateur est connecté, sauvegarder en DB
      if (user) {
        const { error } = await supabase
          .from('user_consents')
          .insert({
            user_id: user.id,
            ...consentData,
          });

        if (error) throw error;
      } else {
        // Pour les utilisateurs non connectés, utiliser un session_id
        const sessionId = fingerprint;
        
        const { error } = await supabase
          .from('user_consents')
          .insert({
            session_id: sessionId,
            ...consentData,
          });

        if (error) throw error;
      }

      toast({
        title: 'Préférences enregistrées',
        description: 'Vos préférences de confidentialité ont été sauvegardées.',
      });

      return true;
    } catch (error) {
      console.error('Error saving consent:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder vos préférences.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateConsent = async (preferences: Partial<ConsentPreferences>) => {
    const currentPreferences = {
      analytics: consent?.analytics_consent ?? false,
      marketing: consent?.marketing_consent ?? false,
      functional: consent?.functional_consent ?? true,
      personalization: consent?.personalization_consent ?? false,
      method: 'settings' as const,
    };

    return saveConsent({ ...currentPreferences, ...preferences });
  };

  const revokeConsent = async () => {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    setConsent(null);
    setHasConsent(false);
    
    // Sauvegarder avec tous les consentements à false sauf functional
    return saveConsent({
      analytics: false,
      marketing: false,
      functional: true,
      personalization: false,
      method: 'settings',
    });
  };

  return {
    hasConsent,
    consent,
    isLoading,
    saveConsent,
    updateConsent,
    revokeConsent,
    loadConsent,
  };
};
