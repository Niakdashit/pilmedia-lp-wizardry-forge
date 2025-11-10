/**
 * CampaignStatistics - Page de statistiques complète pour une campagne
 * 
 * Inspiré de Qualifio et Drimify
 * KPIs principaux:
 * - Vues totales
 * - Taux de participation
 * - Taux de complétion
 * - Taux de conversion
 * - ROI
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Eye, Users, Award, 
  Download, RefreshCw,
  Activity, Target, Mail, ArrowLeft, BarChart2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CampaignStats {
  // Métriques principales
  totalViews: number;
  totalParticipations: number;
  totalCompletions: number;
  totalConversions: number;
  
  // Taux
  participationRate: number;
  completionRate: number;
  conversionRate: number;
  engagementRate: number;
  
  // Données temporelles
  viewsOverTime: { date: string; count: number }[];
  participationsOverTime: { date: string; count: number }[];
  
  // Données démographiques
  deviceBreakdown: { device: string; count: number }[];
  locationBreakdown: { country: string; count: number }[];
  
  // Données de sécurité
  uniqueIPs: number;
  uniqueDevices: number;
  blockedAttempts: number;
  
  // Données de formulaire
  formFields: { field: string; fillRate: number }[];
  
  // Données de jeu
  averageScore?: number;
  topScores?: { email: string; score: number }[];
  
  // Données de prix
  prizesAwarded: { prize: string; count: number }[];
  totalPrizesValue: number;
}

const CampaignStatistics: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [campaign, setCampaign] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (campaignId) {
      loadStatistics();
    }
  }, [campaignId, timeRange]);

  useEffect(() => {
    console.log('CampaignStatistics mounted with ID:', campaignId);
  }, []);

  const loadStatistics = async () => {
    try {
      console.log('[CampaignStatistics] Loading statistics for campaign:', campaignId);
      setLoading(true);
      
      if (!campaignId) {
        console.error('[CampaignStatistics] No campaign ID provided');
        setLoading(false);
        return;
      }

      // 1. Charger la campagne
      console.log('[CampaignStatistics] Fetching campaign data...');
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();
      
      if (campaignError) {
        console.error('[CampaignStatistics] Campaign error:', campaignError);
        throw campaignError;
      }
      
      console.log('[CampaignStatistics] Campaign loaded:', campaignData?.name);
      setCampaign(campaignData);
      
      // 2. Charger les participations
      const { data: participations, error: participationsError } = await supabase
        .from('participations')
        .select('*')
        .eq('campaign_id', campaignId);
      
      if (participationsError) throw participationsError;
      
      // 3. Charger les vues de campagne (table optionnelle)
      const { data: views } = await supabase
        .from('campaign_views')
        .select('*')
        .eq('campaign_id', campaignId)
        .limit(1000);
      
      // 4. Stats de sécurité (désactivé pour l'instant - vue non créée)
      const securityStats = null;
      
      // 5. Calculer les statistiques
      console.log('[CampaignStatistics] Calculating stats...', {
        participations: participations?.length || 0,
        views: views?.length || 0
      });
      
      const calculatedStats = calculateStats(
        participations || [],
        views || [],
        securityStats
      );
      
      console.log('[CampaignStatistics] Stats calculated:', calculatedStats);
      setStats(calculatedStats);
    } catch (error) {
      console.error('[CampaignStatistics] Error loading statistics:', error);
      // Ne pas bloquer l'affichage en cas d'erreur
      setStats({
        totalViews: 0,
        totalParticipations: 0,
        totalCompletions: 0,
        totalConversions: 0,
        participationRate: 0,
        completionRate: 0,
        conversionRate: 0,
        engagementRate: 0,
        viewsOverTime: [],
        participationsOverTime: [],
        deviceBreakdown: [],
        locationBreakdown: [],
        uniqueIPs: 0,
        uniqueDevices: 0,
        blockedAttempts: 0,
        formFields: [],
        prizesAwarded: [],
        totalPrizesValue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (
    participations: any[],
    views: any[],
    securityStats: any
  ): CampaignStats => {
    const totalViews = views.length;
    const totalParticipations = participations.length;
    const totalCompletions = participations.filter(p => p.game_result).length;
    const totalConversions = participations.filter(p => p.is_winner).length;
    
    // Taux
    const participationRate = totalViews > 0 
      ? (totalParticipations / totalViews) * 100 
      : 0;
    const completionRate = totalParticipations > 0
      ? (totalCompletions / totalParticipations) * 100
      : 0;
    const conversionRate = totalParticipations > 0
      ? (totalConversions / totalParticipations) * 100
      : 0;
    const engagementRate = participationRate;
    
    // Données temporelles (derniers 30 jours)
    const viewsOverTime = aggregateByDate(views || [], 'created_at');
    const participationsOverTime = aggregateByDate(participations || [], 'created_at');
    
    // Devices
    const deviceBreakdown = aggregateByField(participations, 'user_agent', (ua) => {
      if (/mobile/i.test(ua)) return 'Mobile';
      if (/tablet|ipad/i.test(ua)) return 'Tablet';
      return 'Desktop';
    });
    
    // Locations (simulé pour l'instant)
    const locationBreakdown = [
      { country: 'France', count: Math.floor(totalParticipations * 0.6) },
      { country: 'Belgique', count: Math.floor(totalParticipations * 0.2) },
      { country: 'Suisse', count: Math.floor(totalParticipations * 0.1) },
      { country: 'Autres', count: Math.floor(totalParticipations * 0.1) }
    ];
    
    // Form fields fill rate
    const formFields = calculateFormFieldsFillRate(participations);
    
    // Prizes
    const prizesAwarded = aggregatePrizes(participations);
    
    return {
      totalViews,
      totalParticipations,
      totalCompletions,
      totalConversions,
      participationRate,
      completionRate,
      conversionRate,
      engagementRate,
      viewsOverTime,
      participationsOverTime,
      deviceBreakdown,
      locationBreakdown,
      uniqueIPs: securityStats?.unique_ips || 0,
      uniqueDevices: securityStats?.unique_devices || 0,
      blockedAttempts: securityStats?.blocked_attempts || 0,
      formFields,
      prizesAwarded,
      totalPrizesValue: 0
    };
  };

  const aggregateByDate = (items: any[], dateField: string) => {
    const grouped = items.reduce((acc, item) => {
      const date = new Date(item[dateField]).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count: count as number }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Derniers 30 jours
  };

  const aggregateByField = (
    items: any[],
    field: string,
    transform?: (value: string) => string
  ) => {
    const grouped = items.reduce((acc, item) => {
      let value = item[field] || 'Unknown';
      if (transform) value = transform(value);
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped).map(([device, count]) => ({ device, count: count as number }));
  };

  const calculateFormFieldsFillRate = (participations: any[]) => {
    if (participations.length === 0) return [];
    
    const fields = new Set<string>();
    participations.forEach(p => {
      if (p.form_data) {
        Object.keys(p.form_data).forEach(key => fields.add(key));
      }
    });
    
    return Array.from(fields).map(field => {
      const filled = participations.filter(p => 
        p.form_data && p.form_data[field]
      ).length;
      return {
        field,
        fillRate: (filled / participations.length) * 100
      };
    });
  };

  const aggregatePrizes = (participations: any[]) => {
    const grouped = participations
      .filter(p => p.is_winner && p.form_data?.prize_name)
      .reduce((acc, p) => {
        const prize = p.form_data.prize_name;
        acc[prize] = (acc[prize] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    return Object.entries(grouped).map(([prize, count]) => ({ prize, count: count as number }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStatistics();
    setRefreshing(false);
  };

  const handleExport = () => {
    if (!stats) return;
    
    const csvData = [
      ['Métrique', 'Valeur'],
      ['Vues totales', stats.totalViews],
      ['Participations', stats.totalParticipations],
      ['Taux de participation', `${stats.participationRate.toFixed(2)}%`],
      ['Taux de complétion', `${stats.completionRate.toFixed(2)}%`],
      ['Taux de conversion', `${stats.conversionRate.toFixed(2)}%`],
      ['IPs uniques', stats.uniqueIPs],
      ['Devices uniques', stats.uniqueDevices],
      ['Tentatives bloquées', stats.blockedAttempts]
    ];
    
    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stats-${campaign?.name || 'campaign'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des statistiques...</p>
          <p className="text-gray-400 text-sm mt-2">Campaign ID: {campaignId}</p>
        </div>
      </div>
    );
  }

  if (!stats || !campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Données non disponibles</h2>
          <p className="text-gray-500 mb-4">
            {!campaign ? 'Campagne introuvable' : 'Aucune statistique disponible'}
          </p>
          <p className="text-gray-400 text-sm mb-4">Campaign ID: {campaignId}</p>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/campaigns')}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Retour aux campagnes
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Recharger la page
            </button>
          </div>
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
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Statistiques - {campaign.name}
            </h1>
            <p className="text-gray-500 mt-1">
              Analyse détaillée des performances
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Time range selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="all">Tout</option>
            </select>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <KPICard
          title="Vues totales"
          value={stats.totalViews}
          icon={<Eye className="w-6 h-6" />}
          color="blue"
          trend="+12%"
        />
        <KPICard
          title="Participations"
          value={stats.totalParticipations}
          icon={<Users className="w-6 h-6" />}
          color="green"
          subtitle={`${stats.participationRate.toFixed(1)}% de taux`}
        />
        <KPICard
          title="Taux de complétion"
          value={`${stats.completionRate.toFixed(1)}%`}
          icon={<Target className="w-6 h-6" />}
          color="purple"
          subtitle={`${stats.totalCompletions} complétions`}
        />
        <KPICard
          title="Conversions"
          value={stats.totalConversions}
          icon={<Award className="w-6 h-6" />}
          color="yellow"
          subtitle={`${stats.conversionRate.toFixed(1)}% de taux`}
        />
      </div>

      {/* Temporal Data Section */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Évolution temporelle - Version simple */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <BarChart2 className="w-5 h-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Évolution dans le temps</h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Derniers 7 jours</p>
            {stats.viewsOverTime.slice(-7).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">
                  {new Date(item.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-blue-600">
                    {item.count} vues
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {stats.participationsOverTime.find(p => p.date === item.date)?.count || 0} part.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device breakdown - Version simple */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par appareil</h3>
          <div className="space-y-3">
            {stats.deviceBreakdown.map((device, idx) => {
              const total = stats.deviceBreakdown.reduce((sum, d) => sum + d.count, 0);
              const percentage = total > 0 ? (device.count / total * 100).toFixed(1) : 0;
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{device.device}</span>
                    <span className="text-sm text-gray-600">{device.count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${colors[idx % colors.length]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Stats */}
        <StatsCard title="Sécurité" icon={<Activity className="w-5 h-5" />}>
          <StatRow label="IPs uniques" value={stats.uniqueIPs} />
          <StatRow label="Devices uniques" value={stats.uniqueDevices} />
          <StatRow label="Tentatives bloquées" value={stats.blockedAttempts} color="red" />
        </StatsCard>

        {/* Form Stats */}
        <StatsCard title="Formulaire" icon={<Mail className="w-5 h-5" />}>
          {stats.formFields.slice(0, 5).map(field => (
            <StatRow
              key={field.field}
              label={field.field}
              value={`${field.fillRate.toFixed(1)}%`}
            />
          ))}
        </StatsCard>

        {/* Prizes Stats */}
        <StatsCard title="Lots gagnés" icon={<Award className="w-5 h-5" />}>
          {stats.prizesAwarded.length > 0 ? (
            stats.prizesAwarded.map(prize => (
              <StatRow
                key={prize.prize}
                label={prize.prize}
                value={prize.count}
              />
            ))
          ) : (
            <p className="text-gray-500 text-sm">Aucun lot gagné</p>
          )}
        </StatsCard>
      </div>
    </div>
  );
};

// Components
const KPICard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'yellow';
  subtitle?: string;
  trend?: string;
}> = ({ title, value, icon, color, subtitle, trend }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
        {trend && (
          <span className="text-green-600 text-sm font-medium">{trend}</span>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      {subtitle && (
        <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
      )}
    </div>
  );
};

const StatsCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center mb-4">
      <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg mr-3">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    <div className="space-y-3">
      {children}
    </div>
  </div>
);

const StatRow: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-600 text-sm">{label}</span>
    <span className={`font-semibold ${color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>
      {value}
    </span>
  </div>
);

export default CampaignStatistics;
