import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { CardItem } from "../../../types/game";

const SAMPLE_CARDS: CardItem[] = [
  { id: "1", title: "Fantastic Charm", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1600&auto=format&fit=crop" },
  { id: "2", title: "Radiant Routine", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1600&auto=format&fit=crop" },
  { id: "3", title: "Calm & Clear", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1600&auto=format&fit=crop" },
  { id: "4", title: "Daily Glow", image: "https://images.unsplash.com/photo-1598515213691-84b2c46a1a1c?q=80&w=1600&auto=format&fit=crop" },
];

// Responsive dimensions based on device
const CARD_DIMENSIONS = {
  desktop: {
    cardWidth: 380,
    imageWidth: 332,
    imageHeight: 416,
    titleSize: 'text-2xl',
    buttonSize: 'h-14 w-14',
    buttonText: 'text-3xl',
    padding: 'p-6',
    gap: 'gap-8'
  },
  tablet: {
    cardWidth: 320,
    imageWidth: 272,
    imageHeight: 340,
    titleSize: 'text-xl',
    buttonSize: 'h-12 w-12',
    buttonText: 'text-2xl',
    padding: 'p-5',
    gap: 'gap-6'
  },
  mobile: {
    cardWidth: 280,
    imageWidth: 232,
    imageHeight: 290,
    titleSize: 'text-lg',
    buttonSize: 'h-11 w-11',
    buttonText: 'text-2xl',
    padding: 'p-4',
    gap: 'gap-5'
  }
};

const likeThreshold = 150;
const passThreshold = -150;

export default function HealthySkinSwiper({ 
  cards = SAMPLE_CARDS, 
  device = 'desktop' 
}: { 
  cards?: CardItem[];
  device?: 'desktop' | 'tablet' | 'mobile';
}) {
  const dimensions = CARD_DIMENSIONS[device];
  const [stack, setStack] = useState<CardItem[]>(cards.slice(0, 4));

  // Update stack when cards change - use JSON.stringify to detect deep changes
  useEffect(() => {
    setStack(cards.slice(0, 4));
  }, [JSON.stringify(cards)]);

  const handleSwipe = () => setStack((s) => s.slice(1));

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-visible">
      <AnimatePresence>
        {stack.map((card, index) => (
          <SwipeContainer key={card.id} card={card} index={index} onSwipe={handleSwipe} dimensions={dimensions} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function SwipeContainer({ 
  card, 
  index, 
  onSwipe,
  dimensions 
}: { 
  card: CardItem; 
  index: number; 
  onSwipe: () => void;
  dimensions: typeof CARD_DIMENSIONS.desktop;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-10, 0, 10]);
  const opacity = useTransform(x, [-300, 0, 300], [0, 1, 0]);

  const randomAngle = index === 0 ? 0 : (Math.random() - 0.5) * 8;
  const randomX = index === 0 ? 0 : (Math.random() - 0.5) * 25;
  const randomY = index * 25 + (Math.random() - 0.5) * 10;

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > likeThreshold || info.offset.x < passThreshold) onSwipe();
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={handleDragEnd}
      style={{ 
        x, 
        rotate, 
        opacity,
        width: `${dimensions.cardWidth}px`,
        height: 'auto'
      }}
      initial={{ opacity: 0, scale: 0.9, y: 40 }}
      animate={{ 
        rotate: randomAngle, 
        y: randomY, 
        x: randomX, 
        opacity: 1, 
        scale: 1 - index * 0.05,
        zIndex: 100 - index 
      }}
      exit={{ opacity: 0, scale: 0.9, x: x.get() > 0 ? 400 : -400, transition: { duration: 0.3 } }}
      transition={{ type: "spring", stiffness: 140, damping: 20 }}
      className="absolute"
    >
      <div 
        className={`bg-white shadow-xl rounded-2xl flex flex-col items-center justify-center ${dimensions.padding}`} 
        style={{ width: `${dimensions.cardWidth}px` }}
      >
        <h1 className={`${dimensions.titleSize} font-extrabold text-neutral-900 mb-4`}>{card.title}</h1>
        <div 
          className="overflow-hidden mb-6 rounded-xl" 
          style={{ width: `${dimensions.imageWidth}px`, height: `${dimensions.imageHeight}px` }}
        >
          <img src={card.image} alt={card.title} className="w-full h-full object-cover select-none" draggable={false} />
        </div>
        <div className={`flex items-center justify-center ${dimensions.gap} w-full`}>
          <button
            onClick={onSwipe}
            className={`${dimensions.buttonSize} rounded-full border-2 ${dimensions.buttonText} flex items-center justify-center border-rose-500 text-rose-500 hover:bg-rose-50 transition`}
            aria-label="Pass"
          >
            ×
          </button>
          <button
            onClick={onSwipe}
            className={`${dimensions.buttonSize} rounded-full border-2 ${dimensions.buttonText} flex items-center justify-center border-emerald-500 text-emerald-500 hover:bg-emerald-50 transition`}
            aria-label="Like"
          >
            ♥
          </button>
        </div>
      </div>
    </motion.div>
  );
}
