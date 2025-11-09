import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const headerLogo = '/logos/prosplay-header-logo.svg';

interface EditorOnlyLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  backPath?: string;
  title?: string;
}

const EditorOnlyLayout: React.FC<EditorOnlyLayoutProps> = ({ 
  children, 
  showBackButton = true,
  backPath = '/campaigns',
  title
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(backPath);
  };

  useEffect(() => {
    const previousBackground = document.body.style.background;
    const previousHeight = document.body.style.height;
    const previousMargin = document.body.style.margin;

    document.body.style.background = 'linear-gradient(180deg, rgba(59, 56, 135, 0.855), rgba(156, 26, 96, 0.72), rgba(195, 85, 70, 0.775), rgba(156, 26, 96, 0.72))';
    document.body.style.height = '100vh';
    document.body.style.margin = '0';

    return () => {
      document.body.style.background = previousBackground;
      document.body.style.height = previousHeight;
      document.body.style.margin = previousMargin;
    };
  }, []);

  return (
    <div className="min-h-screen w-full" style={{ background: 'linear-gradient(180deg, rgba(59, 56, 135, 0.855), rgba(156, 26, 96, 0.72), rgba(195, 85, 70, 0.775), rgba(156, 26, 96, 0.72))' }}>
      {/* Header minimal pour navigation */}
      {showBackButton && (
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Retour</span>
            </button>
            {title && (
              <>
                <div className="w-px h-6 bg-gray-300" />
                <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
              </>
            )}
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="cursor-pointer transition-opacity hover:opacity-80"
            title="Retour au dashboard"
          >
            <img src={headerLogo} alt="Prosplay Logo" className="h-8 w-auto" />
          </button>
        </header>
      )}
      
      {/* Contenu principal plein écran */}
      <main className="w-full h-full">
        {children}
      </main>
    </div>
  );
};

export default EditorOnlyLayout;