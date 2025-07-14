
import React, { useState } from 'react';
import type { EditorConfig } from '../QualifioEditorLayout';
import ContactForm from './ContactForm';
import WheelResult from './WheelResult';

interface ContentAreaProps {
  config: EditorConfig;
  isMode1?: boolean;
  onShowWheel?: () => void;
  onHideWheel?: () => void;
  wheelResult?: {
    id: string;
    label: string;
    color: string;
  } | null;
  onWheelResultClose?: () => void;
}

type Mode1State = 'form' | 'wheel' | 'result';

const ContentArea: React.FC<ContentAreaProps> = ({ 
  config, 
  isMode1 = false,
  onShowWheel,
  onHideWheel,
  wheelResult,
  onWheelResultClose
}) => {
  const [mode1State, setMode1State] = useState<Mode1State>('form');

  const handleFormSubmit = (formData: { name: string; email: string }) => {
    console.log('Form submitted:', formData);
    setMode1State('wheel');
    onShowWheel?.();
  };

  const handlePlayAgain = () => {
    setMode1State('form');
    onHideWheel?.();
    onWheelResultClose?.();
  };

  // Pour Mode 1, gestion des différents états
  if (isMode1) {
    if (wheelResult) {
      return (
        <div className="flex-1 flex items-center justify-center p-4">
          <WheelResult 
            result={wheelResult}
            onPlayAgain={handlePlayAgain}
          />
        </div>
      );
    }

    if (mode1State === 'form') {
      return (
        <div className="flex-1 p-4">
          {/* Story text */}
          <div className="text-sm leading-relaxed text-gray-800 mb-4">
            <p>
              {config.storyText || "Valentine et son frère aîné, Antoine, ont 13 ans d'écart. Orphelins de mère, ils viennent de perdre leur père, César Mestre. Le jour des obsèques, une inconnue leur remet une lettre de leur père. La lettre n'explicite pas grand-chose, mais évoque une fracture, des réparations qui n'ont pas eu le temps d'être faites. Antoine s'en détourne vite et retourne à sa vie rangée avec sa femme et ses enfants. Mais Valentine ne reconnaît pas dans ces lignes l'enfance qu'elle a vécue et se donne pour mission de comprendre ce que leur père a voulu leur dire et va enquêter. À son récit s'enchâsse celui de Laure, factrice à Loisel, un petit village normand, et qui vient de faire la connaissance de César. Elle s'est réfugiée là quatre ans plus tôt, après une dépression, et laissant la garde de son fils à son ex-mari, fils avec lequel elle tente peu à peu de renouer un lien fort. Le destin des deux femmes va se croiser."}
            </p>
          </div>

          {/* Publisher link */}
          <div className="text-center mb-4">
            <a 
              href="#" 
              className="font-semibold text-sm"
              style={{ color: 'hsl(0, 84%, 55%)' }}
            >
              {config.publisherLink || "editions-flammarion.com"}
            </a>
          </div>

          {/* Prize description */}
          <div className="text-center text-sm font-semibold italic text-gray-800 mb-6">
            {config.prizeText || "Tentez de gagner ce livre !"}
          </div>

          {/* Contact Form */}
          <div className="max-w-md mx-auto">
            <ContactForm 
              onSubmit={handleFormSubmit}
            />
          </div>
        </div>
      );
    }

    if (mode1State === 'wheel') {
      return (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-gray-600">
            <p className="text-lg font-medium">Faites tourner la roue !</p>
            <p className="text-sm mt-2">Cliquez sur le bouton au centre pour jouer</p>
          </div>
        </div>
      );
    }
  }

  // Mode 2 - affichage normal
  return (
    <div className="flex-1 p-6">
      <div className="space-y-4">
        {/* Story text */}
        <div className="text-sm leading-relaxed text-gray-800">
          <p>
            {config.storyText || "Valentine et son frère aîné, Antoine, ont 13 ans d'écart. Orphelins de mère, ils viennent de perdre leur père, César Mestre. Le jour des obsèques, une inconnue leur remet une lettre de leur père. La lettre n'explicite pas grand-chose, mais évoque une fracture, des réparations qui n'ont pas eu le temps d'être faites. Antoine s'en détourne vite et retourne à sa vie rangée avec sa femme et ses enfants. Mais Valentine ne reconnaît pas dans ces lignes l'enfance qu'elle a vécue et se donne pour mission de comprendre ce que leur père a voulu leur dire et va enquêter. À son récit s'enchâsse celui de Laure, factrice à Loisel, un petit village normand, et qui vient de faire la connaissance de César. Elle s'est réfugiée là quatre ans plus tôt, après une dépression, et laissant la garde de son fils à son ex-mari, fils avec lequel elle tente peu à peu de renouer un lien fort. Le destin des deux femmes va se croiser."}
          </p>
        </div>

        {/* Publisher link */}
        <div className="text-center pt-2">
          <a 
            href="#" 
            className="font-semibold text-sm"
            style={{ color: 'hsl(0, 84%, 55%)' }}
          >
            {config.publisherLink || "editions-flammarion.com"}
          </a>
        </div>

        {/* Prize description */}
        <div className="text-center text-sm font-semibold italic text-gray-800 pt-2">
          {config.prizeText || "Tentez de gagner ce livre !"}
        </div>

        {/* Participate button */}
        <div className="text-center pt-4">
          <button 
            className="px-8 py-3 text-white font-bold text-lg rounded uppercase tracking-wide shadow-lg hover:shadow-xl transition-all duration-300"
            style={{ backgroundColor: config.participateButtonColor || 'hsl(0, 84%, 55%)' }}
          >
            {config.participateButtonText || "PARTICIPER !"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentArea;
