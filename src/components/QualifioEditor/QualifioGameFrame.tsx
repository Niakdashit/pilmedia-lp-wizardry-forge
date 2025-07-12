import React from 'react';
import { Facebook, X } from 'lucide-react';

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
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    };

    switch (previewDevice) {
      case 'mobile':
        return {
          ...baseStyles,
          width: '375px',
          maxHeight: '667px'
        };
      case 'tablet':
        return {
          ...baseStyles,
          width: '768px',
          maxHeight: '1024px'
        };
      case 'desktop':
      default:
        return {
          ...baseStyles,
          width: `${campaign.settings?.width || 810}px`,
          height: `${campaign.settings?.height || 1200}px`
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
        className="relative h-64 w-full flex items-center justify-center"
        style={{
          backgroundImage: campaign.banner?.image ? `url(${campaign.banner.image})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: '100% auto',
          backgroundPosition: 'center top',
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

        {/* Titres superposés */}
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
      </div>

      {/* Contenu texte */}
      <div className="p-6">
        <div className="text-sm text-gray-800 leading-relaxed mb-6">
          {campaign.content?.text || 'Texte de présentation de votre jeu...'}
        </div>

        {/* Lien éditeur */}
        <div className="text-center mb-4">
          <a
            href={campaign.publisher?.url || '#'}
            className="text-red-600 font-medium hover:underline"
          >
            {campaign.publisher?.name || 'editions.flammarion.com'}
          </a>
        </div>

        {/* Description du lot */}
        <div className="text-center mb-6">
          <p className="text-sm font-medium italic text-gray-800">
            {campaign.prize?.description || 'Jouez et tentez de remporter un prix !'}
          </p>
        </div>

        {/* Bouton de participation */}
        <div className="text-center">
          <button className="px-8 py-3 bg-red-600 text-white font-bold text-lg rounded-lg hover:bg-red-700 transition-colors shadow-md">
            {campaign.prize?.buttonText || 'PARTICIPER !'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QualifioGameFrame;