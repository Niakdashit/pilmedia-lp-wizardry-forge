// @ts-nocheck
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Users, Star, CheckCircle, Globe, 
  Calendar, Package, Mail, Phone, ExternalLink,
  Award, Clock, Euro, AlertCircle, Send
} from 'lucide-react';
import { useMediaPartnerDetail } from '@/hooks/useMediaPartnerDetail';
import Spinner from '@/components/shared/Spinner';

const MediaDetailNew: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mediaPartner, loading, error } = useMediaPartnerDetail(id || '');
  const [showRequestForm, setShowRequestForm] = useState(false);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error || !mediaPartner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error || 'Partenaire non trouvé'}</p>
        <button
          onClick={() => navigate('/partnerships')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header simplifié */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Bouton retour */}
            <button
              onClick={() => navigate('/partnerships')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-card border rounded-xl font-medium hover:bg-accent transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la liste
            </button>

            {/* Badge statut */}
            <span className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold">
              Disponible
            </span>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Carte d'en-tête */}
            <div className="bg-card rounded-2xl shadow-lg p-8 border">
              <div className="flex items-start gap-6">
                {/* Logo */}
                {mediaPartner.logo_url && (
                  <div className={`w-30 h-30 rounded-xl shadow-lg p-4 border-2 flex-shrink-0 ${
                    mediaPartner.name === 'GEO' ? 'bg-[#8BC34A] border-[#8BC34A]' : 'bg-white border-white'
                  }`}>
                    <img 
                      src={mediaPartner.logo_url} 
                      alt={`${mediaPartner.name} logo`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {/* Infos principales */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-foreground">{mediaPartner.name}</h1>
                    <CheckCircle className="w-7 h-7 text-blue-500 flex-shrink-0" />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                    {mediaPartner.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {mediaPartner.location}
                      </span>
                    )}
                    {mediaPartner.website && (
                      <a 
                        href={mediaPartner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 hover:underline"
                      >
                        <Globe className="w-4 h-4" />
                        Site web
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Stats rapides */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="flex items-center gap-3">
                      <Users className="w-6 h-6 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Audience mensuelle</p>
                        <p className="font-bold text-foreground text-lg">{formatNumber(mediaPartner.monthly_visitors)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-6 h-6 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Partenariats réalisés</p>
                        <p className="font-bold text-foreground text-lg">{mediaPartner.partnerships_count}</p>
                      </div>
                    </div>
                    {mediaPartner.rating && (
                      <div className="flex items-center gap-3">
                        <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Note moyenne</p>
                          <p className="font-bold text-foreground text-lg">{mediaPartner.rating.toFixed(1)}/5</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {mediaPartner.description && (
              <div className="bg-card rounded-2xl shadow-lg p-6 border">
                <h2 className="text-xl font-bold text-foreground mb-4">À propos</h2>
                <p className="text-muted-foreground leading-relaxed">{mediaPartner.description}</p>
                
                {mediaPartner.category && (
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-accent text-accent-foreground rounded-xl text-sm font-medium">
                    <Calendar className="w-4 h-4" />
                    {mediaPartner.category}
                  </div>
                )}
              </div>
            )}

            {/* Audience détaillée */}
            <div className="bg-card rounded-2xl shadow-lg p-6 border">
              <h2 className="text-xl font-bold text-foreground mb-4">Audience et démographie</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Audience totale</p>
                  <p className="text-2xl font-bold text-foreground">{formatNumber(mediaPartner.audience_size)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Portée</p>
                  <p className="text-2xl font-bold text-foreground capitalize">{mediaPartner.category || 'Régional'}</p>
                </div>
                {mediaPartner.age_range && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Tranche d'âge</p>
                    <p className="text-lg font-semibold text-foreground">{mediaPartner.age_range}</p>
                  </div>
                )}
                {mediaPartner.gender_distribution && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Répartition genre</p>
                    <div className="flex gap-3 text-sm">
                      <span>👨 {mediaPartner.gender_distribution.male}%</span>
                      <span>👩 {mediaPartner.gender_distribution.female}%</span>
                    </div>
                  </div>
                )}
              </div>

              {mediaPartner.interests && mediaPartner.interests.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground mb-3">Centres d'intérêt</p>
                  <div className="flex flex-wrap gap-2">
                    {mediaPartner.interests.map((interest, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1.5 bg-accent text-accent-foreground rounded-xl text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Emplacements disponibles */}
            {mediaPartner.ad_placements && mediaPartner.ad_placements.length > 0 && (
              <div className="bg-card rounded-2xl shadow-lg p-6 border">
                <h2 className="text-xl font-bold text-foreground mb-4">Emplacements disponibles</h2>
                
                <div className="space-y-4">
                  {mediaPartner.ad_placements.map(placement => (
                    <div 
                      key={placement.id}
                      className="p-4 border-2 border-border rounded-xl hover:border-primary transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">{placement.name}</h3>
                          {placement.description && (
                            <p className="text-sm text-muted-foreground mt-1">{placement.description}</p>
                          )}
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold whitespace-nowrap">
                          {placement.available_slots} disponible{placement.available_slots > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        {placement.format && (
                          <div>
                            <p className="text-muted-foreground">Format</p>
                            <p className="font-medium text-foreground">{placement.format}</p>
                          </div>
                        )}
                        {placement.position && (
                          <div>
                            <p className="text-muted-foreground">Position</p>
                            <p className="font-medium text-foreground">{placement.position}</p>
                          </div>
                        )}
                        {placement.estimated_visibility && (
                          <div>
                            <p className="text-muted-foreground">Visibilité estimée</p>
                            <p className="font-medium text-foreground">{formatNumber(placement.estimated_visibility)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conditions de partenariat */}
            {mediaPartner.partnership_conditions && (
              <div className="bg-card rounded-2xl shadow-lg p-6 border">
                <h2 className="text-xl font-bold text-foreground mb-4">Conditions de partenariat</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {mediaPartner.partnership_conditions.duration_min && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Durée</p>
                        <p className="text-muted-foreground">
                          {mediaPartner.partnership_conditions.duration_min} à {mediaPartner.partnership_conditions.duration_max} jours
                        </p>
                      </div>
                    </div>
                  )}

                  {mediaPartner.partnership_conditions.min_dotation_value && (
                    <div className="flex items-start gap-3">
                      <Euro className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Valeur des dotations</p>
                        <p className="text-muted-foreground">
                          {mediaPartner.partnership_conditions.min_dotation_value}€ à {mediaPartner.partnership_conditions.max_dotation_value}€
                        </p>
                      </div>
                    </div>
                  )}

                  {mediaPartner.partnership_conditions.validation_delay && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Délai de validation</p>
                        <p className="text-muted-foreground">{mediaPartner.partnership_conditions.validation_delay} jours ouvrés</p>
                      </div>
                    </div>
                  )}

                  {mediaPartner.partnership_conditions.dotation_types && (
                    <div className="flex items-start gap-3">
                      <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Types de dotations</p>
                        <p className="text-muted-foreground">{mediaPartner.partnership_conditions.dotation_types.join(', ')}</p>
                      </div>
                    </div>
                  )}
                </div>

                {mediaPartner.partnership_conditions.specific_conditions && mediaPartner.partnership_conditions.specific_conditions.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <p className="font-medium text-foreground mb-3">Conditions spécifiques</p>
                    <ul className="space-y-2">
                      {mediaPartner.partnership_conditions.specific_conditions.map((condition, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                          <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span>{condition}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* CTA Principale */}
              <div className="bg-accent border rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-2 text-foreground">Intéressé par ce média ?</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Envoyez une demande de partenariat et recevez une réponse sous {mediaPartner.partnership_conditions?.validation_delay || 5} jours.
                </p>
                <button
                  onClick={() => setShowRequestForm(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Send className="w-5 h-5" />
                  Faire une demande
                </button>
              </div>

              {/* Contact */}
              <div className="bg-card rounded-2xl shadow-lg p-6 border">
                <h3 className="font-bold text-foreground mb-4">Contact</h3>
                <div className="space-y-3">
                  {mediaPartner.contact_email && (
                    <a 
                      href={`mailto:${mediaPartner.contact_email}`}
                      className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                      <span className="text-sm">{mediaPartner.contact_email}</span>
                    </a>
                  )}
                  {mediaPartner.contact_phone && (
                    <a 
                      href={`tel:${mediaPartner.contact_phone}`}
                      className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      <span className="text-sm">{mediaPartner.contact_phone}</span>
                    </a>
                  )}
                  {mediaPartner.contact_address && (
                    <div className="flex items-start gap-3 text-muted-foreground">
                      <MapPin className="w-5 h-5 mt-0.5" />
                      <div className="text-sm">
                        <p>{mediaPartner.contact_address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats supplémentaires */}
              <div className="bg-card rounded-2xl shadow-lg p-6 border">
                <h3 className="font-bold text-foreground mb-4">Statistiques</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Partenariats réalisés</span>
                    <span className="font-semibold text-foreground">{mediaPartner.partnerships_count}</span>
                  </div>
                  {mediaPartner.rating && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Note moyenne</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold text-foreground">{mediaPartner.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                  {mediaPartner.member_since && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Membre depuis</span>
                      <span className="font-semibold text-foreground">
                        {new Date(mediaPartner.member_since).getFullYear()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaDetailNew;
