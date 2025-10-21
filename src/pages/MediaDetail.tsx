import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Users, Star, CheckCircle, Globe, 
  Calendar, Package, Mail, Phone, ExternalLink,
  Award, Clock, Euro, AlertCircle, Send
} from 'lucide-react';
import { Media } from '../types/partnership';
import { PartnershipRequestForm } from '../components/Partnerships/PartnershipRequestForm';

// Données mockées - à remplacer par un appel API
const MOCK_MEDIA: Media = {
  id: '1',
  nom: 'Le Courrier Picard',
  type: 'presse_locale',
  description: 'Premier quotidien régional des Hauts-de-France, Le Courrier Picard informe depuis 1944 sur l\'actualité locale, régionale et nationale. Avec une forte présence dans la Somme, l\'Oise et l\'Aisne.',
  logo_url: 'https://via.placeholder.com/100',
  cover_url: 'https://via.placeholder.com/1200x400',
  site_web: 'https://www.courrier-picard.fr',
  email: 'partenariats@courrier-picard.fr',
  telephone: '+33 3 22 82 60 00',
  adresse: '29 rue de la République',
  ville: 'Amiens',
  code_postal: '80000',
  region: 'Hauts-de-France',
  pays: 'France',
  audience: {
    total: 850000,
    mensuel: 450000,
    type: 'regional',
    demographics: {
      age_range: '35-65 ans',
      gender_split: { homme: 52, femme: 46, autre: 2 },
      interests: ['Actualité locale', 'Sport', 'Culture', 'Économie'],
    },
  },
  date_creation: '1944-08-25',
  frequence_publication: 'Quotidien',
  status: 'disponible',
  slots: [
    {
      id: 'slot-1',
      type: 'banniere',
      nom: 'Bannière Homepage',
      description: 'Bannière en haut de la page d\'accueil du site web',
      format: '728x90px',
      position: 'Header',
      visibilite_estimee: 150000,
      disponibilites: 3,
    },
    {
      id: 'slot-2',
      type: 'article',
      nom: 'Article sponsorisé',
      description: 'Article rédigé par nos journalistes mettant en avant votre marque',
      format: '800-1200 mots',
      position: 'Section Partenaires',
      visibilite_estimee: 80000,
      disponibilites: 5,
    },
    {
      id: 'slot-3',
      type: 'newsletter',
      nom: 'Encart Newsletter',
      description: 'Encart dans notre newsletter quotidienne',
      format: '300x250px',
      position: 'Milieu de newsletter',
      visibilite_estimee: 45000,
      disponibilites: 10,
    },
  ],
  conditions: {
    duree_min: 7,
    duree_max: 90,
    valeur_dotation_min: 500,
    valeur_dotation_max: 10000,
    type_dotations_acceptees: ['Produits', 'Services', 'Bons d\'achat', 'Expériences'],
    delai_validation: 5,
    conditions_specifiques: [
      'Les dotations doivent être en lien avec notre audience',
      'Validation éditoriale requise pour les articles',
      'Possibilité de renouvellement si succès',
    ],
  },
  partenariats_realises: 47,
  note_moyenne: 4.7,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2025-01-20T15:30:00Z',
  verified: true,
};

