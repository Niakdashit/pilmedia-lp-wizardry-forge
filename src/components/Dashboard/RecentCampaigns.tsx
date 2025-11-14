import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PillButton from '../shared/PillButton';
import { ChevronRight, Calendar, MoreVertical } from 'lucide-react';
import { getCampaignTypeIcon, getCampaignTypeText, CampaignType } from '../../utils/campaignTypes';
import { RecentCampaign } from './types';
import { supabase } from '../../integrations/supabase/client';
import { getEditorUrl } from '../../utils/editorRouting';
import { extractCampaignBackgroundImage, extractCampaignBackgroundColor, debugCampaignImage } from '../../utils/debugCampaignImages';

const RecentCampaigns: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<RecentCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Fonction pour gérer le clic sur une carte
  const handleCardClick = (campaign: RecentCampaign) => {
    // Utiliser getEditorUrl de editorRouting pour obtenir la bonne URL
    const baseUrl = getEditorUrl(campaign.type, campaign.id);
    // Ajouter le paramètre openSettings pour ouvrir automatiquement la modale de paramètres
    const editorUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}openSettings=true`;
    navigate(editorUrl);
  };

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

        if (data) {
        const formattedCampaigns: RecentCampaign[] = data.map((campaign: any) => {
            // 🎯 Utiliser les fonctions utilitaires pour extraire l'image et la couleur
            const backgroundImage = extractCampaignBackgroundImage(campaign);
            const backgroundColor = backgroundImage ? null : extractCampaignBackgroundColor(campaign);


            // 🔍 Debug détaillé si aucune image/couleur trouvée
            if (!backgroundImage && !backgroundColor) {
              console.warn(`⚠️ [RecentCampaigns] Campagne sans visuel: ${campaign.name}`);
              debugCampaignImage(campaign);
            }

            return {
              id: campaign.id,
              name: campaign.name || 'Sans titre',
              type: campaign.type as CampaignType,
              participants: campaign.participations_count || 0,
              status: campaign.status || 'draft',
              createdAt: new Date(campaign.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }),
              image: backgroundImage || undefined,
              backgroundColor: backgroundColor || undefined
            };
          });

          setCampaigns(formattedCampaigns);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

  // Chargement initial
  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Écouter les changements en temps réel sur la table campaigns
  useEffect(() => {
    const channel = supabase
      .channel('campaigns-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Écouter tous les événements (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'campaigns'
        },
        (payload) => {
          console.log('🔄 Campaign changed, refreshing gallery...', payload);
          fetchCampaigns();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const duplicatedCampaigns = campaigns;
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/90 text-white border-emerald-300/50';
      case 'draft':
        return 'bg-slate-500/90 text-white border-slate-300/50';
      case 'ended':
        return 'bg-rose-500/90 text-white border-rose-300/50';
      default:
        return 'bg-slate-500/90 text-white border-slate-300/50';
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'draft':
        return 'Brouillon';
      case 'ended':
        return 'Terminée';
      default:
        return status;
    }
  };
  const getStatusGlow = (status: string) => {
    switch (status) {
      case 'active':
        return 'shadow-emerald-500/30';
      case 'draft':
        return 'shadow-slate-500/30';
      case 'ended':
        return 'shadow-rose-500/30';
      default:
        return 'shadow-slate-500/30';
    }
  };
  return <div className="relative overflow-hidden">
      <div className="p-0 my-[10px]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Galerie des créations</h2>
            <p className="text-gray-600">Vos dernières campagnes avec style</p>
          </div>
          <PillButton to="/campaigns" className="group">
            <span className="relative z-10 flex items-center">
              Voir toutes
              <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </span>
          </PillButton>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-[18px] bg-gray-200 animate-pulse h-64"></div>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucune campagne pour le moment</p>
            <PillButton to="/campaigns" className="mt-4">
              Créer votre première campagne
            </PillButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {duplicatedCampaigns.map((campaign, index) => {
          const IconComponent = getCampaignTypeIcon(campaign.type);
          return <div 
                key={campaign.id} 
                onClick={() => handleCardClick(campaign)}
                className="group relative overflow-hidden rounded-[18px] shadow-lg cursor-pointer">
                {/* Main Campaign Card */}
                <div 
                  className="relative h-64 w-full overflow-hidden"
                  style={{
                    background: campaign.image 
                      ? 'linear-gradient(to bottom right, rgb(17, 24, 39), rgb(55, 65, 81))'
                      : campaign.backgroundColor || 'linear-gradient(to bottom right, rgb(17, 24, 39), rgb(55, 65, 81))'
                  }}
                >
                  {/* Background Image */}
                  {campaign.image && <div className="absolute inset-0 overflow-hidden">
                      <img
                        src={campaign.image}
                        alt={campaign.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                      {/* Dark Overlay for Better Text Contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    </div>}
                  
                  {/* Overlay for solid color backgrounds to improve text readability */}
                  {!campaign.image && campaign.backgroundColor && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  )}

                  {/* Border */}
                  <div className="absolute inset-0 rounded-[18px] border border-white/20"></div>

                  {/* Campaign Type Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <div className="relative overflow-hidden rounded-full bg-white/95 backdrop-blur-sm text-[#44444d] px-3 py-1.5 text-xs font-bold shadow-lg border border-white/50">
                      <div className="flex items-center space-x-1.5">
                        <IconComponent className="w-3.5 h-3.5" />
                        <span className="relative z-10">{getCampaignTypeText(campaign.type)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <div className={`relative overflow-hidden rounded-full px-2.5 py-1 text-xs font-bold border backdrop-blur-sm shadow-lg ${getStatusColor(campaign.status)} ${getStatusGlow(campaign.status)}`}>
                      <span className="relative z-10 flex items-center">
                        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                        {getStatusText(campaign.status)}
                      </span>
                    </div>
                  </div>

                  {/* Actions Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Empêcher le clic de se propager à la carte
                      // TODO: Ouvrir un menu d'options
                    }}
                    className="absolute bottom-4 right-4 z-20 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30" 
                    aria-label="Options"
                  >
                    <MoreVertical className="w-4 h-4 text-white" />
                  </button>

                  {/* Campaign Title and Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                    <div className="space-y-3">
                      {/* Campaign Title - Never Truncated */}
                      <h3 className="text-xl font-bold text-white leading-tight drop-shadow-lg">
                        {campaign.name}
                      </h3>
                      
                      {/* Campaign Meta Info */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-white/80">
                          <Calendar className="w-3.5 h-3.5 mr-2" />
                          <span className="font-medium">Créé le {campaign.createdAt}</span>
                        </div>
                        <div className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold text-xs">
                          {campaign.participants} participants
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>;
        })}
          </div>
        )}
      </div>

      
    </div>;
};
export default RecentCampaigns;
