import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar, Search, Edit2, Trash2, Filter, Grid, List, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Snapshot {
  id: string;
  campaign_id: string;
  revision: number;
  snapshot_type: 'auto' | 'manual' | 'publish';
  description: string;
  created_at: string;
  created_by: string;
  config?: any;
  design?: any;
  game_config?: any;
  article_config?: any;
  form_fields?: any;
  campaign?: {
    id: string;
    name: string;
    type: string;
    thumbnail_url?: string;
  };
}

const SavedSnapshots: React.FC = () => {
  const navigate = useNavigate();
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [filteredSnapshots, setFilteredSnapshots] = useState<Snapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [filterType, setFilterType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchSnapshots();
  }, []);

  useEffect(() => {
    filterAndSortSnapshots();
  }, [snapshots, searchQuery, sortBy, filterType]);

  const fetchSnapshots = async () => {
    setIsLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error('Vous devez être connecté');
        navigate('/auth');
        return;
      }

      // Fetch all campaigns for this user
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, name, type, thumbnail_url')
        .eq('created_by', user.user.id);

      if (campaignsError) throw campaignsError;

      // Fetch all snapshots for these campaigns
      const campaignIds = campaigns?.map(c => c.id) || [];
      
      if (campaignIds.length === 0) {
        setSnapshots([]);
        setIsLoading(false);
        return;
      }

      const { data: snapshotsData, error: snapshotsError } = await supabase
        .from('campaign_snapshots')
        .select('*')
        .in('campaign_id', campaignIds)
        .order('created_at', { ascending: false });

      if (snapshotsError) throw snapshotsError;

      // Combine snapshots with campaign info
      const combinedData = snapshotsData?.map(snapshot => {
        const campaign = campaigns?.find(c => c.id === snapshot.campaign_id);
        return {
          ...snapshot,
          campaign
        };
      }) || [];

      setSnapshots(combinedData as Snapshot[]);
    } catch (error) {
      console.error('Error fetching snapshots:', error);
      toast.error('Erreur lors du chargement des sauvegardes');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortSnapshots = () => {
    let filtered = [...snapshots];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(snapshot =>
        snapshot.campaign?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snapshot.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(snapshot => snapshot.snapshot_type === filterType);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return (a.campaign?.name || '').localeCompare(b.campaign?.name || '');
      }
    });

    setFilteredSnapshots(filtered);
  };

  const handleEdit = async (snapshot: Snapshot) => {
    // Navigate to editor with snapshot id as query param
    const editorRoutes: Record<string, string> = {
      wheel: '/design-editor',
      quiz: '/quiz-editor',
      scratch: '/scratch-editor',
      jackpot: '/jackpot-editor',
      form: '/form-editor',
    };

    const route = editorRoutes[snapshot.campaign?.type || 'wheel'];
    navigate(`${route}?campaign=${snapshot.campaign_id}&snapshot=${snapshot.id}`);
  };

  const handleDelete = async (snapshotId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette sauvegarde ?')) return;

    try {
      const { error } = await supabase
        .from('campaign_snapshots')
        .delete()
        .eq('id', snapshotId);

      if (error) throw error;

      setSnapshots(prev => prev.filter(s => s.id !== snapshotId));
      toast.success('Sauvegarde supprimée');
    } catch (error) {
      console.error('Error deleting snapshot:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      auto: 'Automatique',
      manual: 'Manuelle',
      publish: 'Publication'
    };
    return labels[type] || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      auto: 'bg-blue-100 text-blue-800',
      manual: 'bg-green-100 text-green-800',
      publish: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des sauvegardes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mes Sauvegardes</h1>
              <p className="text-muted-foreground mt-1">
                Retrouvez et reprenez l'édition de vos campagnes sauvegardées
              </p>
            </div>
            <button
              onClick={() => navigate('/campaigns')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Retour aux campagnes
            </button>
          </div>

          {/* Search and filters */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par nom de campagne ou description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <Filter size={20} />
                Filtres
                <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filters panel */}
            {showFilters && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Trier par</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    >
                      <option value="date">Date de création</option>
                      <option value="name">Nom de campagne</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Type</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    >
                      <option value="all">Tous</option>
                      <option value="manual">Manuelles</option>
                      <option value="auto">Automatiques</option>
                      <option value="publish">Publications</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Affichage</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background border border-border'
                        }`}
                      >
                        <List size={20} />
                        Liste
                      </button>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background border border-border'
                        }`}
                      >
                        <Grid size={20} />
                        Grille
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            {filteredSnapshots.length} sauvegarde{filteredSnapshots.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Snapshots list */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {filteredSnapshots.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={64} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Aucune sauvegarde</h3>
            <p className="text-muted-foreground">
              {searchQuery || filterType !== 'all'
                ? 'Aucune sauvegarde ne correspond à vos critères'
                : 'Créez des sauvegardes de vos campagnes pour les retrouver ici'}
            </p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-3">
            {filteredSnapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {snapshot.campaign?.thumbnail_url ? (
                      <img
                        src={snapshot.campaign.thumbnail_url}
                        alt={snapshot.campaign.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                        <Calendar className="text-muted-foreground" size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-foreground truncate">
                        {snapshot.campaign?.name || 'Sans nom'}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getTypeBadgeColor(snapshot.snapshot_type)}`}>
                        {getTypeLabel(snapshot.snapshot_type)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {snapshot.description || `Révision ${snapshot.revision}`}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {format(new Date(snapshot.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(snapshot)}
                      className="p-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                      title="Éditer"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(snapshot.id)}
                      className="p-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSnapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-muted relative">
                  {snapshot.campaign?.thumbnail_url ? (
                    <img
                      src={snapshot.campaign.thumbnail_url}
                      alt={snapshot.campaign.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="text-muted-foreground" size={48} />
                    </div>
                  )}
                  <span className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full ${getTypeBadgeColor(snapshot.snapshot_type)}`}>
                    {getTypeLabel(snapshot.snapshot_type)}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-foreground truncate mb-2">
                    {snapshot.campaign?.name || 'Sans nom'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {snapshot.description || `Révision ${snapshot.revision}`}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <Calendar size={14} />
                    {format(new Date(snapshot.created_at), 'dd MMM yyyy', { locale: fr })}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(snapshot)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                    >
                      <Edit2 size={16} />
                      Éditer
                    </button>
                    <button
                      onClick={() => handleDelete(snapshot.id)}
                      className="p-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedSnapshots;