const MediaDetail: React.FC = () => {
  // const { id } = useParams<{ id: string }>(); // À utiliser pour charger les données depuis l'API
  const navigate = useNavigate();
  const [showRequestForm, setShowRequestForm] = useState(false);
  
  // Dans une vraie app, charger les données depuis l'API en utilisant l'id
  const media = MOCK_MEDIA;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleSubmitRequest = (request: any) => {
    console.log('Demande de partenariat:', request);
    // Ici: envoyer la demande à l'API
    setShowRequestForm(false);
    // Afficher un message de succès
    alert('Votre demande a été envoyée avec succès ! Le média vous répondra sous 5 jours.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec image de couverture */}
      <div className="relative h-80 bg-gray-100">
        {media.cover_url && (
          <img 
            src={media.cover_url} 
            alt={media.nom}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Bouton retour */}
        <button
          onClick={() => navigate('/partnerships')}
          className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-900 rounded-xl font-medium hover:bg-white transition-all shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </button>

        {/* Badge statut */}
        <div className="absolute top-6 right-6">
          <span className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold shadow-lg">
            Disponible
          </span>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Carte d'en-tête */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-start gap-6">
                {/* Logo */}
                {media.logo_url && (
                  <div className="w-24 h-24 bg-white rounded-xl shadow-lg p-3 border-2 border-white flex-shrink-0">
                    <img 
                      src={media.logo_url} 
                      alt={`${media.nom} logo`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {/* Infos principales */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{media.nom}</h1>
                    {media.verified && (
                      <CheckCircle className="w-7 h-7 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {media.ville}, {media.region}
                    </span>
                    {media.site_web && (
                      <a 
                        href={media.site_web}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-gray-700 hover:underline"
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
                      <Users className="w-6 h-6 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Audience mensuelle</p>
                        <p className="font-bold text-gray-900 text-lg">{formatNumber(media.audience.mensuel)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-6 h-6 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Partenariats réalisés</p>
                        <p className="font-bold text-gray-900 text-lg">{media.partenariats_realises}</p>
                      </div>
                    </div>
                    {media.note_moyenne && (
                      <div className="flex items-center gap-3">
                        <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Note moyenne</p>
                          <p className="font-bold text-gray-900 text-lg">{media.note_moyenne.toFixed(1)}/5</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">À propos</h2>
              <p className="text-gray-700 leading-relaxed">{media.description}</p>
              
              {media.frequence_publication && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium">
                  <Calendar className="w-4 h-4" />
                  Publication {media.frequence_publication.toLowerCase()}
                </div>
              )}
            </div>

            {/* Audience détaillée */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Audience et démographie</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Audience totale</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(media.audience.total)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Portée</p>
                  <p className="text-2xl font-bold text-gray-900 capitalize">{media.audience.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Tranche d'âge</p>
                  <p className="text-lg font-semibold text-gray-900">{media.audience.demographics.age_range}</p>
                </div>
                {media.audience.demographics.gender_split && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Répartition genre</p>
                    <div className="flex gap-3 text-sm">
                      <span>👨 {media.audience.demographics.gender_split.homme}%</span>
                      <span>👩 {media.audience.demographics.gender_split.femme}%</span>
                    </div>
                  </div>
                )}
              </div>

              {media.audience.demographics.interests.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-gray-500 mb-3">Centres d'intérêt</p>
                  <div className="flex flex-wrap gap-2">
                    {media.audience.demographics.interests.map((interest, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-xl text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Emplacements disponibles */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Emplacements disponibles</h2>
              
              <div className="space-y-4">
                {media.slots.map(slot => (
                  <div 
                    key={slot.id}
                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{slot.nom}</h3>
                        <p className="text-sm text-gray-600 mt-1">{slot.description}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold whitespace-nowrap">
                        {slot.disponibilites} disponible{slot.disponibilites > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Format</p>
                        <p className="font-medium text-gray-900">{slot.format}</p>
                      </div>
                      {slot.position && (
                        <div>
                          <p className="text-gray-500">Position</p>
                          <p className="font-medium text-gray-900">{slot.position}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-500">Visibilité estimée</p>
                        <p className="font-medium text-gray-900">{formatNumber(slot.visibilite_estimee)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conditions de partenariat */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Conditions de partenariat</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Durée</p>
                    <p className="text-gray-600">{media.conditions.duree_min} à {media.conditions.duree_max} jours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Euro className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Valeur des dotations</p>
                    <p className="text-gray-600">
                      {media.conditions.valeur_dotation_min}€ à {media.conditions.valeur_dotation_max}€
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Délai de validation</p>
                    <p className="text-gray-600">{media.conditions.delai_validation} jours ouvrés</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Types de dotations</p>
                    <p className="text-gray-600">{media.conditions.type_dotations_acceptees.join(', ')}</p>
                  </div>
                </div>
              </div>

              {media.conditions.conditions_specifiques && media.conditions.conditions_specifiques.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="font-medium text-gray-900 mb-3">Conditions spécifiques</p>
                  <ul className="space-y-2">
                    {media.conditions.conditions_specifiques.map((condition, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-600">
                        <AlertCircle className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                        <span>{condition}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* CTA Principale */}
              <div className="bg-gray-100 border border-gray-200 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900">Intéressé par ce média ?</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Envoyez une demande de partenariat et recevez une réponse sous {media.conditions.delai_validation} jours.
                </p>
                <button
                  onClick={() => setShowRequestForm(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                >
                  <Send className="w-5 h-5" />
                  Faire une demande
                </button>
              </div>

              {/* Contact */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Contact</h3>
                <div className="space-y-3">
                  <a 
                    href={`mailto:${media.email}`}
                    className="flex items-center gap-3 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    <span className="text-sm">{media.email}</span>
                  </a>
                  {media.telephone && (
                    <a 
                      href={`tel:${media.telephone}`}
                      className="flex items-center gap-3 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      <span className="text-sm">{media.telephone}</span>
                    </a>
                  )}
                  {media.adresse && (
                    <div className="flex items-start gap-3 text-gray-600">
                      <MapPin className="w-5 h-5 mt-0.5" />
                      <div className="text-sm">
                        <p>{media.adresse}</p>
                        <p>{media.code_postal} {media.ville}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats supplémentaires */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Statistiques</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Partenariats réalisés</span>
                    <span className="font-semibold text-gray-900">{media.partenariats_realises}</span>
                  </div>
                  {media.note_moyenne && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Note moyenne</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold text-gray-900">{media.note_moyenne.toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Membre depuis</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(media.created_at).getFullYear()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de demande */}
      {showRequestForm && (
        <PartnershipRequestForm
          media={media}
          onSubmit={handleSubmitRequest}
          onClose={() => setShowRequestForm(false)}
        />
      )}
    </div>
  );
};

export default MediaDetail;
