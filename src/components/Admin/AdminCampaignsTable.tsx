
import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, MoreHorizontal, TrendingUp, Users } from 'lucide-react';
import { AdminCampaign } from './types';

interface AdminCampaignsTableProps {
  campaigns: AdminCampaign[];
}

const AdminCampaignsTable: React.FC<AdminCampaignsTableProps> = ({ campaigns }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Actif</span>;
      case 'draft':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Brouillon</span>;
      case 'archived':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Archivé</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <h3 className="text-lg font-semibold text-gray-900">Campagnes Récentes</h3>
          <Link
            to="/admin/campaigns"
            className="inline-flex items-center px-4 py-2 bg-[#841b60] text-white text-sm font-medium rounded-lg hover:bg-[#6d164f] transition-colors"
          >
            Voir tout
          </Link>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campagne</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                    <div className="text-xs text-gray-500 line-clamp-1">{campaign.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Link to={`/admin/clients/${campaign.clientId}`} className="text-sm text-[#841b60] hover:underline">
                    {campaign.clientName}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(campaign.status)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-900">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1 text-gray-400" />
                      {campaign.participants}
                    </span>
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1 text-gray-400" />
                      {campaign.views}
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1 text-gray-400" />
                      {campaign.conversionRate}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div>Du {new Date(campaign.startDate).toLocaleDateString('fr-FR')}</div>
                  <div>Au {new Date(campaign.endDate).toLocaleDateString('fr-FR')}</div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden divide-y divide-gray-200">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 mb-1">{campaign.name}</h4>
                <p className="text-xs text-gray-500 line-clamp-2">{campaign.description}</p>
              </div>
              <div className="ml-3 flex-shrink-0">
                {getStatusBadge(campaign.status)}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <Link to={`/admin/clients/${campaign.clientId}`} className="text-[#841b60] hover:underline">
                {campaign.clientName}
              </Link>
              <span>{new Date(campaign.startDate).toLocaleDateString('fr-FR')}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-xs text-gray-500">
                <span className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {campaign.participants}
                </span>
                <span className="flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  {campaign.views}
                </span>
                <span className="flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {campaign.conversionRate}%
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Eye className="w-3 h-3" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Edit className="w-3 h-3" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <MoreHorizontal className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCampaignsTable;
