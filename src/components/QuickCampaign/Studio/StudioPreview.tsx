
import React, { useState } from 'react';
import { ChevronLeft, Smartphone, Tablet, Monitor, Settings } from 'lucide-react';
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

  const handleAdvancedEditor = () => {
    try {
      // Nettoyer d'abord le localStorage
      localStorage.removeItem('editorConfig');
      localStorage.removeItem('studioPreview');
      localStorage.removeItem('game_live_preview_config');
      
      // Transformer les données Studio vers le format EditorConfig
      const editorConfig = {
        width: 810,
        height: 1200,
        anchor: 'fixed',
        gameType: 'wheel',
        gameMode: 'mode1-sequential',
        displayMode: 'mode1-banner-game',
        storyText: campaignData.content?.title || 'PARTICIPEZ & GAGNEZ',
        publisherLink: '',
        prizeText: campaignData.content?.subtitle || campaignData.content?.description || 'Participez et tentez de gagner !',
        customTexts: (() => {
          // Utiliser les editableTexts de l'API si disponibles, sinon fallback
          if (campaignData.content?.editableTexts && campaignData.content.editableTexts.length > 0) {
            return campaignData.content.editableTexts.map((editableText: any) => ({
              id: editableText.id,
              text: editableText.text,
              type: editableText.type,
              position: editableText.position,
              style: editableText.style,
              editable: true,
              deviceConfig: {
                desktop: {
                  x: editableText.position.x,
                  y: editableText.position.y,
                  fontSize: parseInt(editableText.style.fontSize),
                  fontWeight: editableText.style.fontWeight,
                  color: editableText.style.color,
                  textAlign: editableText.style.textAlign,
                  textShadow: editableText.style.textShadow
                },
                tablet: {
                  x: editableText.position.x,
                  y: editableText.position.y,
                  fontSize: parseInt(editableText.style.fontSize) * 0.8,
                  fontWeight: editableText.style.fontWeight,
                  color: editableText.style.color,
                  textAlign: editableText.style.textAlign,
                  textShadow: editableText.style.textShadow
                },
                mobile: {
                  x: editableText.position.x,
                  y: editableText.position.y,
                  fontSize: parseInt(editableText.style.fontSize) * 0.6,
                  fontWeight: editableText.style.fontWeight,
                  color: editableText.style.color,
                  textAlign: editableText.style.textAlign,
                  textShadow: editableText.style.textShadow
                }
              }
            }));
          }
          
          // Fallback vers l'ancienne méthode
          return [
            {
              id: 'main-title',
              text: campaignData.content?.title || 'PARTICIPEZ & GAGNEZ',
              type: 'title',
              position: { x: 50, y: 100 },
              style: {
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#ffffff',
                textAlign: 'center',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
              },
              editable: true
            },
            {
              id: 'subtitle',
              text: campaignData.content?.subtitle || '',
              type: 'subtitle',
              position: { x: 50, y: 200 },
              style: {
                fontSize: '24px',
                fontWeight: 'medium',
                color: '#ffffff',
                textAlign: 'center',
                textShadow: '1px 1px 3px rgba(0,0,0,0.7)'
              },
              editable: true
            },
            {
              id: 'description',
              text: campaignData.content?.description || '',
              type: 'description',
              position: { x: 50, y: 650 },
              style: {
                fontSize: '18px',
                fontWeight: 'normal',
                color: '#ffffff',
                textAlign: 'center',
                textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
              },
              editable: true
            },
            {
              id: 'legal',
              text: campaignData.content?.legalText || '* Voir conditions d\'utilisation - Jeu gratuit sans obligation d\'achat',
              type: 'legal',
              position: { x: 50, y: 750 },
              style: {
                fontSize: '12px',
                fontWeight: 'normal',
                color: '#ffffff',
                textAlign: 'center',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
              },
              editable: true
            }
          ].filter(text => text.text);
        })(),
        centerText: false,
        centerForm: true,
        centerGameZone: true,
        backgroundColor: campaignData.design?.primaryColor || '#ffffff',
        outlineColor: campaignData.design?.accentColor || '#ffffff',
        borderStyle: 'classic',
        jackpotBorderStyle: 'classic',
        participateButtonText: campaignData.content?.callToAction || 'JOUER MAINTENANT',
        participateButtonColor: campaignData.design?.primaryColor || '#ff6b35',
        participateButtonTextColor: campaignData.design?.accentColor || '#ffffff',
        footerText: '* Voir conditions d\'utilisation - Jeu gratuit sans obligation d\'achat',
        footerColor: '#f8f9fa',
        customCSS: '',
        customJS: '',
        trackingTags: '',
        deviceConfig: {
          mobile: {
            fontSize: 14,
            backgroundImage: backgroundUrl || undefined,
            gamePosition: { x: 0, y: 0, scale: 1.7 }
          },
          tablet: {
            fontSize: 16,
            backgroundImage: backgroundUrl || undefined,
            gamePosition: { x: 0, y: 0, scale: 1.7 }
          },
          desktop: {
            fontSize: 18,
            backgroundImage: backgroundUrl || undefined,
            gamePosition: { x: 0, y: 0, scale: 1.7 }
          }
        },
        autoSyncOnDeviceChange: false,
        autoSyncRealTime: false,
        autoSyncBaseDevice: 'desktop',
        gameConfig: {},
        wheelConfig: {},
        brandAnalysis: campaignData.brandAnalysis || null,
        centerLogo: logoUrl || null,
        brandAssets: {
          logo: logoUrl,
          primaryColor: campaignData.design?.primaryColor,
          secondaryColor: campaignData.design?.secondaryColor,
          accentColor: campaignData.design?.accentColor
        },
        designColors: {
          primary: campaignData.design?.primaryColor,
          secondary: campaignData.design?.secondaryColor,
          accent: campaignData.design?.accentColor
        }
      };
      
      // Sauvegarder les données complètes
      const fullCampaignData = {
        ...campaignData,
        design: {
          ...campaignData.design,
          backgroundImage: backgroundUrl,
          centerLogo: logoUrl
        }
      };
      
      // Sauvegarder dans localStorage
      localStorage.setItem('studioPreview', JSON.stringify(fullCampaignData));
      localStorage.setItem('editorConfig', JSON.stringify(editorConfig));
      
      console.log('Transferring Studio data:', { fullCampaignData, editorConfig });
      
      // Naviguer vers l'éditeur avec rechargement forcé
      window.location.href = '/campaign-editor';
    } catch (error) {
      console.error('Erreur lors du transfert vers l\'éditeur:', error);
    }
  };

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

        <div className="flex items-center gap-4">
          <Button
            onClick={handleAdvancedEditor}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
          >
            <Settings className="w-4 h-4" />
            Éditeur avancé
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
              {/* Titre principal avec police de marque */}
              <h1 
                className={`${textSizes.title} font-medium mb-4 text-white leading-tight`}
                style={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.3)'
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
              <a
                href="#"
                className={`${textSizes.cta} font-bold px-8 md:px-12 py-4 md:py-6 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-200 inline-block text-center cursor-pointer`}
                style={{
                  backgroundColor: campaignData.design?.primaryColor || '#006799',
                  color: campaignData.design?.accentColor || '#ffffff',
                  border: `3px solid ${campaignData.design?.accentColor || '#ffffff'}`,
                  boxShadow: `0 8px 32px ${campaignData.design?.primaryColor || '#006799'}40`,
                  textDecoration: 'none'
                }}
              >
                {campaignData.content?.callToAction || 'JOUER MAINTENANT'}
              </a>

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
                <p className="font-semibold">{campaignData.brandAnalysis?.fontFamily || 'Titan One'}</p>
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
