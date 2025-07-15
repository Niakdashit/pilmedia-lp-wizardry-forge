import React from 'react';

const DashboardHeader: React.FC = () => {
  return (
    <div className="relative w-full mt-3 pb-2 px-2 select-none md:px-[19px] z-10 overflow-hidden">
      {/* Fond glassmorphique pastel bleu, identique à PageHeader */}
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
          {/* Décorations géométriques flottantes style PageHeader */}
          <div className="absolute top-4 right-8 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-xl pointer-events-none"></div>
          <div className="absolute bottom-6 left-12 w-16 h-16 bg-gradient-to-br from-blue-400/15 to-indigo-400/15 rounded-full blur-lg pointer-events-none"></div>
          {/* SVG décoratif éditorial, moins saturé/opacité */}
          <div className="absolute top-0 right-0 w-96 h-full opacity-30 pointer-events-none">
            <svg viewBox="0 0 400 200" className="w-full h-full">
              <defs>
                <linearGradient id="grad1-dh" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.16" />
                  <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.13" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.08" />
                </linearGradient>
              </defs>
              <path d="M300,20 Q350,60 320,100 T280,140 Q320,160 360,120 T400,80 L400,0 Z" fill="url(#grad1-dh)" />
              <circle cx="350" cy="40" r="15" fill="#8B5CF6" fillOpacity="0.08" />
              <circle cx="320" cy="80" r="8" fill="#3B82F6" fillOpacity="0.11" />
              <path d="M280,120 Q300,100 320,120 T360,140" stroke="#6366F1" strokeWidth="2" strokeOpacity="0.12" fill="none" />
            </svg>
          </div>
          {/* Contenu principal */}
          <div className="relative z-10 flex flex-col items-center text-center pt-10 pb-10 px-6">
            <h1 className="text-2xl font-bold mb-6 text-[#841b60] drop-shadow-sm">Tableau de bord</h1>
          </div>
          {/* Gradient border en bas */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;