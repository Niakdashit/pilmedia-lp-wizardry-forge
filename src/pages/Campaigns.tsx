import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Eye, Copy, Archive, Trash2, ChevronDown, BarChart2, ExternalLink, MoreVertical } from 'lucide-react';
import PageHeader from '../components/Layout/PageHeader';
import { getCampaignTypeIcon, CampaignType } from '../utils/campaignTypes';
import { useCampaignsList } from '../hooks/useCampaignsList';
import { useCampaigns } from '@/hooks/useCampaigns';
import { supabase } from '@/integrations/supabase/client';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { getEditorUrl } from '@/utils/editorRouting';
import { useEffect } from 'react';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: any;
  position: { x: number; y: number };
  onDelete: (id: string, name?: string) => Promise<void> | void;
  onArchive: (id: string) => Promise<void>;
  onDuplicate: (id: string) => Promise<void>;
  onViewOnline: (campaign: any) => void;
  onStats: (id: string) => void;
}

const ActionModal: React.FC<ActionModalProps> = ({ isOpen, onClose, campaign, position, onDelete, onArchive, onDuplicate, onViewOnline, onStats }) => {
  if (!isOpen || !campaign) return null;
  const actions = [
    { icon: <Eye className="w-5 h-5" />, label: 'Voir', href: `/campaign/${campaign.id}`, color: 'text-gray-700' },
    { icon: <BarChart2 className="w-5 h-5" />, label: 'Statistiques', onClick: () => onStats(campaign.id), color: 'text-gray-700' },
    { icon: <ExternalLink className="w-5 h-5" />, label: 'Voir en ligne', onClick: () => onViewOnline(campaign), color: 'text-gray-700' },
    { icon: <Copy className="w-5 h-5" />, label: 'Dupliquer', onClick: () => onDuplicate(campaign.id), color: 'text-gray-700' },
    { icon: <Archive className="w-5 h-5" />, label: 'Archiver', onClick: () => onArchive(campaign.id), color: 'text-gray-700' },
    { icon: <Trash2 className="w-5 h-5" />, label: 'Supprimer', onClick: () => onDelete(campaign.id, campaign.name), color: 'text-red-600' },
  ];
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="absolute z-50 bg-white rounded-lg shadow-lg py-1 min-w-[200px]"
        style={{ top: position.y, left: position.x, transform: 'translateX(-90%)' }}
      >
        {actions.map((action, index) =>
          action.href ? (
            <Link
              key={index}
              to={action.href}
              className={`${action.color} hover:bg-gray-100 px-4 py-2 flex items-center space-x-3 text-sm`}
            >
              {action.icon}
              <span>{action.label}</span>
            </Link>
          ) : (
            <button
              key={index}
              onClick={async () => {
                try {
                  await action.onClick?.();
                } finally {
                  onClose();
                }
              }}
              className={`${action.color} hover:bg-gray-100 px-4 py-2 flex items-center space-x-3 text-sm w-full text-left`}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          )
        )}
      </div>
    </>
  );
};

