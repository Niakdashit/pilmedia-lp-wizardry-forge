import React, { useState } from 'react';
import { Upload, Plus, Trash2, GripVertical } from 'lucide-react';
import { CardItem } from '../../../types/game';

interface SwiperConfigPanelProps {
  onBack: () => void;
  cards: CardItem[];
  onCardsChange: (cards: CardItem[]) => void;
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
}

const SwiperConfigPanel: React.FC<SwiperConfigPanelProps> = ({
  onBack,
  cards,
  onCardsChange,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  console.log('🎨 [SwiperConfigPanel] Mounted/Rendered with cards:', cards);

  const handleAddCard = () => {
    const newCard: CardItem = {
      id: `card-${Date.now()}`,
      title: 'Nouvelle carte',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1600&auto=format&fit=crop'
    };
    onCardsChange([...cards, newCard]);
  };

  const handleDeleteCard = (index: number) => {
    const newCards = cards.filter((_, i) => i !== index);
    onCardsChange(newCards);
  };

  const handleUpdateCard = (index: number, field: keyof CardItem, value: string) => {
    console.log(`🔧 [SwiperConfigPanel] Updating card ${index}, field: ${field}, value:`, value);
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    console.log('🔧 [SwiperConfigPanel] New cards:', newCards);
    onCardsChange(newCards);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newCards = [...cards];
    const draggedCard = newCards[draggedIndex];
    newCards.splice(draggedIndex, 1);
    newCards.splice(index, 0, draggedCard);
    
    setDraggedIndex(index);
    onCardsChange(newCards);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdateCard(index, 'image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="inline-flex items-center px-3 py-2 text-sm rounded-md bg-white border hover:bg-gray-50 text-gray-700"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Retour
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Configuration du Swiper</h2>
          <span className="text-sm text-gray-500">{cards.length} carte{cards.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {cards.map((card, index) => (
          <div
            key={card.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`bg-white border rounded-lg p-4 space-y-3 transition-all ${
              draggedIndex === index ? 'opacity-50 scale-95' : 'hover:shadow-md'
            }`}
          >
            {/* Card Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                <span className="text-sm font-medium text-gray-700">Carte {index + 1}</span>
              </div>
              <button
                onClick={() => handleDeleteCard(index)}
                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                title="Supprimer la carte"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Card Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre
              </label>
              <input
                type="text"
                value={card.title}
                onChange={(e) => handleUpdateCard(index, 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Titre de la carte"
              />
            </div>

            {/* Card Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image
              </label>
              
              {/* Image Preview */}
              {card.image && (
                <div className="mb-2 relative group">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-md flex items-center justify-center">
                    <label className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Changer
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(index, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Image URL Input */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={card.image}
                  onChange={(e) => handleUpdateCard(index, 'image', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="URL de l'image"
                />
                
                {/* Upload Button */}
                <label className="flex items-center justify-center w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <Upload className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">Télécharger une image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(index, e)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        ))}

        {/* Add Card Button */}
        <button
          onClick={handleAddCard}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2 text-gray-600 hover:text-blue-600"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Ajouter une carte</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600 space-y-1">
          <p>💡 <strong>Astuce :</strong> Glissez-déposez les cartes pour les réorganiser</p>
          <p>📸 Images recommandées : 800x1000px (ratio 4:5)</p>
        </div>
      </div>
    </div>
  );
};

export default SwiperConfigPanel;
