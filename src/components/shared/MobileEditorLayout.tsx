import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface MobileEditorLayoutProps {
  children: React.ReactNode;
  toolbar?: React.ReactNode;
  sidebar?: React.ReactNode;
  isMobile: boolean;
  showFunnel?: boolean;
}

export const MobileEditorLayout: React.FC<MobileEditorLayoutProps> = ({
  children,
  toolbar,
  sidebar,
  isMobile,
  showFunnel = false
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mode preview - pas de sidebar ni toolbar
  if (showFunnel) {
    return <div className="w-full h-full">{children}</div>;
  }

  // Mode desktop - layout classique
  if (!isMobile) {
    return (
      <div className="flex flex-col h-full w-full">
        {toolbar && <div className="flex-shrink-0">{toolbar}</div>}
        <div className="flex-1 flex overflow-hidden">
          {sidebar && <div className="flex-shrink-0">{sidebar}</div>}
          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      </div>
    );
  }

  // Mode mobile - sidebar en overlay
  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Toolbar mobile optimisée */}
      {toolbar && (
        <div className="flex-shrink-0 bg-white border-b border-gray-200 relative z-20">
          {toolbar}
        </div>
      )}

      {/* Bouton hamburger pour ouvrir la sidebar */}
      {sidebar && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed bottom-4 right-4 z-50 w-14 h-14 bg-[#44444d] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#5a5a67] transition-colors"
          aria-label="Menu"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Sidebar en overlay sur mobile */}
      {sidebar && sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl z-40 overflow-y-auto">
            <div className="p-4">
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
              {sidebar}
            </div>
          </div>
        </>
      )}

      {/* Contenu principal */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};
