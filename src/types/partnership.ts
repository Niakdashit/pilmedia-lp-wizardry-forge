export type MediaType = 
  | 'presse_locale'
  | 'presse_nationale'
  | 'presse_periodique'
  | 'blog'
  | 'site_web'
  | 'mairie'
  | 'ecole'
  | 'radio'
  | 'television'
  | 'podcast'
  | 'newsletter'
  | 'reseau_social'
  | 'autre';

export type AudienceType = 'local' | 'regional' | 'national' | 'international';

export type PartnershipStatus = 'disponible' | 'en_cours' | 'complet' | 'suspendu';

export interface MediaAudience {
  total: number;
  mensuel: number;
  type: AudienceType;
  demographics: {
    age_range: string;
    gender_split?: { homme: number; femme: number; autre: number };
    interests: string[];
  };
}

export interface MediaSlot {
  id: string;
  type: 'banniere' | 'article' | 'post' | 'video' | 'newsletter' | 'autre';
  nom: string;
  description: string;
  format: string; // ex: "300x250px", "Article 500 mots", etc.
  position?: string;
  visibilite_estimee: number;
  disponibilites: number; // nombre de slots disponibles
}

export interface PartnershipConditions {
  duree_min: number; // en jours
  duree_max: number; // en jours
  valeur_dotation_min: number; // en euros
  valeur_dotation_max?: number;
  type_dotations_acceptees: string[];
  delai_validation: number; // en jours
  conditions_specifiques?: string[];
}

export interface Media {
  id: string;
  nom: string;
  type: MediaType;
  description: string;
  logo_url?: string;
  cover_url?: string;
  site_web?: string;
  email: string;
  telephone?: string;
  
  // Localisation
  adresse?: string;
  ville: string;
  code_postal?: string;
  region?: string;
  pays: string;
  
  // Audience et statistiques
  audience: MediaAudience;
  date_creation: string;
  frequence_publication?: string;
  
  // Partenariats
  status: PartnershipStatus;
  slots: MediaSlot[];
  conditions: PartnershipConditions;
  partenariats_realises: number;
  note_moyenne?: number; // 0-5
  
  // Métadonnées
  created_at: string;
  updated_at: string;
  verified: boolean;
}

export interface PartnershipRequest {
  id: string;
  media_id: string;
  annonceur_id: string;
  annonceur_nom: string;
  annonceur_email: string;
  annonceur_telephone?: string;
  annonceur_entreprise: string;
  
  slot_ids: string[]; // slots demandés
  
  // Dotations proposées
  dotations: {
    type: string;
    description: string;
    valeur_estimee: number;
    quantite: number;
  }[];
  
  duree_souhaitee: number; // en jours
  date_debut_souhaitee?: string;
  
  message: string;
  objectifs?: string;
  
  status: 'en_attente' | 'acceptee' | 'refusee' | 'en_negociation' | 'finalisee';
  
  created_at: string;
  updated_at: string;
}

export interface PartnershipFilters {
  search?: string;
  types?: MediaType[];
  audience_type?: AudienceType[];
  audience_min?: number;
  audience_max?: number;
  regions?: string[];
  status?: PartnershipStatus[];
  verified_only?: boolean;
  has_slots?: boolean;
  sort_by?: 'pertinence' | 'audience' | 'note' | 'recent' | 'nom';
  sort_order?: 'asc' | 'desc';
}
