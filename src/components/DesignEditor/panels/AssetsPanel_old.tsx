import React, { useState } from 'react';
import TextPanel from './TextPanel';

interface AssetsPanelProps {
  onAddElement: (element: any) => void;
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
}

const AssetsPanel: React.FC<AssetsPanelProps> = ({ onAddElement, selectedElement, onElementUpdate }) => {
  const [activeCategory, setActiveCategory] = useState('text');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);

  // Catégories avec emojis modernes (pas d'icônes IA/non-premium)
  const categories = [
    { id: 'text', label: 'Texte', emoji: '📝', description: 'Ajoutez du texte stylé' },
    { id: 'shapes', label: 'Formes', emoji: '🔷', description: 'Formes géométriques' },
    { id: 'elements', label: 'Éléments', emoji: '✨', description: 'Éléments décoratifs' },
    { id: 'images', label: 'Images', emoji: '🖼️', description: 'Photos et illustrations' },
    { id: 'uploads', label: 'Mes fichiers', emoji: '📁', description: 'Vos uploads' }
  ];

  // Formes avec design moderne
  const shapes = [
    { 
      type: 'rectangle', 
      label: 'Rectangle', 
      preview: '▭', 
      gradient: 'from-blue-500 to-blue-600',
      color: '#3B82F6',
      description: 'Rectangle classique'
    },
    { 
      type: 'circle', 
      label: 'Cercle', 
      preview: '●', 
      gradient: 'from-red-500 to-red-600',
      color: '#EF4444',
      description: 'Cercle parfait'
    },
    { 
      type: 'triangle', 
      label: 'Triangle', 
      preview: '▲', 
      gradient: 'from-green-500 to-green-600',
      color: '#10B981',
      description: 'Triangle équilatéral'
    },
    { 
      type: 'star', 
      label: 'Étoile', 
      preview: '★', 
      gradient: 'from-yellow-500 to-yellow-600',
      color: '#F59E0B',
      description: 'Étoile à 5 branches'
    },
    { 
      type: 'heart', 
      label: 'Cœur', 
      preview: '♥', 
      gradient: 'from-pink-500 to-pink-600',
      color: '#EC4899',
      description: 'Forme de cœur'
    },
    { 
      type: 'diamond', 
      label: 'Losange', 
      preview: '◆', 
      gradient: 'from-purple-500 to-purple-600',
      color: '#8B5CF6',
      description: 'Losange élégant'
    }
  ];

  // Éléments décoratifs modernes
  const decorativeElements = [
    { 
      type: 'arrow', 
      label: 'Flèche', 
      preview: '→', 
      gradient: 'from-indigo-500 to-indigo-600',
      description: 'Flèche directionnelle'
    },
    { 
      type: 'line', 
      label: 'Ligne', 
      preview: '—', 
      gradient: 'from-gray-500 to-gray-600',
      description: 'Ligne de séparation'
    },
    { 
      type: 'badge', 
      label: 'Badge', 
      preview: '🏷️', 
      gradient: 'from-orange-500 to-orange-600',
      description: 'Badge décoratif'
    },
    { 
      type: 'frame', 
      label: 'Cadre', 
      preview: '⬜', 
      gradient: 'from-teal-500 to-teal-600',
      description: 'Cadre élégant'
    }
  ];

  const stockImages = [
    { id: 1, url: '/api/placeholder/150/100', category: 'celebration' },
    { id: 2, url: '/api/placeholder/150/100', category: 'gaming' },
    { id: 3, url: '/api/placeholder/150/100', category: 'prizes' },
    { id: 4, url: '/api/placeholder/150/100', category: 'celebration' }
  ];


  const handleAddShape = (shape: any) => {
    const element = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      shapeType: shape.type,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      backgroundColor: shape.color,
      borderRadius: shape.type === 'circle' ? '50%' : '0'
    };
    onAddElement(element);
  };

  const handleAddDecorativeElement = (element: any) => {
    const newElement = {
      id: `element-${Date.now()}`,
      type: 'decorative',
      elementType: element.type,
      x: 150,
      y: 150,
      width: element.type === 'line' ? 200 : 80,
      height: element.type === 'line' ? 4 : 80,
      backgroundColor: element.gradient.includes('gray') ? '#6B7280' : '#8B5CF6',
      content: element.preview
    };
    onAddElement(newElement);
  };

  const handleAddImage = (image: any) => {
    const element = {
      id: `image-${Date.now()}`,
      type: 'image',
      src: image.url,
      x: 100,
      y: 100,
      width: 150,
      height: 100
    };
    onAddElement(element);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        const newImage = {
          id: Date.now(),
          url: imageUrl,
          name: file.name
        };
        setUploadedImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderContent = () => {
    switch (activeCategory) {
      case 'text':
        return <TextPanel onAddElement={onAddElement} selectedElement={selectedElement} onElementUpdate={onElementUpdate} />;

      case 'shapes':
        return (
          <div className="space-y-6">
            <div className="text-center py-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Formes géométriques</h3>
              <p className="text-sm text-gray-500">Créez des designs avec des formes modernes</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {shapes.map((shape) => (
                <div
                  key={shape.type}
                  onClick={() => handleAddShape(shape)}
                  className="group relative bg-white rounded-xl border-2 border-gray-100 hover:border-purple-200 transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-lg bg-gradient-to-br ${shape.gradient} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                      {shape.preview}
                    </div>
                    <h4 className="font-semibold text-gray-900 text-center mb-1">{shape.label}</h4>
                    <p className="text-xs text-gray-500 text-center">{shape.description}</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-600/0 group-hover:from-purple-500/5 group-hover:to-purple-600/10 rounded-xl transition-all duration-300"></div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'elements':
        return (
          <div className="space-y-6">
            <div className="text-center py-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Éléments décoratifs</h3>
              <p className="text-sm text-gray-500">Ajoutez des éléments visuels pour enrichir vos designs</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {decorativeElements.map((element) => (
                <div
                  key={element.type}
                  onClick={() => handleAddDecorativeElement(element)}
                  className="group relative bg-white rounded-xl border-2 border-gray-100 hover:border-purple-200 transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-lg bg-gradient-to-br ${element.gradient} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                      {element.preview}
                    </div>
                    <h4 className="font-semibold text-gray-900 text-center mb-1">{element.label}</h4>
                    <p className="text-xs text-gray-500 text-center">{element.description}</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-600/0 group-hover:from-purple-500/5 group-hover:to-purple-600/10 rounded-xl transition-all duration-300"></div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'images':
        return (
          <div className="space-y-6">
            <div className="text-center py-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Images & Photos</h3>
              <p className="text-sm text-gray-500">Ajoutez des images professionnelles à vos designs</p>
            </div>
            
            {/* Images stock */}
            <div>
              <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Images suggérées
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {stockImages.map((image) => (
                  <div
                    key={image.id}
                    onClick={() => handleAddImage(image)}
                    className="group relative rounded-xl overflow-hidden border-2 border-gray-100 hover:border-purple-200 transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1"
                  >
                    <img
                      src={image.url}
                      alt="Stock image"
                      className="w-full h-24 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-3">
                      <span className="text-white text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        ➕ Ajouter
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Zone d'upload moderne */}
            <div className="relative group">
              <div className="border-2 border-dashed border-gray-300 group-hover:border-purple-400 rounded-xl p-8 text-center transition-all duration-300 bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-purple-50 group-hover:to-purple-100">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl shadow-lg">
                  📁
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Ajoutez vos images</h4>
                <p className="text-sm text-gray-600 mb-4">Glissez-déposez ou cliquez pour sélectionner</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg cursor-pointer transition-colors">
                  <span>📄</span>
                  Parcourir les fichiers
                </label>
              </div>
            </div>
          </div>
        );

      case 'uploads':
        return (
          <div className="space-y-4">
            {uploadedImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {uploadedImages.map((image) => (
                  <button
                    key={image.id}
                    onClick={() => handleAddImage(image)}
                    className="relative group rounded-lg overflow-hidden border border-gray-200 hover:border-[hsl(var(--primary))] transition-colors"
                  >
                    <img
                      src={image.url}
                      alt="Uploaded image"
                      className="w-full h-20 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs opacity-0 group-hover:opacity-100">
                        Ajouter
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Vos uploads apparaîtront ici</p>
              </div>
            )}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[hsl(var(--primary))] transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Glissez une image ou</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload-uploads"
              />
              <label htmlFor="file-upload-uploads" className="text-[hsl(var(--primary))] text-sm font-medium hover:text-[hsl(var(--primary))] cursor-pointer">
                Uploader un fichier
              </label>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <Grid3X3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Contenu à venir...</p>
          </div>
        );
    }
  };

  return (
    <div className="p-4">
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher des éléments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-1 mb-4">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                activeCategory === category.id
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary))] border border-[hsl(var(--primary))]'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default AssetsPanel;