import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Plus, Trash2, Image as ImageIcon, Type, Heart, X } from 'lucide-react';

interface SwiperProps {
  config: any;
  onConfigChange: (config: any) => void;
  isPreview?: boolean;
}

const Swiper: React.FC<SwiperProps> = ({ config, onConfigChange, isPreview }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);

  const handleDragEnd = (_event: any, info: any) => {
    const swipe = info.offset.x;
    const threshold = 100;

    if (Math.abs(swipe) > threshold) {
      handleSwipe(swipe > 0 ? 'right' : 'left');
    }
  };

  const handleSwipe = (_direction: 'left' | 'right') => {
    if (currentIndex < (config.cards?.length || 0) - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

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

  if (isPreview && config.cards?.length > 0) {
    const card = config.cards[currentIndex];

    return (
      <div className="relative w-full max-w-md mx-auto h-[500px] flex items-center justify-center">
        <motion.div
          style={{ x, rotate }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          className="absolute w-full aspect-[3/4] bg-white rounded-xl shadow-xl cursor-grab active:cursor-grabbing"
        >
          <img
            src={card.image}
            alt={card.title}
            className="w-full h-2/3 object-cover rounded-t-xl"
          />
          <div className="p-4">
            <h3 className="text-xl font-bold mb-2">{card.title}</h3>
            <p className="text-gray-600">{card.description}</p>
          </div>

          <motion.div
            style={{ opacity }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="flex gap-x-20">
              <div className="p-4 bg-red-100 rounded-full">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <div className="p-4 bg-green-100 rounded-full">
                <Heart className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4dbe8]"
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4dbe8]"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4dbe8]"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4dbe8]"
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
            className="text-sm text-[#d4dbe8] hover:text-[#6d164f] font-medium flex items-center"
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4dbe8]"
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4dbe8]"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4dbe8]"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4dbe8]"
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
