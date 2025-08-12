import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useParticipations } from '@/hooks/useParticipations';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BottomTabBar from '@/components/Navigation/BottomTabBar';

const PublicCampaign = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getCampaignBySlug } = useCampaigns();
  const { createParticipation } = useParticipations();
  
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [participating, setParticipating] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [hasParticipated, setHasParticipated] = useState(false);

  useEffect(() => {
    const loadCampaign = async () => {
      if (!slug) return;
      
      try {
        const campaignData = await getCampaignBySlug(slug);
        if (campaignData) {
          setCampaign(campaignData);
          
          // Initialize form data with empty values for all form fields
          const initialFormData: Record<string, string> = {};
          campaignData.form_fields?.forEach((field: any) => {
            initialFormData[field.name] = '';
          });
          setFormData(initialFormData);
        } else {
          toast.error('Campagne non trouvée');
        }
      } catch (error) {
        console.error('Error loading campaign:', error);
        toast.error('Erreur lors du chargement de la campagne');
      } finally {
        setLoading(false);
      }
    };

    loadCampaign();
  }, [slug, getCampaignBySlug]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleParticipation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;

    setParticipating(true);
    
    try {
      // Validate required fields
      const requiredFields = campaign.form_fields?.filter((field: any) => field.required) || [];
      for (const field of requiredFields) {
        if (!formData[field.name]) {
          toast.error(`Le champ "${field.label}" est requis`);
          setParticipating(false);
          return;
        }
      }

      // Create participation
      await createParticipation({
        campaign_id: campaign.id,
        user_email: formData.email || '',
        form_data: formData,
        game_result: undefined,
        is_winner: false
      });

      setHasParticipated(true);
      toast.success('Participation enregistrée avec succès !');
    } catch (error) {
      console.error('Error creating participation:', error);
      toast.error('Erreur lors de la participation');
    } finally {
      setParticipating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Campagne non trouvée</CardTitle>
            <CardDescription>
              Cette campagne n'existe pas ou n'est plus disponible.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (hasParticipated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4 pb-24">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Merci pour votre participation !</CardTitle>
            <CardDescription>
              Votre participation à "{campaign.name}" a été enregistrée.
            </CardDescription>
          </CardHeader>
        </Card>
        <BottomTabBar variant="public" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4 pb-24">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{campaign.name}</CardTitle>
          {campaign.description && (
            <CardDescription>{campaign.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleParticipation} className="space-y-4">
            {campaign.form_fields?.map((field: any) => (
              <div key={field.name} className="space-y-2">
                <label htmlFor={field.name} className="text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  type={field.type || 'text'}
                  value={formData[field.name] || ''}
                  onChange={handleInputChange}
                  required={field.required}
                  placeholder={field.placeholder}
                />
              </div>
            ))}
            
            <Button
              type="submit"
              className="w-full"
              disabled={participating}
            >
              {participating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Participation en cours...
                </>
              ) : (
                'Participer'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      <BottomTabBar variant="public" />
    </div>
  );
};

export default PublicCampaign;