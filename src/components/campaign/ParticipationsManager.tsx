
import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Calendar, Mail, Users } from 'lucide-react';
import { useParticipations, Participation } from '../../hooks/useParticipations';

interface ParticipationsManagerProps {
  campaignId: string;
  campaignName: string;
}

const ParticipationsManager: React.FC<ParticipationsManagerProps> = ({ 
  campaignId, 
  campaignName 
}) => {
  const [participations, setParticipations] = useState<Participation[]>([]);
  const { 
    loading, 
    error, 
    getParticipationsByCampaign, 
    exportParticipationsToCSV 
  } = useParticipations();

  const loadParticipations = async () => {
    const data = await getParticipationsByCampaign(campaignId);
    setParticipations(data);
  };

  useEffect(() => {
    if (campaignId) {
      loadParticipations();
    }
  }, [campaignId]);

  const handleExport = () => {
    exportParticipationsToCSV(participations, campaignName);
  };

  const getUniqueEmails = () => {
    const emails = new Set();
    participations.forEach(p => {
      if (p.user_email) emails.add(p.user_email);
    });
    return emails.size;
  };

  const getParticipationsByDay = () => {
    const today = new Date().toDateString();
    return participations.filter(p => 
      p.created_at && new Date(p.created_at).toDateString() === today
    ).length;
  };

  if (loading && participations.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Chargement des participations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total participations</p>
              <p className="text-2xl font-bold text-gray-900">{participations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Mail className="w-8 h-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Emails uniques</p>
              <p className="text-2xl font-bold text-gray-900">{getUniqueEmails()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-900">{getParticipationsByDay()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Liste des participations</h3>
        <div className="flex gap-2">
          <button
            onClick={loadParticipations}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button
            onClick={handleExport}
            disabled={participations.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-[#d4dbe8] to-[#b41b60] text-white rounded-lg hover:bg-[#6d1550] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Erreur : {error}</p>
        </div>
      )}

      {/* Liste des participations */}
      {participations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Aucune participation</p>
          <p className="text-sm">Les participations apparaîtront ici une fois que les utilisateurs auront rempli le formulaire.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Données
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {participations.map((participation) => (
                  <tr key={participation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {participation.created_at ? new Date(participation.created_at).toLocaleString('fr-FR') : 'Date inconnue'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {participation.user_email || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs">
                        {Object.entries(participation.form_data).map(([key, value]) => (
                          <div key={key} className="truncate">
                            <span className="font-medium">{key}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {participation.utm_source || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipationsManager;
