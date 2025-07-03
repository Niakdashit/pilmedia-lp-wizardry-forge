import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';

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

  return (
    <div className="min-h-screen bg-gray-50 w-full">
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
          <img src={logo} alt="Leadya Logo" className="h-8 w-auto" />
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