import React, { useState, useEffect } from 'react';
import { Shield, Cookie, BarChart, Mail, Sparkles, Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGDPRConsent } from '@/hooks/useGDPRConsent';
import { Separator } from '@/components/ui/separator';

interface ConsentOption {
  id: 'analytics' | 'marketing' | 'functional' | 'personalization';
  icon: React.ElementType;
  title: string;
  description: string;
  required: boolean;
}

const consentOptions: ConsentOption[] = [
  {
    id: 'functional',
    icon: Cookie,
    title: 'Cookies fonctionnels',
    description: 'Essentiels au bon fonctionnement du site. Ils ne peuvent pas être désactivés.',
    required: true,
  },
  {
    id: 'analytics',
    icon: BarChart,
    title: 'Cookies analytiques',
    description: 'Nous aident à comprendre comment vous utilisez notre site pour l\'améliorer.',
    required: false,
  },
  {
    id: 'marketing',
    icon: Mail,
    title: 'Cookies marketing',
    description: 'Utilisés pour afficher des publicités pertinentes et mesurer l\'efficacité de nos campagnes.',
    required: false,
  },
  {
    id: 'personalization',
    icon: Sparkles,
    title: 'Personnalisation',
    description: 'Permettent de personnaliser votre expérience et de mémoriser vos préférences.',
    required: false,
  },
];

export const GDPRSettings: React.FC = () => {
  const { consent, saveConsent, isLoading } = useGDPRConsent();
  const [preferences, setPreferences] = useState({
    functional: true,
    analytics: false,
    marketing: false,
    personalization: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (consent) {
      setPreferences({
        functional: consent.functional_consent,
        analytics: consent.analytics_consent,
        marketing: consent.marketing_consent,
        personalization: consent.personalization_consent,
      });
    }
  }, [consent]);

  const handleToggle = (id: ConsentOption['id']) => {
    if (id === 'functional') return; // Ne peut pas être désactivé
    setPreferences(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await saveConsent({
      ...preferences,
      method: 'settings',
    });
    setIsSaving(false);
  };

  const handleAcceptAll = async () => {
    setIsSaving(true);
    const allAccepted = {
      functional: true,
      analytics: true,
      marketing: true,
      personalization: true,
    };
    setPreferences(allAccepted);
    await saveConsent({
      ...allAccepted,
      method: 'settings',
    });
    setIsSaving(false);
  };

  const handleRejectAll = async () => {
    setIsSaving(true);
    const onlyRequired = {
      functional: true,
      analytics: false,
      marketing: false,
      personalization: false,
    };
    setPreferences(onlyRequired);
    await saveConsent({
      ...onlyRequired,
      method: 'settings',
    });
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Shield className="w-6 h-6 text-primary mt-1" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">Paramètres de confidentialité</h2>
          <p className="text-muted-foreground mt-1">
            Gérez vos préférences en matière de cookies et de protection des données.
          </p>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        {consentOptions.map((option) => {
          const Icon = option.icon;
          const isEnabled = preferences[option.id];

          return (
            <Card key={option.id} className={option.required ? 'border-primary/20' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isEnabled ? 'bg-primary/10' : 'bg-muted'}`}>
                      <Icon className={`w-5 h-5 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {option.title}
                        {option.required && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">(Requis)</span>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">{option.description}</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={() => handleToggle(option.id)}
                    disabled={option.required}
                  />
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <Separator />

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleSave} disabled={isSaving} className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Enregistrement...' : 'Enregistrer les préférences'}
        </Button>
        <Button variant="outline" onClick={handleAcceptAll} disabled={isSaving} className="flex-1">
          Tout accepter
        </Button>
        <Button variant="outline" onClick={handleRejectAll} disabled={isSaving} className="flex-1">
          Tout refuser
        </Button>
      </div>

      {consent && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Dernière mise à jour : {new Date(consent.consent_date).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Version du consentement : {consent.consent_version}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
