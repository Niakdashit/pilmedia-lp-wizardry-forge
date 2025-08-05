import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, Eye, Copy, Archive, Trash2, ChevronDown, BarChart2, ExternalLink, MoreVertical, Zap } from 'lucide-react';
import PageHeader from '../components/Layout/PageHeader';
import { getCampaignTypeIcon, CampaignType } from '../utils/campaignTypes';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: any;
  position: { x: number; y: number };
}

const ActionModal: React.FC<ActionModalProps> = ({ isOpen, onClose, campaign, position }) => {
  if (!isOpen || !campaign) return null;
  const actions = [
    { icon: <Eye className="w-5 h-5" />, label: 'Voir', href: `/campaign/${campaign.id}`, color: 'text-gray-700' },
    { icon: <BarChart2 className="w-5 h-5" />, label: 'Statistiques', color: 'text-gray-700' },
    { icon: <ExternalLink className="w-5 h-5" />, label: 'Voir en ligne', color: 'text-gray-700' },
    { icon: <Copy className="w-5 h-5" />, label: 'Dupliquer', color: 'text-gray-700' },
    { icon: <Archive className="w-5 h-5" />, label: 'Archiver', color: 'text-gray-700' },
    { icon: <Trash2 className="w-5 h-5" />, label: 'Supprimer', color: 'text-red-600' },
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
              onClick={onClose}
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

  // --- MOCK DATA ---
  const mockCampaigns = [
    {
      id: '1',
      name: 'Quiz Marketing Digital',
      description: 'Quiz pour évaluer les connaissances en marketing digital',
      status: 'active',
      participants: 342,
      startDate: '2025-03-15',
      endDate: '2025-04-15',
      type: 'quiz',
    },
    {
      id: '2',
      name: 'Concours Photo Été',
      description: 'Concours de photos estivales avec nos produits',
      status: 'draft',
      participants: 0,
      startDate: '2025-06-01',
      endDate: '2025-07-15',
      type: 'contest',
    },
    {
      id: '3',
      name: 'Sondage Satisfaction Client',
      description: 'Évaluation de la satisfaction client après achat',
      status: 'scheduled',
      participants: 0,
      startDate: '2025-04-10',
      endDate: '2025-05-10',
      type: 'survey',
    },
    {
      id: '4',
      name: 'Roue de la Fortune Soldes',
      description: 'Roue de la fortune pour gagner des réductions',
      status: 'ended',
      participants: 1256,
      startDate: '2025-02-01',
      endDate: '2025-03-01',
      type: 'wheel',
    },
    {
      id: '5',
      name: 'Jackpot Anniversaire',
      description: 'Tentez de gagner le jackpot pour notre anniversaire',
      status: 'active',
      participants: 458,
      startDate: '2025-07-01',
      endDate: '2025-07-31',
      type: 'jackpot',
    },
  ];

  const filteredCampaigns = mockCampaigns
    .filter((campaign) => {
      const matchesSearch =
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || campaign.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          : new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      }
      return 0;
    });

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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'draft':
        return 'Brouillon';
      case 'scheduled':
        return 'Programmé';
      case 'ended':
        return 'Terminé';
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

  return (
    <div className="-mx-6 -mt-6">
      <PageHeader
        title="Campagnes"
        size="sm"
        actions={
          <div className="flex gap-x-4">
            <Link
              to="/quick-campaign"
              className="inline-flex items-center px-6 py-2.5 bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white font-semibold rounded-xl hover:bg-[#6d164f] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-base"
            >
              <Zap className="w-5 h-5 mr-2" />
              Création rapide
            </Link>
            <Link
              to="/campaign-editor"
              className="inline-flex items-center px-6 py-2.5 bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white font-semibold rounded-xl hover:bg-[#6d164f] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-base"
            >
              <Plus className="w-5 h-5 mr-2" />
              Éditeur de Jeux
            </Link>
          </div>
        }
      />

      <div className="px-6">
        <div className="bg-white rounded-xl shadow-sm mt-6">
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
                  return (
                    <tr key={campaign.id} className="hover:bg-gray-50 transition-colors duration-200">
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
                              onChange={() => {}}
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
                        {new Date(campaign.startDate).toLocaleDateString('fr-FR')} - {new Date(campaign.endDate).toLocaleDateString('fr-FR')}
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
      </div>
      <ActionModal
        isOpen={selectedCampaign !== null}
        onClose={() => setSelectedCampaign(null)}
        campaign={selectedCampaign}
        position={modalPosition}
      />
    </div>
  );
};

export default Campaigns;
