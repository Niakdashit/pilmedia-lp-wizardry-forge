import React from 'react';
import { Facebook, X } from 'lucide-react';
import summerBeachImage from '../../assets/summer-beach.jpg';

const SummerReadingContest: React.FC = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(200, 20%, 15%)' }}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className="max-w-md w-full rounded-lg shadow-2xl overflow-hidden"
          style={{ backgroundColor: 'hsl(0, 0%, 100%)' }}
        >
          {/* Header avec image de fond */}
          <div 
            className="relative h-80 bg-cover bg-center"
            style={{ backgroundImage: `url(${summerBeachImage})` }}
          >
            {/* Social buttons top left */}
            <div className="absolute top-4 left-4 flex gap-2">
              <button className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <Facebook className="w-4 h-4 text-white" />
              </button>
              <button className="w-8 h-8 bg-black rounded flex items-center justify-center">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            
            {/* Rules button top right */}
            <div className="absolute top-4 right-4">
              <button 
                className="px-4 py-2 text-white text-sm font-medium rounded"
                style={{ backgroundColor: 'hsl(0, 84%, 55%)' }}
              >
                Règlement
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Story text */}
            <div className="text-sm leading-relaxed text-gray-800">
              <p>
                Valentine et son frère aîné, Antoine, ont 13 ans d'écart. Orphelins de mère, ils viennent 
                de perdre leur père, César Mestre. Le jour des obsèques, une inconnue leur remet une 
                lettre de leur père. La lettre n'explicite pas grand-chose, mais évoque une fracture, 
                des réparations qui n'ont pas eu le temps d'être faites. Antoine s'en détourne vite et 
                retourne à sa vie rangée avec sa femme et ses enfants. Mais Valentine ne reconnaît 
                pas dans ces lignes l'enfance qu'elle a vécue et se donne pour mission de 
                comprendre ce que leur père a voulu leur dire et va enquêter. À son récit s'enchâsse 
                celui de Laure, factrice à Loisel, un petit village normand, et qui vient de faire la 
                connaissance de César. Elle s'est réfugiée là quatre ans plus tôt, après une 
                dépression, et laissant la garde de son fils à son ex-mari, fils avec lequel elle tente peu à 
                peu de renouer un lien fort. Le destin des deux femmes va se croiser.
              </p>
            </div>

            {/* Publisher link */}
            <div className="text-center">
              <a 
                href="#" 
                className="font-semibold"
                style={{ color: 'hsl(0, 84%, 55%)' }}
              >
                editions.flammarion.com
              </a>
            </div>

            {/* Prize description */}
            <div className="text-center text-sm font-semibold italic text-gray-800">
              Jouez et tentez de remporter l'un des 10 exemplaires de "Les notes invisibles" 
              d'une valeur unitaire de 21 euros !
            </div>

            {/* Participate button */}
            <div className="text-center pt-4">
              <button 
                className="px-8 py-3 text-white font-bold text-lg rounded uppercase tracking-wide shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ backgroundColor: 'hsl(0, 84%, 55%)' }}
              >
                PARTICIPER !
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummerReadingContest;