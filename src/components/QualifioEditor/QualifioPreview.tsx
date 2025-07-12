import React from 'react';
import { Facebook, X } from 'lucide-react';
import type { DeviceType, EditorConfig } from './QualifioEditorLayout';
import summerBeachImage from '../../assets/summer-beach.jpg';

interface QualifioPreviewProps {
  device: DeviceType;
  config: EditorConfig;
}

const QualifioPreview: React.FC<QualifioPreviewProps> = ({ device, config }) => {
  const getDeviceStyles = () => {
    switch (device) {
      case 'mobile':
        return { maxWidth: '375px', margin: '0 auto' };
      case 'tablet':
        return { maxWidth: '768px', margin: '0 auto' };
      case 'desktop':
      default:
        return { maxWidth: '1024px', margin: '0 auto' };
    }
  };

  const containerStyles = {
    backgroundColor: 'hsl(200, 20%, 15%)',
    minHeight: '600px',
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
            className="relative bg-cover bg-center rounded-lg shadow-2xl overflow-hidden"
            style={{ 
              backgroundImage: `url(${summerBeachImage})`,
              width: device === 'mobile' ? '320px' : device === 'tablet' ? '500px' : '600px',
              height: device === 'mobile' ? '400px' : device === 'tablet' ? '500px' : '600px'
            }}
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

            {/* Instructions overlay centered */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <p className="text-lg font-medium mb-4">Cliquez sur le bouton central pour faire tourner la roue !</p>
                <button 
                  className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg"
                  style={{ backgroundColor: 'hsl(0, 84%, 55%)' }}
                >
                  ↻
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Mode 1 - Bannière + zone de texte
          <div 
            className="rounded-lg shadow-2xl overflow-hidden"
            style={{ 
              backgroundColor: config.backgroundColor || '#ffffff',
              width: device === 'mobile' ? '320px' : device === 'tablet' ? '500px' : '600px'
            }}
          >
            {/* Header avec image de fond */}
            <div 
              className="relative bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${summerBeachImage})`,
                height: device === 'mobile' ? '250px' : device === 'tablet' ? '300px' : '350px'
              }}
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
                <p>{config.storyText}</p>
              </div>

              {/* Publisher link */}
              <div className="text-center">
                <a 
                  href="#" 
                  className="font-semibold"
                  style={{ color: 'hsl(0, 84%, 55%)' }}
                >
                  {config.publisherLink}
                </a>
              </div>

              {/* Prize description */}
              <div className="text-center text-sm font-semibold italic text-gray-800">
                {config.prizeText}
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
        )}
      </div>
    </div>
  );
};

export default QualifioPreview;