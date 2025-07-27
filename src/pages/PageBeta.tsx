import React, { useState } from 'react';

const PageBeta: React.FC = () => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [title, setTitle] = useState("GAGNEZ VOS VACANCES EN MOBIL-HOME");
  const [subtitle, setSubtitle] = useState("Valeur 800€ - 100% à gagner");

  const handleTitleDoubleClick = () => {
    setEditingTitle(true);
  };

  const handleSubtitleDoubleClick = () => {
    setEditingSubtitle(true);
  };

  const handleTitleBlur = () => {
    setEditingTitle(false);
  };

  const handleSubtitleBlur = () => {
    setEditingSubtitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setEditingTitle(false);
    }
  };

  const handleSubtitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setEditingSubtitle(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
      <div 
        className="relative w-[1080px] h-[1920px] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/lovable-uploads/526bc7f5-d2b0-454f-974b-6eb995d6df1f.png')`
        }}
      >
        {/* Overlay semi-transparent */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Logo Homair en haut */}
        <div className="absolute top-10 left-10 right-10 flex justify-center">
          <div className="text-white text-6xl font-bold tracking-wider">
            <span className="text-orange-400">☀</span> Homair
            <div className="text-2xl font-normal tracking-widest mt-1">VACANCES</div>
          </div>
        </div>

        {/* Contenu principal centré */}
        <div className="absolute top-1/3 left-0 right-0 text-center px-16 z-10">
          {/* Titre principal éditable */}
          {editingTitle ? (
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="w-full text-8xl font-black text-white text-center bg-transparent border-2 border-white/50 rounded-lg p-4 resize-none"
              style={{
                textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
                fontFamily: 'Arial, sans-serif',
                lineHeight: '1.1'
              }}
              autoFocus
              rows={3}
            />
          ) : (
            <h1
              onDoubleClick={handleTitleDoubleClick}
              className="text-8xl font-black text-white cursor-pointer hover:bg-white/10 rounded-lg p-4 transition-colors"
              style={{
                textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
                fontFamily: 'Arial, sans-serif',
                lineHeight: '1.1'
              }}
            >
              {title}
            </h1>
          )}

          {/* Sous-titre éditable dans l'encadré orange */}
          <div className="mt-8 flex justify-center">
            {editingSubtitle ? (
              <input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                onBlur={handleSubtitleBlur}
                onKeyDown={handleSubtitleKeyDown}
                className="bg-orange-400 text-blue-900 px-12 py-6 rounded-full text-4xl font-bold text-center border-2 border-white"
                style={{
                  fontFamily: 'Arial, sans-serif',
                  minWidth: '400px'
                }}
                autoFocus
              />
            ) : (
              <div
                onDoubleClick={handleSubtitleDoubleClick}
                className="bg-orange-400 text-blue-900 px-12 py-6 rounded-full text-4xl font-bold cursor-pointer hover:bg-orange-300 transition-colors"
                style={{
                  fontFamily: 'Arial, sans-serif'
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageBeta;