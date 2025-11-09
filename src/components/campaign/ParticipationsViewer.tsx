
import React, { useState, useEffect } from 'react';
import { Download, Eye, Calendar, Users } from 'lucide-react';
import { useParticipations, Participation } from '../../hooks/useParticipations';

interface ParticipationsViewerProps {
  campaignId: string;
  campaignName: string;
}

const ParticipationsViewer: React.FC<ParticipationsViewerProps> = ({ 
  campaignId, 
  campaignName 
}) => {
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [selectedParticipation, setSelectedParticipation] = useState<Participation | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const { getParticipationsByCampaign, exportParticipationsToCSV, loading } = useParticipations();

  useEffect(() => {
    loadParticipations();
  }, [campaignId]);

  const loadParticipations = async () => {
    const data = await getParticipationsByCampaign(campaignId);
    setParticipations(data);
  };

  const handleExport = () => {
    exportParticipationsToCSV(participations, campaignName);
  };

  const viewParticipation = (participation: Participation) => {
    setSelectedParticipation(participation);
    setShowModal(true);
  };

  if (loading) {
    return <div className="text-center py-8">Chargement des participations...</div>;
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Participations</h3>
          <button
            onClick={handleExport}
            disabled={participations.length === 0}
            className="flex items-center gap-2 bg-gradient-to-br from-[#44444d] to-[#44444d] text-white px-4 py-2 rounded-lg hover:bg-[#6d1550] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Total</span>
            </div>
            <p className="text-2xl font-bold text-blue-800">{participations.length}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">Aujourd'hui</span>
            </div>
            <p className="text-2xl font-bold text-green-800">
              {participations.filter(p => 
                p.created_at && new Date(p.created_at).toDateString() === new Date().toDateString()
              ).length}
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Cette semaine</span>
            </div>
            <p className="text-2xl font-bold text-purple-800">
              {participations.filter(p => {
                if (!p.created_at) return false;
                const participationDate = new Date(p.created_at);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return participationDate >= weekAgo;
              }).length}
            </p>
          </div>
        </div>
      </div>

      {/* Liste des participations */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h4 className="font-medium">Dernières participations</h4>
        </div>
        
        {participations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune participation pour le moment</p>
          </div>
        ) : (
          <div className="divide-y">
            {participations.slice(0, 10).map((participation) => (
              <div key={participation.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {participation.form_data.email || 'Email non fourni'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {participation.form_data.prenom} {participation.form_data.nom}
                    </p>
                    <p className="text-xs text-gray-400">
                      {participation.created_at ? new Date(participation.created_at).toLocaleString('fr-FR') : 'Date inconnue'}
                    </p>
                  </div>
                  <button
                    onClick={() => viewParticipation(participation)}
                    className="flex items-center gap-1 text-[#44444d] hover:bg-gradient-to-br hover:from-[#44444d] hover:to-[#44444d] hover:text-white px-3 py-1 rounded transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Voir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de détail */}
      {showModal && selectedParticipation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-lg w-full m-4 max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Détail de la participation</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <h4 className="font-medium mb-2">Informations générales</h4>
                <div className="bg-gray-50 rounded p-3 space-y-2 text-sm">
                  <p><span className="font-medium">Date :</span> {selectedParticipation.created_at ? new Date(selectedParticipation.created_at).toLocaleString('fr-FR') : 'Date inconnue'}</p>
                  <p><span className="font-medium">Email :</span> {selectedParticipation.user_email}</p>
                  {selectedParticipation.utm_source && (
                    <p><span className="font-medium">Source UTM :</span> {selectedParticipation.utm_source}</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Données du formulaire</h4>
                <div className="bg-gray-50 rounded p-3 space-y-2 text-sm">
                  {Object.entries(selectedParticipation.form_data).map(([key, value]) => (
                    <p key={key}>
                      <span className="font-medium capitalize">{key} :</span> {String(value)}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipationsViewer;
