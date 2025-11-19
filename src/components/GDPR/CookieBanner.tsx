import React, { useState, useEffect } from 'react';
import { Cookie, Shield, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGDPRConsent } from '@/hooks/useGDPRConsent';

interface CookieBannerProps {
  onSettingsClick?: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onSettingsClick }) => {
  const { hasConsent, saveConsent, isLoading } = useGDPRConsent();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Afficher le banner si aucun consentement n'a été donné
    if (!isLoading && !hasConsent) {
      setIsVisible(true);
    }
  }, [hasConsent, isLoading]);

  const handleAcceptAll = async () => {
    await saveConsent({
      analytics: true,
      marketing: true,
      functional: true,
      personalization: true,
      method: 'banner'
    });
    setIsVisible(false);
  };

  const handleAcceptNecessary = async () => {
    await saveConsent({
      analytics: false,
      marketing: false,
      functional: true,
      personalization: false,
      method: 'banner'
    });
    setIsVisible(false);
  };

  const handleCustomize = () => {
    onSettingsClick?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t border-border shadow-lg animate-in slide-in-from-bottom duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Respect de votre vie privée
              </h3>
              <p className="text-sm text-muted-foreground">
                Nous utilisons des cookies et technologies similaires pour améliorer votre expérience, analyser l'utilisation de notre site et personnaliser le contenu. 
                En cliquant sur "Tout accepter", vous consentez à notre utilisation des cookies conformément à notre{' '}
                <a href="/privacy" className="underline hover:text-foreground">Politique de confidentialité</a> et nos{' '}
                <a href="/terms" className="underline hover:text-foreground">CGU</a>.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCustomize}
              className="w-full sm:w-auto"
            >
              <Settings className="w-4 h-4 mr-2" />
              Personnaliser
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAcceptNecessary}
              className="w-full sm:w-auto"
            >
              Nécessaires uniquement
            </Button>
            <Button
              size="sm"
              onClick={handleAcceptAll}
              className="w-full sm:w-auto"
            >
              Tout accepter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
