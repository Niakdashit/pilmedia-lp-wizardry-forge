import React, { useState } from 'react';
import { Trash2, AlertTriangle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const DataDeletionRequest: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const requestDataDeletion = async () => {
    if (!isConfirmed) return;

    try {
      setIsDeleting(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Authentification requise',
          description: 'Vous devez être connecté pour supprimer vos données.',
          variant: 'destructive',
        });
        return;
      }

      // Créer une demande de suppression
      const { error } = await supabase
        .from('gdpr_requests')
        .insert({
          user_id: user.id,
          request_type: 'delete',
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: 'Demande enregistrée',
        description: 'Votre demande de suppression a été enregistrée. Vos données seront supprimées sous 30 jours.',
      });

      setIsOpen(false);
      
      // Déconnecter l'utilisateur
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error requesting data deletion:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la demande de suppression.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Trash2 className="w-6 h-6 text-destructive" />
          <div>
            <CardTitle className="text-destructive">Zone de danger</CardTitle>
            <CardDescription>
              Actions irréversibles concernant vos données personnelles
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertTitle>Attention !</AlertTitle>
          <AlertDescription>
            La suppression de vos données est <strong>définitive et irréversible</strong>.
            Conformément au RGPD, vous avez le droit à l'oubli, mais cette action supprimera
            toutes vos données personnelles et votre compte.
          </AlertDescription>
        </Alert>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer mes données et mon compte
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-destructive" />
                Confirmer la suppression
              </DialogTitle>
              <DialogDescription>
                Cette action est irréversible. Êtes-vous absolument sûr ?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  Les données suivantes seront <strong>définitivement supprimées</strong> :
                </AlertDescription>
              </Alert>

              <ul className="space-y-2 text-sm text-muted-foreground ml-6 list-disc">
                <li>Votre profil utilisateur et informations personnelles</li>
                <li>Toutes vos campagnes créées</li>
                <li>Vos participations et résultats de jeux</li>
                <li>Vos préférences et consentements</li>
                <li>Votre historique d'activité</li>
              </ul>

              <div className="flex items-start space-x-3 pt-4">
                <Checkbox
                  id="confirm"
                  checked={isConfirmed}
                  onCheckedChange={(checked: boolean) => setIsConfirmed(checked)}
                />
                <label
                  htmlFor="confirm"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Je comprends que cette action est irréversible et je souhaite
                  supprimer définitivement toutes mes données personnelles
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  setIsConfirmed(false);
                }}
                disabled={isDeleting}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={requestDataDeletion}
                disabled={!isConfirmed || isDeleting}
              >
                {isDeleting ? 'Suppression...' : 'Confirmer la suppression'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
