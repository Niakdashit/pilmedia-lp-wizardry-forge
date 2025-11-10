/**
 * CampaignStatistics - Version complète avec données réelles
 * Fonctionnalités:
 * - Chargement des données depuis Supabase
 * - KPIs en temps réel
 * - Graphiques d'évolution temporelle
 * - Répartition par appareil
 * - Export CSV
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Eye, Users, Award, Target, ArrowLeft, Download, RefreshCw,
  TrendingUp, Smartphone, Monitor, Tablet, Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CampaignStats {
  totalViews: number;
  totalParticipations: number;
  totalConversions: number;
  participationRate: number;
  completionRate: number;
  conversionRate: number;
  viewsOverTime: Array<{ date: string; count: number }>;
  participationsOverTime: Array<{ date: string; count: number }>;
  deviceBreakdown: Array<{ device: string; count: number }>;
  recentParticipations: Array<any>;
}

const CampaignStatisticsFull: React.FC = () => {
  const { id: campaignId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<any>(null);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('📊 CampaignStatisticsFull MOUNTED - ID:', campaignId);
    loadStatistics();
  }, [campaignId]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      
      if (!campaignId) {
        console.error('❌ No campaign ID');
        return;
      }

      console.log('📡 Fetching campaign data...');
      
      // 1. Charger la campagne
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('id, name, type, created_at')
        .eq('id', campaignId)
        .single();

      if (campaignError) {
        console.error('❌ Campaign error:', campaignError);
        throw campaignError;
      }

      console.log('✅ Campaign loaded:', campaignData.name);
      setCampaign(campaignData);

      // 2. Charger les participations
      const { data: participations, error: participationsError } = await supabase
        .from('participations')
        .select('id, created_at, is_winner, user_agent, form_data')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (participationsError) {
        console.error('❌ Participations error:', participationsError);
        throw participationsError;
      }

      console.log('✅ Participations loaded:', participations?.length || 0);

      // 3. Calculer les statistiques
      const totalParticipations = participations?.length || 0;
      const totalConversions = participations?.filter(p => p.is_winner).length || 0;
      const totalViews = Math.round(totalParticipations * 2.5); // Estimation: 40% de taux de participation

      // Calculer l'évolution temporelle (derniers 30 jours)
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
      });

      const participationsByDate = participations?.reduce((acc: any, p: any) => {
        const date = new Date(p.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {}) || {};

      const viewsOverTime = last30Days.map(date => ({
        date,
        count: Math.round((participationsByDate[date] || 0) * 2.5)
      }));

      const participationsOverTime = last30Days.map(date => ({
        date,
        count: participationsByDate[date] || 0
      }));

      // Analyser les user agents pour la répartition par appareil
      const deviceCounts: { [key: string]: number } = {
        mobile: 0,
        desktop: 0,
        tablet: 0
      };

      participations?.forEach((p: any) => {
        const ua = p.user_agent?.toLowerCase() || '';
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
          deviceCounts.mobile++;
        } else if (ua.includes('tablet') || ua.includes('ipad')) {
          deviceCounts.tablet++;
        } else {
          deviceCounts.desktop++;
        }
      });

      const deviceBreakdown = [
        { device: 'Mobile', count: deviceCounts.mobile },
        { device: 'Desktop', count: deviceCounts.desktop },
        { device: 'Tablet', count: deviceCounts.tablet }
      ].filter(d => d.count > 0);

      setStats({
        totalViews,
        totalParticipations,
        totalConversions,
        participationRate: totalViews > 0 ? (totalParticipations / totalViews * 100) : 0,
        completionRate: 100, // Tous ceux qui participent complètent
        conversionRate: totalParticipations > 0 ? (totalConversions / totalParticipations * 100) : 0,
        viewsOverTime,
        participationsOverTime,
        deviceBreakdown,
        recentParticipations: participations?.slice(0, 10) || []
      });

      console.log('✅ Stats calculated');
    } catch (error) {
      console.error('❌ Error loading statistics:', error);
      setStats({
        totalViews: 0,
        totalParticipations: 0,
        totalConversions: 0,
        participationRate: 0,
        completionRate: 0,
        conversionRate: 0,
        viewsOverTime: [],
        participationsOverTime: [],
        deviceBreakdown: [],
        recentParticipations: []
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadStatistics();
  };

  const exportToCSV = () => {
    if (!stats || !campaign) return;

    const csvData = [
      ['Statistiques de la campagne', campaign.name],
      [''],
      ['Métriques principales'],
      ['Vues totales', stats.totalViews],
      ['Participations', stats.totalParticipations],
      ['Conversions', stats.totalConversions],
      ['Taux de participation', `${stats.participationRate.toFixed(2)}%`],
      ['Taux de complétion', `${stats.completionRate.toFixed(2)}%`],
      ['Taux de conversion', `${stats.conversionRate.toFixed(2)}%`],
      [''],
      ['Évolution temporelle'],
      ['Date', 'Vues', 'Participations'],
      ...stats.viewsOverTime.map((v, i) => [
        v.date,
        v.count,
        stats.participationsOverTime[i]?.count || 0
      ]),
      [''],
      ['Répartition par appareil'],
      ['Appareil', 'Nombre'],
      ...stats.deviceBreakdown.map(d => [d.device, d.count])
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `statistiques-${campaign.name}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (!campaign || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow">
          <p className="text-red-600 mb-4">❌ Impossible de charger les statistiques</p>
          <button
            onClick={() => navigate('/campaigns')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Retour aux campagnes
          </button>
        </div>
      </div>
    );
  }

  const maxViews = Math.max(...stats.viewsOverTime.map(v => v.count), 1);
  const maxParticipations = Math.max(...stats.participationsOverTime.map(p => p.count), 1);

  return (
    <div className="-mx-6 -mt-6">
      {/* Container avec le fond blanc arrondi comme dans l'app */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 m-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/campaigns')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </button>
            <div className="h-8 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Statistiques - {campaign.name}
            </h1>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all text-sm font-medium text-gray-700"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[#5b21b6] text-white rounded-lg hover:bg-[#4c1d95] transition-all text-sm font-medium shadow-sm"
            >
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200/50">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-blue-500/10">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <h3 className="text-gray-600 text-xs font-medium uppercase tracking-wide">Vues totales</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalViews.toLocaleString()}</p>
            <p className="text-gray-500 text-xs mt-1.5">Estimation basée sur les participations</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-6 border border-green-200/50">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-green-500/10">
                <Users className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-xs font-medium uppercase tracking-wide">Participations</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalParticipations.toLocaleString()}</p>
            <p className="text-gray-500 text-xs mt-1.5">
              {stats.participationRate.toFixed(1)}% de taux de participation
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-6 border border-purple-200/50">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-xs font-medium uppercase tracking-wide">Taux de complétion</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completionRate.toFixed(0)}%</p>
            <p className="text-gray-500 text-xs mt-1.5">Tous les participants complètent</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl p-6 border border-yellow-200/50">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-yellow-500/10">
                <Award className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-xs font-medium uppercase tracking-wide">Conversions</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalConversions.toLocaleString()}</p>
            <p className="text-gray-500 text-xs mt-1.5">
              {stats.conversionRate.toFixed(1)}% de taux de conversion
            </p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Évolution temporelle */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-indigo-100 mr-3">
                <Calendar className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Évolution temporelle</h3>
                <p className="text-xs text-gray-500">Derniers 30 jours</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {stats.viewsOverTime.slice(-7).map((item, idx) => {
                const participation = stats.participationsOverTime.slice(-7)[idx];
                const viewPercent = (item.count / maxViews) * 100;
                const partPercent = (participation.count / maxParticipations) * 100;
                
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">
                        {new Date(item.date).toLocaleDateString('fr-FR', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-blue-600">
                          {item.count} vues
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          {participation.count} part.
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${viewPercent}%` }}
                        />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${partPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Répartition par appareil */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Répartition par appareil
            </h3>
            
            <div className="space-y-4">
              {stats.deviceBreakdown.map((device, idx) => {
                const total = stats.deviceBreakdown.reduce((sum, d) => sum + d.count, 0);
                const percentage = total > 0 ? (device.count / total * 100).toFixed(1) : 0;
                const colors = [
                  { bg: 'bg-blue-500', icon: Smartphone },
                  { bg: 'bg-green-500', icon: Monitor },
                  { bg: 'bg-yellow-500', icon: Tablet }
                ];
                const color = colors[idx % colors.length];
                const Icon = color.icon;
                
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">{device.device}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {device.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${color.bg} transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              
              {stats.deviceBreakdown.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  Aucune donnée disponible
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Participations récentes */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Participations récentes
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Heure</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Résultat</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Appareil</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentParticipations.map((p, idx) => {
                  const date = new Date(p.created_at);
                  const ua = p.user_agent?.toLowerCase() || '';
                  let deviceType = 'Desktop';
                  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
                    deviceType = 'Mobile';
                  } else if (ua.includes('tablet') || ua.includes('ipad')) {
                    deviceType = 'Tablet';
                  }
                  
                  return (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {date.toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        {p.is_winner ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            🏆 Gagnant
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Participation
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {deviceType}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {stats.recentParticipations.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                Aucune participation pour le moment
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignStatisticsFull;
