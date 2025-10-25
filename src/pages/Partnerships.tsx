// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { Handshake, TrendingUp, Users, Award } from 'lucide-react';
import { useMediaPartners } from '@/hooks/useMediaPartners';

export default function Partnerships() {
  const { mediaPartners, loading } = useMediaPartners();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filtrage des médias
  const filteredMedias = useMemo(() => {
    let result = [...mediaPartners];

    // Recherche textuelle
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(media => 
        media.name.toLowerCase().includes(search) ||
        (media.description && media.description.toLowerCase().includes(search)) ||
        (media.category && media.category.toLowerCase().includes(search))
      );
    }

    // Filtre par catégorie
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(media => media.category === selectedCategory);
    }

    return result;
  }, [mediaPartners, searchTerm, selectedCategory]);

  const totalAudience = filteredMedias.reduce((sum, media) => sum + media.monthly_visits, 0);
  const categories = Array.from(new Set(mediaPartners.map(m => m.category).filter(Boolean)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-accent rounded-2xl">
              <Handshake className="w-8 h-8 text-accent-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Partenariats</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mb-8">
            Mettez en relation votre entreprise avec des médias exclusivement en échange de marchandises. 
            Dotations concours contre visibilité.
          </p>

          {/* Stats rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-accent/50 border rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-card rounded-lg shadow-sm border">
                  <TrendingUp className="w-6 h-6 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold text-foreground">{mediaPartners.length}</p>
                  <p className="text-muted-foreground text-sm">Médias disponibles</p>
                </div>
              </div>
            </div>
            <div className="bg-accent/50 border rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-card rounded-lg shadow-sm border">
                  <Users className="w-6 h-6 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold text-foreground">
                    {(totalAudience / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-muted-foreground text-sm">Audience totale mensuelle</p>
                </div>
              </div>
            </div>
            <div className="bg-accent/50 border rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-card rounded-lg shadow-sm border">
                  <Award className="w-6 h-6 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold text-foreground">{filteredMedias.length}</p>
                  <p className="text-muted-foreground text-sm">Partenaires actifs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher un média..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-background text-foreground"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Liste des médias */}
        {filteredMedias.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedias.map(media => (
              <div key={media.id} className="bg-card rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  {media.logo_url ? (
                    <img src={media.logo_url} alt={media.name} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center">
                      <Handshake className="w-6 h-6 text-accent-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground mb-1">{media.name}</h3>
                    {media.category && (
                      <span className="text-xs px-2 py-1 bg-accent text-accent-foreground rounded-full">
                        {media.category}
                      </span>
                    )}
                  </div>
                </div>
                {media.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{media.description}</p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-muted-foreground">Audience mensuelle</p>
                    <p className="font-semibold text-foreground">{(media.monthly_visits / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Portée</p>
                    <p className="font-semibold text-foreground">{(media.reach_count / 1000).toFixed(0)}K</p>
                  </div>
                </div>
                {media.website_url && (
                  <a
                    href={media.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block text-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Visiter le site
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-2xl shadow-sm border p-12 text-center">
            <Handshake className="w-16 h-16 text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Aucun média trouvé
            </h3>
            <p className="text-muted-foreground mb-6">
              Essayez de modifier vos critères de recherche
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
