import React from 'react';
import { Plus, Trash2, Image as ImageIcon, Type, Heart, X } from 'lucide-react';

interface SwiperProps {
  config: any;
  onConfigChange: (config: any) => void;
}

const Swiper: React.FC<SwiperProps> = ({ config, onConfigChange }) => {
  const updateConfig = (field: string, value: any) => {
    onConfigChange({
      ...config,
      [field]: value
    });
  };

  const addCard = () => {
    const newCards = [...(config?.cards || [])];
    newCards.push({
      id: Date.now(),
      image: '',
      title: '',
      description: '',
      category: ''
    });
    updateConfig('cards', newCards);
  };

  const removeCard = (index: number) => {
    const newCards = [...(config?.cards || [])];
    newCards.splice(index, 1);
    updateConfig('cards', newCards);
  };

  const updateCard = (index: number, field: string, value: string) => {
    const newCards = [...(config?.cards || [])];
    newCards[index] = {
      ...newCards[index],
      [field]: value
    };
    updateConfig('cards', newCards);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Icône swipe droite
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Heart className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={config?.rightSwipeIcon || '❤️'}
              onChange={(e) => updateConfig('rightSwipeIcon', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
              placeholder="Emoji ou texte"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Icône swipe gauche
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <X className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={config?.leftSwipeIcon || '❌'}
              onChange={(e) => updateConfig('leftSwipeIcon', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
              placeholder="Emoji ou texte"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message swipe droite
          </label>
          <input
            type="text"
            value={config?.rightSwipeText || 'J\'aime !'}
            onChange={(e) => updateConfig('rightSwipeText', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
            placeholder="Message pour le swipe droite"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message swipe gauche
          </label>
          <input
            type="text"
            value={config?.leftSwipeText || 'Suivant'}
            onChange={(e) => updateConfig('leftSwipeText', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
            placeholder="Message pour le swipe gauche"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Cartes ({(config?.cards || []).length})
          </label>
          <button
            onClick={addCard}
            className="text-sm text-[#841b60] hover:text-[#6d164f] font-medium flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            Ajouter une carte
          </button>
        </div>

        <div className="space-y-6">
          {(config?.cards || []).map((card: any, index: number) => (
            <div key={card.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-gray-700">Carte {index + 1}</h3>
                <button
                  onClick={() => removeCard(index)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={card.image}
                      onChange={(e) => updateCard(index, 'image', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
                      placeholder="URL de l'image"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Type className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => updateCard(index, 'title', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
                      placeholder="Titre de la carte"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={card.description}
                    onChange={(e) => updateCard(index, 'description', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
                    placeholder="Description de la carte"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <input
                    type="text"
                    value={card.category}
                    onChange={(e) => updateCard(index, 'category', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
                    placeholder="Catégorie de la carte"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Swiper;