import React from 'react';
import PillButton from '../shared/PillButton';
import { ChevronRight, Calendar, MoreVertical } from 'lucide-react';
import { getCampaignTypeIcon, getCampaignTypeText, CampaignType } from '../../utils/campaignTypes';
import { RecentCampaign } from './types';
const RecentCampaigns: React.FC = () => {
  const recentCampaigns: RecentCampaign[] = [{
    id: '1',
    name: 'Quiz Marketing Digital',
    type: 'quiz' as CampaignType,
    participants: 4,
    status: 'draft',
    createdAt: '17 mai 2025',
    image: 'https://images.pexels.com/photos/298864/pexels-photo-298864.jpeg'
  }, {
    id: '2',
    name: 'Roue de la fortune Soldes',
    type: 'wheel' as CampaignType,
    participants: 45,
    status: 'active',
    createdAt: '16 mai 2025',
    image: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg'
  }, {
    id: '3',
    name: 'Campagne Instagram Été',
    type: 'dice' as CampaignType,
    participants: 128,
    status: 'active',
    createdAt: '15 mai 2025',
    image: 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg'
  }];

  // Duplicate campaigns to display 6 cards (two rows of three)
  // Provide alternate images for the duplicated set to avoid repetition
  const altImages = [
    'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg', // Sneakers product
    'https://images.pexels.com/photos/845434/pexels-photo-845434.jpeg', // Cosmetics products
    'https://images.pexels.com/photos/325153/pexels-photo-325153.jpeg', // Tech workspace/products
  ];
  const duplicatedCampaigns: RecentCampaign[] = [
    ...recentCampaigns,
    ...recentCampaigns.map((c, i) => ({
      ...c,
      id: (recentCampaigns.length + i + 1).toString(),
      image: altImages[i] || c.image,
    })),
  ];
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
  return <div className="relative">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {duplicatedCampaigns.map((campaign, index) => {
          const IconComponent = getCampaignTypeIcon(campaign.type);
          return <div key={campaign.id} className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02]">
                {/* Main Campaign Card */}
                <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-gray-900 to-gray-700">
                  {/* Background Image with Parallax Effect */}
                  {campaign.image && <div className="absolute inset-0 overflow-hidden">
                      <img
                        src={campaign.image}
                        alt={campaign.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Dark Overlay for Better Text Contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    </div>}

                  {/* Glass Morphism Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                  {/* Neon Border Glow Effect */}
                  <div className="absolute inset-0 rounded-xl border border-white/20 group-hover:border-[#841b60]/50 group-hover:shadow-[0_0_30px_rgba(132,27,96,0.3)] transition-all duration-500"></div>

                  {/* Campaign Type Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <div className="group/badge relative overflow-hidden rounded-full bg-white/95 backdrop-blur-sm text-[#841b60] px-3 py-1.5 text-xs font-bold shadow-lg border border-white/50 hover:bg-white transition-all duration-300">
                      <div className="flex items-center space-x-1.5">
                        <IconComponent className="w-3.5 h-3.5 transition-transform group-hover/badge:rotate-12 duration-300" />
                        <span className="relative z-10">{getCampaignTypeText(campaign.type)}</span>
                      </div>
                      {/* Badge Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#841b60]/20 to-transparent opacity-0 group-hover/badge:opacity-100 transition-opacity duration-300 rounded-full"></div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <div className={`relative overflow-hidden rounded-full px-2.5 py-1 text-xs font-bold border backdrop-blur-sm shadow-lg transition-all duration-300 group-hover:scale-110 ${getStatusColor(campaign.status)} ${getStatusGlow(campaign.status)} group-hover:shadow-lg`}>
                      <span className="relative z-10 flex items-center">
                        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                        {getStatusText(campaign.status)}
                      </span>
                      {/* Status Badge Glow Animation */}
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                    </div>
                  </div>

                  {/* Actions Button */}
                  <button className="absolute bottom-4 right-4 z-20 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 hover:scale-110" aria-label="Options">
                    <MoreVertical className="w-4 h-4 text-white" />
                  </button>

                  {/* Campaign Title and Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                    <div className="space-y-3">
                      {/* Campaign Title - Never Truncated */}
                      <h3 className="text-xl font-bold text-white leading-tight group-hover:text-[#ffeb3b] transition-colors duration-300 drop-shadow-lg">
                        {campaign.name}
                      </h3>
                      
                      {/* Campaign Meta Info */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-white/80 group-hover:text-white transition-colors duration-300">
                          <Calendar className="w-3.5 h-3.5 mr-2" />
                          <span className="font-medium">Créé le {campaign.createdAt}</span>
                        </div>
                        <div className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold text-xs group-hover:bg-white/30 group-hover:scale-105 transition-all duration-300">
                          {campaign.participants} participants
                        </div>
                      </div>
                    </div>

                    {/* Hover Reveal: Action Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#841b60]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-xl"></div>
                  </div>

                  {/* Animated Light Streak */}
                  <div className="absolute inset-0 overflow-hidden rounded-xl">
                    <div className="absolute -top-full -left-full w-full h-full bg-gradient-to-br from-transparent via-white/10 to-transparent transform rotate-45 group-hover:top-full group-hover:left-full transition-all duration-1000 ease-out"></div>
                  </div>
                </div>
              </div>;
        })}
        </div>
      </div>

      
    </div>;
};
export default RecentCampaigns;
