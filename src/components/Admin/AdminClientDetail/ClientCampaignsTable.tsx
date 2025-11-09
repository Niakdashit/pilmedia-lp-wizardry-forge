
import React from 'react';
import { Eye, Copy, Archive, Edit } from 'lucide-react';
import { getCampaignTypeIcon, CampaignType } from '../../../utils/campaignTypes';
import { ClientCampaign } from './types';

interface ClientCampaignsTableProps {
  campaigns: ClientCampaign[];
  filterStatus: string;
  setFilterStatus: (status: string) => void;
}

const ClientCampaignsTable: React.FC<ClientCampaignsTableProps> = ({ 
  campaigns, 
  filterStatus, 
  setFilterStatus 
}) => {
  const filteredCampaigns = campaigns.filter(campaign => 
    filterStatus === 'all' || campaign.status === filterStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'archived':
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
      case 'archived':
        return 'Archivé';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Campagnes du Client</h3>
          <select
            className="w-full sm:w-auto border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#44444d] text-sm bg-white"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="draft">Brouillon</option>
            <option value="archived">Archivé</option>
          </select>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden">
        {filteredCampaigns.map((campaign) => {
          const CampaignIcon = getCampaignTypeIcon(campaign.type as CampaignType);
          return (
            <div key={campaign.id} className="border-b border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    <CampaignIcon />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{campaign.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2">{campaign.description}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${getStatusColor(campaign.status)}`}>
                  {getStatusText(campaign.status)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3 text-xs text-gray-500">
                <div>
                  <div className="font-medium text-gray-700">Performance</div>
                  <div>{campaign.views.toLocaleString()} vues</div>
                  <div>{campaign.participants} participants</div>
                  <div className="text-green-600 font-medium">{campaign.conversionRate}% conversion</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Période</div>
                  <div>Début: {new Date(campaign.startDate).toLocaleDateString('fr-FR')}</div>
                  <div>Fin: {new Date(campaign.endDate).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-1">
                <button className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-orange-600 rounded-lg hover:bg-orange-50 transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                  <Archive className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campagne
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Période
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                  <td className="px-6 py-4 whitespace-nowrap max-w-xs">
                    <div>
                      <div className="text-sm font-medium text-gray-900 truncate">{campaign.name}</div>
                      <div className="text-sm text-gray-500 truncate">{campaign.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {getStatusText(campaign.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>{campaign.views.toLocaleString()} vues</div>
                      <div>{campaign.participants} participants</div>
                      <div className="text-green-600 font-medium">{campaign.conversionRate}% conversion</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>Début: {new Date(campaign.startDate).toLocaleDateString('fr-FR')}</div>
                      <div>Fin: {new Date(campaign.endDate).toLocaleDateString('fr-FR')}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-orange-600 rounded-lg hover:bg-orange-50 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">Aucune campagne ne correspond au filtre sélectionné.</p>
        </div>
      )}
    </div>
  );
};

export default ClientCampaignsTable;
