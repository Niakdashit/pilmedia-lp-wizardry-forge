import React from 'react';
import type { EditorConfig } from '../QualifioEditorLayout';

interface ContentAreaProps {
  config: EditorConfig;
}

const ContentArea: React.FC<ContentAreaProps> = ({ config }) => {
  return (
    <div className="flex-1 p-6 overflow-auto">
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