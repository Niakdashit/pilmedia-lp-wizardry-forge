
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNewsletterStore } from '@/stores/newsletterStore';
import { 
  Type, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Minus, 
  Share2, 
  Columns, 
  Layout, 
  Video, 
  Quote, 
  AlignJustify as FooterIcon, 
  Code,
  Search,
  Sparkles,
  Plus
} from 'lucide-react';

const modules = [
  { 
    id: 'header', 
    label: 'En-tête', 
    icon: <Layout className="w-5 h-5" />, 
    description: 'Logo, titre et navigation',
    category: 'structure',
    color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
  },
  { 
    id: 'text', 
    label: 'Texte', 
    icon: <Type className="w-5 h-5" />, 
    description: 'Paragraphe avec mise en forme',
    category: 'content',
    color: 'bg-green-50 hover:bg-green-100 border-green-200'
  },
  { 
    id: 'image', 
    label: 'Image', 
    icon: <ImageIcon className="w-5 h-5" />, 
    description: 'Image avec légende optionnelle',
    category: 'media',
    color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
  },
  { 
    id: 'button', 
    label: 'Bouton', 
    icon: <LinkIcon className="w-5 h-5" />, 
    description: "Bouton d'appel à l'action",
    category: 'interactive',
    color: 'bg-[#fdf2f8] hover:bg-[#fce7f3] border-[#f3e8ff]'
  },
  { 
    id: 'divider', 
    label: 'Séparateur', 
    icon: <Minus className="w-5 h-5" />, 
    description: 'Ligne de séparation',
    category: 'structure',
    color: 'bg-gray-50 hover:bg-gray-100 border-gray-200'
  },
  { 
    id: 'columns', 
    label: 'Colonnes', 
    icon: <Columns className="w-5 h-5" />, 
    description: 'Disposition en 2 ou 3 colonnes',
    category: 'layout',
    color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200'
  },
  { 
    id: 'social', 
    label: 'Réseaux sociaux', 
    icon: <Share2 className="w-5 h-5" />, 
    description: 'Liens vers vos profils sociaux',
    category: 'social',
    color: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200'
  },
  { 
    id: 'footer', 
    label: 'Pied de page', 
    icon: <FooterIcon className="w-5 h-5" />, 
    description: 'Coordonnées et mentions légales',
    category: 'structure',
    color: 'bg-slate-50 hover:bg-slate-100 border-slate-200'
  },
  { 
    id: 'video', 
    label: 'Vidéo', 
    icon: <Video className="w-5 h-5" />, 
    description: 'Intégration de vidéo',
    category: 'media',
    color: 'bg-red-50 hover:bg-red-100 border-red-200'
  },
  { 
    id: 'testimonial', 
    label: 'Témoignage', 
    icon: <Quote className="w-5 h-5" />, 
    description: 'Citation avec photo et nom',
    category: 'content',
    color: 'bg-amber-50 hover:bg-amber-100 border-amber-200'
  },
  { 
    id: 'html', 
    label: 'HTML', 
    icon: <Code className="w-5 h-5" />, 
    description: 'Code HTML personnalisé',
    category: 'advanced',
    color: 'bg-orange-50 hover:bg-orange-100 border-orange-200'
  },
];

const categories = [
  { id: 'all', label: 'Tous', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'structure', label: 'Structure', icon: <Layout className="w-4 h-4" /> },
  { id: 'content', label: 'Contenu', icon: <Type className="w-4 h-4" /> },
  { id: 'media', label: 'Média', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'interactive', label: 'Interaction', icon: <LinkIcon className="w-4 h-4" /> },
];

export const EnhancedModulesList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addModule } = useNewsletterStore();

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddModule = (moduleType: string) => {
    addModule({
      id: `module-${Date.now()}`,
      type: moduleType as any,
      content: getDefaultContent(moduleType),
      settings: getDefaultSettings(moduleType)
    });
  };

  const getDefaultContent = (moduleType: string) => {
    switch (moduleType) {
      case 'text':
        return 'Votre texte ici...';
      case 'header':
        return 'En-tête de newsletter';
      case 'button':
        return 'Cliquez ici';
      case 'image':
        return '';
      case 'testimonial':
        return 'Un témoignage client fantastique qui montre la satisfaction de nos clients.';
      case 'html':
        return '<div style="padding: 20px; background: #f5f5f5; border-radius: 8px;"><h3>Mon bloc HTML</h3><p>Contenu personnalisé</p></div>';
      case 'columns':
        return JSON.stringify(['Contenu de la première colonne', 'Contenu de la deuxième colonne']);
      default:
        return '';
    }
  };

  const getDefaultSettings = (moduleType: string) => {
    switch (moduleType) {
      case 'button':
        return { url: '#' };
      case 'columns':
        return { columns: 2 };
      case 'testimonial':
        return { author: 'Client satisfait' };
      default:
        return {};
    }
  };

  return (
    <div className="w-80 bg-white/95 backdrop-blur-sm border-r border-gray-200/50 overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50 bg-gradient-to-b from-white to-gray-50/50">
        <h2 className="font-bold text-xl text-gray-800 mb-2">📦 Modules</h2>
        <p className="text-sm text-gray-600 mb-4">Cliquez pour ajouter un module</p>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher un module..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.icon}
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modules list */}
      <div className="p-4 space-y-3">
        {filteredModules.map((module, index) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <button
              onClick={() => handleAddModule(module.id)}
              className={`w-full ${module.color} border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] group relative overflow-hidden`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center flex-1 min-w-0">
                  <div className="text-gray-600 mr-3 group-hover:scale-110 transition-transform duration-200">
                    {module.icon}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <h3 className="font-semibold text-gray-800 text-sm">{module.label}</h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{module.description}</p>
                  </div>
                </div>
                
                <Plus className="w-5 h-5 text-[#841b60] opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          </motion.div>
        ))}

        {filteredModules.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-500"
          >
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucun module trouvé</p>
            <p className="text-xs mt-1">Essayez un autre terme de recherche</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
