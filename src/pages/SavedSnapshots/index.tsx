import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar, Search, Edit2, Trash2, Filter, Grid, List, ChevronDown, Copy, BarChart } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  thumbnail_url?: string | null;
  description?: string | null;
  total_participants?: number | null;
  total_views?: number | null;
}

const SavedSnapshots: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    filterAndSortCampaigns();
  }, [campaigns, searchQuery, sortBy, filterStatus, filterType]);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error('Vous devez être connecté');
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('created_by', user.user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Erreur lors du chargement des campagnes');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortCampaigns = () => {
    let filtered = [...campaigns];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(campaign =>
        campaign.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === filterStatus);
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(campaign => campaign.type === filterType);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return dateB - dateA;
      } else {
        return (a.name || '').localeCompare(b.name || '');
      }
    });

    setFilteredCampaigns(filtered);
  };

  const handleEdit = (campaign: Campaign) => {
    const editorRoutes: Record<string, string> = {
      wheel: '/design-editor',
      quiz: '/quiz-editor',
      scratch: '/scratch-editor',
      jackpot: '/jackpot-editor',
      form: '/form-editor',
    };

    const route = editorRoutes[campaign.type || 'wheel'];
    navigate(`${route}?campaign=${campaign.id}`);
  };

  const handleDuplicate = async (campaign: Campaign) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Fetch the full campaign data
      const { data: fullCampaign, error: fetchError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaign.id)
        .single();

      if (fetchError) throw fetchError;

      const { id, created_at, updated_at, ...campaignData } = fullCampaign as any;

      const newCampaign = {
        ...campaignData,
        name: `${campaign.name} (copie)`,
        created_by: user.user.id,
        status: 'draft',
        total_participants: 0,
        total_views: 0,
      };

      const { error } = await supabase
        .from('campaigns')
        .insert(newCampaign);

      if (error) throw error;

      toast.success('Campagne dupliquée');
      fetchCampaigns();
    } catch (error) {
      console.error('Error duplicating campaign:', error);
      toast.error('Erreur lors de la duplication');
    }
  };

  const handleDelete = async (campaignId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette campagne ? Cette action est irréversible.')) return;

    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;

      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
      toast.success('Campagne supprimée');
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      active: 'Actif',
      ended: 'Terminé',
      paused: 'Pause'
    };
    return labels[status] || status;
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      ended: 'bg-red-100 text-red-800',
      paused: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      wheel: 'Roue',
      quiz: 'Quiz',
      scratch: 'Grattage',
      jackpot: 'Jackpot',
      form: 'Formulaire'
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Chargement des campagnes...</p>
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
              <h1 className="text-3xl font-bold text-foreground">Mes Campagnes</h1>
              <p className="text-muted-foreground mt-1">
                Retrouvez et reprenez l'édition de vos campagnes
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Créer une campagne
            </button>
          </div>

          {/* Search and filters */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou description..."
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Trier par</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    >
                      <option value="date">Date de modification</option>
                      <option value="name">Nom</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Statut</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    >
                      <option value="all">Tous</option>
                      <option value="draft">Brouillon</option>
                      <option value="active">Actif</option>
                      <option value="ended">Terminé</option>
                      <option value="paused">Pause</option>
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
                      <option value="wheel">Roue</option>
                      <option value="quiz">Quiz</option>
                      <option value="scratch">Grattage</option>
                      <option value="jackpot">Jackpot</option>
                      <option value="form">Formulaire</option>
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
            {filteredCampaigns.length} campagne{filteredCampaigns.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Campaigns list */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={64} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Aucune campagne</h3>
            <p className="text-muted-foreground">
              {searchQuery || filterStatus !== 'all' || filterType !== 'all'
                ? 'Aucune campagne ne correspond à vos critères'
                : 'Créez votre première campagne pour la retrouver ici'}
            </p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-3">
            {filteredCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {campaign.thumbnail_url ? (
                      <img
                        src={campaign.thumbnail_url}
                        alt={campaign.name}
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
                        {campaign.name || 'Sans nom'}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeColor(campaign.status)}`}>
                        {getStatusLabel(campaign.status)}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        {getTypeLabel(campaign.type)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                      {campaign.description || 'Aucune description'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {campaign.updated_at && format(new Date(campaign.updated_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                      </span>
                      {(campaign.total_participants || 0) > 0 && (
                        <span className="flex items-center gap-1">
                          <BarChart size={14} />
                          {campaign.total_participants} participants
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(campaign)}
                      className="p-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                      title="Éditer"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDuplicate(campaign)}
                      className="p-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors"
                      title="Dupliquer"
                    >
                      <Copy size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(campaign.id)}
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
            {filteredCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-muted relative">
                  {campaign.thumbnail_url ? (
                    <img
                      src={campaign.thumbnail_url}
                      alt={campaign.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="text-muted-foreground" size={48} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeColor(campaign.status)}`}>
                      {getStatusLabel(campaign.status)}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-foreground truncate flex-1">
                      {campaign.name || 'Sans nom'}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      {getTypeLabel(campaign.type)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {campaign.description || 'Aucune description'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <Calendar size={14} />
                    {campaign.updated_at && format(new Date(campaign.updated_at), 'dd MMM yyyy', { locale: fr })}
                    {(campaign.total_participants || 0) > 0 && (
                      <>
                        <span>•</span>
                        <BarChart size={14} />
                        {campaign.total_participants}
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(campaign)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                    >
                      <Edit2 size={16} />
                      Éditer
                    </button>
                    <button
                      onClick={() => handleDuplicate(campaign)}
                      className="p-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors"
                      title="Dupliquer"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(campaign.id)}
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
