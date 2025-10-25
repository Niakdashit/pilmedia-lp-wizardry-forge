// @ts-nocheck
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Users, Star, CheckCircle, Globe, 
  Calendar, TrendingUp, Package 
} from 'lucide-react';
import { Media } from '../../types/partnership';

interface MediaCardProps {
  media: Media;
}

const MEDIA_TYPE_LABELS: Record<string, string> = {
  presse_locale: 'Presse Locale',
  presse_nationale: 'Presse Nationale',
  presse_periodique: 'Presse Périodique',
  blog: 'Blog',
  site_web: 'Site Web',
  mairie: 'Mairie',
  ecole: 'École',
  radio: 'Radio',
  television: 'Télévision',
  podcast: 'Podcast',
  newsletter: 'Newsletter',
  reseau_social: 'Réseau Social',
  autre: 'Autre',
};

const AUDIENCE_TYPE_LABELS: Record<string, string> = {
  local: 'Local',
  regional: 'Régional',
  national: 'National',
  international: 'International',
};

const STATUS_CONFIG = {
  disponible: { label: 'Disponible', color: 'bg-green-100 text-green-800' },
  en_cours: { label: 'En cours', color: 'bg-blue-100 text-blue-800' },
  complet: { label: 'Complet', color: 'bg-gray-100 text-gray-800' },
  suspendu: { label: 'Suspendu', color: 'bg-red-100 text-red-800' },
};

export const MediaCard: React.FC<MediaCardProps> = ({ media }) => {
  const navigate = useNavigate();

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const statusConfig = STATUS_CONFIG[media.status];
  const availableSlots = media.slots.reduce((sum, slot) => sum + slot.disponibilites, 0);

  return (
    <div 
      onClick={() => navigate(`/partnerships/${media.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-400 transition-all duration-300 cursor-pointer overflow-hidden group"
    >
      {/* Image de couverture */}
      <div className="relative h-40 bg-gray-100 overflow-hidden">
        {media.cover_url ? (
          <img 
            src={media.cover_url} 
            alt={media.nom}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Globe className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {/* Badge statut */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>

        {/* Logo */}
        {media.logo_url && (
          <div className="absolute bottom-3 left-3 w-16 h-16 bg-white rounded-xl shadow-lg p-2 border-2 border-white">
            <img 
              src={media.logo_url} 
              alt={`${media.nom} logo`}
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-5 space-y-4">
        {/* En-tête */}
        <div className={media.logo_url ? 'ml-20' : ''}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-gray-700 transition-colors">
                  {media.nom}
                </h3>
                {media.verified && (
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-gray-600">
                {MEDIA_TYPE_LABELS[media.type]} • {media.ville}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {media.description}
        </p>

        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-600" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">Audience mensuelle</p>
              <p className="font-semibold text-gray-900">{formatNumber(media.audience.mensuel)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">Portée</p>
              <p className="font-semibold text-gray-900">{AUDIENCE_TYPE_LABELS[media.audience.type]}</p>
            </div>
          </div>
        </div>

        {/* Emplacements et note */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{availableSlots}</span> emplacement{availableSlots > 1 ? 's' : ''}
            </span>
          </div>
          {media.note_moyenne && (
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-gray-900">{media.note_moyenne.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({media.partenariats_realises})</span>
            </div>
          )}
        </div>

        {/* Conditions */}
        <div className="flex items-center gap-6 text-xs text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{media.conditions.duree_min}-{media.conditions.duree_max} jours</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Package className="w-4 h-4" />
            <span>Min. {media.conditions.valeur_dotation_min}€</span>
          </div>
        </div>

        {/* Bouton CTA */}
        <button className="w-full mt-3 px-4 py-3 text-sm rounded-xl bg-gray-700 text-white font-medium hover:bg-gray-800 transition-colors">
          Voir les détails et faire une demande
        </button>
      </div>
    </div>
  );
};
