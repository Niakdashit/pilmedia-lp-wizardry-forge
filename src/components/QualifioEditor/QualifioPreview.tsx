import React from 'react';
import { X } from 'lucide-react';
import type { DeviceType, EditorConfig } from './QualifioEditorLayout';

interface QualifioPreviewProps {
  device: DeviceType;
  config: EditorConfig;
}

const QualifioPreview: React.FC<QualifioPreviewProps> = ({
  device,
  config
}) => {
  const getDeviceDimensions = () => {
    const base = { width: config.width || 810, height: config.height || 1200 };
    switch (device) {
      case 'mobile':
        return { ...base, scale: 0.8 };
      case 'tablet':
        return { ...base, scale: 0.7 };
      case 'desktop':
      default:
        return { ...base, scale: 0.6 };
    }
  };

  const { width, height, scale } = getDeviceDimensions();

  return (
    <div
      className="flex flex-col items-center justify-center h-screen bg-slate-800 rounded-lg p-8"
      style={{ maxWidth: '90vw', marginLeft: 'auto', marginRight: 'auto' }}
    >
      {/* Device Frame */}
      <div
        className="bg-white rounded-lg shadow-2xl overflow-y-auto sm:overflow-hidden w-[95%] max-w-[810px] sm:w-[600px] sm:max-w-[810px] md:w-[810px]"
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: 'center center'
        }}
      >
        <div className="w-full h-full overflow-auto">
          {/* Top Icons */}
          <div className="flex justify-between items-start p-4 absolute top-0 left-0 right-0 z-10">
            <div className="flex gap-2">
              <button className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center text-xs font-bold">
                f
              </button>
              <button className="w-8 h-8 bg-black text-white rounded flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <button className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded">
              Règlement
            </button>
          </div>

          {/* Banner */}
          <div className="relative h-64 bg-gradient-to-br from-pink-100 to-blue-100 overflow-hidden">
            {config.bannerImage && (
              <img 
                src={config.bannerImage} 
                alt="Banner" 
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Overlay Text */}
            <div className="absolute top-4 left-4">
              <div className="bg-pink-200 text-pink-800 px-3 py-1 rounded text-sm font-bold mb-2">
                GRAND JEU
              </div>
              <div className="bg-amber-200 text-amber-800 px-3 py-1 rounded text-sm font-bold">
                LECTURES DE L'ÉTÉ
              </div>
            </div>

            {/* Sample Book Images */}
            <div className="absolute right-8 top-8 flex gap-4">
              <div className="w-24 h-32 bg-blue-900 rounded shadow-lg flex items-center justify-center">
                <div className="text-white text-xs text-center font-bold transform -rotate-90">
                  SÉRÉNITÉ
                </div>
              </div>
              <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                <div className="text-white text-xs font-bold">ART</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Main Text */}
            <div 
              className={`text-sm leading-relaxed ${config.centerText ? 'text-center' : 'text-left'}`}
              style={{ 
                color: config.contentColor,
                fontSize: `${config.contentSize}px`,
                fontFamily: config.contentFont
              }}
            >
              {config.contentText}
            </div>

            {/* Link */}
            {config.bannerLink && (
              <div className="text-center">
                <a 
                  href="#" 
                  className="text-red-500 font-bold hover:underline"
                >
                  {config.bannerLink}
                </a>
              </div>
            )}

            {/* Prize Text */}
            <div className="text-center text-sm font-bold italic">
              Jouez et tentez de remporter l'un des 15 exemplaires de "Coloriages au numéro Sérénité" d'une valeur unitaire de 14.95 euros !
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <button className="bg-red-500 text-white px-8 py-3 rounded font-bold text-lg hover:bg-red-600 transition-colors shadow-lg">
                PARTICIPER !
              </button>
            </div>
          </div>

          {/* Footer */}
          {config.footerImage && (
            <div className="mt-8">
              <img 
                src={config.footerImage} 
                alt="Footer" 
                className="w-full h-32 object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Device Label */}
      <div className="mt-4 text-white/80 text-sm font-medium capitalize">
        Aperçu {device}
      </div>
    </div>
  );
};

export default QualifioPreview;