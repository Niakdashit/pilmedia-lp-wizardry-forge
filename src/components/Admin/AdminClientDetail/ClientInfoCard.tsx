
import React from 'react';
import { BarChart2, Users, Target } from 'lucide-react';
import { ClientData, ClientCampaign } from './types';

interface ClientInfoCardProps {
  clientData: ClientData;
  campaigns: ClientCampaign[];
}

const ClientInfoCard: React.FC<ClientInfoCardProps> = ({ clientData, campaigns }) => {
  const totalViews = campaigns.reduce((sum, c) => sum + c.views, 0);
  const totalParticipants = campaigns.reduce((sum, c) => sum + c.participants, 0);
  const avgConversion = campaigns.length > 0 
    ? campaigns.reduce((sum, c) => sum + c.conversionRate, 0) / campaigns.length 
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Client</h3>
          <div className="space-y-3">
            <div className="min-w-0">
              <label className="text-sm font-medium text-gray-500">Contact Principal</label>
              <p className="text-gray-900 truncate">{clientData.name}</p>
            </div>
            <div className="min-w-0">
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900 break-all">{clientData.email}</p>
            </div>
            <div className="min-w-0">
              <label className="text-sm font-medium text-gray-500">Téléphone</label>
              <p className="text-gray-900 break-all">{clientData.phone}</p>
            </div>
            <div className="min-w-0">
              <label className="text-sm font-medium text-gray-500">Site Web</label>
              <a href={clientData.website} target="_blank" rel="noopener noreferrer" 
                 className="text-blue-600 hover:text-blue-800 break-all">
                {clientData.website}
              </a>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques Globales</h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg min-w-0">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-blue-600 font-medium">Total Vues</p>
                  <p className="text-lg sm:text-xl font-bold text-blue-900 truncate">{totalViews.toLocaleString()}</p>
                </div>
                <BarChart2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0 ml-2" />
              </div>
            </div>
            <div className="bg-green-50 p-3 sm:p-4 rounded-lg min-w-0">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-green-600 font-medium">Participants</p>
                  <p className="text-lg sm:text-xl font-bold text-green-900 truncate">{totalParticipants.toLocaleString()}</p>
                </div>
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0 ml-2" />
              </div>
            </div>
            <div className="bg-purple-50 p-3 sm:p-4 rounded-lg min-w-0">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-purple-600 font-medium">Campagnes</p>
                  <p className="text-lg sm:text-xl font-bold text-purple-900 truncate">{campaigns.length}</p>
                </div>
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0 ml-2" />
              </div>
            </div>
            <div className="bg-orange-50 p-3 sm:p-4 rounded-lg min-w-0">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-orange-600 font-medium">Conversion Moy.</p>
                  <p className="text-lg sm:text-xl font-bold text-orange-900 truncate">{avgConversion.toFixed(1)}%</p>
                </div>
                <BarChart2 className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 flex-shrink-0 ml-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {clientData.notes && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
          <p className="text-gray-900 break-words">{clientData.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ClientInfoCard;
