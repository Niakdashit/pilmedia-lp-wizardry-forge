// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { useTemplates } from '@/hooks/useTemplates';
import PageContainer from '../components/Layout/PageContainer';
import Spinner from '@/components/shared/Spinner';

export default function Templates() {
  const { templates, loading } = useTemplates();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('Tous');
  const [selectedCategory, setSelectedCategory] = useState('Tout');

  const formats = ['Tous', '9:16 (Portrait)', '16:9 (Paysage)'];
  const categories = ['Tout', 'Logo', 'Flyer', 'Story Instagram', 'Présentation', 'Reel Instagram', 'Affiche'];

  const filteredTemplates = templates.filter(template => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      template.name.toLowerCase().includes(search) ||
      (template.description && template.description.toLowerCase().includes(search))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageContainer className="bg-transparent">
        <div className="px-6 sm:px-8 lg:px-10 py-8">
          {/* Barre de recherche et bouton créer */}
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher partout"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#44444d] focus:border-transparent"
              />
            </div>
            <button
              onClick={() => navigate('/template-editor')}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#44444d] text-white rounded-lg font-medium hover:bg-[#5a5a63] transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span className="whitespace-nowrap">Créer un template</span>
            </button>
          </div>

          {/* Filtres */}
          <div className="mb-6 space-y-4">
            {/* Format */}
            <div>
              <span className="text-sm font-medium text-gray-700 mr-3">Format:</span>
              <div className="inline-flex gap-2">
                {formats.map((format) => (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedFormat === format
                        ? 'bg-[#44444d] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>

            {/* Catégories */}
            <div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-[#44444d] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grille de templates */}
          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTemplates.map(template => (
                <div 
                  key={template.id} 
                  className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border border-gray-200"
                  onClick={() => navigate(`/wizard?templateId=${template.id}`)}
                >
                  {template.thumbnail_url ? (
                    <img 
                      src={template.thumbnail_url} 
                      alt={template.name} 
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Aperçu bientôt disponible</span>
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{template.name}</h3>
                    {template.is_premium && (
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-[#44444d]/10 text-[#44444d] rounded-full">Premium</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500">Aucun template trouvé</p>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