const Campaigns: React.FC = () => {
  const navigate = useNavigate();
  const { campaigns, loading, error, updateCampaignStatus, deleteCampaign, refetch } = useCampaignsList();
  const { getCampaign } = useCampaigns();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [showEditorMenu, setShowEditorMenu] = useState(false);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);

  const editorOptions = [
    { name: 'Roue de la Fortune', path: '/design-editor', icon: '🎯' },
    { name: 'Quiz Interactif', path: '/quiz-editor', icon: '❓' },
    { name: 'Jackpot', path: '/jackpot-editor', icon: '💰' },
    { name: 'Carte à Gratter', path: '/scratch-editor', icon: '🎁' },
    { name: 'Formulaire', path: '/form-editor', icon: '📝' }
  ];

  const prefetchedCampaignIdsRef = useRef<Set<string>>(new Set());
  const prefetchCampaign = useCallback(
    async (id: string | undefined | null) => {
      if (!id || prefetchedCampaignIdsRef.current.has(id)) return;
      try {
        prefetchedCampaignIdsRef.current.add(id);
        await getCampaign(id);
      } catch {
        // ignore prefetch errors; actual navigation will handle them
      }
    },
    [getCampaign]
  );

  const filteredCampaigns = useMemo(() => campaigns
    .filter((campaign) => {
      const matchesSearch =
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (campaign.description && campaign.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = filterStatus === 'all' || campaign.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc'
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return 0;
    }), [campaigns, filterStatus, searchTerm, sortBy, sortOrder]);

  // Keep list in sync when a campaign name is updated elsewhere (settings/editor)
  useEffect(() => {
    const handler = (_e: Event) => {
      // silent refresh to avoid flicker
      try { (refetch as any)({ suppressLoading: true }); } catch { refetch?.(); }
    };
    window.addEventListener('campaign:name:update', handler as EventListener);
    window.addEventListener('campaign:updated', handler as EventListener);
    return () => {
      window.removeEventListener('campaign:name:update', handler as EventListener);
      window.removeEventListener('campaign:updated', handler as EventListener);
    };
  }, [refetch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'ended':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'En ligne';
      case 'draft':
        return 'Brouillon';
      case 'scheduled':
        return 'Programmé';
      case 'ended':
        return 'Terminée';
      case 'paused':
        return 'En pause';
      default:
        return status;
    }
  };

  const handleActionClick = (e: React.MouseEvent, campaign: any) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setModalPosition({
      x: rect.left,
      y: rect.bottom + window.scrollY + 5,
    });
    setSelectedCampaign(campaign);
  };

  const handleStatusToggle = async (campaignId: string, currentStatus: string) => {
    // Toggle isActive flag in database to enable/disable campaign regardless of dates
    const isCurrentlyActive = currentStatus === 'active' || currentStatus === 'paused';
    try {
      // Fetch current config
      const { data: campaign, error: fetchError } = await supabase
        .from('campaigns')
        .select('config')
        .eq('id', campaignId)
        .single();

      if (fetchError) throw fetchError;

      const currentConfig = (campaign?.config && typeof campaign.config === 'object' && !Array.isArray(campaign.config)) 
        ? campaign.config 
        : {};
      const updatedConfig = {
        ...(currentConfig as Record<string, any>),
        isActive: !isCurrentlyActive
      };

      const { error } = await supabase
        .from('campaigns')
        .update({ config: updatedConfig })
        .eq('id', campaignId);

      if (error) throw error;
      await refetch();
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
    }
  };

  // Confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState<string>('');
  const [confirmDesc, setConfirmDesc] = useState<string>('');
  const [confirmDanger, setConfirmDanger] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<() => Promise<void>>(async () => {});

  const openConfirm = (opts: { title: string; description?: string; danger?: boolean; onConfirm: () => Promise<void> }) => {
    setConfirmTitle(opts.title);
    setConfirmDesc(opts.description || '');
    setConfirmDanger(!!opts.danger);
    setConfirmAction(() => opts.onConfirm);
    setConfirmOpen(true);
  };

  const handleDelete = async (id: string, name?: string) => {
    openConfirm({
      title: 'Supprimer la campagne',
      description: `Confirmez la suppression${name ? ` de "${name}"` : ''}. Cette action est définitive.`,
      danger: true,
      onConfirm: async () => {
        await deleteCampaign(id);
        setConfirmOpen(false);
      }
    });
  };

  const handleArchive = async (id: string) => {
    await updateCampaignStatus(id, 'ended' as any);
  };

  const handleDuplicate = async (id: string) => {
    // Récupérer la campagne complète puis créer une copie en brouillon
    const { data, error } = await supabase.from('campaigns').select('*').eq('id', id).single();
    if (error || !data) return;
    const copy = {
      ...data,
      id: undefined,
      name: `${data.name || 'Campagne'} (copie)`,
      status: 'draft',
      created_at: undefined,
    } as any;
    const { error: insertError } = await supabase.from('campaigns').insert(copy);
    if (!insertError) await refetch();
  };

  const handleViewOnline = (campaign: any) => {
    // Tente d'ouvrir l'URL publique depuis config ou un champ dédié
    const publicUrl = (campaign as any).public_url || (campaign as any).url || undefined;
    if (publicUrl) {
      window.open(publicUrl, '_blank');
    } else {
      alert("URL publique non configurée pour cette campagne.");
    }
  };

  const handleStats = (id: string) => {
    navigate(`/stats/${id}`);
  };

  const handleSelectAll = () => {
    if (selectedCampaigns.length === filteredCampaigns.length) {
      setSelectedCampaigns([]);
    } else {
      setSelectedCampaigns(filteredCampaigns.map(c => c.id));
    }
  };

  const handleSelectCampaign = (id: string) => {
    setSelectedCampaigns(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    openConfirm({
      title: 'Supprimer les campagnes sélectionnées',
      description: `Confirmez la suppression de ${selectedCampaigns.length} campagne(s). Cette action est définitive.`,
      danger: true,
      onConfirm: async () => {
        await Promise.all(selectedCampaigns.map(id => deleteCampaign(id)));
        setSelectedCampaigns([]);
        setConfirmOpen(false);
      }
    });
  };

  return (
    <div className="-mx-6 -mt-6">
      <PageHeader
        title="Campagnes"
        size="sm"
        actions={
          <div className="relative">
            <button
              onClick={() => setShowEditorMenu(!showEditorMenu)}
              className="flex items-center gap-2 bg-[#841b60] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#6d154d] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouvelle campagne
              <ChevronDown className={`w-4 h-4 transition-transform ${showEditorMenu ? 'rotate-180' : ''}`} />
            </button>

            {showEditorMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowEditorMenu(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {editorOptions.map((option) => (
                    <Link
                      key={option.path}
                      to={option.path}
                      onClick={() => setShowEditorMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <span className="text-gray-700 font-medium">{option.name}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        }
      />

      <div className="px-6">
        {loading && (
          <div className="bg-white rounded-xl shadow-sm mt-6 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#841b60] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des campagnes...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl mt-6 p-4">
            <p className="text-red-800">Erreur lors du chargement des campagnes: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-xl shadow-sm mt-6">
            {selectedCampaigns.length > 0 && (
              <div className="p-4 bg-[#841b60] text-white flex items-center justify-between">
                <span className="font-medium">
                  {selectedCampaigns.length} campagne(s) sélectionnée(s)
                </span>
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-2 bg-white text-[#841b60] px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer la sélection
                </button>
              </div>
            )}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Rechercher une campagne..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="text-gray-400 w-5 h-5" />
                  <select
                    className="border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#841b60]"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="draft">Brouillon</option>
                    <option value="scheduled">Programmé</option>
                    <option value="ended">Terminé</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      <input
                        type="checkbox"
                        checked={selectedCampaigns.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-[#841b60] border-gray-300 rounded focus:ring-[#841b60]"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="flex items-center space-x-1"
                        onClick={() => {
                          setSortBy('date');
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        }}
                      >
                        <span>Campagne</span>
                        <ChevronDown className={`w-4 h-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participants
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Période
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCampaigns.map((campaign) => {
                    const CampaignIcon = getCampaignTypeIcon(campaign.type as CampaignType);
                    
                    const handleRowClick = (e: React.MouseEvent) => {
                      // Ignore clicks on interactive elements (toggle, action button)
                      const target = e.target as HTMLElement;
                      if (target.closest('input, button, a')) return;
                      
                      // Preserve editor_mode from campaign data
                      const editorMode = (campaign as any)?.editor_mode === 'article' ? 'article' : undefined;
                      const baseUrl = getEditorUrl(campaign.type, campaign.id, editorMode as 'article' | 'fullscreen' | undefined);
                      // Add openSettings parameter to automatically open settings modal
                      const editorUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}openSettings=true`;
                      navigate(editorUrl);
                    };
                    
                    return (
                      <tr 
                        key={campaign.id} 
                        className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                        onClick={handleRowClick}
                        onMouseEnter={() => prefetchCampaign(campaign.id)}
                        onFocus={() => prefetchCampaign(campaign.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedCampaigns.includes(campaign.id)}
                            onChange={() => handleSelectCampaign(campaign.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 text-[#841b60] border-gray-300 rounded focus:ring-[#841b60]"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <CampaignIcon />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                              <div className="text-sm text-gray-500">{campaign.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <label className="relative inline-flex items-center cursor-pointer mr-3">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={campaign.status === 'active'}
                                onChange={() => handleStatusToggle(campaign.id, campaign.status)}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#841b60]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-br peer-checked:from-[#841b60] peer-checked:to-[#b41b60]"></div>
                            </label>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                              {getStatusText(campaign.status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.participants}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {campaign.startDate && campaign.endDate 
                            ? `${new Date(campaign.startDate).toLocaleDateString('fr-FR')} - ${new Date(campaign.endDate).toLocaleDateString('fr-FR')}`
                            : 'Non défini'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => handleActionClick(e, campaign)}
                            className="p-2 text-gray-500 hover:text-[#841b60] rounded-lg hover:bg-gray-100 transition-colors duration-200 relative"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredCampaigns.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500">Aucune campagne ne correspond à votre recherche.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ActionModal
        isOpen={selectedCampaign !== null}
        onClose={() => setSelectedCampaign(null)}
        campaign={selectedCampaign}
        position={modalPosition}
        onDelete={handleDelete}
        onArchive={handleArchive}
        onDuplicate={handleDuplicate}
        onViewOnline={handleViewOnline}
        onStats={handleStats}
      />

      <ConfirmModal
        isOpen={confirmOpen}
        title={confirmTitle}
        description={confirmDesc}
        danger={confirmDanger}
        confirmText="Supprimer"
        cancelText="Annuler"
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmAction}
      />
    </div>
  );
};

export default Campaigns;
