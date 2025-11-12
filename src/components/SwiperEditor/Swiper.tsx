import React, { useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Heart, X, ArrowRight } from 'lucide-react';
import { SwiperConfig, SwiperCard } from '@/types/swiper';

interface SwiperProps {
  config: SwiperConfig;
  campaign?: any;
  isPreview?: boolean;
  onComplete?: (result: any) => void;
  onFinish?: (result: any) => void;
}

const Swiper: React.FC<SwiperProps> = ({ 
  config, 
  isPreview = false,
  onComplete,
  onFinish
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedCards, setLikedCards] = useState<string[]>([]);
  const [dislikedCards, setDislikedCards] = useState<string[]>([]);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Vérification de sécurité : si config est undefined ou n'a pas de cards
  if (!config || !config.cards || config.cards.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-500">Configuration Swiper manquante</p>
          <p className="text-sm text-gray-400 mt-2">
            Veuillez configurer le jeu dans le panneau "Assets"
          </p>
        </div>
      </div>
    );
  }

  const handleSwipe = useCallback((swipeDirection: 'left' | 'right' | 'next') => {
    const currentCard = config.cards[currentIndex];
    
    if (swipeDirection === 'right') {
      setLikedCards(prev => [...prev, currentCard.id]);
    } else if (swipeDirection === 'left') {
      setDislikedCards(prev => [...prev, currentCard.id]);
    }

    if (currentIndex < config.cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setDirection(null);
    } else {
      // Fin du jeu
      const result = {
        likedCards,
        dislikedCards,
        completedAt: new Date()
      };
      onComplete?.(result);
      onFinish?.(result);
    }
  }, [currentIndex, config.cards, likedCards, dislikedCards, onComplete, onFinish]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipe = info.offset.x;
    const threshold = 100;

    if (swipe > threshold) {
      setDirection('right');
      setTimeout(() => handleSwipe('right'), 200);
    } else if (swipe < -threshold) {
      setDirection('left');
      setTimeout(() => handleSwipe('left'), 200);
    }
  };

  if (!isPreview) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-500">Aperçu du jeu Swiper</p>
          <p className="text-sm text-gray-400 mt-2">
            Cliquez sur "Aperçu" pour tester le jeu
          </p>
        </div>
      </div>
    );
  }

  if (config.cards.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-500">Aucune carte configurée</p>
          <p className="text-sm text-gray-400 mt-2">
            Ajoutez des cartes dans le panneau de configuration
          </p>
        </div>
      </div>
    );
  }

  if (currentIndex >= config.cards.length) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: config.textColor }}>
            Merci d'avoir participé !
          </h2>
          <p className="text-gray-600">
            Vous avez aimé {likedCards.length} carte(s)
          </p>
        </div>
      </div>
    );
  }

  const currentCard = config.cards[currentIndex];
  const nextCard = currentIndex < config.cards.length - 1 ? config.cards[currentIndex + 1] : null;

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-8"
    >
      {/* Stack de cartes */}
      <div className="relative w-full max-w-md h-[500px] md:h-[600px]">
        {/* Carte suivante (arrière-plan) */}
        {nextCard && config.stackEffect && (
          <motion.div
            className="absolute inset-0 rounded-3xl shadow-2xl"
            style={{
              backgroundColor: config.cardBackgroundColor,
              transform: 'scale(0.95) translateY(10px)',
              zIndex: 1
            }}
          >
            <div className="w-full h-full rounded-3xl overflow-hidden opacity-50">
              {nextCard.imageUrl && (
                <img
                  src={nextCard.imageUrl}
                  alt={nextCard.title}
                  className="w-full h-2/3 object-cover"
                />
              )}
            </div>
          </motion.div>
        )}

        {/* Carte actuelle */}
        <motion.div
          key={currentCard.id}
          style={{ 
            x, 
            rotate,
            zIndex: 2
          }}
          drag={config.enableSwipeGestures ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 rounded-3xl shadow-2xl cursor-grab active:cursor-grabbing"
          animate={direction ? { x: direction === 'right' ? 500 : -500, opacity: 0 } : {}}
          transition={{ duration: 0.3 }}
        >
          <div 
            className="w-full h-full rounded-3xl overflow-hidden"
            style={{ 
              backgroundColor: currentCard.backgroundColor || config.cardBackgroundColor,
              borderRadius: `${config.cardBorderRadius}px`
            }}
          >
            {/* Image */}
            {currentCard.imageUrl && (
              <div className="relative w-full h-2/3">
                <img
                  src={currentCard.imageUrl}
                  alt={currentCard.title}
                  className="w-full h-full object-cover"
                />
                {/* Overlay avec texte sur l'image */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                  {currentCard.productName && (
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {currentCard.productName}
                    </h3>
                  )}
                  {currentCard.description && (
                    <p className="text-white text-sm opacity-90">
                      {currentCard.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Contenu texte */}
            <div className="p-6">
              <h2 
                className="text-2xl font-bold mb-3"
                style={{ color: config.textColor }}
              >
                {currentCard.title}
              </h2>
              {!currentCard.imageUrl && currentCard.description && (
                <p className="text-gray-600">
                  {currentCard.description}
                </p>
              )}
            </div>
          </div>

          {/* Indicateurs de swipe */}
          <motion.div
            style={{ opacity }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            {direction === 'left' && (
              <div className="p-6 bg-red-100 rounded-full">
                <X className="w-12 h-12 text-red-500" />
              </div>
            )}
            {direction === 'right' && (
              <div className="p-6 bg-green-100 rounded-full">
                <Heart className="w-12 h-12 text-green-500" />
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Boutons d'action */}
      <div className="flex items-center justify-center gap-6 mt-8 z-10">
        {config.showDislikeButton && (
          <button
            onClick={() => handleSwipe('left')}
            className="p-4 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
            style={{ opacity: 0.9 }}
          >
            <X className="w-8 h-8 text-red-500" />
          </button>
        )}
        
        {config.showLikeButton && (
          <button
            onClick={() => handleSwipe('right')}
            className="p-5 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
            style={{ opacity: 0.9 }}
          >
            <Heart className="w-10 h-10" style={{ color: config.accentColor }} />
          </button>
        )}

        {config.showNextButton && (
          <button
            onClick={() => handleSwipe('next')}
            className="p-4 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
            style={{ opacity: 0.9 }}
          >
            <ArrowRight className="w-8 h-8" style={{ color: config.textColor }} />
          </button>
        )}
      </div>

      {/* Indicateur de progression */}
      <div className="mt-6 flex gap-2">
        {config.cards.map((_, index) => (
          <div
            key={index}
            className="w-2 h-2 rounded-full transition-all"
            style={{
              backgroundColor: index === currentIndex 
                ? config.accentColor 
                : 'rgba(255,255,255,0.3)'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Swiper;
