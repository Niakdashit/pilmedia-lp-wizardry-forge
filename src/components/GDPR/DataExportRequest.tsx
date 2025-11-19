import React, { useState } from 'react';
import { Download, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExportRequest {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requested_at: string;
  completed_at?: string;
  export_url?: string;
  export_expires_at?: string;
}

export const DataExportRequest: React.FC = () => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [requests, setRequests] = useState<ExportRequest[]>([]);
  const { toast } = useToast();

  const loadExportRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('gdpr_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('request_type', 'export')
        .order('requested_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRequests(data as ExportRequest[]);
    } catch (error) {
      console.error('Error loading export requests:', error);
    }
  };

  React.useEffect(() => {
    loadExportRequests();
  }, []);

  const requestDataExport = async () => {
    try {
      setIsRequesting(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Authentification requise',
          description: 'Vous devez être connecté pour exporter vos données.',
          variant: 'destructive',
        });
        return;
      }

      // Créer une demande d'export
      const { error } = await supabase
        .from('gdpr_requests')
        .insert({
          user_id: user.id,
          request_type: 'export',
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: 'Demande enregistrée',
        description: 'Votre demande d\'export a été enregistrée. Vous recevrez un email lorsque vos données seront prêtes.',
      });

      // Recharger la liste
      await loadExportRequests();
    } catch (error) {
      console.error('Error requesting data export:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la demande d\'export.',
        variant: 'destructive',
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const getStatusIcon = (status: ExportRequest['status']) => {
    switch (status) {
      case 'pending':
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusLabel = (status: ExportRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'processing':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'failed':
        return 'Échoué';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>Exporter mes données</CardTitle>
              <CardDescription>
                Téléchargez une copie complète de toutes vos données personnelles
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <FileText className="w-4 h-4" />
            <AlertDescription>
              Conformément au RGPD, vous avez le droit d'obtenir une copie de vos données personnelles.
              L'export inclut votre profil, vos participations, vos campagnes et vos préférences.
            </AlertDescription>
          </Alert>

          <Button
            onClick={requestDataExport}
            disabled={isRequesting}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            {isRequesting ? 'Création en cours...' : 'Demander un export'}
          </Button>
        </CardContent>
      </Card>

      {requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mes demandes d'export</CardTitle>
            <CardDescription>Historique de vos demandes d'export de données</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <p className="font-medium text-sm">{getStatusLabel(request.status)}</p>
                      <p className="text-xs text-muted-foreground">
                        Demandé le {new Date(request.requested_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {request.status === 'completed' && request.export_url && (
                    <Button
                      size="sm"
                      onClick={() => window.open(request.export_url, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
