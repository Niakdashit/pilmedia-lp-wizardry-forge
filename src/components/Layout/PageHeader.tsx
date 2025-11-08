
import React from 'react';
interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  variant?: 'default' | 'plain';
  size?: 'default' | 'sm';
}
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  actions,
  children,
  variant = 'default',
  size = 'sm'
}) => {
  const titleClass = size === 'sm'
    ? 'text-2xl font-bold mb-4 text-[#E0004D] drop-shadow-sm'
    : 'text-3xl md:text-4xl font-bold mb-6 text-[#E0004D] drop-shadow-sm';
  const actionsClass = size === 'sm'
    ? 'flex flex-wrap justify-center gap-3'
    : 'flex flex-wrap justify-center gap-4';

  if (variant === 'default') {
    return (
      <div className="relative w-full mt-2 pb-4 px-6 sm:px-8 lg:px-10 select-text z-10 overflow-hidden">
        {/* Fond glassmorphique pastel bleu, identique à QuickCreationSection */}
        {/* Suppression de l'ombre ici */}
        <div className="relative max-w-7xl mx-auto rounded-b-3xl overflow-hidden">
          <div
            className="
              relative
              bg-white/60
              bg-gradient-to-br
              from-[#ede9fe]/85
              via-[#e0f2fe]/80
              to-[#eef2ff]/85
              backdrop-blur-xl
              rounded-b-3xl
              border-b border-white/25
            "
          >
            {/* Overlay coloré pour contraste subtil */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed]/16 via-transparent to-[#2563eb]/12 pointer-events-none rounded-b-3xl" />
            {/* Décorations géométriques flottantes style QuickCreationSection */}
            <div className="absolute top-6 right-10 w-24 h-24 bg-gradient-to-br from-violet-300/25 to-blue-300/25 rounded-full blur-xl pointer-events-none"></div>
            <div className="absolute bottom-8 left-14 w-20 h-20 bg-gradient-to-br from-indigo-300/25 to-sky-300/25 rounded-full blur-lg pointer-events-none"></div>
            {/* SVG décoratif éditorial, moins saturé/opacité */}
            <div className="absolute top-0 right-0 w-96 h-full opacity-30 pointer-events-none">
              <svg viewBox="0 0 400 200" className="w-full h-full">
                <defs>
                  <linearGradient id="grad1-ph" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.16" />
                    <stop offset="50%" stopColor="#6366f1" stopOpacity="0.13" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.10" />
                  </linearGradient>
                </defs>
                <path d="M300,20 Q350,60 320,100 T280,140 Q320,160 360,120 T400,80 L400,0 Z" fill="url(#grad1-ph)" />
                <circle cx="350" cy="40" r="15" fill="#7c3aed" fillOpacity="0.10" />
                <circle cx="320" cy="80" r="8" fill="#6366f1" fillOpacity="0.12" />
                <path d="M280,120 Q300,100 320,120 T360,140" stroke="#2563eb" strokeWidth="2" strokeOpacity="0.14" fill="none" />
              </svg>
            </div>
            {/* Contenu principal */}
            <div className="relative z-10 flex flex-col items-center text-center pt-8 pb-8 px-6">
              <h1 className={titleClass}>{title}</h1>
              {children && <div className="mb-5 flex justify-center">{children}</div>}
              {actions && <div className={actionsClass}>{actions}</div>}
            </div>
            {/* Gradient border en bas */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          </div>
        </div>
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(2deg); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  // "Plain" style: inchangé
  return (
    <div className="w-full pt-8 px-6 sm:px-8 lg:px-10">
      <div className="relative max-w-7xl mx-auto">
        <div className="relative z-10 flex flex-col items-center text-center">
          <h1 className={titleClass}>{title}</h1>
          {children && <div className="mb-5 flex justify-center">{children}</div>}
          {actions && <div className={actionsClass}>{actions}</div>}
        </div>
      </div>
    </div>
  );
};
export default PageHeader;
