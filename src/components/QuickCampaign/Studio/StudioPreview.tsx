import React, { useState } from 'react';
import { ChevronLeft, Smartphone, Tablet, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import InteractiveWheel from './InteractiveWheel';

interface StudioPreviewProps {
  campaignData: {
    brandAnalysis: any;
    content: any;
    design: any;
  };
  logoUrl?: string;
  backgroundUrl?: string;
  onBack: () => void;
}

const StudioPreview: React.FC<StudioPreviewProps> = ({
  campaignData,
  logoUrl,
  backgroundUrl,
  onBack
}) => {
  const [selectedDevice, setSelectedDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  const getDeviceStyle = () => {
    switch (selectedDevice) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      default:
        return { width: '1200px', height: '800px' };
    }
  };

  const getTextSize = () => {
    switch (selectedDevice) {
      case 'mobile':
        return {
          title: 'text-2xl md:text-3xl',
          subtitle: 'text-lg',
          cta: 'text-lg',
          description: 'text-sm'
        };
      case 'tablet':
        return {
          title: 'text-4xl md:text-5xl',
          subtitle: 'text-xl',
          cta: 'text-xl',
          description: 'text-base'
        };
      default:
        return {
          title: 'text-5xl md:text-6xl',
          subtitle: 'text-2xl',
          cta: 'text-2xl',
          description: 'text-lg'
        };
    }
  };

  const deviceStyle = getDeviceStyle();
  const textSizes = getTextSize();

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour
        </Button>

        <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setSelectedDevice('mobile')}
            className={`p-2 rounded ${selectedDevice === 'mobile' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedDevice('tablet')}
            className={`p-2 rounded ${selectedDevice === 'tablet' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedDevice('desktop')}
            className={`p-2 rounded ${selectedDevice === 'desktop' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Monitor className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex justify-center">
        <Card 
          className="overflow-hidden shadow-2xl"
          style={{
            ...deviceStyle,
            maxWidth: '100%',
            backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: campaignData.design?.primaryColor || '#841b60'
          }}
        >
          <CardContent className="relative h-full p-0 flex flex-col">
            {/* Overlay pour améliorer la lisibilité */}
            <div 
              className="absolute inset-0 bg-black/30"
              style={{
                background: backgroundUrl 
                  ? 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)'
                  : `linear-gradient(135deg, ${campaignData.design?.primaryColor || '#841b60'} 0%, ${campaignData.design?.secondaryColor || '#dc2626'} 100%)`
              }}
            />

            {/* Logo en haut */}
            {logoUrl && (
              <div className="relative z-10 p-6 flex justify-center">
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="h-12 md:h-16 object-contain filter drop-shadow-lg"
                />
              </div>
            )}

            {/* Contenu principal centré */}
            <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-6 md:px-12">
              {/* Titre principal */}
              <h1 
                className={`${textSizes.title} font-titan font-black mb-4 text-white leading-tight`}
                style={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.3)',
                  fontFamily: campaignData.brandAnalysis?.fontFamily || 'Titan One, cursive'
                }}
              >
                {campaignData.content?.title || 'PARTICIPEZ & GAGNEZ'}
              </h1>

              {/* Sous-titre */}
              {campaignData.content?.subtitle && (
                <p 
                  className={`${textSizes.subtitle} text-white/90 mb-6 font-medium`}
                  style={{
                    textShadow: '1px 1px 3px rgba(0,0,0,0.7)'
                  }}
                >
                  {campaignData.content.subtitle}
                </p>
              )}

              {/* Zone de jeu interactive */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-8 border border-white/20">
                <InteractiveWheel
                  primaryColor={campaignData.design?.primaryColor || '#006799'}
                  secondaryColor={campaignData.design?.secondaryColor || '#5bbad5'}
                  accentColor={campaignData.design?.accentColor || '#ffffff'}
                  onSpin={() => console.log('Roue tournée!')}
                />
              </div>

              {/* Call to Action */}
              <Button
                size="lg"
                className={`${textSizes.cta} font-bold px-8 md:px-12 py-4 md:py-6 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-200`}
                style={{
                  backgroundColor: campaignData.brandAnalysis?.primaryColor || campaignData.design?.primaryColor || '#006799',
                  color: campaignData.brandAnalysis?.accentColor || campaignData.design?.accentColor || '#ffffff',
                  border: `3px solid ${campaignData.brandAnalysis?.accentColor || campaignData.design?.accentColor || '#ffffff'}`,
                  boxShadow: `0 8px 32px ${campaignData.brandAnalysis?.primaryColor || campaignData.design?.primaryColor || '#006799'}40`
                }}
              >
                {campaignData.content?.callToAction || 'JOUER MAINTENANT'}
              </Button>

              {/* Description */}
              {campaignData.content?.description && (
                <p 
                  className={`${textSizes.description} text-white/80 mt-6 max-w-md`}
                  style={{
                    textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
                  }}
                >
                  {campaignData.content.description}
                </p>
              )}
            </div>

            {/* Footer avec informations légales */}
            <div className="relative z-10 p-4 text-center">
              <p className="text-white/60 text-xs">
                * Voir conditions d'utilisation - Jeu gratuit sans obligation d'achat
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informations sur la campagne générée */}
      <div className="mt-8 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Analyse de la marque</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Marque</p>
                <p className="font-semibold">{campaignData.brandAnalysis?.brandName || 'Non détecté'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Secteur</p>
                <p className="font-semibold">{campaignData.brandAnalysis?.industry || 'Général'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ton</p>
                <p className="font-semibold">{campaignData.brandAnalysis?.tone || 'Moderne'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Police</p>
                <p className="font-semibold">{campaignData.brandAnalysis?.fontFamily || 'System'}</p>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: campaignData.design?.primaryColor || '#841b60' }}
                />
                <span className="text-sm">Primaire</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: campaignData.design?.secondaryColor || '#dc2626' }}
                />
                <span className="text-sm">Secondaire</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: campaignData.design?.accentColor || '#ffffff' }}
                />
                <span className="text-sm">Accent</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudioPreview;