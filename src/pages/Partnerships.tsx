import React, { useState, useMemo } from 'react';
import { Handshake, TrendingUp, Users, Award } from 'lucide-react';
import { Media, PartnershipFilters } from '../types/partnership';
import { MediaFilters } from '../components/Partnerships/MediaFilters';
import { MediaCard } from '../components/Partnerships/MediaCard';

// Données mockées - à remplacer par un appel API
const MOCK_MEDIAS: Media[] = [
  {
    id: '1',
    nom: 'Le Courrier Picard',
    type: 'presse_locale',
    description: 'Premier quotidien régional des Hauts-de-France, Le Courrier Picard informe depuis 1944 sur l\'actualité locale, régionale et nationale.',
    logo_url: 'https://via.placeholder.com/100',
    cover_url: 'https://via.placeholder.com/400x200',
    site_web: 'https://www.courrier-picard.fr',
    email: 'partenariats@courrier-picard.fr',
    telephone: '+33 3 22 82 60 00',
    ville: 'Amiens',
    region: 'Hauts-de-France',
    pays: 'France',
    audience: {
      total: 850000,
      mensuel: 450000,
      type: 'regional',
      demographics: {
        age_range: '35-65 ans',
        interests: ['Actualité locale', 'Sport', 'Culture'],
      },
    },
    date_creation: '1944-08-25',
    frequence_publication: 'Quotidien',
    status: 'disponible',
    slots: [
      { id: 's1', type: 'banniere', nom: 'Bannière Homepage', description: 'Header', format: '728x90px', visibilite_estimee: 150000, disponibilites: 3 },
      { id: 's2', type: 'article', nom: 'Article sponsorisé', description: 'Article', format: '800-1200 mots', visibilite_estimee: 80000, disponibilites: 5 },
    ],
    conditions: {
      duree_min: 7,
      duree_max: 90,
      valeur_dotation_min: 500,
      valeur_dotation_max: 10000,
      type_dotations_acceptees: ['Produits', 'Services', 'Bons d\'achat'],
      delai_validation: 5,
    },
    partenariats_realises: 47,
    note_moyenne: 4.7,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2025-01-20T15:30:00Z',
    verified: true,
  },
  {
    id: '2',
    nom: 'Mairie de Lyon',
    type: 'mairie',
    description: 'La Mairie de Lyon propose des partenariats pour ses événements culturels et sportifs. Visibilité auprès de 500 000 habitants et visiteurs.',
    logo_url: 'https://via.placeholder.com/100',
    cover_url: 'https://via.placeholder.com/400x200',
    site_web: 'https://www.lyon.fr',
    email: 'partenariats@mairie-lyon.fr',
    telephone: '+33 4 72 10 30 30',
    ville: 'Lyon',
    region: 'Auvergne-Rhône-Alpes',
    pays: 'France',
    audience: {
      total: 500000,
      mensuel: 200000,
      type: 'local',
      demographics: {
        age_range: '25-55 ans',
        interests: ['Culture', 'Sport', 'Événements'],
      },
    },
    date_creation: '2020-03-01',
    status: 'disponible',
    slots: [
      { id: 's3', type: 'banniere', nom: 'Bannière site web', description: 'Homepage', format: '970x250px', visibilite_estimee: 80000, disponibilites: 2 },
      { id: 's4', type: 'autre', nom: 'Stand événement', description: 'Événements municipaux', format: 'Stand 3x3m', visibilite_estimee: 5000, disponibilites: 10 },
    ],
    conditions: {
      duree_min: 14,
      duree_max: 180,
      valeur_dotation_min: 1000,
      valeur_dotation_max: 15000,
      type_dotations_acceptees: ['Produits', 'Services', 'Expériences'],
      delai_validation: 10,
    },
    partenariats_realises: 23,
    note_moyenne: 4.5,
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2025-01-18T12:00:00Z',
    verified: true,
  },
  {
    id: '3',
    nom: 'TechBlog Pro',
    type: 'blog',
    description: 'Blog tech leader en France avec 300K lecteurs mensuels. Spécialisé dans les nouvelles technologies, startups et innovation.',
    logo_url: 'https://via.placeholder.com/100',
    cover_url: 'https://via.placeholder.com/400x200',
    site_web: 'https://www.techblogpro.fr',
    email: 'contact@techblogpro.fr',
    ville: 'Paris',
    region: 'Île-de-France',
    pays: 'France',
    audience: {
      total: 400000,
      mensuel: 300000,
      type: 'national',
      demographics: {
        age_range: '25-45 ans',
        gender_split: { homme: 65, femme: 33, autre: 2 },
        interests: ['Tech', 'Innovation', 'Startups', 'Gadgets'],
      },
    },
    date_creation: '2018-06-15',
    frequence_publication: 'Hebdomadaire',
    status: 'disponible',
    slots: [
      { id: 's5', type: 'article', nom: 'Test produit', description: 'Article test complet', format: '1500 mots + photos', visibilite_estimee: 50000, disponibilites: 4 },
      { id: 's6', type: 'newsletter', nom: 'Newsletter sponsorisée', description: 'Encart newsletter', format: '300x200px', visibilite_estimee: 25000, disponibilites: 8 },
    ],
    conditions: {
      duree_min: 30,
      duree_max: 90,
      valeur_dotation_min: 800,
      valeur_dotation_max: 5000,
      type_dotations_acceptees: ['Produits tech', 'Services', 'Gadgets'],
      delai_validation: 7,
      conditions_specifiques: ['Produits tech uniquement', 'Photos haute qualité requises'],
    },
    partenariats_realises: 89,
    note_moyenne: 4.9,
    created_at: '2023-09-10T10:00:00Z',
    updated_at: '2025-01-21T09:00:00Z',
    verified: true,
  },
  {
    id: '4',
    nom: 'Radio Locale 95.5',
    type: 'radio',
    description: 'Radio locale avec 120K auditeurs quotidiens. Programmes variés: actualité, musique, culture et sport.',
    logo_url: 'https://via.placeholder.com/100',
    cover_url: 'https://via.placeholder.com/400x200',
    site_web: 'https://www.radiolocale955.fr',
    email: 'pub@radiolocale955.fr',
    telephone: '+33 5 61 00 00 00',
    ville: 'Toulouse',
    region: 'Occitanie',
    pays: 'France',
    audience: {
      total: 150000,
      mensuel: 120000,
      type: 'regional',
      demographics: {
        age_range: '30-60 ans',
        interests: ['Musique', 'Actualité locale', 'Sport'],
      },
    },
    date_creation: '1995-01-01',
    frequence_publication: 'Quotidien',
    status: 'disponible',
    slots: [
      { id: 's7', type: 'autre', nom: 'Spot radio 30s', description: 'Spot publicitaire', format: '30 secondes', visibilite_estimee: 40000, disponibilites: 15 },
      { id: 's8', type: 'autre', nom: 'Chronique sponsorisée', description: 'Chronique quotidienne', format: '3 minutes', visibilite_estimee: 25000, disponibilites: 5 },
    ],
    conditions: {
      duree_min: 7,
      duree_max: 60,
      valeur_dotation_min: 300,
      valeur_dotation_max: 3000,
      type_dotations_acceptees: ['Produits', 'Services', 'Bons d\'achat', 'Expériences'],
      delai_validation: 3,
    },
    partenariats_realises: 156,
    note_moyenne: 4.6,
    created_at: '2023-05-20T10:00:00Z',
    updated_at: '2025-01-19T14:30:00Z',
    verified: true,
  },
  {
    id: '5',
    nom: 'École Primaire Jean Moulin',
    type: 'ecole',
    description: 'École primaire de 450 élèves cherchant des partenariats pour événements scolaires, kermesses et projets pédagogiques.',
    logo_url: 'https://via.placeholder.com/100',
    email: 'contact@ecole-jeanmoulin.fr',
    ville: 'Nantes',
    region: 'Pays de la Loire',
    pays: 'France',
    audience: {
      total: 1500,
      mensuel: 1200,
      type: 'local',
      demographics: {
        age_range: 'Familles 25-45 ans',
        interests: ['Éducation', 'Famille', 'Événements'],
      },
    },
    date_creation: '2022-09-01',
    status: 'disponible',
    slots: [
      { id: 's9', type: 'autre', nom: 'Stand kermesse', description: 'Stand lors de la kermesse annuelle', format: 'Stand 2x2m', visibilite_estimee: 800, disponibilites: 6 },
      { id: 's10', type: 'autre', nom: 'Logo newsletter parents', description: 'Logo dans newsletter mensuelle', format: 'Logo 200x100px', visibilite_estimee: 450, disponibilites: 12 },
    ],
    conditions: {
      duree_min: 1,
      duree_max: 365,
      valeur_dotation_min: 100,
      valeur_dotation_max: 2000,
      type_dotations_acceptees: ['Produits', 'Bons d\'achat', 'Expériences'],
      delai_validation: 14,
      conditions_specifiques: ['Adapté aux enfants', 'Valeurs éducatives'],
    },
    partenariats_realises: 12,
    note_moyenne: 4.8,
    created_at: '2024-09-01T10:00:00Z',
    updated_at: '2025-01-15T11:00:00Z',
    verified: false,
  },
];

const Partnerships: React.FC = () => {
  const [filters, setFilters] = useState<PartnershipFilters>({
    sort_by: 'pertinence',
    sort_order: 'desc',
  });

  // Filtrage et tri des médias
  const filteredMedias = useMemo(() => {
    let result = [...MOCK_MEDIAS];

    // Recherche textuelle
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(media => 
        media.nom.toLowerCase().includes(search) ||
        media.description.toLowerCase().includes(search) ||
        media.ville.toLowerCase().includes(search) ||
        media.region?.toLowerCase().includes(search)
      );
    }

    // Filtres par type
    if (filters.types && filters.types.length > 0) {
      result = result.filter(media => filters.types!.includes(media.type));
    }

    // Filtres par portée d'audience
    if (filters.audience_type && filters.audience_type.length > 0) {
      result = result.filter(media => filters.audience_type!.includes(media.audience.type));
    }

    // Filtres par taille d'audience
    if (filters.audience_min) {
      result = result.filter(media => media.audience.mensuel >= filters.audience_min!);
    }
    if (filters.audience_max) {
      result = result.filter(media => media.audience.mensuel <= filters.audience_max!);
    }

    // Filtres par statut
    if (filters.status && filters.status.length > 0) {
      result = result.filter(media => filters.status!.includes(media.status));
    }

    // Médias vérifiés uniquement
    if (filters.verified_only) {
      result = result.filter(media => media.verified);
    }

    // Avec emplacements disponibles
    if (filters.has_slots) {
      result = result.filter(media => 
        media.slots.some(slot => slot.disponibilites > 0)
      );
    }

    // Tri
    const sortBy = filters.sort_by || 'pertinence';
    const sortOrder = filters.sort_order || 'desc';
    
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'audience':
          comparison = a.audience.mensuel - b.audience.mensuel;
          break;
        case 'note':
          comparison = (a.note_moyenne || 0) - (b.note_moyenne || 0);
          break;
        case 'recent':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case 'nom':
          comparison = a.nom.localeCompare(b.nom);
          break;
        default: // pertinence
          comparison = (b.note_moyenne || 0) * b.partenariats_realises - (a.note_moyenne || 0) * a.partenariats_realises;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [filters]);

  const totalSlots = filteredMedias.reduce((sum, media) => 
    sum + media.slots.reduce((s, slot) => s + slot.disponibilites, 0), 0
  );

  const totalAudience = filteredMedias.reduce((sum, media) => sum + media.audience.mensuel, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gray-100 rounded-2xl">
              <Handshake className="w-8 h-8 text-gray-700" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Partenariats</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mb-8">
            Mettez en relation votre entreprise avec des médias exclusivement en échange de marchandises. 
            Dotations concours contre visibilité.
          </p>

          {/* Stats rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                  <TrendingUp className="w-6 h-6 text-gray-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold text-gray-900">{MOCK_MEDIAS.length}</p>
                  <p className="text-gray-600 text-sm">Médias disponibles</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                  <Users className="w-6 h-6 text-gray-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold text-gray-900">
                    {(totalAudience / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-gray-600 text-sm">Audience totale mensuelle</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                  <Award className="w-6 h-6 text-gray-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold text-gray-900">{totalSlots}</p>
                  <p className="text-gray-600 text-sm">Emplacements disponibles</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres */}
        <div className="mb-6">
          <MediaFilters
            filters={filters}
            onFiltersChange={setFilters}
            resultsCount={filteredMedias.length}
          />
        </div>

        {/* Liste des médias */}
        {filteredMedias.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedias.map(media => (
              <MediaCard key={media.id} media={media} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <Handshake className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun média trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              Essayez de modifier vos critères de recherche ou de filtrage
            </p>
            <button
              onClick={() => setFilters({ sort_by: 'pertinence', sort_order: 'desc' })}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Partnerships;
