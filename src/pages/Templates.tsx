import React, { useState } from 'react';
import PageContainer from '../components/Layout/PageContainer';
import { Search } from 'lucide-react';

interface Template {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  aspectRatio: '9:16' | '16:9' | 'square';
  format: '9:16' | '16:9';
}

const CATEGORIES = [
  'Tout',
  'Logo',
  'Flyer',
  'Story Instagram',
  'Présentation',
  'Reel Instagram',
  'Affiche'
];

// Mock templates data
const MOCK_TEMPLATES: Template[] = [
  {
    id: '1',
    title: 'Art Title',
    category: 'Story Instagram',
    imageUrl: 'https://images.unsplash.com/photo-1561998338-13ad7883b20f?w=400&h=700&fit=crop',
    aspectRatio: '9:16',
    format: '9:16'
  },
  {
    id: '2',
    title: 'Courage Quote',
    category: 'Story Instagram',
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&h=350&fit=crop',
    aspectRatio: '16:9',
    format: '16:9'
  },
  {
    id: '3',
    title: 'Furniture Store',
    category: 'Reel Instagram',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=650&fit=crop',
    aspectRatio: '9:16',
    format: '9:16'
  },
  {
    id: '4',
    title: 'Congratulations',
    category: 'Flyer',
    imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=500&h=350&fit=crop',
    aspectRatio: '16:9',
    format: '16:9'
  },
  {
    id: '5',
    title: 'Wedding Invitation',
    category: 'Affiche',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=600&fit=crop',
    aspectRatio: '9:16',
    format: '9:16'
  },
  {
    id: '6',
    title: 'Photo Collage',
    category: 'Story Instagram',
    imageUrl: 'https://images.unsplash.com/photo-1452457807411-4979b707c5be?w=400&h=650&fit=crop',
    aspectRatio: '9:16',
    format: '9:16'
  },
  {
    id: '7',
    title: 'Norway Travel',
    category: 'Flyer',
    imageUrl: 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=500&h=350&fit=crop',
    aspectRatio: '16:9',
    format: '16:9'
  },
  {
    id: '8',
    title: 'Italian Learning',
    category: 'Story Instagram',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=650&fit=crop',
    aspectRatio: '9:16',
    format: '9:16'
  },
  {
    id: '9',
    title: '90s Mixtape',
    category: 'Présentation',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=350&fit=crop',
    aspectRatio: '16:9',
    format: '16:9'
  },
  {
    id: '10',
    title: 'Lightning Storm',
    category: 'Story Instagram',
    imageUrl: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=400&h=700&fit=crop',
    aspectRatio: '9:16',
    format: '9:16'
  },
  {
    id: '11',
    title: 'Lemonade Stand',
    category: 'Affiche',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784acc?w=400&h=600&fit=crop',
    aspectRatio: '9:16',
    format: '9:16'
  },
  {
    id: '12',
    title: 'Retro TV',
    category: 'Flyer',
    imageUrl: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500&h=350&fit=crop',
    aspectRatio: '16:9',
    format: '16:9'
  },
  {
    id: '13',
    title: 'Baby Announcement',
    category: 'Story Instagram',
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=650&fit=crop',
    aspectRatio: '9:16',
    format: '9:16'
  },
  {
    id: '14',
    title: 'Thank You Card',
    category: 'Flyer',
    imageUrl: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6?w=500&h=350&fit=crop',
    aspectRatio: '16:9',
    format: '16:9'
  }
];

const Templates: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tout');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<'all' | '9:16' | '16:9'>('all');

  const filteredTemplates = MOCK_TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === 'Tout' || template.category === selectedCategory;
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFormat = selectedFormat === 'all' || template.format === selectedFormat;
    return matchesCategory && matchesSearch && matchesFormat;
  });

  return (
    <PageContainer className="bg-white">
      {/* Header with search */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher partout"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

      {/* Category filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-sm font-medium text-gray-700">Format:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFormat('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedFormat === 'all'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setSelectedFormat('9:16')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedFormat === '9:16'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                9:16 (Portrait)
              </button>
              <button
                onClick={() => setSelectedFormat('16:9')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedFormat === '16:9'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                16:9 (Paysage)
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

        {/* Masonry grid */}
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="break-inside-avoid group cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-lg bg-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                    <img
                      src={template.imageUrl}
                      alt={template.title}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-semibold text-sm">{template.title}</h3>
                        <p className="text-white/80 text-xs mt-1">{template.category}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">Aucun modèle trouvé</p>
                <p className="text-gray-400 text-sm mt-2">Essayez de modifier vos filtres ou votre recherche</p>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
  );
};

export default Templates;
