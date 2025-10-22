import React from 'react';
import { Square, Circle, Type, Image as ImageIcon, MousePointerSquare, LayoutGrid, FileText, Instagram, Facebook, Twitter, Linkedin, ChevronDown, Search, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ElementItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  type: string;
  preview?: string;
  category: 'text' | 'media' | 'shapes' | 'social' | 'interactive';
  defaultProps?: any;
}

const textElements: ElementItem[] = [
  {
    id: 'heading',
    name: 'Titre',
    icon: Type,
    type: 'text',
    category: 'text',
    defaultProps: {
      text: 'Titre principal',
      fontSize: 24,
      fontWeight: 'bold',
      width: 280,
      height: 'auto',
      maxWidth: '90%'
    }
  },
  {
    id: 'subheading',
    name: 'Sous-titre',
    icon: Type,
    type: 'text',
    category: 'text',
    defaultProps: {
      text: 'Sous-titre',
      fontSize: 18,
      fontWeight: '600',
      width: 280,
      height: 'auto',
      maxWidth: '90%'
    }
  },
  {
    id: 'paragraph',
    name: 'Paragraphe',
    icon: FileText,
    type: 'text',
    category: 'text',
    defaultProps: {
      text: 'Cliquez pour modifier ce texte. Utilisez cet espace pour partager des informations sur votre marque.',
      fontSize: 14,
      width: 280,
      height: 'auto',
      maxWidth: '90%',
      lineHeight: 1.5
    }
  },
];

const mediaElements: ElementItem[] = [
  {
    id: 'image',
    name: 'Image',
    icon: ImageIcon,
    type: 'image',
    category: 'media',
    defaultProps: {
      src: '/placeholder-image.jpg',
      width: 240,
      height: 160,
      alt: 'Image',
      maxWidth: '100%',
      objectFit: 'cover'
    }
  },
  {
    id: 'video',
    name: 'Vidéo',
    icon: LayoutGrid, // Remplacement de YoutubeIcon par une icône disponible
    type: 'video',
    category: 'media',
    defaultProps: {
      src: '',
      width: 280,
      height: 158,
      maxWidth: '100%',
      aspectRatio: '16/9'
    }
  },
];

const shapeElements: ElementItem[] = [
  {
    id: 'rectangle',
    name: 'Rectangle',
    icon: Square,
    type: 'shape',
    category: 'shapes',
    defaultProps: {
      width: 100,
      height: 60,
      backgroundColor: '#3B82F6',
      borderRadius: 0,
      maxWidth: '100%'
    }
  },
  {
    id: 'circle',
    name: 'Cercle',
    icon: Circle,
    type: 'shape',
    category: 'shapes',
    defaultProps: {
      width: 80,
      height: 80,
      backgroundColor: '#3B82F6',
      borderRadius: '50%',
      maxWidth: '100%'
    }
  },
  {
    id: 'line-horizontal',
    name: 'Ligne horizontale',
    icon: MousePointerSquare, // Remplacement de ArrowLeftRight
    type: 'shape',
    category: 'shapes',
    defaultProps: {
      width: 160,
      height: 2,
      backgroundColor: '#6B7280',
      rotation: 0,
      maxWidth: '100%'
    }
  },
  {
    id: 'line-vertical',
    name: 'Ligne verticale',
    icon: MousePointerSquare, // Remplacement de ArrowUpDown
    type: 'shape',
    category: 'shapes',
    defaultProps: {
      width: 2,
      height: 80,
      backgroundColor: '#6B7280',
      rotation: 0,
      maxHeight: '100%'
    }
  },
];

const socialElements: ElementItem[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    type: 'social',
    category: 'social',
    defaultProps: {
      platform: 'facebook',
      url: 'https://facebook.com',
      size: 20,
      color: '#1877F2',
      width: 40,
      height: 40
    }
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    type: 'social',
    category: 'social',
    defaultProps: {
      platform: 'instagram',
      url: 'https://instagram.com',
      size: 20,
      color: '#E1306C',
      width: 40,
      height: 40
    }
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    type: 'social',
    category: 'social',
    defaultProps: {
      platform: 'twitter',
      url: 'https://twitter.com',
      size: 20,
      color: '#1DA1F2',
      width: 40,
      height: 40
    }
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    type: 'social',
    category: 'social',
    defaultProps: {
      platform: 'linkedin',
      url: 'https://linkedin.com',
      size: 20,
      color: '#0077B5',
      width: 40,
      height: 40
    }
  },
];

