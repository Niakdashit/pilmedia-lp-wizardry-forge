import React from 'react';
import { Users, Target, BarChart, Calendar } from 'lucide-react';
import { DashboardStat } from './types';
const StatsGrid: React.FC = () => {
  const stats: DashboardStat[] = [{
    name: 'Campagnes actives',
    value: '5',
    change: '+2 cette semaine',
    icon: <Target className="w-6 h-6 text-[#E0004D]" />
  }, {
    name: 'Participations',
    value: '1254',
    change: '+18% ce mois',
    icon: <Users className="w-6 h-6 text-[#E0004D]" />
  }, {
    name: 'Taux de conversion',
    value: '42%',
    change: '+5% ce mois',
    icon: <BarChart className="w-6 h-6 text-[#E0004D]" />
  }, {
    name: 'Prochaine campagne',
    value: '2j',
    change: '10 avril',
    icon: <Calendar className="w-6 h-6 text-[#E0004D]" />
  }];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      {stats.map((stat, statIndex) => (
        <div key={statIndex} className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 my-[13px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-700 font-semibold">{stat.name}</p>
              <div className="mt-2 flex items-baseline space-x-2">
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              </div>
            </div>
            <div className="bg-[#f8e9f0] rounded-full p-3">
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;