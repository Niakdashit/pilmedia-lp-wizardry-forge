import React from 'react';
import { Facebook, X } from 'lucide-react';
import WheelGame from './WheelGame';

interface QualifioGameFrameProps {
  campaign: any;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
}

const QualifioGameFrame: React.FC<QualifioGameFrameProps> = ({
  campaign,
  previewDevice
}) => {
  const getFrameStyles = () => {
    const baseStyles = {
      backgroundColor: campaign.settings?.backgroundColor || '#ffffff',
      borderRadius: previewDevice === 'mobile' ? '24px' : '12px',
      border: '1px solid #e5e7eb',
      overflow: 'auto',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      position: 'relative' as const,
    };

    switch (previewDevice) {
      case 'mobile':
        return {
          ...baseStyles,
          width: '375px',
          height: '812px',
          maxWidth: '100%',
        };
      case 'tablet':
        return {
          ...baseStyles,
          width: '768px',
          height: '1024px',
          maxWidth: '100%',
        };
      case 'desktop':
      default:
        return {
          ...baseStyles,
          width: '900px',
          height: '1100px',
          maxWidth: '100%',
        };
    }
  };

  const getBannerHeight = () => {
    const gameMode = campaign.game?.mode || 'mode1';
    
    if (gameMode === 'mode2') {
      // Mode 2: bannière paysage comme une page web
      switch (previewDevice) {
        case 'mobile':
          return '250px';
        case 'tablet':
          return '400px';
        case 'desktop':
        default:
          return '500px';
      }
    } else {
      // Mode 1: bannière minimum 1500x744
      switch (previewDevice) {
        case 'mobile':
          return '186px'; // Ratio 1500x744 adapté
        case 'tablet':
          return '381px'; // Ratio 1500x744 adapté
        case 'desktop':
        default:
          return '744px'; // Hauteur exacte demandée
      }
    }
  };

  const getContentPadding = () => {
    switch (previewDevice) {
      case 'mobile':
        return '12px';
      case 'tablet':
        return '20px';
      case 'desktop':
      default:
        return '24px';
    }
  };

  const getTextSize = () => {
    switch (previewDevice) {
      case 'mobile':
        return {
          title: 'text-lg',
          body: 'text-sm',
          link: 'text-sm',
          prize: 'text-sm',
          button: 'text-base'
        };
      case 'tablet':
        return {
          title: 'text-xl',
          body: 'text-base',
          link: 'text-base',
          prize: 'text-base',
          button: 'text-lg'
        };
      case 'desktop':
      default:
        return {
          title: 'text-2xl',
          body: 'text-base',
          link: 'text-base',
          prize: 'text-base',
          button: 'text-lg'
        };
    }
  };

  return (
    <div
      style={getFrameStyles()}
      className="mx-auto"
    >
      {/* Bannière avec image de fond */}
      <div
        className="relative w-full flex items-center justify-center"
        style={{
          height: getBannerHeight(),
          backgroundImage: campaign.banner?.image ? `url(${campaign.banner.image})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: campaign.game?.mode === 'mode2' ? 'cover' : '100% auto',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Boutons réseaux sociaux en haut à gauche */}
        <div className="absolute top-4 left-4 flex space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <Facebook className="w-4 h-4 text-white" />
          </div>
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
            <X className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Bouton règlement en haut à droite */}
        <div className="absolute top-4 right-4">
          <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded">
            Règlement
          </button>
        </div>

        {/* Mode 2: Jeu directement dans la bannière */}
        {campaign.game?.mode === 'mode2' ? (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <WheelGame campaign={campaign} previewDevice={previewDevice} />
          </div>
        ) : (
          /* Mode 1: Titres superposés */
          <div className="text-center z-10">
            <div className="inline-block bg-pink-200 bg-opacity-90 px-4 py-2 rounded mb-2">
              <h1 className="text-lg font-bold text-gray-800">
                {campaign.banner?.title || 'GRAND JEU'}
              </h1>
            </div>
            <div className="inline-block bg-yellow-100 bg-opacity-90 px-4 py-2 rounded">
              <h2 className="text-sm font-medium text-gray-700">
                {campaign.banner?.subtitle || 'LECTURES DE L\'ÉTÉ'}
              </h2>
            </div>
          </div>
        )}
      </div>

        {/* Contenu texte */}
        <div style={{ padding: getContentPadding() }}>
          <div className={`${getTextSize().body} text-gray-800 leading-relaxed mb-6`} style={{ whiteSpace: 'pre-wrap' }}>
            {campaign.content?.text || 'Texte de présentation de votre jeu...'}
          </div>

        {/* Lien éditeur */}
        <div className="text-center mb-4">
          <a
            href={campaign.publisher?.url || '#'}
            className={`${getTextSize().link} text-red-600 font-medium hover:underline`}
          >
            {campaign.publisher?.name || 'editions.flammarion.com'}
          </a>
        </div>

        {/* Description du lot */}
        <div className="text-center mb-6">
          <p className={`${getTextSize().prize} font-medium italic text-gray-800`}>
            {campaign.prize?.description || 'Jouez et tentez de remporter un prix !'}
          </p>
        </div>

        {/* Zone de jeu - Uniquement pour Mode 1 */}
        {campaign.game?.mode !== 'mode2' && (
          campaign.game?.type === 'wheel' ? (
            <WheelGame campaign={campaign} previewDevice={previewDevice} />
          ) : (
            /* Bouton de participation par défaut */
            <div className="text-center">
              <button className={`px-8 py-3 bg-red-600 text-white font-bold ${getTextSize().button} rounded-lg hover:bg-red-700 transition-colors shadow-md`}>
                {campaign.prize?.buttonText || 'PARTICIPER !'}
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default QualifioGameFrame;