const interactiveElements: ElementItem[] = [
  {
    id: 'button',
    name: 'Bouton',
    icon: MousePointerSquare,
    type: 'button',
    category: 'interactive',
    defaultProps: {
      text: 'Cliquez ici',
      width: 260,
      height: 44,
      backgroundColor: '#3B82F6',
      textColor: '#FFFFFF',
      borderRadius: 8,
      fontSize: 16,
      fontWeight: '500',
      maxWidth: '100%',
      padding: '0 16px'
    }
  },
  {
    id: 'form',
    name: 'Formulaire',
    icon: LayoutGrid,
    type: 'form',
    category: 'interactive',
    defaultProps: {
      width: 280,
      height: 'auto',
      maxWidth: '100%',
      fields: [
        { 
          type: 'text', 
          label: 'Nom', 
          placeholder: 'Votre nom', 
          required: true,
          width: '100%',
          marginBottom: 12
        },
        { 
          type: 'email', 
          label: 'Email', 
          placeholder: 'votre@email.com', 
          required: true,
          width: '100%',
          marginBottom: 16
        },
      ],
      buttonText: 'Envoyer',
      buttonStyle: {
        width: '100%',
        height: 44,
        borderRadius: 8,
        fontSize: 16,
        fontWeight: '500'
      },
      padding: 16,
      gap: 8
    }
  },
];

const allElements = [
  ...textElements,
  ...mediaElements,
  ...shapeElements,
  ...socialElements,
  ...interactiveElements,
];

const categoryIcons = {
  text: Type,
  media: ImageIcon,
  shapes: Square,
  social: Share2,
  interactive: MousePointerSquare,
};

const categoryLabels = {
  text: 'Texte',
  media: 'Médias',
  shapes: 'Formes',
  social: 'Réseaux sociaux',
  interactive: 'Interactifs',
};

interface ElementsPanelProps {
  onAddElement: (element: any) => void;
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
}

const EnhancedElementsPanel: React.FC<ElementsPanelProps> = ({ 
  onAddElement, 
  selectedElement, 
  onElementUpdate 
}) => {
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredElements = React.useMemo(() => {
    if (!searchQuery.trim()) return allElements;
    
    const query = searchQuery.toLowerCase();
    return allElements.filter(element => 
      element.name.toLowerCase().includes(query) || 
      element.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const categories = React.useMemo(() => {
    const cats = new Set(filteredElements.map(el => el.category));
    return Array.from(cats);
  }, [filteredElements]);

  const handleAddElement = (element: ElementItem) => {
    onAddElement({
      id: `${element.type}-${Date.now()}`,
      type: element.type,
      x: 50,
      y: 50,
      zIndex: 10,
      ...element.defaultProps,
    });
  };

  const toggleCategory = (category: string) => {
    setActiveCategory(activeCategory === category ? null : category);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Éléments</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher des éléments..."
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {searchQuery ? (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 px-1">Résultats de la recherche</h3>
            <div className="grid grid-cols-2 gap-2">
              {filteredElements.map((element) => (
                <motion.button
                  key={element.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAddElement(element)}
                  className="flex flex-col items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md mb-1">
                    <element.icon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </div>
                  <span className="text-xs text-gray-700 dark:text-gray-300 text-center">{element.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => {
              const elements = filteredElements.filter(el => el.category === category);
              if (elements.length === 0) return null;
              
              const isActive = activeCategory === category || categories.length === 1;
              const Icon = categoryIcons[category] || Square;
              
              return (
                <div key={category} className="space-y-1">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between px-1 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center">
                      <Icon className="h-4 w-4 mr-2" />
                      <span>{categoryLabels[category] || category}</span>
                    </div>
                    {categories.length > 1 && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${isActive ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  
                  {isActive && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-2 pl-1 pr-1 pb-1">
                        {elements.map((element) => (
                          <motion.button
                            key={element.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAddElement(element)}
                            className="flex flex-col items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md mb-1">
                              <element.icon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                            </div>
                            <span className="text-xs text-gray-700 dark:text-gray-300 text-center">{element.name}</span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedElementsPanel;
