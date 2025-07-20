import React, { useState, useRef } from 'react';
import { 
  Upload, Image as ImageIcon, Type, Shapes, Star, Hash, 
  Circle, Square, Triangle, Hexagon, Heart, MapPin,
  TrendingUp, BarChart3, PieChart, Activity,
  Music, Play, Search, Grid3X3,
  Frame, Layout, Layers
} from 'lucide-react';
import { 
  FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube,
  FaApple, FaGoogle
} from 'react-icons/fa';
import type { EditorConfig } from '../QualifioEditorLayout';

interface ElementsLibraryTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

type Category = 'shapes' | 'icons' | 'photos' | 'graphics' | 'charts' | 'stickers' | 'text' | 'frames' | 'backgrounds' | 'logos';

interface LibraryElement {
  id: string;
  type: 'shape' | 'icon' | 'image' | 'graphic' | 'chart' | 'text';
  category: Category;
  name: string;
  preview: React.ReactNode;
  data: any;
}

const ElementsLibraryTab: React.FC<ElementsLibraryTabProps> = ({
  config,
  onConfigUpdate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('shapes');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'shapes' as Category, label: 'Formes', icon: Shapes },
    { id: 'icons' as Category, label: 'Icônes', icon: Star },
    { id: 'photos' as Category, label: 'Photos', icon: ImageIcon },
    { id: 'graphics' as Category, label: 'Graphiques', icon: TrendingUp },
    { id: 'charts' as Category, label: 'Graphiques', icon: BarChart3 },
    { id: 'stickers' as Category, label: 'Autocollants', icon: Hash },
    { id: 'text' as Category, label: 'Texte', icon: Type },
    { id: 'frames' as Category, label: 'Cadres', icon: Frame },
    { id: 'backgrounds' as Category, label: 'Arrière-plans', icon: Layout },
    { id: 'logos' as Category, label: 'Logos', icon: Layers }
  ];

  // Formes géométriques
  const shapes: LibraryElement[] = [
    {
      id: 'circle',
      type: 'shape',
      category: 'shapes',
      name: 'Cercle',
      preview: <Circle className="w-8 h-8 text-blue-500" />,
      data: { type: 'circle', color: '#3b82f6', size: 100 }
    },
    {
      id: 'square',
      type: 'shape',
      category: 'shapes',
      name: 'Carré',
      preview: <Square className="w-8 h-8 text-green-500" />,
      data: { type: 'square', color: '#10b981', size: 100 }
    },
    {
      id: 'triangle',
      type: 'shape',
      category: 'shapes',
      name: 'Triangle',
      preview: <Triangle className="w-8 h-8 text-purple-500" />,
      data: { type: 'triangle', color: '#8b5cf6', size: 100 }
    },
    {
      id: 'hexagon',
      type: 'shape',
      category: 'shapes',
      name: 'Hexagone',
      preview: <Hexagon className="w-8 h-8 text-orange-500" />,
      data: { type: 'hexagon', color: '#f97316', size: 100 }
    },
    {
      id: 'heart',
      type: 'shape',
      category: 'shapes',
      name: 'Cœur',
      preview: <Heart className="w-8 h-8 text-red-500" />,
      data: { type: 'heart', color: '#ef4444', size: 100 }
    },
    {
      id: 'star',
      type: 'shape',
      category: 'shapes',
      name: 'Étoile',
      preview: <Star className="w-8 h-8 text-yellow-500" />,
      data: { type: 'star', color: '#eab308', size: 100 }
    }
  ];

  // Icônes populaires
  const icons: LibraryElement[] = [
    {
      id: 'map-pin',
      type: 'icon',
      category: 'icons',
      name: 'Épingle',
      preview: <MapPin className="w-8 h-8 text-gray-600" />,
      data: { type: 'icon', iconName: 'MapPin', color: '#4b5563', size: 32 }
    },
    {
      id: 'heart-icon',
      type: 'icon',
      category: 'icons',
      name: 'Cœur',
      preview: <Heart className="w-8 h-8 text-red-500" />,
      data: { type: 'icon', iconName: 'Heart', color: '#ef4444', size: 32 }
    },
    {
      id: 'star-icon',
      type: 'icon',
      category: 'icons',
      name: 'Étoile',
      preview: <Star className="w-8 h-8 text-yellow-500" />,
      data: { type: 'icon', iconName: 'Star', color: '#eab308', size: 32 }
    },
    {
      id: 'play-icon',
      type: 'icon',
      category: 'icons',
      name: 'Lecture',
      preview: <Play className="w-8 h-8 text-green-500" />,
      data: { type: 'icon', iconName: 'Play', color: '#10b981', size: 32 }
    },
    {
      id: 'music-icon',
      type: 'icon',
      category: 'icons',
      name: 'Musique',
      preview: <Music className="w-8 h-8 text-purple-500" />,
      data: { type: 'icon', iconName: 'Music', color: '#8b5cf6', size: 32 }
    }
  ];

  // Photos stock avec vraies images
  const photos: LibraryElement[] = [
    {
      id: 'photo-business',
      type: 'image',
      category: 'photos',
      name: 'Équipe Business',
      preview: <img src="/src/assets/library/business-team.jpg" className="w-16 h-12 object-cover rounded" alt="Business" />,
      data: { type: 'photo', url: '/src/assets/library/business-team.jpg', category: 'business' }
    },
    {
      id: 'photo-nature',
      type: 'image',
      category: 'photos',
      name: 'Forêt Nature',
      preview: <img src="/src/assets/library/nature-forest.jpg" className="w-16 h-12 object-cover rounded" alt="Nature" />,
      data: { type: 'photo', url: '/src/assets/library/nature-forest.jpg', category: 'nature' }
    },
    {
      id: 'photo-technology',
      type: 'image',
      category: 'photos',
      name: 'Technologie',
      preview: <img src="/src/assets/library/technology-circuit.jpg" className="w-16 h-12 object-cover rounded" alt="Tech" />,
      data: { type: 'photo', url: '/src/assets/library/technology-circuit.jpg', category: 'technology' }
    },
    {
      id: 'photo-people',
      type: 'image',
      category: 'photos',
      name: 'Réunion',
      preview: <img src="/src/assets/library/people-meeting.jpg" className="w-16 h-12 object-cover rounded" alt="People" />,
      data: { type: 'photo', url: '/src/assets/library/people-meeting.jpg', category: 'people' }
    },
    {
      id: 'photo-mountains',
      type: 'image',
      category: 'photos',
      name: 'Montagnes',
      preview: <img src="/src/assets/library/mountains-landscape.jpg" className="w-16 h-12 object-cover rounded" alt="Mountains" />,
      data: { type: 'photo', url: '/src/assets/library/mountains-landscape.jpg', category: 'landscape' }
    },
    {
      id: 'photo-workspace',
      type: 'image',
      category: 'photos',
      name: 'Workspace',
      preview: <img src="/src/assets/library/workspace-laptop.jpg" className="w-16 h-12 object-cover rounded" alt="Workspace" />,
      data: { type: 'photo', url: '/src/assets/library/workspace-laptop.jpg', category: 'workspace' }
    }
  ];

  // Graphiques et diagrammes
  const charts: LibraryElement[] = [
    {
      id: 'bar-chart',
      type: 'chart',
      category: 'charts',
      name: 'Graphique en barres',
      preview: <BarChart3 className="w-8 h-8 text-blue-500" />,
      data: { type: 'chart', chartType: 'bar', color: '#3b82f6' }
    },
    {
      id: 'pie-chart',
      type: 'chart',
      category: 'charts',
      name: 'Graphique en secteurs',
      preview: <PieChart className="w-8 h-8 text-green-500" />,
      data: { type: 'chart', chartType: 'pie', color: '#10b981' }
    },
    {
      id: 'line-chart',
      type: 'chart',
      category: 'charts',
      name: 'Graphique linéaire',
      preview: <Activity className="w-8 h-8 text-purple-500" />,
      data: { type: 'chart', chartType: 'line', color: '#8b5cf6' }
    }
  ];

  // Logos de marques populaires
  const logos: LibraryElement[] = [
    {
      id: 'facebook-logo',
      type: 'icon',
      category: 'logos',
      name: 'Facebook',
      preview: <FaFacebook className="w-8 h-8 text-blue-600" />,
      data: { type: 'logo', brand: 'facebook', color: '#1877f2' }
    },
    {
      id: 'twitter-logo',
      type: 'icon',
      category: 'logos',
      name: 'Twitter',
      preview: <FaTwitter className="w-8 h-8 text-sky-500" />,
      data: { type: 'logo', brand: 'twitter', color: '#1da1f2' }
    },
    {
      id: 'instagram-logo',
      type: 'icon',
      category: 'logos',
      name: 'Instagram',
      preview: <FaInstagram className="w-8 h-8 text-pink-500" />,
      data: { type: 'logo', brand: 'instagram', color: '#e4405f' }
    },
    {
      id: 'linkedin-logo',
      type: 'icon',
      category: 'logos',
      name: 'LinkedIn',
      preview: <FaLinkedin className="w-8 h-8 text-blue-700" />,
      data: { type: 'logo', brand: 'linkedin', color: '#0077b5' }
    },
    {
      id: 'youtube-logo',
      type: 'icon',
      category: 'logos',
      name: 'YouTube',
      preview: <FaYoutube className="w-8 h-8 text-red-600" />,
      data: { type: 'logo', brand: 'youtube', color: '#ff0000' }
    },
    {
      id: 'apple-logo',
      type: 'icon',
      category: 'logos',
      name: 'Apple',
      preview: <FaApple className="w-8 h-8 text-gray-800" />,
      data: { type: 'logo', brand: 'apple', color: '#000000' }
    },
    {
      id: 'google-logo',
      type: 'icon',
      category: 'logos',
      name: 'Google',
      preview: <FaGoogle className="w-8 h-8 text-red-500" />,
      data: { type: 'logo', brand: 'google', color: '#ea4335' }
    }
  ];

  // Arrière-plans avec dégradés
  const backgrounds: LibraryElement[] = [
    {
      id: 'gradient-blue',
      type: 'graphic',
      category: 'backgrounds',
      name: 'Dégradé bleu',
      preview: <div className="w-16 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded"></div>,
      data: { type: 'background', gradient: 'linear-gradient(135deg, #60a5fa, #2563eb)' }
    },
    {
      id: 'gradient-purple',
      type: 'graphic',
      category: 'backgrounds',
      name: 'Dégradé violet',
      preview: <div className="w-16 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded"></div>,
      data: { type: 'background', gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }
    },
    {
      id: 'gradient-green',
      type: 'graphic',
      category: 'backgrounds',
      name: 'Dégradé vert',
      preview: <div className="w-16 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded"></div>,
      data: { type: 'background', gradient: 'linear-gradient(135deg, #4ade80, #059669)' }
    },
    {
      id: 'gradient-orange',
      type: 'graphic',
      category: 'backgrounds',
      name: 'Dégradé orange',
      preview: <div className="w-16 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded"></div>,
      data: { type: 'background', gradient: 'linear-gradient(135deg, #fb923c, #ef4444)' }
    }
  ];

  // Styles de texte prédéfinis
  const textStyles: LibraryElement[] = [
    {
      id: 'heading-xl',
      type: 'text',
      category: 'text',
      name: 'Titre principal',
      preview: <div className="text-2xl font-bold text-gray-800">Titre</div>,
      data: { type: 'text', fontSize: 32, fontWeight: 'bold', fontFamily: 'Arial' }
    },
    {
      id: 'heading-lg',
      type: 'text',
      category: 'text',
      name: 'Sous-titre',
      preview: <div className="text-xl font-semibold text-gray-700">Sous-titre</div>,
      data: { type: 'text', fontSize: 24, fontWeight: 'semibold', fontFamily: 'Arial' }
    },
    {
      id: 'body-text',
      type: 'text',
      category: 'text',
      name: 'Texte normal',
      preview: <div className="text-base text-gray-600">Texte</div>,
      data: { type: 'text', fontSize: 16, fontWeight: 'normal', fontFamily: 'Arial' }
    },
    {
      id: 'caption',
      type: 'text',
      category: 'text',
      name: 'Légende',
      preview: <div className="text-sm text-gray-500">Légende</div>,
      data: { type: 'text', fontSize: 12, fontWeight: 'normal', fontFamily: 'Arial' }
    }
  ];

  const getAllElements = (): LibraryElement[] => {
    switch (selectedCategory) {
      case 'shapes':
        return shapes;
      case 'icons':
        return icons;
      case 'photos':
        return photos;
      case 'charts':
        return charts;
      case 'logos':
        return logos;
      case 'backgrounds':
        return backgrounds;
      case 'text':
        return textStyles;
      default:
        return [];
    }
  };

  const filteredElements = getAllElements().filter(element =>
    element.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addElementToCanvas = (element: LibraryElement) => {
    if (element.type === 'shape' || element.type === 'icon') {
      const newImage = {
        id: Date.now().toString(),
        src: '', // Sera généré côté rendu
        x: 100,
        y: 100,
        width: element.data.size || 100,
        height: element.data.size || 100,
        rotation: 0,
        elementType: element.type,
        elementData: element.data
      };

      onConfigUpdate({
        design: {
          ...config.design,
          customImages: [...(config.design?.customImages || []), newImage]
        }
      });
    } else if (element.type === 'image') {
      const newImage = {
        id: Date.now().toString(),
        src: element.data.url,
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        rotation: 0
      };

      onConfigUpdate({
        design: {
          ...config.design,
          customImages: [...(config.design?.customImages || []), newImage]
        }
      });
    } else if (element.type === 'text') {
      const newText = {
        id: Date.now().toString(),
        content: element.name,
        x: 100,
        y: 100,
        fontSize: element.data.fontSize,
        fontFamily: element.data.fontFamily,
        color: '#000000',
        fontWeight: element.data.fontWeight as 'normal' | 'bold',
        fontStyle: 'normal' as 'normal' | 'italic',
        textDecoration: 'none' as 'none' | 'underline',
        width: 200,
        height: 50
      };

      onConfigUpdate({
        customTexts: [...(config.customTexts || []), newText]
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const newImage = {
          id: Date.now().toString(),
          src: imageUrl,
          x: 100,
          y: 100,
          width: 200,
          height: 150,
          rotation: 0
        };

        onConfigUpdate({
          design: {
            ...config.design,
            customImages: [...(config.design?.customImages || []), newImage]
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4 my-[30px]">
      <h3 className="section-title text-center">Bibliothèque d'éléments</h3>
      
      {/* Search Bar */}
      <div className="mx-[30px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher des éléments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Category Navigation */}
      <div className="mx-[30px] grid grid-cols-2 gap-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === category.id 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <category.icon className="w-4 h-4" />
            {category.label}
          </button>
        ))}
      </div>

      {/* Upload Button */}
      <div className="mx-[30px]">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors"
        >
          <Upload className="w-5 h-5" />
          Télécharger un fichier
        </button>
      </div>

      {/* Elements Grid */}
      <div className="mx-[30px]">
        <h4 className="text-sm font-medium text-gray-700 mb-3 capitalize">
          {categories.find(c => c.id === selectedCategory)?.label}
        </h4>
        
        <div className="grid grid-cols-3 gap-3">
          {filteredElements.map(element => (
            <div
              key={element.id}
              onClick={() => addElementToCanvas(element)}
              className="group p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                  {element.preview}
                </div>
                <span className="text-xs text-gray-600 text-center truncate w-full">
                  {element.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredElements.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Grid3X3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucun élément trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ElementsLibraryTab;