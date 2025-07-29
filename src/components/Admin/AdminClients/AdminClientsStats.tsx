
import React from 'react';
import { Users, Target } from 'lucide-react';
import { Client } from './types';

interface AdminClientsStatsProps {
  clients: Client[];
}

const AdminClientsStats: React.FC<AdminClientsStatsProps> = ({ clients }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Total Clients</p>
            <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Clients Actifs</p>
            <p className="text-2xl font-bold text-green-600">
              {clients.filter(c => c.status === 'active').length}
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Total Campagnes</p>
            <p className="text-2xl font-bold text-purple-600">
              {clients.reduce((sum, c) => sum + c.totalCampaigns, 0)}
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Taux Conversion Moyen</p>
            <p className="text-2xl font-bold text-orange-600">
              {clients.length > 0 ? (clients.reduce((sum, c) => sum + c.avgConversionRate, 0) / clients.length).toFixed(1) : 0}%
            </p>
          </div>
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Target className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminClientsStats;
