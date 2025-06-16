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
    ? 'text-2xl font-bold mb-2 text-[#841b60] drop-shadow-sm'
    : 'text-3xl md:text-4xl font-bold mb-4 text-[#841b60] drop-shadow-sm';
  const actionsClass = size === 'sm'
    ? 'flex flex-wrap justify-center gap-3 [&_button]:px-6 [&_button]:py-2.5 [&_button]:text-base [&_button]:rounded-xl [&_button]:shadow'
    : 'flex flex-wrap justify-center gap-4';

  if (variant === 'default') {
    return (
      <div className="relative w-full mt-3 pb-2 px-2 select-none md:px-[19px] z-10 overflow-hidden">
        {/* Fond glassmorphique pastel bleu, identique à QuickCreationSection */}
        {/* Suppression de l’ombre ici */}
        <div className="relative max-w-7xl mx-auto rounded-b-3xl overflow-hidden">
          <div
            className="
              relative
              bg-white/60
              bg-gradient-to-br
              from-[#e9f1fd]/90
              via-[#f3e8fa]/80
              to-[#c4e0f9]/90
              backdrop-blur-xl
              rounded-b-3xl
              border-b border-white/25
            "
          >
            {/* Overlay coloré pour contraste subtil */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#841b60]/8 via-transparent to-[#841b60]/5 pointer-events-none rounded-b-3xl" />
            {/* Décorations géométriques flottantes style QuickCreationSection */}
            <div className="absolute top-4 right-8 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-xl pointer-events-none"></div>
            <div className="absolute bottom-6 left-12 w-16 h-16 bg-gradient-to-br from-blue-400/15 to-indigo-400/15 rounded-full blur-lg pointer-events-none"></div>
            {/* SVG décoratif éditorial, moins saturé/opacité */}
            <div className="absolute top-0 right-0 w-96 h-full opacity-30 pointer-events-none">
              <svg viewBox="0 0 400 200" className="w-full h-full">
                <defs>
                  <linearGradient id="grad1-ph" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.16" />
                    <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.13" />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity="0.08" />
                  </linearGradient>
                </defs>
                <path d="M300,20 Q350,60 320,100 T280,140 Q320,160 360,120 T400,80 L400,0 Z" fill="url(#grad1-ph)" />
                <circle cx="350" cy="40" r="15" fill="#8B5CF6" fillOpacity="0.08" />
                <circle cx="320" cy="80" r="8" fill="#3B82F6" fillOpacity="0.11" />
                <path d="M280,120 Q300,100 320,120 T360,140" stroke="#6366F1" strokeWidth="2" strokeOpacity="0.12" fill="none" />
              </svg>
            </div>
            {/* Contenu principal */}
            <div className="relative z-10 flex flex-col items-center text-center pt-10 pb-10 px-6">
              <h1 className={titleClass}>{title}</h1>
              {children && <div className="mb-3 flex justify-center">{children}</div>}
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
    <div className="w-full pt-10 px-2 md:px-0">
      <div className="relative max-w-7xl mx-auto">
        <div className="relative z-10 flex flex-col items-center text-center">
          <h1 className={titleClass}>{title}</h1>
          {children && <div className="mb-4 flex justify-center">{children}</div>}
          {actions && <div className={actionsClass}>{actions}</div>}
        </div>
      </div>
    </div>
  );
};
export default PageHeader;
