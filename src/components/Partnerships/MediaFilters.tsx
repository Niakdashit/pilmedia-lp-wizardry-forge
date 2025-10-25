// @ts-nocheck
import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { MediaType, AudienceType, PartnershipStatus, PartnershipFilters } from '../../types/partnership';

interface MediaFiltersProps {
  filters: PartnershipFilters;
  onFiltersChange: (filters: PartnershipFilters) => void;
  resultsCount: number;
}

const MEDIA_TYPES: { value: MediaType; label: string }[] = [
  { value: 'presse_locale', label: 'Presse Locale' },
  { value: 'presse_nationale', label: 'Presse Nationale' },
  { value: 'presse_periodique', label: 'Presse Périodique' },
  { value: 'blog', label: 'Blog' },
  { value: 'site_web', label: 'Site Web' },
  { value: 'mairie', label: 'Mairie' },
  { value: 'ecole', label: 'École' },
  { value: 'radio', label: 'Radio' },
  { value: 'television', label: 'Télévision' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'reseau_social', label: 'Réseau Social' },
  { value: 'autre', label: 'Autre' },
];

const AUDIENCE_TYPES: { value: AudienceType; label: string }[] = [
  { value: 'local', label: 'Local' },
  { value: 'regional', label: 'Régional' },
  { value: 'national', label: 'National' },
  { value: 'international', label: 'International' },
];

const SORT_OPTIONS = [
  { value: 'pertinence', label: 'Pertinence' },
  { value: 'audience', label: 'Audience' },
  { value: 'note', label: 'Note' },
  { value: 'recent', label: 'Plus récents' },
  { value: 'nom', label: 'Nom' },
];

export const MediaFilters: React.FC<MediaFiltersProps> = ({ filters, onFiltersChange, resultsCount }) => {
  const [showFilters, setShowFilters] = React.useState(false);

  const updateFilter = (key: keyof PartnershipFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'types' | 'audience_type', value: any) => {
    const current = filters[key] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilter(key, updated.length > 0 ? updated : undefined);
  };

  const clearFilters = () => {
    onFiltersChange({ search: filters.search });
  };

  const activeFiltersCount = [
    filters.types?.length,
    filters.audience_type?.length,
    filters.audience_min ? 1 : 0,
    filters.regions?.length,
    filters.status?.length,
    filters.verified_only ? 1 : 0,
    filters.has_slots ? 1 : 0,
  ].reduce((sum, count) => sum + (count || 0), 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
      {/* Barre de recherche */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un média, une ville, un type..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value || undefined)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium transition-all ${
            showFilters
              ? 'bg-gray-700 text-white border-gray-700'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtres
          {activeFiltersCount > 0 && (
            <span className="bg-white text-gray-700 px-2 py-0.5 rounded-full text-xs font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Résultats et tri */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          <span className="font-semibold text-gray-900">{resultsCount}</span> média{resultsCount > 1 ? 's' : ''} trouvé{resultsCount > 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-2">
          <label className="text-gray-600">Trier par:</label>
          <select
            value={filters.sort_by || 'pertinence'}
            onChange={(e) => updateFilter('sort_by', e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Panneau de filtres avancés */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          {/* Type de média */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-medium text-gray-900">Type de média</label>
              {filters.types && filters.types.length > 0 && (
                <button
                  onClick={() => updateFilter('types', undefined)}
                  className="text-xs text-gray-700 hover:underline"
                >
                  Effacer
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {MEDIA_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => toggleArrayFilter('types', type.value)}
                  className={`px-3 py-1.5 text-sm rounded-xl border transition-all ${
                    filters.types?.includes(type.value)
                      ? 'bg-gray-700 text-white border-gray-700'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Portée de l'audience */}
          <div>
            <label className="font-medium text-gray-900 block mb-2">Portée de l'audience</label>
            <div className="flex flex-wrap gap-2">
              {AUDIENCE_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => toggleArrayFilter('audience_type', type.value)}
                  className={`px-3 py-1.5 text-sm rounded-xl border transition-all ${
                    filters.audience_type?.includes(type.value)
                      ? 'bg-gray-700 text-white border-gray-700'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Taille de l'audience */}
          <div>
            <label className="font-medium text-gray-900 block mb-2">Taille de l'audience mensuelle</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Minimum</label>
                <input
                  type="number"
                  placeholder="Ex: 10000"
                  value={filters.audience_min || ''}
                  onChange={(e) => updateFilter('audience_min', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Maximum</label>
                <input
                  type="number"
                  placeholder="Ex: 100000"
                  value={filters.audience_max || ''}
                  onChange={(e) => updateFilter('audience_max', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Options supplémentaires */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.verified_only || false}
                onChange={(e) => updateFilter('verified_only', e.target.checked || undefined)}
                className="w-4 h-4 text-gray-700 border-gray-300 rounded focus:ring-gray-500"
              />
              <span className="text-sm text-gray-700">Médias vérifiés uniquement</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.has_slots || false}
                onChange={(e) => updateFilter('has_slots', e.target.checked || undefined)}
                className="w-4 h-4 text-gray-700 border-gray-300 rounded focus:ring-gray-500"
              />
              <span className="text-sm text-gray-700">Avec emplacements disponibles</span>
            </label>
          </div>

          {/* Actions */}
          {activeFiltersCount > 0 && (
            <div className="flex justify-end pt-2">
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-700 font-medium transition-colors"
              >
                <X className="w-4 h-4" />
                Réinitialiser tous les filtres
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
