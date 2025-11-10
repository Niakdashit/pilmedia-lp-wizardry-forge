import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CampaignStatisticsMinimal: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  console.log('🎯 CampaignStatisticsMinimal MOUNTED - ID:', id);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/campaigns')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux campagnes
        </button>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ✅ Statistiques - Test
          </h1>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              <strong>Campaign ID:</strong> {id}
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">
                ✅ La page fonctionne !
              </p>
              <p className="text-green-600 text-sm mt-2">
                Si vous voyez ce message, le composant se charge correctement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600 mt-2">Vues</div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600 mt-2">Participations</div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-purple-600">0%</div>
                <div className="text-sm text-gray-600 mt-2">Complétion</div>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-yellow-600">0</div>
                <div className="text-sm text-gray-600 mt-2">Conversions</div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
              <p className="text-blue-800 text-sm">
                ℹ️ <strong>Version de test minimale</strong> - Si cette page s'affiche, 
                nous pourrons ajouter progressivement les fonctionnalités.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignStatisticsMinimal;
