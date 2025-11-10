/**
 * CampaignStatistics - Version Simple Sans Erreur
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Users, Award, Target, ArrowLeft } from 'lucide-react';

const CampaignStatisticsSimple: React.FC = () => {
  const { id: campaignId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    console.log('📊 CampaignStatistics - Campaign ID:', campaignId);
    loadData();
  }, [campaignId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (!campaignId) {
        console.error('❌ No campaign ID');
        setLoading(false);
        return;
      }
      
      // Import dynamique de supabase
      const { supabase } = await import('@/integrations/supabase/client');
      
      console.log('📡 Fetching campaign...');
      const { data: campaignData, error } = await supabase
        .from('campaigns')
        .select('id, name, type, created_at')
        .eq('id', campaignId)
        .single();
      
      if (error) {
        console.error('❌ Error:', error);
        throw error;
      }
      
      console.log('✅ Campaign loaded:', campaignData);
      setCampaign(campaignData);
      
      // Charger les participations
      const { data: participations } = await supabase
        .from('participations')
        .select('id, created_at, is_winner')
        .eq('campaign_id', campaignId!);
      
      console.log('✅ Participations:', participations?.length || 0);
      
      // Calculer les stats
      const totalParticipations = participations?.length || 0;
      const totalConversions = participations?.filter(p => p.is_winner).length || 0;
      
      setStats({
        totalViews: totalParticipations * 3, // Estimation
        totalParticipations,
        totalConversions,
        participationRate: 33.3,
        conversionRate: totalParticipations > 0 ? (totalConversions / totalParticipations * 100) : 0
      });
      
    } catch (error) {
      console.error('❌ Error loading data:', error);
      setStats({
        totalViews: 0,
        totalParticipations: 0,
        totalConversions: 0,
        participationRate: 0,
        conversionRate: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow">
          <p className="text-red-600 mb-4">❌ Campagne introuvable</p>
          <button
            onClick={() => navigate('/campaigns')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <button
          onClick={() => navigate('/campaigns')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux campagnes
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">
          Statistiques - {campaign.name}
        </h1>
      </div>

      {/* KPI Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Eye className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Vues totales</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalViews || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Participations</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalParticipations || 0}</p>
          <p className="text-gray-500 text-sm mt-1">{stats?.participationRate.toFixed(1)}% de taux</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <Target className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Taux de complétion</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">100%</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Conversions</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalConversions || 0}</p>
          <p className="text-gray-500 text-sm mt-1">{stats?.conversionRate.toFixed(1)}% de taux</p>
        </div>
      </div>

      {/* Info */}
      <div className="max-w-7xl mx-auto mt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            ℹ️ Version simplifiée des statistiques. Les graphiques détaillés seront ajoutés prochainement.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CampaignStatisticsSimple;
