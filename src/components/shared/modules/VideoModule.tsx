import React from 'react';
import type { BlocVideo } from '@/types/modularEditor';

interface VideoModuleProps {
  module: BlocVideo;
  onClick?: () => void;
  isSelected?: boolean;
}

// Fonction pour convertir les URLs YouTube/Vimeo en URLs embed
const convertToEmbedUrl = (url: string): string => {
  if (!url) return '';
  
  // YouTube: https://www.youtube.com/watch?v=VIDEO_ID -> https://www.youtube.com/embed/VIDEO_ID
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  
  // Vimeo: https://vimeo.com/VIDEO_ID -> https://player.vimeo.com/video/VIDEO_ID
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  
  // Si c'est déjà une URL embed, la retourner telle quelle
  return url;
};

const VideoModule: React.FC<VideoModuleProps> = ({ module, onClick, isSelected = false }) => {
  const align = module.align || 'center';
  const justifyContent = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
  const borderRadius = module.borderRadius ?? 8;
  const borderWidth = (module as any).borderWidth ?? 0;
  const borderColor = (module as any).borderColor ?? '#000000';
  const embedUrl = convertToEmbedUrl(module.src);
  const minHeight = (module as any).minHeight || 320;

  console.log('🎬 [VideoModule] Rendering:', {
    id: module.id,
    src: module.src,
    embedUrl,
    hasVideo: !!embedUrl,
    minHeight,
    borderWidth,
    borderColor
  });

  return (
    <div
      onClick={onClick}
      style={{
        paddingTop: (module as any).spacingTop ?? 16,
        paddingBottom: (module as any).spacingBottom ?? 16,
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      <div style={{ display: 'flex', justifyContent, width: '100%' }}>
        <div
          style={{
            width: '100%',
            maxWidth: (module as any).width ?? 560,
            borderRadius,
            overflow: 'hidden',
            background: '#000000',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            outline: isSelected ? '2px solid #E0004D' : 'none',
            outlineOffset: '2px',
            border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none'
          }}
        >
          {embedUrl ? (
            <div className="relative" style={{ paddingTop: '56.25%', background: '#1a1a1a' }}>
              <iframe
                src={embedUrl}
                title={module.title || 'Video'}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ display: 'block' }}
              />
            </div>
          ) : (
            <div 
              className="relative flex items-center justify-center bg-gray-800 text-white"
              style={{ paddingTop: '56.25%', minHeight: 200 }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-4">
                  <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm opacity-75">Aucune vidéo configurée</p>
                  <p className="text-xs opacity-50 mt-1">Cliquez pour ajouter une URL</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoModule;
