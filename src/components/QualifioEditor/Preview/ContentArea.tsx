
import React, { useState } from 'react';
import type { DeviceType, EditorConfig } from '../QualifioEditorLayout';
import DynamicContactForm from '../../forms/DynamicContactForm';
import WheelResult from './WheelResult';
import WheelContainer from './WheelContainer';

interface ContentAreaProps {
  config: EditorConfig;
  isMode1?: boolean;
  device?: DeviceType;
  onHideWheel?: () => void;
  wheelResult?: {
    id: string;
    label: string;
    color: string;
  } | null;
  onWheelResultClose?: () => void;
  onWheelResult?: (result: {
    id: string;
    label: string;
    color: string;
  }) => void;
}

type Mode1State = 'form' | 'wheel' | 'result' | 'initial';

const ContentArea: React.FC<ContentAreaProps> = ({
  config,
  isMode1 = false,
  device = 'desktop',
  onHideWheel,
  wheelResult,
  onWheelResultClose,
  onWheelResult
}) => {
  const [mode1State, setMode1State] = useState<Mode1State>('initial');

  const handleParticipateClick = () => {
    setMode1State('form');
  };

  const handleFormSubmit = (formData: Record<string, string>) => {
    console.log('Form submitted:', formData);
    setMode1State('wheel');
  };

  const handlePlayAgain = () => {
    setMode1State('initial');
    onHideWheel?.();
    onWheelResultClose?.();
  };

  // Pour Mode 1, gestion des différents états
  if (isMode1) {
    if (wheelResult) {
      return (
        <div className="px-6 pb-6 flex items-center justify-center min-h-fit">
          <WheelResult result={wheelResult} onPlayAgain={handlePlayAgain} />
        </div>
      );
    }

    // État roue : affichage de la roue avec assez d'espace
    if (mode1State === 'wheel') {
      return (
        <div className="px-6 pb-8 flex flex-col justify-center items-center min-h-fit">
          <div className="text-center text-gray-600 mb-8">
            <p className="text-lg font-medium">Faites tourner la roue !</p>
            <p className="text-sm mt-2">Cliquez sur le bouton au centre pour jouer</p>
          </div>
          
          <div className="flex flex-col items-center justify-center w-full space-y-6">
            <WheelContainer 
              device={device} 
              config={config} 
              isMode1={true} 
              isVisible={true} 
              onResult={onWheelResult} 
            />
          </div>
        </div>
      );
    }

    // État formulaire : affichage du formulaire avec assez d'espace
    if (mode1State === 'form') {
      const formFields = config.formFields || [{
        id: 'name',
        label: 'Nom complet',
        type: 'text' as const,
        required: true
      }, {
        id: 'email',
        label: 'Adresse email',
        type: 'email' as const,
        required: true
      }];

      return (
        <div className="px-6 pb-6 min-h-fit flex items-center justify-center">
          <div className="w-full max-w-md">
            <h3 className="text-lg font-bold text-center mb-6 text-gray-800">
              Formulaire de participation
            </h3>
            
            <DynamicContactForm 
              fields={formFields} 
              onSubmit={handleFormSubmit} 
              submitLabel="Participer" 
              textStyles={{
                button: {
                  backgroundColor: config.participateButtonColor || 'hsl(0, 84%, 55%)',
                  color: 'white',
                  borderRadius: '0.5rem',
                  fontWeight: 'bold'
                }
              }} 
            />
          </div>
        </div>
      );
    }

    // État initial : affichage du contenu avec bouton participer
    return (
      <div className="px-6 pb-8 min-h-fit">
        <div className="space-y-4 w-full">
          {/* Story text */}
          <div className="text-sm leading-relaxed text-gray-800 text-justify">
            <p>
              {config.storyText || "Valentine et son frère aîné, Antoine, ont 13 ans d'écart. Orphelins de mère, ils viennent de perdre leur père, César Mestre. Le jour des obsèques, une inconnue leur remet une lettre de leur père. La lettre n'explicite pas grand-chose, mais évoque une fracture, des réparations qui n'ont pas eu le temps d'être faites. Antoine s'en détourne vite et retourne à sa vie rangée avec sa femme et ses enfants. Mais Valentine ne reconnaît pas dans ces lignes l'enfance qu'elle a vécue et se donne pour mission de comprendre ce que leur père a voulu leur dire et va enquêter. À son récit s'enchâsse celui de Laure, factrice à Loisel, un petit village normand, et qui vient de faire la connaissance de César. Elle s'est réfugiée là quatre ans plus tôt, après une dépression, et laissant la garde de son fils à son ex-mari, fils avec lequel elle tente peu à peu de renouer un lien fort. Le destin des deux femmes va se croiser."}
            </p>
          </div>

          {/* Publisher link */}
          <div className="text-center pt-2">
            <a href="#" className="font-semibold text-sm" style={{
              color: 'hsl(0, 84%, 55%)'
            }}>
              {config.publisherLink || "editions-flammarion.com"}
            </a>
          </div>

          {/* Prize description */}
          <div className="text-center text-sm font-semibold italic text-gray-800 pt-2">
            {config.prizeText || "Tentez de gagner ce livre !"}
          </div>

          {/* Participate button */}
          <div className="text-center pt-6 pb-4">
            <button 
              onClick={handleParticipateClick} 
              className="px-8 py-3 text-white font-bold text-lg rounded uppercase tracking-wide shadow-lg hover:shadow-xl transition-all duration-300" 
              style={{
                backgroundColor: config.participateButtonColor || 'hsl(0, 84%, 55%)'
              }}
            >
              {config.participateButtonText || "PARTICIPER !"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Affichage normal pour Mode 2
  return <div className="flex-1 p-6 bg-white min-h-0">
      <div className="space-y-4 w-full">
        {/* Story text */}
        <div className="text-sm leading-relaxed text-gray-800 text-justify">
          <p>
            {config.storyText || "Valentine et son frère aîné, Antoine, ont 13 ans d'écart. Orphelins de mère, ils viennent de perdre leur père, César Mestre. Le jour des obsèques, une inconnue leur remet une lettre de leur père. La lettre n'explicite pas grand-chose, mais évoque une fracture, des réparations qui n'ont pas eu le temps d'être faites. Antoine s'en détourne vite et retourne à sa vie rangée avec sa femme et ses enfants. Mais Valentine ne reconnaît pas dans ces lignes l'enfance qu'elle a vécue et se donne pour mission de comprendre ce que leur père a voulu leur dire et va enquêter. À son récit s'enchâsse celui de Laure, factrice à Loisel, un petit village normand, et qui vient de faire la connaissance de César. Elle s'est réfugiée là quatre ans plus tôt, après une dépression, et laissant la garde de son fils à son ex-mari, fils avec lequel elle tente peu à peu de renouer un lien fort. Le destin des deux femmes va se croiser."}
          </p>
        </div>

        {/* Publisher link */}
        <div className="text-center pt-2">
          <a href="#" className="font-semibold text-sm" style={{
          color: 'hsl(0, 84%, 55%)'
        }}>
            {config.publisherLink || "editions-flammarion.com"}
          </a>
        </div>

        {/* Prize description */}
        <div className="text-center text-sm font-semibold italic text-gray-800 pt-2">
          {config.prizeText || "Tentez de gagner ce livre !"}
        </div>

        {/* Participate button */}
        <div className="text-center pt-4">
          <button onClick={() => {}} className="px-8 py-3 text-white font-bold text-lg rounded uppercase tracking-wide shadow-lg hover:shadow-xl transition-all duration-300" style={{
          backgroundColor: config.participateButtonColor || 'hsl(0, 84%, 55%)'
        }}>
            {config.participateButtonText || "PARTICIPER !"}
          </button>
        </div>
      </div>
    </div>;
};

export default ContentArea;
