import React, { useState } from 'react';
import { 
  Type, 
  Image, 
  Shapes, 
  Star,
  Circle,
  Square,
  Triangle,
  Heart,
  Upload,
  Search,
  Grid3X3
} from 'lucide-react';
import TextPanel from './TextPanel';

interface AssetsPanelProps {
  onAddElement: (element: any) => void;
}

const AssetsPanel: React.FC<AssetsPanelProps> = ({ onAddElement }) => {
  const [activeCategory, setActiveCategory] = useState('text');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);

  const categories = [
    { id: 'text', label: 'Texte', icon: Type },
    { id: 'images', label: 'Images', icon: Image },
    { id: 'shapes', label: 'Formes', icon: Shapes },
    { id: 'icons', label: 'Icônes', icon: Star },
    { id: 'uploads', label: 'Uploads', icon: Upload }
  ];


  const shapes = [
    { type: 'rectangle', label: 'Rectangle', icon: Square, color: '#3B82F6' },
    { type: 'circle', label: 'Cercle', icon: Circle, color: '#EF4444' },
    { type: 'triangle', label: 'Triangle', icon: Triangle, color: '#10B981' },
    { type: 'heart', label: 'Cœur', icon: Heart, color: '#F59E0B' }
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
        return <TextPanel onAddElement={onAddElement} />;

      case 'shapes':
        return (
          <div className="grid grid-cols-2 gap-3">
            {shapes.map((shape) => {
              const Icon = shape.icon;
              return (
                <button
                  key={shape.type}
                  onClick={() => handleAddShape(shape)}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] transition-colors"
                >
                  <Icon 
                    className="w-8 h-8 mb-2" 
                    style={{ color: shape.color }}
                  />
                  <span className="text-xs font-medium text-gray-700">{shape.label}</span>
                </button>
              );
            })}
          </div>
        );

      case 'images':
        return (
          <div className="space-y-4">
            {/* Images stock */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Images suggérées</h4>
              <div className="grid grid-cols-2 gap-2">
                {stockImages.map((image) => (
                  <button
                    key={image.id}
                    onClick={() => handleAddImage(image)}
                    className="relative group rounded-lg overflow-hidden border border-gray-200 hover:border-[hsl(var(--primary))] transition-colors"
                  >
                    <img
                      src={image.url}
                      alt={`Stock ${image.category}`}
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
            </div>

            {/* Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[hsl(var(--primary))] transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Glissez une image ou</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="text-[hsl(var(--primary))] text-sm font-medium hover:text-[hsl(var(--primary))] cursor-pointer">
                Parcourir les fichiers
              </label>
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