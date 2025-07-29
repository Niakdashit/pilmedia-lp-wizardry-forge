
import React from 'react';
import { TrendingUp, Users, Target, Eye } from 'lucide-react';
import { AdminStats } from './types';

interface AdminKPICardsProps {
  stats: AdminStats;
}

const AdminKPICards: React.FC<AdminKPICardsProps> = ({ stats }) => {
  const kpiData = [
    {
      title: 'Campagnes Totales',
      value: stats.totalCampaigns,
      icon: Target,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Campagnes Actives',
      value: stats.activeCampaigns,
      icon: TrendingUp,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100'
    },
    {
      title: 'Clients Totaux',
      value: stats.totalClients,
      icon: Users,
      bgColor: 'bg-[#fdf2f8]',
      iconColor: 'text-[#841b60]',
      iconBg: 'bg-[#fce7f3]'
    },
    {
      title: 'Participations',
      value: stats.totalParticipations.toLocaleString(),
      icon: Eye,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpiData.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">{kpi.title}</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">{kpi.value}</p>
              </div>
              <div className={`w-12 h-12 ${kpi.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 ml-4`}>
                <Icon className={`w-6 h-6 ${kpi.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminKPICards;
