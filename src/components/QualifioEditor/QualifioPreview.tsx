import React from 'react';
import { Facebook, X } from 'lucide-react';
import type { DeviceType, EditorConfig } from './QualifioEditorLayout';
import ModernWheel from './ModernWheel';
import summerBeachImage from '../../assets/summer-beach.jpg';

interface QualifioPreviewProps {
  device: DeviceType;
  config: EditorConfig;
}

const QualifioPreview: React.FC<QualifioPreviewProps> = ({ device, config }) => {
  // Force refresh to clear cache issues
  const handleWheelComplete = () => {
    console.log('Roue terminée!');
  };

  const getWheelSize = () => {
    switch (device) {
      case 'mobile':
        return 200;
      case 'tablet':
        return 280;
      case 'desktop':
      default:
        return 320;
    }
  };

  const getDeviceStyles = () => {
    switch (device) {
      case 'mobile':
        return { 
          width: '375px',
          height: '667px',
          margin: '20px auto',
          border: '8px solid #333',
          borderRadius: '25px',
          overflow: 'hidden'
        };
      case 'tablet':
        return { 
          width: '768px',
          height: '1024px', 
          margin: '20px auto',
          border: '12px solid #333',
          borderRadius: '20px',
          overflow: 'hidden'
        };
      case 'desktop':
      default:
        return { 
          width: '1200px',
          height: '800px',
          margin: '20px auto',
          border: '2px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden'
        };
    }
  };

  const getContentDimensions = () => {
    switch (device) {
      case 'mobile':
        return { 
          width: '100%',
          height: '100%'
        };
      case 'tablet':
        return { 
          width: '100%',
          height: '100%'
        };
      case 'desktop':
      default:
        return { 
          width: '100%',
          height: '100%'
        };
    }
  };

  const containerStyles = {
    backgroundColor: 'hsl(210, 20%, 98%)',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  };

  return (
    <div style={containerStyles}>
      <div style={getDeviceStyles()}>
        {config.displayMode === 'mode2-background' ? (
          // Mode 2 - Fond seul (paysage)
          <div 
            className="relative bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${summerBeachImage})`,
              ...getContentDimensions()
            }}
          >
            {/* Social buttons top left */}
            <div className="absolute top-4 left-4 flex gap-2">
              <button className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-lg">
                <Facebook className="w-4 h-4 text-white" />
              </button>
              <button className="w-8 h-8 bg-black rounded flex items-center justify-center shadow-lg">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            
            {/* Rules button top right */}
            <div className="absolute top-4 right-4">
              <button 
                className="px-4 py-2 text-white text-sm font-medium rounded shadow-lg"
                style={{ backgroundColor: 'hsl(0, 84%, 55%)' }}
              >
                Règlement
              </button>
            </div>

            {/* Roue de la fortune overlay centered */}
            <div className="absolute inset-0 flex items-center justify-center">
              <ModernWheel 
                size={getWheelSize()} 
                onComplete={handleWheelComplete}
              />
            </div>
          </div>
        ) : (
          // Mode 1 - Bannière + zone de texte
          <div 
            className="flex flex-col"
            style={{ 
              backgroundColor: '#ffffff',
              ...getContentDimensions()
            }}
          >
            {/* Header avec image de fond */}
            <div 
              className="relative bg-cover bg-center flex-shrink-0"
              style={{ 
                backgroundImage: `url(${summerBeachImage})`,
                height: device === 'mobile' ? '50%' : device === 'tablet' ? '45%' : '60%'
              }}
            >
              {/* Social buttons top left */}
              <div className="absolute top-4 left-4 flex gap-2">
                <button className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-lg">
                  <Facebook className="w-4 h-4 text-white" />
                </button>
                <button className="w-8 h-8 bg-black rounded flex items-center justify-center shadow-lg">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              
              {/* Rules button top right */}
              <div className="absolute top-4 right-4">
                <button 
                  className="px-4 py-2 text-white text-sm font-medium rounded shadow-lg"
                  style={{ backgroundColor: 'hsl(0, 84%, 55%)' }}
                >
                  Règlement
                </button>
              </div>

              {/* Roue de la fortune overlay pour Mode 1 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <ModernWheel 
                  size={getWheelSize() * 0.8} 
                  onComplete={handleWheelComplete}
                />
              </div>
            </div>

            {/* Content zone */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="space-y-4">
                {/* Story text */}
                <div className="text-sm leading-relaxed text-gray-800">
                  <p>
                    Valentine et son frère aîné, Antoine, ont 13 ans d'écart. Orphelins de mère, ils viennent de perdre leur père, César Mestre. Le jour des obsèques, une inconnue leur remet une lettre de leur père. La lettre n'explicite pas grand-chose, mais évoque une fracture, des réparations qui n'ont pas eu le temps d'être faites. Antoine s'en détourne vite et retourne à sa vie rangée avec sa femme et ses enfants. Mais Valentine ne reconnaît pas dans ces lignes l'enfance qu'elle a vécue et se donne pour mission de comprendre ce que leur père a voulu leur dire et va enquêter. À son récit s'enchâsse celui de Laure, factrice à Loisel, un petit village normand, et qui vient de faire la connaissance de César. Elle s'est réfugiée là quatre ans plus tôt, après une dépression, et laissant la garde de son fils à son ex-mari, fils avec lequel elle tente peu à peu de renouer un lien fort. Le destin des deux femmes va se croiser.
                  </p>
                </div>

                {/* Publisher link */}
                <div className="text-center pt-2">
                  <a 
                    href="#" 
                    className="font-semibold text-sm"
                    style={{ color: 'hsl(0, 84%, 55%)' }}
                  >
                    editions-flammarion.com
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
                    style={{ backgroundColor: 'hsl(0, 84%, 55%)' }}
                  >
                    PARTICIPER !
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QualifioPreview;