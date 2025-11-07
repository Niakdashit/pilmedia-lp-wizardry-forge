import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCampaignBackups } from '@/hooks/useCampaignBackups';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Save, Trash2, RotateCcw, ArrowLeft, Clock, Plus } from 'lucide-react';
import { toast } from 'sonner';

const CampaignBackupsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCampaign } = useCampaigns();
  const { backups, isLoading, fetchBackups, createBackup, restoreBackup, deleteBackup } = useCampaignBackups();
  
  const [campaign, setCampaign] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [backupDescription, setBackupDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    console.log('[CampaignBackups] Campaign ID from URL:', id);
    if (id) {
      console.log('[CampaignBackups] Fetching backups for campaign:', id);
      fetchBackups(id);
      getCampaign(id).then((camp) => {
        console.log('[CampaignBackups] Campaign loaded:', camp);
        setCampaign(camp);
      });
    } else {
      console.warn('[CampaignBackups] No campaign ID found in URL');
    }
  }, [id, fetchBackups, getCampaign]);

  const handleCreateBackup = async () => {
    if (!id || !backupName.trim()) {
      toast.error('Veuillez entrer un nom pour la sauvegarde');
      return;
    }

    setIsCreating(true);
    const result = await createBackup(id, backupName.trim(), backupDescription.trim() || undefined);
    setIsCreating(false);

    if (result) {
      setShowCreateDialog(false);
      setBackupName('');
      setBackupDescription('');
      fetchBackups(id);
    }
  };

  const handleRestore = async (backupId: string, backupName: string) => {
    if (!id) return;
    
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir restaurer la sauvegarde "${backupName}" ?\n\nCela écrasera la version actuelle de la campagne.`
    );
    
    if (confirmed) {
      const success = await restoreBackup(id, backupId);
      if (success) {
        setTimeout(() => navigate(`/campaign/${id}`), 1500);
      }
    }
  };

  const handleDelete = async (backupId: string, backupName: string) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la sauvegarde "${backupName}" ?\n\nCette action est irréversible.`
    );
    
    if (confirmed) {
      await deleteBackup(backupId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/campaign/${id}`)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Sauvegardes</h1>
              {campaign && (
                <p className="text-muted-foreground mt-1">{campaign.name}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouvelle sauvegarde
          </button>
        </div>

        {/* Backups List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-12">
            <Save className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground mb-2">Aucune sauvegarde</p>
            <p className="text-sm text-muted-foreground">
              Créez votre première sauvegarde pour sécuriser votre travail
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {backups.map((backup) => {
              const campaignName = backup.full_snapshot?.name || 'Sans nom';
              const campaignType = backup.full_snapshot?.type || backup.metadata?.type || 'wheel';
              
              return (
                <div
                  key={backup.id}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {backup.backup_name}
                        </h3>
                        <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                          {campaignType}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Campagne: <span className="font-medium text-foreground">{campaignName}</span>
                      </p>
                      {backup.description && (
                        <p className="text-sm text-muted-foreground mb-3 italic">
                          {backup.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(backup.created_at).toLocaleString('fr-FR')}
                        </div>
                        {backup.metadata?.revision && (
                          <div>Révision {backup.metadata.revision}</div>
                        )}
                        {backup.metadata?.status && (
                          <div className="capitalize">{backup.metadata.status}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestore(backup.id, backup.backup_name)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Restaurer cette sauvegarde"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(backup.id, backup.backup_name)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Supprimer cette sauvegarde"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Backup Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Créer une sauvegarde
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Nom de la sauvegarde *
                </label>
                <input
                  type="text"
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                  placeholder="Ex: Version finale avant lancement"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Description (optionnelle)
                </label>
                <textarea
                  value={backupDescription}
                  onChange={(e) => setBackupDescription(e.target.value)}
                  placeholder="Décrivez cette version..."
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleCreateBackup}
                disabled={isCreating || !backupName.trim()}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Création...' : 'Créer'}
              </button>
              <button
                onClick={() => {
                  setShowCreateDialog(false);
                  setBackupName('');
                  setBackupDescription('');
                }}
                disabled={isCreating}
                className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignBackupsPage;
