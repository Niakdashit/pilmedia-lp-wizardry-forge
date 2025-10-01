
import React from 'react';
import { Clock, AlertCircle, CheckCircle, Archive } from 'lucide-react';
import { RecentActivity } from './types';

interface AdminRecentActivityProps {
  activities: RecentActivity[];
}

const AdminRecentActivity: React.FC<AdminRecentActivityProps> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'campaign_created':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'participation_spike':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'campaign_published':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'status_change':
        return <Archive className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityBg = (type: string) => {
    switch (type) {
      case 'campaign_created':
        return 'bg-green-50';
      case 'participation_spike':
        return 'bg-orange-50';
      case 'campaign_published':
        return 'bg-blue-50';
      case 'status_change':
        return 'bg-gray-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Activité Récente</h3>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <div className={`flex-shrink-0 w-8 h-8 ${getActivityBg(activity.type)} rounded-full flex items-center justify-center mt-0.5`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1">{activity.message}</p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {activity.time}
                  </span>
                  {activity.clientName && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span className="mt-1 sm:mt-0 font-medium text-[#d4dbe8]">{activity.clientName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminRecentActivity;
