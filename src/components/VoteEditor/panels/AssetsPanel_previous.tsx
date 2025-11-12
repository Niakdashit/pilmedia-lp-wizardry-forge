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

  // Catégories avec design premium moderne
  const categories = [
    { id: 'text', label: 'Texte', emoji: '📝', description: 'Ajoutez du texte stylé' },
    { id: 'shapes', label: 'Formes', emoji: '🔷', description: 'Formes géométriques' },
    { id: 'elements', label: 'Éléments', emoji: '✨', description: 'Éléments décoratifs' },
    { id: 'images', label: 'Images', emoji: '🖼️', description: 'Photos et illustrations' },
    { id: 'uploads', label: 'Mes fichiers', emoji: '📁', description: 'Vos uploads' }
  ];

  // Formes avec design moderne et gradients
  const shapes = [
    { 
      type: 'rectangle', 
      label: 'Rectangle', 
      preview: '▭', 
      gradient: 'from-blue-500 to-blue-600',
      description: 'Rectangle classique',
      color: '#3B82F6'
    },
    { 
      type: 'circle', 
      label: 'Cercle', 
      preview: '●', 
      gradient: 'from-green-500 to-green-600',
      description: 'Cercle parfait',
      color: '#10B981'
    },
    { 
      type: 'triangle', 
      label: 'Triangle', 
      preview: '▲', 
      gradient: 'from-purple-500 to-purple-600',
      description: 'Triangle équilatéral',
      color: '#8B5CF6'
    },
    { 
      type: 'star', 
      label: 'Étoile', 
      preview: '★', 
      gradient: 'from-yellow-500 to-orange-500',
      description: 'Étoile à 5 branches',
      color: '#F59E0B'
    },
    { 
      type: 'diamond', 
      label: 'Losange', 
      preview: '◆', 
      gradient: 'from-pink-500 to-rose-600',
      description: 'Losange géométrique',
      color: '#EC4899'
    },
    { 
      type: 'hexagon', 
      label: 'Hexagone', 
      preview: '⬡', 
      gradient: 'from-indigo-500 to-indigo-600',
      description: 'Hexagone régulier',
      color: '#6366F1'
    }
  ];

  // Éléments décoratifs premium
  const decorativeElements = [
    {
      type: 'line',
      label: 'Ligne',
      preview: '━',
      gradient: 'from-gray-600 to-gray-700',
      description: 'Ligne décorative'
    },
    {
      type: 'arrow',
      label: 'Flèche',
      preview: '→',
      gradient: 'from-blue-500 to-blue-600',
      description: 'Flèche directionnelle'
    },
    {
      type: 'heart',
      label: 'Cœur',
      preview: '♥',
      gradient: 'from-red-500 to-pink-500',
      description: 'Cœur décoratif'
    },
    {
      type: 'crown',
      label: 'Couronne',
      preview: '♔',
      gradient: 'from-yellow-500 to-yellow-600',
      description: 'Couronne royale'
    },
    {
      type: 'lightning',
      label: 'Éclair',
      preview: '⚡',
      gradient: 'from-yellow-400 to-orange-500',
      description: 'Éclair énergique'
    },
    {
      type: 'flower',
      label: 'Fleur',
      preview: '❀',
      gradient: 'from-pink-400 to-purple-500',
      description: 'Fleur décorative'
    }
  ];

  // Images stock avec catégories
  const stockImages = [
    { id: 1, url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400', category: 'business' },
    { id: 2, url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400', category: 'people' },
    { id: 3, url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400', category: 'tech' },
    { id: 4, url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', category: 'people' },
    { id: 5, url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400', category: 'business' },
    { id: 6, url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400', category: 'tech' }
  ];

  // Gestionnaires d'événements
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
      x: 50,
      y: 50,
      width: 200,
      height: 150,
      src: image.url
    };
    onAddElement(element);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now(),
          url: e.target?.result as string,
          name: file.name
        };
        setUploadedImages(prev => [...prev, newImage]);
        handleAddImage(newImage);
      };
      reader.readAsDataURL(file);
    }
  };

  // Interface de rendu du contenu
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
          <div className="space-y-6">
            <div className="text-center py-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mes fichiers</h3>
              <p className="text-sm text-gray-500">Gérez vos images uploadées</p>
            </div>
            
            {uploadedImages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500 text-3xl">
                  📂
                </div>
                <h4 className="font-medium text-gray-700 mb-2">Aucun fichier uploadé</h4>
                <p className="text-sm text-gray-500 mb-4">Commencez par ajouter des images depuis l'onglet Images</p>
                <button
                  onClick={() => setActiveCategory('images')}
                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <span>🖼️</span>
                  Aller aux images
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {uploadedImages.map((image) => (
                  <div
                    key={image.id}
                    onClick={() => handleAddImage(image)}
                    className="group relative rounded-xl overflow-hidden border-2 border-gray-100 hover:border-purple-200 transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1"
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-3">
                      <span className="text-white text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        ➕ Ajouter
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* En-tête moderne avec barre de recherche */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            ✨
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Éléments</h2>
            <p className="text-sm text-gray-500">Ajoutez des éléments à votre design</p>
          </div>
        </div>
        
        {/* Barre de recherche moderne */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 text-sm">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Rechercher des éléments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Navigation par onglets moderne */}
      <div className="bg-white border-b border-gray-200 px-2">
        <div className="flex space-x-1 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeCategory === category.id
                  ? 'bg-purple-100 text-purple-700 border-b-2 border-purple-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">{category.emoji}</span>
              <span className="hidden sm:inline">{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default AssetsPanel;
